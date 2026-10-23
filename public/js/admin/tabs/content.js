// Content tab: website galleries and team profiles (siteConfig.cateringGallery,
// restaurantGallery, teamMembers, behindTheScenes). Each list stores its fields under slightly
// different names; FIELD_MAP maps the four generic card fields onto them.

import { registerActions } from '../../shared/actions.js';
import { esc, byId } from '../../shared/dom.js';
import { data, ui, siteList } from '../state.js';
import { registerTab, renderActiveTab } from '../router.js';
import { saveSiteConfig } from '../sync.js';
import { openModal, closeModal, modalFormButtons } from '../ui/modal.js';
import { showToast } from '../ui/toast.js';
import { uploadButton } from '../ui/upload.js';

const SUB_TABS = [
  ['cateringGallery', 'Wedding & Catering Gallery'],
  ['restaurantGallery', 'Restaurant & Aley Views'],
  ['teamMembers', 'Chefs & Culinary Team'],
  ['behindTheScenes', 'Behind The Scenes']
];

/** Generic card fields → stored property names, per list. */
const FIELD_MAP = {
  cateringGallery: { title: 'title', tag: 'category', desc: 'caption' },
  restaurantGallery: { title: 'title', tag: 'tag', desc: 'desc' },
  teamMembers: { title: 'name', tag: 'role', desc: 'bio' },
  behindTheScenes: { title: 'title', tag: 'stage', desc: 'desc' }
};

const currentSub = () => (FIELD_MAP[ui.contentSubTab] ? ui.contentSubTab : 'cateringGallery');

// Reading falls back across field names, as the original editor did, so older data still shows.
const readTitle = it => it.title || it.name || '';
const readTag = it => it.category || it.tag || it.role || it.stage || '';
const readDesc = it => it.caption || it.desc || it.bio || '';

function contentCard(it, idx, sub) {
  return `
    <div class="bo-content-card" style="border:1px solid var(--bo-border); border-radius:16px; overflow:hidden; background:#fff; display:flex; flex-direction:column;">
      <img src="${esc(it.img)}" style="width:100%; height:175px; object-fit:cover;" alt="${esc(readTitle(it))}" />
      <div style="padding:14px; display:flex; flex-direction:column; gap:8px; flex:1;">
        <input type="text" class="bo-input" data-field="title" value="${esc(readTitle(it))}" style="font-weight:700;" placeholder="Title / Name" aria-label="Title or name" />
        <input type="text" class="bo-input" data-field="tag" value="${esc(readTag(it))}" style="font-size:0.78rem;" placeholder="Category / Tag / Role" aria-label="Category, tag or role" />
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="text" class="bo-input" id="cnt-img-${idx}" data-field="img" value="${esc(it.img || '')}" style="font-size:0.75rem; flex:1;" placeholder="Image URL" aria-label="Image URL" />
          ${uploadButton(`cnt-img-${idx}`, { label: '', compact: true })}
        </div>
        <textarea class="bo-textarea" data-field="desc" rows="2" style="font-size:0.8rem;" aria-label="Caption or bio">${esc(readDesc(it))}</textarea>
        <div style="display:flex; gap:8px; margin-top:auto; padding-top:6px;">
          <button class="bo-btn bo-btn-primary" style="flex:1;" data-action="content:save" data-sub="${sub}" data-index="${idx}">Save</button>
          <button class="bo-btn bo-btn-danger" data-action="content:delete" data-sub="${sub}" data-index="${idx}" aria-label="Delete item"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>
  `;
}

function render() {
  const sub = currentSub();
  const items = siteList(sub);
  return `
    <div class="bo-panel">
      <div class="bo-panel-header">
        <div class="bo-pill-tabs">
          ${SUB_TABS.map(
            ([key, label]) => `
            <button class="bo-pill-tab ${sub === key ? 'active' : ''}" data-action="content:subtab" data-sub="${key}">
              ${label} (${(Array.isArray(data.siteConfig[key]) ? data.siteConfig[key] : []).length})
            </button>`
          ).join('')}
        </div>
        <button class="bo-btn bo-btn-gold" data-action="content:add-open" data-sub="${sub}">
          <i class="fa-solid fa-plus"></i> + Add Photo / Profile
        </button>
      </div>
      <div class="bo-panel-body">
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap:18px;">
          ${items.map((it, idx) => contentCard(it, idx, sub)).join('')}
        </div>
      </div>
    </div>
  `;
}

