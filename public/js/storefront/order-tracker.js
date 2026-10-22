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
    backdrop.className = 'qr-studio-backdrop';
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
      <div class="qr-studio-dialog" style="max-width:660px;" role="dialog" aria-modal="true" aria-label="Track Live Order Status">
        <div class="qr-studio-header">
          <div>
            <div style="font-size:0.72rem; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; color:var(--brand-primary); margin-bottom:4px;">
              <i class="fa-solid fa-truck-fast"></i> Live Kitchen & Delivery Order Tracker
            </div>
            <h3 style="font-family:var(--font-serif); font-size:1.45rem; margin:0;">
              Track Your Order or Catering Quote (#MK-XXXX)
            </h3>
          </div>
          <button
            type="button"
            data-action="tracker:close"
            style="width:38px; height:38px; border-radius:50%; background:rgba(255,255,255,0.12); color:#fff; border:none; cursor:pointer; font-size:1.1rem;"
            aria-label="Close Tracker"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="qr-studio-body">
          <form data-on-submit="tracker:submit" style="display:flex; gap:10px; margin-bottom:18px; flex-wrap:wrap;">
            <input
              type="text"
              id="trackOrderInput"
              class="form-control"
              style="flex:1; min-width:200px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em;"
              placeholder="Enter Order Reference (e.g. MK-1001)"
              value="${esc(String(initialId).replace(/^#/, ''))}"
              required
            />
            <button type="submit" class="btn btn-primary" style="padding:12px 22px;">
              <i class="fa-solid fa-magnifying-glass"></i> Track Status
            </button>
          </form>

          <div id="trackOrderResultBox" style="min-height:140px;">
            <div style="text-align:center; padding:26px; color:var(--text-muted); font-size:0.9rem;">
              Looking up order status...
            </div>
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
    `<button type="button" class="fd-qr-action-btn" data-action="tracker:try" data-id="${id}">Try #${id}</button>`;
  return `
        <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:16px; padding:24px; text-align:center;">
          <i class="fa-solid fa-circle-exclamation" style="font-size:2rem; color:#d94e28; margin-bottom:10px;"></i>
          <h4 style="margin-bottom:6px;">Order #${esc(cleanId)} Not Found</h4>
          <p style="font-size:0.86rem; color:var(--text-muted); margin-bottom:14px;">
            Please check your Order Reference ID (for example: <b>MK-1001</b>, <b>MK-1002</b>, <b>MK-1003</b>, or <b>MK-1004</b>).
          </p>
          <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap;">
            ${tryButton('MK-1001')}
            ${tryButton('MK-1002')}
            ${tryButton('MK-1004')}
          </div>
        </div>
      `;
}

function renderTimeline(order) {
  if (order.status === 'cancelled') {
    return `<div style="background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; padding:12px 16px; border-radius:12px; font-weight:700; margin-bottom:16px;">
                <i class="fa-solid fa-ban"></i> This order or inquiry has been marked as Cancelled. Please message us on WhatsApp if you need assistance.
              </div>`;
  }
  const currentIdx = Math.max(
    0,
    STAGES.findIndex(s => s.key === order.status)
  );
  return `
              <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:8px; margin-bottom:18px;">
                ${STAGES.map((st, idx) => {
                  const done = idx <= currentIdx;
                  const active = idx === currentIdx;
                  return `
                      <div style="text-align:center; padding:10px 6px; border-radius:12px; border:1px solid ${
                        active ? 'var(--brand-primary)' : done ? '#16a34a' : 'var(--border-subtle)'
                      }; background:${active ? 'rgba(197,155,39,0.14)' : done ? 'rgba(22,163,74,0.08)' : 'var(--bg-elevated)'};">
                        <div style="font-size:1rem; color:${done ? '#16a34a' : 'var(--text-muted)'}; margin-bottom:4px;">
                          <i class="fa-solid ${st.icon}"></i>
                        </div>
                        <div style="font-size:0.7rem; font-weight:${active ? '800' : '600'}; color:var(--text-main); line-height:1.25;">
                          ${st.label}
                        </div>
                      </div>
                    `;
                }).join('')}
              </div>
            `;
}

function renderSummary(order) {
  if (Array.isArray(order.items) && order.items.length > 0) {
    return order.items
      .map(i => {
        const qty = Number(i.qty) || 1;
        const lineTotal = ((Number(i.priceValue) || 0) * qty).toFixed(2);
        return `<div style="display:flex; justify-content:space-between; font-size:0.84rem; padding:4px 0; border-bottom:1px dashed var(--border-subtle);"><span><b>${qty}x</b> ${esc(i.title)}</span><b>$${lineTotal}</b></div>`;
      })
      .join('');
  }
  const row = (label, value) => (value ? `<div><b>${label}:</b> ${esc(value)}</div>` : '');
  return `<div style="font-size:0.85rem; color:var(--text-muted);">
            ${row('Occasion', order.eventType)}
            ${row('Event Date', order.eventDate)}
            ${order.guests ? `<div><b>Guest Count:</b> ${esc(order.guests)} Guests</div>` : ''}
            ${row('Selected Package', order.packageSelected)}
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
      <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:16px; padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px;">
          <div>
            <span style="font-size:0.74rem; font-weight:800; text-transform:uppercase; color:var(--brand-primary);">Reference #${id}</span>
            <h4 style="font-family:var(--font-serif); font-size:1.25rem; margin:2px 0 0;">
              ${esc(order.customerFirstName || order.customerName || 'Valued Guest')} — ${ORDER_TYPE_LABELS[order.type] || 'Delivery Order'}
            </h4>
          </div>
          <button type="button" class="fd-qr-action-btn" data-action="tracker:try" data-id="${id}">
            <i class="fa-solid fa-arrows-rotate"></i> Refresh Live Status
          </button>
        </div>

        ${renderTimeline(order)}

        <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:12px; padding:14px; margin-bottom:14px;">
          <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--text-muted); margin-bottom:6px;">Order / Inquiry Summary</div>
          ${renderSummary(order)}
          ${
            total > 0
              ? `<div style="display:flex; justify-content:space-between; align-items:center; padding-top:8px; margin-top:6px; border-top:1px solid var(--border-subtle); font-weight:800;">
                  <span>Total Value:</span>
                  <span style="color:var(--brand-primary-dark);">$${total.toFixed(2)} (${Math.round(total * rate).toLocaleString('en-US')} L.L.)</span>
                </div>`
              : ''
          }
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <span style="font-size:0.76rem; color:var(--text-muted);">
            <i class="fa-regular fa-clock"></i> Last updated: ${updatedText}
          </span>
          <button
            type="button"
            class="btn btn-whatsapp"
            style="padding:9px 16px; font-size:0.82rem;"
            data-action="wa:open"
            data-brand="${brand}"
            data-msg="${esc(chatMsg)}"
            data-skip-log
          >
            <i class="fa-brands fa-whatsapp"></i> Chat About #${id} on WhatsApp
          </button>
        </div>
      </div>
    `;
}

async function lookupOrder(rawId) {
  const box = document.getElementById('trackOrderResultBox');
  if (!box) return;
  const cleanId = normaliseId(rawId);
  box.innerHTML = `<div style="text-align:center; padding:26px; color:var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Checking SQLite database for <b>#${esc(cleanId)}</b>...</div>`;

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
