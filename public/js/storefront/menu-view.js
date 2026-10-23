// Interactive FineDine menu explorer shared by the catering à-la-carte tab, the restaurant table menu
// and the delivery menu: category stories, search, currency / layout / dietary toggles and dish cards.
//
// `mode` is 'catering' | 'resto' | 'delivery'; each mode keeps its own category + search state.

import { registerActions } from '../shared/actions.js';
import { esc } from '../shared/dom.js';
import { state, cartCount, cartSubtotal } from './state.js';
import { content } from './config.js';
import { formatPrice } from './format.js';
import { renderTableBanner } from './table-banner.js';
import { render, renderMainView } from './view.js';

/** Menu categories offered as catering trays. */
export const CATERING_CATEGORY_IDS = [
  'hot-offers',
  'main-course',
  'lebanese-corner',
  'cheddar-fountain',
  'appetisers',
  'salads',
  'dessert'
];

const MODE_STATE = {
  delivery: { cat: 'deliveryCategory', search: 'deliverySearch', allowed: null },
  catering: { cat: 'cateringAlaCarteCat', search: 'cateringAlaCarteSearch', allowed: CATERING_CATEGORY_IDS },
  resto: { cat: 'restoCategory', search: 'restoSearch', allowed: null }
};
const modeState = mode => MODE_STATE[mode] || MODE_STATE.resto;
const WA_BRAND_BY_MODE = { catering: 'catering', resto: 'restaurant', delivery: 'delivery' };

const BADGE_PILLS = {
  Popular: '<span class="fd-badge popular"><i class="fa-solid fa-fire"></i> Popular</span>',
  Spicy: '<span class="fd-badge spicy"><i class="fa-solid fa-pepper-hot"></i> Spicy</span>',
  Vegetarian: '<span class="fd-badge vegetarian"><i class="fa-solid fa-leaf"></i> Veg</span>',
  Sharing: '<span class="fd-badge sharing"><i class="fa-solid fa-users"></i> Sharing</span>'
};

export function availableCategories(allowedCatIds) {
  return allowedCatIds ? content.menu.filter(cat => allowedCatIds.includes(cat.id)) : content.menu;
}

export function getFilteredMenuCategories(selectedCat, searchQuery, allowedCatIds) {
  const q = (searchQuery || '').toLowerCase().trim();
  const diet = state.dietaryFilter || 'all';

  return availableCategories(allowedCatIds)
    .filter(cat => selectedCat === 'all' || cat.id === selectedCat)
    .map(cat => {
      const matchedItems = cat.items.filter(item => {
        const matchesQuery =
          !q ||
          String(item.title || '')
            .toLowerCase()
            .includes(q) ||
          (item.desc && String(item.desc).toLowerCase().includes(q)) ||
          String(cat.name || '')
            .toLowerCase()
            .includes(q);
        if (!matchesQuery) return false;
        if (diet === 'all') return true;
        return (item.badges || []).map(b => String(b).toLowerCase()).includes(diet.toLowerCase());
      });
      return { ...cat, items: matchedItems };
    })
    .filter(cat => cat.items.length > 0);
}

function renderBadgePills(badges) {
  if (!badges || !badges.length) return '';
  return `<div class="fd-item-badges">
      ${badges.map(b => BADGE_PILLS[b] || '').join('')}
    </div>`;
}

/** data-action attributes that open a dish (or explain it is sold out). */
const dishAction = (item, mode) =>
  item.soldOut
    ? 'data-action="dish:sold-out"'
    : `data-action="dish:open" data-id="${esc(item.id)}" data-mode="${mode}"`;

function renderGridItem(item, mode, inBagQty) {
  const isSoldOut = Boolean(item.soldOut);
  return `
                            <div class="dish-card" style="cursor:${isSoldOut ? 'not-allowed' : 'pointer'}; ${isSoldOut ? 'opacity:0.65;' : ''}" ${dishAction(item, mode)}>
                              <div class="dish-card-img-wrap">
                                <img src="${esc(item.img)}" data-fallback="${esc(item.fallbackImg)}" alt="${esc(item.title)}" loading="lazy" />
                                <span class="dish-price-tag">${formatPrice(item.priceValue)}</span>
                              </div>
                              <div class="dish-card-body">
                                ${renderBadgePills(item.badges)}
                                <div class="dish-title">${esc(item.title)}</div>
                                <div class="dish-desc">${esc(item.desc || 'Prepared fresh to order in our Ain Al Remmaneh, Aley kitchen.')}</div>
                                <div class="dish-actions">
                                  <button class="btn-add-order" ${isSoldOut ? 'disabled style="background:#9ca3af; cursor:not-allowed;"' : ''} ${dishAction(item, mode)}>
                                    <i class="fa-solid ${isSoldOut ? 'fa-ban' : inBagQty > 0 ? 'fa-check' : 'fa-plus'}"></i>
                                    ${isSoldOut ? 'Sold Out' : inBagQty > 0 ? `In Bag (${inBagQty}) • Add More` : 'Customize & Add'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          `;
}

