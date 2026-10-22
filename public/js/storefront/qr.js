// QR menus: the QR bar shown above each menu (with the dine-in table banner), the 3-menu QR studio
// modal, printable table-tent standees, link copying and the distraction-free "QR table mode".

import { registerActions } from '../shared/actions.js';
import { esc } from '../shared/dom.js';
import { state } from './state.js';
import { content } from './config.js';
import { FALLBACK_QR_SVG } from './images.js';
import { closeNavDrawer, navigateToPage } from './navigation.js';
import { renderMainView } from './view.js';
import { showToast } from './toast.js';

export function getQrMenusMeta() {
  const origin =
    window.location.origin && window.location.origin !== 'null'
      ? window.location.origin
      : 'http://minikitchencatering.com';
  const contacts = content.config.contacts;
  return {
    catering: {
      mode: 'catering',
      pageId: 'catering-menus',
      badge: 'QR Menu #1 • Weddings & Events',
      shortLabel: 'Catering & Events QR Menu',
      title: 'Mini Kitchen Catering & Packages Menu',
      desc: 'Dedicated QR code for wedding couples, corporate planners & event hosts to browse packages and FineDine catering trays.',
      color: '#c59b27',
      phone: contacts.catering.phoneDisplay,
      url: `${origin}/catering-menus.html?qr=1#catering-menus`,
      tableHint: 'Event Tasting & Brochure Card QR'
    },
    resto: {
      mode: 'resto',
      pageId: 'restaurant',
      badge: 'QR Menu #2 • Aley Terrace Dine-In',
      shortLabel: 'Restaurant Table Dine-In QR Menu',
      title: 'Mini Kitchen Restaurant — Table QR Menu',
      desc: 'Dedicated table-tent QR code for dine-in guests in Ain Al Remmaneh, Aley to browse all 239+ dishes in USD or LBP.',
      color: '#2d6a4f',
      phone: contacts.restaurant.phoneDisplay,
      url: `${origin}/restaurant.html?qr=1#restaurant`,
      tableHint: 'Restaurant Table Tent / Coaster QR'
    },
    delivery: {
      mode: 'delivery',
      pageId: 'delivery',
      badge: 'QR Menu #3 • Fast WhatsApp Delivery',
      shortLabel: 'Delivery Instant Order QR Menu',
      title: 'Mini Kitchen Delivery — WhatsApp Order QR',
      desc: 'Dedicated QR code for takeaway bags, magnets & flyers—customers scan, build their bag, and send directly to WhatsApp.',
      color: '#d94e28',
      phone: contacts.delivery.phoneDisplay,
      url: `${origin}/delivery.html?qr=1#delivery`,
      tableHint: 'Delivery Flyer & Packaging Box QR'
    }
  };
}

