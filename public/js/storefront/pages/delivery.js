// Page 4 — Mini Kitchen Delivery: a compact header (so the menu starts above the fold) and the
// delivery menu with the WhatsApp basket.

import { esc } from '../../shared/dom.js';
import { cartCount, cartSubtotal } from '../state.js';
import { configList } from '../config.js';
import { formatPrice } from '../format.js';
import { renderMenuExplorer } from '../menu-view.js';
import { registerPage } from '../view.js';
import { pageHero } from './sections.js';

function buildDeliveryPage() {
  const areas = configList('deliveryAreas').slice(0, 5).map(esc).join(', ');

  return `
      ${pageHero({
        eyebrow: 'Mini Kitchen Delivery · Aley',
        title: 'Order online, send on WhatsApp',
        text: `Delivering to ${areas} and nearby, daily from 8:00 AM to 10:00 PM.`,
        actions: `
              <button class="btn btn-primary" data-action="cart:open">
                <i class="fa-solid fa-bag-shopping"></i> Basket · ${cartCount()} · ${formatPrice(cartSubtotal())}
              </button>
              <button class="btn btn-outline" data-action="tracker:open">
                <i class="fa-solid fa-truck-fast"></i> Track an order
              </button>`
      })}

      <section class="section-pad section-ivory section-tight-top" id="deliveryMenuStart">
        <div class="container">
          ${renderMenuExplorer('delivery')}
        </div>
      </section>
    `;
}

registerPage('delivery', buildDeliveryPage);
