'use strict';

/**
 * Browser smoke test: loads every page, clicks every interactive element and reports
 * uncaught errors, console errors and CSP violations. Screenshots go to the output dir.
 *
 *   node test/e2e/smoke.js [outDir]
 *
 * SMOKE_SKIP_STOREFRONT=1 / SMOKE_SKIP_ADMIN=1 run one half; SMOKE_PAGES=/,/about limits pages;
 * SMOKE_MAX_CLICKS caps clicks per page (default 120).
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
/* global window, document, getComputedStyle */
const { chromium } = require('playwright-core');

const OUT = path.resolve(process.argv[2] || path.join(os.tmpdir(), 'minikitchen-smoke'));
const ADMIN_PASSWORD = 'smoke-password-123';
const STOREFRONT = (process.env.SMOKE_PAGES || '/,/catering-menus,/restaurant,/delivery,/about,/contact').split(',');
const CLICKABLE = '[data-action], [onclick]';
const MAX_CLICKS_PER_PAGE = Number(process.env.SMOKE_MAX_CLICKS || 120);

Object.assign(process.env, {
  NODE_ENV: 'test',
  DATA_DIR: fs.mkdtempSync(path.join(os.tmpdir(), 'minikitchen-smoke-data-')),
  ADMIN_PASSWORD,
  SEED_DEMO_ORDERS: 'true',
  LOG_REQUESTS: 'false'
});

function executablePath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  for (const p of ['/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome']) {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return undefined; // fall back to Playwright's own lookup
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const store = require('../../src/db');
  const { createServer } = require('../../src/app');
  await store.init();
  const server = createServer();
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;

  const browser = await chromium.launch({ executablePath: executablePath() });
  const context = await browser.newContext({ viewport: { width: 1360, height: 900 } });
  await context.addInitScript(() => {
    window.open = () => null;
  });
  // Keep the run hermetic: external photos become a 1x1 PNG, other external files are empty.
  const PIXEL = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  await context.route('**/*', route => {
    const req = route.request();
    if (req.url().startsWith(base)) return route.continue();
    if (req.resourceType() === 'image') return route.fulfill({ contentType: 'image/png', body: PIXEL });
    return route.fulfill({ status: 200, body: '' });
  });

  const report = { base, pages: {} };
  let current = null;

  function attach(page) {
    page.on('dialog', d => d.dismiss().catch(() => {}));
    page.on('pageerror', err => current && current.errors.push(`pageerror after [${current.last}]: ${err.message}`));
    page.on('console', msg => {
      if (!current || msg.type() !== 'error') return;
      const text = msg.text();
      if (/ERR_FAILED|ERR_BLOCKED|Failed to load resource/.test(text)) return; // blocked externals
      current.errors.push(`console after [${current.last}]: ${text}`);
    });
  }

  async function crawl(page, url, name) {
    current = { url, last: 'load', errors: [], actions: [] };
    report.pages[name] = current;
    await page.goto(base + url, { waitUntil: 'load' });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });

    // Tag visible interactive elements once per load, then click them by index.
    const tag = () =>
      page.evaluate(sel => {
        let n = 0;
        for (const el of document.querySelectorAll(sel)) {
          const r = el.getBoundingClientRect();
          const visible = r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
          if (visible) el.setAttribute('data-smoke', String(n++));
        }
        return n;
      }, CLICKABLE);

    let total = await tag();
    for (let i = 0; i < Math.min(total, MAX_CLICKS_PER_PAGE); i++) {
      if (i > 0 && i % 25 === 0) {
        await page.goto(base + url, { waitUntil: 'load' });
        total = await tag();
      }
      const el = await page.$(`[data-smoke="${i}"]`);
      if (!el) continue;
      const desc = await el
        .evaluate(e => e.getAttribute('data-action') || (e.getAttribute('onclick') || '').slice(0, 60) || e.tagName)
        .catch(() => 'detached');
      current.last = desc;
      current.actions.push(desc);
      await el.click({ timeout: 800, noWaitAfter: true }).catch(() => {});
      await page.waitForTimeout(60);
      if (!page.url().startsWith(base)) await page.goto(base + url, { waitUntil: 'load' });
      await page.keyboard.press('Escape').catch(() => {});
    }
    console.log(`  crawled ${name}: ${current.actions.length} clicks`);
  }

  const page = await context.newPage();
  attach(page);
  for (const url of process.env.SMOKE_SKIP_STOREFRONT ? [] : STOREFRONT) {
    await crawl(page, url, url === '/' ? 'home' : url.slice(1));
  }

  if (process.env.SMOKE_SKIP_ADMIN) return finish();

  // Back Office: sign in, then visit and crawl every tab.
  current = { url: '/admin', last: 'login', errors: [], actions: [] };
  report.pages['admin-login'] = current;
  await page.goto(base + '/admin', { waitUntil: 'load' });
  await page.screenshot({ path: path.join(OUT, 'admin-login.png') });
  await page.fill('#boLoginUser', 'admin');
  await page.fill('#boLoginPass', ADMIN_PASSWORD);
  await page.click('#boLoginSubmitBtn');
  await page.waitForTimeout(800);
  const tabs = await page.$$eval('.bo-nav-btn[data-tab]', els => els.map(e => e.getAttribute('data-tab')));
  report.adminTabs = tabs;
  for (const tab of tabs) {
    current = { url: `/admin#${tab}`, last: `tab ${tab}`, errors: [], actions: [] };
    report.pages[`admin-${tab}`] = current;
    // Reload so dialogs opened while crawling the previous tab cannot cover the navigation.
    await page.goto(base + '/admin', { waitUntil: 'load' });
    await page.waitForTimeout(300);
    await page.click(`.bo-nav-btn[data-tab="${tab}"]`);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, `admin-${tab}.png`) });
    // Re-tag after every click: tabs re-render, which detaches previously found elements.
    const tagTab = () =>
      page.evaluate(sel => {
        let n = 0;
        for (const el of document.querySelectorAll(`#boMainContainer :is(${sel})`)) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) el.setAttribute('data-smoke', String(n++));
        }
        return n;
      }, CLICKABLE);
    let count = await tagTab();
    for (let i = 0; i < Math.min(count, 40); i++) {
      const el = await page.$(`[data-smoke="${i}"]`);
      if (!el) continue;
      const desc = await el
        .evaluate(e => e.getAttribute('data-action') || (e.getAttribute('onclick') || '').slice(0, 60))
        .catch(() => 'detached');
      if (/delete|reset|logout|import|remove/i.test(desc)) continue; // keep demo data intact
      current.last = desc;
      current.actions.push(desc);
      await el.click({ timeout: 800, noWaitAfter: true }).catch(() => {});
      await page.waitForTimeout(80);
      await page.keyboard.press('Escape').catch(() => {});
      // Close any dialog the click opened so it cannot cover the next control.
      await page
        .evaluate(() => document.querySelectorAll('.open').forEach(m => m.classList.remove('open')))
        .catch(() => {});
      count = await tagTab();
    }
  }

  return finish();

  async function finish() {
    await browser.close();
    await new Promise(r => server.close(r));
    store.close();

    fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
    let failed = 0;
    for (const [name, p] of Object.entries(report.pages)) {
      const unique = [...new Set(p.errors)];
      failed += unique.length;
      console.log(`${unique.length ? '✖' : '✔'} ${name}: ${p.actions.length} actions, ${unique.length} errors`);
      for (const e of unique.slice(0, 10)) console.log(`    ${e}`);
    }
    console.log(`\nScreenshots and report.json in ${OUT}`);
    process.exit(failed ? 1 : 0);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
