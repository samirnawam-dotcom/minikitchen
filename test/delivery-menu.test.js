'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const fs = require('node:fs');
const path = require('node:path');
const { sanitizeContentTree } = require('../src/security');

// Browser ES module without imports: load it as a data: URL (see catering-menu.test.js).
const SOURCE = fs.readFileSync(path.join(__dirname, '../public/js/data/delivery-menu.js'), 'utf8');
const load = () => import(`data:text/javascript,${encodeURIComponent(SOURCE)}`);
const PUBLIC = path.join(__dirname, '../public');

test('the default delivery menu has 7 categories and 50 dishes with unique ids', async () => {
  const { DELIVERY_MENU } = await load();
  assert.equal(DELIVERY_MENU.length, 7);
  const items = DELIVERY_MENU.flatMap(c => c.items);
  assert.equal(items.length, 50);
  const ids = new Set(items.map(i => i.id));
  assert.equal(ids.size, 50);
  for (const item of items) {
    assert.match(item.id, /^dl-/);
    assert.equal(item.price, `$${item.priceValue.toFixed(2)}`);
    assert.ok(item.title && item.titleAr, `${item.id} has English and Arabic names`);
  }
  for (const cat of DELIVERY_MENU) {
    assert.ok(cat.nameAr, `${cat.id} has an Arabic name`);
    assert.equal(cat.count, cat.items.length);
    for (const item of cat.items) assert.equal(item.categoryId, cat.id);
  }
});

test('every delivery photo exists in both sizes (Truffle Fries has none yet)', async () => {
  const { DELIVERY_MENU } = await load();
  for (const item of DELIVERY_MENU.flatMap(c => c.items)) {
    if (item.id === 'dl-truffle-fries') {
      assert.equal(item.img, '');
      assert.equal(item.hasRealPhoto, false);
      continue;
    }
    assert.match(item.img, /^images\/delivery\/[\w-]+-900\.webp$/);
    assert.ok(fs.existsSync(path.join(PUBLIC, item.img)), item.img);
    assert.ok(fs.existsSync(path.join(PUBLIC, item.img.replace(/-900\.webp$/, '.webp'))), `${item.img} (1200px)`);
  }
});

test('per-piece dishes and option groups are wired up', async () => {
  const { DELIVERY_MENU, DELIVERY_MODIFIER_GROUPS } = await load();
  const items = DELIVERY_MENU.flatMap(c => c.items);
  const perPiece = items.filter(i => i.unit === 'piece').map(i => i.id);
  assert.deepEqual(perPiece.sort(), [
    'dl-cheddar-jalapino-served-by-pc',
    'dl-chicken-balls',
    'dl-chiken-tenders',
    'dl-halloum-stick-served-by-pcs',
    'dl-mozzarella-sticks-served-by-pcs',
    'dl-wings-served-by-pcs'
  ]);
  for (const item of items) {
    assert.ok(item.modType === 'none' || DELIVERY_MODIFIER_GROUPS[item.modType], `${item.id}: ${item.modType}`);
  }
});

test('the delivery menu survives the server content sanitiser unchanged (siteConfig.deliveryMenu)', async () => {
  const { DELIVERY_MENU } = await load();
  const siteConfig = { deliveryMenu: JSON.parse(JSON.stringify(DELIVERY_MENU)) };
  assert.deepEqual(sanitizeContentTree(siteConfig), siteConfig);
});
