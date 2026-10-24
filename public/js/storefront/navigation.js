// Client-side page switching (#hash routing between the six storefront pages), header active
// states and the hamburger / cart drawers.

import { registerActions } from '../shared/actions.js';
import { state, PAGE_IDS, brandForPage } from './state.js';
import { updatePageSeoMeta } from './seo.js';
import { render } from './view.js';
import { t } from './i18n-strings.js';

// ---------------------------------------------------------------------------
// Drawers (navigation drawer on the left, cart drawer on the right, shared backdrop)
// ---------------------------------------------------------------------------
const byId = id => document.getElementById(id);

export function openNavDrawer() {
  byId('navDrawer')?.classList.add('open');
  byId('navDrawerBackdrop')?.classList.add('open');
}

export function closeNavDrawer() {
  byId('navDrawer')?.classList.remove('open');
  byId('navDrawerBackdrop')?.classList.remove('open');
}

/** Slides the cart drawer in; the caller renders its content first. */
export function showCartDrawer() {
  byId('cartDrawer')?.classList.add('open');
  byId('navDrawerBackdrop')?.classList.add('open');
}

export function closeCartDrawer() {
  byId('cartDrawer')?.classList.remove('open');
  byId('navDrawerBackdrop')?.classList.remove('open');
}

export function closeDrawers() {
  closeNavDrawer();
  closeCartDrawer();
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
const HEADER_SUBTITLES = { restaurant: 'Restaurant · Aley', delivery: 'Delivery · Aley' };
const HEADER_WA_LABELS = { restaurant: 'Book a Table', delivery: 'Order on WhatsApp', catering: 'Catering WhatsApp' };

export function renderHeaderActiveStates() {
  document.querySelectorAll('[data-nav-page]').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-nav-page') === state.currentPage);
  });

  const subEl = byId('headerBrandSub');
  if (subEl) subEl.textContent = t(HEADER_SUBTITLES[state.currentPage] || 'Catering & Events');

  const waHeaderBtn = byId('headerWaBtn');
  if (waHeaderBtn) {
    const brand = brandForPage(state.currentPage);
    waHeaderBtn.dataset.brand = brand;
    const label = waHeaderBtn.querySelector('.wa-text');
    if (label) label.textContent = t(HEADER_WA_LABELS[brand]);
    waHeaderBtn.setAttribute('aria-label', `${t(HEADER_WA_LABELS[brand])} (${t('WhatsApp')})`);
  }
}

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------
export function navigateToPage(pageId, scrollTargetId) {
  const page = PAGE_IDS.includes(pageId) ? pageId : 'catering';
  state.currentPage = page;
  document.body.setAttribute('data-brand', brandForPage(page));

  // Update the URL hash without jumping
  history.pushState(null, '', `#${page}`);

  updatePageSeoMeta(page);
  closeNavDrawer();
  renderHeaderActiveStates();
  render();

  if (scrollTargetId) {
    setTimeout(() => byId(scrollTargetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export function initRouting() {
  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash.replace('#', '').trim();
    if (newHash && newHash !== state.currentPage) navigateToPage(newHash);
  });
}

registerActions({
  // <button data-action="nav:go" data-page="delivery" [data-scroll="sectionId"]>
  'nav:go': el => {
    closeCartDrawer();
    navigateToPage(el.dataset.page, el.dataset.scroll);
  },
  'nav:open-drawer': openNavDrawer,
  'nav:close-drawer': closeNavDrawer,
  'drawers:close': closeDrawers
});