/** Builds a stored item for `sub` from generic field values. */
function toStoredItem(sub, { title, tag, desc, img }) {
  const map = FIELD_MAP[sub];
  return { [map.title]: title, [map.tag]: tag, [map.desc]: desc, img };
}

async function saveCard(button) {
  const sub = button.dataset.sub;
  const idx = Number(button.dataset.index);
  const list = siteList(sub);
  const card = button.closest('.bo-content-card');
  if (!FIELD_MAP[sub] || !list[idx] || !card) return;
  const field = name => card.querySelector(`[data-field="${name}"]`)?.value.trim() || '';
  const before = { ...list[idx] };
  Object.assign(
    list[idx],
    toStoredItem(sub, { title: field('title'), tag: field('tag'), desc: field('desc'), img: field('img') })
  );
  if (!(await saveSiteConfig())) {
    list[idx] = before;
    return;
  }
  showToast('Gallery / Team card updated on live website!');
}

async function deleteCard(button) {
  const sub = button.dataset.sub;
  const idx = Number(button.dataset.index);
  const list = siteList(sub);
  if (!list[idx]) return;
  if (!window.confirm(`Remove "${readTitle(list[idx]) || 'this item'}" from the website?`)) return;
  const [removed] = list.splice(idx, 1);
  if (!(await saveSiteConfig())) {
    list.splice(idx, 0, removed);
    return;
  }
  renderActiveTab();
  showToast('Item removed.');
}

function openAddItem(sub) {
  openModal(
    'Add New Photo / Team Profile',
    `
      <form data-on-submit="content:add-submit" data-sub="${sub}">
        <div class="bo-form-grid">
          <div class="bo-form-group">
            <label for="ncTitle">Title or Chef Name *</label>
            <input type="text" id="ncTitle" class="bo-input" required />
          </div>
          <div class="bo-form-group">
            <label for="ncTag">Tag / Category / Role *</label>
            <input type="text" id="ncTag" class="bo-input" placeholder="e.g., Weddings / The View / Head Chef" required />
          </div>
        </div>
        <div class="bo-form-group" style="margin-top:14px;">
          <label for="ncImg">Photo (Paste URL or Upload from Device) *</label>
          <div style="display:flex; gap:8px; align-items:center;">
            <input type="text" id="ncImg" class="bo-input" style="flex:1;" value="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85" required />
            ${uploadButton('ncImg')}
          </div>
        </div>
        <div class="bo-form-group" style="margin-top:14px;">
          <label for="ncDesc">Caption / Bio *</label>
          <textarea id="ncDesc" class="bo-textarea" rows="3" required></textarea>
        </div>
        ${modalFormButtons('Add to Website')}
      </form>
    `
  );
}

async function submitAddItem(form) {
  const sub = form.dataset.sub;
  if (!FIELD_MAP[sub]) return;
  const value = id => byId(id).value.trim();
  const list = siteList(sub);
  list.unshift(
    toStoredItem(sub, { title: value('ncTitle'), tag: value('ncTag'), desc: value('ncDesc'), img: value('ncImg') })
  );
  if (!(await saveSiteConfig())) {
    list.shift();
    return;
  }
  closeModal();
  renderActiveTab();
  showToast('Added new item to website!');
}

registerActions({
  'content:subtab': el => {
    ui.contentSubTab = FIELD_MAP[el.dataset.sub] ? el.dataset.sub : 'cateringGallery';
    renderActiveTab();
  },
  'content:save': el => saveCard(el),
  'content:delete': el => deleteCard(el),
  'content:add-open': el => openAddItem(el.dataset.sub),
  'content:add-submit': form => submitAddItem(form)
});

registerTab('content', {
  title: 'Photos & Team',
  subtitle: '',
  render
});
