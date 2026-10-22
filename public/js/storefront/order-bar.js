// Floating bottom "order bag" bar shown while the cart has items, plus the header cart badge.

import { state, cartCount, cartSubtotal } from './state.js';
import { formatPrice } from './format.js';

export function updateCartBadges() {
  const total = cartCount();
  document.querySelectorAll('.cart-count-badge').forEach(el => {
    el.textContent = total;
  });
}

export function renderOrderBar() {
  let bar = document.getElementById('fdFloatingOrderBar');
  const totalCount = cartCount();

  if (totalCount === 0 || state.cart.length === 0) {
    if (bar) bar.style.display = 'none';
    return;
  }

  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'fdFloatingOrderBar';
    bar.className = 'fd-floating-order-bar';
    document.body.appendChild(bar);
  }

  bar.style.display = 'flex';
  bar.innerHTML = `
      <div class="fd-floating-order-left">
        <div class="fd-floating-bag-badge">${totalCount}</div>
        <div>
          <div style="font-size:0.74rem; color:rgba(255,255,255,0.68); text-transform:uppercase; letter-spacing:0.08em; font-weight:700;">Your FineDine Order Bag</div>
          <div style="font-size:1.05rem; font-weight:800; color:#fff;">${formatPrice(cartSubtotal())}</div>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:10px;">
        <button class="btn btn-whatsapp" style="padding:10px 18px; font-size:0.86rem;" data-action="cart:open">
          <i class="fa-brands fa-whatsapp"></i> Review & Send Order
        </button>
      </div>
    `;
}
