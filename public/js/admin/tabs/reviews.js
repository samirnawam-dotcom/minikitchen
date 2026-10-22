// Reviews tab: manage the client testimonials shown on the public website
// (siteConfig.testimonials: { name, role, quote, img, rating }), saved via PUT /api/site-config.

import { registerActions } from '../../shared/actions.js';
import { esc, byId } from '../../shared/dom.js';
import { data, siteList } from '../state.js';
import { registerTab, renderActiveTab } from '../router.js';
import { saveSiteConfig } from '../sync.js';
import { openModal, closeModal, modalFormButtons } from '../ui/modal.js';
import { showToast } from '../ui/toast.js';
import { uploadButton } from '../ui/upload.js';

const AVATAR_FALLBACK = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80';

const reviews = () => siteList('testimonials');
const clampRating = value => Math.min(5, Math.max(1, Math.round(Number(value)) || 5));

function ratingSelect(id, current) {
  return `
    <select class="bo-select" id="${id}" data-field="rating" aria-label="Star rating">
      ${[5, 4, 3, 2, 1]
        .map(
          n =>
            `<option value="${n}" ${clampRating(current) === n ? 'selected' : ''}>${'★'.repeat(n)}${'☆'.repeat(5 - n)} (${n})</option>`
        )
        .join('')}
    </select>`;
}

function reviewCard(r, idx) {
  const stars = clampRating(r.rating);
  return `
    <div class="bo-review-card" data-index="${idx}">
      <div class="bo-review-head">
        <img src="${esc(r.img || data.siteConfig.logos?.main || AVATAR_FALLBACK)}" data-fallback="${AVATAR_FALLBACK}"
          alt="${esc(r.name || 'Client')}" class="bo-review-avatar" />
        <div style="min-width:0;">
          <div class="bo-review-stars" aria-label="${stars} out of 5 stars">${'<i class="fa-solid fa-star"></i>'.repeat(stars)}</div>
          <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted);">Review #${idx + 1}</div>
        </div>
      </div>
      <input type="text" class="bo-input" data-field="name" value="${esc(r.name)}" style="font-weight:700;" placeholder="Client name" aria-label="Client name" />
      <input type="text" class="bo-input" data-field="role" value="${esc(r.role)}" style="font-size:0.78rem;" placeholder="Event / occasion" aria-label="Event or occasion" />
      <textarea class="bo-textarea" data-field="quote" rows="4" style="font-size:0.8rem;" placeholder="Review text" aria-label="Review text">${esc(r.quote)}</textarea>
      ${ratingSelect(`review-rating-${idx}`, r.rating)}
      <div style="display:flex; gap:6px; align-items:center;">
        <input type="text" class="bo-input" id="review-img-${idx}" data-field="img" value="${esc(r.img)}" style="font-size:0.75rem; flex:1;" placeholder="Photo URL" aria-label="Photo URL" />
        ${uploadButton(`review-img-${idx}`, { label: '', compact: true })}
      </div>
      <div style="display:flex; gap:8px; margin-top:auto; padding-top:6px;">
        <button class="bo-btn bo-btn-primary" style="flex:1;" data-action="reviews:save" data-index="${idx}">Save</button>
        <button class="bo-btn bo-btn-danger" data-action="reviews:delete" data-index="${idx}" title="Delete Review" aria-label="Delete review">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `;
}

function render() {
  const list = reviews();
  const average = list.length ? list.reduce((s, r) => s + clampRating(r.rating), 0) / list.length : 0;
  return `
    <div class="bo-panel">
      <div class="bo-panel-header">
        <div>
          <div class="bo-panel-title"><i class="fa-solid fa-star" style="color:#f59e0b;"></i> Client Testimonials on the Website (${list.length}${list.length ? ` • ${average.toFixed(1)} ★ average` : ''})</div>
          <div style="font-size:0.8rem; color:var(--bo-muted);">Shown in the "Verified Hospitality Reviews" section of the public website</div>
        </div>
        <button class="bo-btn bo-btn-gold" data-action="reviews:add-open">
          <i class="fa-solid fa-plus"></i> + Add Review
        </button>
      </div>
      <div class="bo-panel-body">
        ${
          list.length === 0
            ? `<div style="text-align:center; padding:40px; color:var(--bo-muted);">No reviews yet. Click "+ Add Review" to publish the first testimonial.</div>`
            : `<div class="bo-review-grid">${list.map(reviewCard).join('')}</div>`
        }
      </div>
    </div>
  `;
}

