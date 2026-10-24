// Dashboard tab: what needs attention today, from real orders only — new catering requests (from
// the website package builder), upcoming event dates, other orders waiting for a reply — plus the
// exchange rate, sound alerts and shortcuts.

import { registerActions } from '../../shared/actions.js';
import { esc, byId } from '../../shared/dom.js';
import { data } from '../state.js';
import { formatUsd, formatDateTime, parseEventDate, daysUntil } from '../format.js';
import { registerTab, renderActiveTab, markSaved } from '../router.js';
import { saveSiteConfig } from '../sync.js';
import { isSoundEnabled } from '../ui/sound.js';
import { showToast, showError } from '../ui/toast.js';
import { contactButtons, orderSummaryLine, typeBadge, statusPill } from '../orders/order-card.js';

const UPCOMING_DAYS = 30;
const LIST_LIMIT = 6;
const isOpen = o => o.status !== 'completed' && o.status !== 'cancelled';

function isToday(iso) {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function kpiCard({ label, icon, value, foot, type = '', status = '', alert = false }) {
  return `
    <button type="button" class="bo-kpi-card${alert ? ' is-alert' : ''}" data-action="orders:show" data-type="${type}" data-status="${status}">
      <span class="bo-kpi-top">
        <span class="bo-kpi-label">${label}</span>
        <span class="bo-kpi-icon" aria-hidden="true"><i class="${icon}"></i></span>
      </span>
      <span class="bo-kpi-value">${value}</span>
      <span class="bo-kpi-foot">${foot}</span>
    </button>`;
}

function dateChip(value) {
  const d = parseEventDate(value);
  if (!d) {
    return `<span class="bo-date-chip" aria-hidden="true"><b>?</b><span>Date</span></span>`;
  }
  const soon = (daysUntil(value) ?? 99) <= 7;
  return `<span class="bo-date-chip${soon ? ' is-soon' : ''}" aria-hidden="true"><b>${d.getDate()}</b><span>${d.toLocaleDateString('en-US', { month: 'short' })}</span></span>`;
}

function whenLabel(value) {
  const days = daysUntil(value);
  if (days === null) return 'Date to confirm';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

function listItem(o, { sub, chipFrom }) {
  return `
    <li class="bo-dash-item">
      ${chipFrom !== undefined ? dateChip(chipFrom) : ''}
      <div class="bo-dash-main">
        <button type="button" class="bo-link-btn" data-action="orders:show" data-id="${esc(o.id)}" data-type="${esc(o.type)}">
          <span class="bo-dash-title">${esc(o.customerName || 'Customer')}</span>
          <span class="bo-dash-sub">${esc(sub)}</span>
        </button>
      </div>
      <div class="bo-dash-actions">${contactButtons(o)}</div>
    </li>`;
}

function emptyBlock(icon, title, text) {
  return `
    <div class="bo-empty" style="padding:28px 16px;">
      <i class="${icon}" aria-hidden="true"></i>
      <div class="bo-empty-title">${title}</div>
      <p>${text}</p>
    </div>`;
}

function panel(title, sub, body, action = '') {
  return `
    <section class="bo-panel">
      <div class="bo-panel-header">
        <div>
          <h2 class="bo-panel-title">${title}</h2>
          ${sub ? `<div class="bo-panel-sub">${sub}</div>` : ''}
        </div>
        ${action}
      </div>
      <div class="bo-panel-body" style="padding-top:6px; padding-bottom:10px;">${body}</div>
    </section>`;
}

function render() {
  const { orders, menuCategories, lbpRate } = data;
  const waiting = orders.filter(o => o.status === 'new');
  const newCatering = waiting.filter(o => o.type === 'catering_quote');
  const otherWaiting = waiting.filter(o => o.type !== 'catering_quote');
  const upcoming = orders
    .filter(o => isOpen(o) && (o.type === 'catering_quote' || o.type === 'table_reservation'))
    .filter(o => {
      const days = daysUntil(o.eventDate);
      return days !== null && days >= 0;
    })
    .sort((a, b) => parseEventDate(a.eventDate) - parseEventDate(b.eventDate));
  const upcomingSoon = upcoming.filter(o => daysUntil(o.eventDate) <= UPCOMING_DAYS);
  const today = orders.filter(o => isToday(o.createdAt) && o.status !== 'cancelled');
  const todayValue = today.reduce((s, o) => s + (Number(o.totalUsd) || 0), 0);
  const soldOut = menuCategories.reduce((n, c) => n + c.items.filter(i => i.soldOut).length, 0);
  const sound = isSoundEnabled();

  const cateringList = newCatering.length
    ? `<ul class="bo-dash-list">${newCatering
        .slice(0, LIST_LIMIT)
        .map(o =>
          listItem(o, {
            chipFrom: o.eventDate,
            sub: [
              whenLabel(o.eventDate),
              Number(o.guests) > 0 ? `${Number(o.guests)} guests` : '',
              Number(o.totalUsd) > 0 ? `est. ${formatUsd(o.totalUsd)}` : '',
              `received ${formatDateTime(o.createdAt)}`
            ]
              .filter(Boolean)
              .join(' · ')
          })
        )
        .join('')}</ul>`
    : emptyBlock(
        'fa-solid fa-champagne-glasses',
        'No new catering requests',
        'They appear here when a customer sends a package from the website.'
      );

  const upcomingList = upcoming.length
    ? `<ul class="bo-dash-list">${upcoming
        .slice(0, LIST_LIMIT)
        .map(o =>
          listItem(o, {
            chipFrom: o.eventDate,
            sub: [
              whenLabel(o.eventDate),
              o.type === 'table_reservation' ? 'Table booking' : o.packageSelected || 'Catering',
              Number(o.guests) > 0 ? `${Number(o.guests)} guests` : ''
            ]
              .filter(Boolean)
              .join(' · ')
          })
        )
        .join('')}</ul>`
    : emptyBlock(
        'fa-regular fa-calendar',
        'No upcoming events',
        'Confirmed catering requests and table bookings with a date show here, soonest first.'
      );

  const waitingList = otherWaiting.length
    ? `<ul class="bo-dash-list">${otherWaiting
        .slice(0, LIST_LIMIT)
        .map(o =>
          listItem(o, {
            sub: [orderSummaryLine(o), Number(o.totalUsd) > 0 ? formatUsd(o.totalUsd) : '', formatDateTime(o.createdAt)]
              .filter(Boolean)
              .join(' · ')
          }).replace(
            '<div class="bo-dash-main">',
            `<div class="bo-dash-main"><div style="margin-bottom:4px; display:flex; gap:6px; flex-wrap:wrap;">${typeBadge(o.type)} ${statusPill(o.status)}</div>`
          )
        )
        .join('')}</ul>`
    : emptyBlock('fa-solid fa-mug-hot', 'All caught up', 'No delivery orders or bookings are waiting for a reply.');

  const viewAll = (label, type, status) =>
    `<button type="button" class="bo-btn bo-btn-outline bo-btn-sm" data-action="orders:show" data-type="${type}" data-status="${status}">${label} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>`;

  return `
    <div class="bo-kpi-grid">
      ${kpiCard({
        label: 'Waiting for a reply',
        icon: 'fa-solid fa-bell',
        value: waiting.length,
        foot: waiting.length ? 'New orders and requests — tap to see them' : 'Nothing new right now',
        status: 'new',
        alert: waiting.length > 0
      })}
      ${kpiCard({
        label: 'New catering requests',
        icon: 'fa-solid fa-champagne-glasses',
        value: newCatering.length,
        foot: 'Sent from the website package builder',
        type: 'catering_quote',
        status: 'new',
        alert: newCatering.length > 0
      })}
      ${kpiCard({
        label: `Events in the next ${UPCOMING_DAYS} days`,
        icon: 'fa-regular fa-calendar-check',
        value: upcomingSoon.length,
        foot: upcoming[0] ? `Next: ${whenLabel(upcoming[0].eventDate).toLowerCase()}` : 'No event dates booked',
        type: 'catering_quote',
        status: 'open'
      })}
      ${kpiCard({
        label: 'Orders today',
        icon: 'fa-solid fa-receipt',
        value: today.length,
        foot: todayValue > 0 ? `${formatUsd(todayValue)} in total` : 'No orders yet today',
        status: 'all'
      })}
    </div>

    <div class="bo-dash-grid">
      ${panel(
        'New catering requests',
        'Reply quickly — open a request to see every dish they chose.',
        cateringList,
        viewAll('All requests', 'catering_quote', 'all')
      )}
      ${panel('Upcoming events', 'Catering and table bookings with a date, soonest first.', upcomingList, viewAll('Open requests', 'catering_quote', 'open'))}
    </div>

    <div class="bo-dash-grid">
      ${panel('Other orders waiting', 'Delivery orders, table bookings and chats marked “New”.', waitingList, viewAll('All orders', 'all', 'new'))}

      <section class="bo-panel">
        <div class="bo-panel-header">
          <div>
            <h2 class="bo-panel-title">Quick settings</h2>
            <div class="bo-panel-sub">Used on all three menus of the website.</div>
          </div>
        </div>
        <div class="bo-panel-body">
          <form data-on-submit="dashboard:save-rate" data-dirty-scope style="border:0;">
            <label class="bo-label" for="quickLbpRateInput">Exchange rate (Lebanese pounds for 1 US dollar)</label>
            <div class="bo-field-row" style="max-width:420px;">
              <input type="number" id="quickLbpRateInput" value="${lbpRate}" step="500" min="1000" class="bo-input" inputmode="numeric" />
              <button type="submit" class="bo-btn bo-btn-gold" data-save-button>Save rate</button>
            </div>
            <div class="bo-help">Prices in L.L. on the website are calculated with this rate. <span class="bo-save-state">Unsaved</span></div>
          </form>

          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:20px;">
            <button type="button" class="bo-btn bo-btn-outline" data-action="sound:toggle" aria-pressed="${sound}">
              <i class="fa-solid ${sound ? 'fa-volume-high' : 'fa-volume-xmark'}" aria-hidden="true"></i>
              ${sound ? 'Sound alerts on' : 'Sound alerts off'}
            </button>
            <button type="button" class="bo-btn bo-btn-outline" data-action="nav:tab" data-tab="menu">
              <i class="fa-solid fa-utensils" aria-hidden="true"></i> Edit menu${soldOut ? ` (${soldOut} sold out)` : ''}
            </button>
            <button type="button" class="bo-btn bo-btn-outline" data-action="nav:tab" data-tab="catering">
              <i class="fa-solid fa-champagne-glasses" aria-hidden="true"></i> Catering packages
            </button>
            <button type="button" class="bo-btn bo-btn-outline" data-action="nav:tab" data-tab="qrcodes">
              <i class="fa-solid fa-qrcode" aria-hidden="true"></i> Print QR codes
            </button>
          </div>
        </div>
      </section>
    </div>
  `;
}

async function saveQuickRate(form) {
  const rate = Number(byId('quickLbpRateInput')?.value);
  if (!rate || rate < 1000) {
    showError('Please enter a valid exchange rate (for example 89500).');
    return;
  }
  const previous = data.lbpRate;
  data.lbpRate = rate;
  if (!(await saveSiteConfig())) {
    data.lbpRate = previous;
    return;
  }
  markSaved(form);
  renderActiveTab();
  showToast(`Saved: 1 USD = ${data.lbpRate.toLocaleString('en-US')} L.L.`);
}

registerActions({
  'dashboard:save-rate': form => saveQuickRate(form)
});

registerTab('dashboard', {
  title: 'Dashboard',
  subtitle: 'What needs your attention today.',
  render
});
