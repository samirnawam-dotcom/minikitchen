// Contact page inquiry form: formats the inquiry for WhatsApp and records it in the Back Office.
// (Catering packages are requested through "Build your package", see ./package-builder.js.)

import { registerActions } from '../shared/actions.js';
import { allocateOrderId, recordOrder } from './orders.js';
import { openWhatsApp } from './whatsapp.js';
import { showToast } from './toast.js';
import { isAr, t } from './i18n-strings.js';

const value = id => document.getElementById(id)?.value || '';
const trimmed = id => value(id).trim();

function submitQuoteForm() {
  const name = trimmed('quoteName');
  const phone = trimmed('quotePhone');
  const eventType = value('quoteEventType');
  const guests = value('quoteGuests');
  const date = value('quoteDate');
  const location = trimmed('quoteLocation');
  const pkg = value('quotePackage');
  const notes = trimmed('quoteNotes') || 'None';

  const quoteId = allocateOrderId();
  const msg = [
    `✨ *NEW CATERING QUOTATION REQUEST — MINI KITCHEN CATERING*`,
    `*Reference ID:* #${quoteId}`,
    ...(isAr() ? [`*Preferred language:* Arabic / العربية`] : []),
    `-----------------------------------------`,
    `*Client Name:* ${name}`,
    `*Contact Phone:* ${phone}`,
    `*Event Type:* ${eventType}`,
    `*Event Date:* ${date}`,
    `*Event Location:* ${location}`,
    `*Number of Guests:* ${guests} Guests`,
    `*Interested Package:* ${pkg}`,
    `*Additional Notes:* ${notes}`,
    `-----------------------------------------`,
    `Please provide a tailored catering menu and quotation for our event (#${quoteId}). Thank you!`
  ].join('\n');

  const isRestoBooking = eventType.toLowerCase().includes('restaurant');
  const isDeliveryGroup = eventType.toLowerCase().includes('delivery');
  const brand = isRestoBooking ? 'restaurant' : isDeliveryGroup ? 'delivery' : 'catering';
  const priceMatch = pkg.match(/\$(\d+)/);
  const estPerGuest = priceMatch ? Number(priceMatch[1]) : 0;
  const estTotal = estPerGuest && Number(guests) ? estPerGuest * Number(guests) : 0;

  recordOrder({
    id: quoteId,
    type: isRestoBooking ? 'table_reservation' : 'catering_quote',
    brand,
    customerName: name,
    customerPhone: phone,
    address: location,
    eventType,
    eventDate: date,
    guests: Number(guests) || 0,
    packageSelected: pkg,
    notes,
    items: [],
    totalUsd: estTotal,
    staffNotes: 'Submitted via Website Event / Quote Form & sent to WhatsApp',
    whatsappText: msg
  });

  showToast(t('Inquiry #{id} recorded & opening WhatsApp...', { id: quoteId }));
  openWhatsApp(brand, msg, true);
}

registerActions({
  'quote:submit': submitQuoteForm
});
