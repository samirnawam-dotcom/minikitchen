'use strict';

const http = require('http');
const config = require('./config');
const security = require('./security');
const { handleApi } = require('./api');
const { serveStatic } = require('./static');

async function handleRequest(req, res) {
  const startMs = Date.now();
  try {
    security.applySecurityHeaders(req, res);

    if (config.FORCE_HTTPS && !security.isHttps(req)) {
      const host = String(req.headers.host || new URL(config.SITE_URL).host).replace(/[^a-zA-Z0-9.:-]/g, '');
      res.writeHead(308, { Location: `https://${host}${req.url || '/'}` });
      return res.end();
    }

    const parsedUrl = new URL(req.url || '/', 'http://localhost');

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
      console.log(`[http] ${req.method} ${req.url} -> ${res.statusCode} (${Date.now() - startMs}ms)`);
    }
  }
}

function createServer() {
  const server = http.createServer(handleRequest);
  // Socket & header timeouts (Slowloris & hung connection defence)
  server.headersTimeout = 15000;
  server.requestTimeout = 30000;
  server.keepAliveTimeout = 5000;
  server.maxHeadersCount = 100;
  return server;
}

module.exports = { createServer, handleRequest };
