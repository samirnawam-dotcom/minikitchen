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
          <div class="fd-floating-label">Your basket</div>
          <div class="fd-floating-total">${formatPrice(cartSubtotal())}</div>
        </div>
      </div>
      <button class="btn btn-whatsapp btn-sm" data-action="cart:open">Review &amp; send</button>
    `;
}
