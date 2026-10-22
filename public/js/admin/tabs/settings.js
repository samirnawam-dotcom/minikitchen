// Settings tab: public website theme, delivery zones and promo codes, WhatsApp numbers,
// location / hours / LBP rate, and the factory reset.

import { registerActions } from '../../shared/actions.js';
import { esc, byId } from '../../shared/dom.js';
import { getItem, setItem } from '../../shared/storage.js';
import { data, KEYS, siteList, setLbpRate, clearContentCache } from '../state.js';
import { api } from '../api.js';
import { registerTab, renderActiveTab } from '../router.js';
import { saveSiteConfig, refreshFromServer } from '../sync.js';
import { openModal, closeModal, modalFormButtons } from '../ui/modal.js';
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
      <div style="display:flex; gap:8px; align-items:center; ${ROW} padding:10px 12px;">
        <input type="text" class="bo-input" id="zone-name-${idx}" value="${esc(z.name)}" style="flex:1; font-size:0.82rem; font-weight:700;" aria-label="Zone name" />
        <input type="number" step="0.5" class="bo-input" id="zone-fee-${idx}" value="${Number(z.feeUsd) || 0}" style="width:76px; font-weight:800; text-align:right;" title="Delivery Fee USD" aria-label="Delivery fee in USD" />
        <span style="font-size:0.78rem; font-weight:700; color:var(--bo-muted);">USD</span>
      </div>`
    )
    .join('');
}

function promosHtml() {
  return promos()
    .map((p, idx) => {
      const active = p.active !== false;
      return `
      <div style="display:flex; justify-content:space-between; align-items:center; ${ROW} padding:10px 14px;">
        <div>
          <div style="font-weight:800; font-size:0.9rem; color:var(--bo-gold-dark);">${esc(p.code)} <span style="font-size:0.72rem; color:${active ? '#16a34a' : '#dc2626'};">(${active ? 'ACTIVE' : 'PAUSED'})</span></div>
          <div style="font-size:0.78rem; color:var(--bo-muted);">${esc(p.label)} • Min $${Number(p.minOrderUsd) || 0}</div>
        </div>
        <div style="display:flex; gap:6px;">
          <button type="button" class="bo-btn bo-btn-outline" style="padding:5px 9px; font-size:0.72rem;" data-action="settings:promo-toggle" data-index="${idx}">
            ${active ? 'Pause' : 'Enable'}
          </button>
          <button type="button" class="bo-btn bo-btn-danger" style="padding:5px 9px; font-size:0.72rem;" data-action="settings:promo-delete" data-index="${idx}" aria-label="Delete promo code">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>`;
    })
    .join('');
}

function render() {
  const c = data.siteConfig;
  const siteTheme = getItem(KEYS.siteTheme) || c.defaultTheme || 'light';
  const contacts = c.contacts;
  return `
    <form data-on-submit="settings:save">
      <div class="bo-panel">
        <div class="bo-panel-header">
          <div class="bo-panel-title"><i class="fa-solid fa-circle-half-stroke" style="color:var(--bo-gold);"></i> Website Theme & Appearance (Dark / Light Mode)</div>
          <button type="submit" class="bo-btn bo-btn-gold"><i class="fa-solid fa-floppy-disk"></i> Save All Website Settings</button>
        </div>
        <div class="bo-panel-body">
          <div class="bo-form-grid">
            <div class="bo-form-group">
              <label for="setDefaultTheme">Default Public Website Theme</label>
              <select id="setDefaultTheme" class="bo-select">
                <option value="light" ${siteTheme === 'light' ? 'selected' : ''}>☀️ Light Mode — Warm Alabaster & Champagne Gold</option>
                <option value="dark" ${siteTheme === 'dark' ? 'selected' : ''}>🌙 Dark Mode — Obsidian & Luminous Gold</option>
              </select>
            </div>
            <div class="bo-form-group">
              <label>Quick Preview Website in Selected Mode</label>
              <div style="display:flex; gap:10px;">
                <button type="button" class="bo-btn bo-btn-outline" style="flex:1;" data-action="settings:preview-theme" data-theme="light">
                  <i class="fa-solid fa-sun"></i> Activate Light Mode
                </button>
                <button type="button" class="bo-btn bo-btn-primary" style="flex:1;" data-action="settings:preview-theme" data-theme="dark">
                  <i class="fa-solid fa-moon"></i> Activate Dark Mode
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bo-panel">
        <div class="bo-panel-header">
          <div>
            <div class="bo-panel-title"><i class="fa-solid fa-motorcycle" style="color:var(--bo-terracotta);"></i> Aley Delivery Zone Fee Calculator & Promo Codes</div>
            <div style="font-size:0.8rem; color:var(--bo-muted);">Control delivery fees by town and manage discount promo codes inside the customer WhatsApp Order Cart</div>
          </div>
        </div>
        <div class="bo-panel-body">
          <div style="font-size:0.76rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted); margin-bottom:10px;">1. Delivery Zones & Fees (USD $)</div>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:10px; margin-bottom:20px;">
            ${zonesHtml()}
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
            <div style="font-size:0.76rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted);">2. Active Promo & Discount Codes</div>
            <button type="button" class="bo-btn bo-btn-outline" style="padding:6px 12px; font-size:0.76rem;" data-action="settings:promo-open">
              <i class="fa-solid fa-plus"></i> + Add Promo Code
            </button>
          </div>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:10px;">
            ${promosHtml()}
          </div>
        </div>
      </div>

      <div class="bo-panel">
        <div class="bo-panel-header">
          <div class="bo-panel-title"><i class="fa-brands fa-whatsapp" style="color:var(--bo-wa);"></i> Multi-Brand WhatsApp Numbers & Contact Lines</div>
        </div>
        <div class="bo-panel-body">
          <div class="bo-form-grid">
            ${field('setCatWa', '1. Catering WhatsApp Number (Digits Only)', contacts.catering.whatsappNumber)}
            ${field('setCatPhone', '1. Catering Display Phone', contacts.catering.phoneDisplay)}
            ${field('setRestoWa', '2. Restaurant WhatsApp Number (Digits Only)', contacts.restaurant.whatsappNumber)}
            ${field('setRestoPhone', '2. Restaurant Display Phone', contacts.restaurant.phoneDisplay)}
            ${field('setDelivWa', '3. Delivery WhatsApp Number (Digits Only)', contacts.delivery.whatsappNumber)}
            ${field('setDelivPhone', '3. Delivery Display Phone', contacts.delivery.phoneDisplay)}
          </div>
        </div>
      </div>

      <div class="bo-panel">
        <div class="bo-panel-header">
          <div class="bo-panel-title"><i class="fa-solid fa-location-dot" style="color:var(--bo-gold);"></i> Location, Opening Hours, LBP Rate & Delivery Areas</div>
        </div>
        <div class="bo-panel-body">
          <div class="bo-form-grid">
            ${field('setLbpRate', 'USD to LBP Exchange Rate (1 USD = L.L.)', data.lbpRate, 'number', 'step="500"')}
            ${field('setHours', 'Opening Hours', c.location.hours)}
            ${field('setLocShort', 'Short Location Label', c.location.short)}
            ${field('setInsta', 'Instagram URL', c.socials.instagram)}
          </div>
          <div style="margin-top:14px;">${field('setLocFull', 'Full Address', c.location.full)}</div>
          <div style="margin-top:14px;">${field('setDelivAreas', 'Delivery Areas (Comma separated)', (c.deliveryAreas || []).join(', '))}</div>
          <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <button type="button" class="bo-btn bo-btn-danger" data-action="settings:reset-defaults">
              <i class="fa-solid fa-rotate-left"></i> Reset Website Content to Factory Defaults
            </button>
            <button type="submit" class="bo-btn bo-btn-gold">
              <i class="fa-solid fa-floppy-disk"></i> Save All Settings to Live Website
            </button>
          </div>
        </div>
      </div>
    </form>
  `;
}

async function saveSettings() {
  const c = data.siteConfig;
  const before = JSON.stringify(c);
  const previousRate = data.lbpRate;
  const value = id => byId(id).value.trim();

  const theme = byId('setDefaultTheme')?.value === 'dark' ? 'dark' : 'light';
  c.defaultTheme = theme;
  setItem(KEYS.siteTheme, theme);

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
  showToast('All website settings, delivery zones, promo codes & LBP rate saved!');
}

async function togglePromo(idx) {
  const p = promos()[idx];
  if (!p) return;
  p.active = p.active === false;
  const saved = await saveSiteConfig();
  if (!saved) p.active = !p.active;
  renderActiveTab();
  if (saved) showToast(`Promo code ${p.code} is now ${p.active ? 'ACTIVE' : 'PAUSED'}.`);
}

async function deletePromo(idx) {
  const list = promos();
  if (!list[idx]) return;
  if (!window.confirm(`Delete promo code ${list[idx].code}?`)) return;
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
    'Create New Promo / Discount Code',
    `
      <form data-on-submit="settings:promo-submit">
        <div class="bo-form-grid">
          <div class="bo-form-group">
            <label for="newPromoCode">Promo Code (Uppercase) *</label>
            <input type="text" id="newPromoCode" class="bo-input" placeholder="e.g., SUMMER20" style="text-transform:uppercase; font-weight:800;" required />
          </div>
          <div class="bo-form-group">
            <label for="newPromoType">Discount Type *</label>
            <select id="newPromoType" class="bo-select">
              <option value="percent">Percentage Discount (%)</option>
              <option value="fixed">Fixed USD Amount ($)</option>
            </select>
          </div>
          <div class="bo-form-group">
            <label for="newPromoVal">Discount Value *</label>
            <input type="number" step="0.5" min="0" id="newPromoVal" class="bo-input" placeholder="e.g., 15" required />
          </div>
          <div class="bo-form-group">
            <label for="newPromoMin">Minimum Order (USD $)</label>
            <input type="number" step="1" min="0" id="newPromoMin" class="bo-input" value="20" />
          </div>
        </div>
        <div class="bo-form-group" style="margin-top:14px;">
          <label for="newPromoLabel">Display Label *</label>
          <input type="text" id="newPromoLabel" class="bo-input" placeholder="e.g., 15% OFF Summer Special" required />
        </div>
        ${modalFormButtons('Save Promo Code')}
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
  showToast(`Added promo code ${code}!`);
}

