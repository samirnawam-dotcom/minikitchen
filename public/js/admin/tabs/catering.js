// Packages tab: everything on the website's catering offer, editable without code.
//   Packages      — siteConfig.eventPackages (event buffets & Birthday Minis): name, price per person,
//                   badge, how many dishes per dish list, what is included, photo
//   Dish lists    — siteConfig.cateringChoiceGroups: the dishes customers pick from ("appetizers")
//   Live stations — siteConfig.liveStationMenu: options priced per person or per kg
//   Trays / Mini bites / Extras — siteConfig.mainCourseTrays, miniBites, cateringExtras
//
// Each card is a small form: rows can be added and removed on the page, and "Save" reads the card
// back into the site config and saves it (PUT /api/site-config). Nothing changes until Save.

import { registerActions } from '../../shared/actions.js';
import { esc } from '../../shared/dom.js';
import { ui, siteList } from '../state.js';
import { registerTab, renderActiveTab, markDirty, confirmDiscard, afterCardSaved } from '../router.js';
import { confirmDialog } from '../ui/modal.js';
import { saveSiteConfig } from '../sync.js';
import { showToast, showError } from '../ui/toast.js';
import { uploadButton } from '../ui/upload.js';

const SUBTABS = [
  { id: 'packages', icon: 'fa-crown', label: 'Packages', key: 'eventPackages' },
  { id: 'groups', icon: 'fa-list-check', label: 'Dish lists', key: 'cateringChoiceGroups' },
  { id: 'stations', icon: 'fa-fire-burner', label: 'Live stations', key: 'liveStationMenu' },
  { id: 'trays', icon: 'fa-bowl-rice', label: 'Main course trays', key: 'mainCourseTrays' },
  { id: 'bites', icon: 'fa-cookie-bite', label: 'Mini bites', key: 'miniBites' },
  { id: 'extras', icon: 'fa-bell-concierge', label: 'Extras', key: 'cateringExtras' }
];

const TYPE_NAMES = { buffet: 'Event buffet', birthday: 'Birthday Mini' };
const list = key => siteList(key);
const newId = prefix => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// ---------------------------------------------------------------------------
// Small form builders. `col` inputs live in repeatable rows, `field` inputs on the card itself.
// ---------------------------------------------------------------------------

const field = (label, name, value, { type = 'text', placeholder = '', dir = '' } = {}) => `
        <label class="bo-pk-field">
          <span>${label}</span>
          <input type="${type}" class="bo-input" data-field="${name}"${type === 'number' ? ' data-type="number" min="0" step="any"' : ''} value="${esc(value ?? '')}" placeholder="${esc(placeholder)}"${dir ? ` dir="${dir}"` : ''} />
        </label>`;

const colInput = (name, value, { type = 'text', placeholder = '', dir = '', label = '' } = {}) =>
  `<input type="${type}" class="bo-input" data-col="${name}"${type === 'number' ? ' data-type="number" min="0" step="any"' : ''} value="${esc(value ?? '')}" placeholder="${esc(placeholder)}" aria-label="${esc(label || placeholder || name)}"${dir ? ` dir="${dir}"` : ''} />`;

const colSelect = (name, value, options, label) =>
  `<select class="bo-select" data-col="${name}" aria-label="${esc(label)}">${options
    .map(
      ([v, text]) => `<option value="${esc(v)}" ${String(value) === String(v) ? 'selected' : ''}>${esc(text)}</option>`
    )
    .join('')}</select>`;

const removeRowButton = () =>
  `<button type="button" class="bo-btn bo-btn-outline bo-pk-x" data-action="pk:row-remove" aria-label="Remove this row" title="Remove this row"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>`;

