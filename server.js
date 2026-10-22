'use strict';

const config = require('./src/config');
const store = require('./src/db');
const { createServer } = require('./src/app');

async function start() {
  await store.init();
  const server = createServer();
  const stats = store.getDatabaseStats();

  await new Promise(resolve => server.listen(config.PORT, config.HOST, resolve));
  console.log(
    `[server] Mini Kitchen Website & Back Office running at http://localhost:${config.PORT} (${config.NODE_ENV})`
  );
  console.log(
    `[db] Connected to ${stats.engine} [${stats.journalMode}] at ${stats.filePath} (${stats.tables.orders} orders)`
  );

  function shutdown(signal) {
    console.log(`[server] Received ${signal}, shutting down gracefully...`);
    server.close(() => {
      store.close();
      process.exit(0);
    });
    setTimeout(() => {
      store.close();
      process.exit(0);
    }, 5000).unref();
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  return server;
}

// Phusion Passenger (used by Plesk and cPanel to run Node apps) loads this file itself and
// intercepts listen(), so start when run directly or under Passenger.
if (require.main === module || typeof PhusionPassenger !== 'undefined') {
  start().catch(err => {
    console.error('[server] Fatal startup error:', err.message);
    process.exit(1);
  });
}

module.exports = { start };
