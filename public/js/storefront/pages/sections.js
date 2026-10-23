// Building blocks shared by several pages: page hero, section header, photo gallery tiles (opened in
// the full-screen viewer, see ../lightbox.js) and client reviews. Catering package cards live in
// ../catering-offer.js.
// Config text is always escaped; `title` / `text` / `actions` arguments are trusted page markup.

import { esc } from '../../shared/dom.js';
import { content, getTestimonials } from '../config.js';

const img = (src, alt, { fallback = '', lazy = true, cls = '' } = {}) =>
  `<img src="${esc(src)}" data-fallback="${esc(fallback)}" alt="${esc(alt)}"${lazy ? ' loading="lazy"' : ''}${cls ? ` class="${cls}"` : ''} />`;

/**
 * Light page header: eyebrow, title, one line of text and buttons, with an optional photo beside it.
 * Keeps the .hero-section class so the table-QR mode can hide it.
 */
export function pageHero({ eyebrow, title, text, actions = '', meta = [], photo, alt = '', fallback }) {
  return `
      <section class="hero-section page-hero${photo ? ' has-photo' : ''}">
        <div class="container page-hero-inner">
          <div class="page-hero-copy">
            <span class="eyebrow">${eyebrow}</span>
            <h1 class="page-hero-title">${title}</h1>
            ${text ? `<p class="page-hero-text">${text}</p>` : ''}
            ${actions ? `<div class="hero-actions">${actions}</div>` : ''}
            ${meta.length ? `<ul class="hero-meta">${meta.map(m => `<li>${m}</li>`).join('')}</ul>` : ''}
          </div>
          ${photo ? `<div class="page-hero-media">${img(photo, alt, { fallback, lazy: false })}</div>` : ''}
        </div>
      </section>`;
}

/** Centered section heading: small accent label, serif title with a hairline under it, optional line of text. */
export function sectionHeader({ eyebrow, title, text, align = 'center' }) {
  return `
          <header class="section-header${align === 'start' ? ' section-header-start' : ''}">
            <span class="eyebrow">${eyebrow}</span>
            <h2 class="section-title">${title}</h2>
            ${text ? `<p class="section-desc">${text}</p>` : ''}
          </header>`;
}

/**
 * One photo that opens the full-screen viewer. Tiles with the same `group` are browsed together.
 * `item` needs { img, title } and may carry a caption field named by `captionKey`.
 */
export function galleryTile(item, group, captionKey, shape = '') {
  const caption = [item.title, captionKey ? item[captionKey] : ''].filter(Boolean).join(' — ');
  return `
            <button type="button" class="gallery-tile${shape ? ` ${shape}` : ''}" data-action="lightbox:open" data-lightbox="${esc(group)}" data-caption="${esc(caption)}" aria-label="${esc(`View photo: ${item.title || 'Mini Kitchen'}`)}">
              ${img(item.img, item.title || 'Mini Kitchen')}
              ${item.title ? `<span class="gallery-tile-caption">${esc(item.title)}</span>` : ''}
            </button>`;
}

/**
 * Shape of each photo in the editorial grid (3 columns): blocks of four fill two rows exactly —
 * tall + wide + two squares, then mirrored — and the last one to three photos close the grid.
 */
function tileShape(i, count) {
  const fullBlocks = Math.floor(count / 4) * 4;
  if (i < fullBlocks) {
    const mirrored = Math.floor(i / 4) % 2 === 1;
    const pos = i % 4;
    if (pos === 0) return mirrored ? 'tile-wide' : 'tile-tall';
    if (pos === 1) return mirrored ? 'tile-tall' : 'tile-wide';
    return '';
  }
  const rest = count - fullBlocks;
  if (rest === 1) return 'tile-full';
  if (rest === 2) return i === fullBlocks ? 'tile-wide' : 'tile-tail';
  return '';
}

/** Editorial photo grid; every photo opens the full-screen viewer. */
export function galleryGrid(items, group, captionKey) {
  return `<div class="gallery-grid">${items.map((item, i) => galleryTile(item, group, captionKey, tileShape(i, items.length))).join('')}</div>`;
}

/** Items from several config lists, without repeating the same photo. */
export function uniqueByImage(...lists) {
  const seen = new Set();
  return lists.flat().filter(item => {
    if (!item || !item.img || seen.has(item.img)) return false;
    seen.add(item.img);
    return true;
  });
}

export function testimonialsSection({ tone = 'ivory' } = {}) {
  const reviews = getTestimonials();
  if (reviews.length === 0) return '';

  return `
      <section class="section-pad section-${tone}">
        <div class="container">
          ${sectionHeader({ eyebrow: 'Kind words', title: 'What our guests say' })}
          <div class="reviews-grid">
            ${reviews
              .map(r => {
                const stars = Math.min(5, Math.max(1, Number(r.rating) || 5));
                return `
              <figure class="review-card">
                <div class="review-stars" aria-label="${stars} out of 5 stars">${'<i class="fa-solid fa-star"></i>'.repeat(stars)}</div>
                <blockquote class="review-quote">“${esc(r.quote || r.caption || r.desc || '')}”</blockquote>
                <figcaption class="review-author">
                  <img src="${esc(r.img || content.config.logos.main)}" data-fallback="" alt="" loading="lazy" />
                  <span>
                    <span class="review-name">${esc(r.name || r.title || 'Valued Client')}</span>
                    <span class="review-role">${esc(r.role || r.category || r.tag || 'Mini Kitchen client')}</span>
                  </span>
                </figcaption>
              </figure>`;
              })
              .join('')}
          </div>
        </div>
      </section>
    `;
}
