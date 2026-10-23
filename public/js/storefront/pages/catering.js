// Page 1 — Mini Kitchen Catering home. Calm, photo-led and short:
// hero photo → about → photo strip → services → packages / live stations → gallery → reviews → quote form.

import { registerActions } from '../../shared/actions.js';
import { esc } from '../../shared/dom.js';
import { state } from '../state.js';
import { content, configList } from '../config.js';
import { registerPage, renderMainView } from '../view.js';
import {
  galleryGrid,
  galleryTile,
  packageCard,
  sectionHeader,
  testimonialsSection,
  uniqueByImage
} from './sections.js';

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1800&q=85';

function heroSection() {
  // The first catering gallery photo is the hero, so the owner changes it from the Back Office.
  const hero = configList('cateringGallery')[0] || {};
  return `
      <section class="hero-section home-hero">
        <div class="container home-hero-copy">
          <span class="eyebrow">Mini Kitchen Catering · Aley, Lebanon</span>
          <h1 class="home-hero-title">Catering for weddings, events &amp; every celebration</h1>
          <p class="home-hero-text">Lebanese and international buffets, live cooking stations and full service — anywhere in Lebanon.</p>
          <div class="hero-actions">
            <button class="btn btn-primary" data-action="nav:go" data-page="catering-menus">Explore Catering Menus</button>
            <button class="btn btn-outline" data-action="wa:open" data-brand="catering" data-msg="Hello Mini Kitchen Catering! I would like to inquire about your catering menus, packages, and availability for an upcoming event.">
              <i class="fa-brands fa-whatsapp"></i> WhatsApp
            </button>
          </div>
        </div>
        <div class="home-hero-media">
          <img src="${esc(hero.img || HERO_FALLBACK)}" data-fallback="${esc(HERO_FALLBACK)}" alt="${esc(hero.title || 'A Mini Kitchen event set-up')}" />
        </div>
      </section>`;
}

function aboutSection() {
  return `
      <section class="section-pad">
        <div class="container">
          ${sectionHeader({
            eyebrow: 'About us',
            title: 'Generous food, served with care',
            text: 'Mini Kitchen is a family kitchen in Ain Al Remmaneh, Aley. We cook Lebanese classics and international favourites for weddings, company events and private parties — and we bring the staff, the set-up and the live stations with us.'
          })}
          <div class="center-link">
            <button class="text-link" data-action="nav:go" data-page="about">Our story <i class="fa-solid fa-arrow-right"></i></button>
          </div>
        </div>
      </section>`;
}

function photoStrip() {
  const photos = uniqueByImage(configList('liveStations'), configList('cateringPackages')).slice(0, 6);
  if (photos.length === 0) return '';
  return `
      <div class="photo-strip" aria-label="Food and event photos">
        ${photos.map(p => galleryTile(p, 'strip', 'desc')).join('')}
      </div>`;
}

const SERVICES = [
  {
    category: 'wedding',
    title: 'Weddings',
    text: 'Receptions, engagements and garden weddings — buffet or seated, with a menu tasting before the day.'
  },
  {
    category: 'corporate',
    title: 'Corporate Events',
    text: 'Galas, launches and office lunches, served on time by a uniformed team.'
  },
  {
    category: 'private',
    title: 'Private Events',
    text: 'Birthdays, family gatherings and villa parties, from mezza tables to live grills.'
  }
];

function servicesSection() {
  const packages = configList('cateringPackages');
  return `
      <section class="section-pad">
        <div class="container">
          ${sectionHeader({ eyebrow: 'Services', title: 'Catering for every occasion' })}
          <div class="services-grid">
            ${SERVICES.map(s => {
              const photo = packages.find(p => p.category === s.category)?.img || HERO_FALLBACK;
              return `
            <article class="service-card">
              <div class="service-card-media">
                <img src="${esc(photo)}" data-fallback="" alt="${esc(s.title)}" loading="lazy" />
              </div>
              <h3 class="service-card-title">${s.title}</h3>
              <p class="service-card-text">${s.text}</p>
              <button class="text-link" data-action="nav:go" data-page="catering" data-scroll="planEventSection">Request a quote <i class="fa-solid fa-arrow-right"></i></button>
            </article>`;
            }).join('')}
          </div>
        </div>
      </section>`;
}

