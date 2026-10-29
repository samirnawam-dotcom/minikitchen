// Content tab: home slideshow, website galleries and team profiles (siteConfig.heroPhotos, cateringGallery,
// restaurantGallery, teamMembers, behindTheScenes), plus the page banners (siteConfig.banners: per page
// an optional photo and eyebrow / title / text in English and Arabic; empty = the built-in one). Each list stores its fields under slightly
// different names; FIELD_MAP maps the four generic card fields onto them.

import { registerActions } from '../../shared/actions.js';
import { esc, byId } from '../../shared/dom.js';
import { data, ui, siteList } from '../state.js';
import { registerTab, renderActiveTab, afterCardSaved, confirmDiscard } from '../router.js';
import { saveSiteConfig } from '../sync.js';
import { openModal, closeModal, modalFormButtons, confirmDialog } from '../ui/modal.js';
import { showToast } from '../ui/toast.js';
import { uploadButton } from '../ui/upload.js';

const SUB_TABS = [
  ['heroPhotos', 'Home slideshow'],
  ['cateringGallery', 'Catering photos'],
  ['restaurantGallery', 'Restaurant photos'],
  ['teamMembers', 'Team'],
  ['behindTheScenes', 'Behind the scenes'],
  ['pageBanners', 'Page banners']
];

/** The banner at the top of each page with its built-in English text and photo (null = no photo field). */
const BANNERS = [
  {
    page: 'home',
    name: 'Home',
    photo: null,
    eyebrow: 'Mini Kitchen Catering · Aley, Lebanon',
    title: 'Catering for weddings, birthdays & every occasion',
    text: 'Event buffets, Birthday Mini packages, live stations and main course trays — priced per person, anywhere in Lebanon.'
  },
  {
    page: 'packages',
    name: 'Packages & menus',
    photo: 'images/pages/packages.webp',
    eyebrow: 'Mini Kitchen Catering · Packages',
    title: 'Packages & menus',
    text: 'Event buffets and Birthday Minis priced per person, plus live stations, main course trays and mini bites.'
  },
  {
    page: 'restaurant',
    name: 'Restaurant',
    photo: 'images/pages/restaurant.webp',
    eyebrow: 'Mini Kitchen Restaurant · Ain Al Remmaneh',
    title: 'Mountain views & honest food',
    text: 'Lebanese breakfast, charcoal grills, burgers and pizza on our terrace in Aley — every day from 8:00 AM to 10:00 PM.'
  },
  {
    page: 'delivery',
    name: 'Delivery',
    photo: 'images/pages/delivery.webp',
    eyebrow: 'Mini Kitchen Delivery · Aley',
    title: 'Order online, send on WhatsApp',
    text: 'Delivering to (your delivery areas) and nearby, daily from 8:00 AM to 10:00 PM.'
  },
  {
    page: 'about',
    name: 'About us',
    photo: 'images/pages/about.webp',
    eyebrow: 'About Mini Kitchen',
    title: 'A family kitchen in the mountains of Aley',
    text: 'A catering kitchen first — buffets, birthdays and live stations for your events — with our restaurant terrace and delivery on the side.'
  },
  {
    page: 'contact',
    name: 'Contact',
    photo: '',
    eyebrow: 'Contact',
    title: 'Talk to the right team',
    text: 'Catering and weddings, a table at the restaurant, or a delivery order — we answer on WhatsApp and by phone.'
  }
];
const BANNER_KEYS = ['eyebrow', 'eyebrowAr', 'title', 'titleAr', 'text', 'textAr', 'img'];
const banners = () => {
  const b = data.siteConfig.banners;
  if (!b || typeof b !== 'object' || Array.isArray(b)) data.siteConfig.banners = {};
  return data.siteConfig.banners;
};

/** Field labels per list (team members have a name / role / bio instead of title / tag / caption). */
const LABELS = {
  teamMembers: { title: 'Name', tag: 'Role (e.g. Head chef)', desc: 'Short bio' },
  default: { title: 'Title', tag: 'Category', desc: 'Caption' }
};
const labelsFor = sub => LABELS[sub] || LABELS.default;

/** Generic card fields → stored property names, per list. */
const FIELD_MAP = {
  heroPhotos: { title: 'title', tag: 'category', desc: 'caption' },
  cateringGallery: { title: 'title', tag: 'category', desc: 'caption' },
  restaurantGallery: { title: 'title', tag: 'tag', desc: 'desc' },
  teamMembers: { title: 'name', tag: 'role', desc: 'bio' },
  behindTheScenes: { title: 'title', tag: 'stage', desc: 'desc' }
};

const currentSub = () =>
  FIELD_MAP[ui.contentSubTab] || ui.contentSubTab === 'pageBanners' ? ui.contentSubTab : 'cateringGallery';

