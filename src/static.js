'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const config = require('./config');
const { renderPage, jsVersion, PAGES } = require('./pages');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf'
};

const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.mjs', '.json', '.webmanifest', '.xml', '.txt', '.svg']);
const NO_INDEX_FILES = new Set(['admin.html', '404.html', 'owner-guide.html', 'photo-guide.html']);
const PUBLIC_ROOT = path.resolve(config.PUBLIC_DIR);
const UPLOADS_ROOT = path.resolve(config.UPLOADS_DIR);
const UPLOAD_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

// /assets/<version>/js/... -> public/js/... (see jsVersion in pages.js)
const VERSIONED_JS_RE = /^\/assets\/([0-9a-f]{8})\/(js\/.+)$/;

// In-memory cache of file contents + pre-compressed variants, invalidated by mtime/size.
const cache = new Map();

function makeEntry(raw, mtimeMs, ext) {
  const entry = {
    mtimeMs,
    size: raw.length,
    raw,
    etag: `"${crypto.createHash('sha1').update(raw).digest('base64url').slice(0, 22)}"`,
    lastModified: new Date(mtimeMs).toUTCString(),
    br: null,
    gzip: null
  };
  if (COMPRESSIBLE.has(ext) && raw.length > 1024) {
    entry.br = zlib.brotliCompressSync(raw, {
      params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 10, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: raw.length }
    });
    entry.gzip = zlib.gzipSync(raw, { level: 9 });
  }
  return entry;
}

function loadFile(absPath, stats) {
  const cached = cache.get(absPath);
  if (cached && cached.mtimeMs === stats.mtimeMs && cached.size === stats.size) return cached;
  const entry = makeEntry(fs.readFileSync(absPath), stats.mtimeMs, path.extname(absPath).toLowerCase());
  cache.set(absPath, entry);
  return entry;
}

const pageEntries = new Map();

function loadPage(name) {
  const rendered = renderPage(name);
  if (!rendered) return null;
  const cached = pageEntries.get(name);
  if (cached && cached.version === rendered.version) return cached.entry;
  const entry = makeEntry(Buffer.from(rendered.html, 'utf8'), Date.now(), '.html');
  pageEntries.set(name, { version: rendered.version, entry });
  return entry;
}

/** Maps a URL path to a rendered page name ("/" -> index.html, "/about" -> about.html). */
function resolvePageName(pathname) {
  const rel = pathname.replace(/^\/+|\/+$/g, '');
  if (!rel) return 'index.html';
  const name = rel.endsWith('.html') ? rel : `${rel}.html`;
  return Object.prototype.hasOwnProperty.call(PAGES, name) ? name : null;
}

/** Resolves /uploads/<file> to an image inside DATA_DIR/uploads. */
function resolveUpload(pathname) {
  const name = pathname.slice('/uploads/'.length);
  if (!/^[\w.-]{1,120}$/.test(name) || name.startsWith('.')) return { error: 404 };
  if (!UPLOAD_EXTS.has(path.extname(name).toLowerCase())) return { error: 404 };
  const abs = path.join(UPLOADS_ROOT, name);
  try {
    const stats = fs.statSync(abs);
    if (stats.isFile()) return { abs, stats };
  } catch {
    /* fall through */
  }
  return { error: 404 };
}

/** Resolves a URL path to a file inside /public, refusing traversal and hidden files. */
function resolvePublicPath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return { error: 400 };
  }
  if (decoded.includes('\0') || decoded.includes('\\')) return { error: 400 };

  const segments = decoded.split('/').filter(Boolean);
  if (segments.some(seg => seg === '..' || (seg.startsWith('.') && seg !== '.well-known'))) {
    return { error: 404 };
  }

  const candidates = [];
  const rel = segments.join('/');
  if (!rel) {
    candidates.push('index.html');
  } else if (path.extname(rel)) {
    candidates.push(rel);
  } else {
    // Clean URLs: /restaurant -> restaurant.html, /admin -> admin.html
    candidates.push(`${rel}.html`, `${rel}/index.html`);
  }

  for (const candidate of candidates) {
    const abs = path.resolve(PUBLIC_ROOT, candidate);
    if (abs !== PUBLIC_ROOT && !abs.startsWith(PUBLIC_ROOT + path.sep)) return { error: 404 };
    try {
      const stats = fs.statSync(abs);
      if (stats.isFile()) return { abs, stats };
    } catch {
      /* try next candidate */
    }
  }
  return { error: 404 };
}