/** Markup of one row for each kind of repeatable list (also used by "Add row"). */
const ROW_TEMPLATES = {
  dish: (r = {}) => `
          <div class="bo-pk-row bo-pk-row-dish">
            ${colInput('name', r.name, { placeholder: 'English name' })}
            ${colInput('nameAr', r.nameAr, { placeholder: 'الاسم بالعربي', dir: 'rtl', label: 'Arabic name' })}
            ${colInput('desc', r.desc, { placeholder: 'Flavours or details (optional)', label: 'Details (English)' })}
            ${colInput('descAr', r.descAr, { placeholder: 'التفاصيل (اختياري)', dir: 'rtl', label: 'Details (Arabic)' })}
            ${removeRowButton()}
          </div>`,
  choice: (r = {}) => `
          <div class="bo-pk-row bo-pk-row-choice">
            ${colSelect(
              'group',
              r.group,
              list('cateringChoiceGroups').map(g => [g.id, g.name]),
              'Dish list'
            )}
            ${colInput('count', r.count ?? 1, { type: 'number', label: 'How many to choose (0 = selection included)' })}
            ${removeRowButton()}
          </div>`,
  option: (r = {}) => `
          <div class="bo-pk-row bo-pk-row-option">
            ${colInput('label', r.label, { placeholder: 'e.g. Classic' })}
            ${colInput('labelAr', r.labelAr, { placeholder: 'بالعربي', dir: 'rtl', label: 'Arabic label' })}
            ${colInput('price', r.price, { type: 'number', placeholder: 'Price $', label: 'Price in USD' })}
            ${colSelect(
              'unit',
              r.unit || 'person',
              [
                ['person', 'per person'],
                ['kg', 'per kg']
              ],
              'Priced'
            )}
            ${removeRowButton()}
          </div>`,
  tray: (r = {}) => `
          <div class="bo-pk-row bo-pk-row-tray">
            <input type="hidden" data-col="id" value="${esc(r.id || '')}" />
            ${colInput('name', r.name, { placeholder: 'English name' })}
            ${colInput('nameAr', r.nameAr, { placeholder: 'الاسم بالعربي', dir: 'rtl', label: 'Arabic name' })}
            ${colInput('price', r.price, { type: 'number', placeholder: 'Price $', label: 'Price in USD' })}
            ${colInput('serves', r.serves ?? '30–40 people', { placeholder: 'Serves', label: 'Serves' })}
            ${removeRowButton()}
          </div>`,
  bite: (r = {}) => `
          <div class="bo-pk-row bo-pk-row-bite">
            <input type="hidden" data-col="id" value="${esc(r.id || '')}" />
            ${colInput('name', r.name, { placeholder: 'English name' })}
            ${colInput('nameAr', r.nameAr, { placeholder: 'الاسم بالعربي', dir: 'rtl', label: 'Arabic name' })}
            ${colInput('desc', r.desc, { placeholder: 'Short description (optional)', label: 'Description' })}
            ${colInput('price', r.price, { type: 'number', placeholder: 'Price $', label: 'Price in USD' })}
            ${colInput('unit', r.unit, { placeholder: 'Unit, e.g. dozen', label: 'Unit (optional)' })}
            ${removeRowButton()}
          </div>`,
  extra: (r = {}) => `
          <div class="bo-pk-row bo-pk-row-2">
            <input type="hidden" data-col="id" value="${esc(r.id || '')}" />
            ${colInput('name', r.name, { placeholder: 'English name' })}
            ${colInput('nameAr', r.nameAr, { placeholder: 'الاسم بالعربي', dir: 'rtl', label: 'Arabic name' })}
            ${removeRowButton()}
          </div>`
};

const ROW_HEADERS = {
  dish: ['English', 'Arabic', 'Details', 'Details (Arabic)'],
  choice: ['Dish list', 'How many'],
  option: ['Option', 'Arabic', 'Price $', 'Priced'],
  tray: ['English', 'Arabic', 'Price $', 'Serves'],
  bite: ['English', 'Arabic', 'Description', 'Price $', 'Unit'],
  extra: ['English', 'Arabic']
};

/** A repeatable list of rows plus its "Add" button. */
function rowsBlock(name, kind, rows, addLabel) {
  return `
        <div class="bo-pk-rows-wrap">
          <div class="bo-pk-row bo-pk-row-head bo-pk-row-${kind === 'extra' ? '2' : kind}">${ROW_HEADERS[kind].map(h => `<span>${h}</span>`).join('')}<span></span></div>
          <div class="bo-pk-rows" data-rows="${name}" data-kind="${kind}">
            ${rows.map(r => ROW_TEMPLATES[kind](r)).join('')}
          </div>
          <button type="button" class="bo-btn bo-btn-outline bo-pk-add" data-action="pk:row-add" data-rows="${name}"><i class="fa-solid fa-plus"></i> ${addLabel}</button>
        </div>`;
}

const cardActions = (saveLabel, { deletable = true } = {}) => `
        <div class="bo-pk-actions">
          <button type="button" class="bo-btn bo-btn-primary" data-action="pk:save" data-save-button><i class="fa-solid fa-check" aria-hidden="true"></i> ${saveLabel}</button>
          <span class="bo-save-state">Unsaved changes</span>
          ${deletable ? `<button type="button" class="bo-btn bo-btn-danger" data-action="pk:delete"><i class="fa-solid fa-trash" aria-hidden="true"></i> Delete</button>` : ''}
        </div>`;

