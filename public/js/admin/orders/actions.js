// Order actions shared by the Dashboard, Orders and KDS tabs: status changes, staff notes,
// deletion, WhatsApp replies, printing, CSV export and the new-order sound toggle.

import { registerActions } from '../../shared/actions.js';
import { data, findOrder, setOrders } from '../state.js';
import { api } from '../api.js';
import { formatUsd } from '../format.js';
import { renderActiveTab } from '../router.js';
import { patchOrder, updateNavBadges } from '../sync.js';
import { showToast, showError } from '../ui/toast.js';
import { toggleSound, playChime } from '../ui/sound.js';
import { openPrintWindow } from '../ui/print-window.js';
import { downloadFile } from '../ui/download.js';
import { proposalHtml, ticketHtml } from './print-templates.js';

/** Changes an order's status on the server; the UI follows the server's answer. */
export async function setOrderStatus(id, status) {
  const order = findOrder(id);
  if (!order) return;
  const ok = await patchOrder(id, { status });
  renderActiveTab();
  if (ok) showToast(`Order ${id} marked as ${status.toUpperCase()}`);
}

async function saveStaffNote(id, button) {
  const input = button.closest('.bo-order-card')?.querySelector('[data-field="staffNotes"]');
  if (!input || !findOrder(id)) return;
  if (await patchOrder(id, { staffNotes: input.value })) showToast(`Saved internal note for ${id}`);
}

async function deleteOrder(id) {
  if (!findOrder(id)) return;
  if (!window.confirm(`Delete order ${id} permanently?`)) return;
  try {
    await api.deleteOrder(id);
  } catch (err) {
    showError(`Order ${id} was not deleted: ${err.message}`);
    return;
  }
  setOrders(data.orders.filter(o => o.id !== id));
  updateNavBadges();
  renderActiveTab();
  showToast(`Deleted record ${id}`);
}

function replyOnWhatsApp(id) {
  const o = findOrder(id);
  if (!o) return;
  const digits = (o.customerPhone || '').replace(/[^0-9]/g, '');
  const phone =
    digits.length >= 7
      ? digits.startsWith('961')
        ? digits
        : `961${digits.replace(/^0/, '')}`
      : data.siteConfig.contacts.delivery.whatsappNumber;

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

registerActions({
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
      showToast('🔔 Kitchen & Order Sound Alerts enabled!');
    } else {
      showToast('🔇 Kitchen & Order Sound Alerts muted.');
    }
    renderActiveTab();
  }
});
