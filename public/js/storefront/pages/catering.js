// Page 1 — Mini Kitchen Catering home: hero, 3-step guide, tabbed showcase (packages / wedding
// gallery / live stations), budget calculator, testimonials and the quote request form.

import { registerActions } from '../../shared/actions.js';
import { esc } from '../../shared/dom.js';
import { state } from '../state.js';
import { content, configList } from '../config.js';
import { renderEventBudgetCalculator } from '../event-calculator.js';
import { registerPage, renderMainView } from '../view.js';
import { heroSection, galleryCard, packageCard, testimonialsSection } from './sections.js';

const tabButton = (tab, activeTab, icon, label) => `
            <button
              type="button"
              class="ux-section-tab-btn ${activeTab === tab ? 'active' : ''}"
              data-action="home:tab"
              data-tab="${tab}"
            >
              <i class="fa-solid ${icon}"></i> ${label}
            </button>`;

function packagesTab() {
  return `
        <div class="packages-grid">
          ${configList('cateringPackages').slice(0, 3).map(packageCard).join('')}
        </div>
        <div style="text-align:center; margin-top: 32px;">
          <button class="btn btn-primary" data-action="nav:go" data-page="catering-menus">
            <i class="fa-solid fa-book-open"></i> View All 8 Catering Packages & À La Carte Trays
          </button>
        </div>
      `;
}

function weddingsTab() {
  return `
        <div class="gallery-grid" style="margin-bottom: 32px;">
          ${configList('cateringGallery')
            .map(g => galleryCard(g, 'category', 'caption'))
            .join('')}
        </div>
        <div style="background:#14161b; color:#fff; border-radius:20px; padding:26px 30px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:18px;">
          <div>
            <h4 style="font-family:var(--font-serif); font-size:1.4rem; margin-bottom:4px; color:var(--brand-primary);">Planning a Wedding or Engagement?</h4>
            <p style="color:rgba(255,255,255,0.8); font-size:0.9rem;">Book a private menu tasting in Ain Al Remmaneh, Aley or request our Wedding Brochure on WhatsApp.</p>
          </div>
          <button class="btn btn-whatsapp" data-action="wa:open" data-brand="catering" data-msg="Hello Mini Kitchen Catering! We are planning our wedding and would love to receive your Wedding Catering Packages & book a tasting.">
            <i class="fa-brands fa-whatsapp"></i> Wedding Catering WhatsApp
          </button>
        </div>
      `;
}

