// Table welcome banner for guests who scanned a restaurant table QR code (?table=N): shows the table
// number and a "Call Waiter" WhatsApp button above the menu. Printing QR codes is a Back Office
// feature (QR Codes tab); the public site has no QR studio.

import { esc } from '../shared/dom.js';
import { state } from './state.js';
import { t } from './i18n-strings.js';

/** HTML for the table banner, or '' when the page was not opened from a table QR code. */
export function renderTableBanner() {
  if (!state.tableNumber) return '';
  const table = esc(state.tableNumber);
  return `
        <div class="table-banner">
          <div class="table-banner-left">
            <div class="table-banner-num">${table}</div>
            <div>
              <div class="eyebrow">${t('Welcome to Mini Kitchen Restaurant')}</div>
              <div class="table-banner-title">${t('You are at table {table} · dine-in, no delivery fee', { table })}</div>
            </div>
          </div>
          <button type="button" class="btn btn-outline btn-sm" data-action="wa:open" data-brand="restaurant" data-msg="Hello! Table #${table} is requesting a waiter please." data-skip-log>
            <i class="fa-solid fa-bell-concierge"></i> ${t('Call waiter')}
          </button>
        </div>
      `;
}