// ---------------------------------------------------------------------------
// Cards per sub-tab
// ---------------------------------------------------------------------------

function packageCard(p, idx) {
  const imgId = `pkImg${idx}`;
  return `
      <div class="bo-pk-card" data-dirty-scope data-list="eventPackages" data-index="${idx}">
        <div class="bo-pk-card-head">
          <img src="${esc(p.img)}" alt="" class="bo-pk-thumb" data-fallback="" />
          <div>
            <div class="bo-pk-kicker">${esc(TYPE_NAMES[p.type] || 'Package')}</div>
            <div class="bo-pk-title">${esc(p.name)} · $${esc(p.pricePerPerson)} per person</div>
          </div>
        </div>
        <div class="bo-pk-grid">
          ${field('Name (English)', 'name', p.name)}
          ${field('Name (Arabic)', 'nameAr', p.nameAr, { dir: 'rtl' })}
          <label class="bo-pk-field">
            <span>Type of package</span>
            <select class="bo-select" data-field="type">
              <option value="buffet" ${p.type === 'buffet' ? 'selected' : ''}>Event buffet (weddings &amp; occasions)</option>
              <option value="birthday" ${p.type === 'birthday' ? 'selected' : ''}>Birthday Mini</option>
            </select>
          </label>
          ${field('Price per person ($)', 'pricePerPerson', p.pricePerPerson, { type: 'number' })}
          ${field('Badge (optional)', 'badge', p.badge, { placeholder: 'e.g. Ideal for weddings' })}
          ${field('Short note (optional)', 'note', p.note)}
        </div>
        <div class="bo-pk-section-label">What the customer chooses <small>(0 = “selection of …” included, nothing to choose)</small></div>
        ${rowsBlock('choices', 'choice', p.choices || [], 'Add a dish list')}
        <label class="bo-pk-field">
          <span>Also included <small>(one per line, e.g. Live pasta station)</small></span>
          <textarea class="bo-textarea" rows="2" data-field="includes" data-type="lines">${esc((p.includes || []).join('\n'))}</textarea>
        </label>
        <label class="bo-pk-field">
          <span>Photo <small>(paste a link or upload from your device)</small></span>
          <span class="bo-pk-photo">
            <input type="text" id="${imgId}" class="bo-input" data-field="img" value="${esc(p.img)}" placeholder="Photo link or upload" />
            ${uploadButton(imgId, { compact: true, label: '' })}
          </span>
        </label>
        ${cardActions('Save package')}
      </div>`;
}

function groupCard(g, idx) {
  const used = list('eventPackages').filter(p => (p.choices || []).some(c => c.group === g.id));
  return `
      <div class="bo-pk-card" data-dirty-scope data-list="cateringChoiceGroups" data-index="${idx}">
        <div class="bo-pk-grid">
          ${field('List name (English)', 'name', g.name, { placeholder: 'e.g. Appetizers' })}
          ${field('List name (Arabic)', 'nameAr', g.nameAr, { dir: 'rtl' })}
        </div>
        <div class="bo-pk-section-label">Dishes (${(g.items || []).length}) <small>${used.length ? `used by ${used.map(p => `${esc(TYPE_NAMES[p.type] || '')} ${esc(p.name)}`).join(', ')}` : 'not used by any package'}</small></div>
        ${(g.items || []).length === 0 ? '<p class="bo-pk-hint">No dishes yet — the website says the team will confirm the options. Add dishes to let customers choose.</p>' : ''}
        ${rowsBlock('items', 'dish', g.items || [], 'Add a dish')}
        ${cardActions('Save dish list')}
      </div>`;
}

function stationCard(st, idx) {
  return `
      <div class="bo-pk-card" data-dirty-scope data-list="liveStationMenu" data-index="${idx}">
        <div class="bo-pk-grid">
          ${field('Station name (English)', 'name', st.name)}
          ${field('Station name (Arabic)', 'nameAr', st.nameAr, { dir: 'rtl' })}
        </div>
        <div class="bo-pk-section-label">Options &amp; prices</div>
        ${rowsBlock('options', 'option', st.options || [], 'Add an option')}
        ${cardActions('Save station')}
      </div>`;
}

/** Trays, mini bites and extras: one table for the whole list. */
function wholeListCard(key, kind, addLabel, hint) {
  return `
      <div class="bo-pk-card bo-pk-card-wide" data-dirty-scope data-list="${key}" data-whole="1">
        ${hint ? `<p class="bo-pk-hint">${hint}</p>` : ''}
        ${rowsBlock('rows', kind, list(key), addLabel)}
        ${cardActions('Save list', { deletable: false })}
      </div>`;
}

