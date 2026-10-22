// Page 6 — Contact: one WhatsApp card per brand, the event / dining inquiry form, address, socials and map.

import { esc } from '../../shared/dom.js';
import { content } from '../config.js';
import { registerPage } from '../view.js';
import { heroSection } from './sections.js';

function buildContactPage() {
  const { contacts, location, socials } = content.config;

  return `
      ${heroSection({
        style: 'min-height: 48vh; padding: 60px 0;',
        img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1800&q=85',
        alt: 'Contact Mini Kitchen',
        body: `
          <div class="hero-content">
            <div class="hero-eyebrow"><i class="fa-brands fa-whatsapp"></i> <span>Instant WhatsApp & Direct Lines</span></div>
            <h1 class="hero-title">Get in Touch with <span class="gold-accent">Mini Kitchen</span></h1>
            <p class="hero-subtitle">
              Connect directly with the right team—whether you are booking wedding & event catering, reserving a scenic table at our Aley restaurant, or ordering food delivery.
            </p>
          </div>`
      })}

      <section class="section-pad">
        <div class="container">
          <!-- THREE BRAND DIRECT WHATSAPP CARDS -->
          <div class="brands-trio-grid" style="margin-bottom: 64px;">
            <div class="brand-pillar-card" style="padding:30px; border-top: 4px solid #c59b27;">
              <span class="section-eyebrow" style="color:#9e7815;">1. Weddings & Events</span>
              <h3 style="font-family:var(--font-serif); font-size:1.55rem; margin-bottom:8px;">Mini Kitchen Catering</h3>
              <p style="color:var(--text-muted); font-size:0.92rem; margin-bottom:18px;">
                For wedding packages, corporate galas, private parties, live cooking stations, and custom event quotations.
              </p>
              <div style="margin-bottom:20px; font-size:0.92rem;">
                <div><b>Direct Phone / WhatsApp:</b> <a href="tel:+96171048154" style="color:#9e7815; font-weight:700;">${esc(contacts.catering.phoneDisplay)}</a></div>
                <div><b>Secondary Line:</b> ${esc(contacts.catering.secondaryDisplay)}</div>
                <div><b>Email:</b> ${esc(contacts.catering.email)}</div>
              </div>
              <button class="btn btn-whatsapp" style="width:100%;" data-action="wa:open" data-brand="catering">
                <i class="fa-brands fa-whatsapp"></i> Message Catering on WhatsApp
              </button>
            </div>

            <div class="brand-pillar-card" style="padding:30px; border-top: 4px solid #2d6a4f;">
              <span class="section-eyebrow" style="color:#2d6a4f;">2. Dine-In & Terrace Views</span>
              <h3 style="font-family:var(--font-serif); font-size:1.55rem; margin-bottom:8px;">Mini Kitchen Restaurant</h3>
              <p style="color:var(--text-muted); font-size:0.92rem; margin-bottom:18px;">
                For table reservations, group dining formulas, birthday tables, and directions in Ain Al Remmaneh, Aley.
              </p>
              <div style="margin-bottom:20px; font-size:0.92rem;">
                <div><b>Restaurant Line:</b> <a href="tel:+9613682186" style="color:#2d6a4f; font-weight:700;">${esc(contacts.restaurant.phoneDisplay)}</a></div>
                <div><b>Opening Hours:</b> ${esc(location.hours)}</div>
                <div><b>Location:</b> ${esc(location.short)}</div>
              </div>
              <button class="btn btn-whatsapp" style="width:100%;" data-action="wa:open" data-brand="restaurant">
                <i class="fa-brands fa-whatsapp"></i> Book Restaurant Table on WhatsApp
              </button>
            </div>

            <div class="brand-pillar-card" style="padding:30px; border-top: 4px solid #d94e28;">
              <span class="section-eyebrow" style="color:#d94e28;">3. Fast Home & Office Delivery</span>
              <h3 style="font-family:var(--font-serif); font-size:1.55rem; margin-bottom:8px;">Mini Kitchen Delivery</h3>
              <p style="color:var(--text-muted); font-size:0.92rem; margin-bottom:18px;">
                For fast food delivery orders across Ain Al Remmaneh, Aley, Bhamdoun, Souk El Gharb, Kahale, and surrounding areas.
              </p>
              <div style="margin-bottom:20px; font-size:0.92rem;">
                <div><b>Delivery Hotline / WhatsApp:</b> <a href="tel:+9613682186" style="color:#d94e28; font-weight:700;">${esc(contacts.delivery.phoneDisplay)}</a></div>
                <div><b>Delivery Hours:</b> ${esc(location.hours)}</div>
                <div><b>Order Online:</b> Select items in our Delivery Menu</div>
              </div>
              <button class="btn btn-whatsapp" style="width:100%;" data-action="wa:open" data-brand="delivery">
                <i class="fa-brands fa-whatsapp"></i> Order Delivery on WhatsApp
              </button>
            </div>
          </div>

          <!-- FULL CATERING & GENERAL INQUIRY FORM + MAP -->
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 42px; align-items:start;">
            <div class="form-card">
              <h3 style="font-family:var(--font-serif); font-size:1.65rem; margin-bottom:8px;">Send an Event or Dining Inquiry to WhatsApp</h3>
              <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:22px;">Complete the details below and click send—your message will open directly in WhatsApp with the appropriate Mini Kitchen team.</p>
              <form data-on-submit="quote:submit">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Your Name *</label>
                    <input type="text" id="quoteName" class="form-control" placeholder="Full Name" required />
                  </div>
                  <div class="form-group">
                    <label>Your Phone Number *</label>
                    <input type="tel" id="quotePhone" class="form-control" placeholder="+961 ..." required />
                  </div>
                  <div class="form-group">
                    <label>Inquiry Type *</label>
                    <select id="quoteEventType" class="form-control" required>
                      <option value="Wedding Catering Inquiry">Wedding Catering Inquiry</option>
                      <option value="Corporate Catering Inquiry">Corporate Catering Inquiry</option>
                      <option value="Private Party / Birthday Catering">Private Party / Birthday Catering</option>
                      <option value="Restaurant Table Reservation">Restaurant Table Reservation</option>
                      <option value="Delivery / Group Order">Delivery / Group Order</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Number of Guests *</label>
                    <input type="number" id="quoteGuests" class="form-control" placeholder="e.g., 100" required />
                  </div>
                  <div class="form-group">
                    <label>Event / Reservation Date *</label>
                    <input type="date" id="quoteDate" class="form-control" required />
                  </div>
                  <div class="form-group">
                    <label>Event Location / Venue *</label>
                    <input type="text" id="quoteLocation" class="form-control" placeholder="e.g., Aley, Beirut, Villa..." required />
                  </div>
                  <div class="form-group full">
                    <label>Requested Package or Services</label>
                    <input type="text" id="quotePackage" class="form-control" placeholder="e.g., Wedding Buffet, Live Burger Station, Lebanese Mezza Formula" />
                  </div>
                  <div class="form-group full">
                    <label>Message / Details</label>
                    <textarea id="quoteNotes" class="form-control" rows="3" placeholder="Any questions or custom requests..."></textarea>
                  </div>
                </div>
                <button type="submit" class="btn btn-whatsapp" style="width:100%; margin-top:18px;">
                  <i class="fa-brands fa-whatsapp"></i> Send Directly on WhatsApp
                </button>
              </form>
            </div>

            <div>
              <div style="background:var(--bg-card); border:1px solid var(--border-subtle); padding:30px; border-radius:20px; box-shadow:var(--shadow-soft); margin-bottom:24px;">
                <h3 style="font-family:var(--font-serif); font-size:1.5rem; margin-bottom:14px;">Our Location & Social Media</h3>
                <p style="color:var(--text-muted); margin-bottom:16px;">
                  <b>Address:</b> ${esc(location.full)}<br/>
                  <b>Opening Hours:</b> ${esc(location.hours)}<br/>
                  <b>Email:</b> <a href="mailto:${esc(contacts.catering.email)}">${esc(contacts.catering.email)}</a>
                </p>
                <div style="display:flex; gap:12px; flex-wrap:wrap;">
                  <a href="${esc(socials.instagram)}" target="_blank" rel="noopener" class="btn btn-outline-dark" style="padding:10px 18px; font-size:0.85rem;">
                    <i class="fa-brands fa-instagram"></i> Instagram (${esc(socials.instagramHandle)})
                  </a>
                  <a href="${esc(socials.tiktok)}" target="_blank" rel="noopener" class="btn btn-outline-dark" style="padding:10px 18px; font-size:0.85rem;">
                    <i class="fa-brands fa-tiktok"></i> TikTok
                  </a>
                  <a href="${esc(socials.facebook)}" target="_blank" rel="noopener" class="btn btn-outline-dark" style="padding:10px 18px; font-size:0.85rem;">
                    <i class="fa-brands fa-facebook"></i> Facebook
                  </a>
                </div>
              </div>
              <div style="border-radius:20px; overflow:hidden; height:340px; box-shadow:var(--shadow-soft);">
                <iframe src="${esc(location.mapEmbedUrl)}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
}

registerPage('contact', buildContactPage);
