// Small bottom-corner notification toast (styled by .mk-toast in css/storefront/layout.css).

import { esc } from '../shared/dom.js';

let toastTimer = 0;

/** Shows `message` (plain text, escaped) for a few seconds. */
export function showToast(message) {
  let toast = document.getElementById('mkToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'mkToast';
    toast.className = 'mk-toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${esc(message)}</span>`;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}