function cardsOrEmpty(key, cardFn, emptyText) {
  const items = list(key);
  if (items.length === 0) {
    return `<div class="bo-empty"><i class="fa-solid fa-box-open" aria-hidden="true"></i><div class="bo-empty-title">Nothing here yet</div><p>${emptyText}</p></div>`;
  }
  return `<div class="bo-pk-cards">${items.map(cardFn).join('')}</div>`;
}

function subtabBody(sub) {
  if (sub === 'groups') {
    return `<p class="bo-pk-intro">The dishes customers pick from inside a package. Lists without dishes show “our team will confirm the options”.</p>
      ${cardsOrEmpty('cateringChoiceGroups', groupCard, 'Press “Add a dish list” to create one (for example Appetizers).')}`;
  }
  if (sub === 'stations') {
    return `<p class="bo-pk-intro">Live stations customers can add to any package. Per-person prices are multiplied by the number of guests; per-kg prices by the kilos they ask for.</p>
      ${cardsOrEmpty('liveStationMenu', stationCard, 'Press “Add a live station” to offer one on the website.')}`;
  }
  if (sub === 'trays')
    return wholeListCard(
      'mainCourseTrays',
      'tray',
      'Add a tray',
      'Main course trays (each serves 30–40 people). Prices in USD.'
    );
  if (sub === 'bites') {
    return wholeListCard(
      'miniBites',
      'bite',
      'Add a mini bite',
      'La2mi La2mi mini bites. “Unit” is optional (e.g. dozen, piece, box) and shows next to the price.'
    );
  }
  if (sub === 'extras') {
    return wholeListCard(
      'cateringExtras',
      'extra',
      'Add an extra',
      'Services offered on request — they have no price on the website.'
    );
  }
  return `<p class="bo-pk-intro">Event buffets and Birthday Mini packages, priced per person. Customers choose the number of dishes you set here from the <b>Dish lists</b>. Each card saves on its own — press its Save button after editing.</p>
      ${cardsOrEmpty('eventPackages', packageCard, 'Press “Add a package” to put your first catering package on the website.')}`;
}

const ADD_BUTTONS = {
  packages: 'Add a package',
  groups: 'Add a dish list',
  stations: 'Add a live station'
};

