// Page 6 — Contact: one card per brand (phone + WhatsApp), the event / dining inquiry form,
// address, socials and map.

import { esc } from '../../shared/dom.js';
import { content } from '../config.js';
import { registerPage } from '../view.js';
import { bannerPhoto, bannerText, pageHero } from './sections.js';
import { t } from '../i18n-strings.js';

function contactCard({ brand, eyebrow, title, text, phone, phoneHref, lines, cta }) {
  return `
            <article class="contact-card contact-card-${brand}">
              <span class="eyebrow">${eyebrow}</span>
              <h2 class="contact-card-title">${title}</h2>
              <p class="contact-card-text">${text}</p>
              <a class="contact-card-phone" href="tel:${esc(phoneHref)}"><i class="fa-solid fa-phone" aria-hidden="true"></i> <span class="ltr">${esc(phone)}</span></a>
              <ul class="contact-card-lines">${lines.map(l => `<li>${l}</li>`).join('')}</ul>
              <button class="btn btn-whatsapp btn-block" data-action="wa:open" data-brand="${brand}">
                <i class="fa-brands fa-whatsapp"></i> ${cta}
              </button>
              ${brand === 'catering' ? `<button type="button" class="text-link contact-card-link" data-action="builder:start">${t('Or build your package online')} <i class="fa-solid fa-arrow-right"></i></button>` : ''}
            </article>`;
}

