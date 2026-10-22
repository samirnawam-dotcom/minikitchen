// SEO tab: per-page title / meta description / keywords (siteConfig.seo.pages[key]) with a live
// Google result preview, plus the canonical domain and geo-target location.

import { registerActions } from '../../shared/actions.js';
import { esc, byId } from '../../shared/dom.js';
import { data, ui, ensureSeo } from '../state.js';
import { registerTab, renderActiveTab } from '../router.js';
import { saveSiteConfig } from '../sync.js';
import { showToast } from '../ui/toast.js';

const PAGE_LABELS = {
  catering: '1. Catering Homepage (index.html)',
  'catering-menus': '2. Catering Menus & Packages (catering-menus.html)',
  restaurant: '3. Mini Kitchen Restaurant Aley (restaurant.html)',
  delivery: '4. Mini Kitchen Delivery Menu (delivery.html)',
  about: '5. About Us & Chefs (about.html)',
  contact: '6. Contact Us & WhatsApp (contact.html)'
};

const FALLBACK_META = {
  title: 'Mini Kitchen Catering | Luxury Wedding & Event Catering in Aley, Mount Lebanon',
  description:
    'Mini Kitchen Catering in Ain Al Remmaneh, Aley provides bespoke wedding catering, corporate galas, live cooking stations, scenic dining, and WhatsApp delivery.',
  keywords:
    'Mini Kitchen Catering, wedding catering Lebanon, catering Aley, Mount Lebanon catering, Ain Al Remmaneh restaurant',
  canonicalPath: '/'
};

const DEFAULT_SITE_URL = 'https://minikitchencatering.com';
const currentKey = () => (PAGE_LABELS[ui.seoPageKey] ? ui.seoPageKey : 'catering');

