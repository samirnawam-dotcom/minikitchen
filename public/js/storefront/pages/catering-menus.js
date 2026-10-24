// Page 2 — Catering packages & menus: one tab per part of the offer (event buffets, Birthday Minis,
// live stations, main course trays, mini bites) followed by the "Build your package" form.

import { registerActions } from '../../shared/actions.js';
import { esc } from '../../shared/dom.js';
import { state } from '../state.js';
import { cateringList } from '../config.js';
import { registerPage, renderMainView } from '../view.js';
import {
  bitesMenu,
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
import { pageHero, sectionHeader } from './sections.js';

const TABS = [
  { id: 'buffet', label: 'Event Buffets' },
  { id: 'birthday', label: 'Birthday Minis' },
  { id: 'stations', label: 'Live Stations' },
  { id: 'trays', label: 'Main Course Trays' },
  { id: 'bites', label: 'Mini Bites' }
];

const tagline = id => {
  const type = cateringList('cateringTypes').find(t => t.id === id);
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

function tabContent(tab) {
  if (tab === 'birthday') {
    return `
          ${intro('Birthday Mini — price per person', tagline('birthday'))}
          <div class="packages-grid packages-grid-3">${packages('birthday')
            .map(p => eventPackageCard(p))
            .join('')}</div>
          ${extrasNote()}`;
  }
  if (tab === 'stations') {
    return `
          ${intro('Live stations', 'Add a live station to any package. Per-person stations are priced for every guest; shawarma and real fillet are priced per kg.')}
          <div class="container-narrow">${stationMenu()}</div>
          ${addCta('Add a station to your request')}`;
  }
  if (tab === 'trays') {
    return `
          ${intro('Main course trays', 'Each tray serves 30–40 people. Prices in US dollars.')}
          ${trayMenu()}
          ${addCta('Add trays to your request')}`;
  }
  if (tab === 'bites') {
    return `
          ${intro('Mini bites — La2mi La2mi', 'Small bites, big taste. Prices in US dollars.')}
          ${bitesMenu()}
          ${addCta('Add mini bites to your request')}`;
  }
  return `
          ${intro('Event buffets — price per person', tagline('buffet'))}
          <div class="packages-grid packages-grid-3">${packages('buffet')
            .map(p => eventPackageCard(p))
            .join('')}</div>
          ${extrasNote()}`;
}

function buildCateringMenusPage() {
  const activeTab = TABS.some(t => t.id === state.cateringMenusTab) ? state.cateringMenusTab : 'buffet';
  return `
      ${pageHero({
        eyebrow: 'Mini Kitchen Catering · Packages',
        title: 'Packages &amp; menus',
        text: 'Event buffets and Birthday Minis priced per person, plus live stations, main course trays and mini bites.',
        photo: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1400&q=85',
        alt: 'A Mini Kitchen catering buffet',
        meta: [
          '<i class="fa-solid fa-user-group"></i> Priced per person',
          '<i class="fa-solid fa-sliders"></i> Choose your own dishes',
          '<i class="fa-brands fa-whatsapp"></i> Confirmed with you on WhatsApp'
        ],
        actions: `
              <button class="btn btn-primary" data-action="builder:start">Build your package</button>
              <button class="btn btn-outline" data-action="wa:open" data-brand="catering" data-msg="Hello Mini Kitchen Catering! I am looking at your catering packages and would like some help choosing.">
                <i class="fa-brands fa-whatsapp"></i> WhatsApp
              </button>`
      })}

      <section class="section-pad section-tight-top" id="cateringPackagesSection">
        <div class="container">
          <div class="segmented" role="tablist" aria-label="Catering menus">
            ${TABS.map(
              t => `
            <button type="button" role="tab" id="cmTab-${t.id}" aria-controls="cmPanel" aria-selected="${activeTab === t.id}" tabindex="${activeTab === t.id ? '0' : '-1'}" class="segmented-btn ${activeTab === t.id ? 'active' : ''}" data-action="catering-menus:tab" data-tab="${t.id}">${t.label}</button>`
            ).join('')}
          </div>
          <div role="tabpanel" id="cmPanel" aria-labelledby="cmTab-${activeTab}">${tabContent(activeTab)}</div>
        </div>
      </section>

      <section class="section-pad section-ivory">
        <div class="container">
          ${sectionHeader({ eyebrow: 'How it works', title: 'Three steps to your event menu' })}
          ${howItWorks({ compact: true })}
        </div>
      </section>

      ${packageBuilderSection({ ivory: false })}

      <section class="section-pad section-ivory" id="cateringFaq">
        <div class="container container-narrow">
          ${sectionHeader({ eyebrow: 'Good to know', title: 'Questions we are often asked' })}
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
  }
});
