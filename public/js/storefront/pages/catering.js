// Page 1 — Mini Kitchen Catering home. Catering first, calm and photo-led:
// hero → the four kinds of catering → event buffets → Birthday Minis → live stations → gallery →
// reviews → "Build your package" → a small "Also from Mini Kitchen" band (restaurant & delivery).

import { registerActions } from '../../shared/actions.js';
import { esc } from '../../shared/dom.js';
import { state } from '../state.js';
import { cateringList, configList } from '../config.js';
import { navigateToPage } from '../navigation.js';
import { registerPage } from '../view.js';
import {
  eventPackageCard,
  extrasNote,
  fromPriceLabel,
  localName,
  nameBlock,
  packages,
  stationMenu
} from '../catering-offer.js';
import { packageBuilderSection } from '../package-builder.js';
import { galleryGrid, sectionHeader, testimonialsSection, uniqueByImage } from './sections.js';

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1800&q=85';

/** Tab on the packages page that each catering type opens. */
const TYPE_TABS = { buffet: 'buffet', birthday: 'birthday', stations: 'stations', trays: 'trays' };

function heroSection() {
  // The first catering gallery photo is the hero, so the owner changes it from the Back Office.
  const hero = configList('cateringGallery')[0] || {};
  return `
      <section class="hero-section home-hero">
        <div class="container home-hero-copy">
          <span class="eyebrow">Mini Kitchen Catering · Aley, Lebanon</span>
          <h1 class="home-hero-title">Catering for weddings, birthdays &amp; every occasion</h1>
          <p class="home-hero-text">Event buffets, Birthday Mini packages, live stations and main course trays — priced per person, anywhere in Lebanon.</p>
          <div class="hero-actions">
            <button class="btn btn-primary" data-action="nav:go" data-page="catering" data-scroll="planEventSection">Build your package</button>
            <button class="btn btn-outline" data-action="nav:go" data-page="catering-menus">See packages &amp; prices</button>
          </div>
        </div>
        <div class="home-hero-media">
          <img src="${esc(hero.img || HERO_FALLBACK)}" data-fallback="${esc(HERO_FALLBACK)}" alt="${esc(hero.title || 'A Mini Kitchen event set-up')}" />
        </div>
      </section>`;
}

function typesSection() {
  const types = cateringList('cateringTypes');
  if (types.length === 0) return '';
  return `
      <section class="section-pad">
        <div class="container">
          ${sectionHeader({ eyebrow: 'Catering', title: 'What would you like for your event?' })}
          <div class="types-grid">
            ${types
              .map(t => {
                const from = fromPriceLabel(t.id);
                return `
            <article class="type-card">
              <button type="button" class="type-card-media" data-action="catering:open-type" data-tab="${esc(TYPE_TABS[t.id] || 'buffet')}" aria-label="${esc(`See ${t.name}`)}">
                <img src="${esc(t.img)}" data-fallback="" alt="" loading="lazy" />
              </button>
              <h3 class="type-card-title">${nameBlock(t)}</h3>
              ${from ? `<div class="type-card-price">${esc(from)}</div>` : ''}
              <p class="type-card-text">${esc(t.text)}</p>
              <button type="button" class="text-link" data-action="catering:open-type" data-tab="${esc(TYPE_TABS[t.id] || 'buffet')}">See prices <i class="fa-solid fa-arrow-right"></i></button>
            </article>`;
              })
              .join('')}
          </div>
        </div>
      </section>`;
}

/** Tagline of a catering type in the visitor's language, e.g. "Every occasion, a unique taste." */
const typeTagline = id => {
  const type = cateringList('cateringTypes').find(t => t.id === id);
  return type ? localName(type, 'tagline') : '';
};

function buffetSection() {
  const list = packages('buffet');
  if (list.length === 0) return '';
  return `
      <section class="section-pad section-ivory">
        <div class="container">
          ${sectionHeader({ eyebrow: 'Event buffets · per person', title: 'Weddings &amp; occasions', text: esc(typeTagline('buffet')) })}
          <div class="packages-grid packages-grid-3">
            ${list.map(p => eventPackageCard(p)).join('')}
          </div>
          ${extrasNote()}
        </div>
      </section>`;
}

function birthdaySection() {
  const list = packages('birthday');
  if (list.length === 0) return '';
  return `
      <section class="section-pad">
        <div class="container">
          ${sectionHeader({ eyebrow: 'Birthday Mini · per person', title: 'Celebrate your day with Mini Kitchen', text: esc(typeTagline('birthday')) })}
          <div class="packages-grid packages-grid-3">
            ${list.map(p => eventPackageCard(p, { photo: false })).join('')}
          </div>
        </div>
      </section>`;
}

function stationsSection() {
  if (cateringList('liveStationMenu').length === 0) return '';
  return `
      <section class="section-pad section-ivory">
        <div class="container container-narrow">
          ${sectionHeader({ eyebrow: 'Add-ons', title: 'Live stations', text: 'Cooked in front of your guests. Add one to any package.' })}
          ${stationMenu()}
          <div class="center-link">
            <button class="btn btn-outline" data-action="catering:open-type" data-tab="trays">Main course trays &amp; mini bites</button>
          </div>
        </div>
      </section>`;
}

function gallerySection() {
  const photos = uniqueByImage(configList('cateringGallery')).slice(0, 12);
  if (photos.length === 0) return '';
  return `
      <section class="section-pad" id="homeGallery">
        <div class="container">
          ${sectionHeader({ eyebrow: 'Gallery', title: 'From our events', text: 'Tap a photo to see it full screen.' })}
          ${galleryGrid(photos, 'home', 'caption')}
        </div>
      </section>`;
}

/** Restaurant and delivery are side businesses: one quiet band near the bottom of the page. */
function alsoFromSection() {
  return `
      <section class="also-band" aria-label="Also from Mini Kitchen">
        <div class="container also-band-inner">
          <span class="eyebrow">Also from Mini Kitchen</span>
          <div class="also-links">
            <button type="button" class="also-link" data-action="nav:go" data-page="restaurant">
              <i class="fa-solid fa-mountain-sun" aria-hidden="true"></i>
              <span><strong>Restaurant</strong> Terrace dining in Ain Al Remmaneh</span>
              <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </button>
            <button type="button" class="also-link" data-action="nav:go" data-page="delivery">
              <i class="fa-solid fa-motorcycle" aria-hidden="true"></i>
              <span><strong>Delivery</strong> Order from our menu on WhatsApp</span>
              <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </section>`;
}

function buildCateringHomePage() {
  return `
      ${heroSection()}
      ${typesSection()}
      ${buffetSection()}
      ${birthdaySection()}
      ${stationsSection()}
      ${gallerySection()}
      ${testimonialsSection()}
      ${packageBuilderSection({ ivory: false })}
      ${alsoFromSection()}
    `;
}

registerPage('catering', buildCateringHomePage);

registerActions({
  // A catering type card opens the matching tab on the packages page.
  'catering:open-type': el => {
    state.cateringMenusTab = el.dataset.tab || 'buffet';
    navigateToPage('catering-menus');
  }
});
