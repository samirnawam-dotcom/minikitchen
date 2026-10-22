// Money, date and duration formatting for the Back Office.

import { data } from './state.js';

export function formatUsd(value) {
  return `$${(Number(value) || 0).toFixed(2)}`;
}

/** USD amount converted at the current LBP rate, e.g. "4,698,750 L.L.". */
export function formatLbp(usdValue) {
  const lbp = Math.round((Number(usdValue) || 0) * data.lbpRate);
  return `${lbp.toLocaleString('en-US')} L.L.`;
}

/** "Oct 22, 09:17 AM"; returns plain text (escape before inserting into HTML). */
export function formatDateTime(iso) {
  if (!iso) return 'Just now';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Whole minutes elapsed since an ISO timestamp (0 when unknown or in the future). */
export function minutesSince(iso, now = Date.now()) {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : Math.max(0, Math.floor((now - t) / 60000));
}

/** Compact age label: "4 min", "2 h 05 min", "3 d". */
export function formatAge(minutes) {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} min`;
  return `${Math.floor(minutes / (24 * 60))} d`;
}
