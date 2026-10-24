// Order actions shared by the Dashboard, Orders and KDS tabs: status changes, staff notes,
// deletion, WhatsApp replies, printing, CSV export and the new-order sound toggle.

import { registerActions } from '../../shared/actions.js';
import { data, ui, findOrder, setOrders } from '../state.js';
import { api } from '../api.js';
import { formatUsd } from '../format.js';
import { renderActiveTab, markSaved } from '../router.js';
import { confirmDialog } from '../ui/modal.js';
import { patchOrder, updateNavBadges } from '../sync.js';
import { showToast, showError } from '../ui/toast.js';
import { toggleSound, playChime } from '../ui/sound.js';
import { openPrintWindow } from '../ui/print-window.js';
import { downloadFile } from '../ui/download.js';
import { proposalHtml, ticketHtml } from './print-templates.js';
import { STATUS_LABELS, customerPhoneDigits } from './order-card.js';

/** Changes an order's status on the server; the UI follows the server's answer. */
export async function setOrderStatus(id, status) {
  const order = findOrder(id);
  if (!order) return;
  const ok = await patchOrder(id, { status });
  renderActiveTab();
  if (ok) showToast(`${order.customerName || `Order ${id}`} is now “${STATUS_LABELS[status] || status}”.`);
}

async function saveStaffNote(id, button) {
  const input = button.closest('.bo-order-card')?.querySelector('[data-field="staffNotes"]');
  if (!input || !findOrder(id)) return;
  if (await patchOrder(id, { staffNotes: input.value })) {
    markSaved(input);
    showToast('Note saved.');
  }
}

async function deleteOrder(id) {
  const order = findOrder(id);
  if (!order) return;
  const sure = await confirmDialog(
    `Delete ${order.customerName ? `${order.customerName}’s` : 'this'} ${order.type === 'catering_quote' ? 'catering request' : 'order'} (#${id})? This cannot be undone.`,
    { title: 'Delete this record?', confirmLabel: 'Delete' }
  );
  if (!sure) return;
  try {
    await api.deleteOrder(id);
  } catch (err) {
    showError(`Order ${id} was not deleted: ${err.message}`);
    return;
  }
  setOrders(data.orders.filter(o => o.id !== id));
  updateNavBadges();
  renderActiveTab();
  ui.openOrders.delete(id);
  showToast(`Deleted #${id}.`);
}

function replyOnWhatsApp(id) {
  const o = findOrder(id);
  if (!o) return;
  const phone = customerPhoneDigits(o) || data.siteConfig.contacts.delivery.whatsappNumber;

  const trackUrl = `${window.location.origin}/delivery.html?track=${encodeURIComponent(o.id)}`;
  const message =
    o.type === 'catering_quote'
      ? `Hello ${o.customerName}! This is Mini Kitchen Catering regarding your inquiry (#${o.id}) for ${o.eventType || 'your event'} on ${o.eventDate || 'your selected date'}. We have prepared your proposal—you can also check your live status here: ${trackUrl}`
      : `Hello ${o.customerName}! This is Mini Kitchen regarding your order #${o.id} (${formatUsd(o.totalUsd)}). Your order is confirmed and being prepared fresh! Track live status here: ${trackUrl}`;

  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}

export function printTicket(id) {
  const o = findOrder(id);
  if (!o) return;
  openPrintWindow(ticketHtml(o), {
    features: 'width=440,height=680',
    delayMs: 300,
    blockedMessage: 'Please allow popups to print kitchen receipts.'
  });
}

function printProposal(id) {
  const o = findOrder(id);
  if (!o) return;
  openPrintWindow(proposalHtml(o), {
    features: 'width=880,height=960',
    delayMs: 450,
    blockedMessage: 'Please allow popups to generate the Official Proposal / Invoice PDF.'
  });
}

/** CSV cell: always quoted; values that a spreadsheet would run as a formula are prefixed with '. */
function csvCell(value) {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function exportOrdersCsv() {
  const headers = ['OrderID', 'Date', 'Type', 'Brand', 'Status', 'Customer', 'Phone', 'Address', 'TotalUSD', 'Notes'];
  const rows = data.orders.map(o => [
    o.id,
    o.createdAt,
    o.type,
    o.brand,
    o.status,
    o.customerName,
    o.customerPhone,
    o.address,
    Number(o.totalUsd) || 0,
    o.notes
  ]);
  const csv = [headers, ...rows].map(r => r.map(csvCell).join(',')).join('\n');
  downloadFile(csv, `mini-kitchen-orders-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

/** Opens / closes an order's details in place (no re-render, so focus stays on the toggle). */
function toggleOrder(button) {
  const id = button.dataset.id;
  const card = button.closest('.bo-order-card');
  const details = card?.querySelector('.bo-order-details');
  if (!details) return;
  const open = details.hidden;
  details.hidden = !open;
  card.classList.toggle('is-open', open);
  button.setAttribute('aria-expanded', String(open));
  if (open) ui.openOrders.add(id);
  else ui.openOrders.delete(id);
}

registerActions({
  'orders:toggle': el => toggleOrder(el),
  'orders:set-status': el => setOrderStatus(el.dataset.id, el.value),
  'orders:advance': el => setOrderStatus(el.dataset.id, el.dataset.status),
  'orders:save-note': el => saveStaffNote(el.dataset.id, el),
  'orders:delete': el => deleteOrder(el.dataset.id),
  'orders:whatsapp': el => replyOnWhatsApp(el.dataset.id),
  'orders:print-ticket': el => printTicket(el.dataset.id),
  'orders:print-proposal': el => printProposal(el.dataset.id),
  'orders:export-csv': () => exportOrdersCsv(),
  'sound:toggle': () => {
    if (toggleSound()) {
      playChime();
      showToast('Sound alerts are on: you will hear a chime for each new order.');
    } else {
      showToast('Sound alerts are off.');
    }
    renderActiveTab();
  }
});
