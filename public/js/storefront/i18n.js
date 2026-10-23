// Arabic / English switch: sets lang/dir (RTL) on <html> and translates the site chrome
// (navigation pills, hamburger label, language buttons). Page content stays in English, except the
// catering offer, which shows its Arabic names (so the page is re-rendered on a switch).

import { registerActions } from '../shared/actions.js';
import { setItem } from '../shared/storage.js';
import { state, LANG_STORAGE_KEY } from './state.js';
import { renderHeaderActiveStates } from './navigation.js';
import { render } from './view.js';
import { showToast } from './toast.js';

const NAV_LABELS = {
  ar: {
    catering: 'الرئيسية',
    'catering-menus': 'الباقات والقوائم',
    restaurant: 'المطعم',
    delivery: 'التوصيل',
    about: 'من نحن',
    contact: 'تواصل معنا'
  },
  en: {
    catering: 'Home',
    'catering-menus': 'Packages & Menus',
    restaurant: 'Restaurant',
    delivery: 'Delivery',
    about: 'About Us',
    contact: 'Contact'
  }
};

export function applySiteLanguage(lang) {
  const clean = lang === 'ar' ? 'ar' : 'en';
  state.lang = clean;
  document.documentElement.setAttribute('lang', clean);
  document.documentElement.setAttribute('dir', clean === 'ar' ? 'rtl' : 'ltr');
  document.body.classList.toggle('rtl-mode', clean === 'ar');
  setItem(LANG_STORAGE_KEY, clean);

  const headerLabel = document.getElementById('langToggleLabel');
  if (headerLabel) headerLabel.textContent = clean === 'ar' ? 'EN' : 'العربية';

  const drawerLangBtn = document.getElementById('drawerLangSwitchBtn');
  if (drawerLangBtn) {
    drawerLangBtn.innerHTML =
      clean === 'ar'
        ? '<i class="fa-solid fa-globe"></i> <span>English (EN)</span>'
        : '<i class="fa-solid fa-globe"></i> <span>العربية (AR)</span>';
  }

  const labels = NAV_LABELS[clean];
  document.querySelectorAll('.header-center-nav .nav-pill[data-nav-page]').forEach(btn => {
    const key = btn.getAttribute('data-nav-page');
    if (labels[key]) btn.textContent = labels[key];
  });

  const alsoLabel = document.getElementById('drawerAlsoLabel');
  if (alsoLabel) alsoLabel.textContent = clean === 'ar' ? 'أيضاً من ميني كيتشن' : 'Also from Mini Kitchen';

  const hamLabel = document.querySelector('.hamburger-label');
  if (hamLabel) hamLabel.textContent = clean === 'ar' ? 'القائمة' : 'Menu';
}

function toggleSiteLanguage() {
  const next = state.lang === 'ar' ? 'en' : 'ar';
  applySiteLanguage(next);
  renderHeaderActiveStates();
  render();
  showToast(next === 'ar' ? 'تم تفعيل اللغة العربية (Arabic RTL Enabled)' : 'Switched language to English');
}

registerActions({ 'lang:toggle': toggleSiteLanguage });
