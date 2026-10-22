'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { setupEnv } = require('./helpers');

setupEnv({ NODE_ENV: 'production', ADMIN_PASSWORD: '' });

test('production refuses to create an admin without ADMIN_PASSWORD', async () => {
  const store = require('../src/db');
  await assert.rejects(store.init(), /ADMIN_PASSWORD must be set/);
  store.close();
});
