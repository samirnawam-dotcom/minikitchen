'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Load .env (if present) using Node's built-in loader (Node >= 20.12). No dependencies.
const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile) && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(envFile);
  } catch (err) {
    console.warn('[config] Could not load .env file:', err.message);
  }
}

function bool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return /^(1|true|yes|on)$/i.test(String(value).trim());
}

function hops(value) {
  if (value === undefined || value === null || value === '') return 0;
  const n = Number(value);
  if (Number.isInteger(n) && n >= 0) return n;
  return bool(value) ? 1 : 0;
}

function num(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';
const DATA_DIR = path.resolve(ROOT, process.env.DATA_DIR || 'data');

const config = Object.freeze({
  ROOT,
  PUBLIC_DIR: path.join(ROOT, 'public'),
  VIEWS_DIR: path.join(ROOT, 'views'),
  DATA_DIR,
  UPLOADS_DIR: path.join(DATA_DIR, 'uploads'),

  NODE_ENV,
  isProd,

  PORT: num(process.env.PORT, 3000),
  HOST: process.env.HOST || '0.0.0.0',
  SITE_URL: String(process.env.SITE_URL || 'https://minikitchencatering.com').replace(/\/+$/, ''),

  // Number of reverse proxies in front of the app (Nginx, Caddy, Render, Cloudflare...).
  // `true` means 1. Enables X-Forwarded-* parsing; leave unset when exposed directly.
  TRUST_PROXY: hops(process.env.TRUST_PROXY),
  // Redirect plain HTTP to HTTPS (requires TRUST_PROXY behind a TLS-terminating proxy).
  FORCE_HTTPS: bool(process.env.FORCE_HTTPS, false),

  // Initial Back Office administrator (used only when the database is first created).
  // Required in production; in development a random password is generated and printed.
  ADMIN_USERNAME: String(process.env.ADMIN_USERNAME || 'admin').trim(),
  ADMIN_PASSWORD: String(process.env.ADMIN_PASSWORD || ''),

  SESSION_TTL_HOURS: num(process.env.SESSION_TTL_HOURS, 12),
  SESSION_REMEMBER_DAYS: num(process.env.SESSION_REMEMBER_DAYS, 14),

  // Demo orders are useful locally but must never be seeded into a production database.
  SEED_DEMO_ORDERS: bool(process.env.SEED_DEMO_ORDERS, !isProd),
  MAX_STORED_ORDERS: num(process.env.MAX_STORED_ORDERS, 5000),
  BACKUP_RETENTION_DAYS: num(process.env.BACKUP_RETENTION_DAYS, 14),

  LOG_REQUESTS: bool(process.env.LOG_REQUESTS, true)
});

module.exports = config;
