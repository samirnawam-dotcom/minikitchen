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
