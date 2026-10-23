// Menu tab: searchable list of FineDine dishes with inline title/description/price editing,
// sold-out toggles and deletion. Full edit / add forms live in menu-modals.js.

import { registerActions } from '../../shared/actions.js';
import { esc } from '../../shared/dom.js';
import { data, ui, findDish } from '../state.js';
import { registerTab, renderActiveTab } from '../router.js';
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
  const small = 'padding:7px 10px; font-size:0.76rem;';
  return `
    <div class="bo-dish-row" style="${item.soldOut ? 'background:#fef2f2;' : ''}">
      <img src="${esc(item.img)}" data-fallback="${THUMB_FALLBACK}" class="bo-dish-thumb" alt="${esc(item.title)}" loading="lazy" />
      <div>
        <div style="font-size:0.7rem; font-weight:800; text-transform:uppercase; color:var(--bo-gold-dark);">${esc(cat.name)}</div>
        <input type="text" class="bo-input" style="padding:6px 9px; font-weight:700; margin-top:3px;" data-field="title" value="${esc(item.title)}" aria-label="Dish title" />
      </div>
      <div>
        <div style="font-size:0.7rem; color:var(--bo-muted);">Description</div>
        <input type="text" class="bo-input" style="padding:6px 9px; margin-top:3px;" data-field="desc" value="${esc(item.desc || '')}" aria-label="Description" />
      </div>
      <div>
        <div style="font-size:0.7rem; color:var(--bo-muted);">Price (USD $)</div>
        <input type="number" step="0.25" class="bo-input" style="padding:6px 9px; font-weight:800; margin-top:3px;" data-field="price" value="${Number(item.priceValue) || 0}" aria-label="Price in USD" />
      </div>
      <div>
        <div style="font-size:0.7rem; color:var(--bo-muted);">Stock Status</div>
        <button type="button" class="bo-btn ${item.soldOut ? 'bo-btn-danger' : 'bo-btn-outline'}" style="width:100%; padding:7px 10px; margin-top:3px; font-size:0.76rem;" data-action="menu:toggle-soldout" ${ids}>
          <i class="fa-solid ${item.soldOut ? 'fa-ban' : 'fa-circle-check'}" style="color:${item.soldOut ? '#dc2626' : '#16a34a'};"></i>
          ${item.soldOut ? 'Sold Out' : 'In Stock'}
        </button>
      </div>
      <div style="display:flex; gap:6px; padding-top:16px;">
        <button class="bo-btn bo-btn-primary" style="flex:1; ${small}" data-action="menu:save-row" ${ids}>Save</button>
        <button class="bo-btn bo-btn-outline" style="${small}" data-action="menu:edit-open" ${ids} title="Edit Photo & Badges" aria-label="Edit photo and badges">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="bo-btn bo-btn-danger" style="${small}" data-action="menu:delete-dish" ${ids} title="Delete Dish" aria-label="Delete dish">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `;
}

function render() {
  const cats = data.menuCategories;
  const rows = matchingRows();
  const shown = rows.slice(0, MAX_ROWS);
  const totalDishes = cats.reduce((n, c) => n + c.items.length, 0);

  return `
    <div class="bo-panel">
      <div class="bo-panel-header">
        <div>
          <div class="bo-panel-title">FineDine Menu Database (${cats.length} Categories • ${totalDishes} Dishes)</div>
          <div style="font-size:0.8rem; color:var(--bo-muted);">Edit prices, descriptions, photos, dietary badges, or mark items Sold Out in real time</div>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="bo-btn bo-btn-outline" data-action="menu:category-open">
            <i class="fa-solid fa-folder-plus"></i> + New Category
          </button>
          <button class="bo-btn bo-btn-gold" data-action="menu:add-open">
            <i class="fa-solid fa-plus"></i> + Add New Dish
          </button>
        </div>
      </div>

      <div class="bo-panel-body">
        <div class="bo-toolbar">
          <div style="flex:1; min-width:240px;">
            <input type="text" class="bo-input" placeholder="Search 239+ dishes by name, ingredient, or category..."
              value="${esc(ui.menuSearch)}" data-on-input="menu:search" data-focus-key="menu-search" aria-label="Search dishes" />
          </div>
          <select class="bo-select" style="width:auto; min-width:210px;" data-on-change="menu:filter-category" aria-label="Category">
            <option value="all" ${ui.menuCatFilter === 'all' ? 'selected' : ''}>All Categories (${cats.length})</option>
            ${cats
              .map(
                c =>
                  `<option value="${esc(c.id)}" ${ui.menuCatFilter === c.id ? 'selected' : ''}>${esc(c.name)} (${c.items.length})</option>`
              )
              .join('')}
          </select>
          <select class="bo-select" style="width:auto;" data-on-change="menu:filter-stock" aria-label="Stock status">
            <option value="all" ${ui.menuStockFilter === 'all' ? 'selected' : ''}>All Stock States</option>
            <option value="available" ${ui.menuStockFilter === 'available' ? 'selected' : ''}>✅ Available Only</option>
            <option value="soldout" ${ui.menuStockFilter === 'soldout' ? 'selected' : ''}>🚫 Sold Out Only</option>
          </select>
        </div>

        <div style="font-size:0.78rem; color:var(--bo-muted); margin-bottom:10px;">
          Showing ${shown.length} of ${rows.length} matching dishes
        </div>

        <div style="border:1px solid var(--bo-border); border-radius:14px; overflow:hidden;">
          ${shown.map(dishRow).join('')}
        </div>
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
  showToast(`Saved "${item.title}" ($${item.priceValue.toFixed(2)})`);
}

async function toggleSoldOut(catId, itemId) {
  const { item } = findDish(catId, itemId);
  if (!item) return;
  item.soldOut = !item.soldOut;
  const saved = await saveMenu();
  if (!saved) item.soldOut = !item.soldOut;
  renderActiveTab();
  if (saved) showToast(`"${item.title}" marked as ${item.soldOut ? 'SOLD OUT' : 'AVAILABLE'}`);
}

async function deleteDish(catId, itemId) {
  const { cat, item } = findDish(catId, itemId);
  if (!item) return;
  if (!window.confirm(`Remove "${item.title}" from the menu?`)) return;
  const previous = cat.items;
  cat.items = cat.items.filter(i => i.id !== itemId);
  cat.count = cat.items.length;
  if (!(await saveMenu())) {
    cat.items = previous;
    cat.count = previous.length;
    return;
  }
  renderActiveTab();
  showToast('Dish removed from menu.');
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
  subtitle: '',
  render
});