function getQrImageSrc(targetUrl, size = 240) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&color=14171c&bgcolor=ffffff&data=${encodeURIComponent(
    targetUrl
  )}`;
}

function setQrTableMode(enabled) {
  state.qrTableMode = enabled;
  document.body.classList.toggle('qr-table-mode', state.qrTableMode);
  renderMainView();
  showToast(
    state.qrTableMode
      ? 'QR Table Mode enabled: Hero banners hidden for fast menu scanning'
      : 'Standard website view restored'
  );
}

/** Table banner (when opened from a table QR with ?table=N) + the QR bar shown at the top of each menu. */
export function renderMenuQrCodeBar(mode) {
  const qrMenus = getQrMenusMeta();
  const qrInfo = qrMenus[mode] || qrMenus.resto;
  const table = esc(state.tableNumber);

  const tableBanner = state.tableNumber
    ? `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; background:linear-gradient(135deg, #2d6a4f, #1b4332); color:#fff; border-radius:14px; padding:12px 18px; margin-bottom:14px; border:1px solid #52b788;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.05rem;">
              ${table}
            </div>
            <div>
              <div style="font-size:0.72rem; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; color:#d8f3dc;">Welcome to Mini Kitchen Restaurant</div>
              <div style="font-weight:800; font-size:1rem;">You are seated at Table #${table} — Dine-In (No Delivery Fee)</div>
            </div>
          </div>
          <button type="button" class="btn btn-whatsapp" style="padding:8px 14px; font-size:0.8rem;" data-action="wa:open" data-brand="restaurant" data-msg="Hello! Table #${table} is requesting a waiter please." data-skip-log>
            <i class="fa-solid fa-bell-concierge"></i> Call Waiter
          </button>
        </div>
      `
    : '';

  return `
      ${tableBanner}
      <div class="fd-qr-menu-bar">
        <div class="fd-qr-menu-left">
          <div class="fd-qr-mini-thumb" data-action="qr:open" data-mode="${qrInfo.mode}" title="Click to enlarge & print QR Code">
            <img src="${esc(getQrImageSrc(qrInfo.url, 140))}" data-fallback="${FALLBACK_QR_SVG}" alt="${qrInfo.shortLabel}" />
          </div>
          <div class="fd-qr-menu-meta">
            <span class="fd-qr-badge">
              <i class="fa-solid fa-qrcode"></i> ${qrInfo.badge}
            </span>
            <div class="fd-qr-title">${qrInfo.title}</div>
            <div class="fd-qr-sub">${qrInfo.desc}</div>
          </div>
        </div>
        <div class="fd-qr-actions">
          <button
            type="button"
            class="fd-qr-action-btn ${state.qrTableMode ? 'primary' : ''}"
            data-action="qr:toggle-table-mode"
            title="Hide website banners so customers scanning a table QR code see only the digital menu"
          >
            <i class="fa-solid ${state.qrTableMode ? 'fa-compress' : 'fa-expand'}"></i>
            <span>${state.qrTableMode ? 'Exit QR Table Mode' : 'QR Table View'}</span>
          </button>
          <button
            type="button"
            class="fd-qr-action-btn primary"
            data-action="qr:open"
            data-mode="${qrInfo.mode}"
          >
            <i class="fa-solid fa-qrcode"></i>
            <span>View / Print Menu QR Code</span>
          </button>
          <button
            type="button"
            class="fd-qr-action-btn"
            data-action="qr:open"
            data-mode="all"
          >
            <i class="fa-solid fa-layer-group"></i>
            <span>All 3 Menu QRs</span>
          </button>
        </div>
      </div>
    `;
}

// ---------------------------------------------------------------------------
// QR studio modal
// ---------------------------------------------------------------------------
function ensureStudioDom() {
  let backdrop = document.getElementById('qrStudioBackdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'qrStudioBackdrop';
    backdrop.className = 'qr-studio-backdrop';
    backdrop.setAttribute('data-action', 'qr:backdrop');
    document.body.appendChild(backdrop);
  }
  return backdrop;
}

function renderQrCard(m, highlightMode) {
  const isHighlighted = highlightMode === m.mode;
  return `
                  <div class="qr-menu-card" style="border-top: 5px solid ${m.color}; ${
                    isHighlighted ? `box-shadow: 0 0 0 3px ${m.color}, 0 18px 40px rgba(0,0,0,0.12);` : ''
                  }">
                    <span class="qr-card-pill" style="background:${m.color}18; color:${m.color}; border:1px solid ${m.color}40;">
                      ${m.badge}
                    </span>
                    <div class="qr-card-title">${m.shortLabel}</div>
                    <div class="qr-card-sub">${m.desc}</div>

                    <div class="qr-code-frame" style="border-color:${m.color};">
                      <img src="${esc(getQrImageSrc(m.url, 220))}" data-fallback="${FALLBACK_QR_SVG}" alt="${m.title}" />
                    </div>

                    <div class="qr-scan-caption" style="color:${m.color};">
                      <i class="fa-solid fa-mobile-screen-button"></i> ${m.tableHint}
                    </div>
                    <div style="font-size:0.75rem; color:#6b7280; margin-bottom:14px;">
                      WhatsApp Line: <b>${esc(m.phone)}</b>
                    </div>

                    <div class="qr-card-btn-stack">
                      <button
                        type="button"
                        class="btn btn-primary"
                        style="background:${m.color}; color:#fff; padding:10px 14px; font-size:0.8rem; width:100%;"
                        data-action="qr:open-menu"
                        data-page="${m.pageId}"
                      >
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Open This QR Menu
                      </button>
                      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                        <button
                          type="button"
                          class="fd-qr-action-btn"
                          style="justify-content:center; width:100%;"
                          data-action="qr:print"
                          data-mode="${m.mode}"
                        >
                          <i class="fa-solid fa-print"></i> Print Standee
                        </button>
                        <button
                          type="button"
                          class="fd-qr-action-btn"
                          style="justify-content:center; width:100%;"
                          data-action="qr:copy"
                          data-url="${esc(m.url)}"
                        >
                          <i class="fa-solid fa-link"></i> Copy Link
                        </button>
                      </div>
                    </div>
                  </div>
                `;
}

export function openQrStudio(highlightMode = 'all') {
  const backdrop = ensureStudioDom();
  const qrMenus = getQrMenusMeta();
  const list = [qrMenus.catering, qrMenus.resto, qrMenus.delivery];

  backdrop.innerHTML = `
      <div class="qr-studio-dialog" role="dialog" aria-modal="true" aria-label="Mini Kitchen 3-Menu QR Code Studio">
        <div class="qr-studio-header">
          <div>
            <div style="font-size:0.72rem; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; color:var(--brand-primary); margin-bottom:4px;">
              <i class="fa-solid fa-qrcode"></i> FineDine QR Menu System • 3 Dedicated Brand QR Codes
            </div>
            <h3 style="font-family:var(--font-serif); font-size:1.5rem; margin:0;">
              Scan, Share or Print Each Menu’s QR Code
            </h3>
          </div>
          <button
            type="button"
            data-action="qr:close"
            style="width:38px; height:38px; border-radius:50%; background:rgba(255,255,255,0.12); color:#fff; border:none; cursor:pointer; font-size:1.1rem;"
            aria-label="Close QR Studio"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="qr-studio-body">
          <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; background:var(--bg-card); padding:14px 18px; border-radius:14px; border:1px solid var(--border-subtle); margin-bottom:20px;">
            <div style="font-size:0.84rem; color:var(--text-muted);">
              <i class="fa-solid fa-circle-info" style="color:var(--brand-primary); margin-inline-end: 6px;"></i>
              Each QR code opens its corresponding FineDine menu directly in <b>Full-Screen QR Table Mode</b> (<code>?qr=1</code>) for instant mobile scanning.
            </div>
            <button
              type="button"
              class="fd-qr-action-btn ${state.qrTableMode ? 'primary' : ''}"
              data-action="qr:toggle-table-mode"
            >
              <i class="fa-solid ${state.qrTableMode ? 'fa-compress' : 'fa-expand'}"></i>
              <span>${state.qrTableMode ? 'Exit QR Table Mode Now' : 'Preview QR Table Mode'}</span>
            </button>
          </div>

          <div class="qr-studio-grid">
            ${list.map(m => renderQrCard(m, highlightMode)).join('')}
          </div>
        </div>
      </div>
    `;

  backdrop.classList.add('open');
}

export function closeQrStudio() {
  document.getElementById('qrStudioBackdrop')?.classList.remove('open');
}

function copyQrMenuLink(url) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(
      () => showToast('Direct QR Menu link copied to clipboard!'),
      () => showToast(`QR Link: ${url}`)
    );
  } else {
    showToast(`QR Link: ${url}`);
  }
}

/** Opens a printable table-tent card in a pop-up and starts printing (no inline scripts in the pop-up). */
function printQrStandee(mode) {
  const qrMenus = getQrMenusMeta();
  const m = qrMenus[mode] || qrMenus.resto;
  const win = window.open('', '_blank', 'width=520,height=720');
  if (!win) {
    showToast('Please allow pop-ups to print the QR Table Tent card.');
    return;
  }
  win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print QR Standee — ${esc(m.title)}</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet" />
        <style>
          body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f9f8f6; display:flex; align-items:center; justify-content:center; min-height:95vh; margin:0; }
          .standee { width: 380px; background: #fff; border: 3px solid ${m.color}; border-radius: 26px; padding: 34px 28px; text-align:center; box-shadow: 0 16px 40px rgba(0,0,0,0.1); }
          .eyebrow { display:inline-block; background:${m.color}; color:#fff; font-size:11px; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; padding:6px 14px; border-radius:999px; margin-bottom:14px; }
          h1 { font-family: 'Playfair Display', serif; font-size: 26px; color:#14171c; margin: 0 0 8px; }
          p { font-size: 13px; color:#525866; margin: 0 0 22px; line-height:1.5; }
          .qr-box { display:inline-block; padding: 16px; border: 2px dashed ${m.color}; border-radius: 20px; margin-bottom: 18px; }
          .qr-box img { width: 220px; height: 220px; display:block; }
          .footer { font-size: 13px; font-weight: 800; color:#14171c; }
          .sub { font-size: 11px; color:#6b7280; margin-top:4px; }
          @media print { body { background: #fff; } .standee { box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="standee">
          <div class="eyebrow">${esc(m.badge)}</div>
          <h1>MINI KITCHEN</h1>
          <p>${esc(m.title)}<br/>${esc(m.desc)}</p>
          <div class="qr-box">
            <img src="${esc(getQrImageSrc(m.url, 340))}" alt="QR Code" />
          </div>
          <div class="footer">Scan with your phone camera to browse & order</div>
          <div class="sub">Ain Al Remmaneh, Aley • WhatsApp: ${esc(m.phone)}</div>
        </div>
      </body>
      </html>
    `);
  win.document.close();
  // Give the QR image and fonts a moment to load before opening the print dialog.
  setTimeout(() => {
    try {
      win.print();
    } catch {}
  }, 450);
}

registerActions({
  // data-mode: 'catering' | 'resto' | 'delivery' | 'all'
  'qr:open': el => {
    closeNavDrawer();
    openQrStudio(el.dataset.mode || 'all');
  },
  'qr:close': closeQrStudio,
  'qr:backdrop': (el, event) => {
    if (event.target === el) closeQrStudio();
  },
  'qr:toggle-table-mode': () => {
    setQrTableMode(!state.qrTableMode);
    closeQrStudio();
  },
  'qr:open-menu': el => {
    closeQrStudio();
    navigateToPage(el.dataset.page);
    setQrTableMode(true);
  },
  'qr:print': el => printQrStandee(el.dataset.mode),
  'qr:copy': el => copyQrMenuLink(el.dataset.url)
});
