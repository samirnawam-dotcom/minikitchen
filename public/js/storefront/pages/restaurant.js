// Page 3 — Mini Kitchen Restaurant: light page header, then two tabs: the table QR menu, or
// terrace photos (full-screen viewer) with address, hours and map.

import { registerActions } from '../../shared/actions.js';
import { esc } from '../../shared/dom.js';
import { state } from '../state.js';
import { content, configList } from '../config.js';
import { renderMenuExplorer } from '../menu-view.js';
import { registerPage, renderMainView } from '../view.js';
import { galleryGrid, pageHero } from './sections.js';

function atmosphereTab() {
  const { contacts, location } = content.config;
  return `
          ${galleryGrid(configList('restaurantGallery'), 'restaurant', 'desc')}

          <div class="visit-panel">
            <div class="visit-panel-copy">
              <span class="eyebrow">Visit us</span>
              <h3 class="visit-panel-title">Breakfast to dinner, with a view</h3>
              <p>Manakish and foul in the morning, charcoal grills and burgers at sunset. Walk in or book a table.</p>
              <ul class="info-list">
                <li><i class="fa-solid fa-location-dot"></i> <span>${esc(location.full)}</span></li>
                <li><i class="fa-regular fa-clock"></i> <span>${esc(location.hours)}</span></li>
                <li><i class="fa-solid fa-phone"></i> <span class="ltr">${esc(contacts.restaurant.phoneDisplay)}</span></li>
              </ul>
              <div class="hero-actions">
                <button class="btn btn-whatsapp" data-action="wa:open" data-brand="restaurant" data-msg="Hello Mini Kitchen Restaurant! I would like to book a table at your restaurant in Ain Al Remmaneh, Aley.">
                  <i class="fa-brands fa-whatsapp"></i> Book a table
                </button>
                <a class="btn btn-outline" href="${esc(location.googleMapsUrl)}" target="_blank" rel="noopener">
                  <i class="fa-solid fa-diamond-turn-right"></i> Directions
                </a>
              </div>
            </div>
            <div class="map-frame">
              <iframe src="${esc(location.mapEmbedUrl)}" title="Map: Mini Kitchen, Ain Al Remmaneh" loading="lazy" allowfullscreen=""></iframe>
            </div>
          </div>`;
}

const tabButton = (tab, activeTab, label) => `
            <button type="button" role="tab" id="rtTab-${tab}" aria-controls="rtPanel" aria-selected="${activeTab === tab}" tabindex="${activeTab === tab ? '0' : '-1'}" class="segmented-btn ${activeTab === tab ? 'active' : ''}" data-action="restaurant:tab" data-tab="${tab}">${label}</button>`;

function buildRestaurantPage() {
  const { contacts, location } = content.config;
  const activeTab = state.restoViewTab === 'atmosphere' ? 'atmosphere' : 'menu';

  return `
      ${pageHero({
        eyebrow: 'Mini Kitchen Restaurant · Ain Al Remmaneh',
        title: 'Mountain views &amp; honest food',
        text: 'Lebanese breakfast, charcoal grills, burgers and pizza on our terrace in Aley — every day from 8:00 AM to 10:00 PM.',
        photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=85',
        alt: 'The Mini Kitchen restaurant terrace',
        actions: `
              <button class="btn btn-whatsapp" data-action="wa:open" data-brand="restaurant" data-msg="Hello Mini Kitchen Restaurant! I would like to reserve a table in Ain Al Remmaneh, Aley.">
                <i class="fa-brands fa-whatsapp"></i> Book a table
              </button>
              <a class="btn btn-outline" href="${esc(location.googleMapsUrl)}" target="_blank" rel="noopener">
                <i class="fa-solid fa-location-dot"></i> Directions
              </a>`,
        meta: [
          '<i class="fa-regular fa-clock"></i> Daily 8:00 AM – 10:00 PM',
          `<i class="fa-solid fa-phone"></i> <span class="ltr">${esc(contacts.restaurant.phoneDisplay)}</span>`,
          '<i class="fa-solid fa-mountain-sun"></i> Terrace & family area'
        ]
      })}

      <section class="section-pad section-ivory section-tight-top" id="restoDigitalMenuSection">
        <div class="container">
          <h2 class="sr-only">Restaurant menu, photos and opening hours</h2>
          <div class="segmented" role="tablist" aria-label="Restaurant">
            ${tabButton('menu', activeTab, 'Menu')}
            ${tabButton('atmosphere', activeTab, 'Photos, hours &amp; map')}
          </div>

          <div role="tabpanel" id="rtPanel" aria-labelledby="rtTab-${activeTab}">
          ${activeTab === 'menu' ? renderMenuExplorer('resto') : atmosphereTab()}
          </div>
        </div>
      </section>
    `;
}

registerPage('restaurant', buildRestaurantPage);

registerActions({
  'restaurant:tab': el => {
    state.restoViewTab = el.dataset.tab;
    renderMainView();
  }
});
