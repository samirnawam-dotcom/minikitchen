// Back Office light/dark workspace theme (html[data-bo-theme]); independent of the public
// website's theme, which the Settings tab controls.

import { registerActions } from '../../shared/actions.js';
import { byId } from '../../shared/dom.js';
import { getItem, setItem } from '../../shared/storage.js';
import { KEYS } from '../state.js';

export function applyWorkspaceTheme(mode) {
  const theme = mode === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-bo-theme', theme);
  setItem(KEYS.uiTheme, theme);
  const icon = byId('boThemeToggleIcon');
  const label = byId('boThemeToggleLabel');
  if (icon) icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  if (label) label.textContent = theme === 'dark' ? 'Light UI' : 'Dark UI';
}

export function initWorkspaceTheme() {
  applyWorkspaceTheme(getItem(KEYS.uiTheme, 'light'));
}

registerActions({
  'theme:toggle': () => {
    const isDark = document.documentElement.getAttribute('data-bo-theme') === 'dark';
    applyWorkspaceTheme(isDark ? 'light' : 'dark');
  }
});
