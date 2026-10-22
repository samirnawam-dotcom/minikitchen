// Price formatting in the visitor's chosen currency (USD or Lebanese pounds).

import { state } from './state.js';
import { content } from './config.js';

/** "$12.50" — always USD, used in WhatsApp messages and order records. */
export const usd = amount => `$${(Number(amount) || 0).toFixed(2)}`;

/** "1,118,750 L.L." for a USD amount at the current (or a given) exchange rate. */
export function lbp(usdAmount, rate = content.lbpRate) {
  return `${Math.round((Number(usdAmount) || 0) * rate).toLocaleString('en-US')} L.L.`;
}

/** Price in the currency selected in the menu toolbar. */
export function formatPrice(usdAmount) {
  return state.currency === 'LBP' ? lbp(usdAmount) : usd(usdAmount);
}
