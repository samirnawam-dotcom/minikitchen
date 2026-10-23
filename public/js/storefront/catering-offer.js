// The catering offer (event buffets, Birthday Minis, live stations, trays, mini bites) as shown on
// the home and packages pages: lookups, bilingual names and the shared cards / price lists.
// Every value comes from the owner's site config, so all of it is escaped.

import { esc } from '../shared/dom.js';
import { state } from './state.js';
import { cateringList } from './config.js';

export const TYPE_LABELS = { buffet: 'Event buffet', birthday: 'Birthday Mini' };

export const packages = type => cateringList('eventPackages').filter(p => !type || p.type === type);
export const findPackage = id => cateringList('eventPackages').find(p => p.id === id) || null;
export const findGroup = id => cateringList('cateringChoiceGroups').find(g => g.id === id) || null;
export const groupItems = group => (Array.isArray(group?.items) ? group.items.filter(i => i && i.name) : []);

export const money = n => `$${(Number(n) || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
export const price = n => Number(n) || 0;

/** The name in the visitor's language (Arabic when the site is switched to Arabic and one is set). */
export function localName(obj, key = 'name') {
  if (!obj) return '';
  const ar = obj[`${key}Ar`];
  return state.lang === 'ar' && ar ? ar : obj[key] || ar || '';
}

/** The name in the other language, shown as a quiet second line. */
export function otherName(obj, key = 'name') {
  if (!obj) return '';
  const ar = obj[`${key}Ar`];
  if (!ar || !obj[key]) return '';
  return state.lang === 'ar' ? obj[key] : ar;
}

/** Bilingual name: main line in the visitor's language, the other language underneath. */
export function nameBlock(obj, cls = 'bi-name', key = 'name') {
  const other = otherName(obj, key);
  return `<span class="${cls}">${esc(localName(obj, key))}</span>${other ? `<span class="bi-other">${esc(other)}</span>` : ''}`;
}

/** "4 appetizers", "Selection of desserts" (count 0) — in the visitor's language. */
export function choiceLabel(choice) {
  const group = findGroup(choice.group);
  if (!group) return '';
  const count = Number(choice.count) || 0;
  if (state.lang === 'ar' && group.nameAr) return count > 0 ? `${count} ${group.nameAr}` : `تشكيلة ${group.nameAr}`;
  const name = String(group.name || '').toLowerCase();
  return count > 0 ? `${count} ${name}` : `Selection of ${name}`;
}

/** Lowest price in a list of numbers (for "from $20 / person"). */
const lowest = values => {
  const nums = values.map(Number).filter(n => n > 0);
  return nums.length ? Math.min(...nums) : 0;
};

/** The "from" price shown on each catering type card. */
export function fromPriceLabel(typeId) {
  if (typeId === 'buffet' || typeId === 'birthday') {
    const n = lowest(packages(typeId).map(p => p.pricePerPerson));
    return n ? `From ${money(n)} / person` : '';
  }
  if (typeId === 'stations') {
    const n = lowest(
      cateringList('liveStationMenu').flatMap(s => (s.options || []).filter(o => o.unit !== 'kg').map(o => o.price))
    );
    return n ? `From ${money(n)} / person` : '';
  }
  if (typeId === 'trays') {
    const n = lowest(cateringList('mainCourseTrays').map(t => t.price));
    return n ? `Trays from ${money(n)}` : '';
  }
  return '';
}

const optionPrice = opt => `${money(opt.price)} / ${opt.unit === 'kg' ? 'kg' : 'person'}`;

// ---------------------------------------------------------------------------
// Cards and price lists
// ---------------------------------------------------------------------------

/** Package card: photo, name, price per person, what the customer chooses, "Build this package". */
export function eventPackageCard(pkg, { photo = true } = {}) {
  const choices = (pkg.choices || []).map(choiceLabel).filter(Boolean);
  const includes = (pkg.includes || []).filter(Boolean);
  const label = `${TYPE_LABELS[pkg.type] || 'Package'} · ${pkg.name}`;
  const inquiry = `Hello Mini Kitchen Catering! I am interested in the ${label} package (${money(pkg.pricePerPerson)} per person). Could you share availability?`;
  return `
      <article class="package-card event-package${photo ? '' : ' event-package-plain'}">
        ${
          photo
            ? `<div class="package-card-media">
          <img src="${esc(pkg.img)}" data-fallback="" alt="${esc(label)}" loading="lazy" />
          ${pkg.badge ? `<span class="package-badge">${esc(pkg.badge)}</span>` : ''}
        </div>`
            : ''
        }
        <div class="package-card-body">
          <div class="package-card-cat">${esc(TYPE_LABELS[pkg.type] || 'Package')}${!photo && pkg.badge ? ` · ${esc(pkg.badge)}` : ''}</div>
          <h3 class="package-card-title">${nameBlock(pkg)}</h3>
          <div class="package-card-price"><span>${money(pkg.pricePerPerson)}</span> per person</div>
          ${pkg.note ? `<p class="package-card-sub">${esc(pkg.note)}</p>` : ''}
          <ul class="check-list package-counts">
            ${choices.map(c => `<li>${esc(c)}</li>`).join('')}
            ${includes.map(i => `<li><strong>${esc(i)}</strong> included</li>`).join('')}
          </ul>
          <div class="package-card-footer">
            <button type="button" class="btn btn-primary btn-sm" data-action="builder:start" data-pkg="${esc(pkg.id)}">Build this package</button>
            <button type="button" class="btn btn-outline btn-sm" data-action="wa:open" data-brand="catering" data-msg="${esc(inquiry)}">
              <i class="fa-brands fa-whatsapp"></i> Ask
            </button>
          </div>
        </div>
      </article>`;
}

/** Live stations with their options and prices. */
export function stationMenu() {
  const stations = cateringList('liveStationMenu');
  if (stations.length === 0) return '<p class="empty-state">Live stations are coming soon.</p>';
  return `
          <ul class="price-list price-list-stations">
            ${stations
              .map(
                st => `
            <li class="price-row">
              <div class="price-row-name">${nameBlock(st)}</div>
              <div class="price-row-options">
                ${(st.options || [])
                  .map(
                    opt =>
                      `<span class="price-option"><span>${esc(localName(opt, 'label'))}</span> <strong>${optionPrice(opt)}</strong></span>`
                  )
                  .join('')}
              </div>
            </li>`
              )
              .join('')}
          </ul>`;
}

/** Main course trays price list. */
export function trayMenu() {
  const trays = cateringList('mainCourseTrays');
  if (trays.length === 0) return '<p class="empty-state">Trays are coming soon.</p>';
  return `
          <ul class="price-list price-list-two">
            ${trays
              .map(
                t => `
            <li class="price-row">
              <div class="price-row-name">${nameBlock(t)}${t.serves ? `<span class="price-row-meta">Serves ${esc(t.serves)}</span>` : ''}</div>
              <strong class="price-row-price">${money(t.price)}</strong>
            </li>`
              )
              .join('')}
          </ul>`;
}

/** Mini bites ("La2mi La2mi") price list. */
export function bitesMenu() {
  const bites = cateringList('miniBites');
  if (bites.length === 0) return '<p class="empty-state">Mini bites are coming soon.</p>';
  return `
          <ul class="price-list price-list-two">
            ${bites
              .map(
                b => `
            <li class="price-row">
              <div class="price-row-name">${nameBlock(b)}${b.desc ? `<span class="price-row-meta">${esc(b.desc)}</span>` : ''}</div>
              <strong class="price-row-price">${money(b.price)}${b.unit ? `<span class="price-row-unit"> / ${esc(b.unit)}</span>` : ''}</strong>
            </li>`
              )
              .join('')}
          </ul>`;
}

/** Extras offered on request (bar, plate service, waiters, chef). */
export function extrasNote() {
  const extras = cateringList('cateringExtras');
  if (extras.length === 0) return '';
  return `<p class="extras-note"><strong>Extras on request:</strong> ${extras.map(e => esc(localName(e))).join(' · ')}</p>`;
}
