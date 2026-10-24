// Settings tab: public website theme, delivery zones and promo codes, WhatsApp numbers,
// location / hours / LBP rate, and the factory reset.

import { registerActions } from '../../shared/actions.js';
import { esc, byId } from '../../shared/dom.js';
import { data, siteList, setLbpRate, clearContentCache } from '../state.js';
import { api } from '../api.js';
import { registerTab, renderActiveTab, markSaved, confirmDiscard } from '../router.js';
import { saveSiteConfig, refreshFromServer } from '../sync.js';
import { openModal, closeModal, modalFormButtons, confirmDialog } from '../ui/modal.js';
import { showToast, showError } from '../ui/toast.js';

const zones = () => siteList('deliveryZones', { seedWhenEmpty: true });
const promos = () => siteList('promoCodes');
const ROW = 'background:var(--bo-bg); border:1px solid var(--bo-border); border-radius:10px;';

function field(id, label, value, type = 'text', extra = '') {
  return `
    <div class="bo-form-group">
      <label for="${id}">${label}</label>
      <input type="${type}" id="${id}" class="bo-input" value="${esc(value)}" ${extra} />
    </div>`;
}

function zonesHtml() {
  return zones()
    .map(
      (z, idx) => `
      <div class="bo-zone-row" style="display:flex; gap:8px; align-items:center; ${ROW} padding:8px 10px;">
        <label class="bo-sr-only" for="zone-name-${idx}">Area name</label>
        <input type="text" class="bo-input" id="zone-name-${idx}" value="${esc(z.name)}" style="flex:1; min-width:0; font-weight:600;" />
        <label class="bo-sr-only" for="zone-fee-${idx}">Delivery fee for ${esc(z.name)} in US dollars</label>
        <span class="bo-muted" style="font-weight:700;">$</span>
        <input type="number" step="0.5" min="0" class="bo-input" id="zone-fee-${idx}" value="${Number(z.feeUsd) || 0}" style="width:84px; font-weight:700; text-align:right;" inputmode="decimal" />
      </div>`
    )
    .join('');
}

function promosHtml() {
  const list = promos();
  if (list.length === 0) {
    return '<div class="bo-empty" style="padding:22px;"><div class="bo-empty-title">No promo codes yet</div><p>Add one to offer a discount in the website’s delivery cart.</p></div>';
  }
  return list
    .map((p, idx) => {
      const active = p.active !== false;
      return `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; ${ROW} padding:10px 12px;">
        <div style="min-width:0;">
          <div style="font-weight:700; color:var(--bo-text); display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            ${esc(p.code)}
            <span class="bo-status-pill ${active ? 'bo-status-completed' : 'bo-status-cancelled'}">${active ? 'Active' : 'Paused'}</span>
          </div>
          <div class="bo-muted" style="font-size:0.82rem;">${esc(p.label)} · minimum order $${Number(p.minOrderUsd) || 0}</div>
        </div>
        <div style="display:flex; gap:6px; flex-shrink:0;">
          <button type="button" class="bo-btn bo-btn-outline bo-btn-sm" data-action="settings:promo-toggle" data-index="${idx}">
            ${active ? 'Pause' : 'Turn on'}
          </button>
          <button type="button" class="bo-btn bo-btn-danger bo-btn-sm bo-btn-icon" data-action="settings:promo-delete" data-index="${idx}" aria-label="Delete promo code ${esc(p.code)}" title="Delete">
            <i class="fa-solid fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      </div>`;
    })
    .join('');
}

const saveBar = label => `
  <div class="bo-form-footer">
    <span class="bo-save-state">Unsaved changes</span>
    <button type="submit" class="bo-btn bo-btn-gold" data-save-button style="margin-left:auto;">
      <i class="fa-solid fa-check" aria-hidden="true"></i> ${label}
    </button>
  </div>`;

