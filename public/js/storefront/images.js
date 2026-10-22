// Image fallbacks. Markup uses <img data-fallback="url"> (see ../shared/actions.js); when the
// fallback and the page-wide default have both failed, a built-in "MK" placeholder is shown.

import { setDefaultImageFallback } from '../shared/actions.js';
import { SAFE_DEFAULT_FALLBACK } from './config.js';

export const INLINE_DISH_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
        <rect width="400" height="300" fill="#181b22"/>
        <circle cx="200" cy="140" r="64" stroke="#c59b27" stroke-width="2.5" fill="rgba(197,155,39,0.08)"/>
        <circle cx="200" cy="140" r="46" stroke="rgba(197,155,39,0.35)" stroke-width="1.5" stroke-dasharray="4 4"/>
        <text x="200" y="148" text-anchor="middle" fill="#e6c45a" font-family="Georgia, serif" font-size="22" font-weight="bold">MK</text>
        <text x="200" y="236" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="sans-serif" font-size="13" letter-spacing="2">MINI KITCHEN</text>
      </svg>`
  );

/** Offline-safe placeholder QR code shown when the QR image service is unreachable. */
export const FALLBACK_QR_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
        <rect width="120" height="120" rx="8" fill="#ffffff"/>
        <rect x="10" y="10" width="32" height="32" rx="4" stroke="#14171c" stroke-width="6"/>
        <rect x="20" y="20" width="12" height="12" fill="#14171c"/>
        <rect x="78" y="10" width="32" height="32" rx="4" stroke="#14171c" stroke-width="6"/>
        <rect x="88" y="20" width="12" height="12" fill="#14171c"/>
        <rect x="10" y="78" width="32" height="32" rx="4" stroke="#14171c" stroke-width="6"/>
        <rect x="20" y="88" width="12" height="12" fill="#14171c"/>
        <rect x="52" y="14" width="8" height="8" fill="#14171c"/>
        <rect x="52" y="30" width="8" height="16" fill="#14171c"/>
        <rect x="14" y="52" width="16" height="8" fill="#14171c"/>
        <rect x="38" y="52" width="24" height="8" fill="#14171c"/>
        <rect x="70" y="52" width="16" height="8" fill="#14171c"/>
        <rect x="94" y="52" width="14" height="8" fill="#14171c"/>
        <rect x="52" y="68" width="16" height="16" fill="#14171c"/>
        <rect x="76" y="76" width="14" height="14" fill="#14171c"/>
        <rect x="96" y="76" width="12" height="32" fill="#14171c"/>
        <rect x="52" y="96" width="32" height="12" fill="#14171c"/>
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
