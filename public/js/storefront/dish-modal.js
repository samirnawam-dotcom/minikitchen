// FineDine dish detail modal: photo, badges, modifier groups (radio / checkbox add-ons),
// special instructions, quantity stepper and "Add to Order".

import { registerActions } from '../shared/actions.js';
import { esc } from '../shared/dom.js';
import { state } from './state.js';
import { findDish, getModifierGroups } from './config.js';
import { addCartLine } from './cart.js';
import { formatPrice } from './format.js';
import { render } from './view.js';
import { showToast } from './toast.js';

const BADGES = {
  Popular: '<span class="fd-badge popular">Popular</span>',
  Spicy: '<span class="fd-badge spicy"><i class="fa-solid fa-pepper-hot"></i> Spicy</span>',
  Vegetarian: '<span class="fd-badge vegetarian"><i class="fa-solid fa-leaf"></i> Vegetarian</span>',
  Sharing: '<span class="fd-badge sharing">Sharing</span>'
};

function ensureModalDom() {
  let backdrop = document.getElementById('fdModalBackdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'fdModalBackdrop';
    backdrop.className = 'fd-modal-backdrop';
    backdrop.setAttribute('data-action', 'dish:backdrop');
    document.body.appendChild(backdrop);
  }
  return backdrop;
}

function renderModifierGroups(modGroups) {
  return modGroups
    .map(
      (grp, gIdx) => `
        <div class="fd-mod-group">
          <div class="fd-mod-header">
            <span class="fd-mod-name">${esc(grp.name)}</span>
            <span class="fd-mod-pill ${grp.required ? 'required' : 'optional'}">
              ${grp.required ? 'Required · choose 1' : 'Optional'}
            </span>
          </div>
          <div class="fd-mod-options-list">
            ${grp.options
              .map(
                (opt, oIdx) => `
              <label class="fd-mod-option">
                <span class="fd-mod-option-left">
                  <input
                    type="${grp.type === 'radio' ? 'radio' : 'checkbox'}"
                    name="fd-mod-${esc(grp.id)}"
                    data-group-idx="${gIdx}"
                    data-opt-idx="${oIdx}"
                    data-opt-label="${esc(opt.label)}"
                    data-opt-price="${Number(opt.price) || 0}"
                    ${opt.default ? 'checked' : ''}
                    data-on-change="dish:recalc"
                  />
                  <span>${esc(opt.label)}</span>
                </span>
                <span class="fd-mod-option-price">
                  ${opt.price > 0 ? `+ ${formatPrice(opt.price)}` : ''}
                </span>
              </label>
            `
              )
              .join('')}
          </div>
        </div>
      `
    )
    .join('');
}

