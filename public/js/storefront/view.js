// Page registry and rendering of the main content area (#appMainContent).
// Page modules register their builder with registerPage(); everything else calls render()/renderMainView().

import { state } from './state.js';
import { renderOrderBar } from './order-bar.js';

const pages = new Map();

/** `build` returns the page's HTML string for the current state. */
export function registerPage(pageId, build) {
  pages.set(pageId, build);
}

export function renderMainView() {
  const mainEl = document.getElementById('appMainContent');
  if (!mainEl) return;
  const build = pages.get(state.currentPage) || pages.get('catering');
  mainEl.innerHTML = build ? build() : '';
}

/** Re-renders the page and the floating order bar (after cart, currency or content changes). */
export function render() {
  renderMainView();
  renderOrderBar();
}
