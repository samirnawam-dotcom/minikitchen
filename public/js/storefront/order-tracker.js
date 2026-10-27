// Live order status tracker modal (#MK-XXXX): looks the reference up via /api/orders/track/:id,
// falls back to this browser's own order history when offline, and renders the status timeline.
// The server only answers with proof the order is the visitor's: the private key from a tracking
// link (?track=…&key=…) or from this browser's own order, or the last 4 digits of the phone used.
// Everything coming from the API or the URL is escaped.

import { registerActions } from '../shared/actions.js';
import { esc } from '../shared/dom.js';
import { trackOrder } from './api.js';
import { content } from './config.js';
import { getLastOrderId, loadLocalOrders } from './orders.js';
import { closeDrawers } from './navigation.js';
import { isAr, t } from './i18n-strings.js';

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

/** The private key for an order: from the tracking link, else from this browser's own copy. */
function keyFor(cleanId, linkKey) {
  if (linkKey) return linkKey;
  const own = loadLocalOrders().find(o => o && String(o.id || '').toUpperCase() === cleanId);
  return (own && own.trackKey) || '';
}

let linkKey = '';

export function openOrderTracker(prefillId, prefillKey = '') {
  const backdrop = ensureTrackerDom();
  const params = new URLSearchParams(window.location.search);
  const initialId = prefillId || params.get('track') || getLastOrderId() || '';
  linkKey = prefillKey || (initialId && initialId === params.get('track') ? params.get('key') || '' : '');

  backdrop.innerHTML = `
      <div class="modal-dialog tracker-dialog" role="dialog" aria-modal="true" aria-label="${t('Track an order')}">
        <div class="modal-header">
          <div>
            <span class="eyebrow">${t('Order tracker')}</span>
            <h3 class="modal-title">${t('Track your order or quote')}</h3>
          </div>
          <button type="button" class="drawer-close-btn" data-action="tracker:close" aria-label="${t('Close tracker')}">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="modal-body">
          <form data-on-submit="tracker:submit" class="tracker-form">
            <input
              type="text"
              id="trackOrderInput"
              class="form-control tracker-input"
              placeholder="${t('Order reference, e.g. MK-1001')}"
              aria-label="${t('Order reference')}"
              value="${esc(String(initialId).replace(/^#/, ''))}"
              autocomplete="off"
              required
            />
            <input
              type="text"
              id="trackPhoneInput"
              class="form-control tracker-input tracker-phone"
              placeholder="${t('Last 4 digits of your phone')}"
              aria-label="${t('Last 4 digits of the phone number you ordered with')}"
              inputmode="numeric"
              autocomplete="off"
              maxlength="4"
              pattern="[0-9]{4}"
            />
            <button type="submit" class="btn btn-primary">
              <i class="fa-solid fa-magnifying-glass"></i> ${t('Track')}
            </button>
          </form>

          <div id="trackOrderResultBox" class="tracker-result">
            <div class="tracker-loading">${t('Looking up your order…')}</div>
          </div>
        </div>
      </div>
    `;

  backdrop.classList.add('open');
  const id = normaliseId(initialId);
  if (id && keyFor(id, linkKey)) lookupOrder(id);
  else showPrompt();
}

function showPrompt() {
  const box = document.getElementById('trackOrderResultBox');
  if (box) {
    box.innerHTML = `<div class="tracker-card tracker-empty tracker-hint">
          <i class="fa-solid fa-lock"></i>
          <p>${t('Enter your order reference and the last 4 digits of the phone number you ordered with.')}</p>
        </div>`;
  }
}

export function closeOrderTracker() {
  document.getElementById('orderTrackerBackdrop')?.classList.remove('open');
}

function renderNotFound(message) {
  return `
        <div class="tracker-card tracker-empty">
          <i class="fa-solid fa-circle-exclamation"></i>
          <p>${esc(message)}</p>
          <p class="tracker-help">${t('You can also message us on WhatsApp with your order reference.')}</p>
        </div>
      `;
}

