// "Build your package": the catering request form on the home and packages pages (#planEventSection).
// The visitor picks a package and a guest count, chooses exactly N dishes per choice group, adds live
// stations, trays, mini bites and extras, and sees a running estimate. Sending records a
// catering_quote for the Back Office and opens WhatsApp with every selection listed.
//
// Choices, quantities and typed text live in state.builder, so re-rendering (package change,
// language switch) keeps them. Checkbox and quantity changes update the page in place so focus
// stays where the visitor is.

import { registerActions } from '../shared/actions.js';
import { esc } from '../shared/dom.js';
import { state } from './state.js';
import { cateringList } from './config.js';
import { lbp } from './format.js';
import { allocateOrderId, recordOrder } from './orders.js';
import { openWhatsApp } from './whatsapp.js';
import { navigateToPage } from './navigation.js';
import { showToast } from './toast.js';
import {
  TYPE_LABELS,
  findGroup,
  findPackage,
  groupItems,
  localName,
  money,
  nameBlock,
  packages,
  price
} from './catering-offer.js';

const MAX_GUESTS = 2000;
const MAX_QTY = 999;
const b = () => state.builder;

const clampInt = (value, min, max) => Math.min(max, Math.max(min, Math.floor(Number(value) || 0)));
const pkgLabel = pkg => `${TYPE_LABELS[pkg.type] || 'Package'} · ${pkg.name}`;
const picksFor = groupId => b().picks[groupId] || [];
const stationKey = (stationId, idx) => `${stationId}:${idx}`;

