// Right-hand "WhatsApp Order Basket" drawer: cart lines, delivery zone, promo code, customer details
// and the WhatsApp checkout that records the order (#MK-XXXX) in the Back Office.

import { registerActions } from '../shared/actions.js';
import { esc } from '../shared/dom.js';
import { setItem } from '../shared/storage.js';
import { state, ZONE_STORAGE_KEY, cartCount } from './state.js';
import { getDeliveryZones, getPromoCodes } from './config.js';
import { changeCartQty, clearCartItems, computeCartPricing } from './cart.js';
import { formatPrice, usd, lbp } from './format.js';
import { allocateOrderId, recordOrder, rememberLastOrderId } from './orders.js';
import { openWhatsApp } from './whatsapp.js';
import { showCartDrawer, closeCartDrawer } from './navigation.js';
import { render } from './view.js';
import { showToast } from './toast.js';

const FORM_FIELDS = {
  name: 'cartCustName',
  phone: 'cartCustPhone',
  address: 'cartCustAddress',
  notes: 'cartCustNotes'
};

/** Keeps typed customer details across drawer re-renders. */
function cacheCartFormInputs() {
  for (const [key, id] of Object.entries(FORM_FIELDS)) {
    const el = document.getElementById(id);
    if (el) state.cartFormCache[key] = el.value;
  }
}

const fieldValue = id => document.getElementById(id)?.value?.trim() || '';

function renderEmptyCart(bodyEl, totalEl) {
  bodyEl.innerHTML = `
        <div class="cart-empty">
          <i class="fa-solid fa-bag-shopping"></i>
          <h4>Your basket is empty</h4>
          <p>Open the menu and tap any dish to add it.</p>
          <div class="cart-empty-actions">
            <button class="btn btn-primary btn-block" data-action="nav:go" data-page="delivery">Browse the menu</button>
            <button class="btn btn-outline btn-block" data-action="tracker:open">
              <i class="fa-solid fa-truck-fast"></i> Track an order
            </button>
          </div>
        </div>
      `;
  totalEl.textContent = formatPrice(0);
}

