'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('./config');
const store = require('./db');
const security = require('./security');

const {
  cleanString,
  cleanNumber,
  pickEnum,
  RateLimiter,
  getClientIp,
  isHttps,
  isSameOrigin,
  parseCookies,
  serializeCookie,
  SESSION_COOKIE
} = security;

const ORDER_TYPES = ['delivery_order', 'catering_quote', 'table_reservation', 'whatsapp_inquiry'];
const ORDER_BRANDS = ['catering', 'restaurant', 'delivery'];
const ORDER_STATUSES = ['new', 'confirmed', 'preparing', 'out_for_delivery', 'completed', 'cancelled'];
const USERNAME_RE = /^[a-zA-Z0-9._-]{3,40}$/;
const MAX_SESSIONS = 10;

const LIMITS = { auth: 16 * 1024, order: 128 * 1024, admin: 10 * 1024 * 1024 };

const loginIpLimiter = new RateLimiter({ windowMs: 15 * 60 * 1000, max: 35 });
const loginFailLimiter = new RateLimiter({ windowMs: 15 * 60 * 1000, max: 8 });
const orderLimiter = new RateLimiter({ windowMs: 10 * 60 * 1000, max: 60 });
const apiLimiter = new RateLimiter({ windowMs: 60 * 1000, max: 360 });

class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

function sendJson(res, status, payload, headers = {}) {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.setHeader('Content-Length', Buffer.byteLength(body));
  res.end(body);
}

function readJsonBody(req, limit) {
  return new Promise((resolve, reject) => {
    const type = String(req.headers['content-type'] || '').toLowerCase();
    const declared = Number(req.headers['content-length'] || 0);
    if (declared === 0 && !req.headers['transfer-encoding']) return resolve({});
    if (type && !type.includes('application/json') && !type.includes('text/plain')) {
      return reject(new HttpError(415, 'Content-Type must be application/json.'));
    }
    if (declared > limit) return reject(new HttpError(413, 'Request body is too large.'));

    const chunks = [];
    let size = 0;
    let aborted = false;
    req.on('data', chunk => {
      if (aborted) return;
      size += chunk.length;
      if (size > limit) {
        aborted = true;
        reject(new HttpError(413, 'Request body is too large.'));
        req.resume();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (aborted) return;
      if (!size) return resolve({});
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          return reject(new HttpError(400, 'JSON body must be an object.'));
        }
        resolve(parsed);
      } catch {
        reject(new HttpError(400, 'Malformed JSON body.'));
      }
    });
    req.on('error', err => {
      if (!aborted) reject(err);
    });
  });
}

// ============================================================================
// SESSION HANDLING (Supports both HttpOnly Cookie and Authorization Bearer header)
// ============================================================================
function extractRawTokens(req) {
  const tokens = [];
  const cookieToken = parseCookies(req)[SESSION_COOKIE];
  if (cookieToken && cookieToken.length <= 200) tokens.push(cookieToken);

  const authHeader = String(req.headers['authorization'] || req.headers['x-admin-token'] || '').trim();
  if (authHeader) {
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader;
    if (bearer && bearer.length <= 200 && !tokens.includes(bearer)) {
      tokens.push(bearer);
    }
  }
  return tokens;
}

function getSession(req) {
  const candidates = extractRawTokens(req);
  for (const rawToken of candidates) {
    const tokenHash = security.hashToken(rawToken);
    const session = store.getSession(tokenHash);
    if (session) return session;
  }
  return null;
}

function publicUser(auth) {
  if (!auth) return null;
  return {
    username: auth.username,
    displayName: auth.displayName,
    role: auth.role,
    lastLoginAt: auth.lastLoginAt,
    mustChangePassword: Boolean(auth.mustChangePassword)
  };
}

function sessionCookie(req, token, remember) {
  return serializeCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'Strict',
    secure: isHttps(req),
    maxAge: remember ? config.SESSION_REMEMBER_DAYS * 86400 : undefined
  });
}

function clearCookie(req) {
  return serializeCookie(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'Strict',
    secure: isHttps(req),
    maxAge: 0
  });
}

