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
        <label for="moType">What is it? *</label>
        <select id="moType" class="bo-select" required>
          <option value="delivery_order">Delivery order</option>
          <option value="catering_quote">Catering request</option>
          <option value="table_reservation">Table booking</option>
        </select>
      </div>
      <div class="bo-form-group">
        <label for="moName">Customer name *</label>
        <input type="text" id="moName" class="bo-input" placeholder="e.g., Karim Jumblatt" required />
      </div>
      <div class="bo-form-group">
        <label for="moPhone">Phone / WhatsApp *</label>
        <input type="tel" id="moPhone" class="bo-input" placeholder="e.g., +961 3 555 123" required />
      </div>
      <div class="bo-form-group">
        <label for="moTotal">Total in US dollars</label>
        <input type="number" step="0.5" min="0" id="moTotal" class="bo-input" placeholder="e.g., 45.00" value="0" />
      </div>
    </div>
    <div class="bo-form-group" style="margin-top:14px;">
      <label for="moAddress">Address or event venue *</label>
      <input type="text" id="moAddress" class="bo-input" placeholder="e.g., Ain Al Remmaneh, Aley" required />
    </div>
    <div class="bo-form-grid" style="margin-top:14px;">
      <div class="bo-form-group">
        <label for="moEvent">Occasion (optional)</label>
        <input type="text" id="moEvent" class="bo-input" placeholder="e.g. Birthday, tasting" />
      </div>
      <div class="bo-form-group">
        <label for="moDate">Event or booking date</label>
        <input type="date" id="moDate" class="bo-input" />
      </div>
    </div>
    <div class="bo-form-group" style="margin-top:14px;">
      <label for="moNotes">What did they order or ask for? *</label>
      <textarea id="moNotes" class="bo-textarea" rows="3" placeholder="Dishes, number of guests, special requests…" required></textarea>
    </div>
    ${modalFormButtons('Save order')}
  </form>
`;

export function openManualOrderModal() {
  openModal('New order (phone or walk-in)', FORM_HTML);
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
  showToast('Order saved. You can find it under Orders & requests.');
}

registerActions({
  'orders:manual-open': () => openManualOrderModal(),
  'orders:manual-submit': form => submitManualOrder(form)
});
