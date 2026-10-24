// Order constants and the collapsible order card used by the Orders tab. A card shows a one-line
// summary (customer, what they asked for, status, total) with WhatsApp / Call buttons; the toggle
// opens the details: contact, event facts, the package-builder selections, status and staff note.
// Every order field comes from the public website, so all of it is escaped.

import { esc } from '../../shared/dom.js';
import { data, ui } from '../state.js';
import { formatUsd, formatLbp, formatDateTime, formatEventDate } from '../format.js';

export const STATUS_LABELS = {
  new: 'New',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for delivery / ready',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

export const TYPE_LABELS = {
  delivery_order: { icon: 'fa-solid fa-motorcycle', label: 'Delivery order', cls: 'delivery' },
  catering_quote: { icon: 'fa-solid fa-champagne-glasses', label: 'Catering request', cls: 'catering' },
  table_reservation: { icon: 'fa-solid fa-chair', label: 'Table booking', cls: 'restaurant' },
  whatsapp_inquiry: { icon: 'fa-brands fa-whatsapp', label: 'WhatsApp chat', cls: 'whatsapp' }
};

export const typeInfo = type => TYPE_LABELS[type] || TYPE_LABELS.delivery_order;

export function typeBadge(type) {
  const t = typeInfo(type);
  return `<span class="bo-badge ${t.cls}"><i class="${t.icon}" aria-hidden="true"></i> ${t.label}</span>`;
}

export function statusPill(status) {
  const s = STATUS_LABELS[status] ? status : 'new';
  return `<span class="bo-status-pill bo-status-${s}">${esc(STATUS_LABELS[s])}</span>`;
}

export const itemQty = item => Number(item.qty) || 1;
export const itemTotal = item => (Number(item.priceValue) || 0) * itemQty(item);

/** The customer's number in international digits for wa.me / tel: links ('' when unusable). */
export function customerPhoneDigits(o) {
  const digits = String(o.customerPhone || '').replace(/[^0-9]/g, '');
  if (digits.length < 7) return '';
  if (digits.startsWith('961')) return digits;
  if (digits.startsWith('00')) return digits.slice(2);
  return `961${digits.replace(/^0/, '')}`;
}

/** WhatsApp + Call buttons for an order (Call only when there is a usable number). */
export function contactButtons(o, { small = true } = {}) {
  const phone = customerPhoneDigits(o);
  const size = small ? 'bo-btn-sm' : '';
  const name = esc(o.customerName || 'customer');
  return `
    <button type="button" class="bo-btn bo-btn-wa ${size}" data-action="orders:whatsapp" data-id="${esc(o.id)}" aria-label="WhatsApp ${name}" title="Message on WhatsApp">
      <i class="fa-brands fa-whatsapp" aria-hidden="true"></i> <span class="bo-btn-label">WhatsApp</span>
    </button>
    ${
      phone
        ? `<a class="bo-btn bo-btn-outline ${size}" href="tel:+${phone}" aria-label="Call ${name}" title="Call ${esc(o.customerPhone)}">
            <i class="fa-solid fa-phone" aria-hidden="true"></i> <span class="bo-btn-label">Call</span>
          </a>`
        : ''
    }`;
}

/** Short description of what the customer asked for, for the summary line and dashboard lists. */
export function orderSummaryLine(o) {
  const items = Array.isArray(o.items) ? o.items : [];
  const parts = [];
  if (o.type === 'catering_quote' || o.type === 'table_reservation') {
    if (o.eventDate) parts.push(formatEventDate(o.eventDate));
    if (Number(o.guests) > 0) parts.push(`${Number(o.guests)} guests`);
    if (o.type === 'catering_quote' && o.packageSelected) parts.push(o.packageSelected);
    else if (o.eventType && parts.length < 2) parts.push(o.eventType);
  } else if (items.length) {
    const count = items.reduce((s, i) => s + itemQty(i), 0);
    parts.push(`${count} item${count === 1 ? '' : 's'}`);
    if (o.address) parts.push(o.address);
  } else if (o.notes) {
    parts.push(o.notes);
  }
  return parts.join(' · ');
}

function itemLines(items) {
  return items
    .map(
      item => `
        <div class="bo-item-line">
          <div>
            <b>${itemQty(item)} × ${esc(item.title)}</b>
            ${item.modifiers && item.modifiers.length ? `<div class="bo-item-sub">${esc(item.modifiers.join(', '))}</div>` : ''}
            ${item.note ? `<div class="bo-item-note">Note: “${esc(item.note)}”</div>` : ''}
          </div>
          <div class="bo-quote-price">${formatUsd(itemTotal(item))}</div>
        </div>`
    )
    .join('');
}

/**
 * Catering requests from the website package builder: one line per priced item and one per dish
 * list, with the chosen dishes underneath. Lines without a price are included or priced on request.
 */
function quoteLines(items) {
  return items
    .map(item => {
      const price = itemTotal(item);
      const picks = (item.modifiers || []).filter(Boolean);
      return `
        <div class="bo-quote-line">
          <div>
            <b>${itemQty(item) > 1 ? `${itemQty(item)} × ` : ''}${esc(item.title)}</b>
            ${picks.length ? `<ul class="bo-quote-picks">${picks.map(m => `<li>${esc(m)}</li>`).join('')}</ul>` : ''}
            ${item.note ? `<div class="bo-quote-note">${esc(item.note)}</div>` : ''}
          </div>
          <div class="bo-quote-price">${price > 0 ? formatUsd(price) : '<span class="bo-muted">—</span>'}</div>
        </div>`;
    })
    .join('');
}

function eventFacts(o) {
  const facts = [
    o.eventDate && ['Event date', formatEventDate(o.eventDate)],
    Number(o.guests) > 0 && ['Guests', String(Number(o.guests))],
    o.eventType && ['Occasion', o.eventType],
    o.packageSelected && ['Package', o.packageSelected]
  ].filter(Boolean);
  if (!facts.length) return '';
  return `<div class="bo-quote-facts">${facts
    .map(([label, value]) => `<div class="bo-quote-fact"><span>${label}</span><b>${esc(value)}</b></div>`)
    .join('')}</div>`;
}

function requestBody(o) {
  const items = Array.isArray(o.items) ? o.items : [];
  if (o.type === 'catering_quote') {
    return `
      <div class="bo-order-col-label">Event</div>
      ${eventFacts(o) || '<div class="bo-muted">No event details given.</div>'}
      ${items.length ? `<div class="bo-quote-head">What they chose</div>${quoteLines(items)}` : ''}`;
  }
  if (items.length) {
    const count = items.reduce((s, i) => s + itemQty(i), 0);
    return `<div class="bo-order-col-label">Ordered (${count} item${count === 1 ? '' : 's'})</div>${itemLines(items)}`;
  }
  return `<div class="bo-order-col-label">Details</div>${eventFacts(o) || '<div class="bo-muted">No details given.</div>'}`;
}

function statusSelect(o) {
  const id = esc(o.id);
  return `
    <label class="bo-label" for="status-${id}" style="margin:8px 0 0;">Status</label>
    <select class="bo-select" id="status-${id}" data-on-change="orders:set-status" data-id="${id}" data-no-dirty>
      ${Object.entries(STATUS_LABELS)
        .map(([value, label]) => `<option value="${value}" ${o.status === value ? 'selected' : ''}>${label}</option>`)
        .join('')}
    </select>`;
}

/** @param {object} o order  @param {{ open?: boolean }} [options] */
export function renderOrderCard(o, { open } = {}) {
  const id = esc(o.id);
  const isOpen = open ?? ui.openOrders.has(o.id);
  const total = Number(o.totalUsd) || 0;
  const detailsId = `order-details-${id}`;

  return `
    <article class="bo-order-card type-${esc(o.type)} status-${esc(o.status || 'new')}${isOpen ? ' is-open' : ''}" data-order-id="${id}">
      <div class="bo-order-summary">
        <button type="button" class="bo-order-toggle" data-action="orders:toggle" data-id="${id}"
          aria-expanded="${isOpen}" aria-controls="${detailsId}">
          <span class="bo-order-chevron" aria-hidden="true"><i class="fa-solid fa-chevron-down"></i></span>
          <span class="bo-order-who">
            <span class="bo-order-name">${esc(o.customerName || 'Customer')}</span>
            <span class="bo-order-line">${esc(orderSummaryLine(o) || o.id)}</span>
          </span>
        </button>
        <div class="bo-order-meta">
          ${typeBadge(o.type)}
          ${statusPill(o.status)}
          <span class="bo-muted" style="font-size:0.8rem;">#${id} · ${esc(formatDateTime(o.createdAt))}</span>
          <span class="bo-order-total">${total > 0 ? formatUsd(total) : 'Price to confirm'}</span>
        </div>
        <div class="bo-order-quick">${contactButtons(o)}</div>
      </div>

      <div class="bo-order-details" id="${detailsId}" ${isOpen ? '' : 'hidden'}>
        <div class="bo-order-grid">
          <div class="bo-order-col">
            <div class="bo-order-col-label">Customer</div>
            <div style="font-weight:700; color:var(--bo-text); font-size:1rem;">${esc(o.customerName || 'Customer')}</div>
            <div class="bo-order-fact"><i class="fa-solid fa-phone" aria-hidden="true"></i>
              ${
                customerPhoneDigits(o)
                  ? `<a href="tel:+${customerPhoneDigits(o)}">${esc(o.customerPhone)}</a>`
                  : `<span>${esc(o.customerPhone || 'No phone given — reply on WhatsApp')}</span>`
              }
            </div>
            ${o.address ? `<div class="bo-order-fact"><i class="fa-solid fa-location-dot" aria-hidden="true"></i><span>${esc(o.address)}</span></div>` : ''}
            ${o.notes ? `<div class="bo-note" style="margin-top:4px; white-space:pre-line;"><b>Customer note:</b> ${esc(o.notes)}</div>` : ''}
          </div>

          <div class="bo-order-items-box">${requestBody(o)}</div>

          <div class="bo-order-col">
            <div class="bo-order-col-label">${o.type === 'catering_quote' ? 'Estimated total' : 'Total'}</div>
            <div class="bo-order-big">${total > 0 ? formatUsd(total) : 'To confirm'}</div>
            ${total > 0 ? `<div class="bo-muted" style="font-size:0.82rem;">${formatLbp(total)}</div>` : ''}
            ${statusSelect(o)}
            <div data-dirty-scope style="border:0;">
              <label class="bo-label" for="note-${id}" style="margin:10px 0 6px;">Staff note <span class="bo-muted" style="font-weight:500;">(only you see this)</span></label>
              <div class="bo-order-note-row">
                <input type="text" class="bo-input" id="note-${id}" data-field="staffNotes"
                  value="${esc(o.staffNotes || '')}" placeholder="e.g. Tasting booked Saturday 4 pm" />
                <button type="button" class="bo-btn bo-btn-outline" data-action="orders:save-note" data-id="${id}" data-save-button>Save</button>
              </div>
              <div style="margin-top:6px;"><span class="bo-save-state">Unsaved note</span></div>
            </div>
          </div>
        </div>

        <div class="bo-order-actions">
          ${contactButtons(o, { small: false })}
          <button type="button" class="bo-btn bo-btn-outline" data-action="orders:print-ticket" data-id="${id}">
            <i class="fa-solid fa-print" aria-hidden="true"></i> Kitchen ticket
          </button>
          <button type="button" class="bo-btn bo-btn-outline" data-action="orders:print-proposal" data-id="${id}">
            <i class="fa-solid fa-file-invoice-dollar" aria-hidden="true"></i> ${o.type === 'catering_quote' ? 'Quotation PDF' : 'Invoice PDF'}
          </button>
          <button type="button" class="bo-btn bo-btn-danger" data-action="orders:delete" data-id="${id}">
            <i class="fa-solid fa-trash" aria-hidden="true"></i> Delete
          </button>
        </div>
      </div>
    </article>
  `;
}

/** Number of orders per type, for filter pills. */
export function countByType(type) {
  return type === 'all' ? data.orders.length : data.orders.filter(o => o.type === type).length;
}
