// Page 5 — About Us: story, key figures, chefs & team, testimonials and behind-the-scenes gallery.

import { esc } from '../../shared/dom.js';
import { configList } from '../config.js';
import { registerPage } from '../view.js';
import { heroSection, galleryCard, testimonialsSection } from './sections.js';

const statCard = (value, label) => `
                <div style="background:var(--bg-card); border:1px solid var(--border-subtle); padding:18px; border-radius:14px; box-shadow:var(--shadow-soft);">
                  <div style="font-family:var(--font-serif); font-size:2rem; font-weight:700; color:var(--brand-primary);">${value}</div>
                  <div style="font-size:0.8rem; font-weight:700; color:var(--text-muted);">${label}</div>
                </div>`;

function buildAboutPage() {
  return `
      ${heroSection({
        style: 'min-height: 58vh; padding: 64px 0;',
        img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1800&q=85',
        alt: 'Mini Kitchen Chefs & Culinary Team',
        body: `
          <div class="hero-content">
            <div class="hero-eyebrow"><i class="fa-solid fa-heart"></i> <span>The People & Passion Behind Mini Kitchen</span></div>
            <h1 class="hero-title">Our Story, Our Chefs & <span class="gold-accent">Uncompromising</span> Craft</h1>
            <p class="hero-subtitle">
              From a passionate mountain kitchen in Ain Al Remmaneh, Aley to a premier three-brand hospitality group serving weddings, diners, and homes across Mount Lebanon.
            </p>
          </div>`
      })}

      <!-- OUR STORY & EVOLUTION -->
      <section class="section-pad">
        <div class="container">
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr)); gap: 50px; align-items:center;">
            <div>
              <span class="section-eyebrow">How It All Started</span>
              <h2 class="section-title">From Aley’s Favorite Kitchen to Lebanon’s Trusted Event Caterer</h2>
              <p style="color:var(--text-muted); margin-bottom:16px; font-size:1.02rem;">
                <b>Mini Kitchen</b> began in <b>Ain Al Remmaneh, Aley</b> with a bold culinary mission: to honor the warmth and generosity of traditional Lebanese cuisine while introducing playful, modern American flavors—our signature <i>#NotSoTraditional</i> twist.
              </p>
              <p style="color:var(--text-muted); margin-bottom:16px; font-size:1.02rem;">
                As word spread about our morning Bil Foron Manakish, authentic Lebanese mezza, charcoal-grilled fillets, and our viral Molten Cheddar Fountain, guests began asking us to bring the Mini Kitchen experience to their weddings, engagements, corporate galas, and private mountain villas.
              </p>
              <p style="color:var(--text-muted); margin-bottom:26px; font-size:1.02rem;">
                Today, Mini Kitchen proudly operates through three dedicated divisions—<b>Mini Kitchen Catering</b>, <b>Mini Kitchen Restaurant</b>, and <b>Mini Kitchen Delivery</b>—united by one kitchen brigade, strict hygiene and halal quality standards, and a genuine love for hospitality.
              </p>
              <div style="display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:14px; text-align:center;">
                ${statCard('3', 'Specialized Brands')}
                ${statCard('239+', 'Handcrafted Dishes')}
                ${statCard('100%', 'Fresh & Halal')}
              </div>
            </div>
            <div>
              <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1000&q=85" alt="Chefs Plating at Mini Kitchen" style="border-radius:24px; box-shadow:var(--shadow-hover); width:100%; height:480px; object-fit:cover;" />
            </div>
          </div>
        </div>
      </section>

      <!-- MEET OUR CHEFS & TEAM -->
      <section class="section-pad" style="background:var(--bg-elevated);">
        <div class="container">
          <div class="section-header">
            <span class="section-eyebrow">Culinary & Event Leadership</span>
            <h2 class="section-title">Meet the Chefs & Team Behind Mini Kitchen</h2>
            <p class="section-desc">
              Our experienced chefs, grill masters, pastry artisans, and event coordinators work in harmony to make every plate and every event extraordinary.
            </p>
          </div>

          <div class="team-grid">
            ${configList('teamMembers')
              .map(
                m => `
              <div class="team-card">
                <img src="${esc(m.img)}" data-fallback="" alt="${esc(m.name)}" loading="lazy" />
                <div class="team-card-body">
                  <div class="team-role">${esc(m.role)}</div>
                  <h4 style="font-family:var(--font-serif); font-size:1.3rem; margin-bottom:8px;">${esc(m.name)}</h4>
                  <p style="font-size:0.88rem; color:var(--text-muted);">${esc(m.bio)}</p>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </section>

      ${testimonialsSection()}

      <!-- BEHIND THE SCENES: PREP, SETUP & WEDDING EXECUTION -->
      <section class="section-pad section-dark">
        <div class="container">
          <div class="section-header">
            <span class="section-eyebrow">Behind The Scenes</span>
            <h2 class="section-title">From Kitchen Prep to Flawless Event Execution</h2>
            <p class="section-desc">
              See how our team prepares fresh ingredients at dawn, fires up the charcoal grills, builds luxury wedding buffets, and serves your guests with pride.
            </p>
          </div>

          <div class="gallery-grid">
            ${configList('behindTheScenes')
              .map(b => galleryCard(b, 'stage', 'desc'))
              .join('')}
          </div>
        </div>
      </section>
    `;
}

registerPage('about', buildAboutPage);
