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
  fromPriceLabel,
  localName,
  nameBlock,
  packages,
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
      <section class="section-pad">
        <div class="container">
          ${sectionHeader({ eyebrow: t('Catering'), title: t('What would you like for your event?') })}
          <div class="types-grid">
            ${types
              .map(type => {
                const from = fromPriceLabel(type.id);
                return `
            <article class="type-card">
              <button type="button" class="type-card-media" data-action="catering:open-type" data-tab="${esc(TYPE_TABS[type.id] || 'buffet')}" aria-label="${esc(t('See {name}', { name: localName(type) }))}">
                <img src="${esc(type.img)}"${responsiveAttrs(type.img, '(max-width: 760px) 50vw, 25vw')} data-fallback="" alt="" loading="lazy" width="500" height="625" />
              </button>
              <h3 class="type-card-title">${nameBlock(type)}</h3>
              ${from ? `<div class="type-card-price">${esc(from)}</div>` : ''}
              <p class="type-card-text">${esc(t(type.text))}</p>
              <button type="button" class="text-link" data-action="catering:open-type" data-tab="${esc(TYPE_TABS[type.id] || 'buffet')}">${t('See prices')} <i class="fa-solid fa-arrow-right"></i></button>
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

function buffetSection() {
  const list = packages('buffet');
  if (list.length === 0) return '';
  return `
      <section class="section-pad section-ivory">
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
      ${typesSection()}
      ${showcaseSection()}
      ${howSection()}
      ${buffetSection()}
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
