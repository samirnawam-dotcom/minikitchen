'use strict';

const store = require('../db');
const { getClientIp } = require('../security');
const { LIMITS, HttpError, sendJson, readJsonBody } = require('./http');
const { requireAdmin } = require('./session');

function getStatus(req, res) {
  requireAdmin(req);
  return sendJson(res, 200, {
    ok: true,
    database: store.getDatabaseStats(),
    auditLogs: store.listAuditLogs(50)
  });
}

function exportSnapshot(req, res) {
  const session = requireAdmin(req);
  store.logAudit(session.username, 'db.exported', 'Exported full SQLite database snapshot', getClientIp(req));
  const snapshot = store.exportFullSnapshot();
  const stamp = new Date().toISOString().slice(0, 10);
  return sendJson(res, 200, snapshot, {
    'Content-Disposition': `attachment; filename="minikitchen-db-backup-${stamp}.json"`
  });
}

async function importSnapshot(req, res) {
  const session = requireAdmin(req);
  const body = await readJsonBody(req, LIMITS.admin);
  const snapshot = body.snapshot && typeof body.snapshot === 'object' ? body.snapshot : body;
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    throw new HttpError(400, 'Invalid database backup file.');
  }
  const hasAnyKey = ['orders', 'siteConfig', 'menuCategories', 'lbpRate'].some(k => snapshot[k] !== undefined);
  if (!hasAnyKey) {
    throw new HttpError(400, 'Backup file does not contain recognizable Mini Kitchen database tables.');
  }

  const result = store.importFullSnapshot(snapshot);
  store.logAudit(
    session.username,
    'db.imported',
    `Restored SQLite database backup (${result.ordersImported} orders imported)`,
    getClientIp(req)
  );
  return sendJson(res, 200, { ok: true, ...result });
}

module.exports = { getStatus, exportSnapshot, importSnapshot };
