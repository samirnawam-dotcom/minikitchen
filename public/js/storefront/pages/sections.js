// Building blocks shared by several pages: hero banner, catering package card, client testimonials
// and photo gallery cards. All config text is escaped.

import { esc } from '../../shared/dom.js';
import { content, getTestimonials } from '../config.js';

/** Full-width hero with background photo. `style` is the section's inline style, `body` the inner content. */
export function heroSection({ style, img, alt, body, fallback }) {
  return `
      <section class="hero-section" style="${style}">
        <div class="hero-bg-media">
          <img src="${esc(img)}"${fallback !== undefined ? ` data-fallback="${esc(fallback)}"` : ''} alt="${esc(alt)}" />
        </div>
        <div class="hero-overlay"></div>
        <div class="container">
          ${body}
        </div>
      </section>`;
}

/** <div class="gallery-card"> with overlay; `tag` / `text` pick the fields used by each gallery. */
export function galleryCard(g, tag, text) {
  return `
            <div class="gallery-card">
              <img src="${esc(g.img)}" data-fallback="" alt="${esc(g.title)}" loading="lazy" />
              <div class="gallery-card-overlay">
                <span class="gallery-tag">${esc(g[tag])}</span>
                <h4>${esc(g.title)}</h4>
                <p>${esc(g[text])}</p>
              </div>
            </div>
          `;
}

export function packageCard(pkg) {
  const highlights = (pkg.highlights || []).slice(0, 4);
  const inquiry = `Hello Mini Kitchen Catering! I am interested in the *${pkg.title}* (${pkg.pricePerPerson}/guest). Could you share availability and a customized quote?`;
  return `
      <div class="package-card">
        <div class="package-card-media">
          <img src="${esc(pkg.img)}" data-fallback="" alt="${esc(pkg.title)}" loading="lazy" />
          <span class="package-badge">${esc(pkg.badge)}</span>
          <span class="package-price-pill">${esc(pkg.pricePerPerson)} <small style="font-weight:500;">/ guest</small></span>
        </div>
        <div class="package-card-body">
          <div class="package-card-cat">${esc(pkg.categoryLabel)} • ${esc(pkg.minGuests)}</div>
          <h3 class="package-card-title">${esc(pkg.title)}</h3>
          <p class="package-card-sub">${esc(pkg.subtitle)}</p>
          <ul class="package-highlights">
            ${highlights.map(h => `<li><i class="fa-solid fa-circle-check"></i> <span>${esc(h)}</span></li>`).join('')}
          </ul>
          <div class="package-card-footer">
            <button class="btn btn-whatsapp" style="flex:1; padding:11px;" data-action="wa:open" data-brand="catering" data-msg="${esc(inquiry)}">
              <i class="fa-brands fa-whatsapp"></i> Inquire on WhatsApp
            </button>
            <button class="btn btn-outline-dark" style="padding:11px 15px;" data-action="quote:select-package" data-label="${esc(`${pkg.title} (${pkg.pricePerPerson}/guest)`)}">
              Select
            </button>
          </div>
        </div>
      </div>
    `;
}

export function testimonialsSection() {
  const reviews = getTestimonials();
  if (reviews.length === 0) return '';

  return `
      <section class="section-pad" style="background:var(--bg-cream);">
        <div class="container">
          <div class="section-header" style="margin-bottom:28px;">
            <span class="section-eyebrow"><i class="fa-solid fa-star"></i> Verified Hospitality Reviews</span>
            <h2 class="section-title">Loved by Wedding Couples, Corporate Hosts & Aley Guests</h2>
            <p class="section-desc">
              Real feedback from clients who trusted Mini Kitchen Catering, Restaurant, and Delivery for their most important occasions.
            </p>
          </div>

          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap:22px;">
            ${reviews
              .map(
                r => `
              <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:20px; padding:24px; box-shadow:var(--shadow-soft); display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="color:#f59e0b; font-size:0.9rem; margin-bottom:12px;">
                    ${'<i class="fa-solid fa-star"></i> '.repeat(Math.min(5, Math.max(1, Number(r.rating) || 5)))}
                  </div>
                  <p style="font-size:0.93rem; color:var(--text-main); font-style:italic; line-height:1.65; margin-bottom:18px;">
                    “${esc(r.quote || r.caption || r.desc || '')}”
                  </p>
                </div>
                <div style="display:flex; align-items:center; gap:12px; border-top:1px solid var(--border-subtle); padding-top:14px;">
                  <img
                    src="${esc(r.img || content.config.logos.main)}"
                    data-fallback=""
                    alt="${esc(r.name || r.title || 'Client')}"
                    style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid var(--brand-primary);"
                  />
                  <div>
                    <div style="font-weight:800; font-size:0.92rem; color:var(--text-main);">${esc(r.name || r.title || 'Valued Client')}</div>
                    <div style="font-size:0.76rem; color:var(--brand-primary-dark); font-weight:700;">${esc(r.role || r.category || r.tag || 'Verified Event Client')}</div>
                  </div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </section>
    `;
}
