'use strict';

const config = require('../config');
const store = require('../db');
const security = require('../security');
const { HttpError } = require('./http');

const { isHttps, parseCookies, serializeCookie, SESSION_COOKIE } = security;

// Sessions are carried only in the HttpOnly cookie, so page scripts can never read the token.
function getSession(req) {
  const rawToken = parseCookies(req)[SESSION_COOKIE];
  if (!rawToken || rawToken.length > 200) return null;
  return store.getSession(security.hashToken(rawToken));
}

function requireAdmin(req) {
  const session = getSession(req);
  if (!session) {
    throw new HttpError(401, 'Authentication required. Please sign in to the Back Office.');
  }
  return session;
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

module.exports = { getSession, requireAdmin, sessionCookie, clearCookie };
