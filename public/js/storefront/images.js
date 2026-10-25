// Image fallbacks. Markup uses <img data-fallback="url"> (see ../shared/actions.js); when the
// fallback and the page-wide default have both failed, a built-in "MK" placeholder is shown.

import { setDefaultImageFallback } from '../shared/actions.js';
import { SAFE_DEFAULT_FALLBACK } from './config.js';
import { esc } from '../shared/dom.js';

export const INLINE_DISH_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
        <rect width="400" height="300" fill="#f1ece2"/>
        <circle cx="200" cy="138" r="46" stroke="#c59b27" stroke-width="1.5" fill="none"/>
        <text x="200" y="147" text-anchor="middle" fill="#8a6914" font-family="Georgia, serif" font-size="24">MK</text>
        <text x="200" y="222" text-anchor="middle" fill="#69625a" font-family="sans-serif" font-size="12" letter-spacing="3">MINI KITCHEN</text>
      </svg>`
  );
export function initImageFallbacks() {
  setDefaultImageFallback(SAFE_DEFAULT_FALLBACK);

  // Runs after the shared handler (registered first): once it has given up, show the placeholder.
  document.addEventListener(
    'error',
    event => {
      const img = event.target;
      if (!(img instanceof HTMLImageElement) || !img.dataset.fallbackStage) return;
      if (img.hasAttribute('data-fallback') || img.src === INLINE_DISH_SVG) return;
      img.removeAttribute('srcset');
      img.src = INLINE_DISH_SVG;
    },
    true
  );
}

// ---------------------------------------------------------------------------
// Responsive photos: srcset/sizes so phones load a small file and large screens a sharp one
// ---------------------------------------------------------------------------
const LOCAL_SET = /^\/?images\/.+\.webp$/; // our own photos: name.webp (2000w), name-1400.webp, name-900.webp
const UNSPLASH = /^https:\/\/images\.unsplash\.com\//;
const UNSPLASH_WIDTHS = [640, 1024, 1600, 2400];

/** The srcset for a photo we can serve in several widths, or '' when we cannot. */
export function srcsetFor(src) {
  const url = String(src || '');
  if (LOCAL_SET.test(url)) {
    const base = url.replace(/\.webp$/, '');
    return `${base}-900.webp 900w, ${base}-1400.webp 1400w, ${url} 2000w`;
  }
  if (UNSPLASH.test(url)) {
    try {
      const u = new URL(url);
      return UNSPLASH_WIDTHS.map(w => {
        u.searchParams.set('w', String(w));
        u.searchParams.set('q', '80');
        u.searchParams.set('auto', 'format');
        return `${u.toString()} ${w}w`;
      }).join(', ');
    } catch {
      return '';
    }
  }
  return '';
}

/**
 * Extra <img> attributes for a responsive photo: ` srcset="…" sizes="…"` (already escaped), or ''.
 * `sizes` describes how wide the photo is shown, e.g. '100vw' or '(max-width: 760px) 100vw, 33vw'.
 */
export function responsiveAttrs(src, sizes) {
  const set = srcsetFor(src);
  return set ? ` srcset="${esc(set)}" sizes="${esc(sizes)}"` : '';
}
