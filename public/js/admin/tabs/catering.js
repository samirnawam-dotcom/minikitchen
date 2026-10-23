// Catering tab: event/wedding packages and live cooking stations (siteConfig.cateringPackages /
// siteConfig.liveStations), each with inline editing, delete and an "add" modal.

import { registerActions } from '../../shared/actions.js';
import { esc, byId } from '../../shared/dom.js';
import { ui, siteList } from '../state.js';
import { registerTab, renderActiveTab } from '../router.js';
import { saveSiteConfig } from '../sync.js';
import { openModal, closeModal, modalFormButtons } from '../ui/modal.js';
import { showToast } from '../ui/toast.js';
import { uploadButton } from '../ui/upload.js';

const CARD =
  'border:1px solid var(--bo-border); border-radius:16px; overflow:hidden; background:#fff; display:flex; flex-direction:column;';
const GRID = 'display:grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap:18px;';
const CATEGORY_LABELS = { wedding: 'Wedding Catering', corporate: 'Corporate Events', private: 'Private Parties' };

const packages = () => siteList('cateringPackages');
const stations = () => siteList('liveStations');

function packageCard(p, idx) {
  return `
    <div style="${CARD}" data-index="${idx}" class="bo-catering-card">
      <div style="height:160px; position:relative;">
        <img src="${esc(p.img)}" style="width:100%; height:100%; object-fit:cover;" alt="${esc(p.title)}" />
        <span style="position:absolute; top:10px; left:10px; background:#14171c; color:var(--bo-gold); padding:4px 10px; border-radius:999px; font-size:0.72rem; font-weight:800;">${esc(p.badge)}</span>
        <span style="position:absolute; bottom:10px; right:10px; background:var(--bo-gold); color:#14171c; padding:4px 12px; border-radius:999px; font-weight:800; font-size:0.85rem;">${esc(p.pricePerPerson)}/guest</span>
      </div>
      <div style="padding:16px; flex:1; display:flex; flex-direction:column; gap:8px;">
        <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted);">${esc(p.categoryLabel)} • ${esc(p.minGuests)}</div>
        <input type="text" class="bo-input" data-field="title" value="${esc(p.title)}" style="font-weight:700;" aria-label="Package title" />
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
          <div>
            <label style="font-size:0.68rem; color:var(--bo-muted);">Price / Guest</label>
            <input type="text" class="bo-input" data-field="pricePerPerson" value="${esc(p.pricePerPerson)}" aria-label="Price per guest" />
          </div>
          <div>
            <label style="font-size:0.68rem; color:var(--bo-muted);">Min Guests</label>
            <input type="text" class="bo-input" data-field="minGuests" value="${esc(p.minGuests)}" aria-label="Minimum guests" />
          </div>
        </div>
        <textarea class="bo-textarea" data-field="subtitle" rows="2" style="font-size:0.8rem;" aria-label="Subtitle">${esc(p.subtitle)}</textarea>
        <div style="display:flex; gap:8px; margin-top:auto; padding-top:8px;">
          <button class="bo-btn bo-btn-primary" style="flex:1;" data-action="catering:save-package" data-index="${idx}">Save Changes</button>
          <button class="bo-btn bo-btn-danger" data-action="catering:delete-package" data-index="${idx}" aria-label="Delete package"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>
  `;
}

function stationCard(st, idx) {
  return `
    <div style="${CARD}" data-index="${idx}" class="bo-catering-card">
      <img src="${esc(st.img)}" style="width:100%; height:160px; object-fit:cover;" alt="${esc(st.title)}" />
      <div style="padding:16px; display:flex; flex-direction:column; gap:8px; flex:1;">
        <input type="text" class="bo-input" data-field="tag" value="${esc(st.tag)}" style="font-size:0.75rem; font-weight:700;" aria-label="Badge tag" />
        <input type="text" class="bo-input" data-field="title" value="${esc(st.title)}" style="font-weight:700;" aria-label="Station title" />
        <textarea class="bo-textarea" data-field="desc" rows="3" style="font-size:0.8rem;" aria-label="Description">${esc(st.desc)}</textarea>
        <div style="display:flex; gap:8px; margin-top:auto; padding-top:8px;">
          <button class="bo-btn bo-btn-primary" style="flex:1;" data-action="catering:save-station" data-index="${idx}">Save Station</button>
          <button class="bo-btn bo-btn-danger" data-action="catering:delete-station" data-index="${idx}" aria-label="Delete station"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>
  `;
}

