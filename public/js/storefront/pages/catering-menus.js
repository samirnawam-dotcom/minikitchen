// Page 2 — Catering menus & event packages: package grid with category filter, or the à-la-carte
// catering trays explorer (two tabs), followed by the event budget calculator.

import { registerActions } from '../../shared/actions.js';
import { state } from '../state.js';
import { configList } from '../config.js';
import { renderMenuExplorer } from '../menu-view.js';
import { renderTableBanner } from '../table-banner.js';
import { registerPage, renderMainView } from '../view.js';
import { pageHero, packageCard } from './sections.js';
import { renderEventBudgetCalculator } from '../event-calculator.js';

const filterButton = (filter, label) =>
  `<button class="chip ${state.cateringPkgFilter === filter ? 'active' : ''}" data-action="catering-menus:filter" data-filter="${filter}">${label}</button>`;

function packagesTab() {
  const allPackages = configList('cateringPackages');
  const filtered =
    state.cateringPkgFilter === 'all' ? allPackages : allPackages.filter(p => p.category === state.cateringPkgFilter);
  return `
          ${renderTableBanner()}
          <div class="chip-row chip-row-center">
            ${filterButton('all', `All packages (${allPackages.length})`)}
            ${filterButton('wedding', 'Weddings')}
            ${filterButton('corporate', 'Corporate')}
            ${filterButton('private', 'Private parties')}
          </div>
          <div class="packages-grid">
            ${filtered.map(packageCard).join('')}
          </div>`;
}

const tabButton = (tab, activeTab, label) => `
            <button type="button" class="segmented-btn ${activeTab === tab ? 'active' : ''}" data-action="catering-menus:tab" data-tab="${tab}">${label}</button>`;

function buildCateringMenusPage() {
  const activeTab = state.cateringMenusTab === 'alacarte' ? 'alacarte' : 'packages';

  return `
      ${pageHero({
        eyebrow: 'Mini Kitchen Catering · Menus',
        title: 'Event packages &amp; catering menus',
        text: 'Choose a complete per-guest package, or build your own buffet from our trays and grills.',
        photo: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1400&q=85',
        alt: 'A Mini Kitchen catering buffet',
        actions: `
              <button class="btn btn-primary" data-action="nav:go" data-page="catering" data-scroll="planEventSection">Request a quote</button>
              <button class="btn btn-outline" data-action="wa:open" data-brand="catering" data-msg="Hello Mini Kitchen Catering! I am browsing your Catering Menus & Packages page and would like a customized quotation.">
                <i class="fa-brands fa-whatsapp"></i> WhatsApp
              </button>`
      })}

      <section class="section-pad section-tight-top">
        <div class="container">
          <div class="segmented" role="tablist">
            ${tabButton('packages', activeTab, `Event packages (${configList('cateringPackages').length})`)}
            ${tabButton('alacarte', activeTab, 'Trays &amp; à la carte')}
          </div>

          ${activeTab === 'packages' ? packagesTab() : `<div id="cateringFineDineSection">${renderMenuExplorer('catering')}</div>`}
        </div>
      </section>

      ${renderEventBudgetCalculator()}
    `;
}

registerPage('catering-menus', buildCateringMenusPage);

registerActions({
  'catering-menus:tab': el => {
    state.cateringMenusTab = el.dataset.tab;
    renderMainView();
  },
  'catering-menus:filter': el => {
    state.cateringPkgFilter = el.dataset.filter;
    renderMainView();
  }
});
