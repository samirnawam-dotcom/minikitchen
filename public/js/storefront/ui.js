// Site-wide interface polish that is not tied to one page:
//  • the header gains a soft shadow once the page scrolls;
//  • sections fade and rise into view (IntersectionObserver; skipped with prefers-reduced-motion);
//  • photos fade in once loaded over their placeholder tint (no layout shift: boxes keep their ratio);
//  • drawers and dialogs: Escape closes the top one, focus moves into it and back to the button
//    that opened it, Tab stays inside while it is open;
//  • tabs ([role=tab]) answer the arrow, Home and End keys;
//  • skip-to-content link and "back to top".

import { registerActions } from '../shared/actions.js';
import { state } from './state.js';
import { onAfterRender } from './view.js';
import { closeCartDrawer, closeNavDrawer } from './navigation.js';
import { closeDishModal } from './dish-modal.js';
import { closeOrderTracker } from './order-tracker.js';

const root = document.documentElement;
const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------------------
// Header shadow on scroll
// ---------------------------------------------------------------------------
let scrollQueued = false;
function updateScrolled() {
  scrollQueued = false;
  document.querySelector('.site-header')?.classList.toggle('is-scrolled', window.scrollY > 12);
}
window.addEventListener(
  'scroll',
  () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(updateScrolled);
  },
  { passive: true }
);

// ---------------------------------------------------------------------------
// Reveal on scroll
// ---------------------------------------------------------------------------
const REVEAL = [
  '.section-header',
  '.tab-intro',
  '.package-card',
  '.how-step',
  '.review-card',
  '.faq-list',
  '.gallery-tile',
  '.price-list',
  '.team-card',
  '.contact-card',
  '.visit-panel',
  '.split-copy',
  '.split-media',
  '.also-band-inner',
  '.form-card',
  '.contact-aside'
].join(',');

const revealer =
  !reduceMotion && 'IntersectionObserver' in window
    ? new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add('in-view');
            revealer.unobserve(entry.target);
          }
        },
        { rootMargin: '0px 0px -6% 0px', threshold: 0.08 }
      )
    : null;

if (revealer) root.classList.add('reveal-ready');

function setUpReveal(mainEl) {
  if (!revealer) return;
  revealer.disconnect();
  mainEl.querySelectorAll(REVEAL).forEach(el => {
    el.classList.add('reveal');
    revealer.observe(el);
  });
}

// ---------------------------------------------------------------------------
// Photos fade in when loaded
// ---------------------------------------------------------------------------
root.classList.add('img-fade');
const markLoaded = img => img.classList.add('is-loaded');

document.addEventListener(
  'load',
  e => {
    if (e.target instanceof HTMLImageElement) markLoaded(e.target);
  },
  true
);

function setUpImages(mainEl) {
  mainEl.querySelectorAll('img').forEach(img => {
    if (!img.hasAttribute('decoding')) img.decoding = 'async';
    if (img.complete && img.naturalWidth > 0) markLoaded(img);
  });
}

// ---------------------------------------------------------------------------
// Decorative icons are hidden from screen readers (buttons carry their own text or aria-label)
// ---------------------------------------------------------------------------
function hideIcons(scope) {
  scope.querySelectorAll('i[class*="fa-"]:not([aria-hidden])').forEach(i => i.setAttribute('aria-hidden', 'true'));
}

onAfterRender(mainEl => {
  document.body.dataset.page = state.currentPage;
  setUpReveal(mainEl);
  setUpImages(mainEl);
  hideIcons(mainEl);
});

// ---------------------------------------------------------------------------
// Drawers and dialogs: Escape, focus in, focus back, Tab kept inside
// ---------------------------------------------------------------------------
/** Checked in this order, so Escape closes the dialog on top first. */
const OVERLAYS = [
  { id: 'orderTrackerBackdrop', close: closeOrderTracker },
  { id: 'fdModalBackdrop', close: closeDishModal },
  { id: 'cartDrawer', close: closeCartDrawer },
  { id: 'navDrawer', close: closeNavDrawer }
];
const openers = new Map(); // overlay id -> element focused when it opened

