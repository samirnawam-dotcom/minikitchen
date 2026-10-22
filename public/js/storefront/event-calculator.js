// Interactive wedding & event budget calculator on the catering home page:
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
                        <label style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; border-radius:12px; border:1px solid ${
                          checked ? 'var(--brand-primary)' : 'var(--border-subtle)'
                        }; background:${checked ? 'rgba(197,155,39,0.1)' : 'var(--bg-elevated)'}; cursor:pointer; font-size:0.86rem;">
                          <span style="display:flex; align-items:center; gap:10px; font-weight:600;">
                            <input
                              type="checkbox"
                              ${checked ? 'checked' : ''}
                              data-on-change="calc:station"
                              data-id="${esc(a.id)}"
                              style="accent-color:var(--brand-primary); width:16px; height:16px;"
                            />
                            <span>${esc(a.name)}</span>
                          </span>
                          <span style="font-weight:800; color:var(--brand-primary-dark); white-space:nowrap; margin-left:8px;">+$${esc(a.pricePerGuest)}/guest</span>
                        </label>
                      `;
}

export function renderEventBudgetCalculator() {
  const pkgs = configList('cateringPackages');
  const calc = computeTotals();

  return `
      <section class="section-pad" style="background:var(--bg-elevated); border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle);">
        <div class="container">
          <div class="section-header" style="margin-bottom:28px;">
            <span class="section-eyebrow"><i class="fa-solid fa-calculator"></i> Instant Event Budget Estimator</span>
            <h2 class="section-title">Interactive Wedding & Event Cost Calculator</h2>
            <p class="section-desc">
              Customize your guest count, choose a base catering formula, and add chef-manned live cooking stations to see an instant per-guest and total event estimate.
            </p>
          </div>

          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:28px; align-items:stretch;">
            <!-- Left Controls -->
            <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:20px; padding:26px; box-shadow:var(--shadow-soft);">
              <div class="form-group" style="margin-bottom:18px;">
                <label style="display:flex; justify-content:space-between; align-items:center; font-weight:800;">
                  <span>1. Choose Base Catering Package</span>
                </label>
                <select class="form-control" data-on-change="calc:package">
                  ${pkgs
                    .map(
                      (p, idx) => `
                    <option value="${idx}" ${state.calcPkgIdx === idx ? 'selected' : ''}>
                      ${esc(p.title)} (${esc(p.pricePerPerson)}/guest • ${esc(p.minGuests)})
                    </option>
                  `
                    )
                    .join('')}
                </select>
              </div>

              <div class="form-group" style="margin-bottom:20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <label style="font-weight:800; margin:0;">2. Estimated Guest Count</label>
                  <div style="display:flex; align-items:center; gap:6px;">
                    <input
                      type="number"
                      id="calcGuestsNumber"
                      class="form-control"
                      style="width:92px; padding:6px 10px; font-weight:800; text-align:center;"
                      min="15"
                      max="1500"
                      value="${calc.guests}"
                      data-on-input="calc:guests"
                      data-on-change="calc:guests-commit"
                    />
                    <span style="font-size:0.82rem; font-weight:700; color:var(--text-muted);">Guests</span>
                  </div>
                </div>
                <input
                  type="range"
                  id="calcGuestsSlider"
                  min="20"
                  max="500"
                  step="5"
                  value="${Math.min(500, calc.guests)}"
                  style="width:100%; accent-color:var(--brand-primary); cursor:pointer;"
                  data-on-input="calc:guests"
                />
                <div style="display:flex; justify-content:space-between; font-size:0.74rem; color:var(--text-muted); margin-top:4px;">
                  <span>20 Guests (Intimate)</span>
                  <span>150 Guests</span>
                  <span>300 Guests</span>
                  <span>500+ Guests (Grand Gala)</span>
                </div>
              </div>

              <div>
                <label style="font-weight:800; display:block; margin-bottom:10px;">3. Add Interactive Live Cooking Stations (Optional)</label>
                <div style="display:flex; flex-direction:column; gap:8px;">
                  ${getStationAddons().map(renderStationOption).join('')}
                </div>
              </div>
            </div>

            <!-- Right Live Summary Card -->
            <div style="background:#14171c; color:#fff; border:2px solid var(--brand-primary); border-radius:20px; padding:30px; display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <span style="display:inline-block; background:rgba(197,155,39,0.2); color:#e6c45a; font-size:0.74rem; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; padding:5px 12px; border-radius:999px; margin-bottom:14px;">
                  <i class="fa-solid fa-crown"></i> Live Tailored Estimate
                </span>
                <h3 id="calcPkgTitle" style="font-family:var(--font-serif); font-size:1.55rem; color:#fff; margin-bottom:6px;">${esc(calc.chosenPkg.title)}</h3>
                <div id="calcBreakdownText" style="font-size:0.86rem; color:rgba(255,255,255,0.75); margin-bottom:20px;">
                  ${esc(breakdownText(calc))}
                </div>

                <div style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:14px; padding:18px; margin-bottom:18px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <span style="font-size:0.82rem; color:rgba(255,255,255,0.7);">All-Inclusive Rate Per Guest:</span>
                    <strong id="calcPerGuestDisplay" style="font-size:1.2rem; color:#e6c45a;">$${calc.totalPerGuest.toFixed(0)} / guest</strong>
                  </div>
                  <div style="border-top:1px dashed rgba(255,255,255,0.15); padding-top:12px;">
                    <div style="font-size:0.76rem; text-transform:uppercase; letter-spacing:0.08em; color:rgba(255,255,255,0.65);">Estimated Total Event Investment</div>
                    <div id="calcTotalUsdDisplay" style="font-family:var(--font-serif); font-size:2.35rem; font-weight:700; color:#fff; line-height:1.2; margin-top:4px;">
                      $${calc.totalEventUsd.toLocaleString('en-US')}
                    </div>
                    <div id="calcTotalLbpDisplay" style="font-size:0.85rem; color:#e6c45a; font-weight:700; margin-top:4px;">
                      ${lbp(calc.totalEventUsd)}
                    </div>
                  </div>
                </div>

                <ul style="list-style:none; padding:0; margin:0 0 22px; font-size:0.83rem; color:rgba(255,255,255,0.82); display:flex; flex-direction:column; gap:6px;">
                  <li><i class="fa-solid fa-circle-check" style="color:#25d366; margin-right:8px;"></i> Includes Luxury Buffet Setup, Chafing Dishes & Porcelain</li>
                  <li><i class="fa-solid fa-circle-check" style="color:#25d366; margin-right:8px;"></i> Uniformed Hospitality Waitstaff & On-Site Event Chef</li>
                  <li><i class="fa-solid fa-circle-check" style="color:#25d366; margin-right:8px;"></i> Complimentary Private Menu Tasting in Ain Al Remmaneh, Aley</li>
                </ul>
              </div>

              <button type="button" class="btn btn-whatsapp" style="width:100%; padding:14px; font-size:0.95rem;" data-action="calc:send">
                <i class="fa-brands fa-whatsapp" style="font-size:1.15rem;"></i> Send This Estimate to WhatsApp & Check Dates
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
