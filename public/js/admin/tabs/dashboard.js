// Dashboard tab: KPI cards, quick controls (LBP rate, sound, shortcuts) and the latest orders.

import { registerActions } from '../../shared/actions.js';
import { byId } from '../../shared/dom.js';
import { data } from '../state.js';
import { formatUsd, formatLbp } from '../format.js';
import { registerTab, renderActiveTab } from '../router.js';
import { saveSiteConfig } from '../sync.js';
import { isSoundEnabled } from '../ui/sound.js';
import { showToast, showError } from '../ui/toast.js';
import { renderOrderCard } from '../orders/order-card.js';

function kpiCard(label, icon, iconStyle, value, foot) {
  return `
    <div class="bo-kpi-card">
      <div class="bo-kpi-top">
        <span class="bo-kpi-label">${label}</span>
        <div class="bo-kpi-icon" style="${iconStyle}">
          <i class="${icon}"></i>
        </div>
      </div>
      <div class="bo-kpi-value">${value}</div>
      <div class="bo-kpi-foot">${foot}</div>
    </div>
  `;
}

function render() {
  const { orders, menuCategories, siteConfig, lbpRate } = data;
  const newCount = orders.filter(o => o.status === 'new').length;
  const delivery = orders.filter(o => o.type === 'delivery_order');
  const catering = orders.filter(o => o.type === 'catering_quote');
  const tableLeads = orders.filter(o => o.type === 'table_reservation' || o.type === 'whatsapp_inquiry');
  const deliveryRevenue = delivery
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.totalUsd) || 0), 0);
  const totalDishes = menuCategories.reduce((n, c) => n + c.items.length, 0);
  const soldOut = menuCategories.reduce((n, c) => n + c.items.filter(i => i.soldOut).length, 0);
  const sound = isSoundEnabled();
  const recent = orders.slice(0, 5);

  return `
    <div class="bo-kpi-grid">
      ${kpiCard(
        'Recorded WhatsApp Orders & Leads',
        'fa-brands fa-whatsapp',
        'background:rgba(29,168,81,0.12); color:var(--bo-wa);',
        orders.length,
        `<b style="color:#d94e28;">${newCount} New Pending</b> • ${delivery.length} Delivery • ${catering.length} Catering`
      )}
      ${kpiCard(
        'Delivery Order Volume (USD / LBP)',
        'fa-solid fa-motorcycle',
        'background:rgba(217,78,40,0.12); color:var(--bo-terracotta);',
        formatUsd(deliveryRevenue),
        `${formatLbp(deliveryRevenue)} (${delivery.length} cart orders)`
      )}
      ${kpiCard(
        'Catering & Event Pipeline',
        'fa-solid fa-crown',
        'background:rgba(197,155,39,0.16); color:var(--bo-gold-dark);',
        `${catering.length} Events`,
        `${(siteConfig.cateringPackages || []).length} Active Packages • ${tableLeads.length} Table/Chat Leads`
      )}
      ${kpiCard(
        'FineDine Digital Menu Status',
        'fa-solid fa-utensils',
        'background:rgba(45,106,79,0.14); color:var(--bo-pine);',
        `${totalDishes} Dishes`,
        `${menuCategories.length} Categories • <b style="color:${soldOut > 0 ? '#dc2626' : '#15803d'};">${soldOut} Sold Out</b>`
      )}
    </div>

    <div class="bo-panel">
      <div class="bo-panel-header">
        <div>
          <div class="bo-panel-title"><i class="fa-solid fa-bolt" style="color:var(--bo-gold);"></i> Quick Website Controls & Live Exchange Rate</div>
          <div style="font-size:0.8rem; color:var(--bo-muted);">Changes made here update all 3 menus (Catering, Restaurant, Delivery) immediately</div>
        </div>
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <div style="display:flex; align-items:center; gap:8px; background:#fff; padding:6px 12px; border-radius:10px; border:1px solid var(--bo-border);">
            <span style="font-size:0.78rem; font-weight:800; color:var(--bo-muted);">1 USD =</span>
            <input type="number" id="quickLbpRateInput" value="${lbpRate}" step="500" class="bo-input"
              style="width:120px; padding:6px 10px; font-weight:800;" aria-label="LBP per USD" />
            <span style="font-size:0.78rem; font-weight:800; color:var(--bo-muted);">L.L.</span>
            <button class="bo-btn bo-btn-gold" style="padding:6px 12px;" data-action="dashboard:save-rate">
              Update Rate
            </button>
          </div>
          <button class="bo-btn bo-btn-outline" data-action="sound:toggle" title="Toggle Kitchen Sound Chime for New Orders">
            <i class="fa-solid ${sound ? 'fa-volume-high' : 'fa-volume-xmark'}" style="color:${sound ? '#16a34a' : 'var(--bo-muted)'};"></i>
            ${sound ? 'Sound Alerts: ON' : 'Sound: Muted'}
          </button>
          <button class="bo-btn bo-btn-outline" data-action="nav:tab" data-tab="menu">
            <i class="fa-solid fa-plus"></i> Add / Edit Dish
          </button>
          <button class="bo-btn bo-btn-outline" data-action="nav:tab" data-tab="qrcodes">
            <i class="fa-solid fa-qrcode"></i> Print Menu QR Codes
          </button>
        </div>
      </div>
    </div>

    <div class="bo-panel">
      <div class="bo-panel-header">
        <div>
          <div class="bo-panel-title"><i class="fa-brands fa-whatsapp" style="color:var(--bo-wa);"></i> Latest Recorded WhatsApp Orders & Event Quotes</div>
          <div style="font-size:0.8rem; color:var(--bo-muted);">Automatically captured when customers click "Send Order to WhatsApp" or submit an Event Quote</div>
        </div>
        <button class="bo-btn bo-btn-primary" data-action="nav:tab" data-tab="orders">
          View All Orders (${orders.length}) <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
      <div class="bo-panel-body">
        <div class="bo-orders-list">
          ${
            recent.length === 0
              ? `<div style="text-align:center; padding:40px; color:var(--bo-muted);">No orders recorded yet. Place a test order on the website or click "Log Manual Order".</div>`
              : recent.map(renderOrderCard).join('')
          }
        </div>
      </div>
    </div>
  `;
}

async function saveQuickRate() {
  const rate = Number(byId('quickLbpRateInput')?.value);
  if (!rate || rate < 1000) {
    showError('Please enter a valid LBP exchange rate.');
    return;
  }
  const previous = data.lbpRate;
  data.lbpRate = rate;
  if (!(await saveSiteConfig())) {
    data.lbpRate = previous;
    return;
  }
  renderActiveTab();
  showToast(`Live exchange rate updated to 1 USD = ${data.lbpRate.toLocaleString('en-US')} L.L.`);
}

registerActions({
  'dashboard:save-rate': () => saveQuickRate()
});

registerTab('dashboard', {
  title: 'Dashboard',
  subtitle: '',
  render
});
