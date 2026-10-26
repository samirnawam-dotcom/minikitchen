// Cart contents and pricing: adding configured dishes, quantity changes, delivery zones and promo codes.
// The drawer UI and WhatsApp checkout live in ./cart-drawer.js.

import { state, saveCart, cartSubtotal } from './state.js';
import { getDeliveryZones, getPromoCodes } from './config.js';
import { updateCartBadges } from './order-bar.js';
import { t } from './i18n-strings.js';

/** Adds a dish (with chosen modifiers / note) to the cart, merging identical lines. */
export function addCartLine({ item, qty, unitPrice, modifiers, note }) {
  const cartKey = `${item.id}::${modifiers.join('|')}::${note}`;
  const existing = state.cart.find(c => (c.cartKey || c.id) === cartKey);
  if (existing) {
    existing.qty += qty;
  } else {
    state.cart.push({
      cartKey,
      id: item.id,
      title: item.title,
      ...(item.titleAr ? { titleAr: item.titleAr } : {}),
      ...(item.unit ? { unit: item.unit } : {}),
      price: `$${unitPrice.toFixed(2)}`,
      priceValue: unitPrice,
      img: item.img,
      qty,
      modifiers,
      note
    });
  }
  saveCart();
  updateCartBadges();
}

export function changeCartQty(cartKey, delta) {
  const idx = state.cart.findIndex(c => (c.cartKey || c.id) === cartKey);
  if (idx === -1) return;
  state.cart[idx].qty += delta;
  if (state.cart[idx].qty <= 0) state.cart.splice(idx, 1);
  saveCart();
  updateCartBadges();
}

export function clearCartItems() {
  state.cart = [];
  saveCart();
  updateCartBadges();
}

/** Subtotal, delivery fee for the selected zone, promo discount and grand total (all USD). */
export function computeCartPricing() {
  const subtotalUsd = cartSubtotal();
  const zones = getDeliveryZones();
  const activeZone = zones.find(z => z.id === state.selectedZoneId) || zones[0];
  const deliveryFeeUsd = subtotalUsd > 0 ? Number(activeZone?.feeUsd) || 0 : 0;

  let discountUsd = 0;
  let promoObj = null;
  let promoError = '';

  if (state.appliedPromoCode) {
    const codeUpper = state.appliedPromoCode.trim().toUpperCase();
    const found = getPromoCodes().find(p => p.active !== false && String(p.code || '').toUpperCase() === codeUpper);
    if (!found) {
      promoError = t('Promo code "{code}" is not valid.', { code: codeUpper });
    } else if (subtotalUsd < (Number(found.minOrderUsd) || 0)) {
      promoError = t('Code {code} requires a minimum order of {amount}.', {
        code: found.code,
        amount: `$${Number(found.minOrderUsd).toFixed(2)}`
      });
    } else {
      promoObj = found;
      if (found.type === 'percent') {
        discountUsd = Math.round(subtotalUsd * (Number(found.value) / 100) * 100) / 100;
      } else {
        discountUsd = Math.min(subtotalUsd + deliveryFeeUsd, Number(found.value) || 0);
      }
    }
  }

  const grandTotalUsd = Math.max(0, Math.round((subtotalUsd + deliveryFeeUsd - discountUsd) * 100) / 100);
  return { subtotalUsd, activeZone, deliveryFeeUsd, discountUsd, promoObj, promoError, grandTotalUsd };
}