function render() {
  const c = data.siteConfig;
  const contacts = c.contacts;
  return `
    <form data-on-submit="settings:save" data-dirty-scope style="border:0;">
      <section class="bo-panel">
        <div class="bo-panel-header">
          <div>
            <h2 class="bo-panel-title"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> WhatsApp &amp; phone numbers</h2>
            <div class="bo-panel-sub">Orders from each part of the website go to its own WhatsApp number. Type the WhatsApp number with the country code, digits only (e.g. 96170123456).</div>
          </div>
        </div>
        <div class="bo-panel-body">
          <div class="bo-form-grid">
            ${field('setCatWa', 'Catering — WhatsApp number', contacts.catering.whatsappNumber, 'tel', 'inputmode="numeric"')}
            ${field('setCatPhone', 'Catering — phone shown on the website', contacts.catering.phoneDisplay)}
            ${field('setRestoWa', 'Restaurant — WhatsApp number', contacts.restaurant.whatsappNumber, 'tel', 'inputmode="numeric"')}
            ${field('setRestoPhone', 'Restaurant — phone shown on the website', contacts.restaurant.phoneDisplay)}
            ${field('setDelivWa', 'Delivery — WhatsApp number', contacts.delivery.whatsappNumber, 'tel', 'inputmode="numeric"')}
            ${field('setDelivPhone', 'Delivery — phone shown on the website', contacts.delivery.phoneDisplay)}
          </div>
          ${saveBar('Save settings')}
        </div>
      </section>

      <section class="bo-panel">
        <div class="bo-panel-header">
          <div>
            <h2 class="bo-panel-title"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> Address, hours &amp; exchange rate</h2>
          </div>
        </div>
        <div class="bo-panel-body">
          <div class="bo-form-grid">
            ${field('setHours', 'Opening hours', c.location.hours)}
            ${field('setLocShort', 'Short location (e.g. Ain Al Remmaneh, Aley)', c.location.short)}
            ${field('setLbpRate', 'Exchange rate — L.L. for 1 US dollar', data.lbpRate, 'number', 'step="500" min="1000" inputmode="numeric"')}
            ${field('setInsta', 'Instagram link', c.socials.instagram)}
          </div>
          <div style="margin-top:16px;">${field('setLocFull', 'Full address', c.location.full)}</div>
          <div style="margin-top:16px;">
            ${field('setDelivAreas', 'Areas you deliver to', (c.deliveryAreas || []).join(', '))}
            <div class="bo-help">Separate areas with commas, e.g. Aley, Bhamdoun, Souk El Gharb.</div>
          </div>
          ${saveBar('Save settings')}
        </div>
      </section>

      <section class="bo-panel">
        <div class="bo-panel-header">
          <div>
            <h2 class="bo-panel-title"><i class="fa-solid fa-motorcycle" aria-hidden="true"></i> Delivery fees</h2>
            <div class="bo-panel-sub">The fee added to a delivery order for each area, in US dollars.</div>
          </div>
        </div>
        <div class="bo-panel-body">
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr)); gap:10px;">
            ${zonesHtml()}
          </div>
          ${saveBar('Save settings')}
        </div>
      </section>
    </form>

    <section class="bo-panel">
      <div class="bo-panel-header">
        <div>
          <h2 class="bo-panel-title"><i class="fa-solid fa-tags" aria-hidden="true"></i> Promo codes</h2>
          <div class="bo-panel-sub">Discount codes customers can type in the delivery cart. Changes here save straight away.</div>
        </div>
        <button type="button" class="bo-btn bo-btn-outline" data-action="settings:promo-open">
          <i class="fa-solid fa-plus" aria-hidden="true"></i> Add a promo code
        </button>
      </div>
      <div class="bo-panel-body">
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap:10px;">
          ${promosHtml()}
        </div>
      </div>
    </section>

    <section class="bo-panel" style="border-color:#f0c5bf;">
      <div class="bo-panel-header">
        <div>
          <h2 class="bo-panel-title" style="color:var(--bo-danger);">Start over</h2>
          <div class="bo-panel-sub">Puts the menu, packages, photos, settings and Google texts back to how they were delivered. Orders are kept. Download a backup in Account &amp; backups first.</div>
        </div>
        <button type="button" class="bo-btn bo-btn-danger" data-action="settings:reset-defaults">
          <i class="fa-solid fa-rotate-left" aria-hidden="true"></i> Reset website content
        </button>
      </div>
    </section>
  `;
}

async function saveSettings() {
  const c = data.siteConfig;
  const before = JSON.stringify(c);
  const previousRate = data.lbpRate;
  const value = id => byId(id).value.trim();

  zones().forEach((z, idx) => {
    const name = byId(`zone-name-${idx}`)?.value.trim();
    const fee = parseFloat(byId(`zone-fee-${idx}`)?.value);
    if (name) z.name = name;
    if (Number.isFinite(fee) && fee >= 0) z.feeUsd = fee;
  });

  c.contacts.catering.whatsappNumber = value('setCatWa');
  c.contacts.catering.phoneDisplay = value('setCatPhone');
  c.contacts.restaurant.whatsappNumber = value('setRestoWa');
  c.contacts.restaurant.phoneDisplay = value('setRestoPhone');
  c.contacts.delivery.whatsappNumber = value('setDelivWa');
  c.contacts.delivery.phoneDisplay = value('setDelivPhone');

  data.lbpRate = Number(value('setLbpRate')) || previousRate;
  c.location.hours = value('setHours');
  c.location.short = value('setLocShort');
  c.location.full = value('setLocFull');
  c.socials.instagram = value('setInsta');
  c.deliveryAreas = value('setDelivAreas')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (!(await saveSiteConfig())) {
    data.siteConfig = JSON.parse(before);
    data.lbpRate = previousRate;
    return;
  }
  markSaved(byId('setHours'));
  showToast('Settings saved — the website is updated.');
}

