'use strict';

const { RateLimiter, getClientIp, isSameOrigin } = require('../security');
const { HttpError, sendJson } = require('./http');
const auth = require('./auth');
const orders = require('./orders');
const content = require('./content');
const database = require('./database');
const uploads = require('./uploads');

const apiLimiter = new RateLimiter({ windowMs: 60 * 1000, max: 360 });
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function health(req, res) {
  return sendJson(res, 200, { ok: true, status: 'healthy', uptimeSec: Math.round(process.uptime()) });
}

/**
 * Route table: `path` is an exact pathname or a RegExp whose named groups become params.
 * HEAD is answered by any GET handler.
 */
const ROUTES = [
  { path: '/api/health', GET: health },
  { path: '/api/auth/login', POST: auth.login },
  { path: '/api/auth/logout', POST: auth.logout },
  { path: '/api/auth/me', GET: auth.me },
  { path: '/api/auth/change-password', POST: auth.changePassword },
  { path: '/api/state', GET: content.getState },
  { path: '/api/site-config', PUT: content.putSiteConfig },
  { path: '/api/menu', PUT: content.putMenu },
  { path: '/api/reset', POST: content.resetContent },
  { path: '/api/db/status', GET: database.getStatus },
  { path: '/api/db/export', GET: database.exportSnapshot },
  { path: '/api/db/import', POST: database.importSnapshot },
  { path: '/api/upload', POST: uploads.uploadImage },
  { path: '/api/orders', GET: orders.listOrders, POST: orders.createOrder },
  { path: /^\/api\/orders\/track\/(?<id>[A-Za-z0-9#%-]{1,30})$/, GET: orders.trackOrder },
  { path: /^\/api\/orders\/(?<id>MK-[A-Za-z0-9-]{1,20})$/, PATCH: orders.patchOrder, DELETE: orders.deleteOrder }
];

function matchRoute(pathname) {
  for (const route of ROUTES) {
    if (typeof route.path === 'string') {
      if (route.path === pathname) return { route, params: {} };
      continue;
    }
    const m = pathname.match(route.path);
    if (m) {
      const params = {};
      for (const [k, v] of Object.entries(m.groups || {})) params[k] = decodeURIComponent(v);
      return { route, params };
    }
  }
  return null;
}

async function handleApi(req, res, parsedUrl) {
  try {
    const ipState = apiLimiter.hit(getClientIp(req));
    if (!ipState.allowed) {
      throw new HttpError(429, 'Too many requests. Please slow down.', { retryAfter: ipState.retryAfterSec });
    }
    if (MUTATING.has(req.method) && !isSameOrigin(req)) {
      throw new HttpError(403, 'Cross-origin request blocked.');
    }

    const matched = matchRoute(parsedUrl.pathname);
    if (!matched) throw new HttpError(404, 'Unknown API endpoint.');

    const { route, params } = matched;
    const handler = route[req.method === 'HEAD' ? 'GET' : req.method];
    if (!handler) {
      const allowed = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].filter(m => route[m]);
      throw new HttpError(405, 'Method not allowed.', { allow: allowed.join(', ') });
    }
    return await handler(req, res, params);
  } catch (err) {
    if (err instanceof HttpError) {
      const headers = {};
      if (err.extra.retryAfter) headers['Retry-After'] = String(err.extra.retryAfter);
      if (err.extra.allow) headers.Allow = err.extra.allow;
      return sendJson(res, err.status, { ok: false, error: err.message }, headers);
    }
    if (err instanceof URIError) return sendJson(res, 400, { ok: false, error: 'Malformed URL.' });
    console.error('[api] Unhandled error:', err);
    return sendJson(res, 500, { ok: false, error: 'Internal server error.' });
  }
}

module.exports = { handleApi, ROUTES };
