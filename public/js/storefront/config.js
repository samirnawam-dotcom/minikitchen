// Site content: site configuration, menu categories and the LBP exchange rate.
// Precedence: server (/api/state) > localStorage cache (last server copy) > bundled defaults in ../data/*.
// The bundled defaults are treated as read-only and always cloned before use.

import SITE_CONFIG from '../data/site-config.js';
import { MENU_CATEGORIES, MODIFIER_GROUPS } from '../data/menu.js';
import { deepClone } from '../shared/dom.js';
import { loadJson, saveJson, getItem, setItem, removeItem } from '../shared/storage.js';

export const CONFIG_KEY = 'mk_custom_site_config_v3';
export const MENU_KEY = 'mk_custom_menu_data_v3';
export const LBP_KEY = 'mk_custom_lbp_rate_v1';
export const DEFAULT_LBP_RATE = 89500;

export const SAFE_PASTA_FALLBACK =
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80';
export const SAFE_DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';

const BROKEN_IMAGE_ID = '1621996346565'; // an Unsplash photo that no longer exists

const isPlainObject = v => Boolean(v) && typeof v === 'object' && !Array.isArray(v);

/** Live content used by every view. Mutated in place so importers always see the latest copy. */
export const content = {
  config: null,
  menu: [],
  lbpRate: DEFAULT_LBP_RATE
};

/** Fills in missing top-level keys (and one level of nested objects) from the bundled defaults. */
function mergeWithDefaults(saved) {
  const merged = deepClone(SITE_CONFIG);
  if (!isPlainObject(saved)) return merged;
  for (const [key, value] of Object.entries(saved)) {
    merged[key] = isPlainObject(value) && isPlainObject(merged[key]) ? { ...merged[key], ...value } : value;
  }
  return merged;
}

/** Replaces dead image URLs and guarantees every dish has a fallback image. Mutates and returns `categories`. */
export function sanitizeMenuImages(categories) {
  if (!Array.isArray(categories)) return [];
  const itemImgMap = {
    'mk-item-93': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=800&q=80',
    'mk-item-94': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
    'mk-item-96': 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80'
  };
  const broken = url => typeof url === 'string' && url.includes(BROKEN_IMAGE_ID);
  for (const cat of categories) {
    if (!isPlainObject(cat)) continue;
    if (!Array.isArray(cat.items)) cat.items = [];
    if (broken(cat.fallbackImg)) cat.fallbackImg = SAFE_PASTA_FALLBACK;
    if (broken(cat.thumbImg)) cat.thumbImg = SAFE_PASTA_FALLBACK;
    for (const it of cat.items) {
      if (itemImgMap[it.id] && (!it.img || broken(it.img))) it.img = itemImgMap[it.id];
      else if (broken(it.img)) it.img = SAFE_PASTA_FALLBACK;
      if (!it.fallbackImg || broken(it.fallbackImg) || it.fallbackImg === it.img) {
        it.fallbackImg = cat.id === 'pasta' ? SAFE_PASTA_FALLBACK : cat.fallbackImg || SAFE_DEFAULT_FALLBACK;
      }
    }
  }
  return categories.filter(isPlainObject);
}

function menuFrom(saved) {
  const source = Array.isArray(saved) && saved.length > 0 ? saved : deepClone(MENU_CATEGORIES);
  return sanitizeMenuImages(source);
}

/** Loads content from the localStorage cache (or the bundled defaults). Used at start-up and on cross-tab changes. */
export function loadContentFromCache() {
  content.config = mergeWithDefaults(loadJson(CONFIG_KEY));
  content.menu = menuFrom(loadJson(MENU_KEY));
  content.lbpRate = Number(getItem(LBP_KEY)) || DEFAULT_LBP_RATE;
}

/**
 * Applies the public `/api/state` payload. The server always wins: a `null` siteConfig/menu means
 * "use the defaults" (e.g. after a Back Office reset), so the local cache is dropped too.
 * Returns true when anything visible changed.
 */