const isOpen = el => !!el && el.classList.contains('open');
const topOverlay = () => OVERLAYS.map(o => ({ ...o, el: document.getElementById(o.id) })).find(o => isOpen(o.el));

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const focusables = el =>
  [...el.querySelectorAll(FOCUSABLE)].filter(n => n.offsetParent !== null || n === document.activeElement);

function onOverlayChange(el) {
  const id = el.id;
  if (isOpen(el)) {
    if (openers.has(id)) return;
    const active = document.activeElement;
    openers.set(id, active && active !== document.body && !el.contains(active) ? active : null);
    if (id === 'navDrawer') document.querySelector('.hamburger-btn')?.setAttribute('aria-expanded', 'true');
    // After the slide-in starts, move focus to the close button (or the first control)
    setTimeout(() => {
      if (!isOpen(el) || el.contains(document.activeElement)) return;
      const target = el.querySelector('.drawer-close-btn, [data-action$=":close"]') || focusables(el)[0];
      target?.focus({ preventScroll: true });
    }, 60);
  } else if (openers.has(id)) {
    const opener = openers.get(id);
    openers.delete(id);
    if (id === 'navDrawer') document.querySelector('.hamburger-btn')?.setAttribute('aria-expanded', 'false');
    const active = document.activeElement;
    const focusWasInside = !active || active === document.body || el.contains(active);
    if (focusWasInside && opener && opener.isConnected) opener.focus({ preventScroll: true });
  }
}

const overlayIds = new Set(OVERLAYS.map(o => o.id));
new MutationObserver(records => {
  for (const r of records) if (overlayIds.has(r.target.id)) onOverlayChange(r.target);
}).observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });

document.addEventListener('keydown', e => {
  if (document.getElementById('mkLightbox')?.classList.contains('open')) return; // the viewer handles its keys
  const top = topOverlay();
  if (!top) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    top.close();
    return;
  }
  if (e.key !== 'Tab') return;
  const list = focusables(top.el);
  if (list.length === 0) return;
  const first = list[0];
  const last = list[list.length - 1];
  if (!top.el.contains(document.activeElement)) {
    e.preventDefault();
    first.focus();
  } else if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

// ---------------------------------------------------------------------------
// Tabs: arrow keys move between them (mirrored in Arabic), Home / End jump to the ends
// ---------------------------------------------------------------------------
document.addEventListener('keydown', e => {
  const tab = e.target instanceof Element ? e.target.closest('[role="tab"]') : null;
  if (!tab) return;
  const list = tab.closest('[role="tablist"]');
  if (!list) return;
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  const i = tabs.indexOf(tab);
  const rtl = root.dir === 'rtl';
  let next = -1;
  if (e.key === 'ArrowRight') next = i + (rtl ? -1 : 1);
  else if (e.key === 'ArrowLeft') next = i + (rtl ? 1 : -1);
  else if (e.key === 'Home') next = 0;
  else if (e.key === 'End') next = tabs.length - 1;
  else return;
  e.preventDefault();
  next = (next + tabs.length) % tabs.length;
  const label = list.getAttribute('aria-label');
  const targetTab = tabs[next];
  const tabKey = targetTab.dataset.tab;
  targetTab.click(); // the page re-renders with the new tab
  const sel = `[role="tablist"]${label ? `[aria-label="${CSS.escape(label)}"]` : ''} [role="tab"][data-tab="${CSS.escape(tabKey || '')}"]`;
  document.querySelector(sel)?.focus();
});

// ---------------------------------------------------------------------------
// Skip link and back to top
// ---------------------------------------------------------------------------
registerActions({
  'ui:skip': (el, event) => {
    event.preventDefault();
    const main = document.getElementById('appMainContent');
    main?.focus({ preventScroll: true });
    main?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  },
  'ui:top': () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    document.getElementById('appMainContent')?.focus({ preventScroll: true });
  }
});

/** Static chrome (header, drawers, footer) gets the same icon treatment once. */
export function initUi() {
  hideIcons(document);
  updateScrolled();
}