function render() {
  const sub = SUBTABS.some(t => t.id === ui.cateringSubTab) ? ui.cateringSubTab : 'packages';
  return `
    <div class="bo-panel">
      <div class="bo-panel-header">
        <div class="bo-pill-tabs" role="group" aria-label="Section">
          ${SUBTABS.map(
            t => `
          <button type="button" class="bo-pill-tab ${sub === t.id ? 'active' : ''}" data-action="catering:subtab" data-subtab="${t.id}" aria-pressed="${sub === t.id}">
            <i class="fa-solid ${t.icon}" aria-hidden="true"></i> ${t.label} <span class="bo-pill-count">${list(t.key).length}</span>
          </button>`
          ).join('')}
        </div>
        ${ADD_BUTTONS[sub] ? `<button type="button" class="bo-btn bo-btn-gold" data-action="pk:add" data-subtab="${sub}"><i class="fa-solid fa-plus" aria-hidden="true"></i> ${ADD_BUTTONS[sub]}</button>` : ''}
      </div>
      <div class="bo-panel-body">
        ${subtabBody(sub)}
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Reading a card back and saving
// ---------------------------------------------------------------------------

function readValue(input) {
  const raw = input.value.trim();
  if (input.dataset.type === 'number') return Math.max(0, Number(raw) || 0);
  if (input.dataset.type === 'lines') {
    return raw
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
  }
  return raw;
}

const ID_PREFIX = { mainCourseTrays: 'tray', miniBites: 'bite', cateringExtras: 'extra' };

function readRows(container, listKey) {
  return [...container.querySelectorAll(':scope > .bo-pk-row')]
    .map(row => {
      const out = {};
      for (const input of row.querySelectorAll('[data-col]')) out[input.dataset.col] = readValue(input);
      return out;
    })
    .filter(r => (r.name ?? r.label ?? r.group ?? '') !== '')
    .map(r => ('id' in r && !r.id ? { ...r, id: newId(ID_PREFIX[listKey] || 'item') } : r));
}

/** Copies the card's inputs onto `target` (fields on the card, rows into arrays). */
function readCard(card, target) {
  for (const input of card.querySelectorAll('[data-field]')) target[input.dataset.field] = readValue(input);
  for (const rows of card.querySelectorAll('.bo-pk-rows[data-rows]'))
    target[rows.dataset.rows] = readRows(rows, card.dataset.list);
  return target;
}

async function saveCard(button) {
  const card = button.closest('.bo-pk-card');
  if (!card) return;
  const key = card.dataset.list;
  const items = list(key);

  if (card.dataset.whole) {
    const before = items.slice();
    const rows = readRows(card.querySelector('.bo-pk-rows[data-rows]'), key);
    items.splice(0, items.length, ...rows);
    if (!(await saveSiteConfig())) {
      items.splice(0, items.length, ...before);
      return;
    }
    afterCardSaved(card);
    showToast(`Saved — ${rows.length} row${rows.length === 1 ? '' : 's'} now on the website.`);
    return;
  }

  const item = items[Number(card.dataset.index)];
  if (!item) return;
  const edited = readCard(card, structuredClone(item));
  if (!edited.name) {
    showError('Please give it an English name before saving.');
    return;
  }
  const before = structuredClone(item);
  Object.assign(item, edited);
  if (!(await saveSiteConfig())) {
    Object.assign(item, before);
    return;
  }
  afterCardSaved(card);
  showToast(`Saved “${item.name}” — the website is updated.`);
}

async function deleteCard(button) {
  const card = button.closest('.bo-pk-card');
  const key = card?.dataset.list;
  const items = key ? list(key) : [];
  const idx = Number(card?.dataset.index);
  const item = items[idx];
  if (!item) return;
  let question = `“${item.name}” will be removed from the website. This cannot be undone.`;
  if (key === 'cateringChoiceGroups') {
    const used = list('eventPackages').filter(p => (p.choices || []).some(c => c.group === item.id));
    if (used.length) question += `\n\nIt is used by ${used.length} package(s); they will no longer show it.`;
  }
  if (!(await confirmDialog(question, { title: 'Delete from the website?', confirmLabel: 'Delete' }))) return;
  if (!(await confirmDiscard())) return;
  items.splice(idx, 1);
  if (!(await saveSiteConfig())) {
    items.splice(idx, 0, item);
    return;
  }
  renderActiveTab();
  showToast('Deleted.');
}

const NEW_ITEMS = {
  packages: () => ({
    key: 'eventPackages',
    item: {
      id: newId('pkg'),
      type: 'buffet',
      name: 'New package',
      nameAr: '',
      pricePerPerson: 0,
      badge: '',
      note: '',
      choices: [],
      includes: [],
      img: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1000&q=85'
    }
  }),
  groups: () => ({
    key: 'cateringChoiceGroups',
    item: { id: newId('list'), name: 'New dish list', nameAr: '', items: [] }
  }),
  stations: () => ({
    key: 'liveStationMenu',
    item: {
      id: newId('station'),
      name: 'New live station',
      nameAr: '',
      options: [{ label: 'Classic', labelAr: '', price: 0, unit: 'person' }]
    }
  })
};

/** Adds a new item at the end and saves it, so it can be edited like the others. */
async function addItem(sub) {
  const make = NEW_ITEMS[sub];
  if (!make || !(await confirmDiscard())) return;
  const { key, item } = make();
  const items = list(key);
  items.push(item);
  if (!(await saveSiteConfig())) {
    items.pop();
    return;
  }
  renderActiveTab();
  showToast(`Added "${item.name}" at the bottom — edit it and press Save.`);
  document
    .querySelector('.bo-pk-cards > .bo-pk-card:last-child')
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

registerActions({
  'catering:subtab': async el => {
    if (!(await confirmDiscard())) return;
    ui.cateringSubTab = el.dataset.subtab;
    renderActiveTab();
  },
  'pk:save': el => saveCard(el),
  'pk:delete': el => deleteCard(el),
  'pk:add': el => addItem(el.dataset.subtab),
  // Rows are added and removed on the page only; "Save" stores them.
  'pk:row-add': el => {
    const rows = el.closest('.bo-pk-rows-wrap')?.querySelector('.bo-pk-rows[data-rows]');
    if (!rows) return;
    // An empty row is not a change yet (empty rows are dropped on save); typing in it marks the card.
    rows.insertAdjacentHTML('beforeend', ROW_TEMPLATES[rows.dataset.kind]());
    rows.lastElementChild?.querySelector('input:not([type="hidden"]), select')?.focus();
  },
  'pk:row-remove': el => {
    markDirty(el);
    el.closest('.bo-pk-row')?.remove();
  }
});

registerTab('catering', {
  title: 'Catering packages',
  subtitle: 'Everything customers can choose in the website’s package builder.',
  render
});