export function applyServerContent(data) {
  const before = JSON.stringify([content.config, content.menu, content.lbpRate]);

  const rate = Number(data.lbpRate);
  if (rate > 0) {
    content.lbpRate = rate;
    setItem(LBP_KEY, rate);
  }
  if ('siteConfig' in data) {
    content.config = mergeWithDefaults(data.siteConfig);
    if (isPlainObject(data.siteConfig)) saveJson(CONFIG_KEY, data.siteConfig);
    else removeItem(CONFIG_KEY);
  }
  if ('menuCategories' in data) {
    const hasMenu = Array.isArray(data.menuCategories) && data.menuCategories.length > 0;
    content.menu = menuFrom(hasMenu ? data.menuCategories : null);
    if (hasMenu) saveJson(MENU_KEY, data.menuCategories);
    else removeItem(MENU_KEY);
  }

  return JSON.stringify([content.config, content.menu, content.lbpRate]) !== before;
}

// ---------------------------------------------------------------------------
// Typed accessors with sensible fallbacks for lists an owner may have emptied
// ---------------------------------------------------------------------------
const listOr = (value, fallback) => (Array.isArray(value) && value.length > 0 ? value : fallback);

export function getDeliveryZones() {
  return listOr(
    content.config.deliveryZones,
    listOr(SITE_CONFIG.deliveryZones, [
      { id: 'zone-ain-al-remmaneh', name: 'Ain Al Remmaneh (Local Area)', feeUsd: 1.0, eta: '20–30 min' },
      { id: 'zone-aley-center', name: 'Aley Center / Ras El Jabal / Souk', feeUsd: 2.0, eta: '25–35 min' },
      { id: 'zone-bhamdoun-souk', name: 'Bhamdoun / Souk El Gharb / Bsous', feeUsd: 3.0, eta: '30–45 min' },
      { id: 'zone-kahale-araya', name: 'Kahale / Araya / Jamhour', feeUsd: 4.0, eta: '35–50 min' },
      { id: 'zone-pickup', name: 'Restaurant Dine-In / Self Pickup (Aley Terrace)', feeUsd: 0.0, eta: '15–25 min' }
    ])
  );
}

export function getPromoCodes() {
  return listOr(content.config.promoCodes, SITE_CONFIG.promoCodes || []);
}

export function getStationAddons() {
  return listOr(
    content.config.stationAddons,
    listOr(SITE_CONFIG.stationAddons, [
      { id: 'st-burger', name: 'Live Charcoal Burger & Cheddar Syringe Station', pricePerGuest: 5 },
      { id: 'st-saj', name: 'Live Lebanese Saj & Bil Foron Bakery Station', pricePerGuest: 4 },
      { id: 'st-pasta', name: 'Live Italian Pasta & Truffle Parmesan Wheel', pricePerGuest: 5 },
      { id: 'st-knefe', name: 'Live Oriental Knefe & Dessert Bar', pricePerGuest: 4 },
      { id: 'st-welcome', name: 'Welcome Mocktail & Grazing Canapé Reception', pricePerGuest: 3 }
    ])
  );
}

export function getTestimonials() {
  return listOr(content.config.testimonials, SITE_CONFIG.testimonials || []);
}

/** Array-valued config sections that the page templates iterate over. */
export const configList = key => (Array.isArray(content.config[key]) ? content.config[key] : []);

export function findDish(itemId) {
  for (const cat of content.menu) {
    const item = cat.items.find(i => i.id === itemId);
    if (item) return { item, cat };
  }
  return null;
}

export function getModifierGroups(cat) {
  if (cat && cat.modType && MODIFIER_GROUPS[cat.modType]) return MODIFIER_GROUPS[cat.modType];
  // Universal serving preference so every dish is customisable
  return [
    {
      id: 'serving-pref',
      name: 'Serving & Preparation Preference',
      required: true,
      type: 'radio',
      options: [
        { label: 'Chef Signature Preparation', price: 0, default: true },
        { label: 'Extra Hot / Fresh from Oven', price: 0 },
        { label: 'Dressings & Sauces on the Side', price: 0 }
      ]
    }
  ];
}

loadContentFromCache();
