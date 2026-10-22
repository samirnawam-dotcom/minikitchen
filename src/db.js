'use strict';

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const config = require('./config');
const security = require('./security');
const { getDemoOrders } = require('./demo-data');

const SQLITE_FILE = path.join(config.DATA_DIR, 'minikitchen.sqlite');
const LEGACY_JSON_FILE = path.join(config.DATA_DIR, 'backoffice-db.json');
const BACKUP_DIR = path.join(config.DATA_DIR, 'backups');

let sqlite = null;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  }
}

function safeJsonParse(str, fallback = null) {
  if (str === undefined || str === null || str === '') return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function getSetting(key, fallback = null) {
  const row = sqlite.prepare('SELECT value FROM settings WHERE key = ?').get(String(key));
  if (!row) return fallback;
  return safeJsonParse(row.value, fallback);
}

function setSetting(key, value) {
  const now = new Date().toISOString();
  sqlite
    .prepare(
      `INSERT INTO settings (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    )
    .run(String(key), JSON.stringify(value), now);
  setTimestamp(now);
}

function setTimestamp(iso = new Date().toISOString()) {
  sqlite
    .prepare(
      `INSERT INTO settings (key, value, updated_at)
       VALUES ('updatedAt', ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    )
    .run(JSON.stringify(iso), iso);
}

function getUpdatedAt() {
  return getSetting('updatedAt', new Date().toISOString());
}

function getLbpRate() {
  const rate = Number(getSetting('lbpRate', 89500));
  return Number.isFinite(rate) && rate > 0 ? rate : 89500;
}

function setLbpRate(rate) {
  const clean = Number.isFinite(Number(rate)) && Number(rate) > 0 ? Math.round(Number(rate)) : 89500;
  setSetting('lbpRate', clean);
  return clean;
}

function getSiteConfig() {
  return getSetting('siteConfig', null);
}

function setSiteConfig(cfg) {
  setSetting('siteConfig', cfg === undefined ? null : cfg);
  return cfg;
}

function getMenuCategories() {
  return getSetting('menuCategories', null);
}

function setMenuCategories(cats) {
  setSetting('menuCategories', cats === undefined ? null : cats);
  return cats;
}

function peekNextOrderSeq() {
  let current = Number(getSetting('orderSeq', 1005)) || 1005;
  while (getOrderById(`MK-${current}`)) {
    current += 1;
  }
  return current;
}

function nextOrderSeq(requestedId) {
  const current = peekNextOrderSeq();
  if (typeof requestedId === 'string') {
    const m = requestedId.trim().match(/^MK-(\d{4,8})$/);
    if (m && !getOrderById(requestedId.trim())) {
      const reqNum = parseInt(m[1], 10);
      if (reqNum >= current && reqNum <= current + 100) {
        setSetting('orderSeq', reqNum + 1);
        return reqNum;
      }
    }
  }
  setSetting('orderSeq', current + 1);
  return current;
}

function rowToOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
    type: row.type,
    brand: row.brand,
    status: row.status,
    customerName: row.customer_name,
    customerPhone: row.customer_phone || '',
    address: row.address || '',
    eventType: row.event_type || '',
    eventDate: row.event_date || '',
    guests: Number(row.guests) || 0,
    packageSelected: row.package_selected || '',
    notes: row.notes || '',
    items: safeJsonParse(row.items_json, []),
    totalUsd: Number(row.total_usd) || 0,
    lbpRate: Number(row.lbp_rate) || 89500,
    staffNotes: row.staff_notes || '',
    whatsappText: row.whatsapp_text || '',
    source: row.source || 'website'
  };
}

function listOrders() {
  const rows = sqlite
    .prepare('SELECT * FROM orders ORDER BY datetime(created_at) DESC, rowid DESC LIMIT ?')
    .all(config.MAX_STORED_ORDERS);
  return rows.map(rowToOrder);
}

function getOrderById(id) {
  const row = sqlite.prepare('SELECT * FROM orders WHERE id = ?').get(String(id));
  return rowToOrder(row);
}

