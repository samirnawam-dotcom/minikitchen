// Menu tab modals: full dish editor (photo, prep time, badges), "Add New Dish" and
// "New Category".

import { registerActions } from '../../shared/actions.js';
import { esc, byId, $$ } from '../../shared/dom.js';
import { data, ui, findDish } from '../state.js';
import { renderActiveTab } from '../router.js';
import { saveMenu } from '../sync.js';
import { openModal, closeModal, modalFormButtons } from '../ui/modal.js';
import { showToast, showError } from '../ui/toast.js';
import { uploadButton } from '../ui/upload.js';

const BADGES = ['Popular', 'Spicy', 'Vegetarian', 'Sharing'];
const checkboxLabel = 'display:inline-flex; align-items:center; gap:6px; font-size:0.85rem; text-transform:none;';

function badgeCheckboxes(name, checked) {
  return `
    <div style="display:flex; gap:14px; flex-wrap:wrap; margin-top:6px;">
      ${BADGES.map(
        b =>
          `<label style="${checkboxLabel}"><input type="checkbox" name="${name}" value="${b}" ${checked.includes(b) ? 'checked' : ''} /> ${b}</label>`
      ).join('')}
    </div>`;
}

const checkedValues = name => $$(`input[name="${name}"]:checked`).map(el => el.value);

function photoField(id, label, value, { required = false } = {}) {
  return `
    <div class="bo-form-group" style="margin-top:14px;">
      <label for="${id}">${label}</label>
      <div style="display:flex; gap:8px; align-items:center;">
        <input type="text" id="${id}" class="bo-input" style="flex:1;" value="${esc(value)}" ${required ? 'required' : ''} />
        ${uploadButton(id)}
      </div>
    </div>`;
}

// ---- Edit dish ---------------------------------------------------------------------------------

function openEditDish(catId, itemId) {
  const { item } = findDish(catId, itemId);
  if (!item) return;
  openModal(
    `Edit Dish Details & Photo — ${item.title}`,
    `
      <form data-on-submit="menu:edit-submit" data-cat-id="${esc(catId)}" data-item-id="${esc(itemId)}">
        <div class="bo-form-grid">
          <div class="bo-form-group">
            <label for="edTitle">Dish Title *</label>
            <input type="text" id="edTitle" class="bo-input" value="${esc(item.title)}" required />
          </div>
          <div class="bo-form-group">
            <label for="edPrice">Price (USD $) *</label>
            <input type="number" step="0.25" id="edPrice" class="bo-input" value="${Number(item.priceValue) || 0}" required />
          </div>
          <div class="bo-form-group">
            <label for="edPrep">Prep Time Label</label>
            <input type="text" id="edPrep" class="bo-input" value="${esc(item.prepTime || '15–20 min')}" />
          </div>
        </div>
        ${photoField('edImg', 'Dish Photo (Paste URL or Upload from Device) *', item.img || '', { required: true })}
        <div class="bo-form-group" style="margin-top:14px;">
          <label for="edDesc">Description</label>
          <textarea id="edDesc" class="bo-textarea" rows="3">${esc(item.desc || '')}</textarea>
        </div>
        <div class="bo-form-group" style="margin-top:14px;">
          <label>Dietary & Feature Badges</label>
          ${badgeCheckboxes('edBadge', item.badges || [])}
        </div>
        ${modalFormButtons('Save Dish Changes')}
      </form>
    `
  );
}

async function submitEditDish(form) {
  const { item } = findDish(form.dataset.catId, form.dataset.itemId);
  if (!item) return;
  const before = { ...item };
  const price = parseFloat(byId('edPrice').value) || 0;
  Object.assign(item, {
    title: byId('edTitle').value.trim(),
    priceValue: price,
    price: `$${price.toFixed(2)}`,
    prepTime: byId('edPrep').value.trim() || '15–20 min',
    img: byId('edImg').value.trim(),
    desc: byId('edDesc').value.trim(),
    badges: checkedValues('edBadge')
  });
  if (!(await saveMenu())) {
    Object.assign(item, before);
    return;
  }
  closeModal();
  renderActiveTab();
  showToast(`Updated "${item.title}"`);
}

// ---- Add dish ----------------------------------------------------------------------------------