function render() {
  const pkgs = packages();
  const sts = stations();
  const onPackages = ui.cateringSubTab === 'packages';
  return `
    <div class="bo-panel">
      <div class="bo-panel-header">
        <div class="bo-pill-tabs">
          <button class="bo-pill-tab ${onPackages ? 'active' : ''}" data-action="catering:subtab" data-subtab="packages">
            <i class="fa-solid fa-crown"></i> Event & Wedding Packages (${pkgs.length})
          </button>
          <button class="bo-pill-tab ${!onPackages ? 'active' : ''}" data-action="catering:subtab" data-subtab="stations">
            <i class="fa-solid fa-fire-burner"></i> Live Cooking Stations (${sts.length})
          </button>
        </div>
        <button class="bo-btn bo-btn-gold" data-action="${onPackages ? 'catering:package-open' : 'catering:station-open'}">
          <i class="fa-solid fa-plus"></i> ${onPackages ? '+ Add Catering Package' : '+ Add Live Station'}
        </button>
      </div>
      <div class="bo-panel-body">
        <div style="${GRID}">
          ${onPackages ? pkgs.map(packageCard).join('') : sts.map(stationCard).join('')}
        </div>
      </div>
    </div>
  `;
}

/** Copies the card's data-field inputs into the list item, saves, and rolls back on failure. */
async function saveCard(button, list, label) {
  const idx = Number(button.dataset.index);
  const card = button.closest('.bo-catering-card');
  const item = list[idx];
  if (!item || !card) return;
  const before = { ...item };
  for (const input of card.querySelectorAll('[data-field]')) item[input.dataset.field] = input.value.trim();
  if (!(await saveSiteConfig())) {
    Object.assign(item, before);
    return;
  }
  showToast(`Saved ${label} "${item.title}"`);
}

async function deleteCard(button, list, label) {
  const idx = Number(button.dataset.index);
  if (!list[idx]) return;
  if (!window.confirm(`Delete the ${label} "${list[idx].title}"?`)) return;
  const [removed] = list.splice(idx, 1);
  if (!(await saveSiteConfig())) {
    list.splice(idx, 0, removed);
    return;
  }
  renderActiveTab();
  showToast(`${label === 'package' ? 'Package' : 'Live station'} deleted.`);
}

function openAddPackage() {
  openModal(
    'Add New Catering / Wedding Package',
    `
      <form data-on-submit="catering:package-submit">
        <div class="bo-form-grid">
          <div class="bo-form-group">
            <label for="npTitle">Package Title *</label>
            <input type="text" id="npTitle" class="bo-input" placeholder="e.g., Diamond Mountain Wedding Buffet" required />
          </div>
          <div class="bo-form-group">
            <label for="npCat">Category *</label>
            <select id="npCat" class="bo-select">
              <option value="wedding">Wedding Catering</option>
              <option value="corporate">Corporate Events</option>
              <option value="private">Private Parties & Formulas</option>
            </select>
          </div>
          <div class="bo-form-group">
            <label for="npPrice">Price Per Guest *</label>
            <input type="text" id="npPrice" class="bo-input" placeholder="e.g., $40" required />
          </div>
          <div class="bo-form-group">
            <label for="npMin">Minimum Guests *</label>
            <input type="text" id="npMin" class="bo-input" placeholder="e.g., 50+ Guests" required />
          </div>
        </div>
        <div class="bo-form-group" style="margin-top:14px;">
          <label for="npImg">Cover Photo (Paste URL or Upload from Device) *</label>
          <div style="display:flex; gap:8px; align-items:center;">
            <input type="text" id="npImg" class="bo-input" style="flex:1;" value="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=85" required />
            ${uploadButton('npImg')}
          </div>
        </div>
        <div class="bo-form-group" style="margin-top:14px;">
          <label for="npSub">Subtitle *</label>
          <input type="text" id="npSub" class="bo-input" placeholder="Brief summary of the event package..." required />
        </div>
        <div class="bo-form-group" style="margin-top:14px;">
          <label for="npHighlights">Package Highlights (One per line) *</label>
          <textarea id="npHighlights" class="bo-textarea" rows="4" placeholder="Welcome Drink & Canapés&#10;14+ Cold & Hot Lebanese Mezza&#10;Live Charcoal Mixed Grill Station" required></textarea>
        </div>
        ${modalFormButtons('Add Package')}
      </form>
    `
  );
}

