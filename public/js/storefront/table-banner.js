// Table welcome banner for guests who scanned a restaurant table QR code (?table=N): shows the table
// number and a "Call Waiter" WhatsApp button above the menu. Printing QR codes is a Back Office
// feature (QR Codes tab); the public site has no QR studio.

import { esc } from '../shared/dom.js';
import { state } from './state.js';

/** HTML for the table banner, or '' when the page was not opened from a table QR code. */
export function renderTableBanner() {
  if (!state.tableNumber) return '';
  const table = esc(state.tableNumber);
  return `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; background:linear-gradient(135deg, #2d6a4f, #1b4332); color:#fff; border-radius:14px; padding:12px 18px; margin-bottom:14px; border:1px solid #52b788;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.05rem;">
              ${table}
            </div>
            <div>
              <div style="font-size:0.72rem; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; color:#d8f3dc;">Welcome to Mini Kitchen Restaurant</div>
              <div style="font-weight:800; font-size:1rem;">You are seated at Table #${table} — Dine-In (No Delivery Fee)</div>
            </div>
          </div>
          <button type="button" class="btn btn-whatsapp" style="padding:8px 14px; font-size:0.8rem;" data-action="wa:open" data-brand="restaurant" data-msg="Hello! Table #${table} is requesting a waiter please." data-skip-log>
            <i class="fa-solid fa-bell-concierge"></i> Call Waiter
          </button>
        </div>
      `;
}