export function openDishModal(itemId, mode) {
  const found = findDish(itemId);
  if (!found) return;
  const { item, cat } = found;
  const modGroups = getModifierGroups(cat);

  state.modalCtx = { item, cat, mode: mode || 'delivery', qty: 1, modGroups };

  const backdrop = ensureModalDom();
  const badgesHtml = (item.badges || []).map(b => BADGES[b] || '').join('');

  backdrop.innerHTML = `
      <div class="fd-modal-dialog" role="dialog" aria-modal="true">
        <div class="fd-modal-hero">
          <img src="${esc(item.img)}" data-fallback="${esc(item.fallbackImg)}" alt="${esc(item.title)}" />
          <button class="fd-modal-close" data-action="dish:close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
          <div class="fd-modal-hero-badges">
            <span class="fd-modal-chip">${esc(cat.name)}</span>
            <span class="fd-modal-chip"><i class="fa-regular fa-clock"></i> ${esc(item.prepTime || '15–20 min')}</span>
            ${badgesHtml}
          </div>
        </div>

        <div class="fd-modal-body">
          <div class="fd-modal-title-row">
            <h3 class="fd-modal-title">${esc(item.title)}</h3>
            <span class="fd-modal-base-price">${formatPrice(item.priceValue)}</span>
          </div>
          <p class="fd-modal-desc">
            ${esc(item.desc || 'Prepared fresh to order in our Ain Al Remmaneh, Aley kitchen using signature Mini Kitchen ingredients.')}
          </p>

          ${renderModifierGroups(modGroups)}

          <div class="fd-modal-notes-wrap">
            <label for="fdModalSpecialNote">Note for the kitchen (optional)</label>
            <input
              type="text"
              id="fdModalSpecialNote"
              class="form-control"
              placeholder="e.g. no pickles, allergy note…"
            />
          </div>
        </div>

        <div class="fd-modal-footer">
          <div class="fd-qty-stepper">
            <button type="button" class="fd-qty-btn" data-action="dish:qty" data-delta="-1">−</button>
            <span class="fd-qty-val" id="fdModalQtyDisplay">1</span>
            <button type="button" class="fd-qty-btn" data-action="dish:qty" data-delta="1">+</button>
          </div>
          <button type="button" class="fd-modal-submit-btn" id="fdModalSubmitBtn" data-action="dish:add">
            <span>Add to basket</span>
            <span id="fdModalLiveTotal">${formatPrice(item.priceValue)}</span>
          </button>
        </div>
      </div>
    `;

  backdrop.classList.add('open');
  recalcModalTotal();
}

export function closeDishModal() {
  document.getElementById('fdModalBackdrop')?.classList.remove('open');
  state.modalCtx = null;
}

const checkedOptions = () => [...document.querySelectorAll('#fdModalBackdrop .fd-mod-options-list input:checked')];

function recalcModalTotal() {
  if (!state.modalCtx) return;
  const base = Number(state.modalCtx.item.priceValue) || 0;
  const addons = checkedOptions().reduce((sum, inp) => sum + (Number(inp.getAttribute('data-opt-price')) || 0), 0);
  const totalEl = document.getElementById('fdModalLiveTotal');
  if (totalEl) totalEl.textContent = formatPrice((base + addons) * state.modalCtx.qty);
}

function changeModalQty(delta) {
  if (!state.modalCtx) return;
  state.modalCtx.qty = Math.max(1, state.modalCtx.qty + delta);
  const qtyEl = document.getElementById('fdModalQtyDisplay');
  if (qtyEl) qtyEl.textContent = state.modalCtx.qty;
  recalcModalTotal();
}

function confirmModalAdd() {
  if (!state.modalCtx) return;
  const { item, qty } = state.modalCtx;
  let addonsTotal = 0;
  const modifiers = [];

  for (const inp of checkedOptions()) {
    const label = inp.getAttribute('data-opt-label');
    const price = Number(inp.getAttribute('data-opt-price')) || 0;
    addonsTotal += price;
    if (price > 0) {
      modifiers.push(`${label} (+$${price.toFixed(2)})`);
    } else if (label && !label.includes('Classic Signature') && !label.includes('Chef Signature')) {
      modifiers.push(label);
    }
  }

  const note = document.getElementById('fdModalSpecialNote')?.value?.trim() || '';
  const unitPrice = (Number(item.priceValue) || 0) + addonsTotal;
  addCartLine({ item, qty, unitPrice, modifiers, note });

  closeDishModal();
  render();
  showToast(`Added ${qty}x "${item.title}" to your Order!`);
}

registerActions({
  // <div data-action="dish:open" data-id="mk-item-12" data-mode="delivery">
  'dish:open': el => openDishModal(el.dataset.id, el.dataset.mode),
  'dish:sold-out': () => showToast('This dish is currently marked Sold Out.'),
  'dish:close': closeDishModal,
  'dish:backdrop': (el, event) => {
    if (event.target === el) closeDishModal();
  },
  'dish:qty': el => changeModalQty(Number(el.dataset.delta) || 0),
  'dish:recalc': recalcModalTotal,
  'dish:add': confirmModalAdd
});
