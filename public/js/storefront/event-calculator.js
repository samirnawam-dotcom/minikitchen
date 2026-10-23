// Interactive wedding & event budget calculator on the catering menus page:
// base package × guests + live-station add-ons, live USD/LBP totals and "send estimate to WhatsApp".

import { registerActions } from '../shared/actions.js';
import { esc } from '../shared/dom.js';
import { state } from './state.js';
import { configList, getStationAddons } from './config.js';
import { lbp } from './format.js';
import { allocateOrderId, recordOrder } from './orders.js';
import { openWhatsApp } from './whatsapp.js';
import { renderMainView } from './view.js';
import { showToast } from './toast.js';

const MIN_GUESTS = 15;
const MAX_GUESTS = 1500;
const clampGuests = (value, fallback) => Math.max(MIN_GUESTS, Math.min(MAX_GUESTS, Number(value) || fallback));

function computeTotals() {
  const pkgs = configList('cateringPackages');
  const chosenPkg = pkgs[state.calcPkgIdx] ||
    pkgs[0] || { title: 'The Royal Mountain Wedding Feast', pricePerPerson: '$45' };
  const baseRate = parseFloat(String(chosenPkg.pricePerPerson || '35').replace(/[^0-9.]/g, '')) || 35;
  const guests = clampGuests(state.calcGuests, 120);
  const addons = getStationAddons().filter(a => (state.calcStations || []).includes(a.id));
  const addonsPerGuest = addons.reduce((sum, a) => sum + (Number(a.pricePerGuest) || 0), 0);
  const totalPerGuest = baseRate + addonsPerGuest;
  return { chosenPkg, baseRate, guests, addons, addonsPerGuest, totalPerGuest, totalEventUsd: totalPerGuest * guests };
}

const breakdownText = calc =>
  `${calc.guests} Guests × ($${calc.baseRate} Base Package + $${calc.addonsPerGuest} Live Stations)`;

/** Updates the summary card in place (keeps focus in the guest inputs). `source` is not overwritten. */
function refreshCalculatorDom(source) {
  const calc = computeTotals();
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  for (const id of ['calcGuestsSlider', 'calcGuestsNumber']) {
    const input = document.getElementById(id);
    if (input && input !== source && Number(input.value) !== calc.guests) input.value = calc.guests;
  }
  setText('calcPkgTitle', calc.chosenPkg.title);
  setText('calcPerGuestDisplay', `$${calc.totalPerGuest.toFixed(0)} / guest`);
  setText('calcTotalUsdDisplay', `$${calc.totalEventUsd.toLocaleString('en-US')}`);
  setText('calcTotalLbpDisplay', lbp(calc.totalEventUsd));
  setText('calcBreakdownText', breakdownText(calc));
}

function sendEstimateToWhatsApp() {
  const calc = computeTotals();
  const quoteId = allocateOrderId();
  const stationsList = calc.addons.length
    ? calc.addons.map(a => `${a.name} (+$${a.pricePerGuest}/guest)`).join(', ')
    : 'No Extra Live Stations Selected';

  const msg = [
    `👑 *CUSTOM EVENT BUDGET ESTIMATE — MINI KITCHEN CATERING*`,
    `*Reference ID:* #${quoteId}`,
    `-----------------------------------------`,
    `*Selected Base Package:* ${calc.chosenPkg.title} ($${calc.baseRate}/guest)`,
    `*Estimated Guest Count:* ${calc.guests} Guests`,
    `*Selected Live Stations:* ${stationsList}`,
    `-----------------------------------------`,
    `💵 *Combined Rate:* *$${calc.totalPerGuest}/guest*`,
    `💰 *Estimated Event Total (USD):* *$${calc.totalEventUsd.toLocaleString('en-US')}*`,
    `🇱🇧 *Approx. Total (LBP):* *${lbp(calc.totalEventUsd)}*`,
    `-----------------------------------------`,
    `Hello Mini Kitchen Catering! I built this custom package & live station estimate (#${quoteId}) on your website. Please share date availability and a formal proposal.`
  ].join('\n');

  recordOrder({
    id: quoteId,
    type: 'catering_quote',
    brand: 'catering',
    customerName: 'Event Calculator Client',
    customerPhone: 'Via WhatsApp Concierge',
    address: 'Lebanon (Via Interactive Event Calculator)',
    eventType: calc.chosenPkg.categoryLabel || 'Wedding / Event Catering',
    eventDate: 'Flexible / To Confirm',
    guests: calc.guests,
    packageSelected: `${calc.chosenPkg.title} ($${calc.totalPerGuest}/guest incl. ${calc.addons.length} station add-ons)`,
    notes: `Live Stations: ${stationsList}`,
    items: [],
    totalUsd: calc.totalEventUsd,
    staffNotes: 'Generated from Website Interactive Wedding & Event Budget Calculator',
    whatsappText: msg
  });

  showToast(`Estimate #${quoteId} saved & opening WhatsApp...`);
  openWhatsApp('catering', msg, true);
}

