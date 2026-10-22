// Storefront entry point (loaded as <script type="module">). Imports every feature module so their
// data-action handlers are registered, renders the initial page from cached/default content,
// hides the preloader, then refreshes content from the server.

import { state } from './state.js';
import { applyServerContent, loadContentFromCache, CONFIG_KEY, MENU_KEY, LBP_KEY } from './config.js';
import { fetchState } from './api.js';
import { initImageFallbacks } from './images.js';
import { setNextOrderSeqHint, saveLocalOrders } from './orders.js';
import { applySiteTheme, getSavedThemeMode } from './theme.js';
import { applySiteLanguage } from './i18n.js';
import { initRouting, navigateToPage } from './navigation.js';
import { updatePageSeoMeta } from './seo.js';
import { render } from './view.js';
import { updateCartBadges } from './order-bar.js';
import { openOrderTracker } from './order-tracker.js';

// Feature modules that only register actions / pages
import './whatsapp.js';
import './cart-drawer.js';
import './dish-modal.js';
import './qr.js';
import './menu-view.js';
import './event-calculator.js';
import './quote-form.js';
import './pages/catering.js';
import './pages/catering-menus.js';
import './pages/restaurant.js';
import './pages/delivery.js';
import './pages/about.js';
import './pages/contact.js';

function hidePreloader() {
  // Wait one frame so the first render is painted underneath, then let the CSS transition fade it out.
  requestAnimationFrame(() => document.getElementById('mkPreloader')?.classList.add('mk-preloader-hidden'));
}

/** Server content wins over the local cache; re-render only when something visible changed. */
async function syncWithServer() {
  const data = await fetchState();
  if (!data) return;
  setNextOrderSeqHint(data.nextOrderSeq);
  if (Array.isArray(data.orders)) saveLocalOrders(data.orders); // only present for a signed-in Back Office user
  if (applyServerContent(data)) {
    updatePageSeoMeta(state.currentPage);
    render();
  }
}

function listenForOtherTabs() {
  window.addEventListener('storage', e => {
    if (e.key === 'mk_theme_mode' && e.newValue) applySiteTheme(e.newValue);
    if (e.key === CONFIG_KEY || e.key === MENU_KEY || e.key === LBP_KEY) {
      loadContentFromCache();
      updatePageSeoMeta(state.currentPage);
      render();
    }
  });
}

function init() {
  initImageFallbacks();
  applySiteTheme(getSavedThemeMode());
  applySiteLanguage(state.lang);
  if (state.qrTableMode) document.body.classList.add('qr-table-mode');

  updateCartBadges();
  const hashPage = window.location.hash.replace('#', '').trim();
  navigateToPage(hashPage || document.body.getAttribute('data-default-page') || 'catering');

  const urlTrackId = new URLSearchParams(window.location.search).get('track');
  if (urlTrackId) setTimeout(() => openOrderTracker(urlTrackId), 350);

  initRouting();
  listenForOtherTabs();
}

try {
  init();
} finally {
  hidePreloader();
}
syncWithServer();
