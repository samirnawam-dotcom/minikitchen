'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

process.env.TRUST_PROXY = '1';
const security = require('../src/security');

const req = headers => ({ headers, socket: { remoteAddress: '10.0.0.1' } });

test('client IP comes from the hop the trusted proxy appended, not a spoofed one', () => {
  assert.equal(security.getClientIp(req({ 'x-forwarded-for': '6.6.6.6, 203.0.113.9' })), '203.0.113.9');
  assert.equal(security.getClientIp(req({})), '10.0.0.1');
});

test('HTTPS detection uses the proxy-appended protocol', () => {
  assert.equal(security.isHttps(req({ 'x-forwarded-proto': 'https' })), true);
  assert.equal(security.isHttps(req({ 'x-forwarded-proto': 'https, http' })), false);
});

test('password hashing round-trips and rejects wrong passwords', async () => {
  const { salt, hash, iterations } = await security.hashPassword('correct horse');
  assert.equal(await security.verifyPassword('correct horse', salt, hash, iterations), true);
  assert.equal(await security.verifyPassword('wrong horse', salt, hash, iterations), false);
});

test('new password rules', () => {
  assert.match(security.validateNewPassword('short'), /at least/);
  assert.match(security.validateNewPassword('administrator', 'Administrator'), /username/);
  assert.equal(security.validateNewPassword('a-good-long-password'), null);
});

test('content sanitiser strips tags, script URLs and prototype keys', () => {
  const out = security.sanitizeContentTree(
    JSON.parse('{"a":"<b>x</b>","u":" javascript:alert(1)","__proto__":{"p":1}}')
  );
  assert.equal(out.a, 'bx/b');
  assert.equal(out.u, '');
  assert.equal({}.p, undefined);
  assert.equal(Object.keys(out).includes('__proto__'), false);
});

test('rate limiter blocks after max hits', () => {
  const limiter = new security.RateLimiter({ windowMs: 60000, max: 2 });
  assert.equal(limiter.hit('k').allowed, true);
  assert.equal(limiter.hit('k').allowed, true);
  assert.equal(limiter.hit('k').allowed, false);
});