function requireAdmin(req) {
  const session = getSession(req);
  if (!session) {
    throw new HttpError(401, 'Authentication required. Please sign in to the Back Office.');
  }
  return session;
}

// ============================================================================
// ORDER NORMALISATION
// ============================================================================
function normalizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 100).map(item => ({
    id: cleanString(item && item.id, 60),
    title: cleanString(item && item.title, 200),
    qty: cleanNumber(item && item.qty, { min: 1, max: 999, integer: true }),
    priceValue: Math.round(cleanNumber(item && item.priceValue, { min: 0, max: 100000 }) * 100) / 100,
    modifiers: Array.isArray(item && item.modifiers)
      ? item.modifiers.slice(0, 20).map(m => cleanString(m, 200))
      : [],
    note: cleanString(item && item.note, 300)
  }));
}

function buildOrder(body, { isAdmin }) {
  const items = normalizeItems(body.items);
  const itemsTotal = items.reduce((sum, i) => sum + i.priceValue * i.qty, 0);
  const requestedTotal = Math.round(cleanNumber(body.totalUsd, { min: 0, max: 10000000 }) * 100) / 100;
  const totalUsd = requestedTotal > 0 ? requestedTotal : Math.round(itemsTotal * 100) / 100;

  const seq = store.nextOrderSeq(body.id);
  const id = `MK-${seq}`;

  return {
    id,
    createdAt: new Date().toISOString(),
    type: pickEnum(body.type, ORDER_TYPES, 'whatsapp_inquiry'),
    brand: pickEnum(body.brand, ORDER_BRANDS, 'delivery'),
    status: isAdmin ? pickEnum(body.status, ORDER_STATUSES, 'new') : 'new',
    customerName: cleanString(body.customerName, 120) || 'WhatsApp Customer',
    customerPhone: cleanString(body.customerPhone, 40),
    address: cleanString(body.address, 300),
    eventType: cleanString(body.eventType, 120),
    eventDate: cleanString(body.eventDate, 40),
    guests: cleanNumber(body.guests, { min: 0, max: 100000, integer: true }),
    packageSelected: cleanString(body.packageSelected, 200),
    notes: cleanString(body.notes, 2000),
    items,
    totalUsd,
    lbpRate: store.getLbpRate(),
    staffNotes: isAdmin
      ? cleanString(body.staffNotes, 500)
      : cleanString(body.staffNotes, 300) || 'Recorded automatically from website WhatsApp action',
    whatsappText: cleanString(body.whatsappText, 5000),
    source: isAdmin ? 'back-office' : 'website'
  };
}

const PATCHABLE_FIELDS = {
  status: v => pickEnum(v, ORDER_STATUSES, null),
  staffNotes: v => cleanString(v, 500),
  customerName: v => cleanString(v, 120),
  customerPhone: v => cleanString(v, 40),
  address: v => cleanString(v, 300),
  notes: v => cleanString(v, 2000),
  eventType: v => cleanString(v, 120),
  eventDate: v => cleanString(v, 40),
  packageSelected: v => cleanString(v, 200),
  guests: v => cleanNumber(v, { min: 0, max: 100000, integer: true }),
  totalUsd: v => Math.round(cleanNumber(v, { min: 0, max: 10000000 }) * 100) / 100
};