function buildContactPage() {
  const { contacts, location, socials } = content.config;

  return `
      ${pageHero({
        eyebrow: bannerText('contact', 'eyebrow', t('Contact')),
        title: bannerText('contact', 'title', t('Talk to the right team')),
        text: bannerText(
          'contact',
          'text',
          t(
            'Catering and weddings, a table at the restaurant, or a delivery order — we answer on WhatsApp and by phone.'
          )
        ),
        photo: bannerPhoto('contact', '')
      })}

      <section class="section-pad section-tight-top">
        <div class="container">
          <div class="contact-cards">
            ${contactCard({
              brand: 'catering',
              eyebrow: t('Weddings & events'),
              title: t('Catering'),
              text: t('Packages, corporate events, private parties and live stations.'),
              phone: contacts.catering.phoneDisplay,
              phoneHref: `+${contacts.catering.whatsappNumber}`,
              lines: [
                `${t('Second line')} <span class="ltr">${esc(contacts.catering.secondaryDisplay)}</span>`,
                `<span class="ltr">${esc(contacts.catering.email)}</span>`
              ],
              cta: t('Message catering')
            })}
            ${contactCard({
              brand: 'restaurant',
              eyebrow: t('Dine in'),
              title: t('Restaurant'),
              text: t('Table bookings, group dining and birthday tables in Ain Al Remmaneh.'),
              phone: contacts.restaurant.phoneDisplay,
              phoneHref: `+${contacts.restaurant.whatsappNumber}`,
              lines: [esc(t(location.hours)), esc(t(location.short))],
              cta: t('Book a table')
            })}
            ${contactCard({
              brand: 'delivery',
              eyebrow: t('Home & office'),
              title: t('Delivery'),
              text: t('Hot food delivered across Aley, Bhamdoun, Souk El Gharb, Kahale and nearby.'),
              phone: contacts.delivery.phoneDisplay,
              phoneHref: `+${contacts.delivery.whatsappNumber}`,
              lines: [esc(t(location.hours)), t('Or order from our online menu')],
              cta: t('Order delivery')
            })}
          </div>
        </div>
      </section>

      <section class="section-pad section-ivory">
        <div class="container contact-layout">
          <div class="form-card">
            <h2 class="form-card-title">${t('Send us a message')}</h2>
            <p class="form-card-text">${t('Fill in the details and press send — the message opens in WhatsApp with the right team.')}</p>
            <form data-on-submit="quote:submit">
              <div class="form-grid">
                <div class="form-group">
                  <label for="quoteName">${t('Your name')} *</label>
                  <input type="text" id="quoteName" class="form-control" placeholder="${t('Full name')}" required />
                </div>
                <div class="form-group">
                  <label for="quotePhone">${t('Phone')} *</label>
                  <input type="tel" id="quotePhone" class="form-control" placeholder="+961 …" required />
                </div>
                <div class="form-group">
                  <label for="quoteEventType">${t('About')} *</label>
                  <select id="quoteEventType" class="form-control" required>
                    <option value="Event Buffet (Wedding / Occasion)">${t('Event buffet — wedding or occasion')}</option>
                    <option value="Birthday Mini Catering">${t('Birthday Mini')}</option>
                    <option value="Live Stations / Trays / Mini Bites">${t('Live stations, trays or mini bites')}</option>
                    <option value="Restaurant Table Reservation">${t('Restaurant table booking')}</option>
                    <option value="Delivery / Group Order">${t('Delivery / group order')}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="quoteGuests">${t('Number of guests')} *</label>
                  <input type="number" id="quoteGuests" class="form-control" placeholder="${t('e.g. 100')}" required />
                </div>
                <div class="form-group">
                  <label for="quoteDate">${t('Date')} *</label>
                  <input type="date" id="quoteDate" class="form-control" required />
                </div>
                <div class="form-group">
                  <label for="quoteLocation">${t('Location / venue')} *</label>
                  <input type="text" id="quoteLocation" class="form-control" placeholder="${t('e.g. Aley, Beirut, villa…')}" required />
                </div>
                <div class="form-group full">
                  <label for="quotePackage">${t('Package or services')}</label>
                  <input type="text" id="quotePackage" class="form-control" placeholder="${t('e.g. Wedding buffet, live burger station, mezza')}" />
                </div>
                <div class="form-group full">
                  <label for="quoteNotes">${t('Message')}</label>
                  <textarea id="quoteNotes" class="form-control" rows="3" placeholder="${t('Questions or special requests…')}"></textarea>
                </div>
              </div>
              <button type="submit" class="btn btn-whatsapp btn-block form-submit">
                <i class="fa-brands fa-whatsapp"></i> ${t('Send on WhatsApp')}
              </button>
            </form>
          </div>

          <div class="contact-aside">
            <span class="eyebrow">${t('Find us')}</span>
            <h2 class="visit-panel-title">${t('Ain Al Remmaneh, Aley')}</h2>
            <ul class="info-list">
              <li><i class="fa-solid fa-location-dot"></i> <span>${esc(t(location.full))}</span></li>
              <li><i class="fa-regular fa-clock"></i> <span>${esc(t(location.hours))}</span></li>
              <li><i class="fa-regular fa-envelope"></i> <a class="ltr" href="mailto:${esc(contacts.catering.email)}">${esc(contacts.catering.email)}</a></li>
            </ul>
            <div class="map-frame">
              <iframe src="${esc(location.mapEmbedUrl)}" title="${t('Map: Mini Kitchen, Ain Al Remmaneh')}" loading="lazy" allowfullscreen=""></iframe>
            </div>
            <div class="hero-actions">
              <a class="btn btn-outline btn-sm" href="${esc(location.googleMapsUrl)}" target="_blank" rel="noopener"><i class="fa-solid fa-diamond-turn-right"></i> ${t('Open in Google Maps')}</a>
              <a class="btn btn-outline btn-sm" href="${esc(socials.instagram)}" target="_blank" rel="noopener"><i class="fa-brands fa-instagram"></i> ${esc(socials.instagramHandle)}</a>
              <a class="btn btn-outline btn-sm" href="${esc(socials.tiktok)}" target="_blank" rel="noopener"><i class="fa-brands fa-tiktok"></i> ${t('TikTok')}</a>
              <a class="btn btn-outline btn-sm" href="${esc(socials.facebook)}" target="_blank" rel="noopener"><i class="fa-brands fa-facebook-f"></i> ${t('Facebook')}</a>
            </div>
          </div>
        </div>
      </section>
    `;
}

registerPage('contact', buildContactPage);
