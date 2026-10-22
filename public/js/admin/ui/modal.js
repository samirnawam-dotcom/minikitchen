// The single Back Office modal (#boModalBackdrop / #boModalDialog).

import { registerActions } from '../../shared/actions.js';
import { esc, byId } from '../../shared/dom.js';

/**
 * Opens the modal. `title` is plain text (escaped here); `bodyHtml` must already be escaped.
 */
export function openModal(title, bodyHtml) {
  const backdrop = byId('boModalBackdrop');
  const dialog = byId('boModalDialog');
  if (!backdrop || !dialog) return;

  dialog.innerHTML = `
    <div class="bo-modal-header">
      <h3 style="font-family:var(--font-serif); font-size:1.25rem; margin:0;">${esc(title)}</h3>
      <button type="button" data-action="modal:close" aria-label="Close" style="background:none; border:none; color:#fff; font-size:1.1rem; cursor:pointer;">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="bo-modal-body">${bodyHtml}</div>
  `;
  backdrop.classList.add('open');
}

export function closeModal() {
  byId('boModalBackdrop')?.classList.remove('open');
}

/** Cancel + submit buttons used at the bottom of every modal form. */
export function modalFormButtons(submitLabel) {
  return `
    <div style="margin-top:18px; display:flex; justify-content:flex-end; gap:10px;">
      <button type="button" class="bo-btn bo-btn-outline" data-action="modal:close">Cancel</button>
      <button type="submit" class="bo-btn bo-btn-gold">${esc(submitLabel)}</button>
    </div>
  `;
}

registerActions({
  'modal:close': () => closeModal()
});