// Reading falls back across field names, as the original editor did, so older data still shows.
const readTitle = it => it.title || it.name || '';
const readTag = it => it.category || it.tag || it.role || it.stage || '';
const readDesc = it => it.caption || it.desc || it.bio || '';

function contentCard(it, idx, sub) {
  const L = labelsFor(sub);
  return `
    <div class="bo-content-card" data-dirty-scope>
      <img src="${esc(it.img)}" alt="" data-fallback="" loading="lazy" />
      <div class="bo-content-card-body">
        <div><label class="bo-label" for="cnt-title-${idx}">${L.title}</label>
          <input type="text" class="bo-input" id="cnt-title-${idx}" data-field="title" value="${esc(readTitle(it))}" /></div>
        <div><label class="bo-label" for="cnt-tag-${idx}">${L.tag}</label>
          <input type="text" class="bo-input" id="cnt-tag-${idx}" data-field="tag" value="${esc(readTag(it))}" /></div>
        <div><label class="bo-label" for="cnt-img-${idx}">Photo</label>
          <div class="bo-field-row">
            <input type="text" class="bo-input" id="cnt-img-${idx}" data-field="img" value="${esc(it.img || '')}" placeholder="Paste a link or upload" />
            ${uploadButton(`cnt-img-${idx}`, { label: '', compact: true })}
          </div></div>
        <div><label class="bo-label" for="cnt-desc-${idx}">${L.desc}</label>
          <textarea class="bo-textarea" id="cnt-desc-${idx}" data-field="desc" rows="2">${esc(readDesc(it))}</textarea></div>
        <div class="bo-card-actions">
          <button type="button" class="bo-btn bo-btn-primary" data-action="content:save" data-sub="${sub}" data-index="${idx}" data-save-button>Save</button>
          <button type="button" class="bo-btn bo-btn-danger bo-btn-icon" data-action="content:delete" data-sub="${sub}" data-index="${idx}" aria-label="Remove ${esc(readTitle(it) || 'this item')}" title="Remove"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
          <span class="bo-save-state" style="flex-basis:100%; justify-content:center;">Unsaved changes</span>
        </div>
      </div>
    </div>
  `;
}

/** One page's banner: photo (empty = built-in) and the three texts in both languages. */
function bannerCard(def) {
  const own = banners()[def.page] || {};
  const id = `bn-${def.page}`;
  const input = (key, label, placeholder, dir = '') => `
        <div><label class="bo-label" for="${id}-${key}">${label}</label>
          <input type="text" class="bo-input" id="${id}-${key}" data-field="${key}" value="${esc(own[key] || '')}" placeholder="${esc(placeholder)}"${dir ? ` dir="${dir}"` : ''} /></div>`;
  const arHint = 'Empty: the English above, or the built-in Arabic';
  const shown = own.img || def.photo;
  return `
    <div class="bo-content-card" data-dirty-scope>
      ${shown ? `<img src="${esc(shown)}" alt="" data-fallback="" loading="lazy" />` : ''}
      <div class="bo-content-card-body">
        <div class="bo-pk-kicker">${esc(def.name)} page</div>
        ${
          def.photo === null
            ? '<p class="bo-pk-hint">The photos of this banner are the <b>Home slideshow</b>.</p>'
            : `<div><label class="bo-label" for="${id}-img">Photo <small>(empty = built-in${def.photo ? '' : ': no photo'})</small></label>
          <div class="bo-field-row">
            <input type="text" class="bo-input" id="${id}-img" data-field="img" value="${esc(own.img || '')}" placeholder="${esc(def.photo || 'No photo')}" />
            ${uploadButton(`${id}-img`, { label: '', compact: true })}
          </div></div>`
        }
        ${input('eyebrow', 'Small heading', def.eyebrow)}
        ${input('eyebrowAr', 'Small heading (Arabic)', arHint, 'rtl')}
        ${input('title', 'Title', def.title)}
        ${input('titleAr', 'Title (Arabic)', arHint, 'rtl')}
        ${input('text', 'Text under the title', def.text)}
        ${input('textAr', 'Text (Arabic)', arHint, 'rtl')}
        <div class="bo-card-actions">
          <button type="button" class="bo-btn bo-btn-primary" data-action="content:banner-save" data-page="${def.page}" data-save-button>Save</button>
          <span class="bo-save-state" style="flex-basis:100%; justify-content:center;">Unsaved changes</span>
        </div>
      </div>
    </div>`;
}

async function saveBanner(button) {
  const card = button.closest('.bo-content-card');
  const page = button.dataset.page;
  if (!card || !BANNERS.some(b => b.page === page)) return;
  const all = banners();
  const before = all[page];
  const next = {};
  for (const key of BANNER_KEYS) {
    const value = card.querySelector(`[data-field="${key}"]`)?.value.trim();
    if (value) next[key] = value;
  }
  all[page] = next;
  if (!(await saveSiteConfig())) {
    all[page] = before;
    return;
  }
  afterCardSaved(card);
  showToast('Saved — the banner is updated on the website.');
}