/** Choice groups of the chosen package with what the visitor has to pick. */
function packageChoices(pkg) {
  if (!pkg) return [];
  return (pkg.choices || [])
    .map(choice => {
      const group = findGroup(choice.group);
      if (!group) return null;
      const items = groupItems(group);
      const count = Math.max(0, Number(choice.count) || 0);
      // A group the owner has not filled in yet is confirmed by phone, so nothing is required.
      return { group, items, count, required: count > 0 ? Math.min(count, items.length) : 0 };
    })
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Estimate
// ---------------------------------------------------------------------------

/** Every priced line of the request, in the order they are shown and sent. */
function estimateLines() {
  const s = b();
  const guests = s.guests;
  const lines = [];
  const pkg = findPackage(s.pkgId);
  if (pkg) {
    lines.push({
      kind: 'package',
      id: pkg.id,
      label: `${pkgLabel(pkg)} · ${money(pkg.pricePerPerson)} × ${guests} guests`,
      qty: 1,
      unit: price(pkg.pricePerPerson) * guests
    });
  }
  for (const st of cateringList('liveStationMenu')) {
    (st.options || []).forEach((opt, idx) => {
      if (opt.unit === 'kg') {
        const kg = Number(s.kg[stationKey(st.id, idx)]) || 0;
        if (kg > 0) {
          lines.push({
            kind: 'station',
            id: st.id,
            label: `${st.name} — ${opt.label} · ${money(opt.price)} / kg`,
            qty: kg,
            unit: price(opt.price)
          });
        }
      } else if (String(s.stationOpt[st.id]) === String(idx)) {
        lines.push({
          kind: 'station',
          id: st.id,
          label: `${st.name} — ${opt.label} · ${money(opt.price)} × ${guests} guests`,
          qty: 1,
          unit: price(opt.price) * guests
        });
      }
    });
  }
  for (const tray of cateringList('mainCourseTrays')) {
    const qty = Number(s.trays[tray.id]) || 0;
    if (qty > 0) lines.push({ kind: 'tray', id: tray.id, label: `Tray: ${tray.name}`, qty, unit: price(tray.price) });
  }
  for (const bite of cateringList('miniBites')) {
    const qty = Number(s.bites[bite.id]) || 0;
    if (qty > 0) {
      const unit = bite.unit ? ` (${bite.unit})` : '';
      lines.push({ kind: 'bite', id: bite.id, label: `Mini bites: ${bite.name}${unit}`, qty, unit: price(bite.price) });
    }
  }
  return lines;
}

const lineTotal = line => line.qty * line.unit;
const estimateTotal = lines => lines.reduce((sum, l) => sum + lineTotal(l), 0);
const chosenExtras = () => cateringList('cateringExtras').filter(e => b().extras.includes(e.id));

function summaryHtml() {
  const lines = estimateLines();
  const total = estimateTotal(lines);
  const extras = chosenExtras();
  return `
              <ul class="builder-lines">
                ${
                  lines.length
                    ? lines
                        .map(
                          l => `
                <li><span>${l.qty > 1 ? `${l.qty} × ` : ''}${esc(l.label)}</span><strong>${money(lineTotal(l))}</strong></li>`
                        )
                        .join('')
                    : '<li class="builder-lines-empty">Choose a package, a station, trays or mini bites to see an estimate.</li>'
                }
                ${extras.map(e => `<li><span>${esc(localName(e))}</span><em>On request</em></li>`).join('')}
              </ul>
              <div class="builder-total-label">Estimated total</div>
              <div class="builder-total" id="builderTotal">${money(total)}</div>
              <div class="builder-total-lbp">${total > 0 ? lbp(total) : ''}</div>
              <p class="builder-fineprint">${extras.length ? 'Extras are priced on request. ' : ''}Our team confirms the final menu and price with you on WhatsApp.</p>`;
}

function refreshSummary() {
  const el = document.getElementById('builderSummary');
  if (el) el.innerHTML = summaryHtml();
  refreshErrors();
}

/** Once the visitor has tried to send, keep the error list in step with what they fix. */
function refreshErrors() {
  if (document.getElementById('builderErrors')?.innerHTML) showErrors(validate(), { scroll: false });
}

// ---------------------------------------------------------------------------
// Form sections
// ---------------------------------------------------------------------------

function packageSelect() {
  const option = p =>
    `<option value="${esc(p.id)}" ${b().pkgId === p.id ? 'selected' : ''}>${esc(localName(p))} — ${money(p.pricePerPerson)} / person</option>`;
  const group = (type, label) => {
    const list = packages(type);
    return list.length ? `<optgroup label="${label}">${list.map(option).join('')}</optgroup>` : '';
  };
  return `
                <select id="pbPackage" class="form-control" data-on-change="builder:package">
                  <option value="" ${b().pkgId ? '' : 'selected'}>No package — stations, trays or mini bites only</option>
                  ${group('buffet', 'Event buffets (weddings &amp; occasions)')}
                  ${group('birthday', 'Birthday Mini')}
                </select>`;
}

function choiceGroupHtml({ group, items, count, required }) {
  const title = localName(group);
  if (count === 0) {
    return `
                <div class="builder-group builder-group-info">
                  <div class="builder-group-head"><span class="builder-group-title">${esc(state.lang === 'ar' ? `تشكيلة ${title}` : `Selection of ${title.toLowerCase()}`)}</span><span class="builder-tag">Included</span></div>
                  ${items.length ? `<p class="builder-group-note">${items.map(i => esc(localName(i))).join(' · ')}</p>` : ''}
                </div>`;
  }
  if (items.length === 0) {
    return `
                <div class="builder-group builder-group-info">
                  <div class="builder-group-head"><span class="builder-group-title">${count} × ${esc(title)}</span><span class="builder-tag">To confirm</span></div>
                  <p class="builder-group-note">Our team will confirm the ${esc(title.toLowerCase())} options with you. Add any wishes under “Your preferences”.</p>
                </div>`;
  }
  const picks = picksFor(group.id);
  const full = picks.length >= required;
  return `
                <fieldset class="builder-group" data-group="${esc(group.id)}" data-required="${required}">
                  <legend class="builder-group-head">
                    <span class="builder-group-title">${esc(title)} — choose ${required}</span>
                    <span class="builder-counter${full ? ' done' : ''}" data-counter="${esc(group.id)}" aria-live="polite">${picks.length} of ${required} chosen</span>
                  </legend>
                  <div class="builder-checks">
                    ${items
                      .map(item => {
                        const checked = picks.includes(item.name);
                        return `
                    <label class="builder-check${checked ? ' checked' : ''}">
                      <input type="checkbox" value="${esc(item.name)}" data-on-change="builder:pick" data-group="${esc(group.id)}" ${checked ? 'checked' : ''} ${!checked && full ? 'disabled' : ''} aria-describedby="pbHint-${esc(group.id)}" />
                      <span>${nameBlock(item, 'bi-name')}</span>
                    </label>`;
                      })
                      .join('')}
                  </div>
                  <p class="builder-group-hint" id="pbHint-${esc(group.id)}" data-hint="${esc(group.id)}"></p>
                </fieldset>`;
}

function packageSection() {
  const pkg = findPackage(b().pkgId);
  if (!pkg) {
    return `<p class="builder-help">Pick a package above to choose your dishes, or skip it and add stations, trays or mini bites below.</p>`;
  }
  const choices = packageChoices(pkg);
  const hasOpenGroups = choices.some(c => c.count > 0 && c.items.length === 0);
  const includes = (pkg.includes || []).filter(Boolean);
  return `
              ${choices.map(choiceGroupHtml).join('')}
              ${
                includes.length
                  ? `<div class="builder-group builder-group-info"><div class="builder-group-head"><span class="builder-group-title">${includes.map(esc).join(' · ')}</span><span class="builder-tag">Included</span></div></div>`
                  : ''
              }
              ${
                hasOpenGroups
                  ? `<div class="form-group full">
                <label for="pbPrefs">Your preferences (optional)</label>
                <textarea id="pbPrefs" class="form-control" rows="2" data-on-input="builder:field" data-field="prefs" placeholder="Dishes you love, allergies, vegetarian guests…">${esc(b().prefs)}</textarea>
              </div>`
                  : ''
              }`;
}

function stationsSection() {
  const stations = cateringList('liveStationMenu');
  if (stations.length === 0) return '';
  return `
            <div class="builder-step">
              <h4 class="builder-step-title"><span>3</span> Live stations <small>optional</small></h4>
              <div class="builder-rows">
                ${stations
                  .map(st => {
                    const options = st.options || [];
                    const perPerson = options.map((o, idx) => ({ o, idx })).filter(x => x.o.unit !== 'kg');
                    const perKg = options.map((o, idx) => ({ o, idx })).filter(x => x.o.unit === 'kg');
                    const selectId = `pbStation-${st.id}`;
                    return `
                <div class="builder-row">
                  <div class="builder-row-name">${nameBlock(st)}</div>
                  <div class="builder-row-controls">
                    ${
                      perPerson.length
                        ? `<select id="${esc(selectId)}" class="form-control form-control-sm" data-on-change="builder:station" data-station="${esc(st.id)}" aria-label="${esc(st.name)}">
                      <option value="">No</option>
                      ${perPerson
                        .map(
                          ({ o, idx }) =>
                            `<option value="${idx}" ${String(b().stationOpt[st.id]) === String(idx) ? 'selected' : ''}>${esc(localName(o, 'label'))} — ${money(o.price)} / person</option>`
                        )
                        .join('')}
                    </select>`
                        : ''
                    }
                    ${perKg
                      .map(
                        ({ o, idx }) => `
                    <label class="builder-qty">
                      <span>${esc(localName(o, 'label'))} · ${money(o.price)} / kg</span>
                      <input type="number" class="form-control form-control-sm" min="0" max="${MAX_QTY}" step="1" inputmode="numeric" value="${Number(b().kg[stationKey(st.id, idx)]) || ''}" placeholder="0" data-on-input="builder:kg" data-key="${esc(stationKey(st.id, idx))}" aria-label="${esc(`${st.name} — ${o.label}, kg`)}" />
                      <span class="builder-qty-unit">kg</span>
                    </label>`
                      )
                      .join('')}
                  </div>
                </div>`;
                  })
                  .join('')}
              </div>
            </div>`;
}

function qtyList(list, bucket, action, meta) {
  return list
    .map(
      item => `
                  <label class="builder-row builder-row-qty">
                    <span class="builder-row-name">${nameBlock(item)}<span class="price-row-meta">${esc(meta(item))}</span></span>
                    <input type="number" class="form-control form-control-sm builder-qty-input" min="0" max="${MAX_QTY}" step="1" inputmode="numeric" value="${Number(b()[bucket][item.id]) || ''}" placeholder="0" data-on-input="${action}" data-id="${esc(item.id)}" aria-label="${esc(`${item.name}, quantity`)}" />
                  </label>`
    )
    .join('');
}

function traysAndBitesSection() {
  const trays = cateringList('mainCourseTrays');
  const bites = cateringList('miniBites');
  if (trays.length === 0 && bites.length === 0) return '';
  const trayCount = Object.values(b().trays).filter(q => q > 0).length;
  const biteCount = Object.values(b().bites).filter(q => q > 0).length;
  return `
            <div class="builder-step">
              <h4 class="builder-step-title"><span>4</span> Trays &amp; mini bites <small>optional</small></h4>
              ${
                trays.length
                  ? `<details class="builder-details" ${trayCount ? 'open' : ''}>
                <summary>Main course trays <small>each serves 30–40 people</small></summary>
                <div class="builder-rows">${qtyList(trays, 'trays', 'builder:tray', t => `${money(t.price)} a tray`)}</div>
              </details>`
                  : ''
              }
              ${
                bites.length
                  ? `<details class="builder-details" ${biteCount ? 'open' : ''}>
                <summary>Mini bites — La2mi La2mi</summary>
                <div class="builder-rows">${qtyList(bites, 'bites', 'builder:bite', x => `${money(x.price)}${x.unit ? ` / ${x.unit}` : ''}`)}</div>
              </details>`
                  : ''
              }
            </div>`;
}

function extrasSection() {
  const extras = cateringList('cateringExtras');
  if (extras.length === 0) return '';
  return `
            <div class="builder-step">
              <h4 class="builder-step-title"><span>5</span> Extras <small>priced on request</small></h4>
              <div class="builder-checks builder-checks-inline">
                ${extras
                  .map(
                    e => `
                <label class="builder-check${b().extras.includes(e.id) ? ' checked' : ''}">
                  <input type="checkbox" data-on-change="builder:extra" data-id="${esc(e.id)}" ${b().extras.includes(e.id) ? 'checked' : ''} />
                  <span>${nameBlock(e)}</span>
                </label>`
                  )
                  .join('')}
              </div>
            </div>`;
}

const textField = (id, field, label, { type = 'text', placeholder = '', required = false, full = false } = {}) => `
                <div class="form-group${full ? ' full' : ''}">
                  <label for="${id}">${label}${required ? ' *' : ''}</label>
                  <input type="${type}" id="${id}" class="form-control" value="${esc(b()[field])}" placeholder="${esc(placeholder)}" data-on-input="builder:field" data-field="${field}" ${required ? 'aria-required="true"' : ''} />
                </div>`;

function builderBody() {
  const s = b();
  return `
          <form class="builder" data-on-submit="builder:submit" novalidate>
            <div class="builder-main">
              <div class="builder-step">
                <h4 class="builder-step-title"><span>1</span> Package &amp; guests</h4>
                <div class="form-grid">
                  <div class="form-group full">
                    <label for="pbPackage">Package</label>
                    ${packageSelect()}
                  </div>
                  <div class="form-group">
                    <label for="pbGuests">Number of guests *</label>
                    <input type="number" id="pbGuests" class="form-control" min="1" max="${MAX_GUESTS}" step="1" inputmode="numeric" value="${s.guests}" data-on-input="builder:guests" data-on-change="builder:guests-commit" />
                  </div>
                  ${textField('pbDate', 'date', 'Event date', { type: 'date' })}
                </div>
              </div>

              <div class="builder-step" id="builderChoices">
                <h4 class="builder-step-title"><span>2</span> Your choices</h4>
                ${packageSection()}
              </div>

              ${stationsSection()}
              ${traysAndBitesSection()}
              ${extrasSection()}

              <div class="builder-step">
                <h4 class="builder-step-title"><span>6</span> Your details</h4>
                <div class="form-grid">
                  ${textField('pbName', 'name', 'Your name', { required: true, placeholder: 'e.g. Nadine Karam' })}
                  ${textField('pbPhone', 'phone', 'Phone / WhatsApp', { type: 'tel', required: true, placeholder: 'e.g. 03 123 456' })}
                  ${textField('pbLocation', 'location', 'Location / venue', { full: true, placeholder: 'e.g. Aley, Beirut, Bhamdoun' })}
                  <div class="form-group full">
                    <label for="pbNotes">Notes</label>
                    <textarea id="pbNotes" class="form-control" rows="2" data-on-input="builder:field" data-field="notes" placeholder="Timing, set-up, anything else we should know">${esc(s.notes)}</textarea>
                  </div>
                </div>
              </div>
            </div>

            <aside class="builder-summary" aria-label="Your estimate">
              <span class="eyebrow">Your estimate</span>
              <div id="builderSummary">${summaryHtml()}</div>
              <div class="builder-errors" id="builderErrors" role="alert"></div>
              <button type="submit" class="btn btn-whatsapp btn-block">
                <i class="fa-brands fa-whatsapp"></i> Send my request on WhatsApp
              </button>
            </aside>
          </form>`;
}

/** The whole "Build your package" section (id planEventSection, the target of every "Build" button). */
export function packageBuilderSection({ ivory = true } = {}) {
  return `
      <section class="section-pad${ivory ? ' section-ivory' : ''}" id="planEventSection">
        <div class="container">
          <header class="section-header">
            <span class="eyebrow">Build your package</span>
            <h2 class="section-title">Plan your event with us</h2>
            <p class="section-desc">Choose a package and your dishes, add live stations, trays or mini bites, and send it to our catering team on WhatsApp.</p>
          </header>
          <div id="pkgBuilder">${builderBody()}</div>
        </div>
      </section>`;
}

function rerenderBuilder() {
  const el = document.getElementById('pkgBuilder');
  if (el) el.innerHTML = builderBody();
}

// ---------------------------------------------------------------------------
// Validation, message and submit
// ---------------------------------------------------------------------------

function validate() {
  const s = b();
  const errors = [];
  if (!(s.guests >= 1)) errors.push({ field: 'pbGuests', text: 'Enter the number of guests.' });
  const pkg = findPackage(s.pkgId);
  for (const c of packageChoices(pkg)) {
    if (c.required > 0 && picksFor(c.group.id).length !== c.required) {
      errors.push({
        field: `group:${c.group.id}`,
        text: `Choose ${c.required} ${String(c.group.name).toLowerCase()} (${picksFor(c.group.id).length} chosen).`
      });
    }
  }
  if (!pkg && estimateLines().length === 0 && s.extras.length === 0) {
    errors.push({ field: 'pbPackage', text: 'Choose a package, or add a station, trays or mini bites.' });
  }
  if (!s.name.trim()) errors.push({ field: 'pbName', text: 'Enter your name.' });
  if (s.phone.replace(/\D/g, '').length < 7)
    errors.push({ field: 'pbPhone', text: 'Enter a phone number we can reach on WhatsApp.' });
  return errors;
}

function showErrors(errors, { scroll = true } = {}) {
  const box = document.getElementById('builderErrors');
  if (box) {
    box.innerHTML = errors.length
      ? `<p>Please check:</p><ul>${errors.map(e => `<li>${esc(e.text)}</li>`).join('')}</ul>`
      : '';
  }
  document.querySelectorAll('#pkgBuilder [aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
  document.querySelectorAll('#pkgBuilder .builder-group.invalid').forEach(el => el.classList.remove('invalid'));
  for (const e of errors) {
    if (e.field.startsWith('group:')) {
      document.querySelector(`#pkgBuilder [data-group="${CSS.escape(e.field.slice(6))}"]`)?.classList.add('invalid');
    } else {
      document.getElementById(e.field)?.setAttribute('aria-invalid', 'true');
    }
  }
  const first = errors[0];
  if (!first || !scroll) return;
  const target = first.field.startsWith('group:')
    ? document.querySelector(`#pkgBuilder [data-group="${CSS.escape(first.field.slice(6))}"]`)
    : document.getElementById(first.field);
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (target && target.focus && !first.field.startsWith('group:')) target.focus({ preventScroll: true });
}

/** One order line per priced item, plus one line per choice group listing the picked dishes. */
function orderItems(pkg, lines) {
  const items = [];
  for (const l of lines) {
    items.push({ id: l.id, title: l.label, qty: l.qty, priceValue: l.unit, modifiers: [], note: '' });
    if (l.kind === 'package') {
      for (const c of packageChoices(pkg)) {
        const name = String(c.group.name);
        let title;
        let modifiers = [];
        if (c.count === 0) {
          title = `Selection of ${name.toLowerCase()} — included`;
        } else if (c.items.length === 0) {
          title = `${c.count} ${name.toLowerCase()} — options to confirm`;
        } else {
          title = `${name} (${c.required})`;
          modifiers = picksFor(c.group.id);
        }
        items.push({ id: c.group.id, title, qty: 1, priceValue: 0, modifiers, note: '' });
      }
      for (const inc of (pkg.includes || []).filter(Boolean)) {
        items.push({ id: 'included', title: `${inc} — included`, qty: 1, priceValue: 0, modifiers: [], note: '' });
      }
    }
  }
  for (const e of chosenExtras()) {
    items.push({
      id: e.id,
      title: `Extra: ${e.name} (priced on request)`,
      qty: 1,
      priceValue: 0,
      modifiers: [],
      note: ''
    });
  }
  return items;
}

function whatsappMessage(quoteId, pkg, lines, total) {
  const s = b();
  const out = [
    `*CATERING REQUEST — MINI KITCHEN*`,
    `*Reference:* #${quoteId}`,
    `-----------------------------------------`,
    `*Name:* ${s.name.trim()}`,
    `*Phone:* ${s.phone.trim()}`,
    `*Event date:* ${s.date || 'To confirm'}`,
    `*Location:* ${s.location.trim() || 'To confirm'}`,
    `*Guests:* ${s.guests}`,
    `*Package:* ${pkg ? `${pkgLabel(pkg)} (${money(pkg.pricePerPerson)} per person)` : 'No package'}`
  ];
  for (const c of packageChoices(pkg)) {
    const name = String(c.group.name);
    if (c.count === 0) out.push(`• Selection of ${name.toLowerCase()} — included`);
    else if (c.items.length === 0) out.push(`• ${c.count} ${name.toLowerCase()} — options to confirm`);
    else out.push(`• ${name}: ${picksFor(c.group.id).join(', ')}`);
  }
  for (const inc of (pkg?.includes || []).filter(Boolean)) out.push(`• ${inc} — included`);
  if (s.prefs.trim() && pkg) out.push(`*Preferences:* ${s.prefs.trim()}`);

  const extraLines = lines.filter(l => l.kind !== 'package');
  if (extraLines.length) {
    out.push(`-----------------------------------------`, `*Added:*`);
    for (const l of extraLines) out.push(`• ${l.qty > 1 ? `${l.qty} × ` : ''}${l.label} = ${money(lineTotal(l))}`);
  }
  const extras = chosenExtras();
  if (extras.length) out.push(`*Extras (priced on request):* ${extras.map(e => e.name).join(', ')}`);
  if (s.notes.trim()) out.push(`*Notes:* ${s.notes.trim()}`);
  out.push(
    `-----------------------------------------`,
    `*Estimated total:* ${money(total)}${extras.length ? ' + extras on request' : ''}`,
    `Please confirm availability and the final quotation. Thank you!`
  );
  return out.join('\n');
}

function submitBuilder() {
  const errors = validate();
  showErrors(errors);
  if (errors.length) return;

  const s = b();
  const pkg = findPackage(s.pkgId);
  const lines = estimateLines();
  const total = estimateTotal(lines);
  const quoteId = allocateOrderId();
  const msg = whatsappMessage(quoteId, pkg, lines, total);
  const notes = [pkg && s.prefs.trim() ? `Preferences: ${s.prefs.trim()}` : '', s.notes.trim()]
    .filter(Boolean)
    .join('\n');

  recordOrder({
    id: quoteId,
    type: 'catering_quote',
    brand: 'catering',
    customerName: s.name.trim(),
    customerPhone: s.phone.trim(),
    address: s.location.trim(),
    eventType: pkg ? TYPE_LABELS[pkg.type] || 'Catering' : 'Catering — stations, trays & bites',
    eventDate: s.date || 'To confirm',
    guests: s.guests,
    packageSelected: pkg ? `${pkgLabel(pkg)} (${money(pkg.pricePerPerson)}/person)` : 'No package',
    notes,
    items: orderItems(pkg, lines),
    totalUsd: total,
    staffNotes: 'Sent from the website package builder',
    whatsappText: msg
  });

  showToast(`Request #${quoteId} saved — opening WhatsApp…`);
  openWhatsApp('catering', msg, true);
}

// ---------------------------------------------------------------------------
// In-place updates
// ---------------------------------------------------------------------------

function onPick(el) {
  const group = el.dataset.group;
  const fieldset = el.closest('fieldset[data-group]');
  const required = Number(fieldset?.dataset.required) || 0;
  const picks = new Set(picksFor(group));
  const hint = fieldset?.querySelector('[data-hint]');
  if (el.checked) {
    if (picks.size >= required) {
      // Over-selection: undo the tick and say why.
      el.checked = false;
      if (hint) hint.textContent = `You can choose ${required}. Untick one to change your choice.`;
      return;
    }
    picks.add(el.value);
  } else {
    picks.delete(el.value);
  }
  b().picks[group] = [...picks];
  if (hint) hint.textContent = '';

  const full = picks.size >= required;
  fieldset?.querySelectorAll('input[type="checkbox"]').forEach(box => {
    box.disabled = !box.checked && full;
    box.closest('.builder-check')?.classList.toggle('checked', box.checked);
  });
  const counter = fieldset?.querySelector('[data-counter]');
  if (counter) {
    counter.textContent = `${picks.size} of ${required} chosen`;
    counter.classList.toggle('done', full);
  }
  refreshErrors();
}

/** "Build this package" / "Add to your request": preselect, then scroll to the builder on this page or home. */
function startBuilder(el) {
  const pkgId = el.dataset.pkg;
  if (pkgId !== undefined && findPackage(pkgId) && b().pkgId !== pkgId) {
    b().pkgId = pkgId;
    b().picks = {};
  }
  if (document.getElementById('pkgBuilder')) {
    rerenderBuilder();
    document.getElementById('planEventSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    navigateToPage('catering', 'planEventSection');
  }
}

registerActions({
  'builder:start': startBuilder,
  'builder:package': el => {
    b().pkgId = el.value;
    b().picks = {};
    rerenderBuilder();
    document.getElementById('pbPackage')?.focus();
  },
  'builder:guests': el => {
    b().guests = clampInt(el.value, 0, MAX_GUESTS);
    refreshSummary();
  },
  'builder:guests-commit': el => {
    b().guests = clampInt(el.value, 1, MAX_GUESTS);
    el.value = b().guests;
    refreshSummary();
  },
  'builder:pick': onPick,
  'builder:station': el => {
    if (el.value === '') delete b().stationOpt[el.dataset.station];
    else b().stationOpt[el.dataset.station] = el.value;
    refreshSummary();
  },
  'builder:kg': el => {
    b().kg[el.dataset.key] = clampInt(el.value, 0, MAX_QTY);
    refreshSummary();
  },
  'builder:tray': el => {
    b().trays[el.dataset.id] = clampInt(el.value, 0, MAX_QTY);
    refreshSummary();
  },
  'builder:bite': el => {
    b().bites[el.dataset.id] = clampInt(el.value, 0, MAX_QTY);
    refreshSummary();
  },
  'builder:extra': el => {
    const set = new Set(b().extras);
    if (el.checked) set.add(el.dataset.id);
    else set.delete(el.dataset.id);
    b().extras = [...set];
    el.closest('.builder-check')?.classList.toggle('checked', el.checked);
    refreshSummary();
  },
  'builder:field': el => {
    b()[el.dataset.field] = el.value;
    refreshErrors();
  },
  'builder:submit': submitBuilder
});
