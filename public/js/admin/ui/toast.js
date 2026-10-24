// Toast notifications (bottom-right; full width at the bottom on phones). Messages are inserted
// as text, never as HTML, because they often contain customer-supplied values (names, dishes).

let toastEl = null;
let hideTimer = null;

function ensureToast() {
  if (toastEl) return toastEl;
  toastEl = document.createElement('div');
  toastEl.id = 'boToast';
  toastEl.className = 'bo-toast';
  toastEl.setAttribute('role', 'status');
  toastEl.setAttribute('aria-live', 'polite');
  document.body.appendChild(toastEl);
  return toastEl;
}

/**
 * @param {string} message plain text
 * @param {{ error?: boolean }} [options] error toasts use a red accent and stay longer
 */
export function showToast(message, { error = false } = {}) {
  const el = ensureToast();
  const icon = document.createElement('i');
  icon.className = error ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check';
  icon.setAttribute('aria-hidden', 'true');
  const text = document.createElement('span');
  text.textContent = message;
  el.replaceChildren(icon, text);
  el.classList.toggle('is-error', error);
  el.setAttribute('role', error ? 'alert' : 'status');
  el.classList.add('show');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => el.classList.remove('show'), error ? 6000 : 3200);
}

export function showError(message) {
  showToast(message, { error: true });
}