function openAddDish() {
  openModal(
    'Add New Dish to FineDine Menu',
    `
      <form data-on-submit="menu:add-submit">
        <div class="bo-form-grid">
          <div class="bo-form-group">
            <label for="newDishCat">Select Category *</label>
            <select id="newDishCat" class="bo-select" required>
              ${data.menuCategories.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}
            </select>
          </div>
          <div class="bo-form-group">
            <label for="newDishTitle">Dish Title *</label>
            <input type="text" id="newDishTitle" class="bo-input" placeholder="e.g., Truffle Wagyu Burger" required />
          </div>
          <div class="bo-form-group">
            <label for="newDishPrice">Price (USD $) *</label>
            <input type="number" step="0.25" id="newDishPrice" class="bo-input" placeholder="e.g., 12.50" required />
          </div>
        </div>
        ${photoField(
          'newDishImg',
          'Dish Photo (Paste URL or Upload from Device)',
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'
        )}
        <div class="bo-form-group" style="margin-top:14px;">
          <label for="newDishDesc">Dish Description *</label>
          <textarea id="newDishDesc" class="bo-textarea" rows="2" placeholder="Ingredients and preparation details..." required></textarea>
        </div>
        <div class="bo-form-group" style="margin-top:14px;">
          <label>Badges</label>
          ${badgeCheckboxes('ndBadge', ['Popular'])}
        </div>
        ${modalFormButtons('Add Dish to Menu')}
      </form>
    `
  );
}

async function submitAddDish() {
  const cat = data.menuCategories.find(c => c.id === byId('newDishCat').value);
  if (!cat) return;
  const price = parseFloat(byId('newDishPrice').value) || 0;
  const img = byId('newDishImg').value.trim();
  const dish = {
    id: `mk-custom-${Date.now()}`,
    categoryId: cat.id,
    categoryName: cat.name,
    title: byId('newDishTitle').value.trim(),
    desc: byId('newDishDesc').value.trim(),
    price: `$${price.toFixed(2)}`,
    priceValue: price,
    img,
    fallbackImg: img,
    hasRealPhoto: true,
    prepTime: '15–20 min',
    badges: checkedValues('ndBadge'),
    soldOut: false
  };
  cat.items.unshift(dish);
  cat.count = cat.items.length;
  if (!(await saveMenu())) {
    cat.items.shift();
    cat.count = cat.items.length;
    return;
  }
  closeModal();
  renderActiveTab();
  showToast(`Added "${dish.title}" to ${cat.name}!`);
}

// ---- Add category ------------------------------------------------------------------------------

function openAddCategory() {
  openModal(
    'Create New FineDine Menu Category',
    `
      <form data-on-submit="menu:category-submit">
        <div class="bo-form-grid">
          <div class="bo-form-group">
            <label for="newCatName">Category Title *</label>
            <input type="text" id="newCatName" class="bo-input" placeholder="e.g., Seasonal Specials" required />
          </div>
          <div class="bo-form-group">
            <label for="newCatSub">Category Subtitle *</label>
            <input type="text" id="newCatSub" class="bo-input" placeholder="e.g., Chef limited-edition creations" required />
          </div>
        </div>
        ${photoField(
          'newCatImg',
          'Category Thumbnail Photo (Paste URL or Upload from Device)',
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80'
        )}
        ${modalFormButtons('Create Category')}
      </form>
    `
  );
}

async function submitAddCategory() {
  const name = byId('newCatName').value.trim();
  const subtitle = byId('newCatSub').value.trim();
  const thumbImg = byId('newCatImg').value.trim();
  const id = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  if (!id) {
    showError('Category title must contain letters or numbers.');
    return;
  }
  if (data.menuCategories.some(c => c.id === id)) {
    showError(`A category called "${name}" already exists.`);
    return;
  }
  data.menuCategories.unshift({
    id,
    rawCategory: name.toUpperCase(),
    name,
    subtitle,
    badge: subtitle,
    icon: 'fa-utensils',
    thumbImg,
    fallbackImg: thumbImg,
    modType: 'burger',
    count: 0,
    items: []
  });
  if (!(await saveMenu())) {
    data.menuCategories.shift();
    return;
  }
  closeModal();
  ui.menuCatFilter = id;
  renderActiveTab();
  showToast(`Category "${name}" created!`);
}

registerActions({
  'menu:edit-open': el => openEditDish(el.dataset.catId, el.dataset.itemId),
  'menu:edit-submit': form => submitEditDish(form),
  'menu:add-open': () => openAddDish(),
  'menu:add-submit': () => submitAddDish(),
  'menu:category-open': () => openAddCategory(),
  'menu:category-submit': () => submitAddCategory()
});