function stationsTab() {
  return `
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(min(330px, 100%), 1fr)); gap: 22px;">
          ${configList('liveStations')
            .map(
              st => `
            <div style="background:var(--bg-card); border-radius:18px; overflow:hidden; box-shadow:var(--shadow-soft); border:1px solid var(--border-subtle); display:flex; flex-direction:column;">
              <div style="height:195px; position:relative; overflow:hidden;">
                <img src="${esc(st.img)}" data-fallback="" alt="${esc(st.title)}" style="width:100%; height:100%; object-fit:cover;" />
                <span style="position:absolute; top:12px; inset-inline-start:12px; background:rgba(14,16,21,0.88); color:var(--brand-primary); padding:4px 12px; border-radius:999px; font-size:0.72rem; font-weight:700;">${esc(st.tag)}</span>
              </div>
              <div style="padding:20px; flex:1; display:flex; flex-direction:column;">
                <h4 style="font-family:var(--font-serif); font-size:1.25rem; margin-bottom:6px;">${esc(st.title)}</h4>
                <p style="font-size:0.86rem; color:var(--text-muted); margin-bottom:16px; flex:1;">${esc(st.desc)}</p>
                <button class="btn btn-whatsapp" style="width:100%; padding:10px;" data-action="wa:open" data-brand="catering" data-msg="${esc(`Hello Mini Kitchen Catering! I would like to inquire about adding the [${st.title}] live station to my event.`)}">
                  <i class="fa-brands fa-whatsapp"></i> Add Station to Event Quote
                </button>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `;
}

function quoteSection() {
  const { contacts, location } = content.config;
  return `
      <!-- PLAN YOUR EVENT / REQUEST A CATERING QUOTE -->
      <section class="section-pad section-dark" id="planEventSection">
        <div class="container">
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr)); gap: 44px; align-items:center;">
            <div>
              <span class="section-eyebrow">Direct WhatsApp Event Concierge</span>
              <h2 class="section-title">Request a Tailored Catering Quote in 60 Seconds</h2>
              <p style="color:rgba(255,255,255,0.8); margin-bottom:22px; font-size:1rem;">
                Enter your event details and click <b>"Send Quote Request via WhatsApp"</b>. Your inquiry is formatted automatically and sent straight to our Catering Director (<b>${esc(contacts.catering.phoneDisplay)}</b>).
              </p>
              <div style="display:flex; flex-direction:column; gap:14px;">
                <div style="display:flex; align-items:center; gap:14px;">
                  <div style="width:44px; height:44px; border-radius:50%; background:rgba(200,157,84,0.2); color:var(--brand-primary); display:flex; align-items:center; justify-content:center;"><i class="fa-solid fa-phone-volume"></i></div>
                  <div>
                    <div style="font-size:0.78rem; color:rgba(255,255,255,0.6);">Catering & Weddings Direct Line</div>
                    <div style="font-weight:700; font-size:1.05rem;">${esc(contacts.catering.phoneDisplay)} / ${esc(contacts.catering.secondaryDisplay)}</div>
                  </div>
                </div>
                <div style="display:flex; align-items:center; gap:14px;">
                  <div style="width:44px; height:44px; border-radius:50%; background:rgba(200,157,84,0.2); color:var(--brand-primary); display:flex; align-items:center; justify-content:center;"><i class="fa-solid fa-location-dot"></i></div>
                  <div>
                    <div style="font-size:0.78rem; color:rgba(255,255,255,0.6);">Headquarters & Tasting Lounge</div>
                    <div style="font-weight:700; font-size:1rem;">${esc(location.short)} (Serving All of Lebanon)</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-card">
              <h3 style="font-family:var(--font-serif); font-size:1.55rem; margin-bottom:6px;">Instant Catering Quotation Form</h3>
              <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:18px;">Fill in your event details below to send directly via WhatsApp:</p>
              <form data-on-submit="quote:submit">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Your Full Name *</label>
                    <input type="text" id="quoteName" class="form-control" placeholder="e.g., Nadine Karam" required />
                  </div>
                  <div class="form-group">
                    <label>Phone / WhatsApp Number *</label>
                    <input type="tel" id="quotePhone" class="form-control" placeholder="e.g., +961 70 123 456" required />
                  </div>
                  <div class="form-group">
                    <label>Event Type *</label>
                    <select id="quoteEventType" class="form-control" required>
                      <option value="Wedding Reception">Wedding Reception</option>
                      <option value="Engagement / Bridal Event">Engagement / Bridal Event</option>
                      <option value="Corporate Event / Gala">Corporate Event / Gala</option>
                      <option value="Private Villa / Garden Party">Private Villa / Garden Party</option>
                      <option value="Birthday / Anniversary">Birthday / Anniversary</option>
                      <option value="Product Launch / Brand Event">Product Launch / Brand Event</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Estimated Number of Guests *</label>
                    <input type="number" id="quoteGuests" class="form-control" placeholder="e.g., 120" min="4" required />
                  </div>
                  <div class="form-group">
                    <label>Preferred Event Date *</label>
                    <input type="date" id="quoteDate" class="form-control" required />
                  </div>
                  <div class="form-group">
                    <label>Event Location / Venue *</label>
                    <input type="text" id="quoteLocation" class="form-control" placeholder="e.g., Aley, Beirut, Bhamdoun" required />
                  </div>
                  <div class="form-group full">
                    <label>Preferred Catering Package or Services</label>
                    <select id="quotePackage" class="form-control">
                      <option value="Custom Tailored Menu & Quotation">Help Me Customize a Menu & Package</option>
                      <option value="The Royal Mountain Wedding Feast ($45/guest)">The Royal Mountain Wedding Feast ($45/guest)</option>
                      <option value="Sunset Garden Cocktail & Canapés ($32/guest)">Sunset Garden Cocktail & Canapés ($32/guest)</option>
                      <option value="Grand Imperial Five-Station Gala ($60/guest)">Grand Imperial Five-Station Gala ($60/guest)</option>
                      <option value="Executive Corporate Gala Buffet ($28/guest)">Executive Corporate Gala Buffet ($28/guest)</option>
                      <option value="Product Launch Canapé Package ($22/guest)">Product Launch Canapé Package ($22/guest)</option>
                      <option value="Authentic Lebanese Mezza Formula ($25/guest)">Authentic Lebanese Mezza Formula ($25/guest)</option>
                      <option value="American Feast & Cheddar Fountain ($25/guest)">American Feast & Cheddar Fountain ($25/guest)</option>
                      <option value="Lebanese Mountain Breakfast & Saj ($15/guest)">Lebanese Mountain Breakfast & Saj ($15/guest)</option>
                    </select>
                  </div>
                  <div class="form-group full">
                    <label>Additional Notes or Live Stations</label>
                    <textarea id="quoteNotes" class="form-control" rows="2" placeholder="Desired live stations, waiter service, or dietary notes..."></textarea>
                  </div>
                </div>
                <button type="submit" class="btn btn-whatsapp" style="width:100%; margin-top:16px; padding:15px; font-size:0.98rem;">
                  <i class="fa-brands fa-whatsapp" style="font-size:1.2rem;"></i> Send Catering Quote Request via WhatsApp
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>`;
}

function buildCateringHomePage() {
  const activeTab = state.homeShowcaseTab || 'packages';
  const tabBody = activeTab === 'packages' ? packagesTab() : activeTab === 'weddings' ? weddingsTab() : stationsTab();

  return `
      <!-- CONCISE, HIGH-CLARITY CATERING HERO -->
      ${heroSection({
        style: 'min-height: 62vh; padding: 64px 0 84px;',
        img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1800&q=85',
        alt: 'Mini Kitchen Catering Wedding & Event Buffet',
        body: `
          <div class="hero-content">
            <div class="hero-eyebrow">
              <i class="fa-solid fa-crown"></i>
              <span>Mini Kitchen Catering • Weddings, Corporate & Private Events</span>
            </div>
            <h1 class="hero-title">
              Unforgettable Catering for <span class="gold-accent">Weddings</span> & Special Occasions
            </h1>
            <p class="hero-subtitle">
              Full-service event buffets, chef-manned live cooking stations, and generous Lebanese & international hospitality—crafted in Ain Al Remmaneh, Aley and served across all of Lebanon.
            </p>
            <div class="hero-cta-group" style="margin-bottom:22px;">
              <button class="btn btn-primary" data-action="nav:go" data-page="catering-menus">
                <i class="fa-solid fa-book-open"></i> Explore Catering Menus
              </button>
              <button class="btn btn-whatsapp" data-action="wa:open" data-brand="catering" data-msg="Hello Mini Kitchen Catering! I would like to inquire about your catering menus, packages, and availability for an upcoming event.">
                <i class="fa-brands fa-whatsapp" style="font-size:1.15rem;"></i> Contact Us on WhatsApp
              </button>
              <button class="btn btn-outline-light" data-action="nav:go" data-page="catering" data-scroll="planEventSection">
                <i class="fa-solid fa-calendar-check"></i> Request a Catering Quote
              </button>
            </div>
            <div class="hero-event-pills">
              <span class="event-type-pill"><i class="fa-solid fa-ring"></i> Weddings</span>
              <span class="event-type-pill"><i class="fa-solid fa-building-columns"></i> Corporate Events</span>
              <span class="event-type-pill"><i class="fa-solid fa-champagne-glasses"></i> Private Parties</span>
              <span class="event-type-pill"><i class="fa-solid fa-cake-candles"></i> Birthdays & Launches</span>
            </div>
          </div>`
      })}

      <!-- SIMPLE 3-STEP HOW IT WORKS GUIDE -->
      <div class="container">
        <div class="ux-steps-strip">
          <div class="ux-step-item">
            <div class="ux-step-num">1</div>
            <div>
              <div class="ux-step-title">Choose Your Package or Menu</div>
              <div class="ux-step-desc">Pick from 8 curated event formulas or build a custom spread from 239+ dishes.</div>
            </div>
          </div>
          <div class="ux-step-item">
            <div class="ux-step-num">2</div>
            <div>
              <div class="ux-step-title">Add Live Cooking Stations</div>
              <div class="ux-step-desc">Impress guests with our Molten Cheddar Fountain, Charcoal Grill, Saj, or Knefe bar.</div>
            </div>
          </div>
          <div class="ux-step-item">
            <div class="ux-step-num">3</div>
            <div>
              <div class="ux-step-title">Get an Instant WhatsApp Quote</div>
              <div class="ux-step-desc">Send your guest count & date directly to our Event Director (+961 71 048 154).</div>
            </div>
          </div>
        </div>
      </div>

      <!-- UNIFIED TABBED CATERING SHOWCASE (NO ENDLESS SCROLLING) -->
      <section class="section-pad">
        <div class="container">
          <div class="section-header" style="margin-bottom:28px;">
            <span class="section-eyebrow">Explore Mini Kitchen Catering</span>
            <h2 class="section-title">Everything You Need for a Flawless Event</h2>
            <p class="section-desc">
              Switch between our signature catering packages, real wedding & event gallery, and interactive live cooking stations below.
            </p>
          </div>

          <div class="ux-section-tabs-nav">
            ${tabButton('packages', activeTab, 'fa-utensils', '1. Popular Packages (3)')}
            ${tabButton('weddings', activeTab, 'fa-camera-retro', '2. Weddings & Event Photos (6)')}
            ${tabButton('stations', activeTab, 'fa-fire-burner', '3. Live Cooking Stations (5)')}
          </div>

          ${tabBody}
        </div>
      </section>

      ${renderEventBudgetCalculator()}

      ${testimonialsSection()}

      ${quoteSection()}
    `;
}

registerPage('catering', buildCateringHomePage);

registerActions({
  'home:tab': el => {
    state.homeShowcaseTab = el.dataset.tab;
    renderMainView();
  }
});
