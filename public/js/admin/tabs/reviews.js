// Reviews tab: manage the client testimonials shown on the public website
// (siteConfig.testimonials: { name, role, quote, img, rating }), saved via PUT /api/site-config.

import { registerActions } from '../../shared/actions.js';
import { esc, byId } from '../../shared/dom.js';
import { data, siteList } from '../state.js';
import { registerTab, renderActiveTab, afterCardSaved, confirmDiscard } from '../router.js';
import { saveSiteConfig } from '../sync.js';
import { openModal, closeModal, modalFormButtons, confirmDialog } from '../ui/modal.js';
import { showToast } from '../ui/toast.js';
import { uploadButton } from '../ui/upload.js';

const AVATAR_FALLBACK = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80';

const reviews = () => siteList('testimonials');
const clampRating = value => Math.min(5, Math.max(1, Math.round(Number(value)) || 5));

function ratingSelect(id, current) {
  return `
    <select class="bo-select" id="${id}" data-field="rating">
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
    <div class="bo-review-card" data-index="${idx}" data-dirty-scope>
      <div class="bo-review-head">
        <img src="${esc(r.img || data.siteConfig.logos?.main || AVATAR_FALLBACK)}" data-fallback="${AVATAR_FALLBACK}"
          alt="" class="bo-review-avatar" />
        <div style="min-width:0;">
          <div style="font-weight:700; color:var(--bo-text);">${esc(r.name || 'Client')}</div>
          <div class="bo-review-stars" role="img" aria-label="${stars} out of 5 stars">${'<i class="fa-solid fa-star" aria-hidden="true"></i>'.repeat(stars)}</div>
        </div>
      </div>
      <div><label class="bo-label" for="rv-name-${idx}">Client name</label>
        <input type="text" class="bo-input" id="rv-name-${idx}" data-field="name" value="${esc(r.name)}" /></div>
      <div><label class="bo-label" for="rv-role-${idx}">Event or occasion</label>
        <input type="text" class="bo-input" id="rv-role-${idx}" data-field="role" value="${esc(r.role)}" /></div>
      <div><label class="bo-label" for="rv-quote-${idx}">What they said</label>
        <textarea class="bo-textarea" id="rv-quote-${idx}" data-field="quote" rows="4">${esc(r.quote)}</textarea></div>
      <div><label class="bo-label" for="review-rating-${idx}">Stars</label>${ratingSelect(`review-rating-${idx}`, r.rating)}</div>
      <div><label class="bo-label" for="review-img-${idx}">Photo <span class="bo-muted" style="font-weight:500;">(optional)</span></label>
        <div class="bo-field-row">
          <input type="text" class="bo-input" id="review-img-${idx}" data-field="img" value="${esc(r.img)}" placeholder="Paste a link or upload" />
          ${uploadButton(`review-img-${idx}`, { label: '', compact: true })}
        </div></div>
      <div class="bo-card-actions">
        <button type="button" class="bo-btn bo-btn-primary" data-action="reviews:save" data-index="${idx}" data-save-button>Save</button>
        <button type="button" class="bo-btn bo-btn-danger bo-btn-icon" data-action="reviews:delete" data-index="${idx}" title="Delete review" aria-label="Delete review from ${esc(r.name || 'this client')}">
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
        <span class="bo-save-state" style="flex-basis:100%; justify-content:center;">Unsaved changes</span>
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
          <h2 class="bo-panel-title">${list.length} review${list.length === 1 ? '' : 's'} on the website${list.length ? ` · ${average.toFixed(1)} ★ average` : ''}</h2>
          <div class="bo-panel-sub">Shown in the reviews section of the public website. Each card saves on its own.</div>
        </div>
        <button type="button" class="bo-btn bo-btn-gold" data-action="reviews:add-open">
          <i class="fa-solid fa-plus" aria-hidden="true"></i> Add a review
        </button>
      </div>
      <div class="bo-panel-body">
        ${
          list.length === 0
            ? `<div class="bo-empty"><i class="fa-regular fa-star" aria-hidden="true"></i><div class="bo-empty-title">No reviews yet</div><p>Add what happy clients said about your food — it builds trust on the website.</p><button type="button" class="bo-btn bo-btn-gold" data-action="reviews:add-open">Add the first review</button></div>`
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
  const before = { ...list[idx] };
  Object.assign(list[idx], values);
  if (await saveSiteConfig()) {
    afterCardSaved(card);
    showToast(`Saved the review from ${values.name}.`);
  } else {
    list[idx] = before;
  }
}

async function deleteReview(idx) {
  const list = reviews();
  if (!list[idx]) return;
  const sure = await confirmDialog(
    `The review from ${list[idx].name || 'this client'} will be removed from the website.`,
    {
      title: 'Delete this review?',
      confirmLabel: 'Delete review'
    }
  );
  if (!sure || !(await confirmDiscard())) return;
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
    'Add a review',
    `
      <form data-on-submit="reviews:add-submit">
        <div class="bo-form-grid">
          <div class="bo-form-group">
            <label for="nrName">Client name *</label>
            <input type="text" id="nrName" class="bo-input" placeholder="e.g., Nadine & Karim H." required />
          </div>
          <div class="bo-form-group">
            <label for="nrRole">Event or occasion *</label>
            <input type="text" id="nrRole" class="bo-input" placeholder="e.g., Mountain Wedding • 220 Guests (Aley)" required />
          </div>
          <div class="bo-form-group">
            <label for="nrRating">Stars *</label>
            ${ratingSelect('nrRating', 5)}
          </div>
        </div>
        <div class="bo-form-group" style="margin-top:14px;">
          <label for="nrImg">Photo (optional — paste a link or upload)</label>
          <div style="display:flex; gap:8px; align-items:center;">
            <input type="text" id="nrImg" class="bo-input" style="flex:1;" placeholder="https://..." />
            ${uploadButton('nrImg')}
          </div>
        </div>
        <div class="bo-form-group" style="margin-top:14px;">
          <label for="nrQuote">What they said *</label>
          <textarea id="nrQuote" class="bo-textarea" rows="4" required></textarea>
        </div>
        ${modalFormButtons('Add to website')}
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
  showToast(`The review from ${review.name} is on the website.`);
}

registerActions({
  'reviews:save': el => saveReview(el),
  'reviews:delete': el => deleteReview(Number(el.dataset.index)),
  'reviews:add-open': () => openAddReview(),
  'reviews:add-submit': () => submitAddReview()
});

registerTab('reviews', {
  title: 'Reviews',
  subtitle: 'Client reviews shown on the website.',
  render
});