const tabButton = (tab, activeTab, label) => `
            <button type="button" class="segmented-btn ${activeTab === tab ? 'active' : ''}" data-action="home:tab" data-tab="${tab}">${label}</button>`;

function packagesTab() {
  return `
          <div class="packages-grid">
            ${configList('cateringPackages').slice(0, 3).map(packageCard).join('')}
          </div>
          <div class="center-link">
            <button class="btn btn-outline" data-action="nav:go" data-page="catering-menus">See all packages &amp; menus</button>
          </div>`;
}

function stationsTab() {
  return `
          <div class="stations-grid">
            ${configList('liveStations')
              .map(
                st => `
            <article class="station-card">
              <div class="station-card-media">
                <img src="${esc(st.img)}" data-fallback="" alt="${esc(st.title)}" loading="lazy" />
              </div>
              <div class="station-card-body">
                <span class="eyebrow">${esc(st.tag)}</span>
                <h3 class="station-card-title">${esc(st.title)}</h3>
                <p class="station-card-text">${esc(st.desc)}</p>
                <button class="text-link text-link-wa" data-action="wa:open" data-brand="catering" data-msg="${esc(`Hello Mini Kitchen Catering! I would like to inquire about adding the [${st.title}] live station to my event.`)}">
                  <i class="fa-brands fa-whatsapp"></i> Add to my event
                </button>
              </div>
            </article>`
              )
              .join('')}
          </div>`;
}

function showcaseSection() {
  const activeTab = state.homeShowcaseTab === 'stations' ? 'stations' : 'packages';
  return `
      <section class="section-pad section-ivory">
        <div class="container">
          ${sectionHeader({ eyebrow: 'Menus', title: 'Packages &amp; live stations' })}
          <div class="segmented" role="tablist">
            ${tabButton('packages', activeTab, 'Popular packages')}
            ${tabButton('stations', activeTab, 'Live cooking stations')}
          </div>
          ${activeTab === 'packages' ? packagesTab() : stationsTab()}
        </div>
      </section>`;
}

function gallerySection() {
  const photos = uniqueByImage(configList('cateringGallery'), configList('restaurantGallery')).slice(0, 12);
  if (photos.length === 0) return '';
  return `
      <section class="section-pad" id="homeGallery">
        <div class="container">
          ${sectionHeader({ eyebrow: 'Gallery', title: 'From our events', text: 'Tap a photo to see it full screen.' })}
          ${galleryGrid(photos, 'home', 'caption')}
        </div>
      </section>`;
}

