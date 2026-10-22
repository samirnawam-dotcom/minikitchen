'use strict';

const crypto = require('crypto');
const { promisify } = require('util');
const config = require('./config');

const pbkdf2 = promisify(crypto.pbkdf2);

// ============================================================================
// PASSWORD HASHING (PBKDF2-SHA512, OWASP 2023 recommended iteration count)
// ============================================================================
const PBKDF2_ITERATIONS = 210000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = 'sha512';

async function hashPassword(password, salt = crypto.randomBytes(16).toString('hex'), iterations = PBKDF2_ITERATIONS) {
  const hash = (await pbkdf2(String(password), salt, iterations, PBKDF2_KEYLEN, PBKDF2_DIGEST)).toString('hex');
  return { salt, hash, iterations };
}

async function verifyPassword(password, salt, expectedHash, iterations = 10000) {
  if (!salt || !expectedHash) {
    // Burn comparable CPU time so missing users cannot be detected by timing.
    await pbkdf2(String(password), 'timing-safe-dummy-salt', PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST);
    return false;
  }
  const actual = await pbkdf2(String(password), salt, iterations, PBKDF2_KEYLEN, PBKDF2_DIGEST);
  const expected = Buffer.from(String(expectedHash), 'hex');
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

function generatePassword(length = 18) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#%*-_';
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

const MIN_PASSWORD_LENGTH = 10;

function validateNewPassword(password, username = '') {
  const pw = String(password || '');
  if (pw.length < MIN_PASSWORD_LENGTH) {
    return `New password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  }
  if (pw.length > 128) return 'New password must be 128 characters or fewer.';
  if (username && pw.toLowerCase() === String(username).toLowerCase()) {
    return 'New password must not be the same as the username.';
  }
  return null;
}

// ============================================================================
// SESSION TOKENS (random 256-bit token in an HttpOnly cookie; only SHA-256 stored)
// ============================================================================
const SESSION_COOKIE = 'mk_bo_session';

function createSessionToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

function parseCookies(req) {
  const header = req.headers.cookie;
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(val);
    } catch {
      out[key] = val;
    }
  }
  return out;
}

function serializeCookie(name, value, opts = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${opts.path || '/'}`);
  if (opts.maxAge !== undefined) parts.push(`Max-Age=${Math.floor(opts.maxAge)}`);
  if (opts.httpOnly !== false) parts.push('HttpOnly');
  parts.push(`SameSite=${opts.sameSite || 'Strict'}`);
  if (opts.secure) parts.push('Secure');
  return parts.join('; ');
}

// ============================================================================
// REQUEST CONTEXT HELPERS
// ============================================================================
/**
 * Returns the value a trusted proxy appended to a comma-separated X-Forwarded-* header.
 * Entries left of the trusted hops are client-controlled and must be ignored.
 */
function forwardedValue(header) {
  if (!config.TRUST_PROXY || !header) return '';
  const parts = String(header)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  return parts[Math.max(0, parts.length - config.TRUST_PROXY)] || '';
}

function getClientIp(req) {
  const fwd = forwardedValue(req.headers['x-forwarded-for']);
  if (fwd) return fwd;
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function isHttps(req) {
  if (req.socket && req.socket.encrypted) return true;
  return forwardedValue(req.headers['x-forwarded-proto']).toLowerCase() === 'https';
}

/**
 * CSRF defence for cookie-authenticated, state-changing requests:
 * if the browser sends Origin/Referer, it must match the Host we are serving.
 */
function isSameOrigin(req) {
  const host = forwardedValue(req.headers['x-forwarded-host']) || String(req.headers.host || '');
  const source = req.headers.origin || req.headers.referer;
  if (!source) return true; // Non-browser clients (curl, server-to-server) do not send Origin.
  try {
    return new URL(source).host === host;
  } catch {
    return false;
  }
}

// ============================================================================
// IN-MEMORY RATE LIMITER (fixed window, per key)
// ============================================================================
class RateLimiter {
  constructor({ windowMs, max }) {
    this.windowMs = windowMs;
    this.max = max;
    this.hits = new Map();
    const timer = setInterval(() => this.prune(), Math.min(windowMs, 60000));
    if (timer.unref) timer.unref();
  }

  prune() {
    const now = Date.now();
    for (const [key, entry] of this.hits) {
      if (entry.resetAt <= now) this.hits.delete(key);
    }
  }

  /** Records a hit and returns { allowed, remaining, retryAfterSec }. */
  hit(key) {
    const now = Date.now();
    let entry = this.hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + this.windowMs };
      this.hits.set(key, entry);
    }
    entry.count += 1;
    return {
      allowed: entry.count <= this.max,
      remaining: Math.max(0, this.max - entry.count),
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000)
    };
  }

  peek(key) {
    const entry = this.hits.get(key);
    if (!entry || entry.resetAt <= Date.now()) return { blocked: false, retryAfterSec: 0 };
    return { blocked: entry.count >= this.max, retryAfterSec: Math.ceil((entry.resetAt - Date.now()) / 1000) };
  }

  reset(key) {
    this.hits.delete(key);
  }
}

