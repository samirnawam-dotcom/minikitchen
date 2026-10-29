'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { setupEnv, startServer, client } = require('./helpers');

const dataDir = setupEnv();
let app;

before(async () => {
  app = await startServer();
});
after(() => app.stop());

test('health check reveals no internals', async () => {
  const { status, data } = await client(app.base).request('GET', '/api/health');
  assert.equal(status, 200);
  assert.equal(data.status, 'healthy');
  assert.equal(data.database, undefined);
});

test('public state omits orders and database stats', async () => {
  const { status, data } = await client(app.base).request('GET', '/api/state');
  assert.equal(status, 200);
  assert.equal(data.orders, undefined);
  assert.equal(data.database, undefined);
  assert.equal(data.lbpRate, 89500);
});

test('login sets an HttpOnly cookie and never returns the token', async () => {
  const c = client(app.base);
  const res = await c.login();
  assert.equal(res.status, 200);
  assert.equal(res.data.token, undefined);
  const cookie = res.headers.get('set-cookie');
  assert.match(cookie, /mk_bo_session=/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Strict/);

  const me = await c.request('GET', '/api/auth/me');
  assert.equal(me.status, 200);
  assert.equal(me.data.user.username, 'admin');
});

test('wrong password is rejected', async () => {
  const res = await client(app.base).login('nope-nope-nope');
  assert.equal(res.status, 401);
});

test('Bearer tokens are not accepted', async () => {
  const res = await client(app.base).request('GET', '/api/orders', undefined, { Authorization: 'Bearer abc' });
  assert.equal(res.status, 401);
});

test('admin endpoints require a session', async () => {
  const c = client(app.base);
  for (const [method, url] of [
    ['GET', '/api/orders'],
    ['GET', '/api/db/export'],
    ['PUT', '/api/menu'],
    ['POST', '/api/upload'],
    ['PATCH', '/api/orders/MK-1005']
  ]) {
    const res = await c.request(method, url, method === 'GET' ? undefined : {});
    assert.equal(res.status, 401, `${method} ${url}`);
  }
});

test('cross-origin writes are blocked', async () => {
  const res = await client(app.base).request(
    'POST',
    '/api/orders',
    { customerName: 'X' },
    { Origin: 'https://evil.example' }
  );
  assert.equal(res.status, 403);
});

test('unknown routes 404 and wrong methods 405 with Allow', async () => {
  const c = client(app.base);
  assert.equal((await c.request('GET', '/api/nope')).status, 404);
  const res = await c.request('DELETE', '/api/orders');
  assert.equal(res.status, 405);
  assert.equal(res.headers.get('allow'), 'GET, POST');
});

test('public order is created as new and can be tracked', async () => {
  const c = client(app.base);
  const created = await c.request('POST', '/api/orders', {
    type: 'delivery_order',
    brand: 'delivery',
    status: 'completed',
    customerName: 'Test Customer',
    customerPhone: '+961 1 234 567',
    items: [{ id: 'x', title: 'Burger', qty: 2, priceValue: 9.5 }]
  });
  assert.equal(created.status, 201);
  const order = created.data.order;
  assert.match(order.id, /^MK-\d+$/);
  assert.equal(order.status, 'new', 'public clients cannot set status');
  assert.equal(order.totalUsd, 19);

  assert.match(order.trackKey, /^[\w-]{20}$/, 'the customer gets a private tracking key');

  const tracked = await c.request('GET', `/api/orders/track/${order.id.toLowerCase()}?phone=4567`);
  assert.equal(tracked.status, 200);
  assert.equal(tracked.data.order.customerFirstName, 'Test');
  assert.equal(tracked.data.order.customerPhone, undefined);

  const byKey = await c.request('GET', `/api/orders/track/${order.id}?key=${order.trackKey}`);
  assert.equal(byKey.status, 200);
});

test('order tracking needs proof and blocks guessing', async () => {
  const c = client(app.base);
  const { data } = await c.request('POST', '/api/orders', {
    customerName: 'Private Guest',
    customerPhone: '03 682 186',
    eventType: 'Wedding'
  });
  const id = data.order.id;

  // The reference alone, a wrong phone or a wrong key all look like an unknown order
  for (const query of ['', '?phone=0000', '?key=wrong-key-wrong-key-', '?phone=86']) {
    const res = await c.request('GET', `/api/orders/track/${id}${query}`);
    assert.equal(res.status, 404, `query "${query}"`);
    assert.equal(res.data.order, undefined);
  }
  const unknown = await c.request('GET', '/api/orders/track/MK-99999?phone=2186');
  assert.equal(unknown.status, 404);
  assert.equal(unknown.data.error, (await c.request('GET', `/api/orders/track/${id}`)).data.error);
});

