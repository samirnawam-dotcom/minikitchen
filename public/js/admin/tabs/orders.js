// Orders tab: every website order, catering request, table booking and WhatsApp chat, with
// type / status filters and search. Cards are collapsible; their actions live in orders/actions.js.

import { registerActions } from '../../shared/actions.js';
import { esc } from '../../shared/dom.js';
import { data, ui } from '../state.js';
import { registerTab, renderActiveTab } from '../router.js';
import { isSoundEnabled } from '../ui/sound.js';
import { renderOrderCard, countByType, STATUS_LABELS } from '../orders/order-card.js';

const TYPE_TABS = [
  ['all', '', 'All'],
  ['catering_quote', 'fa-solid fa-champagne-glasses', 'Catering requests'],
  ['delivery_order', 'fa-solid fa-motorcycle', 'Delivery'],
  ['table_reservation', 'fa-solid fa-chair', 'Table bookings'],
  ['whatsapp_inquiry', 'fa-brands fa-whatsapp', 'WhatsApp chats']
];

const STATUS_FILTERS = [
  ['all', 'Any status'],
  ['open', 'Still to handle (not completed or cancelled)'],
  ...Object.entries(STATUS_LABELS)
];

const EMPTY_TEXT = {
  catering_quote: [
    'No catering requests yet',
    'They appear here when a customer sends a package from the website’s package builder.'
  ],
  delivery_order: [
    'No delivery orders yet',
    'They appear here when a customer sends their cart from the Delivery page.'
  ],
  table_reservation: ['No table bookings yet', 'They appear here when a guest books a table on the Restaurant page.'],
  whatsapp_inquiry: ['No WhatsApp chats yet', 'They appear here when a visitor taps a WhatsApp button on the website.'],
  all: ['No orders yet', 'Orders and catering requests appear here as soon as customers send them from the website.']
};

function matchesSearch(o, q) {
  if (!q) return true;
  return [o.id, o.customerName, o.customerPhone, o.address, o.eventType, o.packageSelected, o.notes, o.eventDate]
    .concat((o.items || []).map(i => i.title))
    .join(' ')
    .toLowerCase()
    .includes(q);
}

function matchesStatus(o) {
  if (ui.orderStatusFilter === 'all') return true;
  if (ui.orderStatusFilter === 'open') return o.status !== 'completed' && o.status !== 'cancelled';
  return o.status === ui.orderStatusFilter;
}

function emptyState(filtered) {
  const q = ui.orderSearch.trim();
  if (data.orders.length > 0 && (q || ui.orderStatusFilter !== 'all') && filtered) {
    return `
      <div class="bo-empty">
        <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
        <div class="bo-empty-title">Nothing matches these filters</div>
        <p>Try another search word or status.</p>
        <button type="button" class="bo-btn bo-btn-outline" data-action="orders:clear-filters">Clear filters</button>
      </div>`;
  }
  const [title, text] = EMPTY_TEXT[ui.orderTypeFilter] || EMPTY_TEXT.all;
  return `
    <div class="bo-empty">
      <i class="fa-solid fa-inbox" aria-hidden="true"></i>
      <div class="bo-empty-title">${title}</div>
      <p>${text}</p>
    </div>`;
}

function render() {
  const { orders } = data;
  const q = ui.orderSearch.toLowerCase().trim();
  const ofType = orders.filter(o => ui.orderTypeFilter === 'all' || o.type === ui.orderTypeFilter);
  const filtered = ofType.filter(o => matchesStatus(o) && matchesSearch(o, q));
  const sound = isSoundEnabled();
  const filtersActive = q || ui.orderStatusFilter !== 'all' || ui.orderTypeFilter !== 'all';

  return `
    <div class="bo-panel">
      <div class="bo-panel-header">
        <div class="bo-pill-tabs" role="group" aria-label="Show">
          ${TYPE_TABS.map(
            ([type, icon, label]) => `
              <button type="button" class="bo-pill-tab ${ui.orderTypeFilter === type ? 'active' : ''}" data-action="orders:filter-type" data-type="${type}" aria-pressed="${ui.orderTypeFilter === type}">
                ${icon ? `<i class="${icon}" aria-hidden="true"></i>` : ''}${label} <span class="bo-pill-count">${countByType(type)}</span>
              </button>`
          ).join('')}
        </div>
        <div class="bo-panel-actions">
          <button type="button" class="bo-btn bo-btn-outline" data-action="sound:toggle" aria-pressed="${sound}" title="Play a chime when a new order arrives">
            <i class="fa-solid ${sound ? 'fa-bell' : 'fa-bell-slash'}" aria-hidden="true"></i> ${sound ? 'Sound on' : 'Sound off'}
          </button>
          <button type="button" class="bo-btn bo-btn-outline" data-action="orders:export-csv" title="Download all orders as a spreadsheet (CSV)">
            <i class="fa-solid fa-file-arrow-down" aria-hidden="true"></i> Download list
          </button>
        </div>
      </div>

      <div class="bo-panel-body">
        <div class="bo-toolbar">
          <label class="bo-toolbar-field" style="flex:1 1 280px; max-width:480px;">
            <span>Search</span>
            <input type="search" class="bo-input" placeholder="Name, phone, order number, dish…"
              value="${esc(ui.orderSearch)}" data-on-input="orders:search" data-focus-key="orders-search" />
          </label>
          <label class="bo-toolbar-field" style="flex:0 1 300px;">
            <span>Status</span>
            <select class="bo-select" data-on-change="orders:filter-status">
              ${STATUS_FILTERS.map(
                ([value, label]) =>
                  `<option value="${value}" ${ui.orderStatusFilter === value ? 'selected' : ''}>${label}</option>`
              ).join('')}
            </select>
          </label>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:12px; font-size:0.84rem;" class="bo-muted" aria-live="polite">
          <span>Showing <b>${filtered.length}</b> of ${orders.length} · newest first · tap a row to see details</span>
          ${filtersActive ? '<button type="button" class="bo-btn bo-btn-ghost bo-btn-sm" data-action="orders:clear-filters">Clear filters</button>' : ''}
        </div>

        <div class="bo-orders-list">
          ${filtered.length === 0 ? emptyState(ofType.length > 0 || orders.length > 0) : filtered.map(o => renderOrderCard(o)).join('')}
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
  },
  'orders:clear-filters': () => {
    ui.orderTypeFilter = 'all';
    ui.orderStatusFilter = 'all';
    ui.orderSearch = '';
    renderActiveTab();
  },
  /** Dashboard shortcut: open the Orders tab with a filter and (optionally) one order expanded. */
  'orders:show': el => {
    ui.orderTypeFilter = el.dataset.type || 'all';
    ui.orderStatusFilter = el.dataset.status || 'all';
    ui.orderSearch = '';
    if (el.dataset.id) ui.openOrders.add(el.dataset.id);
    document.querySelector('.bo-nav-btn[data-tab="orders"]')?.click();
  }
});

registerTab('orders', {
  title: 'Orders & requests',
  subtitle: 'Everything customers send from the website. Open a row for details, selections and quick replies.',
  render
});
