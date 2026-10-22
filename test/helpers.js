'use strict';

// Each test file runs in its own process (node --test), so env must be set before src/ is loaded.
const fs = require('fs');
const os = require('os');
const path = require('path');

const ADMIN_PASSWORD = 'test-password-123';

function setupEnv(extra = {}) {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'minikitchen-test-'));
  Object.assign(process.env, {
    NODE_ENV: 'test',
    DATA_DIR: dataDir,
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD,
    SEED_DEMO_ORDERS: 'false',
    LOG_REQUESTS: 'false',
    TRUST_PROXY: '0',
    ...extra
  });
  return dataDir;
}

async function startServer() {
  const store = require('../src/db');
  const { createServer } = require('../src/app');
  await store.init();
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  async function stop() {
    await new Promise(resolve => server.close(resolve));
    store.close();
  }
  return { base, stop };
}

/** Minimal cookie-aware client for the admin API. */
function client(base) {
  let cookie = '';
  async function request(method, url, body, headers = {}) {
    const res = await fetch(base + url, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
        ...headers
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) cookie = setCookie.split(';')[0];
    const type = res.headers.get('content-type') || '';
    const data = type.includes('json') ? await res.json() : await res.text();
    return { status: res.status, headers: res.headers, data };
  }
  return {
    request,
    login: (password = ADMIN_PASSWORD) => request('POST', '/api/auth/login', { username: 'admin', password })
  };
}

module.exports = { ADMIN_PASSWORD, setupEnv, startServer, client };
