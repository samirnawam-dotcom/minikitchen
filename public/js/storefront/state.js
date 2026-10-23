// UI state of the storefront (current page, tabs, filters, package builder, cart) plus cart persistence.
// Content (site config, menu, LBP rate) lives in ./config.js; this module only holds visitor state.

import { loadJson, saveJson, getItem } from '../shared/storage.js';

const CART_KEY = 'mk_delivery_cart_v2';
const ZONE_KEY = 'mk_selected_zone_id';
const LANG_KEY = 'mk_site_lang';

const params = new URLSearchParams(window.location.search);
const rawTable = params.get('table');
const tableNumber = (rawTable || '').replace(/[^0-9A-Za-z-]/g, '').slice(0, 12);

export const PAGE_IDS = ['catering', 'catering-menus', 'restaurant', 'delivery', 'about', 'contact'];

/** Cart lines are persisted in localStorage, so normalise anything that comes back from it. */
function loadCart() {
  const saved = loadJson(CART_KEY, []);
  if (!Array.isArray(saved)) return [];
  return saved
    .filter(item => item && typeof item === 'object' && item.id)
    .map(item => ({
      ...item,
      title: String(item.title || ''),
      priceValue: Number(item.priceValue) || 0,
      qty: Math.max(1, Math.floor(Number(item.qty) || 1)),
      modifiers: Array.isArray(item.modifiers) ? item.modifiers.map(String) : [],
      note: String(item.note || '')
    }));
}

export const state = {
  currentPage: 'catering', // one of PAGE_IDS
  cateringMenusTab: 'buffet', // 'buffet' | 'birthday' | 'stations' | 'trays' | 'bites'
  restoViewTab: 'menu', // 'menu' | 'atmosphere'
  deliveryCategory: 'all',
  deliverySearch: '',
  restoCategory: 'all',
  restoSearch: '',
  dietaryFilter: 'all', // 'all' | 'popular' | 'spicy' | 'vegetarian' | 'sharing'
  currency: 'USD', // 'USD' | 'LBP'
  menuLayout: 'split', // 'split' (FineDine horizontal cards) | 'grid' (photo grid)
  qrTableMode: params.get('qr') === '1',
  tableNumber,
  lang: getItem(LANG_KEY) === 'ar' ? 'ar' : 'en',
  selectedZoneId: rawTable ? 'zone-pickup' : getItem(ZONE_KEY) || 'zone-ain-al-remmaneh',
  appliedPromoCode: '',
  cartFormCache: rawTable ? { address: `Table #${tableNumber} (Aley Terrace Dine-In)` } : {},
  // "Build your package" (package-builder.js): everything the visitor has chosen or typed so far
  builder: {
    pkgId: '',
    guests: 50,
    picks: {}, // choice group id -> chosen dish names
    stationOpt: {}, // station id -> index of the per-person option
    kg: {}, // "stationId:optionIndex" -> kg
    trays: {}, // tray id -> quantity
    bites: {}, // mini bite id -> quantity
    extras: [], // extra ids (priced on request)
    prefs: '',
    date: '',
    location: '',
    name: '',
    phone: '',
    notes: ''
  },
  modalCtx: null,
  cart: loadCart()
};

export const LANG_STORAGE_KEY = LANG_KEY;
export const ZONE_STORAGE_KEY = ZONE_KEY;

export function saveCart() {
  saveJson(CART_KEY, state.cart);
}

export const cartCount = () => state.cart.reduce((sum, item) => sum + item.qty, 0);
export const cartSubtotal = () => state.cart.reduce((sum, item) => sum + item.priceValue * item.qty, 0);

/** Brand used for colours and WhatsApp numbers on a given page. */
export function brandForPage(pageId) {
  if (pageId === 'restaurant' || pageId === 'delivery') return pageId;
  return 'catering';
}