// ============================================================================
// SECURITY HEADERS (CSP, clickjacking, MIME sniffing, HSTS, permissions)
// ============================================================================
function buildCsp(https) {
  const directives = [
    "default-src 'self'",
    // No inline scripts or on* handlers: the frontends use ES modules with data-action wiring.
    "script-src 'self'",
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
    "font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self'",
    'frame-src https://www.google.com https://maps.google.com',
    "media-src 'self' https:",
    "manifest-src 'self'",
    "worker-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://wa.me https://api.whatsapp.com",
    "frame-ancestors 'self'"
  ];
  if (https) directives.push('upgrade-insecure-requests');
  return directives.join('; ');
}

function applySecurityHeaders(req, res) {
  const https = isHttps(req);
  res.setHeader('Content-Security-Policy', buildCsp(https));
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()'
  );
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Origin-Agent-Cluster', '?1');
  if (https) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
}

// ============================================================================
// INPUT SANITISATION
// ============================================================================
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function cleanString(value, maxLen = 500) {
  if (value === undefined || value === null) return '';
  return String(value).replace(CONTROL_CHARS, '').trim().slice(0, maxLen);
}

function cleanNumber(value, { min = 0, max = Number.MAX_SAFE_INTEGER, integer = false } = {}) {
  let n = Number(value);
  if (!Number.isFinite(n)) n = 0;
  if (integer) n = Math.round(n);
  return Math.min(max, Math.max(min, n));
}

function pickEnum(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

/**
 * Deep-sanitises Back Office managed content (site settings, menus) before it is
 * stored and later rendered on the public website: removes angle brackets that could
 * form HTML tags and neutralises script-capable URL schemes.
 */
function sanitizeContentTree(node, depth = 0) {
  if (depth > 12) return null;
  if (typeof node === 'string') {
    let s = node.replace(CONTROL_CHARS, '').replace(/[<>]/g, '');
    if (/^\s*(javascript|vbscript|data:text\/html)\s*:/i.test(s) || /^\s*data:text\/html/i.test(s)) s = '';
    return s.slice(0, 20000);
  }
  if (typeof node === 'number') return Number.isFinite(node) ? node : 0;
  if (typeof node === 'boolean' || node === null) return node;
  if (Array.isArray(node)) return node.slice(0, 2000).map(child => sanitizeContentTree(child, depth + 1));
  if (typeof node === 'object') {
    const out = {};
    for (const [key, val] of Object.entries(node)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      out[cleanString(key, 100)] = sanitizeContentTree(val, depth + 1);
    }
    return out;
  }
  return null;
}

module.exports = {
  PBKDF2_ITERATIONS,
  MIN_PASSWORD_LENGTH,
  hashPassword,
  verifyPassword,
  generatePassword,
  validateNewPassword,
  SESSION_COOKIE,
  createSessionToken,
  hashToken,
  parseCookies,
  serializeCookie,
  getClientIp,
  isHttps,
  isSameOrigin,
  RateLimiter,
  applySecurityHeaders,
  cleanString,
  cleanNumber,
  pickEnum,
  sanitizeContentTree
};
