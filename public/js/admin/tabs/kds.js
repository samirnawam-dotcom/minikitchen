// Kitchen Display (KDS) tab: active orders in four status columns (oldest first) with items,
// notes, elapsed time and one-tap buttons that move an order to the next status.
// The 8-second background sync re-renders this tab so the ages stay current.

import { esc } from '../../shared/dom.js';
import { data } from '../state.js';
import { formatAge, minutesSince } from '../format.js';
import { registerTab } from '../router.js';
import { isSoundEnabled } from '../ui/sound.js';
import { itemQty } from '../orders/order-card.js';

const COLUMNS = [
  { status: 'new', label: 'New Orders', icon: 'fa-solid fa-bell', next: 'confirmed', action: 'Accept & Confirm' },
  {
    status: 'confirmed',
    label: 'Confirmed',
    icon: 'fa-solid fa-circle-check',
    next: 'preparing',
    action: 'Start Preparing'
  },
  {
    status: 'preparing',
    label: 'Preparing in Kitchen',
    icon: 'fa-solid fa-fire-burner',
    next: 'out_for_delivery',
    action: 'Ready / Out for Delivery'
  },
  {
    status: 'out_for_delivery',
    label: 'Out for Delivery / Ready',
    icon: 'fa-solid fa-motorcycle',
    next: 'completed',
    action: 'Mark Completed'
  }
];

const TYPE_LABELS = {
  delivery_order: ['fa-solid fa-motorcycle', 'Delivery'],
  catering_quote: ['fa-solid fa-crown', 'Catering'],
  table_reservation: ['fa-solid fa-mountain-sun', 'Restaurant'],
  whatsapp_inquiry: ['fa-brands fa-whatsapp', 'WhatsApp Lead']
};

const WARN_MINUTES = 20;
const LATE_MINUTES = 40;

function ticketBody(o) {
  const items = Array.isArray(o.items) ? o.items : [];
  if (items.length > 0) {
    return `
      <ul class="bo-kds-items">
        ${items
          .map(
            item => `
          <li>
            <b class="bo-kds-qty">${itemQty(item)}×</b>
            <div>
              <div class="bo-kds-item-title">${esc(item.title)}</div>
              ${item.modifiers && item.modifiers.length ? `<div class="bo-kds-mods">↳ ${esc(item.modifiers.join(', '))}</div>` : ''}
              ${item.note ? `<div class="bo-kds-item-note">↳ "${esc(item.note)}"</div>` : ''}
            </div>
          </li>`
          )
          .join('')}
      </ul>`;
  }
  const details = [
    o.eventType && `<div><b>Occasion:</b> ${esc(o.eventType)}</div>`,
    o.eventDate && `<div><b>Date:</b> ${esc(o.eventDate)}</div>`,
    o.guests && `<div><b>Guests:</b> ${Number(o.guests) || 0}</div>`,
    o.packageSelected && `<div><b>Package:</b> ${esc(o.packageSelected)}</div>`
  ].filter(Boolean);
  return `<div class="bo-kds-event">${details.join('') || '<div>No items listed.</div>'}</div>`;
}

function ticket(o, column, now) {
  const minutes = minutesSince(o.createdAt, now);
  const ageClass = minutes >= LATE_MINUTES ? 'late' : minutes >= WARN_MINUTES ? 'warn' : 'ok';
  const [typeIcon, typeLabel] = TYPE_LABELS[o.type] || TYPE_LABELS.delivery_order;
  const id = esc(o.id);
  return `
    <article class="bo-kds-ticket age-${ageClass}">
      <div class="bo-kds-ticket-top">
        <strong>${id}</strong>
        <span class="bo-kds-age" title="Time since the order was placed"><i class="fa-regular fa-clock"></i> ${formatAge(minutes)}</span>
      </div>
      <div class="bo-kds-meta">
        <span><i class="${typeIcon}"></i> ${typeLabel}</span>
        <span class="bo-kds-customer">${esc(o.customerName || 'Customer')}</span>
      </div>
      ${ticketBody(o)}
      ${o.notes ? `<div class="bo-kds-note"><b>Note:</b> ${esc(o.notes)}</div>` : ''}
      ${o.staffNotes ? `<div class="bo-kds-staff-note"><i class="fa-solid fa-user-tie"></i> ${esc(o.staffNotes)}</div>` : ''}
      <div class="bo-kds-actions">
        <button type="button" class="bo-btn bo-btn-primary" data-action="orders:advance" data-id="${id}" data-status="${column.next}">
          ${column.action} <i class="fa-solid fa-arrow-right"></i>
        </button>
        <button type="button" class="bo-btn bo-btn-outline" data-action="orders:print-ticket" data-id="${id}" title="Print Ticket" aria-label="Print ticket ${id}">
          <i class="fa-solid fa-print"></i>
        </button>
      </div>
    </article>
  `;
}

function render() {
  const now = Date.now();
  const byAge = (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  const active = data.orders.filter(o => COLUMNS.some(c => c.status === o.status));
  const sound = isSoundEnabled();

  return `
    <div class="bo-panel">
      <div class="bo-panel-header">
        <div>
          <div class="bo-panel-title"><i class="fa-solid fa-fire-burner" style="color:var(--bo-terracotta);"></i> Live Kitchen Board (${active.length} Active)</div>
          <div style="font-size:0.8rem; color:var(--bo-muted);">Oldest orders first • Tickets turn amber after ${WARN_MINUTES} min and red after ${LATE_MINUTES} min • Refreshes automatically</div>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="bo-btn bo-btn-outline" data-action="sound:toggle" title="Toggle Kitchen Chime for New Orders">
            <i class="fa-solid ${sound ? 'fa-bell' : 'fa-bell-slash'}" style="color:${sound ? '#16a34a' : 'var(--bo-muted)'};"></i>
            ${sound ? 'Chime: ON' : 'Chime: Muted'}
          </button>
          <button class="bo-btn bo-btn-outline" data-action="nav:tab" data-tab="orders">
            <i class="fa-solid fa-list"></i> All Orders
          </button>
        </div>
      </div>
      <div class="bo-panel-body">
        <div class="bo-kds-board">
          ${COLUMNS.map(column => {
            const list = active.filter(o => o.status === column.status).sort(byAge);
            return `
              <section class="bo-kds-col status-${column.status}" aria-label="${column.label}">
                <header class="bo-kds-col-head">
                  <span><i class="${column.icon}"></i> ${column.label}</span>
                  <span class="bo-kds-count">${list.length}</span>
                </header>
                <div class="bo-kds-col-body">
                  ${list.length ? list.map(o => ticket(o, column, now)).join('') : '<div class="bo-kds-empty">No orders</div>'}
                </div>
              </section>`;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

registerTab('kds', {
  title: 'Live Kitchen Display System (KDS) Kanban Board',
  subtitle: 'Real-time 4-column kitchen workflow board with elapsed timers and 1-tap status progression',
  render
});
