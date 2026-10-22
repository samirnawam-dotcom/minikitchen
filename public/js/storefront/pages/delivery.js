// Page 4 — Mini Kitchen Delivery: compact header (so the menu starts above the fold) and the
// FineDine delivery menu with the WhatsApp cart.

import { esc } from '../../shared/dom.js';
import { cartCount, cartSubtotal } from '../state.js';
import { content, configList } from '../config.js';
import { formatPrice } from '../format.js';
import { renderMenuExplorer } from '../menu-view.js';
import { registerPage } from '../view.js';
import { heroSection } from './sections.js';

function buildDeliveryPage() {
  const { logos } = content.config;
  const areas = configList('deliveryAreas').slice(0, 6).map(esc).join(', ');

  return `
      <!-- COMPACT DELIVERY HEADER SO FINEDINE MENU STARTS IMMEDIATELY -->
      ${heroSection({
        style: 'min-height: 34vh; padding: 38px 0;',
        img: logos.cover,
        fallback: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1800&q=85',
        alt: 'Mini Kitchen Delivery',
        body: `
          <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:24px;">
            <div style="max-width:680px;">
              <div style="display:inline-flex; align-items:center; gap:10px; background:rgba(217,78,40,0.3); border:1px solid #f3724f; padding:6px 14px; border-radius:999px; margin-bottom:14px;">
                <img src="${esc(logos.main)}" data-fallback="" alt="Mini Kitchen Delivery Logo" style="width:26px; height:26px; border-radius:50%; object-fit:cover;" />
                <span style="color:#ffd8cc; font-weight:800; font-size:0.76rem; letter-spacing:0.1em; text-transform:uppercase;">Mini Kitchen Delivery • Fast WhatsApp Ordering</span>
              </div>
              <h1 class="hero-title" style="font-size:clamp(1.9rem, 3.5vw, 2.85rem); margin-bottom:10px;">
                Order Online & Send Directly to <span class="gold-accent">WhatsApp</span>
              </h1>
              <p style="color:rgba(255,255,255,0.86); font-size:0.95rem; margin-bottom:14px;">
                Serving <b>${areas}</b> & surrounding Aley areas daily from 8:00 AM – 10:00 PM.
              </p>
            </div>
            <div style="display:flex; flex-direction:column; gap:10px; min-width:250px;">
              <button class="btn btn-whatsapp" data-action="cart:open">
                <i class="fa-solid fa-bag-shopping"></i> Order Bag (${cartCount()} items • ${formatPrice(cartSubtotal())})
              </button>
              <button class="btn btn-outline-light" data-action="qr:open" data-mode="delivery">
                <i class="fa-solid fa-qrcode"></i> View Delivery Menu QR Code
              </button>
            </div>
          </div>`
      })}

      <!-- INTERACTIVE FINEDINE DELIVERY MENU -->
      <section class="section-pad" id="deliveryMenuStart" style="background:var(--bg-cream); padding-top:34px;">
        <div class="container">
          ${renderMenuExplorer('delivery')}
        </div>
      </section>
    `;
}

registerPage('delivery', buildDeliveryPage);
