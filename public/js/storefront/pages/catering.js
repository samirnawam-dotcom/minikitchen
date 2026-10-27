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
  faqList,
  howItWorks,
  fromPriceParts,
  localName,
  nameBlock,
  packages,
  specialOfferCard,
  specialOffers,
  stationMenu
} from '../catering-offer.js';
import { packageBuilderSection } from '../package-builder.js';
import { t } from '../i18n-strings.js';
import { galleryGrid, sectionHeader, testimonialsSection, uniqueByImage } from './sections.js';
import { responsiveAttrs } from '../images.js';

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1800&q=85';

/** Tab on the packages page that each catering type opens. */
const TYPE_TABS = { buffet: 'buffet', birthday: 'birthday', stations: 'stations', trays: 'trays' };

/** Event photos for the hero slideshow and the showcase strip (owner's gallery first, then packages). */
function showcasePhotos() {
  return uniqueByImage(
    cateringList('heroPhotos'),
    configList('cateringGallery'),
    cateringList('cateringTypes'),
    cateringList('eventPackages')
  );
}

function heroSection() {
  // The home slideshow photos lead (Back Office → Photos & team → Home slideshow), then the gallery.
  const photos = showcasePhotos().slice(0, 6);
  if (photos.length === 0) photos.push({ img: HERO_FALLBACK, title: t('A Mini Kitchen event set-up') });
  const slides = photos
    .map(
      (p, i) => `
          <figure class="hero-slide${i === 0 ? ' is-active' : ''}" data-hero-slide="${i}"${i === 0 ? '' : ' aria-hidden="true"'}>
            <img src="${esc(p.img)}"${responsiveAttrs(p.img, '100vw')} data-fallback="${esc(HERO_FALLBACK)}" alt="${esc(t(p.title || 'A Mini Kitchen event'))}" width="1800" height="1200"${i === 0 ? ' fetchpriority="high"' : ' loading="lazy"'} />
          </figure>`
    )
    .join('');
  const controls =
    photos.length > 1
      ? `
        <div class="hero-slider-ui container">
          <div class="hero-dots" role="group" aria-label="${t('Choose a photo')}">
            ${photos
              .map(
                (p, i) =>
                  `<button type="button" class="hero-dot${i === 0 ? ' is-active' : ''}" data-action="hero:go" data-slide="${i}" aria-label="${esc(`${t('Photo {n} of {total}', { n: i + 1, total: photos.length })}${p.title ? `: ${t(p.title)}` : ''}`)}"${i === 0 ? ' aria-current="true"' : ''}><span class="hero-dot-bar"></span></button>`
              )
              .join('')}
          </div>
          <button type="button" class="hero-pause" data-action="hero:toggle" aria-label="${t('Pause the slideshow')}" aria-pressed="false"><i class="fa-solid fa-pause" aria-hidden="true"></i></button>
        </div>`
      : '';
  return `
      <section class="hero-section home-hero" data-hero-slider aria-roledescription="${t('carousel')}" aria-label="${t('Our catering in pictures')}">
        <div class="home-hero-media">${slides}
        </div>
        <div class="container home-hero-copy">
          <span class="eyebrow">${t('Mini Kitchen Catering · Aley, Lebanon')}</span>
          <h1 class="home-hero-title">${t('Catering for weddings, birthdays &amp; every occasion')}</h1>
          <p class="home-hero-text">${t('Event buffets, Birthday Mini packages, live stations and main course trays — priced per person, anywhere in Lebanon.')}</p>
          <div class="hero-actions">
            <button class="btn btn-primary" data-action="nav:go" data-page="catering" data-scroll="planEventSection">${t('Build your package')}</button>
            <button class="btn btn-outline" data-action="nav:go" data-page="catering-menus">${t('See packages &amp; prices')}</button>
          </div>
        </div>${controls}
        <span class="hero-scroll-cue" aria-hidden="true"></span>
      </section>`;
}

/**
 * Two rows of event photos gliding in opposite directions (pauses on hover or focus). Each row is
 * drawn twice so the loop is seamless. Only the first pass of the first row reaches screen readers
 * and the keyboard; everything else repeats the same photos.
 */
