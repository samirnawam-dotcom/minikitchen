// Page 2 — Catering menus & event packages: package grid with category filter, or the FineDine
// à-la-carte catering trays explorer (two tabs).

import { registerActions } from '../../shared/actions.js';
import { state } from '../state.js';
import { configList } from '../config.js';
import { renderMenuExplorer } from '../menu-view.js';
import { renderTableBanner } from '../table-banner.js';
import { registerPage, renderMainView } from '../view.js';
import { heroSection, packageCard } from './sections.js';
import { renderEventBudgetCalculator } from '../event-calculator.js';

const filterButton = (filter, label) =>
  `<button class="filter-tab-btn ${state.cateringPkgFilter === filter ? 'active' : ''}" data-action="catering-menus:filter" data-filter="${filter}">${label}</button>`;

function packagesTab() {
  const allPackages = configList('cateringPackages');
  const filtered =
    state.cateringPkgFilter === 'all' ? allPackages : allPackages.filter(p => p.category === state.cateringPkgFilter);
  return `
                ${renderTableBanner()}
                <div class="filter-tabs" style="margin-bottom:28px;">
                  ${filterButton('all', `All Packages (${allPackages.length})`)}
                  ${filterButton('wedding', '<i class="fa-solid fa-rings-wedding"></i> Wedding Catering')}
                  ${filterButton('corporate', '<i class="fa-solid fa-briefcase"></i> Corporate Options')}
                  ${filterButton('private', '<i class="fa-solid fa-champagne-glasses"></i> Private Parties & Formulas')}
                </div>

                <div class="packages-grid">
                  ${filtered.map(packageCard).join('')}
                </div>
              `;
}

function buildCateringMenusPage() {
  const activeTab = state.cateringMenusTab || 'packages';

  return `
      ${heroSection({
        style: 'min-height: 40vh; padding: 48px 0;',
        img: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1800&q=85',
        alt: 'Catering Menus & Event Packages',
        body: `
          <div class="hero-content">
            <div class="hero-eyebrow"><i class="fa-solid fa-utensils"></i> <span>Mini Kitchen Catering • Packages & FineDine Trays</span></div>
            <h1 class="hero-title" style="font-size:clamp(2rem, 3.8vw, 3.1rem);">Catering Packages & <span class="gold-accent">À La Carte</span> Menus</h1>
            <p class="hero-subtitle" style="margin-bottom:20px;">
              Choose a complete per-guest event package or build your own custom buffet spread from our FineDine catering platters and 1KG grills.
            </p>
            <div class="hero-cta-group" style="margin-bottom:0;">
              <button class="btn btn-whatsapp" data-action="wa:open" data-brand="catering" data-msg="Hello Mini Kitchen Catering! I am browsing your Catering Menus & Packages page and would like a customized quotation.">
                <i class="fa-brands fa-whatsapp"></i> Request Custom Menu on WhatsApp
              </button>
              <button class="btn btn-outline-light" data-action="nav:go" data-page="catering" data-scroll="planEventSection">
                <i class="fa-solid fa-calculator"></i> Open Event Quote Planner
              </button>
            </div>
          </div>`
      })}

      <section class="section-pad" style="padding-top:44px;">
        <div class="container">
          <!-- 2-TAB SWITCHER: EVENT PACKAGES VS FINEDINE A LA CARTE TRAYS -->
          <div class="ux-section-tabs-nav">
            <button
              type="button"
              class="ux-section-tab-btn ${activeTab === 'packages' ? 'active' : ''}"
              data-action="catering-menus:tab"
              data-tab="packages"
            >
              <i class="fa-solid fa-champagne-glasses"></i> 1. Full Event & Wedding Packages (8)
            </button>
            <button
              type="button"
              class="ux-section-tab-btn ${activeTab === 'alacarte' ? 'active' : ''}"
              data-action="catering-menus:tab"
              data-tab="alacarte"
            >
              <i class="fa-solid fa-table-list"></i> 2. FineDine À La Carte Trays & 1KG Grills
            </button>
          </div>

          ${
            activeTab === 'packages'
              ? packagesTab()
              : `
                <div id="cateringFineDineSection">
                  ${renderMenuExplorer('catering')}
                </div>
              `
          }
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