function insertOrder(order) {
  const now = order.createdAt || new Date().toISOString();
  sqlite
    .prepare(
      `INSERT OR REPLACE INTO orders (
        id, created_at, updated_at, type, brand, status,
        customer_name, customer_phone, address, event_type, event_date,
        guests, package_selected, notes, items_json, total_usd,
        lbp_rate, staff_notes, whatsapp_text, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      String(order.id),
      now,
      order.updatedAt || now,
      String(order.type || 'delivery_order'),
      String(order.brand || 'delivery'),
      String(order.status || 'new'),
      String(order.customerName || 'WhatsApp Customer'),
      String(order.customerPhone || ''),
      String(order.address || ''),
      String(order.eventType || ''),
      String(order.eventDate || ''),
      Number(order.guests) || 0,
      String(order.packageSelected || ''),
      String(order.notes || ''),
      JSON.stringify(Array.isArray(order.items) ? order.items : []),
      Number(order.totalUsd) || 0,
      Number(order.lbpRate) || getLbpRate(),
      String(order.staffNotes || ''),
      String(order.whatsappText || ''),
      String(order.source || 'website')
    );

  // Enforce max stored orders cap
  sqlite
    .prepare(
      `DELETE FROM orders WHERE id NOT IN (
        SELECT id FROM orders ORDER BY datetime(created_at) DESC, rowid DESC LIMIT ?
      )`
    )
    .run(config.MAX_STORED_ORDERS);

  setTimestamp();
  return getOrderById(order.id);
}

function updateOrder(id, patch) {
  const existing = getOrderById(id);
  if (!existing) return null;
  const merged = {
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString()
  };
  return insertOrder(merged);
}

function deleteOrder(id) {
  const res = sqlite.prepare('DELETE FROM orders WHERE id = ?').run(String(id));
  if (res.changes > 0) setTimestamp();
  return res.changes > 0;
}

function getAdminAuth() {
  const row = sqlite.prepare('SELECT * FROM admin_users ORDER BY rowid ASC LIMIT 1').get();
  if (!row) return null;
  return {
    username: row.username,
    displayName: row.display_name,
    role: row.role,
    salt: row.salt,
    passwordHash: row.password_hash,
    iterations: Number(row.iterations) || 10000,
    mustChangePassword: Boolean(row.must_change_password),
    passwordChangedAt: row.password_changed_at || null,
    lastLoginAt: row.last_login_at || null
  };
}

/** Runs fn atomically; uses a SAVEPOINT so it also nests inside an outer transaction. */
function transaction(fn) {
  sqlite.exec('SAVEPOINT tx');
  try {
    const result = fn();
    sqlite.exec('RELEASE tx');
    return result;
  } catch (err) {
    sqlite.exec('ROLLBACK TO tx; RELEASE tx');
    throw err;
  }
}

function saveAdminAuth(auth) {
  transaction(() => writeAdminAuth(auth));
}

function writeAdminAuth(auth) {
  const now = new Date().toISOString();
  sqlite.exec('DELETE FROM admin_users');
  sqlite
    .prepare(
      `INSERT INTO admin_users (
        username, display_name, role, salt, password_hash,
        iterations, must_change_password, password_changed_at, last_login_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      String(auth.username || 'admin'),
      String(auth.displayName || 'Mini Kitchen Executive Admin'),
      String(auth.role || 'Owner & Hospitality Director'),
      String(auth.salt),
      String(auth.passwordHash),
      Number(auth.iterations) || security.PBKDF2_ITERATIONS,
      auth.mustChangePassword ? 1 : 0,
      auth.passwordChangedAt || null,
      auth.lastLoginAt || null,
      now
    );
  setTimestamp(now);
}

function getSession(tokenHash) {
  if (!tokenHash) return null;
  const row = sqlite.prepare('SELECT * FROM admin_sessions WHERE token_hash = ?').get(String(tokenHash));
  if (!row) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    sqlite.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(String(tokenHash));
    return null;
  }
  return {
    key: row.token_hash,
    username: row.username,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    remember: Boolean(row.remember),
    ip: row.ip || '',
    userAgent: row.user_agent || ''
  };
}

