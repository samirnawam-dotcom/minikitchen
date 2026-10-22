// Printable documents for an order: the official proposal / pro-forma invoice and the kitchen
// ticket. They contain no scripts; ui/print-window.js prints them from the opener.

import { esc } from '../../shared/dom.js';
import { data } from '../state.js';
import { formatUsd, formatLbp, formatDateTime } from '../format.js';
import { itemQty, itemTotal } from './order-card.js';

const PROPOSAL_STYLES = `
  body { font-family: 'Plus Jakarta Sans', sans-serif; color: #14171c; background: #f4f3ef; margin: 0; padding: 30px; }
  .sheet { max-width: 800px; margin: 0 auto; background: #fff; border: 2px solid #c59b27; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.08); }
  .header { background: #14171c; color: #fff; padding: 28px 34px; display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #c59b27; }
  .brand-title { font-family: 'Playfair Display', serif; font-size: 26px; letter-spacing: 0.04em; color: #e6c45a; margin: 0; }
  .brand-sub { font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 4px; }
  .doc-badge { text-align: right; }
  .doc-badge .type { font-size: 11px; font-weight: 800; letter-spacing: 0.12em; color: #e6c45a; text-transform: uppercase; }
  .doc-badge .ref { font-size: 22px; font-weight: 800; margin-top: 2px; }
  .body { padding: 32px 34px; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #faf8f5; border: 1px solid #e5e0d5; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px; font-size: 13px; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px; }
  th { background: #14171c; color: #e6c45a; text-transform: uppercase; font-size: 11px; letter-spacing: 0.08em; padding: 10px 12px; text-align: left; }
  .totals-box { margin-left: auto; width: 320px; background: #faf8f5; border: 1px solid #c59b27; border-radius: 12px; padding: 16px 20px; }
  .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
  .totals-row.grand { font-size: 18px; font-weight: 800; border-top: 2px solid #14171c; padding-top: 10px; margin-top: 6px; color: #14171c; }
  .terms { margin-top: 28px; font-size: 12px; color: #525866; line-height: 1.6; border-top: 1px dashed #d1d5db; padding-top: 16px; }
  .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 36px; font-size: 12px; color: #525866; }
  .sig-line { border-top: 1px solid #14171c; padding-top: 8px; margin-top: 36px; font-weight: 700; color: #14171c; }
  .no-print { text-align: center; margin-bottom: 18px; }
  .btn-print { background: #c59b27; color: #14171c; border: none; padding: 10px 22px; border-radius: 999px; font-weight: 800; cursor: pointer; font-size: 13px; }
  @media print { body { background: #fff; padding: 0; } .sheet { box-shadow: none; border-radius: 0; } .no-print { display: none; } }
`;

const cell = 'padding:10px 12px; border-bottom:1px solid #e5e7eb;';
const bigCell = 'padding:12px; border-bottom:1px solid #e5e7eb;';

function proposalLines(o) {
  if (Array.isArray(o.items) && o.items.length > 0) {
    return o.items
      .map(
        (item, idx) => `
        <tr>
          <td style="${cell}">${idx + 1}</td>
          <td style="${cell}">
            <b>${esc(item.title)}</b>
            ${item.modifiers && item.modifiers.length ? `<div style="font-size:11px; color:#6b7280;">Options: ${esc(item.modifiers.join(', '))}</div>` : ''}
            ${item.note ? `<div style="font-size:11px; color:#6b7280; font-style:italic;">Note: ${esc(item.note)}</div>` : ''}
          </td>
          <td style="${cell} text-align:center;">${itemQty(item)}</td>
          <td style="${cell} text-align:right;">${formatUsd(item.priceValue)}</td>
          <td style="${cell} text-align:right; font-weight:700;">${formatUsd(itemTotal(item))}</td>
        </tr>`
      )
      .join('');
  }
  const guests = Number(o.guests) || 0;
  return `
    <tr>
      <td style="${bigCell}">1</td>
      <td style="${bigCell}">
        <b>${esc(o.packageSelected || o.eventType || 'Bespoke Catering & Hospitality Package')}</b>
        <div style="font-size:12px; color:#6b7280; margin-top:4px;">
          Event Date: <b>${esc(o.eventDate || 'TBD')}</b> • Venue: <b>${esc(o.address || 'TBD')}</b><br/>
          Includes full buffet architecture, porcelain & gold chafing dishes, live stations as selected, and uniformed hospitality staff.
        </div>
      </td>
      <td style="${bigCell} text-align:center;">${guests || 1} Guests</td>
      <td style="${bigCell} text-align:right;">${guests && o.totalUsd ? `${formatUsd(o.totalUsd / guests)} / guest` : 'Custom'}</td>
      <td style="${bigCell} text-align:right; font-weight:700;">${o.totalUsd > 0 ? formatUsd(o.totalUsd) : 'Custom Quote'}</td>
    </tr>`;
}

