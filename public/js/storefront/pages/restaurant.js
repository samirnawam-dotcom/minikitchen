// Page 3 — Mini Kitchen Restaurant: scenic hero, then two tabs: the FineDine table QR menu, or
// terrace photos + location, hours and map.

import { registerActions } from '../../shared/actions.js';
import { esc } from '../../shared/dom.js';
import { state } from '../state.js';
import { content, configList } from '../config.js';
import { renderMenuExplorer } from '../menu-view.js';
import { registerPage, renderMainView } from '../view.js';
import { heroSection, galleryCard } from './sections.js';

function atmosphereTab() {
  const { contacts, location } = content.config;
  return `
                <!-- ATMOSPHERE, VIEWS & MAP TAB -->
                <div class="gallery-grid" style="margin-bottom: 40px;">
                  ${configList('restaurantGallery')
                    .map(g => galleryCard(g, 'tag', 'desc'))
                    .join('')}
                </div>

                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr)); gap: 32px; align-items:center; background:#14171c; color:#fff; padding:34px; border-radius:22px;">
                  <div>
                    <span class="section-eyebrow">Visit Us in Mount Lebanon</span>
                    <h3 style="font-family:var(--font-serif); font-size:1.75rem; margin-bottom:12px;">Location, Opening Hours & Table Booking</h3>
                    <p style="color:rgba(255,255,255,0.8); margin-bottom:18px; font-size:0.94rem;">
                      Whether you join us at 8:00 AM for hot Manakish Bil Foron and Lebanese Foul overlooking the mountains, or gather at sunset for charcoal burgers, mixed grills, and arguileh—we welcome walk-ins and reservations daily.
                    </p>
                    <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px; font-size:0.92rem;">
                      <div><i class="fa-solid fa-location-dot" style="color:var(--brand-primary); width:22px;"></i> <b>Address:</b> ${esc(location.full)}</div>
                      <div><i class="fa-solid fa-clock" style="color:var(--brand-primary); width:22px;"></i> <b>Opening Hours:</b> ${esc(location.hours)}</div>
                      <div><i class="fa-solid fa-phone" style="color:var(--brand-primary); width:22px;"></i> <b>Restaurant Line:</b> ${esc(contacts.restaurant.phoneDisplay)}</div>
                    </div>
                    <button class="btn btn-whatsapp" data-action="wa:open" data-brand="restaurant" data-msg="Hello Mini Kitchen Restaurant! I would like to book a table at your restaurant in Ain Al Remmaneh, Aley.">
                      <i class="fa-brands fa-whatsapp"></i> Reserve a Table via WhatsApp
                    </button>
                  </div>
                  <div style="border-radius:16px; overflow:hidden; height:320px; border:1px solid rgba(255,255,255,0.15);">
                    <iframe src="${esc(location.mapEmbedUrl)}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
                  </div>
                </div>
              `;
}

function buildRestaurantPage() {
  const { contacts, location } = content.config;
  const activeTab = state.restoViewTab || 'menu';

  return `
      <!-- COMPACT RESTAURANT SCENIC HERO -->
      ${heroSection({
        style: 'min-height: 42vh; padding: 44px 0;',
        img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=85',
        alt: 'Mini Kitchen Restaurant Scenic View in Aley',
        body: `
          <div class="hero-content">
            <div class="hero-eyebrow" style="background:rgba(45,106,79,0.38); border-color:#52b788; color:#d8f3dc;">
              <i class="fa-solid fa-mountain-sun"></i>
              <span>Mini Kitchen Restaurant • Ain Al Remmaneh, Aley</span>
            </div>
            <h1 class="hero-title" style="font-size:clamp(2rem, 3.8vw, 3.1rem);">
              Panoramic Mountain Views & <span class="gold-accent">#NotSoTraditional</span> Dining
            </h1>
            <p class="hero-subtitle" style="margin-bottom:20px;">
              Dine on our scenic Aley terrace from 8:00 AM to 10:00 PM. Scan our table QR code or browse our interactive FineDine menu below.
            </p>
            <div class="hero-cta-group" style="margin-bottom:16px;">
              <button class="btn btn-whatsapp" data-action="wa:open" data-brand="restaurant" data-msg="Hello Mini Kitchen Restaurant! I would like to reserve a table in Ain Al Remmaneh, Aley.">
                <i class="fa-brands fa-whatsapp" style="font-size:1.15rem;"></i> Reserve a Table on WhatsApp
              </button>
              <button class="btn btn-outline-light" data-action="qr:open" data-mode="resto">
                <i class="fa-solid fa-qrcode"></i> Table Dine-In QR Code
              </button>
              <a class="btn btn-outline-light" href="${esc(location.googleMapsUrl)}" target="_blank" rel="noopener">
                <i class="fa-solid fa-location-dot"></i> Get Directions (${esc(location.short)})
              </a>
            </div>
            <div class="hero-event-pills">
              <span class="event-type-pill"><i class="fa-solid fa-clock"></i> Daily: 8:00 AM – 10:00 PM</span>
              <span class="event-type-pill"><i class="fa-solid fa-phone"></i> ${esc(contacts.restaurant.phoneDisplay)}</span>
              <span class="event-type-pill"><i class="fa-solid fa-mountain"></i> Outdoor View Terrace & Family Area</span>
            </div>
          </div>`
      })}

      <section class="section-pad" id="restoDigitalMenuSection" style="background:var(--bg-cream); padding-top:38px;">
        <div class="container">
          <!-- 2-TAB SWITCHER: FINEDINE MENU VS VIEWS, ATMOSPHERE & MAP -->
          <div class="ux-section-tabs-nav">
            <button
              type="button"
              class="ux-section-tab-btn ${activeTab === 'menu' ? 'active' : ''}"
              data-action="restaurant:tab"
              data-tab="menu"
            >
              <i class="fa-solid fa-qrcode"></i> 1. FineDine Table QR Menu (239 Dishes)
            </button>
            <button
              type="button"
              class="ux-section-tab-btn ${activeTab === 'atmosphere' ? 'active' : ''}"
              data-action="restaurant:tab"
              data-tab="atmosphere"
            >
              <i class="fa-solid fa-mountain-sun"></i> 2. Terrace Views, Photos & Aley Map
            </button>
          </div>

          ${activeTab === 'menu' ? renderMenuExplorer('resto') : atmosphereTab()}
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
