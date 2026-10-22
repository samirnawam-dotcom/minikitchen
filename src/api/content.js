'use strict';

const store = require('../db');
const security = require('../security');
const { LIMITS, HttpError, sendJson, readJsonBody } = require('./http');
const { getSession, requireAdmin } = require('./session');

const { cleanNumber, pickEnum, getClientIp } = security;

const DEFAULT_LBP_RATE = 89500;

function applyLbpRate(body) {
  if (body.lbpRate !== undefined) {
    store.setLbpRate(cleanNumber(body.lbpRate, { min: 1, max: 10000000 }) || DEFAULT_LBP_RATE);
  }
}

// Public storefront data; orders, audit logs and database stats are added only for admins.
function getState(req, res) {
  const session = getSession(req);
  const payload = {
    ok: true,
    lbpRate: store.getLbpRate(),
    nextOrderSeq: store.peekNextOrderSeq(),
    siteConfig: store.getSiteConfig(),
    menuCategories: store.getMenuCategories(),
    updatedAt: store.getUpdatedAt()
  };
  if (session) {
    payload.database = store.getDatabaseStats();
    payload.orders = store.listOrders();
    payload.auditLogs = store.listAuditLogs(30);
  }
  return sendJson(res, 200, payload);
}

async function putSiteConfig(req, res) {
  const session = requireAdmin(req);
  const body = await readJsonBody(req, LIMITS.admin);
  if (body.siteConfig !== undefined) {
    if (!body.siteConfig || typeof body.siteConfig !== 'object' || Array.isArray(body.siteConfig)) {
      throw new HttpError(400, 'siteConfig must be an object.');
    }
    store.setSiteConfig(security.sanitizeContentTree(body.siteConfig));
  }
  applyLbpRate(body);
  store.logAudit(session.username, 'site_config.updated', 'Updated site configuration & settings', getClientIp(req));
  return sendJson(res, 200, {
    ok: true,
    siteConfig: store.getSiteConfig(),
    lbpRate: store.getLbpRate()
  });
}

async function putMenu(req, res) {
  const session = requireAdmin(req);
  const body = await readJsonBody(req, LIMITS.admin);
  if (body.menuCategories !== undefined) {
    if (!Array.isArray(body.menuCategories) || body.menuCategories.length > 300) {
      throw new HttpError(400, 'menuCategories must be an array (max 300 categories).');
    }
    store.setMenuCategories(security.sanitizeContentTree(body.menuCategories));
  }
  applyLbpRate(body);
  store.logAudit(session.username, 'menu.updated', 'Updated FineDine menu categories/dishes', getClientIp(req));
  return sendJson(res, 200, { ok: true });
}

async function resetContent(req, res) {
  const session = requireAdmin(req);
  const body = await readJsonBody(req, LIMITS.auth);
  const target = pickEnum(body.target, ['menu', 'siteConfig', 'all'], null);
  if (!target) throw new HttpError(400, 'target must be one of: menu, siteConfig, all.');
  if (target === 'menu' || target === 'all') store.setMenuCategories(null);
  if (target === 'siteConfig' || target === 'all') store.setSiteConfig(null);
  if (target === 'all') store.setLbpRate(DEFAULT_LBP_RATE);
  store.logAudit(session.username, 'content.reset', `Reset target: ${target}`, getClientIp(req));
  return sendJson(res, 200, { ok: true });
}

module.exports = { getState, putSiteConfig, putMenu, resetContent };
