// The catering offer (event buffets, Birthday Minis, live stations, trays, mini bites) as shown on
// the home and packages pages: lookups, bilingual names and the shared cards / price lists.
// Every value comes from the owner's site config, so all of it is escaped.

import { esc } from '../shared/dom.js';
import { state } from './state.js';
import { cateringList, content } from './config.js';

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

/** The same as choiceLabel, split so the number can be set apart: { count: '4' | '', text }. */
function choiceParts(choice) {
  const group = findGroup(choice.group);
  if (!group) return null;
  const count = Number(choice.count) || 0;
  const ar = state.lang === 'ar' && group.nameAr;
  if (count > 0) return { count: String(count), text: ar ? group.nameAr : String(group.name || '').toLowerCase() };
  return { count: '', text: ar ? `تشكيلة ${group.nameAr}` : `Selection of ${String(group.name || '').toLowerCase()}` };
}

/**
 * The package we point undecided visitors to: one marked `recommended: true` in the owner's data,
 * otherwise the Premium package of each kind (the middle of the three).
 */
export function isRecommended(pkg) {
  if (typeof pkg.recommended === 'boolean') return pkg.recommended;
  return /-premium$/.test(String(pkg.id || ''));
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
  const choices = (pkg.choices || []).map(choiceParts).filter(Boolean);
  const includes = (pkg.includes || []).filter(Boolean);
  const label = `${TYPE_LABELS[pkg.type] || 'Package'} · ${pkg.name}`;
  const inquiry = `Hello Mini Kitchen Catering! I am interested in the ${label} package (${money(pkg.pricePerPerson)} per person). Could you share availability?`;
  const recommended = isRecommended(pkg);
  return `
      <article class="package-card event-package${photo ? '' : ' event-package-plain'}${recommended ? ' is-recommended' : ''}">
        ${recommended ? '<span class="package-ribbon"><i class="fa-solid fa-star" aria-hidden="true"></i> Recommended</span>' : ''}
        ${
          photo
            ? `<div class="package-card-media">
          <img src="${esc(pkg.img)}" data-fallback="" alt="${esc(`${label} catering buffet`)}" loading="lazy" decoding="async" width="600" height="400" />
          ${pkg.badge ? `<span class="package-badge">${esc(pkg.badge)}</span>` : ''}
        </div>`
            : ''
        }
        <div class="package-card-body">
          <div class="package-card-head">
            <div>
              <div class="package-card-cat">${esc(TYPE_LABELS[pkg.type] || 'Package')}${!photo && pkg.badge ? ` · ${esc(pkg.badge)}` : ''}</div>
              <h3 class="package-card-title">${nameBlock(pkg)}</h3>
            </div>
            <div class="package-card-price"><span class="package-price-value">${money(pkg.pricePerPerson)}</span><span class="package-price-unit">per person</span></div>
          </div>
          ${pkg.note ? `<p class="package-card-sub">${esc(pkg.note)}</p>` : ''}
          <div class="package-counts-label">You choose</div>
          <ul class="package-counts">
            ${choices.map(c => `<li><span class="package-count${c.count ? '' : ' is-all'}">${c.count ? esc(c.count) : '<i class="fa-solid fa-check" aria-hidden="true"></i>'}</span><span>${esc(c.text)}</span></li>`).join('')}
            ${includes.map(i => `<li class="is-included"><span class="package-count is-all"><i class="fa-solid fa-plus" aria-hidden="true"></i></span><span><strong>${esc(i)}</strong> included</span></li>`).join('')}
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

/** Dish lists used by the packages of one kind, in package order, with each package's count. */
function menuGroups(type) {
  const order = [];
  const counts = new Map();
  for (const pkg of packages(type)) {
    for (const choice of pkg.choices || []) {
      if (!findGroup(choice.group)) continue;
      if (!counts.has(choice.group)) {
        order.push(choice.group);
        counts.set(choice.group, []);
      }
      counts.get(choice.group).push({ name: localName(pkg), count: Number(choice.count) || 0 });
    }
  }
  return order.map(id => ({ group: findGroup(id), counts: counts.get(id) }));
}

/** "Classic 4 · Premium 6 · VIP 8" (or "Included" for a selection), so customers see what each package allows. */
function countsLine(counts) {
  if (counts.every(c => c.count === 0)) return 'Included in every package';
  return counts
    .map(c => `${esc(c.name)} <strong>${c.count || '—'}</strong>`)
    .join('<span aria-hidden="true"> · </span>');
}

function menuCourse({ group, counts }) {
  const items = groupItems(group);
  return `
            <section class="menu-course">
              <header class="menu-course-head">
                <h4 class="menu-course-title">${nameBlock(group)}</h4>
                <p class="menu-course-counts">${countsLine(counts)}</p>
              </header>
              ${
                items.length
                  ? `<ul class="menu-course-items">${items.map(i => `<li>${nameBlock(i, 'menu-dish')}</li>`).join('')}</ul>`
                  : '<p class="menu-course-empty">Our chef shares the current choices with you when you send your request.</p>'
              }
            </section>`;
}

/**
 * The catering menu without prices: every dish customers can choose from, grouped by course,
 * for buffets and Birthday Minis, so they can look before building a package.
 */
export function cateringMenuBook() {
  const parts = [
    { type: 'buffet', title: 'Event buffet menu' },
    { type: 'birthday', title: 'Birthday Mini menu' }
  ]
    .map(part => ({ ...part, courses: menuGroups(part.type) }))
    .filter(part => part.courses.length);
  if (parts.length === 0) return '<p class="empty-state">Our menu is coming soon.</p>';
  return parts
    .map(
      part => `
          <div class="menu-book">
            <h3 class="menu-book-title">${part.title}</h3>
            <div class="menu-book-grid">${part.courses.map(menuCourse).join('')}</div>
          </div>`
    )
    .join('');
}

/** Extras offered on request (bar, plate service, waiters, chef). */
export function extrasNote() {
  const extras = cateringList('cateringExtras');
  if (extras.length === 0) return '';
  return `<p class="extras-note"><strong>Extras on request:</strong> ${extras.map(e => esc(localName(e))).join(' · ')}</p>`;
}

// ---------------------------------------------------------------------------
// How it works and frequently asked questions (built only from the owner's real data)
// ---------------------------------------------------------------------------

/** Three honest steps from package to confirmation. */
export function howItWorks({ compact = false } = {}) {
  const steps = [
    {
      icon: 'fa-list-check',
      title: 'Choose a package',
      text: 'Event buffets and Birthday Minis are priced per person — or skip the package and pick stations, trays or mini bites.'
    },
    {
      icon: 'fa-utensils',
      title: 'Build your menu',
      text: 'Pick your dishes, add live stations, trays and extras, and watch the estimate update as you go.'
    },
    {
      icon: 'fa-whatsapp',
      brand: true,
      title: 'Send it on WhatsApp',
      text: 'Your request arrives with our catering team, who confirm the menu, date and final price with you.'
    }
  ];
  return `
          <ol class="how-steps${compact ? ' how-steps-compact' : ''}">
            ${steps
              .map(
                (st, i) => `
            <li class="how-step">
              <span class="how-step-icon" aria-hidden="true"><i class="${st.brand ? 'fa-brands' : 'fa-solid'} ${st.icon}"></i></span>
              <span class="how-step-num">Step ${i + 1}</span>
              <h3 class="how-step-title">${st.title}</h3>
              <p class="how-step-text">${st.text}</p>
            </li>`
              )
              .join('')}
          </ol>`;
}

/** Questions answered from site-config facts only: prices, trays, extras, booking, hours, area. */
export function faqItems() {
  const { contacts = {}, location = {} } = content.config || {};
  const catering = contacts.catering || {};
  const trays = cateringList('mainCourseTrays');
  const serves = trays.find(t => t.serves)?.serves || '';
  const extras = cateringList('cateringExtras').map(e => localName(e));
  const kgStations = cateringList('liveStationMenu').filter(st => (st.options || []).some(o => o.unit === 'kg'));
  const items = [];

  const buffetFrom = fromPriceLabel('buffet');
  const birthdayFrom = fromPriceLabel('birthday');
  items.push({
    q: 'How are your catering prices worked out?',
    a: `Event buffets and Birthday Minis are priced per person${buffetFrom || birthdayFrom ? ` (buffets ${buffetFrom.toLowerCase() || 'per person'}, Birthday Minis ${birthdayFrom.toLowerCase() || 'per person'})` : ''}, so your total is the package price times your number of guests. Live stations are added per person${
      kgStations.length
        ? ` (the ${kgStations
            .map(st =>
              localName(st)
                .toLowerCase()
                .replace(/^live\s+/, '')
                .replace(/\s+station$/, '')
            )
            .join(' and ')} station${kgStations.length > 1 ? 's are' : ' is'} priced per kg)`
        : ''
    }. The builder shows a running estimate; our team confirms the final price.`
  });
  if (trays.length) {
    items.push({
      q: 'How many people does a main course tray serve?',
      a: `${serves ? `Each main course tray serves ${serves}.` : 'Each tray is priced individually.'} Trays ${fromPriceLabel('trays').replace(/^Trays /, '')} and can be added on their own or next to a package.`
    });
  }
  items.push({
    q: 'Can I choose the dishes in my package?',
    a: 'Yes. Each package lists how many dishes you choose from each group — for example appetizers, salads or hot main courses. Where a list is not online yet, our team goes through the options with you on WhatsApp.'
  });
  if (extras.length) {
    items.push({
      q: 'Do you provide service staff or a bar?',
      a: `Yes, on request: ${extras.join(', ').toLowerCase()}. Tick the extras you need in the builder and we price them with your quotation.`
    });
  }
  items.push({
    q: 'How do I book, and when is my date confirmed?',
    a: `Build your package and press “Send my request on WhatsApp” — the message lists every choice. Nothing is booked or paid at that point: our catering team replies to confirm availability, the menu and the price.${catering.phoneDisplay ? ` You can also call or WhatsApp catering on ${catering.phoneDisplay}.` : ''}`
  });
  if (location.short) {
    items.push({
      q: 'Where are you based?',
      a: `Our kitchen is in ${location.short}${location.hours ? ` and we are open ${location.hours.replace(/^Daily from/i, 'daily from')}` : ''}. Tell us your venue when you send your request and we confirm the details with you.`
    });
  }
  return items;
}

export function faqList() {
  return `
          <div class="faq-list">
            ${faqItems()
              .map(
                (f, i) => `
            <details class="faq-item"${i === 0 ? ' open' : ''}>
              <summary><span>${esc(f.q)}</span><i class="fa-solid fa-plus faq-icon" aria-hidden="true"></i></summary>
              <div class="faq-answer"><p>${esc(f.a)}</p></div>
            </details>`
              )
              .join('')}
          </div>`;
}