async function resetToDefaults() {
  if (
    !window.confirm(
      'Reset ALL website content (menu, packages, galleries, settings, SEO) to the factory defaults? Orders are kept. This cannot be undone.'
    )
  ) {
    return;
  }
  try {
    await api.reset('all');
  } catch (err) {
    showError(`Reset failed: ${err.message}`);
    return;
  }
  clearContentCache();
  setLbpRate(null);
  await refreshFromServer({ silent: true });
  showToast('Website menus & settings restored to factory defaults.');
}

registerActions({
  'settings:save': () => saveSettings(),
  'settings:preview-theme': el => {
    const theme = el.dataset.theme === 'dark' ? 'dark' : 'light';
    setItem(KEYS.siteTheme, theme);
    const select = byId('setDefaultTheme');
    if (select) select.value = theme;
    showToast(`Website switched to ${theme === 'dark' ? 'Dark' : 'Light'} Mode!`);
  },
  'settings:promo-toggle': el => togglePromo(Number(el.dataset.index)),
  'settings:promo-delete': el => deletePromo(Number(el.dataset.index)),
  'settings:promo-open': () => openAddPromo(),
  'settings:promo-submit': () => submitAddPromo(),
  'settings:reset-defaults': () => resetToDefaults()
});

registerTab('settings', {
  title: 'Website Settings, Dark/Light Theme, WhatsApp Numbers & Currency Rate',
  subtitle: 'Update WhatsApp phone numbers, default website theme, USD to LBP rate, opening hours & delivery areas',
  render
});
