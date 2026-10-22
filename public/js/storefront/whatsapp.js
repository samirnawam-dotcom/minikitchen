// Opens WhatsApp chats with the right Mini Kitchen line and logs direct chats as Back Office leads.
//
//   <button data-action="wa:open" data-brand="restaurant" data-msg="Hello…">
//   data-brand defaults to the brand of the current page; data-skip-log skips the lead record.

import { registerActions } from '../shared/actions.js';
import { state } from './state.js';
import { content } from './config.js';
import { recordOrder } from './orders.js';

const EVENT_TYPES = {
  restaurant: 'Table Reservation / Dining Inquiry',
  delivery: 'Direct Delivery Chat',
  catering: 'Catering & Event Inquiry'
};

export function openWhatsApp(brandKey, customMessage, skipAutoLog = false) {
  const contacts = content.config.contacts || {};
  const brand = contacts[brandKey] || contacts.catering;
  const text = customMessage || brand.defaultGreeting;

  if (!skipAutoLog) {
    recordOrder({
      type: brandKey === 'restaurant' ? 'table_reservation' : 'whatsapp_inquiry',
      brand: brandKey || 'catering',
      customerName: 'Website WhatsApp Visitor',
      customerPhone: 'Via WhatsApp Chat',
      address: state.currentPage ? `From ${state.currentPage} page` : 'Website',
      eventType: EVENT_TYPES[brandKey] || EVENT_TYPES.catering,
      notes: text,
      items: [],
      totalUsd: 0,
      staffNotes: 'Direct WhatsApp button clicked on website',
      whatsappText: text
    });
  }

  const url = `https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

registerActions({
  'wa:open': (el, event) => {
    if (el.tagName === 'A') event.preventDefault();
    const brand = el.dataset.brand || document.body.getAttribute('data-brand') || 'catering';
    openWhatsApp(brand, el.dataset.msg, el.hasAttribute('data-skip-log'));
  }
});
