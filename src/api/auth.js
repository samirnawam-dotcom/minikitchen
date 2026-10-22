'use strict';

const config = require('../config');
const store = require('../db');
const security = require('../security');
const { LIMITS, HttpError, sendJson, readJsonBody } = require('./http');
const { getSession, requireAdmin, sessionCookie, clearCookie } = require('./session');

const { cleanString, RateLimiter, getClientIp } = security;

const USERNAME_RE = /^[a-zA-Z0-9._-]{3,40}$/;
const MAX_SESSIONS = 10;

const loginIpLimiter = new RateLimiter({ windowMs: 15 * 60 * 1000, max: 35 });
const loginFailLimiter = new RateLimiter({ windowMs: 15 * 60 * 1000, max: 8 });

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

  // Transparently upgrade legacy password hashes to the current PBKDF2 iteration count
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
    { ok: true, user: publicUser(auth) },
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

module.exports = { login, logout, me, changePassword };
