'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

function shortHash(relPath) {
  const full = path.join(PUBLIC_DIR, relPath);
  if (!fs.existsSync(full)) return '1';
  const buf = fs.readFileSync(full);
  return crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);
}

function applyAssetFingerprints(html) {
  const assets = ['css/styles.css', 'css/admin.css', 'js/site-data.js', 'js/menu-data.js', 'js/app.js', 'js/admin.js'];
  let out = html;
  for (const asset of assets) {
    const h = shortHash(asset);
    const re = new RegExp(`(href|src)="${asset.replace('.', '\\.')}(\\?v=[a-z0-9]+)?"`, 'g');
    out = out.replace(re, `$1="${asset}?v=${h}"`);
  }
  return out;
}

const PAGES = [
  {
    file: 'catering-menus.html',
    brand: 'catering',
    page: 'catering-menus',
    title: 'Catering Set Menus & Interactive FineDine Menu | Mini Kitchen Catering Lebanon',
    desc: "Explore Mini Kitchen Catering's 7 curated luxury wedding & corporate set menus ($35-$75/guest) and interactive FineDine Catering Menu with 23+ artisanal dishes in Aley & Lebanon.",
    canonical: 'https://minikitchencatering.com/catering-menus.html'
  },
  {
    file: 'restaurant.html',
    brand: 'restaurant',
    page: 'restaurant',
    title: 'Mini Kitchen Restaurant | Dine-In & Interactive QR Menu in Ain Al Remmaneh, Aley',
    desc: 'Dine at Mini Kitchen Restaurant in Ain Al Remmaneh, Aley, Mount Lebanon. Authentic Lebanese mezze, smoked Freekeh, wood-fired grills, pastas & interactive QR table ordering.',
    canonical: 'https://minikitchencatering.com/restaurant.html'
  },
  {
    file: 'delivery.html',
    brand: 'delivery',
    page: 'delivery',
    title: 'Mini Kitchen Delivery | Hot Meals, Family Trays & Fast WhatsApp Delivery in Aley',
    desc: 'Order hot daily meals, family sharing trays, wraps, burgers, and desserts from Mini Kitchen Delivery in Ain Al Remmaneh, Aley. Fast doorstep delivery via WhatsApp (+961 3 682 186).',
    canonical: 'https://minikitchencatering.com/delivery.html'
  },
  {
    file: 'about.html',
    brand: 'catering',
    page: 'about',
    title: 'About Mini Kitchen | Our Culinary Story in Ain Al Remmaneh, Aley, Lebanon',
    desc: 'Discover the story behind Mini Kitchen in Ain Al Remmaneh, Aley — uniting luxury Lebanese event catering, an intimate dine-in restaurant, and express gourmet delivery.',
    canonical: 'https://minikitchencatering.com/about.html'
  },
  {
    file: 'contact.html',
    brand: 'catering',
    page: 'contact',
    title: 'Contact & Event Quotes | Mini Kitchen Catering, Restaurant & Delivery Aley',
    desc: 'Book wedding & event catering, reserve a table, or order delivery from Mini Kitchen in Ain Al Remmaneh, Aley, Lebanon. Call +961 71 048 154 or +961 3 682 186.',
    canonical: 'https://minikitchencatering.com/contact.html'
  }
];

function build() {
  const indexPath = path.join(PUBLIC_DIR, 'index.html');
  let baseHtml = fs.readFileSync(indexPath, 'utf8').replace(/^\uFEFF/, '');
  baseHtml = applyAssetFingerprints(baseHtml);
  fs.writeFileSync(indexPath, baseHtml, { encoding: 'utf8' });

  for (const p of PAGES) {
    let html = baseHtml
      .replace(
        /data-brand="catering"\s+data-default-page="catering"/,
        `data-brand="${p.brand}" data-default-page="${p.page}"`
      )
      .replace(/<title>.*?<\/title>/, `<title>${p.title}</title>`)
      .replace(
        /<meta id="metaDescription" name="description" content=".*?"\s*\/>/,
        `<meta id="metaDescription" name="description" content="${p.desc}" />`
      )
      .replace(
        /<link id="canonicalLink" rel="canonical" href=".*?"\s*\/>/,
        `<link id="canonicalLink" rel="canonical" href="${p.canonical}" />`
      );
    fs.writeFileSync(path.join(PUBLIC_DIR, p.file), html, { encoding: 'utf8' });
  }

  const adminPath = path.join(PUBLIC_DIR, 'admin.html');
  if (fs.existsSync(adminPath)) {
    const adminHtml = applyAssetFingerprints(fs.readFileSync(adminPath, 'utf8').replace(/^\uFEFF/, ''));
    fs.writeFileSync(adminPath, adminHtml, { encoding: 'utf8' });
  }

  console.log('[build] Synced and fingerprinted all HTML pages in /public (UTF-8 no BOM).');
}

if (require.main === module) {
  build();
}

module.exports = { build };