function quoteSection() {
  const { contacts, location } = content.config;
  return `
      <section class="section-pad" id="planEventSection">
        <div class="container quote-layout">
          <div class="quote-intro">
            <span class="eyebrow">Contact</span>
            <h2 class="section-title">Plan your event with us</h2>
            <p class="quote-intro-text">Tell us the date, the number of guests and what you have in mind. Your request opens in WhatsApp, ready to send to our catering team.</p>
            <ul class="contact-lines">
              <li><span class="contact-line-label">Catering & weddings</span><a href="tel:+${esc(contacts.catering.whatsappNumber)}">${esc(contacts.catering.phoneDisplay)}</a></li>
              <li><span class="contact-line-label">Second line</span><span class="ltr">${esc(contacts.catering.secondaryDisplay)}</span></li>
              <li><span class="contact-line-label">Kitchen & tastings</span><span>${esc(location.short)}</span></li>
            </ul>
          </div>

          <div class="form-card">
            <h3 class="form-card-title">Request a quote</h3>
            <form data-on-submit="quote:submit">
              <div class="form-grid">
                <div class="form-group">
                  <label for="quoteName">Your name *</label>
                  <input type="text" id="quoteName" class="form-control" placeholder="e.g. Nadine Karam" required />
                </div>
                <div class="form-group">
                  <label for="quotePhone">Phone / WhatsApp *</label>
                  <input type="tel" id="quotePhone" class="form-control" placeholder="e.g. +961 70 123 456" required />
                </div>
                <div class="form-group">
                  <label for="quoteEventType">Event type *</label>
                  <select id="quoteEventType" class="form-control" required>
                    <option value="Wedding Reception">Wedding Reception</option>
                    <option value="Engagement / Bridal Event">Engagement / Bridal Event</option>
                    <option value="Corporate Event / Gala">Corporate Event / Gala</option>
                    <option value="Private Villa / Garden Party">Private Villa / Garden Party</option>
                    <option value="Birthday / Anniversary">Birthday / Anniversary</option>
                    <option value="Product Launch / Brand Event">Product Launch / Brand Event</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="quoteGuests">Number of guests *</label>
                  <input type="number" id="quoteGuests" class="form-control" placeholder="e.g. 120" min="4" required />
                </div>
                <div class="form-group">
                  <label for="quoteDate">Event date *</label>
                  <input type="date" id="quoteDate" class="form-control" required />
                </div>
                <div class="form-group">
                  <label for="quoteLocation">Location / venue *</label>
                  <input type="text" id="quoteLocation" class="form-control" placeholder="e.g. Aley, Beirut, Bhamdoun" required />
                </div>
                <div class="form-group full">
                  <label for="quotePackage">Package</label>
                  <select id="quotePackage" class="form-control">
                    <option value="Custom Tailored Menu & Quotation">Help me choose a menu</option>
                    <option value="The Royal Mountain Wedding Feast ($45/guest)">The Royal Mountain Wedding Feast ($45/guest)</option>
                    <option value="Sunset Garden Cocktail & Canapés ($32/guest)">Sunset Garden Cocktail & Canapés ($32/guest)</option>
                    <option value="Grand Imperial Five-Station Gala ($60/guest)">Grand Imperial Five-Station Gala ($60/guest)</option>
                    <option value="Executive Corporate Gala Buffet ($28/guest)">Executive Corporate Gala Buffet ($28/guest)</option>
                    <option value="Product Launch Canapé Package ($22/guest)">Product Launch Canapé Package ($22/guest)</option>
                    <option value="Authentic Lebanese Mezza Formula ($25/guest)">Authentic Lebanese Mezza Formula ($25/guest)</option>
                    <option value="American Feast & Cheddar Fountain ($25/guest)">American Feast & Cheddar Fountain ($25/guest)</option>
                    <option value="Lebanese Mountain Breakfast & Saj ($15/guest)">Lebanese Mountain Breakfast & Saj ($15/guest)</option>
                  </select>
                </div>
                <div class="form-group full">
                  <label for="quoteNotes">Notes</label>
                  <textarea id="quoteNotes" class="form-control" rows="2" placeholder="Live stations, service staff, dietary needs…"></textarea>
                </div>
              </div>
              <button type="submit" class="btn btn-whatsapp btn-block form-submit">
                <i class="fa-brands fa-whatsapp"></i> Send request on WhatsApp
              </button>
            </form>
          </div>
        </div>
      </section>`;
}

function buildCateringHomePage() {
  return `
      ${heroSection()}
      ${aboutSection()}
      ${photoStrip()}
      ${servicesSection()}
      ${showcaseSection()}
      ${gallerySection()}
      ${testimonialsSection()}
      ${quoteSection()}
    `;
}

registerPage('catering', buildCateringHomePage);

registerActions({
  'home:tab': el => {
    state.homeShowcaseTab = el.dataset.tab;
    renderMainView();
  }
});