function pickEncoding(req, entry) {
  const accept = String(req.headers['accept-encoding'] || '');
  if (entry.br && /\bbr\b/.test(accept)) return 'br';
  if (entry.gzip && /\bgzip\b/.test(accept)) return 'gzip';
  return null;
}

function cacheControlFor(abs, parsedUrl) {
  const ext = path.extname(abs).toLowerCase();
  const base = path.basename(abs);
  if (base === 'admin.html') return 'no-store';
  if (ext === '.html') return 'no-cache';
  // Assets referenced with a content hash (?v=... or /assets/<version>/) can be cached forever.
  if (parsedUrl.searchParams.has('v')) return 'public, max-age=31536000, immutable';
  const versioned = VERSIONED_JS_RE.exec(parsedUrl.pathname);
  if (versioned && versioned[1] === jsVersion()) return 'public, max-age=31536000, immutable';
  if (['.css', '.js', '.mjs', '.json', '.webmanifest', '.xml', '.txt'].includes(ext)) return 'no-cache';
  return 'public, max-age=604800';
}

function send(req, res, abs, stats, parsedUrl, statusCode = 200) {
  return sendEntry(req, res, loadFile(abs, stats), abs, parsedUrl, statusCode);
}

function sendEntry(req, res, entry, abs, parsedUrl, statusCode = 200) {
  const ext = path.extname(abs).toLowerCase();
  const encoding = pickEncoding(req, entry);
  const body = encoding === 'br' ? entry.br : encoding === 'gzip' ? entry.gzip : entry.raw;

  res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
  res.setHeader('Cache-Control', statusCode === 200 ? cacheControlFor(abs, parsedUrl) : 'no-store');
  if (entry.br || entry.gzip) res.setHeader('Vary', 'Accept-Encoding');
  if (NO_INDEX_FILES.has(path.basename(abs))) res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  if (statusCode === 200) {
    res.setHeader('ETag', entry.etag);
    res.setHeader('Last-Modified', entry.lastModified);
    const inm = req.headers['if-none-match'];
    if (
      inm &&
      inm
        .split(',')
        .map(s => s.trim().replace(/^W\//, ''))
        .includes(entry.etag)
    ) {
      res.statusCode = 304;
      return res.end();
    }
  }

  if (encoding) res.setHeader('Content-Encoding', encoding);
  res.setHeader('Content-Length', body.length);
  res.statusCode = statusCode;
  if (req.method === 'HEAD') return res.end();
  return res.end(body);
}

function sendNotFound(req, res, parsedUrl) {
  const notFound = path.join(PUBLIC_ROOT, '404.html');
  try {
    const stats = fs.statSync(notFound);
    return send(req, res, notFound, stats, parsedUrl, 404);
  } catch {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('404 Not Found');
  }
}

function serveStatic(req, res, parsedUrl) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('Method Not Allowed');
  }

  let pathname;
  try {
    pathname = decodeURIComponent(parsedUrl.pathname);
  } catch {
    pathname = null;
  }
  const pageName = pathname && resolvePageName(pathname);
  if (pageName) return sendEntry(req, res, loadPage(pageName), pageName, parsedUrl);

  const versioned = VERSIONED_JS_RE.exec(parsedUrl.pathname);
  const resolved = versioned
    ? resolvePublicPath(`/${versioned[2]}`)
    : pathname && pathname.startsWith('/uploads/')
      ? resolveUpload(pathname)
      : resolvePublicPath(parsedUrl.pathname);
  if (resolved.error === 400) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('Bad Request');
  }
  if (resolved.error) return sendNotFound(req, res, parsedUrl);
  return send(req, res, resolved.abs, resolved.stats, parsedUrl);
}

module.exports = { serveStatic, resolvePublicPath, resolvePageName };
