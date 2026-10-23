// QR Codes tab: the three menu QR codes (catering / restaurant / delivery) with printable table
// tents, plus numbered dine-in table QR cards (?qr=1&table=N).

import { registerActions } from '../../shared/actions.js';
import { esc } from '../../shared/dom.js';
import { data, ui } from '../state.js';
import { registerTab, renderActiveTab } from '../router.js';
import { openPrintWindow } from '../ui/print-window.js';

const QR_API = 'https://api.qrserver.com/v1/create-qr-code/';
const qrImage = (url, size, extra = '') =>
  `${QR_API}?size=${size}x${size}&margin=${size >= 240 ? 8 : 6}${extra}&data=${encodeURIComponent(url)}`;

function siteOrigin() {
  const origin = window.location.origin;
  return origin && origin !== 'null' ? origin : 'https://minikitchencatering.com';
}

const clampTables = n => Math.max(1, Math.min(60, Number(n) || 12));

/** The three menu QR codes. `print` holds the slightly different wording used on the standee. */
function menuQrList() {
  const origin = siteOrigin();
  const contacts = data.siteConfig.contacts;
  return [
    {
      mode: 'catering',
      badge: 'QR Menu #1 • Weddings & Events',
      title: 'Mini Kitchen Catering & Packages Menu',
      desc: 'Direct QR link to Wedding Packages, Corporate Buffets & FineDine Catering Trays (`?qr=1#catering-menus`).',
      color: '#c59b27',
      phone: contacts.catering.phoneDisplay,
      url: `${origin}/catering-menus.html?qr=1#catering-menus`,
      print: { badge: 'QR Menu #1 • Weddings & Events', title: 'Mini Kitchen Catering & Packages Menu' }
    },
    {
      mode: 'resto',
      badge: 'QR Menu #2 • Aley Terrace Table Scan',
      title: 'Mini Kitchen Restaurant — Dine-In Table QR',
      desc: 'Direct QR link for restaurant tables in Ain Al Remmaneh, Aley (`?qr=1#restaurant`). Opens directly in Full-Screen Table Mode.',
      color: '#2d6a4f',
      phone: contacts.restaurant.phoneDisplay,
      url: `${origin}/restaurant.html?qr=1#restaurant`,
      print: { badge: 'QR Menu #2 • Aley Terrace Dine-In', title: 'Mini Kitchen Restaurant — Table Menu' }
    },
    {
      mode: 'delivery',
      badge: 'QR Menu #3 • Fast WhatsApp Delivery',
      title: 'Mini Kitchen Delivery — Instant Order QR',
      desc: 'Direct QR link for delivery flyers, magnets & packaging (`?qr=1#delivery`). Customers scan, fill bag & send to WhatsApp.',
      color: '#d94e28',
      phone: contacts.delivery.phoneDisplay,
      url: `${origin}/delivery.html?qr=1#delivery`,
      print: { badge: 'QR Menu #3 • Fast WhatsApp Delivery', title: 'Mini Kitchen Delivery — WhatsApp Menu' }
    }
  ];
}

const tableUrl = n => `${siteOrigin()}/restaurant.html?qr=1&table=${n}#restaurant`;

function menuQrCard(q) {
  return `
    <div style="border:1px solid var(--bo-border); border-top: 5px solid ${q.color}; border-radius:18px; padding:24px; text-align:center; background:#fff; display:flex; flex-direction:column; align-items:center;">
      <span style="background:${q.color}18; color:${q.color}; font-size:0.72rem; font-weight:800; padding:4px 12px; border-radius:999px; text-transform:uppercase; margin-bottom:10px;">
        ${esc(q.badge)}
      </span>
      <h3 style="font-family:var(--font-serif); font-size:1.25rem; margin-bottom:6px;">${esc(q.title)}</h3>
      <p style="font-size:0.82rem; color:var(--bo-muted); margin-bottom:16px;">${esc(q.desc)}</p>
      <div style="padding:14px; border:2px dashed ${q.color}; border-radius:18px; margin-bottom:14px; background:#fff;">
        <img src="${esc(qrImage(q.url, 240, '&color=14171c&bgcolor=ffffff'))}" alt="${esc(q.title)}" style="width:190px; height:190px; display:block;" />
      </div>
      <input type="text" class="bo-input" value="${esc(q.url)}" readonly style="font-size:0.75rem; text-align:center; margin-bottom:12px; background:#f9fafb;" aria-label="Menu link" />
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; width:100%;">
        <button class="bo-btn bo-btn-primary" style="background:${q.color};" data-action="qr:print-standee" data-mode="${q.mode}">
          <i class="fa-solid fa-print"></i> Print Table Tent
        </button>
        <a href="${esc(q.url)}" target="_blank" rel="noopener" class="bo-btn bo-btn-outline">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Test QR View
        </a>
      </div>
    </div>
  `;
}