function renderSplitItem(item, cat, mode, inBagQty) {
  const hasCustomMods = cat.modType && cat.modType !== 'none';
  const isSoldOut = Boolean(item.soldOut);
  let tag = `<span class="fd-item-customize-tag"><i class="fa-solid fa-circle-info"></i> View Details</span>`;
  if (isSoldOut)
    tag = `<span class="fd-item-customize-tag" style="color:#dc2626;"><i class="fa-solid fa-ban"></i> Sold Out</span>`;
  else if (hasCustomMods)
    tag = `<span class="fd-item-customize-tag"><i class="fa-solid fa-sliders"></i> Customizable</span>`;

  let addLabel = `<i class="fa-solid fa-plus"></i> Add`;
  if (isSoldOut) addLabel = `<i class="fa-solid fa-ban"></i> Sold Out`;
  else if (inBagQty > 0) addLabel = `<i class="fa-solid fa-check"></i> ${inBagQty} in Bag`;

  return `
                            <div class="fd-item-card" style="${isSoldOut ? 'opacity:0.65; cursor:not-allowed;' : ''}" ${dishAction(item, mode)}>
                              <div class="fd-item-info">
                                <div>
                                  ${renderBadgePills(item.badges)}
                                  <div class="fd-item-title">${esc(item.title)}</div>
                                  <div class="fd-item-desc">
                                    ${esc(item.desc || 'Prepared fresh to order with signature Mini Kitchen ingredients.')}
                                  </div>
                                </div>
                                <div class="fd-item-bottom">
                                  <span class="fd-item-price">${formatPrice(item.priceValue)}</span>
                                  <span class="fd-item-meta-pill"><i class="fa-regular fa-clock"></i> ${esc(item.prepTime || '15–20 min')}</span>
                                  ${tag}
                                </div>
                              </div>

                              <div class="fd-item-media">
                                <img
                                  src="${esc(item.img)}"
                                  data-fallback="${esc(item.fallbackImg)}"
                                  alt="${esc(item.title)}"
                                  class="fd-item-media-img"
                                  loading="lazy"
                                />
                                <button
                                  type="button"
                                  class="fd-add-float-btn ${inBagQty > 0 ? 'in-cart' : ''}"
                                  style="${isSoldOut ? 'background:#6b7280; color:#fff; cursor:not-allowed;' : ''}"
                                  ${dishAction(item, mode)}
                                >
                                  ${addLabel}
                                </button>
                              </div>
                            </div>
                          `;
}

function renderCategorySection(cat, { mode, activeCat, isOverviewMode, qtyByItemId }) {
  const visibleItems = isOverviewMode ? cat.items.slice(0, 6) : cat.items;
  const hiddenCount = cat.items.length - visibleItems.length;
  const catName = esc(cat.name);
  const askMsg = `Hello Mini Kitchen! I have a question about your *${cat.name}* menu section.`;
  const items =
    state.menuLayout === 'grid'
      ? `<div class="menu-items-grid">
                          ${visibleItems.map(item => renderGridItem(item, mode, qtyByItemId[item.id] || 0)).join('')}
                        </div>`
      : `<div class="fd-split-grid">
                          ${visibleItems.map(item => renderSplitItem(item, cat, mode, qtyByItemId[item.id] || 0)).join('')}
                        </div>`;

  return `
                <div class="fd-category-section" id="cat-block-${esc(cat.id)}">
                  <div class="fd-category-banner">
                    <div class="fd-category-banner-left">
                      <img
                        src="${esc(cat.thumbImg || cat.items[0]?.img || content.config.logos.main)}"
                        data-fallback=""
                        alt="${catName}"
                        class="fd-category-banner-thumb"
                        loading="lazy"
                      />
                      <div>
                        <h3 class="fd-category-banner-title">${catName}</h3>
                        <div class="fd-category-banner-sub">${esc(cat.subtitle || cat.badge)} • ${cat.items.length} dishes</div>
                      </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                      ${
                        activeCat !== 'all'
                          ? `<button type="button" class="btn btn-outline-dark" style="padding:8px 14px; font-size:0.78rem;" data-action="menu:category" data-mode="${mode}" data-cat="all"><i class="fa-solid fa-arrow-left"></i> Back to All Categories</button>`
                          : ''
                      }
                      <button
                        class="btn btn-whatsapp"
                        style="padding:8px 14px; font-size:0.78rem;"
                        data-action="wa:open"
                        data-brand="${WA_BRAND_BY_MODE[mode] || 'delivery'}"
                        data-msg="${esc(askMsg)}"
                      >
                        <i class="fa-brands fa-whatsapp"></i> Ask About ${catName}
                      </button>
                    </div>
                  </div>

                  ${items}

                  ${
                    hiddenCount > 0
                      ? `<div class="fd-cat-expand-footer">
                          <button type="button" class="fd-cat-expand-btn" data-action="menu:category" data-mode="${mode}" data-cat="${esc(cat.id)}">
                            <span>View All ${cat.items.length} Dishes in ${catName} (+${hiddenCount} more)</span>
                            <i class="fa-solid fa-arrow-right"></i>
                          </button>
                        </div>`
                      : ''
                  }
                </div>
              `;
}

