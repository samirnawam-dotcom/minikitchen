// SEO tab: per-page title / meta description / keywords (siteConfig.seo.pages[key]) with a live
// Google result preview, plus the canonical domain and geo-target location.

import { registerActions } from '../../shared/actions.js';
import { esc, byId } from '../../shared/dom.js';
import { data, ui, ensureSeo } from '../state.js';
import { registerTab, renderActiveTab, confirmDiscard } from '../router.js';
import { saveSiteConfig } from '../sync.js';
import { showToast } from '../ui/toast.js';

const PAGE_LABELS = {
  catering: 'Home page',
  'catering-menus': 'Catering menus',
  restaurant: 'Restaurant',
  delivery: 'Delivery',
  about: 'About us',
  contact: 'Contact'
};

const LIMITS = { title: 60, description: 160 };

function counter(id, text, limit) {
  const n = String(text || '').length;
  return `<span class="bo-help" id="${id}" style="display:block;">${n} / ${limit} characters${n > limit ? ' — Google may cut the end off' : ''}</span>`;
}

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
          <h2 class="bo-panel-title">How each page appears on Google</h2>
          <div class="bo-panel-sub">Choose a page, then edit the title and short description people see in Google results and WhatsApp link previews.</div>
        </div>
        <div class="bo-panel-actions">
          <a href="/sitemap.xml" target="_blank" rel="noopener" class="bo-btn bo-btn-outline bo-btn-sm">
            <i class="fa-solid fa-sitemap" aria-hidden="true"></i> Sitemap
          </a>
          <a href="/robots.txt" target="_blank" rel="noopener" class="bo-btn bo-btn-outline bo-btn-sm">
            <i class="fa-solid fa-robot" aria-hidden="true"></i> robots.txt
          </a>
        </div>
      </div>

      <div class="bo-panel-body">
        <div class="bo-pill-tabs" role="group" aria-label="Page" style="margin-bottom:20px;">
          ${Object.entries(PAGE_LABELS)
            .map(
              ([key, label]) => `
            <button type="button" class="bo-filter-pill ${pageKey === key ? 'active' : ''}" data-action="seo:page" data-page="${key}" aria-pressed="${pageKey === key}">
              ${label}
            </button>`
            )
            .join('')}
        </div>

        <div style="margin-bottom:22px;">
          <div class="bo-section-label">Preview on Google</div>
          <div class="bo-seo-serp-card">
            <div class="bo-seo-serp-url">
              <img src="${esc(data.siteConfig.logos?.main)}" alt="" style="width:18px; height:18px; border-radius:50%; object-fit:cover;" />
              <span style="overflow-wrap:anywhere;"><b>Mini Kitchen</b> — ${esc(previewUrl)}</span>
            </div>
            <div class="bo-seo-serp-title" id="seoPreviewTitle">${esc(meta.title)}</div>
            <div class="bo-seo-serp-desc" id="seoPreviewDesc">${esc(meta.description)}</div>
          </div>
        </div>

        <form data-on-submit="seo:save" data-dirty-scope style="border:0;">
          <div class="bo-form-group">
            <label for="seoPageTitle">Page title *</label>
            <input type="text" id="seoPageTitle" class="bo-input" value="${esc(meta.title || '')}" data-on-input="seo:preview" data-preview="seoPreviewTitle" data-counter="seoTitleCount" data-limit="${LIMITS.title}" required />
            ${counter('seoTitleCount', meta.title, LIMITS.title)}
          </div>

          <div class="bo-form-group" style="margin-top:16px;">
            <label for="seoPageDesc">Short description *</label>
            <textarea id="seoPageDesc" class="bo-textarea" rows="3" data-on-input="seo:preview" data-preview="seoPreviewDesc" data-counter="seoDescCount" data-limit="${LIMITS.description}" required>${esc(meta.description || '')}</textarea>
            ${counter('seoDescCount', meta.description, LIMITS.description)}
          </div>

          <div class="bo-form-group" style="margin-top:16px;">
            <label for="seoPageKeywords">Search words</label>
            <input type="text" id="seoPageKeywords" class="bo-input" value="${esc(meta.keywords || '')}" />
            <div class="bo-help">Words people might search for, separated by commas.</div>
          </div>

          <details style="margin-top:18px;">
            <summary style="cursor:pointer; font-weight:700; color:var(--bo-text);">Advanced: website address and location</summary>
            <div class="bo-form-grid" style="margin-top:12px;">
              <div class="bo-form-group">
                <label for="seoSiteUrl">Website address</label>
                <input type="text" id="seoSiteUrl" class="bo-input" value="${esc(seo.siteUrl || DEFAULT_SITE_URL)}" />
              </div>
              <div class="bo-form-group">
                <label for="seoGeoPlace">Location for local search</label>
                <input type="text" id="seoGeoPlace" class="bo-input" value="${esc(seo.geoPlacename || 'Ain Al Remmaneh, Aley, Mount Lebanon, Lebanon')}" />
              </div>
            </div>
          </details>

          <div class="bo-form-footer">
            <span class="bo-save-state">Unsaved changes</span>
            <button type="submit" class="bo-btn bo-btn-gold" data-save-button style="margin-left:auto;">
              <i class="fa-solid fa-check" aria-hidden="true"></i> Save “${PAGE_LABELS[pageKey]}”
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
  showToast(`Saved — Google will pick up the new “${PAGE_LABELS[pageKey]}” texts on its next visit.`);
}

registerActions({
  'seo:page': async el => {
    if (!(await confirmDiscard())) return;
    ui.seoPageKey = PAGE_LABELS[el.dataset.page] ? el.dataset.page : 'catering';
    renderActiveTab();
  },
  'seo:preview': el => {
    const target = byId(el.dataset.preview);
    if (target) target.textContent = el.value;
    const count = byId(el.dataset.counter);
    const limit = Number(el.dataset.limit);
    if (count) {
      count.textContent = `${el.value.length} / ${limit} characters${el.value.length > limit ? ' — Google may cut the end off' : ''}`;
    }
  },
  'seo:save': () => saveSeo()
});

registerTab('seo', {
  title: 'Google search',
  subtitle: 'The title and description Google and WhatsApp show for each page.',
  render
});