function renderCartRows() {
  return state.cart
    .map(item => {
      const sub = item.priceValue * item.qty;
      const key = esc(item.cartKey || item.id);
      const modsText =
        item.modifiers && item.modifiers.length > 0
          ? `<div class="cart-item-mods">${esc(item.modifiers.join(', '))}</div>`
          : '';
      const noteText = item.note ? `<div class="cart-item-note">Note: “${esc(item.note)}”</div>` : '';
      return `
        <div class="cart-item-row">
          <div class="cart-item-info">
            <div class="cart-item-title">${esc(item.title)}</div>
            ${modsText}
            ${noteText}
            <div class="cart-item-price">${formatPrice(item.priceValue)} each · <b>${formatPrice(sub)}</b></div>
          </div>
          <div class="cart-qty-controls">
            <button class="cart-qty-btn" data-action="cart:qty" data-key="${key}" data-delta="-1" aria-label="One less">−</button>
            <span class="cart-qty-val">${item.qty}</span>
            <button class="cart-qty-btn" data-action="cart:qty" data-key="${key}" data-delta="1" aria-label="One more">+</button>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderPromoSection(pricing) {
  const activePromos = getPromoCodes().filter(p => p.active !== false);
  const chips =
    activePromos.length > 0
      ? `<div class="promo-chips">
                  ${activePromos
                    .map(
                      p => `
                    <button type="button" class="promo-chip" data-action="cart:promo" data-code="${esc(p.code)}" title="${esc(p.label)}">
                      ${esc(p.code)} <span>${esc(p.label)}</span>
                    </button>
                  `
                    )
                    .join('')}
                </div>`
      : '';
  let status = '';
  if (pricing.promoObj) {
    status = `<div class="promo-status ok"><i class="fa-solid fa-circle-check"></i> ${esc(pricing.promoObj.label)} applied (−${formatPrice(pricing.discountUsd)})</div>`;
  } else if (pricing.promoError) {
    status = `<div class="promo-status error">${esc(pricing.promoError)}</div>`;
  }

  return `
        <div class="form-group">
          <label for="cartPromoInput">Promo code</label>
          <div class="promo-row">
            <input
              type="text"
              id="cartPromoInput"
              class="form-control form-control-sm promo-input"
              placeholder="e.g. WELCOME10"
              value="${esc(state.appliedPromoCode)}"
            />
            <button type="button" class="btn btn-outline btn-sm" data-action="cart:promo">Apply</button>
            ${
              state.appliedPromoCode
                ? `<button type="button" class="btn btn-outline btn-sm" data-action="cart:promo" data-code="" aria-label="Remove promo code">✕</button>`
                : ''
            }
          </div>
          ${chips}
          ${status}
        </div>`;
}

function renderCustomerForm() {
  const v = key => esc(state.cartFormCache[key] || '');
  return `
      <div class="cart-block">
        <h5 class="cart-block-title">Your details</h5>
        <div class="form-group">
          <label for="cartCustName">Name *</label>
          <input type="text" id="cartCustName" class="form-control" value="${v('name')}" placeholder="e.g. Rami" />
        </div>
        <div class="form-group">
          <label for="cartCustPhone">Phone / WhatsApp *</label>
          <input type="tel" id="cartCustPhone" class="form-control" value="${v('phone')}" placeholder="e.g. +961 3 123 456" />
        </div>
        <div class="form-group">
          <label for="cartCustAddress">Address or table *</label>
          <input type="text" id="cartCustAddress" class="form-control" value="${v('address')}" placeholder="Street, building, floor" />
        </div>
        <div class="form-group">
          <label for="cartCustNotes">Note for the kitchen</label>
          <input type="text" id="cartCustNotes" class="form-control" value="${v('notes')}" placeholder="e.g. extra garlic, call on arrival" />
        </div>
      </div>
    `;
}

export function renderCartDrawer() {
  const bodyEl = document.getElementById('cartDrawerBody');
  const totalEl = document.getElementById('cartDrawerTotal');
  if (!bodyEl || !totalEl) return;

  if (state.cart.length === 0) {
    renderEmptyCart(bodyEl, totalEl);
    return;
  }

  const pricing = computeCartPricing();
  const zones = getDeliveryZones();

  bodyEl.innerHTML = `
      <div class="cart-items">
        <div class="cart-items-head">
          <span class="eyebrow">Items · ${cartCount()}</span>
          <button class="cart-clear-btn" data-action="cart:clear">Clear all</button>
        </div>
        ${renderCartRows()}
      </div>

      <div class="cart-block">
        <div class="form-group">
          <label for="cartZoneSelect">Delivery area or dine-in</label>
          <select id="cartZoneSelect" class="form-control form-control-sm" data-on-change="cart:zone">
            ${zones
              .map(
                z => `
              <option value="${esc(z.id)}" ${pricing.activeZone?.id === z.id ? 'selected' : ''}>
                ${esc(z.name)} — ${Number(z.feeUsd) > 0 ? `+$${Number(z.feeUsd).toFixed(2)}` : 'FREE'} (${esc(z.eta || '25 min')})
              </option>
            `
              )
              .join('')}
          </select>
        </div>

        ${renderPromoSection(pricing)}

        <dl class="cart-summary">
          <div><dt>Items</dt><dd>${formatPrice(pricing.subtotalUsd)}</dd></div>
          <div><dt>Delivery (${esc(pricing.activeZone?.name || 'Aley')})</dt><dd>${pricing.deliveryFeeUsd > 0 ? `+${formatPrice(pricing.deliveryFeeUsd)}` : 'FREE'}</dd></div>
          ${
            pricing.discountUsd > 0
              ? `<div class="discount"><dt>Promo (${esc(pricing.promoObj.code)})</dt><dd>−${formatPrice(pricing.discountUsd)}</dd></div>`
              : ''
          }
          <div class="grand"><dt>Total</dt><dd>${formatPrice(pricing.grandTotalUsd)}</dd></div>
        </dl>
      </div>

      ${renderCustomerForm()}
    `;
  totalEl.textContent = formatPrice(pricing.grandTotalUsd);
}

export function openCartDrawer() {
  renderCartDrawer();
  showCartDrawer();
}

function applyPromoCode(code) {
  cacheCartFormInputs();
  const raw = code !== undefined ? code : document.getElementById('cartPromoInput')?.value || '';
  state.appliedPromoCode = String(raw).trim().toUpperCase();
  renderCartDrawer();
  const pricing = computeCartPricing();
  if (pricing.promoObj) {
    showToast(`Promo code ${pricing.promoObj.code} applied (-${formatPrice(pricing.discountUsd)})!`);
  } else if (pricing.promoError) {
    showToast(pricing.promoError);
  }
}

function buildOrderMessage({ orderId, name, phone, address, notes, zoneLabel, pricing }) {
  const itemLines = state.cart.map((item, idx) => {
    const sub = item.priceValue * item.qty;
    const modsPart = item.modifiers && item.modifiers.length ? `\n   ↳ _Options: ${item.modifiers.join(', ')}_` : '';
    const notePart = item.note ? `\n   ↳ _Note: ${item.note}_` : '';
    return `${idx + 1}. *${item.qty}x ${item.title}* (${usd(item.priceValue)}) = ${usd(sub)}${modsPart}${notePart}`;
  });

  const summaryLines = [
    `*Items Subtotal:* ${usd(pricing.subtotalUsd)}`,
    `*Delivery Zone (${zoneLabel}):* ${pricing.deliveryFeeUsd > 0 ? `+${usd(pricing.deliveryFeeUsd)}` : 'FREE'}`
  ];
  if (pricing.discountUsd > 0 && pricing.promoObj) {
    summaryLines.push(`*Promo Code (${pricing.promoObj.code}):* -${usd(pricing.discountUsd)}`);
  }

  const trackUrl = `${window.location.origin}/delivery.html?track=${orderId}`;
  return [
    state.tableNumber
      ? `🍽️ *DINE-IN TABLE #${state.tableNumber} ORDER — MINI KITCHEN RESTAURANT*`
      : `🍔 *NEW FINEDINE DIGITAL ORDER — MINI KITCHEN*`,
    `*Order Reference:* #${orderId}`,
    `-----------------------------------------`,
    `*Customer:* ${name}`,
    `*Phone:* ${phone}`,
    `*${state.tableNumber ? 'Table' : 'Zone & Address'}:* ${address}`,
    `*Order Notes:* ${notes}`,
    `-----------------------------------------`,
    `*SELECTED MENU ITEMS:*`,
    ...itemLines,
    `-----------------------------------------`,
    ...summaryLines,
    `💰 *GRAND TOTAL (USD):* *${usd(pricing.grandTotalUsd)}*`,
    `🇱🇧 *APPROX (LBP):* *${lbp(pricing.grandTotalUsd)}*`,
    `📍 *Track Live Status:* ${trackUrl}`,
    `-----------------------------------------`,
    `Please confirm my order (#${orderId}) and estimated preparation/delivery time. Thank you!`
  ].join('\n');
}

function checkoutViaWhatsApp() {
  if (state.cart.length === 0) {
    openWhatsApp('delivery');
    return;
  }
  cacheCartFormInputs();
  const name = fieldValue('cartCustName') || 'Valued Customer';
  const phone = fieldValue('cartCustPhone') || 'Sent via WhatsApp';
  const rawAddr = fieldValue('cartCustAddress') || 'To be shared on WhatsApp';
  const rawNotes = fieldValue('cartCustNotes') || 'None';

  const pricing = computeCartPricing();
  const zoneLabel = state.tableNumber
    ? `Dine-In Table #${state.tableNumber} (Aley Terrace)`
    : pricing.activeZone
      ? `${pricing.activeZone.name}`
      : 'Aley';
  const address = `${zoneLabel} — ${rawAddr}`;
  const promoSummary = pricing.promoObj ? `Promo ${pricing.promoObj.code} (-${usd(pricing.discountUsd)})` : '';
  const notes = [rawNotes, promoSummary].filter(s => s && s !== 'None').join(' | ') || 'None';

  const orderId = allocateOrderId();
  const message = buildOrderMessage({ orderId, name, phone, address, notes, zoneLabel, pricing });
  const promoNote = pricing.promoObj ? ` | Promo: ${pricing.promoObj.code}` : '';

  recordOrder({
    id: orderId,
    type: 'delivery_order',
    brand: state.tableNumber || state.currentPage === 'restaurant' ? 'restaurant' : 'delivery',
    customerName: name,
    customerPhone: phone,
    address,
    notes,
    items: JSON.parse(JSON.stringify(state.cart)),
    totalUsd: Number(pricing.grandTotalUsd.toFixed(2)),
    staffNotes: state.tableNumber
      ? `🍽️ DINE-IN TABLE #${state.tableNumber}${promoNote}`
      : `Zone: ${zoneLabel} (${usd(pricing.deliveryFeeUsd)})${promoNote}`,
    whatsappText: message
  });

  rememberLastOrderId(orderId);
  showToast(`Order #${orderId} recorded & opening WhatsApp...`);
  openWhatsApp(state.tableNumber ? 'restaurant' : 'delivery', message, true);
}

/** Re-renders everything that shows cart contents. */
function refreshAfterCartChange() {
  renderCartDrawer();
  render();
}

registerActions({
  'cart:open': openCartDrawer,
  'cart:close': closeCartDrawer,
  'cart:qty': el => {
    changeCartQty(el.dataset.key, Number(el.dataset.delta) || 0);
    refreshAfterCartChange();
  },
  'cart:clear': () => {
    clearCartItems();
    refreshAfterCartChange();
  },
  'cart:zone': el => {
    cacheCartFormInputs();
    state.selectedZoneId = el.value;
    setItem(ZONE_STORAGE_KEY, el.value);
    renderCartDrawer();
  },
  // data-code="" clears the code; no data-code reads the promo input
  'cart:promo': el => applyPromoCode(el.hasAttribute('data-code') ? el.dataset.code : undefined),
  'cart:checkout': checkoutViaWhatsApp
});