function createSession(tokenHash, sessionData, maxSessions = 10) {
  sqlite
    .prepare(
      `INSERT OR REPLACE INTO admin_sessions (
        token_hash, username, created_at, expires_at, remember, ip, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      String(tokenHash),
      String(sessionData.username || 'admin'),
      sessionData.createdAt || new Date().toISOString(),
      sessionData.expiresAt,
      sessionData.remember ? 1 : 0,
      String(sessionData.ip || ''),
      String(sessionData.userAgent || '')
    );

  // Prune expired and cap concurrent sessions
  pruneSessions();
  sqlite
    .prepare(
      `DELETE FROM admin_sessions WHERE token_hash NOT IN (
        SELECT token_hash FROM admin_sessions ORDER BY datetime(created_at) DESC LIMIT ?
      )`
    )
    .run(maxSessions);
}

function deleteSession(tokenHash) {
  sqlite.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(String(tokenHash));
}

function deleteOtherSessions(keepTokenHash) {
  sqlite.prepare('DELETE FROM admin_sessions WHERE token_hash != ?').run(String(keepTokenHash || ''));
}

function pruneSessions() {
  const nowIso = new Date().toISOString();
  const res = sqlite.prepare('DELETE FROM admin_sessions WHERE datetime(expires_at) <= datetime(?)').run(nowIso);
  return res.changes > 0;
}

function logAudit(actor, action, details = '', ip = '') {
  try {
    sqlite
      .prepare(
        `INSERT INTO audit_logs (created_at, actor, action, details, ip)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        new Date().toISOString(),
        String(actor || 'system').slice(0, 80),
        String(action || 'event').slice(0, 120),
        typeof details === 'string' ? details.slice(0, 1000) : JSON.stringify(details).slice(0, 1000),
        String(ip || '').slice(0, 64)
      );
    // Keep most recent 1000 audit entries
    sqlite.exec(
      `DELETE FROM audit_logs WHERE id NOT IN (
        SELECT id FROM audit_logs ORDER BY id DESC LIMIT 1000
      )`
    );
  } catch {
    /* non-fatal */
  }
}

function listAuditLogs(limit = 40) {
  const cleanLimit = Math.min(200, Math.max(1, Number(limit) || 40));
  return sqlite
    .prepare('SELECT id, created_at AS createdAt, actor, action, details, ip FROM audit_logs ORDER BY id DESC LIMIT ?')
    .all(cleanLimit);
}

function displayPath(file) {
  const rel = path.relative(config.ROOT, file);
  return rel && !rel.startsWith('..') && !path.isAbsolute(rel) ? rel : file;
}

function getDatabaseStats() {
  let fileSizeBytes = 0;
  try {
    if (fs.existsSync(SQLITE_FILE)) {
      fileSizeBytes = fs.statSync(SQLITE_FILE).size;
    }
  } catch {
    /* ignore */
  }
  const ordersCount = sqlite.prepare('SELECT COUNT(*) AS c FROM orders').get().c;
  const newOrdersCount = sqlite.prepare("SELECT COUNT(*) AS c FROM orders WHERE status = 'new'").get().c;
  const sessionsCount = sqlite.prepare('SELECT COUNT(*) AS c FROM admin_sessions').get().c;
  const auditCount = sqlite.prepare('SELECT COUNT(*) AS c FROM audit_logs').get().c;
  const sqliteVersion = sqlite.prepare('SELECT sqlite_version() AS v').get().v;
  const journalMode = sqlite.prepare('PRAGMA journal_mode').get().journal_mode;

  return {
    engine: `SQLite ${sqliteVersion} (Node.js native node:sqlite)`,
    journalMode: String(journalMode || 'wal').toUpperCase(),
    filePath: displayPath(SQLITE_FILE),
    fileSizeKb: Math.round((fileSizeBytes / 1024) * 10) / 10,
    tables: {
      orders: ordersCount,
      newOrders: newOrdersCount,
      activeSessions: sessionsCount,
      auditLogs: auditCount
    },
    updatedAt: getUpdatedAt()
  };
}

function exportFullSnapshot() {
  return {
    exportedAt: new Date().toISOString(),
    database: getDatabaseStats(),
    lbpRate: getLbpRate(),
    siteConfig: getSiteConfig(),
    menuCategories: getMenuCategories(),
    orders: listOrders(),
    auditLogs: listAuditLogs(100)
  };
}

function importFullSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    throw new Error('Invalid snapshot payload.');
  }

  // Create a safety backup before importing
  try {
    ensureDir(BACKUP_DIR);
    sqlite.exec('PRAGMA wal_checkpoint(PASSIVE);');
    const safeStamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.copyFileSync(SQLITE_FILE, path.join(BACKUP_DIR, `minikitchen-pre-restore-${safeStamp}.sqlite`));
  } catch (err) {
    console.warn('[db] Pre-restore backup warning:', err.message);
  }

  let ordersImported = 0;
  sqlite.exec('BEGIN IMMEDIATE');
  try {
    if (snapshot.lbpRate !== undefined) {
      setLbpRate(Number(snapshot.lbpRate) || 89500);
    }
    if (snapshot.siteConfig !== undefined) {
      setSiteConfig(
        snapshot.siteConfig && typeof snapshot.siteConfig === 'object'
          ? security.sanitizeContentTree(snapshot.siteConfig)
          : null
      );
    }
    if (snapshot.menuCategories !== undefined) {
      setMenuCategories(
        Array.isArray(snapshot.menuCategories) ? security.sanitizeContentTree(snapshot.menuCategories) : null
      );
    }
    if (Array.isArray(snapshot.orders)) {
      if (snapshot.replaceOrders === true) {
        sqlite.exec('DELETE FROM orders');
      }
      let maxSeq = Number(getSetting('orderSeq', 1005)) || 1005;
      for (const rawOrder of snapshot.orders.slice(0, config.MAX_STORED_ORDERS)) {
        if (!rawOrder || typeof rawOrder !== 'object') continue;
        const idStr = String(rawOrder.id || '').trim();
        const seqMatch = idStr.match(/^MK-(\d+)$/);
        if (seqMatch) {
          const num = parseInt(seqMatch[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
        insertOrder({
          ...rawOrder,
          id: idStr || `MK-${++maxSeq}`
        });
        ordersImported++;
      }
      setSetting('orderSeq', maxSeq);
    }
    setTimestamp();
    sqlite.exec('COMMIT');
  } catch (err) {
    sqlite.exec('ROLLBACK');
    throw err;
  }

  return {
    ordersImported,
    lbpRate: getLbpRate(),
    database: getDatabaseStats()
  };
}

async function createDefaultAdmin() {
  let password = config.ADMIN_PASSWORD;
  if (!password) {
    if (config.isProd) {
      throw new Error('ADMIN_PASSWORD must be set to create the first Back Office administrator in production.');
    }
    password = security.generatePassword();
    console.warn(`[db] Generated development admin password for '${config.ADMIN_USERNAME}': ${password}`);
  } else if (security.validateNewPassword(password)) {
    console.warn(`[db] ADMIN_PASSWORD is weak: ${security.validateNewPassword(password)}`);
  }
  const { salt, hash, iterations } = await security.hashPassword(password);
  const username = /^[a-zA-Z0-9._-]{3,40}$/.test(config.ADMIN_USERNAME) ? config.ADMIN_USERNAME : 'admin';
  return {
    username,
    displayName: 'Mini Kitchen Executive Admin',
    role: 'Owner & Hospitality Director',
    salt,
    passwordHash: hash,
    iterations,
    mustChangePassword: !config.ADMIN_PASSWORD,
    passwordChangedAt: null,
    lastLoginAt: null
  };
}

function dailyBackup() {
  try {
    if (!fs.existsSync(SQLITE_FILE)) return;
    ensureDir(BACKUP_DIR);
    const stamp = new Date().toISOString().slice(0, 10);
    const target = path.join(BACKUP_DIR, `minikitchen-${stamp}.sqlite`);
    if (!fs.existsSync(target)) {
      sqlite.exec('PRAGMA wal_checkpoint(PASSIVE);');
      fs.copyFileSync(SQLITE_FILE, target);
    }

    const cutoff = Date.now() - config.BACKUP_RETENTION_DAYS * 86400000;
    for (const name of fs.readdirSync(BACKUP_DIR)) {
      const full = path.join(BACKUP_DIR, name);
      if (fs.statSync(full).mtimeMs < cutoff) fs.unlinkSync(full);
    }
  } catch (err) {
    console.warn('[db] SQLite backup skipped:', err.message);
  }
}

async function init() {
  ensureDir(config.DATA_DIR);
  sqlite = new DatabaseSync(SQLITE_FILE);

  // Configure SQLite for production durability and concurrency
  sqlite.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      username TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL,
      salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      iterations INTEGER NOT NULL DEFAULT 210000,
      must_change_password INTEGER NOT NULL DEFAULT 0,
      password_changed_at TEXT,
      last_login_at TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      token_hash TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      remember INTEGER NOT NULL DEFAULT 1,
      ip TEXT,
      user_agent TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      type TEXT NOT NULL,
      brand TEXT NOT NULL,
      status TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      address TEXT,
      event_type TEXT,
      event_date TEXT,
      guests INTEGER NOT NULL DEFAULT 0,
      package_selected TEXT,
      notes TEXT,
      items_json TEXT NOT NULL DEFAULT '[]',
      total_usd REAL NOT NULL DEFAULT 0,
      lbp_rate INTEGER NOT NULL DEFAULT 89500,
      staff_notes TEXT,
      whatsapp_text TEXT,
      source TEXT NOT NULL DEFAULT 'website'
    );

    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(type);
    CREATE INDEX IF NOT EXISTS idx_orders_brand ON orders(brand);

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      ip TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at DESC);
  `);

  // Migrate from legacy JSON file if SQLite database is freshly created
  const hasAdmin = Boolean(getAdminAuth());
  const existingOrdersCount = sqlite.prepare('SELECT COUNT(*) AS c FROM orders').get().c;

  if (!hasAdmin && existingOrdersCount === 0 && fs.existsSync(LEGACY_JSON_FILE)) {
    try {
      const legacy = JSON.parse(fs.readFileSync(LEGACY_JSON_FILE, 'utf8'));
      sqlite.exec('BEGIN IMMEDIATE');
      try {
        setLbpRate(legacy.lbpRate || 89500);
        setSetting('orderSeq', Number(legacy.orderSeq) || 1005);
        if (legacy.siteConfig) setSiteConfig(legacy.siteConfig);
        if (legacy.menuCategories) setMenuCategories(legacy.menuCategories);
        if (Array.isArray(legacy.orders)) {
          for (const o of legacy.orders) {
            insertOrder(o);
          }
        }
        if (legacy.adminAuth && legacy.adminAuth.passwordHash) {
          saveAdminAuth({
            ...legacy.adminAuth,
            iterations: legacy.adminAuth.iterations || 10000,
            mustChangePassword: false
          });
        }
        sqlite.exec('COMMIT');
        logAudit('system', 'db.migrated_from_json', `Imported ${(legacy.orders || []).length} orders into SQLite`);
        console.log(`[db] Migrated legacy JSON data into SQLite (${SQLITE_FILE})`);
      } catch (txErr) {
        sqlite.exec('ROLLBACK');
        throw txErr;
      }
    } catch (err) {
      console.warn('[db] Could not migrate legacy JSON file:', err.message);
    }
  }

  // Ensure admin user exists
  if (!getAdminAuth()) {
    const admin = await createDefaultAdmin();
    saveAdminAuth(admin);
    logAudit('system', 'admin.bootstrapped', `Default admin '${admin.username}' initialized`);
  }

  // Ensure default settings exist
  if (getSetting('lbpRate', null) === null) setLbpRate(89500);
  if (getSetting('orderSeq', null) === null) setSetting('orderSeq', 1005);

  // Seed initial demo orders if database has 0 orders and SEED_DEMO_ORDERS is enabled
  const currentOrders = sqlite.prepare('SELECT COUNT(*) AS c FROM orders').get().c;
  if (currentOrders === 0 && config.SEED_DEMO_ORDERS) {
    const demoOrders = getDemoOrders();
    for (const o of demoOrders) {
      insertOrder(o);
    }
    logAudit('system', 'orders.seeded', `Seeded ${demoOrders.length} sample orders`);
  }

  pruneSessions();
  dailyBackup();

  const timer = setInterval(
    () => {
      pruneSessions();
      dailyBackup();
    },
    60 * 60 * 1000
  );
  if (timer.unref) timer.unref();

  return sqlite;
}

function close() {
  if (sqlite) {
    try {
      sqlite.exec('PRAGMA wal_checkpoint(TRUNCATE);');
      sqlite.close();
    } catch {
      /* ignore */
    }
    sqlite = null;
  }
}

module.exports = {
  SQLITE_FILE,
  init,
  close,
  getUpdatedAt,
  getLbpRate,
  setLbpRate,
  getSiteConfig,
  setSiteConfig,
  getMenuCategories,
  setMenuCategories,
  peekNextOrderSeq,
  nextOrderSeq,
  listOrders,
  getOrderById,
  insertOrder,
  updateOrder,
  deleteOrder,
  getAdminAuth,
  saveAdminAuth,
  getSession,
  createSession,
  deleteSession,
  deleteOtherSessions,
  pruneSessions,
  logAudit,
  listAuditLogs,
  getDatabaseStats,
  exportFullSnapshot,
  importFullSnapshot
};
