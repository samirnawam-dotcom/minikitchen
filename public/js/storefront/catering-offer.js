// The catering offer (event buffets, Birthday Minis, live stations, trays, mini bites) as shown on
// the home and packages pages: lookups, bilingual names and the shared cards / price lists.
// Every value comes from the owner's site config, so all of it is escaped.

import { esc } from '../shared/dom.js';
import { cateringList, content } from './config.js';
import { state } from './state.js';
import { isAr, isolateLatin, ltr, servesText, t } from './i18n-strings.js';

/** English labels of the package kinds (used in WhatsApp messages and Back Office records). */
export const TYPE_LABELS = { buffet: 'Event buffet', birthday: 'Birthday Mini' };
/** The package kind in the visitor's language. */
export const typeLabel = type => t(TYPE_LABELS[type] || 'Package');

export const packages = type => cateringList('eventPackages').filter(p => !type || p.type === type);
export const findPackage = id => cateringList('eventPackages').find(p => p.id === id) || null;
export const findGroup = id => cateringList('cateringChoiceGroups').find(g => g.id === id) || null;
export const groupItems = group => (Array.isArray(group?.items) ? group.items.filter(i => i && i.name) : []);

/** "$20" for messages and records (always plain). */
export const moneyEn = n => `$${(Number(n) || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
/** "$20" for the page: kept in one left-to-right piece inside Arabic text. */
export const money = n => ltr(moneyEn(n));
export const price = n => Number(n) || 0;

/** The name in the visitor's language (Arabic when the site is switched to Arabic and one is set). */
export function localName(obj, key = 'name') {
  if (!obj) return '';
  const ar = obj[`${key}Ar`];
  return isAr() && ar ? isolateLatin(ar) : obj[key] || ar || '';
}

/** The name in the other language, shown as a quiet second line. */
export function otherName(obj, key = 'name') {
  if (!obj) return '';
  const ar = obj[`${key}Ar`];
  if (!ar || !obj[key]) return '';
  return isAr() ? obj[key] : ar;
}

/** Bilingual name: main line in the visitor's language, the other language underneath. */
export function nameBlock(obj, cls = 'bi-name', key = 'name') {
  const other = otherName(obj, key);
  return `<span class="${cls}">${esc(localName(obj, key))}</span>${other ? `<span class="bi-other">${esc(other)}</span>` : ''}`;
}

/** A dish's details (flavours) in the visitor's language, as a quiet line under its name. */
export function dishDetails(item, cls = 'dish-details') {
  const text = localName(item, 'desc');
  return text ? `<span class="${cls}">${esc(text)}</span>` : '';
}

/** "4 appetizers", "Selection of desserts" (count 0) — in the visitor's language. */
export function choiceLabel(choice) {
  const parts = choiceParts(choice);
  if (!parts) return '';
  return parts.count ? `${parts.count} ${parts.text}` : parts.text;
}

/** "Selection of desserts" / "تشكيلة من الحلويات" for a list included as a whole. */
export function selectionLabel(group) {
  if (isAr() && group.nameAr) return `تشكيلة ${group.nameAr}`;
  return `Selection of ${String(group.name || '').toLowerCase()}`;
}

/** A text from a package's "included" list: a live station's Arabic name, or the dictionary. */
export function localIncluded(text) {
  if (!isAr()) return text;
  const station = cateringList('liveStationMenu').find(
    st => String(st.name || '').toLowerCase() === String(text).toLowerCase()
  );
  return station?.nameAr || t(text);
}

/** The same as choiceLabel, split so the number can be set apart: { count: '4' | '', text }. */
function choiceParts(choice) {
  const group = findGroup(choice.group);
  if (!group) return null;
  const count = Number(choice.count) || 0;
  const ar = isAr() && group.nameAr;
  if (count > 0) return { count: String(count), text: ar ? group.nameAr : String(group.name || '').toLowerCase() };
  return { count: '', text: selectionLabel(group) };
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
    return n ? t('From {price} / person', { price: money(n) }) : '';
  }
  if (typeId === 'stations') {
    const n = lowest(
      cateringList('liveStationMenu').flatMap(s => (s.options || []).filter(o => o.unit !== 'kg').map(o => o.price))
    );
    return n ? t('From {price} / person', { price: money(n) }) : '';
  }
  if (typeId === 'trays') {
    const n = lowest(cateringList('mainCourseTrays').map(tray => tray.price));
    return n ? t('Trays from {price}', { price: money(n) }) : '';
  }
  return '';
}

const optionPrice = opt => t(opt.unit === 'kg' ? '{price} / kg' : '{price} / person', { price: money(opt.price) });

// ---------------------------------------------------------------------------
// Cards and price lists
// ---------------------------------------------------------------------------

/** Package card: photo, name, price per person, what the customer chooses, "Build this package". */
export function eventPackageCard(pkg, { photo = true } = {}) {
  const choices = (pkg.choices || []).map(choiceParts).filter(Boolean);
  const includes = (pkg.includes || []).filter(Boolean);
  const label = `${TYPE_LABELS[pkg.type] || 'Package'} · ${pkg.name}`;
  const inquiry = `Hello Mini Kitchen Catering! I am interested in the ${label} package (${moneyEn(pkg.pricePerPerson)} per person). Could you share availability?`;
  const recommended = isRecommended(pkg);
  const kind = typeLabel(pkg.type);
  const badge = pkg.badge ? t(pkg.badge) : '';
  return `
      <article class="package-card event-package${photo ? '' : ' event-package-plain'}${recommended ? ' is-recommended' : ''}">
        ${recommended ? `<span class="package-ribbon"><i class="fa-solid fa-star" aria-hidden="true"></i> ${t('Recommended')}</span>` : ''}
        ${
          photo
            ? `<div class="package-card-media">
          <img src="${esc(pkg.img)}" data-fallback="" alt="${esc(t('{label} catering buffet', { label: `${kind} · ${localName(pkg)}` }))}" loading="lazy" decoding="async" width="600" height="400" />
          ${badge ? `<span class="package-badge">${esc(badge)}</span>` : ''}
        </div>`
            : ''
        }
        <div class="package-card-body">
          <div class="package-card-head">
            <div>
              <div class="package-card-cat">${esc(kind)}${!photo && badge ? ` · ${esc(badge)}` : ''}</div>
              <h3 class="package-card-title">${nameBlock(pkg)}</h3>
            </div>
            <div class="package-card-price"><span class="package-price-value">${money(pkg.pricePerPerson)}</span><span class="package-price-unit">${t('per person')}</span></div>
          </div>
          ${pkg.note ? `<p class="package-card-sub">${esc(t(pkg.note))}</p>` : ''}
          <div class="package-counts-label">${t('You choose')}</div>
          <ul class="package-counts">
            ${choices.map(c => `<li><span class="package-count${c.count ? '' : ' is-all'}">${c.count ? esc(c.count) : '<i class="fa-solid fa-check" aria-hidden="true"></i>'}</span><span>${esc(c.text)}</span></li>`).join('')}
            ${includes.map(i => `<li class="is-included"><span class="package-count is-all"><i class="fa-solid fa-plus" aria-hidden="true"></i></span><span>${t('<strong>{name}</strong> included', { name: esc(localIncluded(i)) })}</span></li>`).join('')}
          </ul>
          <div class="package-card-footer">
            <button type="button" class="btn btn-primary btn-sm" data-action="builder:start" data-pkg="${esc(pkg.id)}">${t('Build this package')}</button>
            <button type="button" class="btn btn-outline btn-sm" data-action="wa:open" data-brand="catering" data-msg="${esc(inquiry)}">
              <i class="fa-brands fa-whatsapp"></i> ${t('Ask')}
            </button>
          </div>
        </div>
      </article>`;
}

/** Live stations with their options and prices. */
export function stationMenu() {
  const stations = cateringList('liveStationMenu');
  if (stations.length === 0) return `<p class="empty-state">${t('Live stations are coming soon.')}</p>`;
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
  if (trays.length === 0) return `<p class="empty-state">${t('Trays are coming soon.')}</p>`;
  return `
          <ul class="price-list price-list-two">
            ${trays
              .map(
                tray => `
            <li class="price-row">
              <div class="price-row-name">${nameBlock(tray)}${tray.serves ? `<span class="price-row-meta">${esc(servesText(tray.serves))}</span>` : ''}</div>
              <strong class="price-row-price">${money(tray.price)}</strong>
            </li>`
              )
              .join('')}
          </ul>`;
}

/** Mini bites ("La2mi La2mi") price list. */
export function bitesMenu() {
  const bites = cateringList('miniBites');
  if (bites.length === 0) return `<p class="empty-state">${t('Mini bites are coming soon.')}</p>`;
  return `
          <ul class="price-list price-list-two">
            ${bites
              .map(
                b => `
            <li class="price-row">
              <div class="price-row-name">${nameBlock(b)}${b.desc ? `<span class="price-row-meta">${esc(t(b.desc))}</span>` : ''}</div>
              <strong class="price-row-price">${money(b.price)}${b.unit ? `<span class="price-row-unit"> / ${esc(t(b.unit))}</span>` : ''}</strong>
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

/** One pill per package ("Classic 4"), or "Included" when every package includes a selection. */
function countPills(counts) {
  if (counts.every(c => c.count === 0))
    return `<span class="menu-pill menu-pill-all">${t('Included in every package')}</span>`;
  return counts
    .map(c => `<span class="menu-pill">${esc(c.name)} <strong>${c.count ? ltr(c.count) : '—'}</strong></span>`)
    .join('');
}

/** "Choose 4–8" over a course, from the smallest to the largest count among the packages. */
function chooseLine(counts) {
  const n = counts.map(c => c.count).filter(Boolean);
  if (!n.length) return '';
  const lo = Math.min(...n);
  const hi = Math.max(...n);
  return lo === hi ? t('Choose {n}', { n: ltr(lo) }) : t('Choose {lo}–{hi}', { lo: ltr(lo), hi: ltr(hi) });
}

/**
 * One dish as a menu-card row: the visitor's language at the start, the other language at the end
 * (English left and Arabic right, like the printed flyers), with any flavours underneath.
 */
function menuDish(item) {
  const other = otherName(item);
  const otherLang = isAr() ? 'en' : 'ar';
  return `
                <li class="menu-dish-row">
                  <div class="menu-dish-line">
                    <span class="menu-dish-name">${esc(localName(item))}</span>
                    ${other ? `<span class="menu-dish-other" lang="${otherLang}" dir="${otherLang === 'ar' ? 'rtl' : 'ltr'}">${esc(other)}</span>` : ''}
                  </div>
                  ${dishDetails(item)}
                </li>`;
}

const COLLAPSE_AFTER = 8;

function menuCourse({ group, counts }) {
  const items = groupItems(group);
  const other = otherName(group);
  const long = items.length > COLLAPSE_AFTER;
  return `
            <section class="menu-section${long ? ' is-long' : ''}" id="menu-${esc(group.id)}" aria-labelledby="menu-${esc(group.id)}-title">
              <header class="menu-section-head">
                <div class="menu-section-names">
                  <h4 class="menu-section-title" id="menu-${esc(group.id)}-title" tabindex="-1">${esc(localName(group))}</h4>
                  ${other ? `<span class="menu-section-other" lang="${isAr() ? 'en' : 'ar'}">${esc(other)}</span>` : ''}
                </div>
                <div class="menu-section-meta">
                  ${chooseLine(counts) ? `<span class="menu-choose">${chooseLine(counts)}</span>` : ''}
                  <div class="menu-pills">${countPills(counts)}</div>
                </div>
              </header>
              ${
                items.length
                  ? `<ul class="menu-dishes${items.length > 6 ? ' menu-dishes-2' : ''}">${items.map(menuDish).join('')}</ul>
              ${long ? `<button type="button" class="menu-more" data-action="menu:more" aria-expanded="false" data-label="${esc(t('Show all {n} dishes', { n: items.length }))}">${t('Show all {n} dishes', { n: ltr(items.length) })}</button>` : ''}`
                  : `<p class="menu-course-empty">${t('Our chef shares the current choices with you when you send your request.')}</p>`
              }
            </section>`;
}

const MENU_KINDS = [
  { type: 'buffet', label: 'Event buffets' },
  { type: 'birthday', label: 'Birthday Minis' }
];

/**
 * The catering menu without prices, laid out like a printed bilingual menu card: a switch between
 * buffet and Birthday Mini menus, a row of course links, then each course with its dishes.
 */
export function cateringMenuBook() {
  const kinds = MENU_KINDS.map(k => ({ ...k, courses: menuGroups(k.type) })).filter(k => k.courses.length);
  if (kinds.length === 0) return `<p class="empty-state">${t('Our menu is coming soon.')}</p>`;
  const current = kinds.find(k => k.type === state.menuBookType) || kinds[0];
  return `
          <div class="menu-card">
            ${
              kinds.length > 1
                ? `<div class="menu-switch" role="group" aria-label="${esc(t('Which menu'))}">
              ${kinds
                .map(
                  k =>
                    `<button type="button" class="menu-switch-btn${k === current ? ' active' : ''}" data-action="menu:kind" data-kind="${k.type}" aria-pressed="${k === current}">${t(k.label)}</button>`
                )
                .join('')}
            </div>`
                : ''
            }
            <nav class="menu-index" aria-label="${esc(t('Courses'))}">
              ${current.courses
                .map(
                  ({ group }) =>
                    `<button type="button" class="menu-index-link" data-action="menu:jump" data-target="menu-${esc(group.id)}">${esc(localName(group))}<span class="menu-index-count">${ltr(groupItems(group).length || '–')}</span></button>`
                )
                .join('')}
            </nav>
            <div class="menu-sheet">${current.courses.map(menuCourse).join('')}
            </div>
          </div>`;
}

/** Extras offered on request (bar, plate service, waiters, chef). */
export function extrasNote() {
  const extras = cateringList('cateringExtras');
  if (extras.length === 0) return '';
  return `<p class="extras-note"><strong>${t('Extras on request:')}</strong> ${extras.map(e => esc(localName(e))).join(' · ')}</p>`;
}

// ---------------------------------------------------------------------------
// How it works and frequently asked questions (built only from the owner's real data)
// ---------------------------------------------------------------------------

/** Three honest steps from package to confirmation. */
export function howItWorks({ compact = false } = {}) {
  const steps = [
    {
      icon: 'fa-list-check',
      title: t('Choose a package'),
      text: t(
        'Event buffets and Birthday Minis are priced per person — or skip the package and pick stations, trays or mini bites.'
      )
    },
    {
      icon: 'fa-utensils',
      title: t('Build your menu'),
      text: t('Pick your dishes, add live stations, trays and extras, and watch the estimate update as you go.')
    },
    {
      icon: 'fa-whatsapp',
      brand: true,
      title: t('Send it on WhatsApp'),
      text: t('Your request arrives with our catering team, who confirm the menu, date and final price with you.')
    }
  ];
  return `
          <ol class="how-steps${compact ? ' how-steps-compact' : ''}">
            ${steps
              .map(
                (st, i) => `
            <li class="how-step">
              <span class="how-step-icon" aria-hidden="true"><i class="${st.brand ? 'fa-brands' : 'fa-solid'} ${st.icon}"></i></span>
              <span class="how-step-num">${t('Step {n}', { n: i + 1 })}</span>
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
  const facts = {
    catering: contacts.catering || {},
    location,
    trays: cateringList('mainCourseTrays'),
    extras: cateringList('cateringExtras').map(e => localName(e)),
    kgStations: cateringList('liveStationMenu').filter(st => (st.options || []).some(o => o.unit === 'kg')),
    buffetFrom: fromPriceLabel('buffet'),
    birthdayFrom: fromPriceLabel('birthday')
  };
  facts.serves = facts.trays.find(tray => tray.serves)?.serves || '';
  return isAr() ? arabicFaq(facts) : englishFaq(facts);
}

function englishFaq({ catering, location, trays, serves, extras, kgStations, buffetFrom, birthdayFrom }) {
  const items = [];
  items.push({
    q: 'How are your catering prices worked out?',
    a: `Event buffets and Birthday Minis are priced per person${buffetFrom || birthdayFrom ? ` (buffets ${buffetFrom.toLowerCase() || 'per person'}, Birthday Minis ${birthdayFrom.toLowerCase() || 'per person'})` : ''}, so your total is the package price times your number of guests. Live stations are added per person${
      kgStations.length
        ? ` (the ${kgStations
            .map(st =>
              String(st.name || '')
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

/** The same answers written for Arabic readers (not word for word), from the same facts. */
function arabicFaq({ catering, location, trays, serves, extras, kgStations, buffetFrom, birthdayFrom }) {
  const items = [];
  const fromParts = [buffetFrom && `البوفيهات ${buffetFrom}`, birthdayFrom && `باقات أعياد الميلاد ${birthdayFrom}`]
    .filter(Boolean)
    .join('، و');
  const kgNames = kgStations.map(st => localName(st)).join(' و');
  items.push({
    q: 'كيف تُحتسب أسعار خدمات الضيافة لديكم؟',
    a: `تُسعَّر بوفيهات المناسبات وباقات ميني لأعياد الميلاد للشخص الواحد${fromParts ? ` (${fromParts})` : ''}، فيكون المجموع سعر الباقة مضروبًا بعدد الضيوف. وتُضاف المحطات المباشرة بسعر للشخص الواحد${
      kgStations.length ? `، باستثناء ${kgNames}، ${kgStations.length > 1 ? 'فتُسعَّران' : 'فتُسعَّر'} بالكيلو` : ''
    }. تعرض أداة تصميم الباقة تقديرًا فوريًا للكلفة، ويؤكّد فريقنا السعر النهائي معكم.`
  });
  if (trays.length) {
    const from = fromPriceLabel('trays');
    items.push({
      q: 'كم شخصًا تكفي صينية الطبق الرئيسي؟',
      a: `${serves ? `${servesText(serves).replace(/^تكفي/, 'تكفي كل صينية')}.` : 'تُسعَّر كل صينية على حدة.'} ${from ? `${from}، ` : ''}ويمكن طلبها وحدها أو إضافتها إلى أي باقة.`
    });
  }
  items.push({
    q: 'هل يمكنني اختيار أطباق باقتي؟',
    a: 'نعم. تحدّد كل باقة عدد الأطباق التي تختارونها من كل قائمة، كالمقبلات والسلطات والأطباق الرئيسية الساخنة. وإذا لم تكن إحدى القوائم منشورة على الموقع بعد، يراجع فريقنا الخيارات معكم عبر واتساب.'
  });
  if (extras.length) {
    items.push({
      q: 'هل توفّرون طاقم خدمة أو ركنًا للمشروبات؟',
      a: `نعم، عند الطلب: ${extras.join('، ')}. اختاروا ما تحتاجونه من الخدمات الإضافية في أداة تصميم الباقة، ونحدّد سعرها ضمن عرض السعر.`
    });
  }
  items.push({
    q: 'كيف أحجز، ومتى يتأكّد موعد مناسبتي؟',
    a: `صمّموا باقتكم واضغطوا «أرسلوا طلبي عبر واتساب»، فتصلنا رسالة تتضمّن كل اختياراتكم. لا يُحجز أي موعد ولا يُدفع أي مبلغ في هذه المرحلة: يردّ عليكم فريق الضيافة لتأكيد التوفّر والقائمة والسعر.${catering.phoneDisplay ? ` ويمكنكم أيضًا الاتصال بقسم الضيافة أو مراسلته عبر واتساب على الرقم ${catering.phoneDisplay}.` : ''}`
  });
  if (location.short) {
    items.push({
      q: 'أين يقع مطبخكم؟',
      a: `يقع مطبخنا في ${t(location.short)}${location.hours ? `، ونستقبلكم ${t(location.hours)}` : ''}. أخبرونا بمكان مناسبتكم عند إرسال الطلب، ونؤكّد معكم التفاصيل.`
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
