// Tab routing: each tab module registers { title, subtitle, render } here; the router swaps the
// content of #boMainContainer and keeps the sidebar and topbar in sync.

import { registerActions } from '../shared/actions.js';
import { $$, byId } from '../shared/dom.js';
import { ui } from './state.js';

const tabs = new Map();

/** @param {string} id  @param {{ title: string, subtitle: string, render: () => string }} tab */
export function registerTab(id, tab) {
  tabs.set(id, tab);
}

/** True while the user is typing in a field of the current tab (background refreshes wait). */
export function isEditingTab() {
  const container = byId('boMainContainer');
  const active = document.activeElement;
  return Boolean(container && active && container.contains(active) && active.matches('input, textarea, select'));
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

export function switchTab(tabId) {
  ui.activeTab = tabs.has(tabId) ? tabId : 'dashboard';
  for (const btn of $$('.bo-nav-btn')) {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === ui.activeTab);
  }
  const tab = tabs.get(ui.activeTab);
  byId('boTopbarTitle').textContent = tab.title;
  const sub = byId('boTopbarSub');
  sub.textContent = tab.subtitle || '';
  sub.hidden = !tab.subtitle;
  renderActiveTab();
}

registerActions({
  'nav:tab': el => switchTab(el.dataset.tab)
});
