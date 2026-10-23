// Image fallbacks. Markup uses <img data-fallback="url"> (see ../shared/actions.js); when the
// fallback and the page-wide default have both failed, a built-in "MK" placeholder is shown.

import { setDefaultImageFallback } from '../shared/actions.js';
import { SAFE_DEFAULT_FALLBACK } from './config.js';

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
      img.src = INLINE_DISH_SVG;
    },
    true
  );
}
