// The Back Office modal (#boModalBackdrop / #boModalDialog) and a confirmation dialog.
// Both keep keyboard focus inside while open, close on Escape and return focus to the control
// that opened them.

import { registerActions } from '../../shared/actions.js';
import { esc, byId } from '../../shared/dom.js';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let returnFocusTo = null;
let pendingConfirm = null; // resolve function of an open confirmDialog()

function visibleFocusables(root) {
  return [...root.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null || el === document.activeElement);
}

function focusFirst(dialog) {
  const target =
    dialog.querySelector('[data-autofocus]') ||
    dialog.querySelector('.bo-modal-body :is(input:not([type="hidden"]):not([type="file"]), select, textarea)') ||
    visibleFocusables(dialog)[0] ||
    dialog;
  target.focus();
}

/**
 * Opens the modal. `title` is plain text (escaped here); `bodyHtml` must already be escaped.
 * @param {{ size?: 'confirm' }} [options]
 */
export function openModal(title, bodyHtml, { size } = {}) {
  const backdrop = byId('boModalBackdrop');
  const dialog = byId('boModalDialog');
  if (!backdrop || !dialog) return;
  if (pendingConfirm) settleConfirm(false);
  if (!backdrop.classList.contains('open')) returnFocusTo = document.activeElement;

  dialog.classList.toggle('bo-confirm-dialog', size === 'confirm');
  dialog.innerHTML = `
    <div class="bo-modal-header">
      <h2 class="bo-modal-title" id="boModalTitle">${esc(title)}</h2>
      <button type="button" class="bo-btn bo-btn-ghost bo-btn-icon" data-action="modal:close" aria-label="Close">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
    </div>
    <div class="bo-modal-body">${bodyHtml}</div>
  `;
  backdrop.classList.add('open');
  focusFirst(dialog);
}

export function closeModal() {
  const backdrop = byId('boModalBackdrop');
  if (!backdrop?.classList.contains('open')) return;
  backdrop.classList.remove('open');
  if (pendingConfirm) settleConfirm(false);
  const target = returnFocusTo;
  returnFocusTo = null;
  if (target && document.contains(target) && typeof target.focus === 'function') target.focus();
}

function settleConfirm(answer) {
  const resolve = pendingConfirm;
  pendingConfirm = null;
  if (resolve) resolve(answer);
}

/**
 * Asks a yes/no question in the Back Office style instead of the browser's confirm() box.
 * Resolves true only when the confirm button is pressed.
 * @param {string} message plain text (line breaks are kept)
 * @param {{ title?: string, confirmLabel?: string, danger?: boolean }} [options]
 */
export function confirmDialog(
  message,
  { title = 'Are you sure?', confirmLabel = 'Yes, continue', danger = true } = {}
) {
  openModal(
    title,
    `
      ${danger ? '<div class="bo-confirm-icon" aria-hidden="true"><i class="fa-solid fa-triangle-exclamation"></i></div>' : ''}
      <p class="bo-confirm-text">${esc(message)}</p>
      <div class="bo-modal-buttons">
        <button type="button" class="bo-btn bo-btn-outline" data-action="modal:close" data-autofocus>Cancel</button>
        <button type="button" class="bo-btn ${danger ? 'bo-btn-danger-solid' : 'bo-btn-gold'}" data-action="modal:confirm">${esc(confirmLabel)}</button>
      </div>
    `,
    { size: 'confirm' }
  );
  return new Promise(resolve => {
    pendingConfirm = resolve;
  });
}

/** Cancel + submit buttons used at the bottom of every modal form. */
export function modalFormButtons(submitLabel) {
  return `
    <div class="bo-modal-buttons">
      <button type="button" class="bo-btn bo-btn-outline" data-action="modal:close">Cancel</button>
      <button type="submit" class="bo-btn bo-btn-gold">${esc(submitLabel)}</button>
    </div>
  `;
}

// Escape closes; Tab stays inside the open dialog; clicking the dimmed backdrop closes.
document.addEventListener('keydown', event => {
  const backdrop = byId('boModalBackdrop');
  if (!backdrop?.classList.contains('open')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeModal();
    return;
  }
  if (event.key !== 'Tab') return;
  const items = visibleFocusables(byId('boModalDialog'));
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

document.addEventListener('mousedown', event => {
  if (event.target === byId('boModalBackdrop')) closeModal();
});

registerActions({
  'modal:close': () => closeModal(),
  'modal:confirm': () => {
    const resolve = pendingConfirm;
    pendingConfirm = null;
    closeModal();
    if (resolve) resolve(true);
  }
});