// ============================================================================
// ROUTE HANDLERS
// ============================================================================
async function login(req, res) {
  const ip = getClientIp(req);
  const body = await readJsonBody(req, LIMITS.auth);
  const username = cleanString(body.username, 60).toLowerCase();
  const password = String(body.password || '').slice(0, 256);
  const remember = body.remember !== false;
  const failKey = `${ip}|${username}`;

  const ipState = loginIpLimiter.hit(ip);
  const failState = loginFailLimiter.peek(failKey);
  if (!ipState.allowed || failState.blocked) {
    const retry = Math.max(ipState.retryAfterSec, failState.retryAfterSec);
    throw new HttpError(
      429,
      `Too many sign-in attempts. Please wait ${Math.ceil(retry / 60)} minute(s) and try again.`,
      { retryAfter: retry }
    );
  }

  const auth = store.getAdminAuth();
  const userMatches = auth && username === String(auth.username).toLowerCase();
  const passOk = await security.verifyPassword(
    password,
    userMatches ? auth.salt : null,
    userMatches ? auth.passwordHash : null,
    auth ? auth.iterations : 10000
  );

  if (!userMatches || !passOk) {
    loginFailLimiter.hit(failKey);
    store.logAudit(username || 'unknown', 'auth.login_failed', 'Invalid username or password', ip);
    throw new HttpError(401, 'Invalid username or password. Please check your Back Office credentials.');
  }

  loginFailLimiter.reset(failKey);

  // Transparently upgrade legacy password hashes to 210,000 PBKDF2-SHA512 iterations
  if ((auth.iterations || 0) < security.PBKDF2_ITERATIONS) {
    const upgraded = await security.hashPassword(password);
    auth.salt = upgraded.salt;
    auth.passwordHash = upgraded.hash;
    auth.iterations = upgraded.iterations;
  }

  const token = security.createSessionToken();
  const ttlMs = remember ? config.SESSION_REMEMBER_DAYS * 86400000 : config.SESSION_TTL_HOURS * 3600000;
  store.createSession(
    security.hashToken(token),
    {
      username: auth.username,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ttlMs).toISOString(),
      remember,
      ip,
      userAgent: cleanString(req.headers['user-agent'], 200)
    },
    MAX_SESSIONS
  );

  auth.lastLoginAt = new Date().toISOString();
  store.saveAdminAuth(auth);
  store.logAudit(auth.username, 'auth.login_success', 'Signed in to Back Office', ip);

  return sendJson(
    res,
    200,
    { ok: true, token, user: publicUser(auth) },
    { 'Set-Cookie': sessionCookie(req, token, remember) }
  );
}

function logout(req, res) {
  const session = getSession(req);
  if (session) {
    store.deleteSession(session.key);
    store.logAudit(session.username, 'auth.logout', 'Signed out of Back Office', getClientIp(req));
  }
  return sendJson(res, 200, { ok: true }, { 'Set-Cookie': clearCookie(req) });
}

function me(req, res) {
  const session = getSession(req);
  if (!session) return sendJson(res, 401, { ok: false, authenticated: false });
  return sendJson(res, 200, {
    ok: true,
    authenticated: true,
    user: publicUser(store.getAdminAuth()),
    database: store.getDatabaseStats()
  });
}

async function changePassword(req, res) {
  const session = requireAdmin(req);
  const body = await readJsonBody(req, LIMITS.auth);
  const auth = store.getAdminAuth();

  const currentPassword = String(body.currentPassword || '').slice(0, 256);
  const newUsername = cleanString(body.newUsername || auth.username, 40);
  const newDisplayName = cleanString(body.newDisplayName || auth.displayName, 80).replace(/[<>]/g, '');
  const newPassword = String(body.newPassword || '');

  const ok = await security.verifyPassword(currentPassword, auth.salt, auth.passwordHash, auth.iterations);
  if (!ok) throw new HttpError(400, 'Current password is incorrect.');
  if (!USERNAME_RE.test(newUsername)) {
    throw new HttpError(400, 'Username must be 3–40 characters (letters, numbers, dot, dash or underscore).');
  }

  if (newPassword) {
    const problem = security.validateNewPassword(newPassword, newUsername);
    if (problem) throw new HttpError(400, problem);
    const hashed = await security.hashPassword(newPassword);
    auth.salt = hashed.salt;
    auth.passwordHash = hashed.hash;
    auth.iterations = hashed.iterations;
    auth.mustChangePassword = false;
    auth.passwordChangedAt = new Date().toISOString();
    store.deleteOtherSessions(session.key);
  }

  auth.username = newUsername;
  auth.displayName = newDisplayName || 'Mini Kitchen Executive Admin';
  store.saveAdminAuth(auth);
  store.logAudit(auth.username, 'auth.credentials_updated', 'Updated admin username/password', getClientIp(req));
  return sendJson(res, 200, { ok: true, user: publicUser(auth) });
}