function renderResults(mode, filteredCats, activeCat, activeSearch) {
  if (filteredCats.length === 0) {
    return `<div style="text-align:center; padding:60px 20px; background:var(--bg-card); border-radius:20px; border:1px solid var(--border-subtle);">
                  <i class="fa-solid fa-utensils" style="font-size:2.5rem; color:var(--text-muted); margin-bottom:12px;"></i>
                  <h3>No matching dishes found</h3>
                  <p style="color:var(--text-muted); margin-bottom:18px;">Try clearing your search or dietary filter, or message us directly on WhatsApp!</p>
                  <button class="btn btn-primary" data-action="menu:reset" data-mode="${mode}">Reset All Filters</button>
                </div>`;
  }
  // Map item quantities currently in the cart so cards show live badges
  const qtyByItemId = {};
  for (const line of state.cart) qtyByItemId[line.id] = (qtyByItemId[line.id] || 0) + line.qty;
  const isOverviewMode = activeCat === 'all' && !activeSearch && state.dietaryFilter === 'all';
  return filteredCats.map(cat => renderCategorySection(cat, { mode, activeCat, isOverviewMode, qtyByItemId })).join('');
}

const toggleBtn = (active, action, value, label) =>
  `<button
                  type="button"
                  class="fd-toggle-btn ${active ? 'active' : ''}"
                  data-action="${action}"
                  data-value="${value}"
                >
                  ${label}
                </button>`;

const dietChip = (value, label) =>
  `<button
                type="button"
                class="fd-diet-chip ${state.dietaryFilter === value ? 'active' : ''}"
                data-action="menu:diet"
                data-value="${value}"
              >
                ${label}
              </button>`;

