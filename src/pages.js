'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('./config');

const SITE = 'https://minikitchencatering.com';

/**
 * Storefront pages share views/storefront.html; each gets its own SEO metadata so crawlers
 * and link previews see the right title without running JavaScript.
 */
const STOREFRONT_PAGES = {
  'index.html': {
    brand: 'catering',
    page: 'catering',
    title: 'Mini Kitchen Catering | Luxury Wedding & Event Catering in Aley, Mount Lebanon',
    description:
      'Mini Kitchen Catering in Ain Al Remmaneh, Aley provides bespoke wedding catering, corporate galas, live cooking stations, scenic mountain dining at Mini Kitchen Restaurant, and 239+ dishes for WhatsApp delivery across Mount Lebanon.',
    canonical: `${SITE}/`,
    ogDescription:
      'Exquisite wedding & event catering, panoramic mountain dining in Ain Al Remmaneh, Aley, and 239+ FineDine dishes available for direct WhatsApp delivery.',
    twitterTitle: 'Mini Kitchen Catering • Weddings, Restaurant & Delivery (Aley)',
    twitterDescription:
      'Bespoke wedding & event catering, scenic Aley mountain terrace restaurant, and 239+ dishes delivered hot via WhatsApp.'
  },
  'catering-menus.html': {
    brand: 'catering',
    page: 'catering-menus',
    title: 'Catering Packages & Menus | Mini Kitchen Catering Aley, Lebanon',
    description:
      'Mini Kitchen catering packages: event buffets from $20 per person, Birthday Mini packages from $18 per person, live stations, main course trays and mini bites in Aley & Lebanon.'
  },
  'restaurant.html': {
    brand: 'restaurant',
    page: 'restaurant',
    title: 'Mini Kitchen Restaurant | Dine-In & Interactive QR Menu in Ain Al Remmaneh, Aley',
    description:
      'Dine at Mini Kitchen Restaurant in Ain Al Remmaneh, Aley, Mount Lebanon. Authentic Lebanese mezze, smoked Freekeh, wood-fired grills, pastas & interactive QR table ordering.'
  },
  'delivery.html': {
    brand: 'delivery',
    page: 'delivery',
    title: 'Mini Kitchen Delivery | Hot Meals, Family Trays & Fast WhatsApp Delivery in Aley',
    description:
      'Order hot daily meals, family sharing trays, wraps, burgers, and desserts from Mini Kitchen Delivery in Ain Al Remmaneh, Aley. Fast doorstep delivery via WhatsApp (+961 3 682 186).'
  },
  'about.html': {
    brand: 'catering',
    page: 'about',
    title: 'About Mini Kitchen | Our Culinary Story in Ain Al Remmaneh, Aley, Lebanon',
    description:
      'Discover the story behind Mini Kitchen in Ain Al Remmaneh, Aley — uniting luxury Lebanese event catering, an intimate dine-in restaurant, and express gourmet delivery.'
  },
  'contact.html': {
    brand: 'catering',
    page: 'contact',
    title: 'Contact & Event Quotes | Mini Kitchen Catering, Restaurant & Delivery Aley',
    description:
      'Book wedding & event catering, reserve a table, or order delivery from Mini Kitchen in Ain Al Remmaneh, Aley, Lebanon. Call +961 71 048 154 or +961 3 682 186.'
  }
};

const PAGES = {
  ...Object.fromEntries(Object.keys(STOREFRONT_PAGES).map(name => [name, 'storefront.html'])),
  'admin.html': 'admin.html'
};

const ASSET_RE = /(href|src)="((?:css|js)\/(?:[\w-]+\/)*[\w.-]+\.(?:css|js))"/g;

function escapeAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function pageVars(name) {
  const p = STOREFRONT_PAGES[name];
  if (!p) return {};
  const canonical = p.canonical || `${SITE}/${name}`;
  return {
    brand: p.brand,
    page: p.page,
    title: p.title,
    description: p.description,
    canonical,
    ogTitle: p.ogTitle || p.title,
    ogDescription: p.ogDescription || p.description,
    twitterTitle: p.twitterTitle || p.title,
    twitterDescription: p.twitterDescription || p.description
  };
}

function mtime(file) {
  try {
    return fs.statSync(file).mtimeMs;
  } catch {
    return 0;
  }
}

const assetHashCache = new Map();

function assetHash(rel) {
  const full = path.join(config.PUBLIC_DIR, rel);
  const m = mtime(full);
  const cached = assetHashCache.get(full);
  if (cached && cached.mtimeMs === m) return cached.hash;
  let hash = '0';
  if (m) hash = crypto.createHash('sha1').update(fs.readFileSync(full)).digest('hex').slice(0, 8);
  assetHashCache.set(full, { mtimeMs: m, hash });
  return hash;
}

// ES modules are served under /assets/<version>/js/... where <version> covers every file in
// public/js. Relative imports inside a module inherit that prefix, so after a deploy the browser
// fetches the whole module graph fresh and can never mix old and new modules, even when the web
// server in front of Node (Passenger/nginx serving public/ directly) lets browsers cache /js/*.
const JS_DIR = path.join(config.PUBLIC_DIR, 'js');
let jsVersionCache = { key: null, hash: '0' };

function listFiles(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.flatMap(e => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? listFiles(full) : e.isFile() ? [full] : [];
  });
}

function jsVersion() {
  const key = listFiles(JS_DIR)
    .sort()
    .map(file => {
      const stats = fs.statSync(file);
      return `${file}:${stats.mtimeMs}:${stats.size}`;
    })
    .join('|');
  if (key !== jsVersionCache.key) {
    jsVersionCache = { key, hash: crypto.createHash('sha1').update(key).digest('hex').slice(0, 8) };
  }
  return jsVersionCache.hash;
}

const versionedAsset = asset =>
  asset.startsWith('js/') ? `assets/${jsVersion()}/${asset}` : `${asset}?v=${assetHash(asset)}`;

const templateCache = new Map();

function loadTemplate(file) {
  const m = mtime(file);
  const cached = templateCache.get(file);
  if (cached && cached.mtimeMs === m) return cached;
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const entry = { mtimeMs: m, text, assets: [...new Set([...text.matchAll(ASSET_RE)].map(x => x[2]))] };
  templateCache.set(file, entry);
  return entry;
}

const renderCache = new Map();

/**
 * Renders a page by its public file name (e.g. "about.html"). Returns { html, version } or null.
 * `version` changes whenever the template or any referenced asset changes.
 */
function renderPage(name) {
  const view = PAGES[name];
  if (!view) return null;
  const { text, assets, mtimeMs } = loadTemplate(path.join(config.VIEWS_DIR, view));
  const version = [mtimeMs, jsVersion(), ...assets.map(assetHash)].join(':');
  const cached = renderCache.get(name);
  if (cached && cached.version === version) return cached;

  const vars = pageVars(name);
  const html = text
    .replace(ASSET_RE, (_, attr, asset) => `${attr}="${versionedAsset(asset)}"`)
    .replace(/\{\{(\w+)\}\}/g, (match, key) => (key in vars ? escapeAttr(vars[key]) : match));

  const entry = { html, version };
  renderCache.set(name, entry);
  return entry;
}

module.exports = { renderPage, jsVersion, PAGES, STOREFRONT_PAGES };
