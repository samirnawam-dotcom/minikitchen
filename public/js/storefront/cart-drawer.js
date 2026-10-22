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
        <div style="text-align:center; padding: 42px 16px; color: var(--text-muted);">
          <i class="fa-solid fa-bag-shopping" style="font-size: 3rem; color: #d1d5db; margin-bottom: 16px;"></i>
          <h4 style="color: var(--text-main); margin-bottom: 8px;">Your Order Bag is Empty</h4>
          <p style="font-size: 0.9rem; margin-bottom: 20px;">Browse our FineDine interactive menu and tap any dish to customize and add to your order.</p>
          <div style="display:flex; flex-direction:column; gap:10px;">
            <button class="btn btn-primary" data-action="nav:go" data-page="delivery">
              <i class="fa-solid fa-utensils"></i> Browse Digital Menu
            </button>
            <button class="btn btn-outline-dark" data-action="tracker:open">
              <i class="fa-solid fa-truck-fast"></i> Track Existing Order (#MK-XXXX)
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
          ? `<div style="font-size:0.76rem; color:#8c621d; margin-top:2px;"><i class="fa-solid fa-sliders"></i> ${esc(item.modifiers.join(', '))}</div>`
          : '';
      const noteText = item.note
        ? `<div style="font-size:0.75rem; color:#4b5563; font-style:italic; margin-top:2px;">Note: "${esc(item.note)}"</div>`
        : '';
      return `
        <div class="cart-item-row">
          <div style="flex:1; padding-right:10px;">
            <div style="font-weight:700; font-size:0.95rem;">${esc(item.title)}</div>
            ${modsText}
            ${noteText}
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:3px;">${formatPrice(item.priceValue)} each • Subtotal: <b>${formatPrice(sub)}</b></div>
          </div>
          <div class="cart-qty-controls">
            <button class="cart-qty-btn" data-action="cart:qty" data-key="${key}" data-delta="-1">-</button>
            <span style="font-weight:700; min-width:20px; text-align:center;">${item.qty}</span>
            <button class="cart-qty-btn" data-action="cart:qty" data-key="${key}" data-delta="1">+</button>
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
      ? `<div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
                  ${activePromos
                    .map(
                      p => `
                    <button
                      type="button"
                      data-action="cart:promo"
                      data-code="${esc(p.code)}"
                      style="background:rgba(197,155,39,0.12); border:1px dashed var(--brand-primary); color:var(--text-main); border-radius:999px; padding:2px 9px; font-size:0.7rem; font-weight:700; cursor:pointer;"
                    >
                      <i class="fa-solid fa-ticket"></i> ${esc(p.code)} (${esc(p.label)})
                    </button>
                  `
                    )
                    .join('')}
                </div>`
      : '';
  let status = '';
  if (pricing.promoObj) {
    status = `<div style="font-size:0.76rem; color:#15803d; font-weight:700; margin-top:5px;"><i class="fa-solid fa-circle-check"></i> ${esc(pricing.promoObj.label)} applied (-${formatPrice(pricing.discountUsd)})</div>`;
  } else if (pricing.promoError) {
    status = `<div style="font-size:0.76rem; color:#dc2626; font-weight:600; margin-top:5px;">${esc(pricing.promoError)}</div>`;
  }

  return `
        <div class="form-group" style="margin-bottom:8px;">
          <label style="font-size:0.76rem; font-weight:800; text-transform:uppercase; color:var(--text-muted);">
            <i class="fa-solid fa-tag" style="color:var(--brand-primary);"></i> Promo / Discount Code
          </label>
          <div style="display:flex; gap:6px;">
            <input
              type="text"
              id="cartPromoInput"
              class="form-control"
              style="padding:8px 11px; font-size:0.84rem; text-transform:uppercase;"
              placeholder="e.g. WELCOME10"
              value="${esc(state.appliedPromoCode)}"
            />
            <button type="button" class="btn btn-primary" style="padding:8px 14px; font-size:0.78rem; white-space:nowrap;" data-action="cart:promo">
              Apply
            </button>
            ${
              state.appliedPromoCode
                ? `<button type="button" class="btn btn-outline-dark" style="padding:8px 10px; font-size:0.78rem;" data-action="cart:promo" data-code="">✕</button>`
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
      <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); padding:16px; border-radius:12px;">
        <h5 style="margin-bottom:12px; font-size:0.9rem;"><i class="fa-solid fa-location-dot" style="color:#d94e28;"></i> Customer & Delivery Details</h5>
        <div class="form-group" style="margin-bottom:10px;">
          <label>Your Name *</label>
          <input type="text" id="cartCustName" class="form-control" value="${v('name')}" placeholder="e.g., Rami / Sarah" />
        </div>
        <div class="form-group" style="margin-bottom:10px;">
          <label>Phone / WhatsApp Number *</label>
          <input type="tel" id="cartCustPhone" class="form-control" value="${v('phone')}" placeholder="e.g., +961 3 123 456" />
        </div>
        <div class="form-group" style="margin-bottom:10px;">
          <label>Street / Building / Table Detail *</label>
          <input type="text" id="cartCustAddress" class="form-control" value="${v('address')}" placeholder="e.g., Near Main Square, Bldg 4, 2nd Floor" />
        </div>
        <div class="form-group">
          <label>General Kitchen Instructions</label>
          <input type="text" id="cartCustNotes" class="form-control" value="${v('notes')}" placeholder="e.g., Extra garlic dip, call on arrival" />
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
      <div style="margin-bottom: 16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:0.82rem; font-weight:700; text-transform:uppercase; color:var(--text-muted);">Selected Items (${cartCount()})</span>
          <button data-action="cart:clear" style="background:none; border:none; color:#dc2626; font-size:0.8rem; font-weight:600; cursor:pointer;">Clear All</button>
        </div>
        ${renderCartRows()}
      </div>

      <!-- ALEY DELIVERY ZONE CALCULATOR & PROMO CODE -->
      <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); padding:14px; border-radius:12px; margin-bottom:14px;">
        <div class="form-group" style="margin-bottom:10px;">
          <label style="font-size:0.76rem; font-weight:800; text-transform:uppercase; color:var(--text-muted);">
            <i class="fa-solid fa-motorcycle" style="color:#d94e28;"></i> Select Delivery Zone or Dine-In
          </label>
          <select class="form-control" style="padding:9px 12px; font-size:0.85rem; font-weight:600;" data-on-change="cart:zone">
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

        <div style="border-top:1px dashed var(--border-subtle); padding-top:10px; margin-top:8px; font-size:0.83rem; display:flex; flex-direction:column; gap:4px;">
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--text-muted);">Items Subtotal:</span>
            <b>${formatPrice(pricing.subtotalUsd)}</b>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--text-muted);">Delivery (${esc(pricing.activeZone?.name || 'Aley')}):</span>
            <b>${pricing.deliveryFeeUsd > 0 ? `+${formatPrice(pricing.deliveryFeeUsd)}` : 'FREE'}</b>
          </div>
          ${
            pricing.discountUsd > 0
              ? `<div style="display:flex; justify-content:space-between; color:#15803d;">
                  <span>Promo (${esc(pricing.promoObj.code)}):</span>
                  <b>-${formatPrice(pricing.discountUsd)}</b>
                </div>`
              : ''
          }
          <div style="display:flex; justify-content:space-between; font-size:0.95rem; padding-top:4px; border-top:1px solid var(--border-subtle);">
            <b>Grand Total:</b>
            <b style="color:var(--brand-primary-dark);">${formatPrice(pricing.grandTotalUsd)}</b>
          </div>
        </div>
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