function getState(req, res) {
  const session = getSession(req);
  const payload = {
    ok: true,
    lbpRate: store.getLbpRate(),
    nextOrderSeq: store.peekNextOrderSeq(),
    siteConfig: store.getSiteConfig(),
    menuCategories: store.getMenuCategories(),
    updatedAt: store.getUpdatedAt(),
    database: store.getDatabaseStats()
  };
  if (session) {
    payload.orders = store.listOrders();
    payload.auditLogs = store.listAuditLogs(30);
  }
  return sendJson(res, 200, payload);
}

async function createOrder(req, res) {
  const session = getSession(req);
  const isAdmin = Boolean(session);
  const ip = getClientIp(req);

  if (!isAdmin) {
    const state = orderLimiter.hit(ip);
    if (!state.allowed) {
      throw new HttpError(429, 'Too many requests. Please try again shortly.', {
        retryAfter: state.retryAfterSec
      });
    }
  }

  const body = await readJsonBody(req, LIMITS.order);
  if (body.website || body.company_url) return sendJson(res, 201, { ok: true });

  const order = buildOrder(body, { isAdmin });
  const saved = store.insertOrder(order);
  store.logAudit(
    isAdmin ? session.username : 'customer',
    'order.created',
    `${saved.id} (${saved.type}) - ${saved.customerName} ($${saved.totalUsd})`,
    ip
  );
  return sendJson(res, 201, { ok: true, order: saved });
}

async function patchOrder(req, res, orderId) {
  const session = requireAdmin(req);
  const body = await readJsonBody(req, LIMITS.order);
  const existing = store.getOrderById(orderId);
  if (!existing) throw new HttpError(404, 'Order not found.');

  const patch = {};
  for (const [field, normalise] of Object.entries(PATCHABLE_FIELDS)) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      const value = normalise(body[field]);
      if (value !== null) patch[field] = value;
    }
  }
  const updated = store.updateOrder(orderId, patch);
  store.logAudit(
    session.username,
    'order.updated',
    `${orderId} -> ${JSON.stringify(patch)}`,
    getClientIp(req)
  );
  return sendJson(res, 200, { ok: true, order: updated });
}

function deleteOrder(req, res, orderId) {
  const session = requireAdmin(req);
  const deleted = store.deleteOrder(orderId);
  if (!deleted) throw new HttpError(404, 'Order not found.');
  store.logAudit(session.username, 'order.deleted', `Deleted order ${orderId}`, getClientIp(req));
  return sendJson(res, 200, { ok: true });
}

