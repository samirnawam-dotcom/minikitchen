// Print popups. A popup opened with window.open('') inherits this page's Content-Security-Policy,
// so the printed documents contain no scripts or inline handlers: printing is triggered from
// here (the opener) once the popup has loaded, and its "Print" button is wired the same way.

import { showError } from './toast.js';

/**
 * Opens a popup, writes `html` into it and prints it after `delayMs` once it has loaded.
 * Elements with class "js-print" inside the document become print buttons.
 * Returns the popup window, or null when popups are blocked.
 */
export function openPrintWindow(html, { features = 'width=880,height=960', delayMs = 400, blockedMessage } = {}) {
  const win = window.open('', '_blank', features);
  if (!win) {
    showError(blockedMessage || 'Please allow popups to print.');
    return null;
  }

  win.document.open();
  win.document.write(html);
  win.document.close();

  for (const btn of win.document.querySelectorAll('.js-print')) {
    btn.addEventListener('click', () => win.print());
  }

  let printed = false;
  const printOnce = () => {
    if (printed || win.closed) return;
    printed = true;
    setTimeout(() => {
      if (!win.closed) {
        win.focus();
        win.print();
      }
    }, delayMs);
  };
  if (win.document.readyState === 'complete') printOnce();
  else win.addEventListener('load', printOnce, { once: true });
  // Safety net in case a slow external image (QR code) never fires load.
  setTimeout(printOnce, 4000);
  return win;
}