async function submitAddPackage() {
  const value = id => byId(id).value.trim();
  const category = value('npCat');
  const pkg = {
    id: `pkg-custom-${Date.now()}`,
    category,
    categoryLabel: CATEGORY_LABELS[category] || 'Event Catering',
    badge: 'New Package',
    title: value('npTitle'),
    subtitle: value('npSub'),
    pricePerPerson: value('npPrice'),
    minGuests: value('npMin'),
    img: value('npImg'),
    highlights: value('npHighlights')
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
  };
  const list = packages();
  list.unshift(pkg);
  if (!(await saveSiteConfig())) {
    list.shift();
    return;
  }
  closeModal();
  renderActiveTab();
  showToast(`Added package "${pkg.title}"!`);
}

function openAddStation() {
  openModal(
    'Add New Live Cooking Station',
    `
      <form data-on-submit="catering:station-submit">
        <div class="bo-form-grid">
          <div class="bo-form-group">
            <label for="nsTitle">Station Title *</label>
            <input type="text" id="nsTitle" class="bo-input" placeholder="e.g., Live Shawarma & Saj Station" required />
          </div>
          <div class="bo-form-group">
            <label for="nsTag">Badge Tag *</label>
            <input type="text" id="nsTag" class="bo-input" placeholder="e.g., Guest Favorite" required />
          </div>
        </div>
        <div class="bo-form-group" style="margin-top:14px;">
          <label for="nsImg">Station Photo (Paste URL or Upload from Device) *</label>
          <div style="display:flex; gap:8px; align-items:center;">
            <input type="text" id="nsImg" class="bo-input" style="flex:1;" value="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=85" required />
            ${uploadButton('nsImg')}
          </div>
        </div>
        <div class="bo-form-group" style="margin-top:14px;">
          <label for="nsDesc">Description *</label>
          <textarea id="nsDesc" class="bo-textarea" rows="3" required></textarea>
        </div>
        ${modalFormButtons('Add Live Station')}
      </form>
    `
  );
}

async function submitAddStation() {
  const value = id => byId(id).value.trim();
  const list = stations();
  list.unshift({ title: value('nsTitle'), tag: value('nsTag'), img: value('nsImg'), desc: value('nsDesc') });
  if (!(await saveSiteConfig())) {
    list.shift();
    return;
  }
  closeModal();
  renderActiveTab();
  showToast('New Live Cooking Station added!');
}

registerActions({
  'catering:subtab': el => {
    ui.cateringSubTab = el.dataset.subtab === 'stations' ? 'stations' : 'packages';
    renderActiveTab();
  },
  'catering:save-package': el => saveCard(el, packages(), 'package'),
  'catering:delete-package': el => deleteCard(el, packages(), 'package'),
  'catering:save-station': el => saveCard(el, stations(), 'station'),
  'catering:delete-station': el => deleteCard(el, stations(), 'station'),
  'catering:package-open': () => openAddPackage(),
  'catering:package-submit': () => submitAddPackage(),
  'catering:station-open': () => openAddStation(),
  'catering:station-submit': () => submitAddStation()
});

registerTab('catering', {
  title: 'Packages',
  subtitle: '',
  render
});