function trackOrderPublic(req, res, rawOrderId) {
  const normalizedId = String(rawOrderId || '')
    .trim()
    .replace(/^#/, '')
    .toUpperCase();
  const order = store.getOrderById(normalizedId);
  if (!order) {
    throw new HttpError(404, `Order reference #${normalizedId} was not found. Please check your Order Reference ID.`);
  }
  const firstName = String(order.customerName || 'Valued Guest').split(' ')[0];
  return sendJson(res, 200, {
    ok: true,
    order: {
      id: order.id,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt || order.createdAt,
      type: order.type,
      brand: order.brand,
      status: order.status,
      customerFirstName: firstName,
      eventType: order.eventType,
      eventDate: order.eventDate,
      guests: order.guests,
      packageSelected: order.packageSelected,
      items: (order.items || []).map(i => ({
        title: i.title,
        qty: i.qty,
        priceValue: i.priceValue,
        modifiers: i.modifiers || []
      })),
      totalUsd: order.totalUsd,
      lbpRate: order.lbpRate || store.getLbpRate()
    }
  });
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
  if (body.lbpRate !== undefined) {
    store.setLbpRate(cleanNumber(body.lbpRate, { min: 1, max: 10000000 }) || 89500);
  }
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
  if (body.lbpRate !== undefined) {
    store.setLbpRate(cleanNumber(body.lbpRate, { min: 1, max: 10000000 }) || 89500);
  }
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
  if (target === 'all') store.setLbpRate(89500);
  store.logAudit(session.username, 'content.reset', `Reset target: ${target}`, getClientIp(req));
  return sendJson(res, 200, { ok: true });
}

function getDbStatus(req, res) {
  requireAdmin(req);
  return sendJson(res, 200, {
    ok: true,
    database: store.getDatabaseStats(),
    auditLogs: store.listAuditLogs(50)
  });
}

function exportDbSnapshot(req, res) {
  const session = requireAdmin(req);
  store.logAudit(session.username, 'db.exported', 'Exported full SQLite database snapshot', getClientIp(req));
  const snapshot = store.exportFullSnapshot();
  const stamp = new Date().toISOString().slice(0, 10);
  return sendJson(res, 200, snapshot, {
    'Content-Disposition': `attachment; filename="minikitchen-db-backup-${stamp}.json"`
  });
}

async function importDbSnapshot(req, res) {
  const session = requireAdmin(req);
  const body = await readJsonBody(req, LIMITS.admin);
  const snapshot = body.snapshot && typeof body.snapshot === 'object' ? body.snapshot : body;
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    throw new HttpError(400, 'Invalid database backup file.');
  }
  const hasAnyKey =
    snapshot.orders !== undefined ||
    snapshot.siteConfig !== undefined ||
    snapshot.menuCategories !== undefined ||
    snapshot.lbpRate !== undefined;
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

const IMAGE_MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif'
};

function hasValidImageMagicBytes(buf, ext) {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return false;
  if (ext === '.jpg') return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (ext === '.png') {
    return (
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a
    );
  }
  if (ext === '.gif') {
    const sig = buf.subarray(0, 6).toString('ascii');
    return sig === 'GIF87a' || sig === 'GIF89a';
  }
  if (ext === '.webp') {
    return (
      buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buf.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }
  if (ext === '.avif') {
    return buf.subarray(4, 8).toString('ascii') === 'ftyp';
  }
  return false;
}

async function uploadImage(req, res) {
  const session = requireAdmin(req);
  const body = await readJsonBody(req, LIMITS.admin);
  const dataUrl = String(body.dataUrl || '').trim();
  const rawName = cleanString(body.filename || 'photo', 80)
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 40) || 'photo';

  const match = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp|gif|avif));base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!match) {
    throw new HttpError(400, 'Unsupported image format. Please upload a JPG, PNG, WebP, GIF, or AVIF image.');
  }

  const mime = match[1].toLowerCase();
  const ext = IMAGE_MIME_EXT[mime];
  const buffer = Buffer.from(match[2], 'base64');

  if (!buffer.length || buffer.length > 6 * 1024 * 1024) {
    throw new HttpError(413, 'Image file size must be under 6 MB.');
  }
  if (!hasValidImageMagicBytes(buffer, ext)) {
    throw new HttpError(400, 'Uploaded file header does not match a valid image.');
  }

  const uploadsDir = path.join(config.PUBLIC_DIR, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const hash = crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 10);
  const fileName = `${Date.now()}-${rawName}-${hash}${ext}`;
  const fullPath = path.join(uploadsDir, fileName);
  fs.writeFileSync(fullPath, buffer);

  const publicUrl = `/uploads/${fileName}`;
  store.logAudit(
    session.username,
    'media.uploaded',
    `Uploaded ${fileName} (${Math.round(buffer.length / 1024)} KB)`,
    getClientIp(req)
  );

  return sendJson(res, 201, {
    ok: true,
    url: publicUrl,
    filename: fileName,
    sizeKb: Math.round((buffer.length / 1024) * 10) / 10
  });
}

// ============================================================================
// ROUTER
// ============================================================================
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