async function togglePromo(idx) {
  const p = promos()[idx];
  if (!p || !(await confirmDiscard())) return;
  p.active = p.active === false;
  const saved = await saveSiteConfig();
  if (!saved) p.active = !p.active;
  renderActiveTab();
  if (saved) showToast(`Promo code ${p.code} is now ${p.active ? 'active' : 'paused'}.`);
}

async function deletePromo(idx) {
  const list = promos();
  if (!list[idx]) return;
  const sure = await confirmDialog(`Customers will no longer be able to use ${list[idx].code}.`, {
    title: 'Delete this promo code?',
    confirmLabel: 'Delete code'
  });
  if (!sure || !(await confirmDiscard())) return;
  const [removed] = list.splice(idx, 1);
  if (!(await saveSiteConfig())) {
    list.splice(idx, 0, removed);
    return;
  }
  renderActiveTab();
  showToast('Promo code removed.');
}

function openAddPromo() {
  openModal(
    'New promo code',
    `
      <form data-on-submit="settings:promo-submit">
        <div class="bo-form-grid">
          <div class="bo-form-group">
            <label for="newPromoCode">Code customers type *</label>
            <input type="text" id="newPromoCode" class="bo-input" placeholder="e.g., SUMMER20" style="text-transform:uppercase; font-weight:800;" required />
          </div>
          <div class="bo-form-group">
            <label for="newPromoType">Type of discount *</label>
            <select id="newPromoType" class="bo-select">
              <option value="percent">Percentage off (%)</option>
              <option value="fixed">Fixed amount off ($)</option>
            </select>
          </div>
          <div class="bo-form-group">
            <label for="newPromoVal">Discount amount *</label>
            <input type="number" step="0.5" min="0" id="newPromoVal" class="bo-input" placeholder="e.g., 15" required />
          </div>
          <div class="bo-form-group">
            <label for="newPromoMin">Minimum order ($)</label>
            <input type="number" step="1" min="0" id="newPromoMin" class="bo-input" value="20" />
          </div>
        </div>
        <div class="bo-form-group" style="margin-top:14px;">
          <label for="newPromoLabel">Text shown to customers *</label>
          <input type="text" id="newPromoLabel" class="bo-input" placeholder="e.g., 15% OFF Summer Special" required />
        </div>
        ${modalFormButtons('Add promo code')}
      </form>
    `
  );
}

async function submitAddPromo() {
  const code = byId('newPromoCode')
    .value.trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '');
  if (!code) {
    showError('Promo code may only contain letters, numbers, "-" and "_".');
    return;
  }
  const list = promos();
  if (list.some(p => String(p.code).toUpperCase() === code)) {
    showError(`Promo code ${code} already exists.`);
    return;
  }
  list.push({
    code,
    type: byId('newPromoType').value === 'fixed' ? 'fixed' : 'percent',
    value: Number(byId('newPromoVal').value) || 10,
    minOrderUsd: Number(byId('newPromoMin').value) || 0,
    label: byId('newPromoLabel').value.trim(),
    active: true
  });
  if (!(await saveSiteConfig())) {
    list.pop();
    return;
  }
  closeModal();
  renderActiveTab();
  showToast(`Promo code ${code} added.`);
}

async function resetToDefaults() {
  const sure = await confirmDialog(
    'This replaces your menu, catering packages, photos, reviews, settings and Google texts with the original versions. Orders are kept.\n\nThis cannot be undone.',
    { title: 'Reset all website content?', confirmLabel: 'Yes, reset everything' }
  );
  if (!sure) return;
  try {
    await api.reset('all');
  } catch (err) {
    showError(`Reset failed: ${err.message}`);
    return;
  }
  clearContentCache();
  setLbpRate(null);
  await refreshFromServer({ silent: true });
  showToast('Website content is back to the original version.');
}

registerActions({
  'settings:save': () => saveSettings(),
  'settings:promo-toggle': el => togglePromo(Number(el.dataset.index)),
  'settings:promo-delete': el => deletePromo(Number(el.dataset.index)),
  'settings:promo-open': () => openAddPromo(),
  'settings:promo-submit': () => submitAddPromo(),
  'settings:reset-defaults': () => resetToDefaults()
});

registerTab('settings', {
  title: 'Settings',
  subtitle: 'Contact numbers, address, delivery fees and promo codes used on the website.',
  render
});
