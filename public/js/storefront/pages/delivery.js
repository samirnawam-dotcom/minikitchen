// Page 4 — Mini Kitchen Delivery: a compact header (so the menu starts above the fold) and the
// delivery menu with the WhatsApp basket.

import { esc } from '../../shared/dom.js';
import { cartCount, cartSubtotal } from '../state.js';
import { configList, content } from '../config.js';
import { formatPrice } from '../format.js';
import { renderMenuExplorer } from '../menu-view.js';
import { registerPage } from '../view.js';
import { bannerPhoto, bannerText, pageHero } from './sections.js';
import { isAr, t } from '../i18n-strings.js';

function buildDeliveryPage() {
  const areas = configList('deliveryAreas')
    .slice(0, 5)
    .map(area => esc(t(area)))
    .join(isAr() ? '، ' : ', ');

  return `
      ${pageHero({
        eyebrow: bannerText('delivery', 'eyebrow', t('Mini Kitchen Delivery · Aley')),
        title: bannerText('delivery', 'title', t('Order online, send on WhatsApp')),
        text: bannerText(
          'delivery',
          'text',
          t('Delivering to {areas} and nearby, daily from 8:00 AM to 10:00 PM.', { areas })
        ),
        photo: bannerPhoto('delivery', 'images/pages/delivery.webp'),
        alt: t('A spread of Mini Kitchen dishes ready for delivery'),
        fallback: content.config.logos.cover,
        actions: `
              <button class="btn btn-primary" data-action="cart:open">
                <i class="fa-solid fa-bag-shopping"></i> ${t('Basket')} · ${cartCount()} · ${formatPrice(cartSubtotal())}
              </button>
              <button class="btn btn-outline" data-action="tracker:open">
                <i class="fa-solid fa-truck-fast"></i> ${t('Track an order')}
              </button>`
      })}

      <section class="section-pad section-ivory section-tight-top" id="deliveryMenuStart">
        <div class="container">
          <h2 class="sr-only">${t('Delivery menu')}</h2>
          ${renderMenuExplorer('delivery')}
        </div>
      </section>
    `;
}

registerPage('delivery', buildDeliveryPage);
