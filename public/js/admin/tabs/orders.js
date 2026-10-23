// Orders tab: every WhatsApp order, catering quote and reservation with type/status filters
// and search. Card actions live in orders/actions.js.

import { registerActions } from '../../shared/actions.js';
import { esc } from '../../shared/dom.js';
import { data, ui } from '../state.js';
import { registerTab, renderActiveTab } from '../router.js';
import { isSoundEnabled } from '../ui/sound.js';
import { renderOrderCard } from '../orders/order-card.js';

const TYPE_TABS = [
  ['all', '', 'All Records'],
  ['delivery_order', 'fa-solid fa-motorcycle', 'Delivery Cart Orders'],
  ['catering_quote', 'fa-solid fa-crown', 'Catering & Wedding Quotes'],
  ['table_reservation', 'fa-solid fa-mountain-sun', 'Restaurant Reservations'],
  ['whatsapp_inquiry', 'fa-brands fa-whatsapp', 'Direct WhatsApp Clicks']
];

const STATUS_FILTERS = [
  ['all', 'All Statuses'],
  ['new', '🟡 New / Unread'],
  ['confirmed', '🔵 Confirmed'],
  ['preparing', '🟣 Preparing in Kitchen'],
  ['out_for_delivery', '🟠 Out for Delivery'],
  ['completed', '🟢 Completed'],
  ['cancelled', '🔴 Cancelled']
];

function matchesSearch(o, q) {
  if (!q) return true;
  return [o.id, o.customerName, o.customerPhone, o.address, o.eventType, o.packageSelected, o.notes]
    .concat((o.items || []).map(i => i.title))
    .join(' ')
    .toLowerCase()
    .includes(q);
}

function render() {
  const { orders } = data;
  const q = ui.orderSearch.toLowerCase().trim();
  const filtered = orders.filter(
    o =>
      (ui.orderTypeFilter === 'all' || o.type === ui.orderTypeFilter) &&
      (ui.orderStatusFilter === 'all' || o.status === ui.orderStatusFilter) &&
      matchesSearch(o, q)
  );
  const sound = isSoundEnabled();

  return `
    <div class="bo-panel">
      <div class="bo-panel-header">
        <div class="bo-pill-tabs">
          ${TYPE_TABS.map(([type, icon, label]) => {
            const count = type === 'all' ? orders.length : orders.filter(o => o.type === type).length;
            return `
              <button class="bo-pill-tab ${ui.orderTypeFilter === type ? 'active' : ''}" data-action="orders:filter-type" data-type="${type}">
                ${icon ? `<i class="${icon}"></i> ` : ''}${label} (${count})
              </button>`;
          }).join('')}
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="bo-btn bo-btn-outline" data-action="sound:toggle" title="Toggle Kitchen Chime for New Orders">
            <i class="fa-solid ${sound ? 'fa-bell' : 'fa-bell-slash'}" style="color:${sound ? '#16a34a' : 'var(--bo-muted)'};"></i>
            ${sound ? 'Chime: ON' : 'Chime: Muted'}
          </button>
          <button class="bo-btn bo-btn-outline" data-action="orders:export-csv">
            <i class="fa-solid fa-file-csv"></i> Export CSV
          </button>
          <button class="bo-btn bo-btn-gold" data-action="orders:manual-open">
            <i class="fa-solid fa-plus"></i> Log Manual Order
          </button>
        </div>
      </div>

      <div class="bo-panel-body">
        <div class="bo-toolbar">
          <div style="flex:1; min-width:260px; max-width:460px;">
            <input type="text" class="bo-input" placeholder="Search by Order ID, customer name, phone, address, dish, or event type..."
              value="${esc(ui.orderSearch)}" data-on-input="orders:search" data-focus-key="orders-search" aria-label="Search orders" />
          </div>

          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span style="font-size:0.78rem; font-weight:700; color:var(--bo-muted);">Filter Status:</span>
            <select class="bo-select" style="width:auto;" data-on-change="orders:filter-status" aria-label="Filter by status">
              ${STATUS_FILTERS.map(
                ([value, label]) =>
                  `<option value="${value}" ${ui.orderStatusFilter === value ? 'selected' : ''}>${label}</option>`
              ).join('')}
            </select>
          </div>
        </div>

        <div class="bo-orders-list">
          ${
            filtered.length === 0
              ? `<div style="text-align:center; padding:48px 20px; color:var(--bo-muted);">
                  <i class="fa-solid fa-inbox" style="font-size:2.4rem; margin-bottom:10px; opacity:0.5;"></i>
                  <div>No matching orders or inquiries found.</div>
                </div>`
              : filtered.map(renderOrderCard).join('')
          }
        </div>
      </div>
    </div>
  `;
}

registerActions({
  'orders:filter-type': el => {
    ui.orderTypeFilter = el.dataset.type;
    renderActiveTab();
  },
  'orders:filter-status': el => {
    ui.orderStatusFilter = el.value;
    renderActiveTab();
  },
  'orders:search': el => {
    ui.orderSearch = el.value;
    renderActiveTab();
  }
});

registerTab('orders', {
  title: 'Orders',
  subtitle: '',
  render
});