function showcaseSection() {
  const photos = showcasePhotos();
  if (photos.length < 4) return '';
  // The second row starts halfway through the list, so the two rows never show the same photo side by side
  const half = Math.ceil(photos.length / 2);
  const rows = [photos, [...photos.slice(half), ...photos.slice(0, half)]];
  const tile = (p, copy) => `
              <button type="button" class="showcase-tile" data-action="lightbox:open" data-lightbox="${copy ? 'showcase-copy' : 'showcase'}" data-caption="${esc([t(p.title), t(p.caption)].filter(Boolean).join(' — '))}"${copy ? ' tabindex="-1" aria-hidden="true"' : ` aria-label="${esc(t('View photo: {title}', { title: t(p.title || 'Mini Kitchen event') }))}"`}>
                <img src="${esc(p.img)}"${responsiveAttrs(p.img, '(max-width: 760px) 70vw, 360px')} data-fallback="" alt="${copy ? '' : esc(t(p.title || 'Mini Kitchen event'))}" loading="lazy" decoding="async" width="520" height="360" />
                ${p.title ? `<span class="showcase-caption">${esc(t(p.title))}</span>` : ''}
              </button>`;
  return `
      <section class="showcase" aria-label="${t('A taste of our catering')}">
        <div class="container">
          ${sectionHeader({ eyebrow: t('Showcase'), title: t('A taste of our catering') })}
        </div>
        ${rows
          .map(
            (row, r) => `
        <div class="showcase-row${r % 2 ? ' showcase-row-reverse' : ''}">
          <div class="showcase-track">
            ${row.map(p => tile(p, r > 0)).join('')}
            ${row.map(p => tile(p, true)).join('')}
          </div>
        </div>`
          )
          .join('')}
      </section>`;
}

function typesSection() {
  const types = cateringList('cateringTypes');
  if (types.length === 0) return '';
  return `
      <section class="section-pad section-ivory">
        <div class="container">
          ${sectionHeader({ eyebrow: t('Catering'), title: t('What would you like for your event?') })}
          <div class="packages-grid packages-grid-4">
            ${types
              .map(type => {
                const from = fromPriceParts(type.id);
                const tab = esc(TYPE_TABS[type.id] || 'buffet');
                const ask = `Hello Mini Kitchen Catering! I would like to know more about your ${type.name || 'catering'} offer.`;
                return `
            <article class="package-card event-package type-package">
              <button type="button" class="package-card-media" data-action="catering:open-type" data-tab="${tab}" aria-label="${esc(t('See {name}', { name: localName(type) }))}">
                <img src="${esc(type.img)}"${responsiveAttrs(type.img, '(max-width: 560px) 100vw, (max-width: 1100px) 50vw, 25vw')} data-fallback="" alt="" loading="lazy" decoding="async" width="600" height="400" />
              </button>
              <div class="package-card-body">
                <div class="package-card-head">
                  <div>
                    <div class="package-card-cat">${t('Catering')}</div>
                    <h3 class="package-card-title">${nameBlock(type)}</h3>
                  </div>
                  ${
                    from
                      ? `<div class="package-card-price"><span class="package-price-from">${t('from')}</span><span class="package-price-value">${esc(from.value)}</span><span class="package-price-unit">${esc(from.unit)}</span></div>`
                      : ''
                  }
                </div>
                <p class="package-card-sub type-package-text">${esc(t(type.text))}</p>
                <div class="package-card-footer">
                  <button type="button" class="btn btn-primary btn-sm" data-action="catering:open-type" data-tab="${tab}">${t('See prices')}</button>
                  <button type="button" class="btn btn-outline btn-sm" data-action="wa:open" data-brand="catering" data-msg="${esc(ask)}">
                    <i class="fa-brands fa-whatsapp"></i> ${t('Ask')}
                  </button>
                </div>
              </div>
            </article>`;
              })
              .join('')}
          </div>
        </div>
      </section>`;
}

/** Tagline of a catering type in the visitor's language, e.g. "Every occasion, a unique taste." */
const typeTagline = id => {
  const type = cateringList('cateringTypes').find(entry => entry.id === id);
  return type ? localName(type, 'tagline') : '';
};

/** Seasonal offers (Eid, Christmas…): only while the owner has switched the section on. */
function specialOffersSection() {
  const offers = specialOffers();
  if (!offers) return '';
  const { section, items } = offers;
  // One card centred, two or four as a 2×2 block, otherwise three in a row.
  const grid = items.length === 1 ? 'packages-grid-1' : items.length % 3 && items.length <= 4 ? 'packages-grid-2' : 'packages-grid-3';
  return `
      <section class="section-pad section-offers" id="specialOffers">
        <div class="container">
          ${sectionHeader({ eyebrow: t('Limited-time offers'), title: esc(localName(section, 'title') || t('Special offer')), text: esc(localName(section, 'text')) })}
          <div class="packages-grid ${grid}">
            ${items.map(o => specialOfferCard(o, section.brand)).join('')}
          </div>
        </div>
      </section>`;
}

