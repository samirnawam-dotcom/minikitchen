// Small bottom-right notification toast.

import { esc } from '../shared/dom.js';

let toastTimer = 0;

/** Shows `message` (plain text, escaped) for a few seconds. */
export function showToast(message) {
  let toast = document.getElementById('mkToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'mkToast';
    toast.style.cssText =
      'position:fixed; bottom:90px; right:24px; background:#0e1015; color:#fff; border:1px solid var(--brand-primary); padding:14px 22px; border-radius:12px; font-weight:700; font-size:0.88rem; z-index:3000; box-shadow:0 12px 30px rgba(0,0,0,0.35); transition: opacity 0.3s ease;';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#25d366; margin-right:8px;"></i> ${esc(message)}`;
  toast.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.opacity = '0';
  }, 2800);
}
