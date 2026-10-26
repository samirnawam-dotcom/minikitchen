// Interactive menu explorer (FineDine-style) shared by the restaurant table menu and the delivery menu:
// category stories, search, currency / layout / dietary toggles and dish cards.
//
// `mode` is 'resto' | 'delivery'; each mode keeps its own category + search state and shows its own
// menu: the restaurant menu (content.menu) or the delivery menu (content.deliveryMenu).

import { registerActions } from '../shared/actions.js';
import { esc } from '../shared/dom.js';
import { state, cartCount, cartSubtotal } from './state.js';
import { content, dishModType, menuForMode } from './config.js';
import { formatPrice } from './format.js';
import {
  categoryName,
  categorySubtitle,
  dishDesc,
  dishPriceHtml,
  dishSearchText,
  dishTitle,
  dishTitleHtml
} from './dish-text.js';
import { renderTableBanner } from './table-banner.js';
import { render, renderMainView } from './view.js';
import { minutesText, t } from './i18n-strings.js';

const MODE_STATE = {
  delivery: { cat: 'deliveryCategory', search: 'deliverySearch', allowed: null },
  resto: { cat: 'restoCategory', search: 'restoSearch', allowed: null }
};
const modeState = mode => MODE_STATE[mode] || MODE_STATE.resto;
const WA_BRAND_BY_MODE = { resto: 'restaurant', delivery: 'delivery' };

const BADGE_PILLS = {
  Popular: () => `<span class="fd-badge popular">${t('Popular')}</span>`,
  Spicy: () => `<span class="fd-badge spicy"><i class="fa-solid fa-pepper-hot"></i> ${t('Spicy')}</span>`,
  Vegetarian: () => `<span class="fd-badge vegetarian"><i class="fa-solid fa-leaf"></i> ${t('Veg')}</span>`,
  Sharing: () => `<span class="fd-badge sharing">${t('Sharing')}</span>`
};

export function availableCategories(allowedCatIds, mode) {
  const menu = menuForMode(mode);
  return allowedCatIds ? menu.filter(cat => allowedCatIds.includes(cat.id)) : menu;
}

