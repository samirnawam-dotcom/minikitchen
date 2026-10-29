// Page 2 — Catering packages & menus: one tab per part of the offer (event buffets, Birthday Minis,
// the dish menu without prices, live stations, main course trays, mini bites) followed by the "Build your package" form.

import { registerActions } from '../../shared/actions.js';
import { esc } from '../../shared/dom.js';
import { state } from '../state.js';
import { cateringList } from '../config.js';
import { registerPage, renderMainView } from '../view.js';
import {
  bitesMenu,
  cateringMenuBook,
  eventPackageCard,
  extrasNote,
  faqList,
  howItWorks,
  localName,
  packages,
  stationMenu,
  trayMenu
} from '../catering-offer.js';
import { packageBuilderSection } from '../package-builder.js';
import { bannerPhoto, bannerText, pageHero, sectionHeader } from './sections.js';
import { t } from '../i18n-strings.js';

const TABS = [
  { id: 'buffet', label: 'Event Buffets' },
  { id: 'birthday', label: 'Birthday Minis' },
  { id: 'menu', label: 'Our Menu' },
  { id: 'stations', label: 'Live Stations' },
  { id: 'trays', label: 'Main Course Trays' },
  { id: 'bites', label: 'Mini Bites' }
];

const tagline = id => {
  const type = cateringList('cateringTypes').find(entry => entry.id === id);
  return type ? localName(type, 'tagline') : '';
};

const intro = (title, text) => `
          <div class="tab-intro">
            <h2 class="tab-intro-title">${title}</h2>
            ${text ? `<p class="tab-intro-text">${esc(text)}</p>` : ''}
          </div>`;

const addCta = label => `
          <div class="center-link">
            <button type="button" class="btn btn-outline" data-action="builder:start">${label}</button>
          </div>`;

const menuLink = () => `
          <div class="center-link">
            <button type="button" class="text-link" data-action="catering-menus:show-menu">${t('See every dish you can choose')} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>
          </div>`;

function tabContent(tab) {
  if (tab === 'menu') {
    return `
          ${intro(t('Our catering menu'), t('Every dish you can choose from, before you build your package. The numbers show how many of each course every package includes.'))}
          ${cateringMenuBook()}
          ${addCta(t('Build your package'))}`;
  }
  if (tab === 'birthday') {
    return `
          ${intro(t('Birthday Mini — price per person'), tagline('birthday'))}
          <div class="packages-grid packages-grid-3">${packages('birthday')
            .map(p => eventPackageCard(p))
            .join('')}</div>
          ${extrasNote()}
          ${menuLink()}`;
  }
  if (tab === 'stations') {
    return `
          ${intro(t('Live stations'), t('Add a live station to any package. Per-person stations are priced for every guest; shawarma and real fillet are priced per kg.'))}
          <div class="container-narrow">${stationMenu()}</div>
          ${addCta(t('Add a station to your request'))}`;
  }
  if (tab === 'trays') {
    return `
          ${intro(t('Main course trays'), t('Each tray serves 30–40 people. Prices in US dollars.'))}
          ${trayMenu()}
          ${addCta(t('Add trays to your request'))}`;
  }
  if (tab === 'bites') {
    return `
          ${intro(t('Mini bites — La2mi La2mi'), t('Small bites, big taste. Prices in US dollars.'))}
          ${bitesMenu()}
          ${addCta(t('Add mini bites to your request'))}`;
  }
  return `
          ${intro(t('Event buffets — price per person'), tagline('buffet'))}
          <div class="packages-grid packages-grid-3">${packages('buffet')
            .map(p => eventPackageCard(p))
            .join('')}</div>
          ${extrasNote()}
          ${menuLink()}`;
}

