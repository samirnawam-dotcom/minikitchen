// Live order status tracker modal (#MK-XXXX): looks the reference up via /api/orders/track/:id,
// falls back to this browser's own order history when offline, and renders the status timeline.
// Everything coming from the API or the URL (?track=) is escaped.

import { registerActions } from '../shared/actions.js';
import { esc } from '../shared/dom.js';
import { trackOrder } from './api.js';
import { content } from './config.js';
import { getLastOrderId, loadLocalOrders } from './orders.js';
import { closeDrawers } from './navigation.js';

const STAGES = [
  { key: 'new', label: 'Order Received', icon: 'fa-receipt' },
  { key: 'confirmed', label: 'Confirmed', icon: 'fa-circle-check' },
  { key: 'preparing', label: 'Preparing in Kitchen', icon: 'fa-fire-burner' },
  { key: 'out_for_delivery', label: 'Out for Delivery / Ready', icon: 'fa-motorcycle' },
  { key: 'completed', label: 'Completed', icon: 'fa-face-smile-beam' }
];
const ORDER_TYPE_LABELS = { catering_quote: 'Catering & Event Quote', table_reservation: 'Restaurant Table Booking' };
const BRANDS = ['catering', 'restaurant', 'delivery'];

const normaliseId = raw =>
  String(raw || '')
    .trim()
    .replace(/^#/, '')
    .toUpperCase();

function ensureTrackerDom() {
  let backdrop = document.getElementById('orderTrackerBackdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'orderTrackerBackdrop';
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('data-action', 'tracker:backdrop');
    document.body.appendChild(backdrop);
  }
  return backdrop;
}

export function openOrderTracker(prefillId) {
  const backdrop = ensureTrackerDom();
  const initialId =
    prefillId || new URLSearchParams(window.location.search).get('track') || getLastOrderId() || 'MK-1001';

  backdrop.innerHTML = `
      <div class="modal-dialog tracker-dialog" role="dialog" aria-modal="true" aria-label="Track an order">
        <div class="modal-header">
          <div>
            <span class="eyebrow">Order tracker</span>
            <h3 class="modal-title">Track your order or quote</h3>
          </div>
          <button type="button" class="drawer-close-btn" data-action="tracker:close" aria-label="Close tracker">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="modal-body">
          <form data-on-submit="tracker:submit" class="tracker-form">
            <input
              type="text"
              id="trackOrderInput"
              class="form-control tracker-input"
              placeholder="Order reference, e.g. MK-1001"
              aria-label="Order reference"
              value="${esc(String(initialId).replace(/^#/, ''))}"
              required
            />
            <button type="submit" class="btn btn-primary">
              <i class="fa-solid fa-magnifying-glass"></i> Track
            </button>
          </form>

          <div id="trackOrderResultBox" class="tracker-result">
            <div class="tracker-loading">Looking up your order…</div>
          </div>
        </div>
      </div>
    `;

  backdrop.classList.add('open');
  lookupOrder(initialId);
}

export function closeOrderTracker() {
  document.getElementById('orderTrackerBackdrop')?.classList.remove('open');
}

function renderNotFound(cleanId) {
  const tryButton = id =>
    `<button type="button" class="chip" data-action="tracker:try" data-id="${id}">#${id}</button>`;
  return `
        <div class="tracker-card tracker-empty">
          <i class="fa-solid fa-circle-exclamation"></i>
          <h4>Order #${esc(cleanId)} not found</h4>
          <p>Please check the reference on your WhatsApp message, for example <b>MK-1001</b>.</p>
          <div class="chip-row chip-row-center">
            ${tryButton('MK-1001')}
            ${tryButton('MK-1002')}
            ${tryButton('MK-1004')}
          </div>
        </div>
      `;
}

function renderTimeline(order) {
  if (order.status === 'cancelled') {
    return `<div class="tracker-cancelled">
                <i class="fa-solid fa-ban"></i> This order was cancelled. Message us on WhatsApp if you need help.
              </div>`;
  }
  const currentIdx = Math.max(
    0,
    STAGES.findIndex(s => s.key === order.status)
  );
  return `
              <ol class="tracker-steps">
                ${STAGES.map((st, idx) => {
                  const step = idx === currentIdx ? 'active' : idx < currentIdx ? 'done' : '';
                  return `
                      <li class="tracker-step ${step}">
                        <span class="tracker-step-icon"><i class="fa-solid ${st.icon}"></i></span>
                        <span class="tracker-step-label">${st.label}</span>
                      </li>`;
                }).join('')}
              </ol>
            `;
}

function renderSummary(order) {
  if (Array.isArray(order.items) && order.items.length > 0) {
    return order.items
      .map(i => {
        const qty = Number(i.qty) || 1;
        const lineTotal = ((Number(i.priceValue) || 0) * qty).toFixed(2);
        return `<div class="tracker-line"><span><b>${qty}×</b> ${esc(i.title)}</span><b>$${lineTotal}</b></div>`;
      })
      .join('');
  }
  const row = (label, value) => (value ? `<div><b>${label}:</b> ${esc(value)}</div>` : '');
  return `<div class="tracker-facts">
            ${row('Occasion', order.eventType)}
            ${row('Event date', order.eventDate)}
            ${order.guests ? `<div><b>Guests:</b> ${esc(order.guests)}</div>` : ''}
            ${row('Package', order.packageSelected)}
          </div>`;
}

function renderOrder(order) {
  const id = esc(order.id);
  const total = Number(order.totalUsd);
  const rate = Number(order.lbpRate) || content.lbpRate;
  const updated = new Date(order.updatedAt || order.createdAt);
  const updatedText = Number.isNaN(updated.getTime())
    ? '—'
    : updated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const brand = BRANDS.includes(order.brand) ? order.brand : 'delivery';
  const chatMsg = `Hello Mini Kitchen! I am checking on my Order Reference *#${order.id}*.`;

  return `
      <div class="tracker-card">
        <div class="tracker-card-head">
          <div>
            <span class="eyebrow">Reference #${id}</span>
            <h4 class="tracker-card-title">
              ${esc(order.customerFirstName || order.customerName || 'Valued Guest')} — ${ORDER_TYPE_LABELS[order.type] || 'Delivery Order'}
            </h4>
          </div>
          <button type="button" class="chip" data-action="tracker:try" data-id="${id}">
            <i class="fa-solid fa-arrows-rotate"></i> Refresh
          </button>
        </div>

        ${renderTimeline(order)}

        <div class="tracker-summary">
          <div class="tracker-summary-label">Summary</div>
          ${renderSummary(order)}
          ${
            total > 0
              ? `<div class="tracker-total">
                  <span>Total</span>
                  <span>$${total.toFixed(2)} <small>(${Math.round(total * rate).toLocaleString('en-US')} L.L.)</small></span>
                </div>`
              : ''
          }
        </div>

        <div class="tracker-foot">
          <span class="tracker-updated"><i class="fa-regular fa-clock"></i> Updated ${updatedText}</span>
          <button
            type="button"
            class="btn btn-whatsapp btn-sm"
            data-action="wa:open"
            data-brand="${brand}"
            data-msg="${esc(chatMsg)}"
            data-skip-log
          >
            <i class="fa-brands fa-whatsapp"></i> Ask about #${id}
          </button>
        </div>
      </div>
    `;
}

async function lookupOrder(rawId) {
  const box = document.getElementById('trackOrderResultBox');
  if (!box) return;
  const cleanId = normaliseId(rawId);
  box.innerHTML = `<div class="tracker-loading"><i class="fa-solid fa-spinner fa-spin"></i> Looking up <b>#${esc(cleanId)}</b>…</div>`;

  // Fall back to this browser's own records when the server cannot be reached
  const order =
    (await trackOrder(cleanId)) || loadLocalOrders().find(o => o && String(o.id || '').toUpperCase() === cleanId);

  box.innerHTML = order ? renderOrder(order) : renderNotFound(cleanId);
}

registerActions({
  'tracker:open': () => {
    closeDrawers();
    openOrderTracker();
  },
  'tracker:close': closeOrderTracker,
  'tracker:backdrop': (el, event) => {
    if (event.target === el) closeOrderTracker();
  },
  'tracker:submit': () => {
    const val = document.getElementById('trackOrderInput')?.value?.trim() || '';
    if (val) lookupOrder(val);
  },
  'tracker:try': el => {
    const input = document.getElementById('trackOrderInput');
    if (input) input.value = el.dataset.id;
    lookupOrder(el.dataset.id);
  }
});
