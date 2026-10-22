// "Log Manual Order / Quote" modal: records a phone or walk-in order through POST /api/orders.

import { registerActions } from '../../shared/actions.js';
import { byId } from '../../shared/dom.js';
import { data, setOrders } from '../state.js';
import { api } from '../api.js';
import { renderActiveTab } from '../router.js';
import { updateNavBadges } from '../sync.js';
import { openModal, closeModal, modalFormButtons } from '../ui/modal.js';
import { showToast, showError } from '../ui/toast.js';

const FORM_HTML = `
  <form id="manualOrderForm" data-on-submit="orders:manual-submit">
    <div class="bo-form-grid">
      <div class="bo-form-group">
        <label for="moType">Record Type *</label>
        <select id="moType" class="bo-select" required>
          <option value="delivery_order">🛵 Delivery Order</option>
          <option value="catering_quote">👑 Catering & Event Quote</option>
          <option value="table_reservation">🌲 Restaurant Table Reservation</option>
        </select>
      </div>
      <div class="bo-form-group">
        <label for="moName">Customer Name *</label>
        <input type="text" id="moName" class="bo-input" placeholder="e.g., Karim Jumblatt" required />
      </div>
      <div class="bo-form-group">
        <label for="moPhone">Customer Phone / WhatsApp *</label>
        <input type="text" id="moPhone" class="bo-input" placeholder="e.g., +961 3 555 123" required />
      </div>
      <div class="bo-form-group">
        <label for="moTotal">Total Amount (USD)</label>
        <input type="number" step="0.5" min="0" id="moTotal" class="bo-input" placeholder="e.g., 45.00" value="0" />
      </div>
    </div>
    <div class="bo-form-group" style="margin-top:14px;">
      <label for="moAddress">Delivery Address / Event Venue *</label>
      <input type="text" id="moAddress" class="bo-input" placeholder="e.g., Ain Al Remmaneh, Aley" required />
    </div>
    <div class="bo-form-grid" style="margin-top:14px;">
      <div class="bo-form-group">
        <label for="moEvent">Event Type / Summary</label>
        <input type="text" id="moEvent" class="bo-input" placeholder="e.g., Wedding Tasting / Phone Delivery" />
      </div>
      <div class="bo-form-group">
        <label for="moDate">Event Date (if applicable)</label>
        <input type="date" id="moDate" class="bo-input" />
      </div>
    </div>
    <div class="bo-form-group" style="margin-top:14px;">
      <label for="moNotes">Items Ordered / Inquiry Notes *</label>
      <textarea id="moNotes" class="bo-textarea" rows="3" placeholder="Enter dishes ordered or event details..." required></textarea>
    </div>
    ${modalFormButtons('Save to Back Office')}
  </form>
`;

export function openManualOrderModal() {
  openModal('Log Manual Phone / WhatsApp Order or Catering Inquiry', FORM_HTML);
}

async function submitManualOrder(form) {
  const value = id => byId(id).value.trim();
  const type = value('moType');
  const payload = {
    type,
    brand: type === 'catering_quote' ? 'catering' : type === 'table_reservation' ? 'restaurant' : 'delivery',
    status: 'confirmed',
    customerName: value('moName'),
    customerPhone: value('moPhone'),
    address: value('moAddress'),
    totalUsd: Number(value('moTotal')) || 0,
    eventType: value('moEvent'),
    eventDate: value('moDate'),
    notes: value('moNotes'),
    staffNotes: 'Logged manually via Back Office'
  };

  const submit = form.querySelector('[type="submit"]');
  if (submit) submit.disabled = true;
  try {
    const result = await api.createOrder(payload);
    if (result.order) setOrders([result.order, ...data.orders]);
  } catch (err) {
    showError(`Order was not saved: ${err.message}`);
    return;
  } finally {
    if (submit) submit.disabled = false;
  }
  closeModal();
  updateNavBadges();
  renderActiveTab();
  showToast('Order logged in Back Office!');
}

registerActions({
  'orders:manual-open': () => openManualOrderModal(),
  'orders:manual-submit': form => submitManualOrder(form)
});
