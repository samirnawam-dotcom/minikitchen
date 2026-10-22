'use strict';

const http = require('http');
const config = require('./src/config');
const store = require('./src/db');
const security = require('./src/security');
const { handleApi } = require('./src/api');
const { serveStatic } = require('./src/static');

const server = http.createServer(async (req, res) => {
  const startMs = Date.now();
  try {
    security.applySecurityHeaders(req, res);

    if (config.FORCE_HTTPS && !security.isHttps(req)) {
      const host = String(req.headers.host || 'minikitchencatering.com').replace(/[^a-zA-Z0-9.:-]/g, '');
      res.writeHead(308, { Location: `https://${host}${req.url || '/'}` });
      return res.end();
    }

    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (parsedUrl.pathname.startsWith('/api/')) {
      await handleApi(req, res, parsedUrl);
    } else {
      serveStatic(req, res, parsedUrl);
    }
  } catch (err) {
    console.error('[server] Request error:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end('Internal Server Error');
  } finally {
    if (config.LOG_REQUESTS && req.url && req.url.startsWith('/api/')) {
      const ms = Date.now() - startMs;
      console.log(`[http] ${req.method} ${req.url} -> ${res.statusCode} (${ms}ms)`);
    }
  }
});

// Production socket & header timeouts (Slowloris & hung connection defence)
server.headersTimeout = 15000;
server.requestTimeout = 30000;
server.keepAliveTimeout = 5000;
server.maxHeadersCount = 100;

async function start() {
  await store.init();
  const stats = store.getDatabaseStats();
  server.listen(config.PORT, config.HOST, () => {
    console.log(
      `[server] Mini Kitchen Website & Back Office running at http://localhost:${config.PORT} (${config.NODE_ENV})`
    );
    console.log(
      `[db] Connected to ${stats.engine} [${stats.journalMode}] at ${stats.filePath} (${stats.tables.orders} orders)`
    );
  });
}

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

if (require.main === module) {
  start().catch(err => {
    console.error('[server] Fatal startup error:', err);
    process.exit(1);
  });
}

module.exports = { server, start };
