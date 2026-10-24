// Menu tab: searchable list of FineDine dishes with inline title/description/price editing,
// sold-out toggles and deletion. Full edit / add forms live in menu-modals.js.

import { registerActions } from '../../shared/actions.js';
import { esc } from '../../shared/dom.js';
import { data, ui, findDish } from '../state.js';
import { registerTab, renderActiveTab, markSaved, confirmDiscard } from '../router.js';
import { confirmDialog } from '../ui/modal.js';
import { saveMenu } from '../sync.js';
import { showToast, showError } from '../ui/toast.js';
import './menu-modals.js';

const MAX_ROWS = 80;
const THUMB_FALLBACK = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80';

function matchingRows() {
  const q = ui.menuSearch.toLowerCase().trim();
  const rows = [];
  for (const cat of data.menuCategories) {
    if (ui.menuCatFilter !== 'all' && cat.id !== ui.menuCatFilter) continue;
    for (const item of cat.items) {
      if (ui.menuStockFilter === 'available' && item.soldOut) continue;
      if (ui.menuStockFilter === 'soldout' && !item.soldOut) continue;
      const hay = `${item.title || ''} ${item.desc || ''} ${cat.name || ''}`.toLowerCase();
      if (q && !hay.includes(q)) continue;
      rows.push({ cat, item });
    }
  }
  return rows;
}

function dishRow({ cat, item }) {
  const ids = `data-cat-id="${esc(cat.id)}" data-item-id="${esc(item.id)}"`;
  const key = esc(`${cat.id}-${item.id}`);
  return `
    <div class="bo-dish-row${item.soldOut ? ' is-soldout' : ''}" data-dirty-scope>
      <img src="${esc(item.img)}" data-fallback="${THUMB_FALLBACK}" class="bo-dish-thumb" alt="" loading="lazy" />
      <div>
        <div class="bo-dish-cat">${esc(cat.name)}</div>
        <label class="bo-sr-only" for="dt-${key}">Dish name</label>
        <input type="text" class="bo-input" style="font-weight:700;" id="dt-${key}" data-field="title" value="${esc(item.title)}" />
      </div>
      <div>
        <label class="bo-dish-cell-label" for="dd-${key}">Description</label>
        <input type="text" class="bo-input" id="dd-${key}" data-field="desc" value="${esc(item.desc || '')}" placeholder="Short description" />
      </div>
      <div>
        <label class="bo-dish-cell-label" for="dp-${key}">Price ($)</label>
        <input type="number" step="0.25" min="0" class="bo-input" style="font-weight:700;" id="dp-${key}" data-field="price" value="${Number(item.priceValue) || 0}" inputmode="decimal" />
      </div>
      <div>
        <span class="bo-dish-cell-label">Availability</span>
        <button type="button" class="bo-btn ${item.soldOut ? 'bo-btn-danger' : 'bo-btn-outline'}" style="width:100%;" data-action="menu:toggle-soldout" ${ids}
          aria-pressed="${Boolean(item.soldOut)}" title="${item.soldOut ? 'Mark as available again' : 'Mark as sold out'}">
          <i class="fa-solid ${item.soldOut ? 'fa-ban' : 'fa-circle-check'}" aria-hidden="true"></i>
          ${item.soldOut ? 'Sold out' : 'Available'}
        </button>
      </div>
      <div>
        <span class="bo-dish-cell-label">&nbsp;</span>
        <div class="bo-dish-actions">
          <button type="button" class="bo-btn bo-btn-primary" data-action="menu:save-row" data-save-button ${ids}>Save</button>
          <button type="button" class="bo-btn bo-btn-outline bo-btn-icon" data-action="menu:edit-open" ${ids} title="Photo, badges and more" aria-label="Edit photo and details of ${esc(item.title)}">
            <i class="fa-solid fa-pen" aria-hidden="true"></i>
          </button>
          <button type="button" class="bo-btn bo-btn-danger bo-btn-icon" data-action="menu:delete-dish" ${ids} title="Remove dish" aria-label="Remove ${esc(item.title)}">
            <i class="fa-solid fa-trash" aria-hidden="true"></i>
          </button>
        </div>
        <span class="bo-save-state" style="margin-top:6px;">Unsaved</span>
      </div>
    </div>
  `;
}