function renderTimeline(order) {
  if (order.status === 'cancelled') {
    return `<div class="tracker-cancelled">
                <i class="fa-solid fa-ban"></i> ${t('This order was cancelled. Message us on WhatsApp if you need help.')}
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
                        <span class="tracker-step-label">${t(st.label)}</span>
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
  const row = (label, value) => (value ? `<div><b>${t(label)}:</b> ${esc(value)}</div>` : '');
  return `<div class="tracker-facts">
            ${row('Occasion', order.eventType)}
            ${row('Event date', order.eventDate)}
            ${order.guests ? `<div><b>${t('Guests')}:</b> ${esc(order.guests)}</div>` : ''}
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
    : updated.toLocaleTimeString(isAr() ? 'ar-LB-u-nu-latn' : [], { hour: '2-digit', minute: '2-digit' });
  const brand = BRANDS.includes(order.brand) ? order.brand : 'delivery';
  const chatMsg = `Hello Mini Kitchen! I am checking on my Order Reference *#${order.id}*.`;

  return `
      <div class="tracker-card">
        <div class="tracker-card-head">
          <div>
            <span class="eyebrow">${t('Reference #{id}', { id })}</span>
            <h4 class="tracker-card-title">
              ${esc(order.customerFirstName || order.customerName || t('Valued Guest'))} — ${t(ORDER_TYPE_LABELS[order.type] || 'Delivery Order')}
            </h4>
          </div>
          <button type="button" class="chip" data-action="tracker:try" data-id="${id}">
            <i class="fa-solid fa-arrows-rotate"></i> ${t('Refresh')}
          </button>
        </div>

        ${renderTimeline(order)}

        <div class="tracker-summary">
          <div class="tracker-summary-label">${t('Summary')}</div>
          ${renderSummary(order)}
          ${
            total > 0
              ? `<div class="tracker-total">
                  <span>${t('Total')}</span>
                  <span>$${total.toFixed(2)} <small>(${Math.round(total * rate).toLocaleString('en-US')} L.L.)</small></span>
                </div>`
              : ''
          }
        </div>

        <div class="tracker-foot">
          <span class="tracker-updated"><i class="fa-regular fa-clock"></i> ${t('Updated {time}', { time: updatedText })}</span>
          <button
            type="button"
            class="btn btn-whatsapp btn-sm"
            data-action="wa:open"
            data-brand="${brand}"
            data-msg="${esc(chatMsg)}"
            data-skip-log
          >
            <i class="fa-brands fa-whatsapp"></i> ${t('Ask about #{id}', { id })}
          </button>
        </div>
      </div>
    `;
}

async function lookupOrder(rawId, phone = '') {
  const box = document.getElementById('trackOrderResultBox');
  if (!box) return;
  const cleanId = normaliseId(rawId);
  box.innerHTML = `<div class="tracker-loading"><i class="fa-solid fa-spinner fa-spin"></i> ${t('Looking up <b>#{id}</b>…', { id: esc(cleanId) })}</div>`;

  const own = loadLocalOrders().find(o => o && String(o.id || '').toUpperCase() === cleanId);
  const result = await trackOrder(cleanId, { key: keyFor(cleanId, linkKey), phone });
  if (result && result.order) {
    box.innerHTML = renderOrder(result.order);
    return;
  }
  // Offline, or the server cannot confirm it yet: this browser's own copy of its own order
  if (own && (!result || !result.status || result.status >= 500)) {
    box.innerHTML = renderOrder(own);
    return;
  }
  box.innerHTML = renderNotFound(
    result && result.status === 429
      ? t('Too many attempts. Please wait a few minutes or message us on WhatsApp.')
      : t('We could not find an order with that reference and phone number. Please check both and try again.')
  );
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
    const phone = (document.getElementById('trackPhoneInput')?.value || '').replace(/\D/g, '');
    if (!val) return;
    if (normaliseId(val) !== normaliseId(new URLSearchParams(window.location.search).get('track'))) linkKey = '';
    if (!phone && !keyFor(normaliseId(val), linkKey)) {
      showPrompt();
      document.getElementById('trackPhoneInput')?.focus();
      return;
    }
    lookupOrder(val, phone);
  },
  'tracker:try': el =>
    lookupOrder(el.dataset.id, (document.getElementById('trackPhoneInput')?.value || '').replace(/\D/g, ''))
});