test('admin can update and delete an order', async () => {
  const c = client(app.base);
  await c.login();
  const { data } = await c.request('POST', '/api/orders', { customerName: 'Admin Order' });
  const id = data.order.id;

  const patched = await c.request('PATCH', `/api/orders/${id}`, { status: 'confirmed', id: 'MK-1' });
  assert.equal(patched.status, 200);
  assert.equal(patched.data.order.status, 'confirmed');
  assert.equal(patched.data.order.id, id);

  assert.equal((await c.request('DELETE', `/api/orders/${id}`)).status, 200);
  assert.equal((await c.request('DELETE', `/api/orders/${id}`)).status, 404);
});

test('content saved by admin is sanitised', async () => {
  const c = client(app.base);
  await c.login();
  const res = await c.request('PUT', '/api/site-config', {
    siteConfig: { heroTitle: '<script>alert(1)</script>Hi', link: 'javascript:alert(1)' }
  });
  assert.equal(res.status, 200);
  assert.equal(res.data.siteConfig.heroTitle, 'scriptalert(1)/scriptHi');
  assert.equal(res.data.siteConfig.link, '');
});

test('image uploads land in DATA_DIR and are served from /uploads', async () => {
  const c = client(app.base);
  await c.login();
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  const res = await c.request('POST', '/api/upload', {
    filename: '../../evil.png',
    dataUrl: `data:image/png;base64,${png.toString('base64')}`
  });
  assert.equal(res.status, 201);
  assert.match(res.data.url, /^\/uploads\/\d+-evil-[0-9a-f]+\.png$/);
  assert.ok(fs.existsSync(path.join(dataDir, 'uploads', res.data.filename)));

  const served = await fetch(app.base + res.data.url);
  assert.equal(served.status, 200);
  assert.equal(served.headers.get('content-type'), 'image/png');

  const fake = await c.request('POST', '/api/upload', {
    dataUrl: `data:image/png;base64,${Buffer.from('not really a png file').toString('base64')}`
  });
  assert.equal(fake.status, 400);
});

test('iPhone HEIC uploads are converted to JPEG', async () => {
  const c = client(app.base);
  await c.login();
  // A 16×16 HEIC photo.
  const heic =
    'AAAAHGZ0eXBoZWljAAAAAG1pZjFoZWljbWlhZgAAAXxtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAA' +
    'ACJpbG9jAAAAAERAAAEAAQAAAAABoAABAAAAAAAAADIAAAAjaWluZgAAAAAAAQAAABVpbmZlAgAAAAABAABodmMxAAAAAA5waXRt' +
    'AAAAAAABAAAA/GlwcnAAAADcaXBjbwAAAHVodmNDAQNwAAAAkAAAAAAAHvAA/P34+AAADwNgAAEAGEABDAH//wNwAAADAJAAAAMA' +
    'AAMAHroCQGEAAQApQgEBA3AAAAMAkAAAAwAAAwAeoCCBBZbqrprm4CGgwIAAAAyAAAADAIRiAAEABkQBwXPBiQAAABNjb2xybmNs' +
    'eAABAA0ABoAAAAAUaXNwZQAAAAAAAABAAAAAQAAAAChjbGFwAAAAEAAAAAEAAAAQAAAAAf///9AAAAAC////0AAAAAIAAAAQcGl4' +
    'aQAAAAADCAgIAAAAGGlwbWEAAAAAAAAAAQABBYECAwWEAAAAOm1kYXQAAAAuKAGvEyFiY0D1JyL2ftdaf/ZiSf552WFncrrBW/L6' +
    'wPZkm8DzqpGegIdppzAVeA==';
  const res = await c.request('POST', '/api/upload', {
    filename: 'IMG_0001.HEIC',
    dataUrl: `data:image/heic;base64,${heic}`
  });
  assert.equal(res.status, 201);
  assert.match(res.data.url, /^\/uploads\/\d+-img_0001-[0-9a-f]+\.jpg$/);
  const served = await fetch(app.base + res.data.url);
  assert.equal(served.headers.get('content-type'), 'image/jpeg');
  assert.deepEqual([...new Uint8Array(await served.arrayBuffer()).subarray(0, 3)], [0xff, 0xd8, 0xff]);
});

test('password change enforces the minimum length', async () => {
  const c = client(app.base);
  await c.login();
  const res = await c.request('POST', '/api/auth/change-password', {
    currentPassword: 'test-password-123',
    newPassword: 'short'
  });
  assert.equal(res.status, 400);
  assert.match(res.data.error, /at least 10/);
});