function buffetSection() {
  const list = packages('buffet');
  if (list.length === 0) return '';
  return `
      <section class="section-pad">
        <div class="container">
          ${sectionHeader({ eyebrow: t('Event buffets · per person'), title: t('Weddings &amp; occasions'), text: esc(typeTagline('buffet')) })}
          <div class="packages-grid packages-grid-3">
            ${list.map(p => eventPackageCard(p)).join('')}
          </div>
          ${extrasNote()}
          <div class="center-link">
            <button type="button" class="btn btn-outline" data-action="catering:open-type" data-tab="menu" data-scroll="cateringPackagesSection">${t('See our full catering menu')}</button>
          </div>
        </div>
      </section>`;
}

function birthdaySection() {
  const list = packages('birthday');
  if (list.length === 0) return '';
  return `
      <section class="section-pad">
        <div class="container">
          ${sectionHeader({ eyebrow: t('Birthday Mini · per person'), title: t('Celebrate your day with Mini Kitchen'), text: esc(typeTagline('birthday')) })}
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
          ${sectionHeader({ eyebrow: t('Add-ons'), title: t('Live stations'), text: t('Cooked in front of your guests. Add one to any package.') })}
          ${stationMenu()}
          <div class="center-link">
            <button class="btn btn-outline" data-action="catering:open-type" data-tab="trays">${t('Main course trays &amp; mini bites')}</button>
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
          ${sectionHeader({ eyebrow: t('Gallery'), title: t('From our events'), text: t('Tap a photo to see it full screen.') })}
          ${galleryGrid(photos, 'home', 'caption')}
        </div>
      </section>`;
}

function howSection() {
  return `
      <section class="section-pad section-how" id="howItWorks">
        <div class="container">
          ${sectionHeader({ eyebrow: t('How it works'), title: t('From first idea to confirmed menu'), text: t('No forms to print and no deposit online — your request goes straight to our catering team.') })}
          ${howItWorks()}
          <div class="center-link">
            <button class="btn btn-primary" data-action="builder:start">${t('Start building your package')}</button>
          </div>
        </div>
      </section>`;
}

function faqSection() {
  return `
      <section class="section-pad section-ivory" id="cateringFaq">
        <div class="container container-narrow">
          ${sectionHeader({ eyebrow: t('Good to know'), title: t('Questions we are often asked') })}
          ${faqList()}
        </div>
      </section>`;
}

/** Restaurant and delivery are side businesses: one quiet band near the bottom of the page. */
function alsoFromSection() {
  return `
      <section class="also-band" aria-label="${t('Also from Mini Kitchen')}">
        <div class="container also-band-inner">
          <span class="eyebrow">${t('Also from Mini Kitchen')}</span>
          <div class="also-links">
            <button type="button" class="also-link" data-action="nav:go" data-page="restaurant">
              <i class="fa-solid fa-mountain-sun" aria-hidden="true"></i>
              <span><strong>${t('Restaurant')}</strong> ${t('Terrace dining in Ain Al Remmaneh')}</span>
              <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </button>
            <button type="button" class="also-link" data-action="nav:go" data-page="delivery">
              <i class="fa-solid fa-motorcycle" aria-hidden="true"></i>
              <span><strong>${t('Delivery')}</strong> ${t('Order from our menu on WhatsApp')}</span>
              <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </section>`;
}

function buildCateringHomePage() {
  return `
      ${heroSection()}
      ${specialOffersSection()}
      ${buffetSection()}
      ${showcaseSection()}
      ${howSection()}
      ${typesSection()}
      ${birthdaySection()}
      ${stationsSection()}
      ${gallerySection()}
      ${testimonialsSection()}
      ${packageBuilderSection({ ivory: false })}
      ${faqSection()}
      ${alsoFromSection()}
    `;
}

registerPage('catering', buildCateringHomePage);

registerActions({
  // A catering type card opens the matching tab on the packages page.
  'catering:open-type': el => {
    state.cateringMenusTab = el.dataset.tab || 'buffet';
    navigateToPage('catering-menus', el.dataset.scroll);
  }
});