function render() {
  const sub = currentSub();
  if (sub === 'pageBanners')
    return renderPanel(sub, `<div class="bo-card-grid">${BANNERS.map(bannerCard).join('')}</div>`);
  const items = siteList(sub);
  return renderPanel(
    sub,
    items.length === 0
      ? `<div class="bo-empty"><i class="fa-regular fa-images" aria-hidden="true"></i><div class="bo-empty-title">Nothing here yet</div><p>Add a photo to show it in this section of the website.</p></div>`
      : `<div class="bo-card-grid">${items.map((it, idx) => contentCard(it, idx, sub)).join('')}</div>`
  );
}

const pillCount = key =>
  key === 'pageBanners'
    ? Object.values(banners()).filter(b => b && Object.keys(b).length).length
    : (Array.isArray(data.siteConfig[key]) ? data.siteConfig[key] : []).length;

function renderPanel(sub, body) {
  return `
    <div class="bo-panel">
      <div class="bo-panel-header">
        <div class="bo-pill-tabs" role="group" aria-label="Section">
          ${SUB_TABS.map(
            ([key, label]) => `
            <button type="button" class="bo-pill-tab ${sub === key ? 'active' : ''}" data-action="content:subtab" data-sub="${key}" aria-pressed="${sub === key}">
              ${label} <span class="bo-pill-count">${pillCount(key)}</span>
            </button>`
          ).join('')}
        </div>
        ${
          sub === 'pageBanners'
            ? ''
            : `<button type="button" class="bo-btn bo-btn-gold" data-action="content:add-open" data-sub="${sub}">
          <i class="fa-solid fa-plus" aria-hidden="true"></i> ${sub === 'teamMembers' ? 'Add a team member' : 'Add a photo'}
        </button>`
        }
      </div>
      <div class="bo-panel-body">
        ${sub === 'pageBanners' ? '<p class="bo-pk-intro">The banner at the top of each page. Leave a field empty to keep the built-in text or photo (shown in grey). A new photo is saved as soon as it is uploaded.</p>' : ''}
        ${body}
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
  afterCardSaved(card);
  showToast('Saved — the website is updated.');
}

async function deleteCard(button) {
  const sub = button.dataset.sub;
  const idx = Number(button.dataset.index);
  const list = siteList(sub);
  if (!list[idx]) return;
  const sure = await confirmDialog(`“${readTitle(list[idx]) || 'This item'}” will be removed from the website.`, {
    title: 'Remove this item?',
    confirmLabel: 'Remove'
  });
  if (!sure || !(await confirmDiscard())) return;
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
    sub === 'teamMembers' ? 'Add a team member' : 'Add a photo',
    `
      <form data-on-submit="content:add-submit" data-sub="${sub}">
        <div class="bo-form-grid">
          <div class="bo-form-group">
            <label for="ncTitle">${labelsFor(sub).title} *</label>
            <input type="text" id="ncTitle" class="bo-input" required />
          </div>
          <div class="bo-form-group">
            <label for="ncTag">${labelsFor(sub).tag} *</label>
            <input type="text" id="ncTag" class="bo-input" required />
          </div>
        </div>
        <div class="bo-form-group" style="margin-top:14px;">
          <label for="ncImg">Photo * (paste a link or upload)</label>
          <div style="display:flex; gap:8px; align-items:center;">
            <input type="text" id="ncImg" class="bo-input" style="flex:1;" value="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85" required />
            ${uploadButton('ncImg')}
          </div>
        </div>
        <div class="bo-form-group" style="margin-top:14px;">
          <label for="ncDesc">${labelsFor(sub).desc} *</label>
          <textarea id="ncDesc" class="bo-textarea" rows="3" required></textarea>
        </div>
        ${modalFormButtons('Add to website')}
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
  showToast('Added to the website.');
}

registerActions({
  'content:subtab': async el => {
    if (!(await confirmDiscard())) return;
    ui.contentSubTab =
      FIELD_MAP[el.dataset.sub] || el.dataset.sub === 'pageBanners' ? el.dataset.sub : 'cateringGallery';
    renderActiveTab();
  },
  'content:save': el => saveCard(el),
  'content:banner-save': el => saveBanner(el),
  'content:delete': el => deleteCard(el),
  'content:add-open': el => openAddItem(el.dataset.sub),
  'content:add-submit': form => submitAddItem(form)
});

registerTab('content', {
  title: 'Photos & team',
  subtitle: 'Galleries and team profiles shown on the website.',
  render
});