function render() {
  const seo = ensureSeo();
  const pageKey = currentKey();
  const meta = seo.pages[pageKey] || FALLBACK_META;
  const previewUrl = (seo.siteUrl || DEFAULT_SITE_URL).replace(/\/$/, '') + (meta.canonicalPath || '/');

  return `
    <div class="bo-panel">
      <div class="bo-panel-header">
        <div>
          <div class="bo-panel-title"><i class="fa-solid fa-magnifying-glass-chart" style="color:var(--bo-gold);"></i> Local & Multi-Brand SEO Manager (Ain Al Remmaneh, Aley)</div>
          <div style="font-size:0.8rem; color:var(--bo-muted);">Optimize how Mini Kitchen Catering, Restaurant, and Delivery rank on Google Search & appear when shared on WhatsApp</div>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <a href="/sitemap.xml" target="_blank" rel="noopener" class="bo-btn bo-btn-outline">
            <i class="fa-solid fa-sitemap"></i> View sitemap.xml
          </a>
          <a href="/robots.txt" target="_blank" rel="noopener" class="bo-btn bo-btn-outline">
            <i class="fa-solid fa-robot"></i> View robots.txt
          </a>
        </div>
      </div>

      <div class="bo-panel-body">
        <div class="bo-toolbar" style="margin-bottom:20px; justify-content:flex-start;">
          ${Object.entries(PAGE_LABELS)
            .map(
              ([key, label]) => `
            <button type="button" class="bo-filter-pill ${pageKey === key ? 'active' : ''}" data-action="seo:page" data-page="${key}">
              ${label}
            </button>`
            )
            .join('')}
        </div>

        <div style="margin-bottom:22px;">
          <div style="font-size:0.74rem; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:var(--bo-muted); margin-bottom:8px;">
            <i class="fa-brands fa-google" style="color:#4285F4;"></i> Live Google Search Result Snippet Preview
          </div>
          <div class="bo-seo-serp-card">
            <div class="bo-seo-serp-url">
              <img src="${esc(data.siteConfig.logos?.main)}" alt="" style="width:18px; height:18px; border-radius:50%; object-fit:cover;" />
              <span><b>Mini Kitchen</b> — ${esc(previewUrl)}</span>
            </div>
            <div class="bo-seo-serp-title" id="seoPreviewTitle">${esc(meta.title)}</div>
            <div class="bo-seo-serp-desc" id="seoPreviewDesc">${esc(meta.description)}</div>
          </div>
        </div>

        <form data-on-submit="seo:save">
          <div class="bo-form-grid">
            <div class="bo-form-group">
              <label for="seoSiteUrl">Canonical Domain URL</label>
              <input type="text" id="seoSiteUrl" class="bo-input" value="${esc(seo.siteUrl || DEFAULT_SITE_URL)}" />
            </div>
            <div class="bo-form-group">
              <label for="seoGeoPlace">Geo-Target Location (Schema.org & Local SEO)</label>
              <input type="text" id="seoGeoPlace" class="bo-input" value="${esc(seo.geoPlacename || 'Ain Al Remmaneh, Aley, Mount Lebanon, Lebanon')}" />
            </div>
          </div>

          <div class="bo-form-group" style="margin-top:14px;">
            <label for="seoPageTitle">Page SEO Title Tag (<code>&lt;title&gt;</code> & OpenGraph Title) *</label>
            <input type="text" id="seoPageTitle" class="bo-input" value="${esc(meta.title || '')}" data-on-input="seo:preview" data-preview="seoPreviewTitle" required />
          </div>

          <div class="bo-form-group" style="margin-top:14px;">
            <label for="seoPageDesc">Meta Description (<code>meta[name="description"]</code> & WhatsApp Share Preview) *</label>
            <textarea id="seoPageDesc" class="bo-textarea" rows="3" data-on-input="seo:preview" data-preview="seoPreviewDesc" required>${esc(meta.description || '')}</textarea>
          </div>

          <div class="bo-form-group" style="margin-top:14px;">
            <label for="seoPageKeywords">Target SEO Keywords (Comma separated)</label>
            <input type="text" id="seoPageKeywords" class="bo-input" value="${esc(meta.keywords || '')}" />
          </div>

          <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div style="font-size:0.8rem; color:var(--bo-muted);">
              <i class="fa-solid fa-circle-check" style="color:var(--bo-wa);"></i> Includes <b>JSON-LD @graph Schema</b> for Catering, Restaurant, Delivery & Local FAQ
            </div>
            <button type="submit" class="bo-btn bo-btn-gold">
              <i class="fa-solid fa-floppy-disk"></i> Save SEO Settings for ${PAGE_LABELS[pageKey]}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

async function saveSeo() {
  const seo = ensureSeo();
  const pageKey = currentKey();
  const before = JSON.stringify(seo);
  seo.siteUrl = byId('seoSiteUrl').value.trim() || DEFAULT_SITE_URL;
  seo.geoPlacename = byId('seoGeoPlace').value.trim();
  if (!seo.pages[pageKey]) seo.pages[pageKey] = { canonicalPath: pageKey === 'catering' ? '/' : `/${pageKey}.html` };
  Object.assign(seo.pages[pageKey], {
    title: byId('seoPageTitle').value.trim(),
    description: byId('seoPageDesc').value.trim(),
    keywords: byId('seoPageKeywords').value.trim()
  });
  if (!(await saveSiteConfig())) {
    data.siteConfig.seo = JSON.parse(before);
    return;
  }
  renderActiveTab();
  showToast(`SEO metadata saved for "${pageKey}" page!`);
}

registerActions({
  'seo:page': el => {
    ui.seoPageKey = PAGE_LABELS[el.dataset.page] ? el.dataset.page : 'catering';
    renderActiveTab();
  },
  'seo:preview': el => {
    const target = byId(el.dataset.preview);
    if (target) target.textContent = el.value;
  },
  'seo:save': () => saveSeo()
});

registerTab('seo', {
  title: 'Search Engine Optimization (SEO) & Google Snippet Manager',
  subtitle: 'Manage Google Search titles, meta descriptions, local Aley keywords & OpenGraph previews for all 6 pages',
  render
});
