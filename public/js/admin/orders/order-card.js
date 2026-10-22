// Order constants and the order card used by the Dashboard and Orders tabs. Every order field
// comes from the public website, so all of it is escaped.

import { esc } from '../../shared/dom.js';
import { formatUsd, formatLbp, formatDateTime } from '../format.js';

export const STATUS_LABELS = {
  new: 'New / Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing in Kitchen',
  out_for_delivery: 'Out for Delivery',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

const STATUS_OPTIONS = {
  new: 'Status: New / Pending',
  confirmed: 'Status: Confirmed',
  preparing: 'Status: Preparing',
  out_for_delivery: 'Status: Out for Delivery',
  completed: 'Status: Completed',
  cancelled: 'Status: Cancelled'
};

export const TYPE_BADGES = {
  delivery_order: `<span class="bo-badge delivery"><i class="fa-solid fa-motorcycle"></i> Delivery Cart Order</span>`,
  catering_quote: `<span class="bo-badge catering"><i class="fa-solid fa-crown"></i> Catering & Event Quote</span>`,
  table_reservation: `<span class="bo-badge restaurant"><i class="fa-solid fa-mountain-sun"></i> Restaurant Table Booking</span>`,
  whatsapp_inquiry: `<span class="bo-badge restaurant"><i class="fa-brands fa-whatsapp"></i> WhatsApp Lead</span>`
};

export const itemQty = item => Number(item.qty) || 1;
export const itemTotal = item => (Number(item.priceValue) || 0) * itemQty(item);

function itemLines(items) {
  return items
    .map(
      item => `
        <div style="display:flex; justify-content:space-between; font-size:0.84rem; padding:4px 0; border-bottom:1px dashed #e5e7eb;">
          <div>
            <b>${itemQty(item)}x ${esc(item.title)}</b>
            ${
              item.modifiers && item.modifiers.length
                ? `<div style="font-size:0.74rem; color:var(--bo-gold-dark);">↳ ${esc(item.modifiers.join(', '))}</div>`
                : ''
            }
            ${item.note ? `<div style="font-size:0.73rem; color:var(--bo-muted); font-style:italic;">↳ Note: "${esc(item.note)}"</div>` : ''}
          </div>
          <div style="font-weight:700; white-space:nowrap; margin-left:8px;">${formatUsd(itemTotal(item))}</div>
        </div>
      `
    )
    .join('');
}

function eventDetails(o) {
  return `
    <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted); margin-bottom:6px;">
      Event / Reservation Details
    </div>
    ${o.eventType ? `<div style="font-size:0.85rem;"><b>Occasion:</b> ${esc(o.eventType)}</div>` : ''}
    ${o.eventDate ? `<div style="font-size:0.85rem;"><b>Date:</b> ${esc(o.eventDate)}</div>` : ''}
    ${o.guests ? `<div style="font-size:0.85rem;"><b>Guest Count:</b> ${Number(o.guests) || 0} Guests</div>` : ''}
    ${o.packageSelected ? `<div style="font-size:0.85rem; color:var(--bo-gold-dark);"><b>Package:</b> ${esc(o.packageSelected)}</div>` : ''}
  `;
}

export function renderOrderCard(o) {
  const id = esc(o.id);
  const items = Array.isArray(o.items) ? o.items : [];
  const btn = 'padding:7px 12px; font-size:0.76rem;';

  return `
    <div class="bo-order-card type-${esc(o.type)}" data-order-id="${id}">
      <div class="bo-order-top">
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <strong style="font-size:1rem; color:var(--bo-text);">${id}</strong>
          ${TYPE_BADGES[o.type] || TYPE_BADGES.delivery_order}
          <span class="bo-status-pill bo-status-${esc(o.status || 'new')}">${esc(STATUS_LABELS[o.status] || o.status)}</span>
          <span style="font-size:0.78rem; color:var(--bo-muted);">
            <i class="fa-regular fa-clock"></i> ${esc(formatDateTime(o.createdAt))}
          </span>
        </div>

        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <select class="bo-select" style="width:auto; padding:6px 10px; font-size:0.78rem; font-weight:700;"
            data-on-change="orders:set-status" data-id="${id}" aria-label="Order status">
            ${Object.entries(STATUS_OPTIONS)
              .map(
                ([value, label]) => `<option value="${value}" ${o.status === value ? 'selected' : ''}>${label}</option>`
              )
              .join('')}
          </select>

          <button class="bo-btn bo-btn-wa" style="${btn}" data-action="orders:whatsapp" data-id="${id}">
            <i class="fa-brands fa-whatsapp"></i> Reply on WhatsApp
          </button>
          <button class="bo-btn bo-btn-outline" style="${btn}" data-action="orders:print-ticket" data-id="${id}">
            <i class="fa-solid fa-print"></i> Print Ticket
          </button>
          <button class="bo-btn bo-btn-gold" style="${btn}" data-action="orders:print-proposal" data-id="${id}">
            <i class="fa-solid fa-file-invoice-dollar"></i> Proposal / PDF
          </button>
          <button class="bo-btn bo-btn-danger" style="padding:7px 10px; font-size:0.76rem;" data-action="orders:delete" data-id="${id}" title="Delete Record">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>

      <div class="bo-order-grid">
        <div>
          <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted); margin-bottom:4px;">Customer & Contact</div>
          <div style="font-weight:800; font-size:1rem; margin-bottom:4px;">${esc(o.customerName || 'Valued Customer')}</div>
          <div style="font-size:0.86rem; color:var(--bo-text); margin-bottom:4px;">
            <i class="fa-solid fa-phone" style="color:var(--bo-gold-dark); width:18px;"></i>
            <b>${esc(o.customerPhone || 'Sent via WhatsApp')}</b>
          </div>
          <div style="font-size:0.84rem; color:var(--bo-muted); margin-bottom:6px;">
            <i class="fa-solid fa-location-dot" style="color:var(--bo-terracotta); width:18px;"></i>
            ${esc(o.address || 'Ain Al Remmaneh, Aley')}
          </div>
          ${
            o.notes
              ? `<div style="font-size:0.8rem; background:#fffbeb; border:1px solid #fde68a; padding:7px 10px; border-radius:8px; color:#92400e; margin-top:6px;">
                  <b>Customer Note:</b> ${esc(o.notes)}
                </div>`
              : ''
          }
        </div>

        <div class="bo-order-items-box">
          ${
            items.length > 0
              ? `<div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted); margin-bottom:6px;">
                  Ordered Dishes (${items.reduce((s, i) => s + itemQty(i), 0)} items)
                </div>
                ${itemLines(items)}`
              : eventDetails(o)
          }
        </div>

        <div>
          <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted); margin-bottom:4px;">Order Total / Est. Value</div>
          <div style="font-family:var(--font-serif); font-size:1.55rem; font-weight:700; color:var(--bo-text);">
            ${o.totalUsd > 0 ? formatUsd(o.totalUsd) : 'Custom Quote'}
          </div>
          ${
            o.totalUsd > 0
              ? `<div style="font-size:0.78rem; color:var(--bo-muted); margin-bottom:10px;">${formatLbp(o.totalUsd)}</div>`
              : '<div style="margin-bottom:10px;"></div>'
          }
          <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted); margin-bottom:4px;">Internal Back Office Note</div>
          <div style="display:flex; gap:6px;">
            <input type="text" class="bo-input" style="padding:6px 9px; font-size:0.78rem;" data-field="staffNotes"
              value="${esc(o.staffNotes || '')}" placeholder="Add kitchen or event note..." aria-label="Internal note" />
            <button class="bo-btn bo-btn-outline" style="padding:6px 10px; font-size:0.75rem;" data-action="orders:save-note" data-id="${id}">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