function renderStationOption(a) {
  const checked = (state.calcStations || []).includes(a.id);
  return `
                <label class="calc-option${checked ? ' checked' : ''}">
                  <span class="calc-option-left">
                    <input type="checkbox" ${checked ? 'checked' : ''} data-on-change="calc:station" data-id="${esc(a.id)}" />
                    <span>${esc(a.name)}</span>
                  </span>
                  <span class="calc-option-price">+$${esc(a.pricePerGuest)}/guest</span>
                </label>`;
}

export function renderEventBudgetCalculator() {
  const pkgs = configList('cateringPackages');
  const calc = computeTotals();

  return `
      <section class="section-pad section-ivory" id="eventCalculatorSection">
        <div class="container">
          <header class="section-header">
            <span class="eyebrow">Budget</span>
            <h2 class="section-title">Estimate your event</h2>
            <p class="section-desc">Pick a package, set your guest count and add live stations to see a per-guest and total estimate.</p>
          </header>

          <div class="calc-layout">
            <div class="calc-panel">
              <div class="form-group">
                <label for="calcPackageSelect">1 · Package</label>
                <select id="calcPackageSelect" class="form-control" data-on-change="calc:package">
                  ${pkgs
                    .map(
                      (p, idx) => `
                    <option value="${idx}" ${state.calcPkgIdx === idx ? 'selected' : ''}>
                      ${esc(p.title)} (${esc(p.pricePerPerson)}/guest · ${esc(p.minGuests)})
                    </option>
                  `
                    )
                    .join('')}
                </select>
              </div>

              <div class="form-group">
                <div class="calc-guests-head">
                  <label for="calcGuestsNumber">2 · Guests</label>
                  <input
                    type="number"
                    id="calcGuestsNumber"
                    class="form-control form-control-sm calc-guests-input"
                    min="15"
                    max="1500"
                    value="${calc.guests}"
                    data-on-input="calc:guests"
                    data-on-change="calc:guests-commit"
                  />
                </div>
                <input
                  type="range"
                  id="calcGuestsSlider"
                  class="calc-range"
                  min="20"
                  max="500"
                  step="5"
                  value="${Math.min(500, calc.guests)}"
                  aria-label="Guest count"
                  data-on-input="calc:guests"
                />
                <div class="calc-range-scale"><span>20</span><span>150</span><span>300</span><span>500+</span></div>
              </div>

              <div class="form-group">
                <span class="calc-label">3 · Live stations (optional)</span>
                <div class="calc-options">
                  ${getStationAddons().map(renderStationOption).join('')}
                </div>
              </div>
            </div>

            <div class="calc-summary">
              <span class="eyebrow">Your estimate</span>
              <h3 id="calcPkgTitle" class="calc-summary-title">${esc(calc.chosenPkg.title)}</h3>
              <div id="calcBreakdownText" class="calc-breakdown">${esc(breakdownText(calc))}</div>

              <div class="calc-figures">
                <div class="calc-figure-row">
                  <span>Per guest</span>
                  <strong id="calcPerGuestDisplay">$${calc.totalPerGuest.toFixed(0)} / guest</strong>
                </div>
                <div class="calc-total-label">Estimated total</div>
                <div id="calcTotalUsdDisplay" class="calc-total">$${calc.totalEventUsd.toLocaleString('en-US')}</div>
                <div id="calcTotalLbpDisplay" class="calc-total-lbp">${lbp(calc.totalEventUsd)}</div>
              </div>

              <ul class="check-list">
                <li>Buffet set-up, chafing dishes &amp; porcelain</li>
                <li>Uniformed waitstaff and an on-site chef</li>
                <li>Free menu tasting in Ain Al Remmaneh</li>
              </ul>

              <button type="button" class="btn btn-whatsapp btn-block" data-action="calc:send">
                <i class="fa-brands fa-whatsapp"></i> Send estimate &amp; check dates
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
}

registerActions({
  'calc:package': el => {
    state.calcPkgIdx = Number(el.value) || 0;
    refreshCalculatorDom();
  },
  // While typing, the number field keeps what the visitor typed; it is normalised on change.
  'calc:guests': el => {
    state.calcGuests = clampGuests(el.value, 100);
    refreshCalculatorDom(el);
  },
  'calc:guests-commit': () => refreshCalculatorDom(),
  'calc:station': el => {
    const set = new Set(state.calcStations || []);
    if (set.has(el.dataset.id)) set.delete(el.dataset.id);
    else set.add(el.dataset.id);
    state.calcStations = [...set];
    renderMainView();
  },
  'calc:send': sendEstimateToWhatsApp
});