function tableQrPanel() {
  const count = clampTables(ui.tableQrCount);
  const tables = Array.from({ length: count }, (_, i) => i + 1);
  const small = 'flex:1; padding:5px 6px; font-size:0.7rem;';
  return `
    <div class="bo-panel">
      <div class="bo-panel-header">
        <div>
          <div class="bo-panel-title"><i class="fa-solid fa-chair" style="color:var(--bo-pine);"></i> Table-Numbered Dine-In QR Codes (Aley Terrace)</div>
          <div style="font-size:0.8rem; color:var(--bo-muted);">Each table QR opens the Restaurant menu with <code>?qr=1&amp;table=N</code> — guests see "Table #N", pay no delivery fee, and their order arrives in the CRM tagged with the table number</div>
        </div>
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <span style="font-size:0.78rem; font-weight:700; color:var(--bo-muted);">Number of Tables:</span>
          <input type="number" min="1" max="60" class="bo-input" style="width:80px; padding:6px 10px; font-weight:800;" value="${count}" data-on-change="qr:table-count" aria-label="Number of tables" />
          <button type="button" class="bo-btn bo-btn-gold" data-action="qr:print-tables" data-count="${count}">
            <i class="fa-solid fa-print"></i> Print All ${count} Table Cards
          </button>
        </div>
      </div>
      <div class="bo-panel-body">
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap:14px;">
          ${tables
            .map(
              n => `
            <div style="border:1px solid var(--bo-border); border-top:4px solid #2d6a4f; border-radius:14px; padding:12px; text-align:center; background:var(--bo-surface, #fff);">
              <div style="font-weight:800; font-size:0.95rem; margin-bottom:6px;">Table #${n}</div>
              <img src="${esc(qrImage(tableUrl(n), 160))}" alt="Table ${n} QR" style="width:110px; height:110px;" loading="lazy" />
              <div style="display:flex; gap:6px; margin-top:8px;">
                <a href="${esc(tableUrl(n))}" target="_blank" rel="noopener" class="bo-btn bo-btn-outline" style="${small}" title="Test" aria-label="Test table ${n} link">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
                <button type="button" class="bo-btn bo-btn-outline" style="${small}" data-action="qr:print-tables" data-table="${n}" title="Print" aria-label="Print table ${n} card">
                  <i class="fa-solid fa-print"></i>
                </button>
              </div>
            </div>`
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

function render() {
  return `
    <div class="bo-panel">
      <div class="bo-panel-header">
        <div>
          <div class="bo-panel-title"><i class="fa-solid fa-qrcode" style="color:var(--bo-gold);"></i> 3-Menu FineDine QR Code Generator & Standee Printer</div>
          <div style="font-size:0.8rem; color:var(--bo-muted);">Each menu has a dedicated QR code with <code>?qr=1</code> that hides website hero banners so mobile scanners land straight inside the menu</div>
        </div>
      </div>
      <div class="bo-panel-body">
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:22px;">
          ${menuQrList().map(menuQrCard).join('')}
        </div>
      </div>
    </div>
    ${tableQrPanel()}
  `;
}

// ---- Print templates (no scripts; printed from the opener) ---------------------------------------

function printTableCards(tableNumbers) {
  const phone = esc(data.siteConfig.contacts.restaurant.phoneDisplay);
  const cards = tableNumbers
    .map(
      n => `
      <div class="card">
        <div class="badge">Dine-In • Scan to Order</div>
        <h1>MINI KITCHEN</h1>
        <div class="table">TABLE ${n}</div>
        <img src="${esc(qrImage(tableUrl(n), 300))}" alt="Table ${n}" />
        <div class="foot">Scan with your phone camera to browse the menu & order to your table</div>
        <div class="sub">Ain Al Remmaneh, Aley • ${phone}</div>
      </div>`
    )
    .join('');
  openPrintWindow(
    `<!DOCTYPE html><html><head><meta charset="UTF-8" /><title>Mini Kitchen — Table QR Cards</title>
    <style>
      body { font-family: sans-serif; margin: 0; padding: 20px; display:flex; flex-wrap:wrap; gap:18px; justify-content:center; }
      .card { width: 300px; border: 3px solid #2d6a4f; border-radius: 22px; padding: 22px; text-align: center; page-break-inside: avoid; }
      .badge { display:inline-block; background:#2d6a4f; color:#fff; font-size:11px; font-weight:bold; text-transform:uppercase; letter-spacing:0.1em; padding:5px 12px; border-radius:999px; }
      h1 { margin: 10px 0 2px; font-size: 22px; letter-spacing: 0.06em; }
      .table { font-size: 34px; font-weight: 900; color: #c59b27; margin-bottom: 8px; }
      img { width: 200px; height: 200px; border: 2px dashed #2d6a4f; border-radius: 14px; padding: 8px; }
      .foot { font-size: 12px; font-weight: bold; margin-top: 10px; }
      .sub { font-size: 11px; color: #666; margin-top: 4px; }
    </style></head><body>${cards}</body></html>`,
    { features: 'width=900,height=900', delayMs: 700, blockedMessage: 'Please allow popups to print table QR cards.' }
  );
}

function printStandee(mode) {
  const list = menuQrList();
  const q = list.find(x => x.mode === mode) || list[1];
  openPrintWindow(
    `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Print QR Standee — ${esc(q.print.title)}</title>
      <style>
        body { font-family: sans-serif; display:flex; align-items:center; justify-content:center; min-height:95vh; margin:0; }
        .card { width: 360px; border: 3px solid ${q.color}; border-radius: 24px; padding: 32px 24px; text-align:center; }
        .badge { display:inline-block; background:${q.color}; color:#fff; padding:6px 14px; border-radius:999px; font-size:11px; font-weight:bold; text-transform:uppercase; margin-bottom:12px; }
        h1 { margin: 0 0 6px; font-size: 24px; }
        p { margin: 0 0 18px; font-size: 13px; color:#555; }
        img { width: 220px; height: 220px; border: 2px dashed ${q.color}; padding: 12px; border-radius: 16px; margin-bottom: 14px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">${esc(q.print.badge)}</div>
        <h1>MINI KITCHEN</h1>
        <p>${esc(q.print.title)}</p>
        <img src="${esc(qrImage(q.url, 320, '&color=14171c&bgcolor=ffffff'))}" alt="QR" />
        <div style="font-weight:bold; font-size:13px;">Scan with your phone camera to browse & order</div>
        <div style="font-size:11px; color:#666; margin-top:4px;">Ain Al Remmaneh, Aley • WhatsApp: ${esc(q.phone)}</div>
      </div>
    </body>
    </html>`,
    { features: 'width=520,height=720', delayMs: 400, blockedMessage: 'Please allow popups to print the QR standee.' }
  );
}

registerActions({
  'qr:table-count': el => {
    ui.tableQrCount = clampTables(el.value);
    renderActiveTab();
  },
  'qr:print-tables': el => {
    const single = Number(el.dataset.table);
    const count = clampTables(el.dataset.count);
    printTableCards(single ? [single] : Array.from({ length: count }, (_, i) => i + 1));
  },
  'qr:print-standee': el => printStandee(el.dataset.mode)
});

registerTab('qrcodes', {
  title: 'QR Codes',
  subtitle: '',
  render
});
