// Server synchronisation: loading /api/state, saving the site config and menu, the new-order
// chime and the sidebar badge. Saves report failures to the user and return true/false.

import { byId } from '../shared/dom.js';
import { api, notifyUnauthorized } from './api.js';
import {
  data,
  ui,
  setSiteConfig,
  setMenuCategories,
  setLbpRate,
  setOrders,
  cacheSiteConfig,
  cacheMenu
} from './state.js';
import { renderActiveTab, isEditingTab } from './router.js';
import { showToast, showError } from './ui/toast.js';
import { playChime } from './ui/sound.js';

let knownOrderIds = new Set(data.orders.map(o => o.id));
let hasLoadedOrders = false;
let lastSignature = '';
let renderPending = false;

export function updateNavBadges() {
  const count = data.orders.filter(o => o.status === 'new').length;
  const badge = byId('navNewOrdersBadge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  }
}

/** Forget which orders were seen (after sign-out) so the next sign-in does not chime for all of them. */
export function resetOrderTracking() {
  knownOrderIds = new Set();
  hasLoadedOrders = false;
}

function applyOrders(orders) {
  const arrived = hasLoadedOrders ? orders.filter(o => !knownOrderIds.has(o.id)) : [];
  setOrders(orders);
  knownOrderIds = new Set(orders.map(o => o.id));
  hasLoadedOrders = true;
  if (arrived.length > 0) {
    playChime();
    const first = arrived[0];
    const what = first.type === 'catering_quote' ? 'New catering request' : 'New order';
    showToast(
      arrived.length > 1
        ? `${arrived.length} new orders and requests have arrived.`
        : `${what} from ${first.customerName || 'a customer'} (#${first.id}).`
    );
  }
}

/**
 * Loads /api/state into the local state.
 * @param {{ silent?: boolean, background?: boolean }} options
 *   silent: no success toast. background: re-render only when something changed and the user
 *   is not typing in the current tab (the 8-second poll uses this).
 */
export async function refreshFromServer({ silent = false, background = false } = {}) {
  let state;
  try {
    state = await api.state();
  } catch (err) {
    if (!background) showError(`Could not load the latest data: ${err.message}`);
    updateNavBadges();
    if (!background) renderActiveTab();
    return false;
  }

  if (state.database) ui.databaseInfo = state.database;
  if (Array.isArray(state.auditLogs)) ui.auditLogs = state.auditLogs;
  if (Array.isArray(state.orders)) {
    applyOrders(state.orders);
  } else if (ui.authenticated) {
    // Admin-only fields are missing: the session cookie expired or was revoked.
    notifyUnauthorized();
    return false;
  }
  if (state.siteConfig && typeof state.siteConfig === 'object') setSiteConfig(state.siteConfig);
  if (Array.isArray(state.menuCategories) && state.menuCategories.length > 0) setMenuCategories(state.menuCategories);
  if (state.lbpRate) setLbpRate(state.lbpRate);

  updateNavBadges();
  const signature = [
    state.updatedAt,
    data.lbpRate,
    JSON.stringify(data.orders),
    JSON.stringify(ui.auditLogs[0] || null)
  ].join('|');
  const changed = signature !== lastSignature;
  lastSignature = signature;

  if (!background) {
    renderActiveTab();
  } else if (changed || renderPending || ui.activeTab === 'kds') {
    // KDS re-renders every poll so order ages stay current.
    if (isEditingTab()) renderPending = true;
    else {
      renderPending = false;
      renderActiveTab();
    }
  }
  if (!silent) showToast('Everything is up to date.');
  return true;
}

// Catering keys replaced by eventPackages / liveStationMenu (2026 catering offer); dropped on save.
const RETIRED_KEYS = ['cateringPackages', 'liveStations', 'stationAddons'];

/** Saves data.siteConfig (+ LBP rate). Returns true on success. */
export async function saveSiteConfig() {
  for (const key of RETIRED_KEYS) delete data.siteConfig[key];
  cacheSiteConfig();
  try {
    const result = await api.saveSiteConfig(data.siteConfig, data.lbpRate);
    if (result.siteConfig) setSiteConfig(result.siteConfig);
    if (result.lbpRate) setLbpRate(result.lbpRate);
    return true;
  } catch (err) {
    showError(`Not saved: ${err.message}`);
    return false;
  }
}

/** Saves data.menuCategories (+ LBP rate). Returns true on success. */
export async function saveMenu() {
  cacheMenu();
  try {
    await api.saveMenu(data.menuCategories, data.lbpRate);
    return true;
  } catch (err) {
    showError(`Menu not saved: ${err.message}`);
    return false;
  }
}

/** Applies a PATCH to an order on the server and mirrors the server's copy locally. */
export async function patchOrder(id, patch) {
  try {
    const result = await api.patchOrder(id, patch);
    const idx = data.orders.findIndex(o => o.id === id);
    if (idx !== -1 && result.order) data.orders[idx] = result.order;
    setOrders(data.orders);
    return true;
  } catch (err) {
    showError(`Order ${id} was not updated: ${err.message}`);
    return false;
  } finally {
    updateNavBadges();
  }
}