async function handleApi(req, res, parsedUrl) {
  const { pathname } = parsedUrl;
  const method = req.method;

  try {
    const ipState = apiLimiter.hit(getClientIp(req));
    if (!ipState.allowed) {
      throw new HttpError(429, 'Too many requests. Please slow down.', { retryAfter: ipState.retryAfterSec });
    }

    if (MUTATING.has(method) && !isSameOrigin(req)) {
      throw new HttpError(403, 'Cross-origin request blocked.');
    }

    if (pathname === '/api/health') {
      if (method !== 'GET' && method !== 'HEAD') throw new HttpError(405, 'Method not allowed.');
      return sendJson(res, 200, {
        ok: true,
        status: 'healthy',
        database: store.getDatabaseStats(),
        uptimeSec: Math.round(process.uptime())
      });
    }
    if (pathname === '/api/auth/login') {
      if (method !== 'POST') throw new HttpError(405, 'Method not allowed.');
      return await login(req, res);
    }
    if (pathname === '/api/auth/logout') {
      if (method !== 'POST') throw new HttpError(405, 'Method not allowed.');
      return logout(req, res);
    }
    if (pathname === '/api/auth/me') {
      if (method !== 'GET') throw new HttpError(405, 'Method not allowed.');
      return me(req, res);
    }
    if (pathname === '/api/auth/change-password') {
      if (method !== 'POST') throw new HttpError(405, 'Method not allowed.');
      return await changePassword(req, res);
    }
    if (pathname === '/api/state') {
      if (method !== 'GET') throw new HttpError(405, 'Method not allowed.');
      return getState(req, res);
    }
    if (pathname === '/api/db/status') {
      if (method !== 'GET') throw new HttpError(405, 'Method not allowed.');
      return getDbStatus(req, res);
    }
    if (pathname === '/api/db/export') {
      if (method !== 'GET') throw new HttpError(405, 'Method not allowed.');
      return exportDbSnapshot(req, res);
    }
    if (pathname === '/api/db/import') {
      if (method !== 'POST') throw new HttpError(405, 'Method not allowed.');
      return await importDbSnapshot(req, res);
    }
    if (pathname === '/api/upload') {
      if (method !== 'POST') throw new HttpError(405, 'Method not allowed.');
      return await uploadImage(req, res);
    }
    if (pathname === '/api/orders') {
      if (method === 'POST') return await createOrder(req, res);
      if (method === 'GET') {
        requireAdmin(req);
        return sendJson(res, 200, { ok: true, orders: store.listOrders() });
      }
      throw new HttpError(405, 'Method not allowed.');
    }
    const trackMatch = pathname.match(/^\/api\/orders\/track\/([A-Za-z0-9#-]{1,24})$/);
    if (trackMatch) {
      if (method !== 'GET') throw new HttpError(405, 'Method not allowed.');
      return trackOrderPublic(req, res, decodeURIComponent(trackMatch[1]));
    }
    const orderMatch = pathname.match(/^\/api\/orders\/(MK-[A-Za-z0-9-]{1,20})$/);
    if (orderMatch) {
      if (method === 'PATCH') return await patchOrder(req, res, orderMatch[1]);
      if (method === 'DELETE') return deleteOrder(req, res, orderMatch[1]);
      throw new HttpError(405, 'Method not allowed.');
    }
    if (pathname === '/api/site-config') {
      if (method !== 'PUT') throw new HttpError(405, 'Method not allowed.');
      return await putSiteConfig(req, res);
    }
    if (pathname === '/api/menu') {
      if (method !== 'PUT') throw new HttpError(405, 'Method not allowed.');
      return await putMenu(req, res);
    }
    if (pathname === '/api/reset') {
      if (method !== 'POST') throw new HttpError(405, 'Method not allowed.');
      return await resetContent(req, res);
    }
    throw new HttpError(404, 'Unknown API endpoint.');
  } catch (err) {
    if (err instanceof HttpError) {
      const headers = {};
      if (err.extra.retryAfter) headers['Retry-After'] = String(err.extra.retryAfter);
      const payload = { ok: false, error: err.message };
      if (err.extra.code) payload.code = err.extra.code;
      return sendJson(res, err.status, payload, headers);
    }
    console.error('[api] Unhandled error:', err);
    return sendJson(res, 500, { ok: false, error: 'Internal server error.' });
  }
}

module.exports = { handleApi };
