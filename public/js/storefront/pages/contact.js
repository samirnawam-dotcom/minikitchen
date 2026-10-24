// Page 6 — Contact: one card per brand (phone + WhatsApp), the event / dining inquiry form,
// address, socials and map.

import { esc } from '../../shared/dom.js';
import { content } from '../config.js';
import { registerPage } from '../view.js';
import { pageHero } from './sections.js';

function contactCard({ brand, eyebrow, title, text, phone, phoneHref, lines, cta }) {
  return `
            <article class="contact-card contact-card-${brand}">
              <span class="eyebrow">${eyebrow}</span>
              <h2 class="contact-card-title">${title}</h2>
              <p class="contact-card-text">${text}</p>
              <a class="contact-card-phone" href="tel:${esc(phoneHref)}"><i class="fa-solid fa-phone" aria-hidden="true"></i> ${esc(phone)}</a>
              <ul class="contact-card-lines">${lines.map(l => `<li>${l}</li>`).join('')}</ul>
              <button class="btn btn-whatsapp btn-block" data-action="wa:open" data-brand="${brand}">
                <i class="fa-brands fa-whatsapp"></i> ${cta}
              </button>
              ${brand === 'catering' ? '<button type="button" class="text-link contact-card-link" data-action="builder:start">Or build your package online <i class="fa-solid fa-arrow-right"></i></button>' : ''}
            </article>`;
}

function buildContactPage() {
  const { contacts, location, socials } = content.config;

  return `
      ${pageHero({
        eyebrow: 'Contact',
        title: 'Talk to the right team',
        text: 'Catering and weddings, a table at the restaurant, or a delivery order — we answer on WhatsApp and by phone.'
      })}

      <section class="section-pad section-tight-top">
        <div class="container">
          <div class="contact-cards">
            ${contactCard({
              brand: 'catering',
              eyebrow: 'Weddings & events',
              title: 'Catering',
              text: 'Packages, corporate events, private parties and live stations.',
              phone: contacts.catering.phoneDisplay,
              phoneHref: `+${contacts.catering.whatsappNumber}`,
              lines: [
                `Second line <span class="ltr">${esc(contacts.catering.secondaryDisplay)}</span>`,
                esc(contacts.catering.email)
              ],
              cta: 'Message catering'
            })}
            ${contactCard({
              brand: 'restaurant',
              eyebrow: 'Dine in',
              title: 'Restaurant',
              text: 'Table bookings, group dining and birthday tables in Ain Al Remmaneh.',
              phone: contacts.restaurant.phoneDisplay,
              phoneHref: `+${contacts.restaurant.whatsappNumber}`,
              lines: [esc(location.hours), esc(location.short)],
              cta: 'Book a table'
            })}
            ${contactCard({
              brand: 'delivery',
              eyebrow: 'Home & office',
              title: 'Delivery',
              text: 'Hot food delivered across Aley, Bhamdoun, Souk El Gharb, Kahale and nearby.',
              phone: contacts.delivery.phoneDisplay,
              phoneHref: `+${contacts.delivery.whatsappNumber}`,
              lines: [esc(location.hours), 'Or order from our online menu'],
              cta: 'Order delivery'
            })}
          </div>
        </div>
      </section>

      <section class="section-pad section-ivory">
        <div class="container contact-layout">
          <div class="form-card">
            <h2 class="form-card-title">Send us a message</h2>
            <p class="form-card-text">Fill in the details and press send — the message opens in WhatsApp with the right team.</p>
            <form data-on-submit="quote:submit">
              <div class="form-grid">
                <div class="form-group">
                  <label for="quoteName">Your name *</label>
                  <input type="text" id="quoteName" class="form-control" placeholder="Full name" required />
                </div>
                <div class="form-group">
                  <label for="quotePhone">Phone *</label>
                  <input type="tel" id="quotePhone" class="form-control" placeholder="+961 …" required />
                </div>
                <div class="form-group">
                  <label for="quoteEventType">About *</label>
                  <select id="quoteEventType" class="form-control" required>
                    <option value="Event Buffet (Wedding / Occasion)">Event buffet — wedding or occasion</option>
                    <option value="Birthday Mini Catering">Birthday Mini</option>
                    <option value="Live Stations / Trays / Mini Bites">Live stations, trays or mini bites</option>
                    <option value="Restaurant Table Reservation">Restaurant table booking</option>
                    <option value="Delivery / Group Order">Delivery / group order</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="quoteGuests">Number of guests *</label>
                  <input type="number" id="quoteGuests" class="form-control" placeholder="e.g. 100" required />
                </div>
                <div class="form-group">
                  <label for="quoteDate">Date *</label>
                  <input type="date" id="quoteDate" class="form-control" required />
                </div>
                <div class="form-group">
                  <label for="quoteLocation">Location / venue *</label>
                  <input type="text" id="quoteLocation" class="form-control" placeholder="e.g. Aley, Beirut, villa…" required />
                </div>
                <div class="form-group full">
                  <label for="quotePackage">Package or services</label>
                  <input type="text" id="quotePackage" class="form-control" placeholder="e.g. Wedding buffet, live burger station, mezza" />
                </div>
                <div class="form-group full">
                  <label for="quoteNotes">Message</label>
                  <textarea id="quoteNotes" class="form-control" rows="3" placeholder="Questions or special requests…"></textarea>
                </div>
              </div>
              <button type="submit" class="btn btn-whatsapp btn-block form-submit">
                <i class="fa-brands fa-whatsapp"></i> Send on WhatsApp
              </button>
            </form>
          </div>

          <div class="contact-aside">
            <span class="eyebrow">Find us</span>
            <h2 class="visit-panel-title">Ain Al Remmaneh, Aley</h2>
            <ul class="info-list">
              <li><i class="fa-solid fa-location-dot"></i> <span>${esc(location.full)}</span></li>
              <li><i class="fa-regular fa-clock"></i> <span>${esc(location.hours)}</span></li>
              <li><i class="fa-regular fa-envelope"></i> <a href="mailto:${esc(contacts.catering.email)}">${esc(contacts.catering.email)}</a></li>
            </ul>
            <div class="map-frame">
              <iframe src="${esc(location.mapEmbedUrl)}" title="Map: Mini Kitchen, Ain Al Remmaneh" loading="lazy" allowfullscreen=""></iframe>
            </div>
            <div class="hero-actions">
              <a class="btn btn-outline btn-sm" href="${esc(location.googleMapsUrl)}" target="_blank" rel="noopener"><i class="fa-solid fa-diamond-turn-right"></i> Open in Google Maps</a>
              <a class="btn btn-outline btn-sm" href="${esc(socials.instagram)}" target="_blank" rel="noopener"><i class="fa-brands fa-instagram"></i> ${esc(socials.instagramHandle)}</a>
              <a class="btn btn-outline btn-sm" href="${esc(socials.tiktok)}" target="_blank" rel="noopener"><i class="fa-brands fa-tiktok"></i> TikTok</a>
              <a class="btn btn-outline btn-sm" href="${esc(socials.facebook)}" target="_blank" rel="noopener"><i class="fa-brands fa-facebook-f"></i> Facebook</a>
            </div>
          </div>
        </div>
      </section>
    `;
}

registerPage('contact', buildContactPage);