export function proposalHtml(o) {
  const docTitle =
    o.type === 'catering_quote' ? 'OFFICIAL CATERING & EVENT PROPOSAL' : 'OFFICIAL PRO-FORMA INVOICE & ORDER SUMMARY';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Mini Kitchen — ${docTitle} (#${esc(o.id)})</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <style>${PROPOSAL_STYLES}</style>
</head>
<body>
  <div class="no-print">
    <button type="button" class="btn-print js-print">🖨️ Print / Save as PDF</button>
  </div>
  <div class="sheet">
    <div class="header">
      <div>
        <h1 class="brand-title">MINI KITCHEN</h1>
        <div class="brand-sub">Catering • Scenic Restaurant • Delivery — Ain Al Remmaneh, Aley, Mount Lebanon</div>
        <div class="brand-sub">Catering: +961 71 048 154 | Restaurant & Delivery: +961 3 682 186 | minikitchencatering.com</div>
      </div>
      <div class="doc-badge">
        <div class="type">${docTitle}</div>
        <div class="ref">#${esc(o.id)}</div>
        <div style="font-size:11px; opacity:0.8;">Date: ${esc(formatDateTime(o.createdAt))}</div>
      </div>
    </div>
    <div class="body">
      <div class="meta-grid">
        <div>
          <div style="font-size:11px; font-weight:800; text-transform:uppercase; color:#9e7815;">Prepared For Client</div>
          <div style="font-size:15px; font-weight:800;">${esc(o.customerName || 'Valued Client')}</div>
          <div><b>Phone / WhatsApp:</b> ${esc(o.customerPhone || 'Via WhatsApp')}</div>
          <div><b>Location / Venue:</b> ${esc(o.address || 'Ain Al Remmaneh, Aley')}</div>
        </div>
        <div>
          <div style="font-size:11px; font-weight:800; text-transform:uppercase; color:#9e7815;">Event & Order Specifications</div>
          <div><b>Service Division:</b> ${esc((o.brand || 'catering').toUpperCase())}</div>
          ${o.eventType ? `<div><b>Occasion:</b> ${esc(o.eventType)}</div>` : ''}
          ${o.eventDate ? `<div><b>Event Date:</b> ${esc(o.eventDate)}</div>` : ''}
          ${o.guests ? `<div><b>Estimated Guests:</b> ${Number(o.guests) || 0} Guests</div>` : ''}
          <div><b>Current Status:</b> ${esc((o.status || 'new').toUpperCase())}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:40px;">#</th>
            <th>Description / Package / Dish</th>
            <th style="text-align:center; width:100px;">Qty / Guests</th>
            <th style="text-align:right; width:110px;">Unit Rate</th>
            <th style="text-align:right; width:120px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${proposalLines(o)}</tbody>
      </table>

      ${
        o.notes
          ? `<div style="background:#fffbeb; border:1px solid #fde68a; border-radius:10px; padding:12px 16px; font-size:12px; margin-bottom:20px;">
              <b>Client Special Notes & Custom Requests:</b><br/>${esc(o.notes)}
            </div>`
          : ''
      }

      <div class="totals-box">
        <div class="totals-row">
          <span>Exchange Rate:</span>
          <b>1 USD = ${data.lbpRate.toLocaleString('en-US')} L.L.</b>
        </div>
        <div class="totals-row grand">
          <span>TOTAL (USD):</span>
          <span>${o.totalUsd > 0 ? formatUsd(o.totalUsd) : 'Custom Quote'}</span>
        </div>
        ${
          o.totalUsd > 0
            ? `<div class="totals-row" style="color:#525866; font-weight:700;">
                <span>TOTAL (LBP):</span>
                <span>${formatLbp(o.totalUsd)}</span>
              </div>`
            : ''
        }
      </div>

      <div class="terms">
        <b>Hospitality Terms & Quality Guarantee:</b> All dishes are prepared fresh using premium halal meats, artisanal mountain produce, and signature Mini Kitchen recipes in Ain Al Remmaneh, Aley. For wedding & event catering bookings, a 30% deposit confirms your event date, with final guest count confirmed 72 hours prior to the event.
      </div>

      <div class="sig-grid">
        <div><div class="sig-line">Mini Kitchen Hospitality & Catering Director</div></div>
        <div><div class="sig-line">Client Acceptance & Signature (${esc(o.customerName)})</div></div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function ticketHtml(o) {
  const items =
    Array.isArray(o.items) && o.items.length
      ? o.items
          .map(
            i => `
        <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px dashed #ccc;">
          <div>
            <b>${itemQty(i)}x ${esc(i.title)}</b>
            ${i.modifiers && i.modifiers.length ? `<div style="font-size:11px;">+ ${esc(i.modifiers.join(', '))}</div>` : ''}
            ${i.note ? `<div style="font-size:11px; font-style:italic;">Note: ${esc(i.note)}</div>` : ''}
          </div>
          <div>${formatUsd(itemTotal(i))}</div>
        </div>`
          )
          .join('')
      : `<div><b>Occasion:</b> ${esc(o.eventType || 'N/A')}<br/><b>Date:</b> ${esc(o.eventDate || 'N/A')}<br/><b>Guests:</b> ${esc(o.guests || 'N/A')}<br/><b>Package:</b> ${esc(o.packageSelected || 'Custom')}</div>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Kitchen Receipt ${esc(o.id)}</title>
  <style>
    body { font-family: monospace; padding: 20px; max-width: 340px; margin: 0 auto; color:#000; }
    h2 { text-align:center; margin:0 0 4px; }
    .sub { text-align:center; font-size:12px; margin-bottom:14px; border-bottom:2px solid #000; padding-bottom:10px; }
    .meta { font-size:12px; margin-bottom:12px; line-height:1.5; }
    .total { font-size:15px; font-weight:bold; border-top:2px solid #000; padding-top:10px; margin-top:12px; display:flex; justify-content:space-between; }
  </style>
</head>
<body>
  <h2>MINI KITCHEN</h2>
  <div class="sub">Ain Al Remmaneh, Aley • Ticket #${esc(o.id)}<br/>${esc(formatDateTime(o.createdAt))}</div>
  <div class="meta">
    <b>Customer:</b> ${esc(o.customerName)}<br/>
    <b>Phone:</b> ${esc(o.customerPhone || 'WhatsApp')}<br/>
    <b>Address/Venue:</b> ${esc(o.address || 'N/A')}<br/>
    <b>Notes:</b> ${esc(o.notes || 'None')}
  </div>
  <div style="border-top:1px solid #000; padding-top:8px;">${items}</div>
  <div class="total">
    <span>TOTAL:</span>
    <span>${formatUsd(o.totalUsd)} (${formatLbp(o.totalUsd)})</span>
  </div>
</body>
</html>`;
}