function readCard(card) {
  const field = name => card.querySelector(`[data-field="${name}"]`)?.value.trim() || '';
  return {
    name: field('name'),
    role: field('role'),
    quote: field('quote'),
    img: field('img'),
    rating: clampRating(field('rating'))
  };
}

async function saveReview(button) {
  const idx = Number(button.dataset.index);
  const card = button.closest('.bo-review-card');
  const list = reviews();
  if (!card || !list[idx]) return;
  const values = readCard(card);
  if (!values.name || !values.quote) {
    showToast('A review needs a client name and review text.', { error: true });
    return;
  }
  Object.assign(list[idx], values);
  if (await saveSiteConfig()) {
    renderActiveTab();
    showToast(`Saved review from ${values.name}`);
  }
}

async function deleteReview(idx) {
  const list = reviews();
  if (!list[idx]) return;
  if (!window.confirm(`Delete the review from ${list[idx].name || 'this client'}?`)) return;
  const [removed] = list.splice(idx, 1);
  if (!(await saveSiteConfig())) {
    list.splice(idx, 0, removed);
    return;
  }
  renderActiveTab();
  showToast('Review removed from the website.');
}

function openAddReview() {
  openModal(
    'Add New Client Review',
    `
      <form data-on-submit="reviews:add-submit">
        <div class="bo-form-grid">
          <div class="bo-form-group">
            <label for="nrName">Client Name *</label>
            <input type="text" id="nrName" class="bo-input" placeholder="e.g., Nadine & Karim H." required />
          </div>
          <div class="bo-form-group">
            <label for="nrRole">Event / Occasion *</label>
            <input type="text" id="nrRole" class="bo-input" placeholder="e.g., Mountain Wedding • 220 Guests (Aley)" required />
          </div>
          <div class="bo-form-group">
            <label for="nrRating">Star Rating *</label>
            ${ratingSelect('nrRating', 5)}
          </div>
        </div>
        <div class="bo-form-group" style="margin-top:14px;">
          <label for="nrImg">Photo (Paste URL or Upload from Device)</label>
          <div style="display:flex; gap:8px; align-items:center;">
            <input type="text" id="nrImg" class="bo-input" style="flex:1;" placeholder="https://..." />
            ${uploadButton('nrImg')}
          </div>
        </div>
        <div class="bo-form-group" style="margin-top:14px;">
          <label for="nrQuote">Review Text *</label>
          <textarea id="nrQuote" class="bo-textarea" rows="4" required></textarea>
        </div>
        ${modalFormButtons('Publish Review')}
      </form>
    `
  );
}

async function submitAddReview() {
  const value = id => byId(id).value.trim();
  const review = {
    name: value('nrName'),
    role: value('nrRole'),
    quote: value('nrQuote'),
    img: value('nrImg'),
    rating: clampRating(value('nrRating'))
  };
  const list = reviews();
  list.unshift(review);
  if (!(await saveSiteConfig())) {
    list.shift();
    return;
  }
  closeModal();
  renderActiveTab();
  showToast(`Published review from ${review.name}!`);
}

registerActions({
  'reviews:save': el => saveReview(el),
  'reviews:delete': el => deleteReview(Number(el.dataset.index)),
  'reviews:add-open': () => openAddReview(),
  'reviews:add-submit': () => submitAddReview()
});

registerTab('reviews', {
  title: 'Verified Client Testimonials & Wedding Reviews Manager',
  subtitle: 'Add, edit, or feature 5-star wedding, corporate event, and Aley restaurant reviews on the live website',
  render
});
