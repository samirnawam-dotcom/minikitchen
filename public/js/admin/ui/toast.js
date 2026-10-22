// Bottom-right toast notifications. Messages are inserted as text, never as HTML, because they
// often contain customer-supplied values (names, dish titles).

let toastEl = null;
let hideTimer = null;

function ensureToast() {
  if (toastEl) return toastEl;
  toastEl = document.createElement('div');
  toastEl.id = 'boToast';
  toastEl.setAttribute('role', 'status');
  toastEl.setAttribute('aria-live', 'polite');
  toastEl.style.cssText =
    'position:fixed; bottom:24px; right:24px; background:#14171c; color:#fff; border:1px solid #c59b27; padding:13px 20px; border-radius:12px; font-weight:700; font-size:0.86rem; z-index:6000; box-shadow:0 14px 35px rgba(0,0,0,0.3); transition:opacity 0.25s ease; max-width:min(520px, calc(100vw - 48px));';
  document.body.appendChild(toastEl);
  return toastEl;
}

/**
 * @param {string} message plain text
 * @param {{ error?: boolean }} [options] error toasts use a red icon/border and stay longer
 */
export function showToast(message, { error = false } = {}) {
  const el = ensureToast();
  const icon = document.createElement('i');
  icon.className = error ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-check';
  icon.style.cssText = `color:${error ? '#f87171' : '#1da851'}; margin-right:8px;`;
  el.replaceChildren(icon, document.createTextNode(` ${message}`));
  el.style.borderColor = error ? '#dc2626' : '#c59b27';
  el.style.opacity = '1';
  clearTimeout(hideTimer);
  hideTimer = setTimeout(
    () => {
      el.style.opacity = '0';
    },
    error ? 5000 : 2800
  );
}

export function showError(message) {
  showToast(message, { error: true });
}