function render() {
  const cats = data.menuCategories;
  const rows = matchingRows();
  const shown = rows.slice(0, MAX_ROWS);
  const totalDishes = cats.reduce((n, c) => n + c.items.length, 0);
  const soldOut = cats.reduce((n, c) => n + c.items.filter(i => i.soldOut).length, 0);

  return `
    <div class="bo-panel">
      <div class="bo-panel-header">
        <div>
          <h2 class="bo-panel-title">${totalDishes} dishes in ${cats.length} categories</h2>
          <div class="bo-panel-sub">${soldOut ? `${soldOut} marked sold out. ` : ''}Edit a name, description or price and press <b>Save</b> on that row. Use the pencil for photos and badges.</div>
        </div>
        <div class="bo-panel-actions">
          <button type="button" class="bo-btn bo-btn-outline" data-action="menu:category-open">
            <i class="fa-solid fa-folder-plus" aria-hidden="true"></i> New category
          </button>
          <button type="button" class="bo-btn bo-btn-gold" data-action="menu:add-open">
            <i class="fa-solid fa-plus" aria-hidden="true"></i> Add a dish
          </button>
        </div>
      </div>

      <div class="bo-panel-body">
        <div class="bo-toolbar">
          <label class="bo-toolbar-field" style="flex:1 1 260px;">
            <span>Search</span>
            <input type="search" class="bo-input" placeholder="Dish name, ingredient or category…"
              value="${esc(ui.menuSearch)}" data-on-input="menu:search" data-focus-key="menu-search" data-no-dirty />
          </label>
          <label class="bo-toolbar-field" style="flex:0 1 240px;">
            <span>Category</span>
            <select class="bo-select" data-on-change="menu:filter-category" data-no-dirty>
              <option value="all" ${ui.menuCatFilter === 'all' ? 'selected' : ''}>All categories</option>
              ${cats
                .map(
                  c =>
                    `<option value="${esc(c.id)}" ${ui.menuCatFilter === c.id ? 'selected' : ''}>${esc(c.name)} (${c.items.length})</option>`
                )
                .join('')}
            </select>
          </label>
          <label class="bo-toolbar-field" style="flex:0 1 180px;">
            <span>Availability</span>
            <select class="bo-select" data-on-change="menu:filter-stock" data-no-dirty>
              <option value="all" ${ui.menuStockFilter === 'all' ? 'selected' : ''}>All dishes</option>
              <option value="available" ${ui.menuStockFilter === 'available' ? 'selected' : ''}>Available</option>
              <option value="soldout" ${ui.menuStockFilter === 'soldout' ? 'selected' : ''}>Sold out</option>
            </select>
          </label>
        </div>

        <div class="bo-muted" style="font-size:0.84rem; margin-bottom:10px;" aria-live="polite">
          Showing ${shown.length} of ${rows.length} dishes${rows.length > MAX_ROWS ? ' — search or pick a category to see the rest' : ''}
        </div>

        ${
          shown.length === 0
            ? `<div class="bo-empty"><i class="fa-solid fa-utensils" aria-hidden="true"></i><div class="bo-empty-title">No dishes match</div><p>Try another word or choose “All categories”.</p></div>`
            : `<div class="bo-dish-table">
                <div class="bo-dish-head" aria-hidden="true"><span></span><span>Dish</span><span>Description</span><span>Price ($)</span><span>Availability</span><span></span></div>
                ${shown.map(dishRow).join('')}
              </div>`
        }
      </div>
    </div>
  `;
}

async function saveRow(button) {
  const { item } = findDish(button.dataset.catId, button.dataset.itemId);
  const row = button.closest('.bo-dish-row');
  if (!item || !row) return;
  const field = name => row.querySelector(`[data-field="${name}"]`)?.value ?? '';
  const title = field('title').trim();
  const price = parseFloat(field('price'));
  if (!title) {
    showError('Dish title cannot be empty.');
    return;
  }
  if (!Number.isFinite(price) || price < 0) {
    showError('Please enter a valid price.');
    return;
  }
  const before = { title: item.title, desc: item.desc, priceValue: item.priceValue, price: item.price };
  item.title = title;
  item.desc = field('desc').trim();
  item.priceValue = price;
  item.price = `$${price.toFixed(2)}`;
  if (!(await saveMenu())) {
    Object.assign(item, before);
    return;
  }
  markSaved(row);
  showToast(`Saved “${item.title}” at $${item.priceValue.toFixed(2)}.`);
}

async function toggleSoldOut(catId, itemId) {
  const { item } = findDish(catId, itemId);
  if (!item || !(await confirmDiscard())) return;
  item.soldOut = !item.soldOut;
  const saved = await saveMenu();
  if (!saved) item.soldOut = !item.soldOut;
  renderActiveTab();
  if (saved) showToast(`“${item.title}” is now ${item.soldOut ? 'sold out' : 'available'} on the website.`);
}

async function deleteDish(catId, itemId) {
  const { cat, item } = findDish(catId, itemId);
  if (!item) return;
  const sure = await confirmDialog(`“${item.title}” will be removed from the website menu. This cannot be undone.`, {
    title: 'Remove this dish?',
    confirmLabel: 'Remove dish'
  });
  if (!sure || !(await confirmDiscard())) return;
  const previous = cat.items;
  cat.items = cat.items.filter(i => i.id !== itemId);
  cat.count = cat.items.length;
  if (!(await saveMenu())) {
    cat.items = previous;
    cat.count = previous.length;
    return;
  }
  renderActiveTab();
  showToast('Dish removed from the menu.');
}

registerActions({
  'menu:search': el => {
    ui.menuSearch = el.value;
    renderActiveTab();
  },
  'menu:filter-category': el => {
    ui.menuCatFilter = el.value;
    renderActiveTab();
  },
  'menu:filter-stock': el => {
    ui.menuStockFilter = el.value;
    renderActiveTab();
  },
  'menu:save-row': el => saveRow(el),
  'menu:toggle-soldout': el => toggleSoldOut(el.dataset.catId, el.dataset.itemId),
  'menu:delete-dish': el => deleteDish(el.dataset.catId, el.dataset.itemId)
});

registerTab('menu', {
  title: 'Menu',
  subtitle: 'Dishes, prices and availability for the Restaurant and Delivery menus.',
  render
});
