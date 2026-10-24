// Arabic / English switch: sets lang/dir (RTL) on <html>, translates the fixed page frame (header,
// drawers, footer — see translateStatic in ./i18n-strings.js) and re-renders the page, whose
// templates read every visible string through t(). English stays exactly as written in the code.

import { registerActions } from '../shared/actions.js';
import { setItem } from '../shared/storage.js';
import { state, LANG_STORAGE_KEY } from './state.js';
import { renderHeaderActiveStates } from './navigation.js';
import { render } from './view.js';
import { showToast } from './toast.js';
import { renderCartDrawer } from './cart-drawer.js';
import { translateStatic } from './i18n-strings.js';

export function applySiteLanguage(lang) {
  const clean = lang === 'ar' ? 'ar' : 'en';
  state.lang = clean;
  document.documentElement.setAttribute('lang', clean);
  document.documentElement.setAttribute('dir', clean === 'ar' ? 'rtl' : 'ltr');
  document.body.classList.toggle('rtl-mode', clean === 'ar');
  setItem(LANG_STORAGE_KEY, clean);

  translateStatic();

  // The language buttons always name the other language, in that language.
  const headerLabel = document.getElementById('langToggleLabel');
  if (headerLabel) headerLabel.textContent = clean === 'ar' ? 'EN' : 'العربية';
  const headerBtn = document.getElementById('langToggleBtn');
  if (headerBtn) {
    headerBtn.setAttribute('lang', clean === 'ar' ? 'en' : 'ar');
    headerBtn.setAttribute('aria-label', clean === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
  }

  const drawerLangBtn = document.getElementById('drawerLangSwitchBtn');
  if (drawerLangBtn) {
    drawerLangBtn.setAttribute('lang', clean === 'ar' ? 'en' : 'ar');
    drawerLangBtn.innerHTML =
      clean === 'ar'
        ? '<i class="fa-solid fa-globe" aria-hidden="true"></i> <span>English</span>'
        : '<i class="fa-solid fa-globe" aria-hidden="true"></i> <span>العربية</span>';
  }
}

function toggleSiteLanguage() {
  const next = state.lang === 'ar' ? 'en' : 'ar';
  applySiteLanguage(next);
  renderHeaderActiveStates();
  render();
  renderCartDrawer();
  showToast(next === 'ar' ? 'تم التبديل إلى العربية' : 'Switched to English');
}

registerActions({ 'lang:toggle': toggleSiteLanguage });
