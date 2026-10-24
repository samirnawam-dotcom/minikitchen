// Tab routing: each tab module registers { title, subtitle, render } here; the router swaps the
// content of #boMainContainer and keeps the sidebar and topbar in sync. Also owns:
//   - the slide-in menu on tablets and phones (nav:menu-open / nav:menu-close)
//   - "unsaved changes" tracking: any input inside an element with [data-dirty-scope] marks that
//     element .is-dirty (CSS shows an "Unsaved changes" pill) until it is saved or re-rendered.

import { registerActions } from '../shared/actions.js';
import { $$, byId } from '../shared/dom.js';
import { ui } from './state.js';
import { confirmDialog } from './ui/modal.js';

const tabs = new Map();

/** @param {string} id  @param {{ title: string, subtitle: string, render: () => string }} tab */
export function registerTab(id, tab) {
  tabs.set(id, tab);
}

/** True when the current tab holds edits that are not saved yet. */
export function hasUnsavedChanges() {
  return Boolean(byId('boMainContainer')?.querySelector('.is-dirty'));
}

/**
 * Before an action that re-renders the tab: resolves true when there is nothing unsaved, or when
 * the user agrees to drop the unsaved edits.
 */
export async function confirmDiscard() {
  if (!hasUnsavedChanges()) return true;
  return confirmDialog('Some changes on this page are not saved yet. Continue and lose them?', {
    title: 'Unsaved changes',
    confirmLabel: 'Continue without saving'
  });
}

/** After saving one card: re-render only when no other card still holds unsaved edits. */
export function afterCardSaved(el) {
  markSaved(el);
  if (!hasUnsavedChanges()) renderActiveTab();
}

/** Marks a saved form/card as clean again (when the tab is not re-rendered after saving). */
export function markSaved(el) {
  el?.closest('[data-dirty-scope]')?.classList.remove('is-dirty');
}

/**
 * True while the user is typing in a field of the current tab or has unsaved edits there
 * (background refreshes wait so nothing typed is lost).
 */
export function isEditingTab() {
  const container = byId('boMainContainer');
  const active = document.activeElement;
  const typing = Boolean(
    container && active && container.contains(active) && active.matches('input, textarea, select')
  );
  return typing || hasUnsavedChanges();
}

/**
 * Re-renders the active tab. Inputs marked data-focus-key keep focus and caret across the
 * re-render, so filtering while typing in a search box works.
 */
export function renderActiveTab() {
  const container = byId('boMainContainer');
  if (!container) return;
  const tab = tabs.get(ui.activeTab) || tabs.get('dashboard');

  const active = document.activeElement;
  const focusKey = active && container.contains(active) ? active.dataset.focusKey : null;
  let selection = null;
  try {
    if (focusKey && typeof active.selectionStart === 'number') selection = [active.selectionStart, active.selectionEnd];
  } catch {}

  container.innerHTML = tab.render();

  if (focusKey) {
    const el = container.querySelector(`[data-focus-key="${focusKey}"]`);
    if (el) {
      el.focus();
      try {
        if (selection) el.setSelectionRange(...selection);
      } catch {}
    }
  }
}

export async function switchTab(tabId) {
  const next = tabs.has(tabId) ? tabId : 'dashboard';
  if (next !== ui.activeTab && hasUnsavedChanges()) {
    const leave = await confirmDialog('You have changes on this page that are not saved yet. Leave without saving?', {
      title: 'Unsaved changes',
      confirmLabel: 'Leave without saving'
    });
    if (!leave) return;
  }
  ui.activeTab = next;
  for (const btn of $$('.bo-nav-btn')) {
    const isActive = btn.getAttribute('data-tab') === ui.activeTab;
    btn.classList.toggle('active', isActive);
    if (isActive) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  }
  const tab = tabs.get(ui.activeTab);
  byId('boTopbarTitle').textContent = tab.title;
  const sub = byId('boTopbarSub');
  sub.textContent = tab.subtitle || '';
  sub.hidden = !tab.subtitle;
  document.title = `${tab.title} — Mini Kitchen Back Office`;
  renderActiveTab();
  window.scrollTo(0, 0);
  if (document.body.classList.contains('bo-nav-open')) {
    setMenuOpen(false, { returnFocus: false });
    byId('boMainContainer')?.focus({ preventScroll: true });
  }
}

// ---- Slide-in menu (≤ 1024px) ----------------------------------------------------------------

function setMenuOpen(open, { returnFocus = true } = {}) {
  document.body.classList.toggle('bo-nav-open', open);
  byId('boMenuBtn')?.setAttribute('aria-expanded', String(open));
  if (open) byId('boSidebar')?.querySelector('.bo-nav-btn.active, .bo-nav-btn')?.focus();
  else if (returnFocus) byId('boMenuBtn')?.focus();
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.body.classList.contains('bo-nav-open')) setMenuOpen(false);
});

// ---- Unsaved-changes tracking ------------------------------------------------------------------

function markDirtyFrom(event) {
  const el = event.target;
  if (!(el instanceof Element) || el.closest('[data-no-dirty]')) return;
  const container = byId('boMainContainer');
  const scope = el.closest('[data-dirty-scope]');
  if (scope && container?.contains(scope)) scope.classList.add('is-dirty');
}

/** Marks the scope around `el` as edited (for changes made by buttons, e.g. adding a row). */
export function markDirty(el) {
  el?.closest('[data-dirty-scope]')?.classList.add('is-dirty');
}

document.addEventListener('input', markDirtyFrom);
document.addEventListener('change', markDirtyFrom);

window.addEventListener('beforeunload', event => {
  if (ui.authenticated && hasUnsavedChanges()) {
    event.preventDefault();
    event.returnValue = '';
  }
});

registerActions({
  'nav:tab': el => switchTab(el.dataset.tab),
  'nav:menu-open': () => setMenuOpen(true),
  'nav:menu-close': () => setMenuOpen(false)
});
