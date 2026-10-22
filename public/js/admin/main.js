// Back Office entry point (loaded as <script type="module"> from views/admin.html).
// Imports every tab so it registers itself, wires the topbar, restores the session and starts
// the background sync. All event handling goes through data-action attributes (shared/actions.js),
// so the page runs under a strict Content-Security-Policy without inline scripts or handlers.

import { registerActions, setDefaultImageFallback } from '../shared/actions.js';
import { ui, KEYS } from './state.js';
import { renderActiveTab } from './router.js';
import { refreshFromServer, updateNavBadges } from './sync.js';
import { verifySession } from './auth.js';
import { initWorkspaceTheme } from './ui/theme.js';
import './ui/upload.js';
import './orders/actions.js';
import './orders/manual-order.js';

import './tabs/dashboard.js';
import './tabs/orders.js';
import './tabs/kds.js';
import './tabs/reviews.js';
import './tabs/menu.js';
import './tabs/catering.js';
import './tabs/qrcodes.js';
import './tabs/content.js';
import './tabs/seo.js';
import './tabs/settings.js';
import './tabs/security.js';

const POLL_MS = 8000;

setDefaultImageFallback('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80');

registerActions({
  'sync:refresh': () => refreshFromServer()
});

/** Images in the static template may fail before this deferred module has loaded; retry them now. */
function retryFailedImages() {
  for (const img of document.querySelectorAll('img[data-fallback]')) {
    if (img.complete && img.naturalWidth === 0) img.dispatchEvent(new Event('error'));
  }
}

async function start() {
  initWorkspaceTheme();
  retryFailedImages();
  updateNavBadges();
  renderActiveTab();

  await verifySession();
  await refreshFromServer({ silent: true, background: !ui.authenticated });

  // The storefront writes this key when a customer orders in another tab of this browser.
  window.addEventListener('storage', event => {
    if (event.key === KEYS.orders && ui.authenticated) refreshFromServer({ silent: true, background: true });
  });

  // Pick up orders placed from other devices.
  setInterval(() => {
    if (ui.authenticated) refreshFromServer({ silent: true, background: true });
  }, POLL_MS);
}

start();