export function getFilteredMenuCategories(selectedCat, searchQuery, allowedCatIds, mode) {
  const q = (searchQuery || '').toLowerCase().trim();
  const diet = state.dietaryFilter || 'all';

  return availableCategories(allowedCatIds, mode)
    .filter(cat => selectedCat === 'all' || cat.id === selectedCat)
    .map(cat => {
      const matchedItems = cat.items.filter(item => {
        const matchesQuery =
          !q ||
          dishSearchText(item).includes(q) ||
          String(cat.name || '')
            .toLowerCase()
            .includes(q) ||
          categoryName(cat).toLowerCase().includes(q);
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
      ${badges.map(b => (BADGE_PILLS[b] ? BADGE_PILLS[b]() : '')).join('')}
    </div>`;
}

/** data-action attributes that open a dish (or explain it is sold out). */
const dishAction = (item, mode) =>
  item.soldOut
    ? 'data-action="dish:sold-out"'
    : `data-action="dish:open" data-id="${esc(item.id)}" data-mode="${mode}"`;

/** Accessible name of a dish's add button: "Add: Halloumi Plate", "2 in basket, add another: …". */
function addLabel(item, isSoldOut, inBagQty) {
  const status = isSoldOut ? t('Sold out') : inBagQty > 0 ? t('{n} in basket, add another', { n: inBagQty }) : t('Add');
  return `${status}: ${dishTitle(item)}`;
}

function renderGridItem(item, mode, inBagQty) {
  const isSoldOut = Boolean(item.soldOut);
  let label = `<i class="fa-solid fa-plus"></i> ${t('Add')}`;
  if (isSoldOut) label = t('Sold out');
  else if (inBagQty > 0) label = `<i class="fa-solid fa-check"></i> ${t('{n} in basket', { n: inBagQty })}`;
  return `
                            <article class="dish-card${isSoldOut ? ' is-sold-out' : ''}" ${dishAction(item, mode)}>
                              <div class="dish-card-img-wrap">
                                <img src="${esc(item.img)}" data-fallback="${esc(item.fallbackImg)}" alt="${esc(dishTitle(item))}" loading="lazy" />
                              </div>
                              <div class="dish-card-body">
                                ${renderBadgePills(item.badges)}
                                <h4 class="dish-title">${dishTitleHtml(item)}</h4>
                                <p class="dish-desc">${esc(dishDesc(item) || t('Prepared fresh to order in our Ain Al Remmaneh, Aley kitchen.'))}</p>
                                <div class="dish-actions">
                                  <span class="fd-item-price">${dishPriceHtml(item)}</span>
                                  <button type="button" class="btn-add-order${inBagQty > 0 ? ' in-cart' : ''}" ${isSoldOut ? 'aria-disabled="true"' : ''} ${dishAction(item, mode)} aria-label="${esc(addLabel(item, isSoldOut, inBagQty))}">${label}</button>
                                </div>
                              </div>
                            </article>
                          `;
}

function renderSplitItem(item, cat, mode, inBagQty) {
  const modType = dishModType(cat, item);
  const hasCustomMods = modType && modType !== 'none';
  const isSoldOut = Boolean(item.soldOut);
  let tag = '';
  if (isSoldOut) tag = `<span class="fd-item-customize-tag is-sold-out">${t('Sold out')}</span>`;
  else if (hasCustomMods)
    tag = `<span class="fd-item-customize-tag"><i class="fa-solid fa-sliders"></i> ${t('Options')}</span>`;

  let buttonLabel = `<i class="fa-solid fa-plus"></i> ${t('Add')}`;
  if (isSoldOut) buttonLabel = t('Sold out');
  else if (inBagQty > 0) buttonLabel = `<i class="fa-solid fa-check"></i> ${inBagQty}`;

  return `
                            <article class="fd-item-card${isSoldOut ? ' is-sold-out' : ''}" ${dishAction(item, mode)}>
                              <div class="fd-item-info">
                                ${renderBadgePills(item.badges)}
                                <h4 class="fd-item-title">${dishTitleHtml(item)}</h4>
                                <p class="fd-item-desc">${esc(dishDesc(item) || t('Prepared fresh to order with signature Mini Kitchen ingredients.'))}</p>
                                <div class="fd-item-bottom">
                                  <span class="fd-item-price">${dishPriceHtml(item)}</span>
                                  <span class="fd-item-meta-pill"><i class="fa-regular fa-clock"></i> ${esc(minutesText(item.prepTime || '15–20 min'))}</span>
                                  ${tag}
                                </div>
                              </div>

                              <div class="fd-item-media">
                                <img
                                  src="${esc(item.img)}"
                                  data-fallback="${esc(item.fallbackImg)}"
                                  alt="${esc(dishTitle(item))}"
                                  class="fd-item-media-img"
                                  loading="lazy"
                                />
                                <button type="button" class="fd-add-float-btn${inBagQty > 0 ? ' in-cart' : ''}" ${isSoldOut ? 'aria-disabled="true"' : ''} ${dishAction(item, mode)} aria-label="${esc(addLabel(item, isSoldOut, inBagQty))}">
                                  ${buttonLabel}
                                </button>
                              </div>
                            </article>
                          `;
}

function renderCategorySection(cat, { mode, activeCat, isOverviewMode, qtyByItemId }) {
  const visibleItems = isOverviewMode ? cat.items.slice(0, 6) : cat.items;
  const hiddenCount = cat.items.length - visibleItems.length;
  const catName = esc(categoryName(cat));
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
                        <div class="fd-category-banner-sub">${esc(categorySubtitle(cat))} · ${t('{n} dishes', { n: cat.items.length })}</div>
                      </div>
                    </div>
                    <div class="fd-category-actions">
                      ${
                        activeCat !== 'all'
                          ? `<button type="button" class="text-link" data-action="menu:category" data-mode="${mode}" data-cat="all"><i class="fa-solid fa-arrow-left"></i> ${t('All categories')}</button>`
                          : ''
                      }
                      <button
                        class="text-link text-link-wa"
                        data-action="wa:open"
                        data-brand="${WA_BRAND_BY_MODE[mode] || 'delivery'}"
                        data-msg="${esc(askMsg)}"
                      >
                        <i class="fa-brands fa-whatsapp"></i> ${t('Ask about this')}
                      </button>
                    </div>
                  </div>

                  ${items}

                  ${
                    hiddenCount > 0
                      ? `<div class="fd-cat-expand-footer">
                          <button type="button" class="fd-cat-expand-btn" data-action="menu:category" data-mode="${mode}" data-cat="${esc(cat.id)}">
                            <span>${t('See all {n} dishes', { n: cat.items.length })}</span>
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
    return `<div class="empty-state">
                  <i class="fa-solid fa-utensils"></i>
                  <h3>${t('No matching dishes')}</h3>
                  <p>${t('Try another search or filter, or ask us on WhatsApp.')}</p>
                  <button class="btn btn-outline" data-action="menu:reset" data-mode="${mode}">${t('Reset filters')}</button>
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
  const catsList = availableCategories(ms.allowed, mode);
  const filteredCats = getFilteredMenuCategories(activeCat, activeSearch, ms.allowed, mode);
  const totalDishCount = catsList.reduce((acc, c) => acc + c.items.length, 0);
  const logo = esc(content.config.logos.main);

  return `
      <div class="fd-menu-shell" id="fdMenuTopAnchor">
        <!-- 0. DEDICATED QR CODE BAR FOR THIS MENU -->
        ${renderTableBanner()}

        <!-- 1. Category circles -->
        <div class="fd-cat-stories-wrap">
          <div class="fd-cat-stories-header">
            <div class="fd-cat-stories-title">
              <span class="eyebrow">${t('Categories')} · ${catsList.length}</span>
              ${
                activeCat !== 'all'
                  ? `<button type="button" class="fd-clear-btn" data-action="menu:category" data-mode="${mode}" data-cat="all"><i class="fa-solid fa-xmark"></i> ${t('Show all')}</button>`
                  : ''
              }
            </div>
            <div class="fd-cat-stories-hint">${t('Tap a dish to choose options and add it')}</div>
          </div>

          <div class="fd-cat-stories-scroller">
            <div
              class="fd-story-card ${activeCat === 'all' ? 'active' : ''}"
              data-action="menu:category" data-mode="${mode}" data-cat="all"
            >
              <div class="fd-story-thumb">
                <img src="${logo}" data-fallback="" alt="${t('All Categories')}" />
              </div>
              <div class="fd-story-name">${t('All')}</div>
              <div class="fd-story-count">${totalDishCount}</div>
            </div>

            ${catsList
              .map(
                c => `
              <div
                class="fd-story-card ${activeCat === c.id ? 'active' : ''}"
                data-action="menu:category" data-mode="${mode}" data-cat="${esc(c.id)}"
              >
                <div class="fd-story-thumb">
                  <img src="${esc(c.thumbImg || c.items[0]?.img || content.config.logos.main)}" data-fallback="" alt="${esc(categoryName(c))}" loading="lazy" />
                </div>
                <div class="fd-story-name">${esc(categoryName(c))}</div>
                <div class="fd-story-count">${c.items.length}</div>
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
                placeholder="${t('Search {n} dishes…', { n: totalDishCount })}"
                value="${esc(activeSearch)}"
                data-on-input="menu:search"
                data-mode="${mode}"
              />
            </div>

            <div class="fd-toolbar-actions">
              <!-- Multi-Currency Toggle (USD / LBP) -->
              <div class="fd-toggle-pill-group" title="${t('Switch Menu Currency')}">
                ${toggleBtn(state.currency === 'USD', 'menu:currency', 'USD', t('$ USD'))}
                ${toggleBtn(state.currency === 'LBP', 'menu:currency', 'LBP', t('L.L. LBP'))}
              </div>

              <!-- View Mode Toggle (Split List vs Photo Grid) -->
              <div class="fd-toggle-pill-group" title="${t('Switch Menu Layout')}">
                ${toggleBtn(state.menuLayout === 'split', 'menu:layout', 'split', `<i class="fa-solid fa-list"></i> ${t('List')}`)}
                ${toggleBtn(state.menuLayout === 'grid', 'menu:layout', 'grid', `<i class="fa-solid fa-grip"></i> ${t('Photos')}`)}
              </div>

              <button class="btn btn-primary btn-sm fd-bag-btn" data-action="cart:open">
                <i class="fa-solid fa-bag-shopping"></i>
                <span>${t('Basket')} (${cartCount()}) · ${formatPrice(cartSubtotal())}</span>
              </button>
            </div>
          </div>

          <div class="fd-dietary-row">
            <div class="fd-dietary-pills">
              ${dietChip('all', t('All dishes'))}
              ${dietChip('popular', t('Popular'))}
              ${dietChip('spicy', t('Spicy'))}
              ${dietChip('vegetarian', t('Vegetarian'))}
              ${dietChip('sharing', t('For sharing'))}
            </div>
            <div class="fd-rate-note">
              ${state.currency === 'LBP' ? t('Rate: 1 USD = {rate} L.L.', { rate: content.lbpRate.toLocaleString('en-US') }) : t('Prices shown in USD ($)')}
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
  container.innerHTML = renderResults(
    mode,
    getFilteredMenuCategories(activeCat, query, ms.allowed, mode),
    activeCat,
    query
  );
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
