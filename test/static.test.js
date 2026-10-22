'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { setupEnv, startServer } = require('./helpers');

setupEnv();
let app;

before(async () => {
  app = await startServer();
});
after(() => app.stop());

const get = (url, headers) => fetch(app.base + url, { headers });

test('each storefront page gets its own SEO metadata', async () => {
  const cases = {
    '/': ['catering', 'https://minikitchencatering.com/'],
    '/delivery': ['delivery', 'https://minikitchencatering.com/delivery.html'],
    '/restaurant.html': ['restaurant', 'https://minikitchencatering.com/restaurant.html'],
    '/about': ['catering', 'https://minikitchencatering.com/about.html']
  };
  for (const [url, [brand, canonical]] of Object.entries(cases)) {
    const res = await get(url);
    assert.equal(res.status, 200, url);
    const html = await res.text();
    assert.ok(html.includes(`data-brand="${brand}"`), url);
    assert.ok(html.includes(`rel="canonical" href="${canonical}"`), url);
    assert.ok(html.includes(`property="og:url" id="ogUrl" content="${canonical}"`), url);
    assert.ok(!html.includes('{{'), `${url} has unrendered placeholders`);
  }
});

test('assets are fingerprinted and cached immutably', async () => {
  const html = await (await get('/')).text();
  const m = html.match(/href="(css\/storefront\/tokens\.css\?v=[0-9a-f]{8})"/);
  assert.ok(m, 'stylesheet is fingerprinted');
  const res = await get(`/${m[1]}`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('cache-control'), /immutable/);
});

test('admin page is never cached or indexed', async () => {
  const res = await get('/admin');
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.match(res.headers.get('x-robots-tag'), /noindex/);
});

test('server code, templates and data are not reachable', async () => {
  for (const url of [
    '/server.js',
    '/src/db.js',
    '/views/admin.html',
    '/data/minikitchen.sqlite',
    '/../package.json',
    '/%2e%2e/package.json',
    '/.env',
    '/uploads/../minikitchen.sqlite'
  ]) {
    const res = await get(url);
    assert.ok([400, 404].includes(res.status), `${url} -> ${res.status}`);
  }
});

test('responses carry security headers and compression', async () => {
  const res = await get('/', { 'Accept-Encoding': 'br' });
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.match(res.headers.get('content-security-policy'), /object-src 'none'/);
  const csp = res.headers.get('content-security-policy');
  assert.match(csp, /script-src 'self';/);
  assert.match(csp, /script-src-attr 'none'/);
  assert.doesNotMatch(csp, /script-src[^;]*unsafe-inline/);
  assert.equal(res.headers.get('content-encoding'), 'br');
});

test('ETag revalidation returns 304', async () => {
  const first = await get('/css/storefront/tokens.css');
  const etag = first.headers.get('etag');
  const second = await get('/css/storefront/tokens.css', { 'If-None-Match': etag });
  assert.equal(second.status, 304);
});

test('pages contain no inline scripts or event handlers', async () => {
  for (const url of ['/', '/delivery', '/admin', '/missing-page']) {
    const html = await (await get(url)).text();
    assert.doesNotMatch(html, /\son[a-z]+\s*=\s*["']/i, `${url} has an inline on* handler`);
    const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>/g)].filter(
      m => !/type="application\/ld\+json"/.test(m[1])
    );
    assert.equal(inline.length, 0, `${url} has an inline <script>`);
  }
});