function buildCateringMenusPage() {
  const activeTab = TABS.some(tab => tab.id === state.cateringMenusTab) ? state.cateringMenusTab : 'buffet';
  return `
      ${pageHero({
        eyebrow: bannerText('packages', 'eyebrow', t('Mini Kitchen Catering · Packages')),
        title: bannerText('packages', 'title', t('Packages &amp; menus')),
        text: bannerText(
          'packages',
          'text',
          t('Event buffets and Birthday Minis priced per person, plus live stations, main course trays and mini bites.')
        ),
        photo: bannerPhoto('packages', 'images/pages/packages.webp'),
        alt: t('A Mini Kitchen catering buffet'),
        meta: [
          `<i class="fa-solid fa-user-group"></i> ${t('Priced per person')}`,
          `<i class="fa-solid fa-sliders"></i> ${t('Choose your own dishes')}`,
          `<i class="fa-brands fa-whatsapp"></i> ${t('Confirmed with you on WhatsApp')}`
        ],
        actions: `
              <button class="btn btn-primary" data-action="builder:start">${t('Build your package')}</button>
              <button class="btn btn-outline" data-action="wa:open" data-brand="catering" data-msg="Hello Mini Kitchen Catering! I am looking at your catering packages and would like some help choosing.">
                <i class="fa-brands fa-whatsapp"></i> ${t('WhatsApp')}
              </button>`
      })}

      <section class="section-pad section-tight-top" id="cateringPackagesSection">
        <div class="container">
          <div class="segmented" role="tablist" aria-label="${t('Catering menus')}">
            ${TABS.map(
              tab => `
            <button type="button" role="tab" id="cmTab-${tab.id}" aria-controls="cmPanel" aria-selected="${activeTab === tab.id}" tabindex="${activeTab === tab.id ? '0' : '-1'}" class="segmented-btn ${activeTab === tab.id ? 'active' : ''}" data-action="catering-menus:tab" data-tab="${tab.id}">${t(tab.label)}</button>`
            ).join('')}
          </div>
          <div role="tabpanel" id="cmPanel" aria-labelledby="cmTab-${activeTab}">${tabContent(activeTab)}</div>
        </div>
      </section>

      <section class="section-pad section-ivory">
        <div class="container">
          ${sectionHeader({ eyebrow: t('How it works'), title: t('Three steps to your event menu') })}
          ${howItWorks({ compact: true })}
        </div>
      </section>

      ${packageBuilderSection({ ivory: false })}

      <section class="section-pad section-ivory" id="cateringFaq">
        <div class="container container-narrow">
          ${sectionHeader({ eyebrow: t('Good to know'), title: t('Questions we are often asked') })}
          ${faqList()}
        </div>
      </section>
    `;
}

registerPage('catering-menus', buildCateringMenusPage);

registerActions({
  'catering-menus:tab': el => {
    state.cateringMenusTab = el.dataset.tab;
    renderMainView();
  },
  // Our Menu tab: switch between the buffet and Birthday Mini menus
  'menu:kind': el => {
    state.menuBookType = el.dataset.kind;
    renderMainView();
    document.getElementById('cateringPackagesSection')?.scrollIntoView({ block: 'start' });
  },
  // Course links jump to the course; the header height is covered by scroll-padding-top
  'menu:jump': el => {
    const target = document.getElementById(el.dataset.target);
    if (!target) return;
    target.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start'
    });
    target.querySelector('h4')?.focus({ preventScroll: true });
  },
  // Long courses show their first dishes on phones until "Show all" is pressed
  'menu:more': el => {
    const section = el.closest('.menu-section');
    const open = !section.classList.contains('is-open');
    section.classList.toggle('is-open', open);
    el.setAttribute('aria-expanded', String(open));
    el.textContent = open ? t('Show fewer dishes') : el.dataset.label || el.textContent;
  },
  // "See every dish" under the package cards: open the menu tab and bring the tabs into view.
  'catering-menus:show-menu': () => {
    state.cateringMenusTab = 'menu';
    renderMainView();
    document.getElementById('cateringPackagesSection')?.scrollIntoView({ block: 'start' });
  }
});
