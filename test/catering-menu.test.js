'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const fs = require('node:fs');
const path = require('node:path');

// public/js is browser ES modules in a CommonJS package; load it as a data: URL so this works on
// every supported Node version (Node 20 does not detect ES module syntax in .js files).
const SOURCE = fs.readFileSync(path.join(__dirname, '../public/js/shared/catering-menu.js'), 'utf8');
const load = () => import(`data:text/javascript,${encodeURIComponent(SOURCE)}`);

const defaults = {
  cateringChoiceGroups: [
    { id: 'appetizers', name: 'Appetizers', items: [{ name: 'Hummus' }] },
    { id: 'salads', name: 'Salads', items: [{ name: 'Fattoush' }] }
  ]
};

test('dish lists saved empty before the menu was published are filled from the defaults', async () => {
  const { upgradeCateringMenu } = await load();
  const saved = {
    cateringChoiceGroups: [
      { id: 'appetizers', name: 'Starters', items: [] },
      { id: 'salads', name: 'Salads', items: [{ name: 'Owner salad' }] }
    ]
  };
  const groups = upgradeCateringMenu(saved, defaults);
  assert.equal(groups[0].name, 'Starters', 'the owner’s list name is kept');
  assert.deepEqual(groups[0].items, [{ name: 'Hummus' }]);
  assert.deepEqual(groups[1].items, [{ name: 'Owner salad' }], 'lists the owner filled are untouched');
});

test('after a Back Office save at the current version, empty lists stay empty', async () => {
  const { upgradeCateringMenu, CATERING_MENU_VERSION } = await load();
  const saved = {
    cateringMenuVersion: CATERING_MENU_VERSION,
    cateringChoiceGroups: [{ id: 'appetizers', name: 'Appetizers', items: [] }]
  };
  assert.deepEqual(upgradeCateringMenu(saved, defaults)[0].items, []);
});

test('without saved lists the defaults are used', async () => {
  const { upgradeCateringMenu } = await load();
  assert.equal(upgradeCateringMenu({}, defaults), defaults.cateringChoiceGroups);
});

test('a Back Office save at version 2 keeps an emptied dish list empty after the Arabic upgrade', async () => {
  const { upgradeCateringMenu } = await load();
  const saved = {
    cateringMenuVersion: 2,
    cateringChoiceGroups: [{ id: 'appetizers', name: 'Appetizers', nameAr: 'مقبلات', items: [] }]
  };
  assert.deepEqual(upgradeCateringMenu(saved, defaults)[0].items, []);
});

test('old default Arabic is corrected; Arabic the owner wrote is kept', async () => {
  const { upgradeCateringMenu, upgradeCateringList } = await load();
  const saved = {
    cateringMenuVersion: 2,
    cateringChoiceGroups: [
      {
        id: 'salads',
        name: 'Salads',
        nameAr: 'سلطات',
        items: [
          { name: 'Tabbouleh', nameAr: 'تبوله' },
          { name: 'Fattoush', nameAr: 'فتوش البيت' },
          { name: 'Owner salad', nameAr: 'سلطة الشيف' }
        ]
      }
    ],
    liveStationMenu: [
      {
        id: 'station-real-fillet',
        name: 'Live real fillet station',
        nameAr: 'محطة الريال فيليه الحية',
        options: [
          { label: 'Classic', labelAr: 'كلاسيك', price: 3, unit: 'person' },
          { label: 'Mine', labelAr: 'خياري', price: 4, unit: 'person' }
        ]
      }
    ],
    cateringTypes: [{ id: 'birthday', nameAr: 'ميني بيرثداي', taglineAr: 'شعاري الخاص' }]
  };
  const items = upgradeCateringMenu(saved, defaults)[0].items;
  assert.equal(items[0].nameAr, 'تبّولة');
  assert.equal(items[1].nameAr, 'فتوش البيت', 'changed by the owner, so untouched');
  assert.equal(items[2].nameAr, 'سلطة الشيف');

  const [station] = upgradeCateringList(saved, {}, 'liveStationMenu');
  assert.equal(station.nameAr, 'محطة فيليه اللحم المباشرة');
  assert.equal(station.options[0].labelAr, 'كلاسيكية');
  assert.equal(station.options[1].labelAr, 'خياري');
  assert.equal(station.options[0].price, 3, 'prices are untouched');

  const [type] = upgradeCateringList(saved, {}, 'cateringTypes');
  assert.equal(type.nameAr, 'باقات ميني لأعياد الميلاد');
  assert.equal(type.taglineAr, 'شعاري الخاص');
  assert.equal(saved.liveStationMenu[0].nameAr, 'محطة الريال فيليه الحية', 'the saved config is not mutated');
});

test('after a save at the current version, saved Arabic is used as it is', async () => {
  const { upgradeCateringList, CATERING_MENU_VERSION } = await load();
  const saved = { cateringMenuVersion: CATERING_MENU_VERSION, cateringExtras: [{ id: 'x', nameAr: 'بار' }] };
  assert.equal(upgradeCateringList(saved, {}, 'cateringExtras')[0].nameAr, 'بار');
});

test('missing lists fall back to the defaults and empty lists stay empty', async () => {
  const { upgradeCateringList } = await load();
  const defaultsWithExtras = { cateringExtras: [{ id: 'extra-bar', nameAr: 'ركن المشروبات (بار)' }] };
  assert.equal(upgradeCateringList({}, defaultsWithExtras, 'cateringExtras'), defaultsWithExtras.cateringExtras);
  assert.deepEqual(upgradeCateringList({ cateringExtras: [] }, defaultsWithExtras, 'cateringExtras'), []);
});

test('the published defaults contain no old Arabic and corrections are final', async () => {
  const { correctedArabic } = await load();
  const config = fs.readFileSync(path.join(__dirname, '../public/js/data/site-config.js'), 'utf8');
  for (const [, text] of config.matchAll(/\w+Ar: "([^"]*)"/g)) {
    assert.equal(correctedArabic(text), text, `default "${text}" is still an old string`);
  }
  for (const text of ['حمص', 'محطة الباستا الحية', 'VIP']) {
    const fixed = correctedArabic(text);
    assert.notEqual(fixed, text);
    assert.equal(correctedArabic(fixed), fixed, `"${fixed}" is not upgraded twice`);
  }
});
