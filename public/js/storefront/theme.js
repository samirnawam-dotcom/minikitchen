// Light / dark mode. The saved choice is applied before first paint by ../theme-init.js; this
// module keeps the toggle buttons in sync and handles switching.

import { registerActions } from '../shared/actions.js';
import { getItem, setItem } from '../shared/storage.js';
import { content } from './config.js';
import { showToast } from './toast.js';

const THEME_KEY = 'mk_theme_mode';

export function getSavedThemeMode() {
  const saved = getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return content.config.defaultTheme === 'dark' ? 'dark' : 'light';
}

export function applySiteTheme(mode) {
  const clean = mode === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', clean);
  document.body.classList.toggle('dark-mode', clean === 'dark');
  setItem(THEME_KEY, clean);

  const iconEl = document.getElementById('themeToggleIcon');
  if (iconEl) iconEl.className = clean === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  const headerBtn = document.getElementById('themeToggleBtn');
  if (headerBtn) headerBtn.title = clean === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';

  const drawerBtn = document.getElementById('drawerThemeSwitchBtn');
  if (drawerBtn) {
    drawerBtn.innerHTML =
      clean === 'dark'
        ? '<i class="fa-solid fa-sun"></i> <span>Switch to Light Mode</span>'
        : '<i class="fa-solid fa-moon"></i> <span>Switch to Dark Mode</span>';
  }
}

function toggleSiteTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applySiteTheme(next);
  showToast(next === 'dark' ? 'Dark Mode enabled' : 'Light Mode enabled');
}

registerActions({ 'theme:toggle': toggleSiteTheme });
