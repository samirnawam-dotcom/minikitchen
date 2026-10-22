// Back Office state: server data (site config, menu, orders, LBP rate), UI state and the
// localStorage cache that lets the page paint before the first /api/state response.

import DEFAULT_SITE_CONFIG from '../data/site-config.js';
import { MENU_CATEGORIES as DEFAULT_MENU_CATEGORIES } from '../data/menu.js';
import { deepClone } from '../shared/dom.js';
import { loadJson, saveJson, getItem, setItem, removeItem } from '../shared/storage.js';

export const DEFAULT_LBP_RATE = 89500;

// Shared with the storefront, which reads (and writes) the same cache keys.
export const KEYS = {
  siteConfig: 'mk_custom_site_config_v3',
  menu: 'mk_custom_menu_data_v3',
  lbpRate: 'mk_custom_lbp_rate_v1',
  orders: 'mk_backoffice_orders_v1',
  uiTheme: 'mk_bo_ui_theme',
  soundAlerts: 'mk_bo_sound_alerts',
  siteTheme: 'mk_theme_mode'
};

const BROKEN_PHOTO = '1621996346565';
const SAFE_PASTA = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80';
const ITEM_PHOTO_FIXES = {
  'mk-item-93': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=800&q=80',
  'mk-item-94': SAFE_PASTA,
  'mk-item-96': 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80'
};

/** Replaces a known-dead Unsplash photo in older menu data with working ones (mutates). */
function repairMenuPhotos(categories) {
  if (!Array.isArray(categories)) return categories;
  for (const cat of categories) {
    if (cat.fallbackImg?.includes(BROKEN_PHOTO)) cat.fallbackImg = SAFE_PASTA;
    if (cat.thumbImg?.includes(BROKEN_PHOTO)) cat.thumbImg = SAFE_PASTA;
    for (const item of Array.isArray(cat.items) ? cat.items : []) {
      if (ITEM_PHOTO_FIXES[item.id] && (!item.img || item.img.includes(BROKEN_PHOTO))) {
        item.img = ITEM_PHOTO_FIXES[item.id];
      } else if (item.img?.includes(BROKEN_PHOTO)) {
        item.img = SAFE_PASTA;
      }
      if (!item.fallbackImg || item.fallbackImg.includes(BROKEN_PHOTO)) item.fallbackImg = SAFE_PASTA;
    }
    if (!Array.isArray(cat.items)) cat.items = [];
  }
  return categories;
}

export function defaultSiteConfig() {
  return deepClone(DEFAULT_SITE_CONFIG);
}

export function defaultMenuCategories() {
  return repairMenuPhotos(deepClone(DEFAULT_MENU_CATEGORIES));
}

/** Server-backed data. Tabs mutate these objects in place and then call a save function in sync.js. */
export const data = {
  siteConfig: loadJson(KEYS.siteConfig) || defaultSiteConfig(),
  menuCategories: repairMenuPhotos(loadJson(KEYS.menu)) || defaultMenuCategories(),
  lbpRate: Number(getItem(KEYS.lbpRate)) || DEFAULT_LBP_RATE,
  orders: loadJson(KEYS.orders, [])
};
if (!Array.isArray(data.orders)) data.orders = [];
if (!Array.isArray(data.menuCategories)) data.menuCategories = defaultMenuCategories();

/** UI state: active tab, filters and session details. */
export const ui = {
  activeTab: 'dashboard',
  orderTypeFilter: 'all', // all | delivery_order | catering_quote | table_reservation | whatsapp_inquiry
  orderStatusFilter: 'all', // all | new | confirmed | preparing | out_for_delivery | completed | cancelled
  orderSearch: '',
  menuCatFilter: 'all',
  menuStockFilter: 'all', // all | available | soldout
  menuSearch: '',
  cateringSubTab: 'packages', // packages | stations
  contentSubTab: 'cateringGallery', // cateringGallery | restaurantGallery | teamMembers | behindTheScenes
  seoPageKey: 'catering',
  tableQrCount: 12,
  authenticated: false,
  databaseInfo: null,
  auditLogs: [],
  adminUser: {
    username: 'admin',
    displayName: 'Mini Kitchen Executive Admin',
    role: 'Owner & Hospitality Director'
  }
};

// ---- Server data setters (also refresh the local cache) -------------------------------------

export function setSiteConfig(config) {
  data.siteConfig = config;
  if (!data.siteConfig.seo && DEFAULT_SITE_CONFIG.seo) data.siteConfig.seo = deepClone(DEFAULT_SITE_CONFIG.seo);
  saveJson(KEYS.siteConfig, data.siteConfig);
}

export function setMenuCategories(categories) {
  data.menuCategories = repairMenuPhotos(categories);
  saveJson(KEYS.menu, data.menuCategories);
}

export function setLbpRate(rate) {
  data.lbpRate = Number(rate) || DEFAULT_LBP_RATE;
  setItem(KEYS.lbpRate, data.lbpRate);
}

export function setOrders(orders) {
  data.orders = Array.isArray(orders) ? orders : [];
  saveJson(KEYS.orders, data.orders);
}

export function cacheSiteConfig() {
  saveJson(KEYS.siteConfig, data.siteConfig);
  setItem(KEYS.lbpRate, data.lbpRate);
}

export function cacheMenu() {
  saveJson(KEYS.menu, data.menuCategories);
}

/** Cached orders contain customer names, phones and addresses; drop them when signing out. */
export function clearOrders() {
  data.orders = [];
  removeItem(KEYS.orders);
}

export function clearContentCache() {
  removeItem(KEYS.siteConfig);
  removeItem(KEYS.menu);
  removeItem(KEYS.lbpRate);
}

// ---- Lookups ----------------------------------------------------------------------------------

export const findOrder = id => data.orders.find(o => o.id === id);

export function findDish(catId, itemId) {
  const cat = data.menuCategories.find(c => c.id === catId);
  const item = cat?.items.find(i => i.id === itemId);
  return { cat, item };
}

/** Returns a list from the site config, seeding it from the bundled defaults when missing. */
export function siteList(key, { seedWhenEmpty = false } = {}) {
  const current = data.siteConfig[key];
  if (!Array.isArray(current) || (seedWhenEmpty && current.length === 0)) {
    data.siteConfig[key] = deepClone(DEFAULT_SITE_CONFIG[key] || []);
  }
  return data.siteConfig[key];
}

export function ensureSeo() {
  const config = data.siteConfig;
  if (!config.seo) {
    config.seo = deepClone(
      DEFAULT_SITE_CONFIG.seo || {
        siteUrl: 'https://minikitchencatering.com',
        businessName: 'Mini Kitchen — Catering, Restaurant & Delivery',
        geoRegion: 'LB-JL',
        geoPlacename: 'Ain Al Remmaneh, Aley, Mount Lebanon, Lebanon',
        pages: {}
      }
    );
  }
  if (!config.seo.pages) config.seo.pages = deepClone(DEFAULT_SITE_CONFIG.seo?.pages || {});
  return config.seo;
}