/** Full explorer for one menu mode, using that mode's category + search state. */
export function renderMenuExplorer(mode) {
  const ms = modeState(mode);
  const activeCat = state[ms.cat];
  const activeSearch = state[ms.search];
  const catsList = availableCategories(ms.allowed);
  const filteredCats = getFilteredMenuCategories(activeCat, activeSearch, ms.allowed);
  const totalDishCount = catsList.reduce((acc, c) => acc + c.items.length, 0);
  const logo = esc(content.config.logos.main);

  return `
      <div class="fd-menu-shell" id="fdMenuTopAnchor">
        <!-- 0. DEDICATED QR CODE BAR FOR THIS MENU -->
        ${renderTableBanner()}

        <!-- 1. FINEDINE VISUAL CATEGORY STORY CAROUSEL -->
        <div class="fd-cat-stories-wrap">
          <div class="fd-cat-stories-header">
            <div class="fd-cat-stories-title">
              <i class="fa-solid fa-utensils" style="color:var(--brand-primary-dark);"></i>
              <span>Select a Category (${catsList.length})</span>
              ${
                activeCat !== 'all'
                  ? `<button type="button" data-action="menu:category" data-mode="${mode}" data-cat="all" style="margin-inline-start: 8px; background:#f3f4f6; border:1px solid #d1d5db; border-radius:999px; padding:2px 10px; font-size:0.7rem; font-weight:700; cursor:pointer; color:#111827;">✕ Show All Categories</button>`
                  : ''
              }
            </div>
            <div style="font-size:0.76rem; color:#6b7280; font-weight:600;">
              <i class="fa-solid fa-hand-pointer" style="color:var(--brand-primary-dark);"></i> Tap any dish to customize & add
            </div>
          </div>

          <div class="fd-cat-stories-scroller">
            <div
              class="fd-story-card ${activeCat === 'all' ? 'active' : ''}"
              data-action="menu:category" data-mode="${mode}" data-cat="all"
            >
              <div class="fd-story-thumb">
                <img src="${logo}" data-fallback="" alt="All Categories" />
              </div>
              <div class="fd-story-name">All Menu</div>
              <div class="fd-story-count">${totalDishCount} dishes</div>
            </div>

            ${catsList
              .map(
                c => `
              <div
                class="fd-story-card ${activeCat === c.id ? 'active' : ''}"
                data-action="menu:category" data-mode="${mode}" data-cat="${esc(c.id)}"
              >
                <div class="fd-story-thumb">
                  <img src="${esc(c.thumbImg || c.items[0]?.img || content.config.logos.main)}" data-fallback="" alt="${esc(c.name)}" loading="lazy" />
                </div>
                <div class="fd-story-name">${esc(c.name)}</div>
                <div class="fd-story-count">${c.items.length} items</div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- 2. FINEDINE SMART TOOLBAR: SEARCH, CURRENCY (USD/LBP), LAYOUT & DIETARY TAGS -->
        <div class="fd-toolbar">
          <div class="fd-toolbar-top">
            <div class="fd-search-box">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                class="fd-search-input"
                placeholder="Search ${totalDishCount}+ dishes, ingredients, burgers, mezza, grills..."
                value="${esc(activeSearch)}"
                data-on-input="menu:search"
                data-mode="${mode}"
              />
            </div>

            <div class="fd-toolbar-actions">
              <!-- Multi-Currency Toggle (USD / LBP) -->
              <div class="fd-toggle-pill-group" title="Switch Menu Currency">
                ${toggleBtn(state.currency === 'USD', 'menu:currency', 'USD', '$ USD')}
                ${toggleBtn(state.currency === 'LBP', 'menu:currency', 'LBP', 'L.L. LBP')}
              </div>

              <!-- View Mode Toggle (Split List vs Photo Grid) -->
              <div class="fd-toggle-pill-group" title="Switch Menu Layout">
                ${toggleBtn(state.menuLayout === 'split', 'menu:layout', 'split', '<i class="fa-solid fa-table-list"></i> FineDine Split')}
                ${toggleBtn(state.menuLayout === 'grid', 'menu:layout', 'grid', '<i class="fa-solid fa-grip"></i> Photo Grid')}
              </div>

              <button class="btn btn-whatsapp" style="padding:10px 16px; font-size:0.82rem;" data-action="cart:open">
                <i class="fa-solid fa-bag-shopping"></i>
                <span>Bag (${cartCount()}) • ${formatPrice(cartSubtotal())}</span>
              </button>
            </div>
          </div>

          <div class="fd-dietary-row">
            <div class="fd-dietary-pills">
              ${dietChip('all', 'All Dishes')}
              ${dietChip('popular', '<i class="fa-solid fa-fire" style="color:#d97706;"></i> Popular & Signatures')}
              ${dietChip('spicy', '<i class="fa-solid fa-pepper-hot" style="color:#dc2626;"></i> Spicy')}
              ${dietChip('vegetarian', '<i class="fa-solid fa-leaf" style="color:#16a34a;"></i> Vegetarian')}
              ${dietChip('sharing', '<i class="fa-solid fa-users" style="color:#4f46e5;"></i> Group & Sharing')}
            </div>
            <div style="font-size:0.75rem; color:#6b7280;">
              ${state.currency === 'LBP' ? `Rate: 1 USD = ${content.lbpRate.toLocaleString('en-US')} L.L.` : 'Prices shown in USD ($)'}
            </div>
          </div>
        </div>

        <!-- 3. FINEDINE MENU CATEGORIES & DISH CARDS -->
        <div id="menuCategoriesResults">
          ${renderResults(mode, filteredCats, activeCat, activeSearch)}
        </div>
      </div>
    `;
}

function selectCategory(mode, catId) {
  state[modeState(mode).cat] = catId;
  renderMainView();
  setTimeout(() => {
    document.getElementById('fdMenuTopAnchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 40);
}

/** Search re-renders only the results so the input keeps focus while typing. */
function searchMenu(mode, query) {
  const ms = modeState(mode);
  state[ms.search] = query;
  const container = document.getElementById('menuCategoriesResults');
  if (!container) return;
  const activeCat = state[ms.cat];
  container.innerHTML = renderResults(mode, getFilteredMenuCategories(activeCat, query, ms.allowed), activeCat, query);
}

registerActions({
  'menu:category': el => selectCategory(el.dataset.mode, el.dataset.cat),
  'menu:search': el => searchMenu(el.dataset.mode, el.value),
  'menu:reset': el => {
    const ms = modeState(el.dataset.mode);
    state.dietaryFilter = 'all';
    state[ms.search] = '';
    selectCategory(el.dataset.mode, 'all');
  },
  'menu:currency': el => {
    state.currency = el.dataset.value === 'LBP' ? 'LBP' : 'USD';
    render();
  },
  'menu:layout': el => {
    state.menuLayout = el.dataset.value === 'grid' ? 'grid' : 'split';
    renderMainView();
  },
  'menu:diet': el => {
    state.dietaryFilter = el.dataset.value || 'all';
    renderMainView();
  }
});
