// ============================================================================
// MINI KITCHEN — MULTI-BRAND APPLICATION CONTROLLER
// Powers:
// 1. Mini Kitchen Catering (Homepage + Wedding Showcase + Event Quote Builder)
// 2. Catering Menus & Event Packages (Dedicated Page)
// 3. Mini Kitchen Restaurant (Dedicated Page + Scenic Views + Digital Menu)
// 4. Mini Kitchen Delivery (Dedicated Page + 239-Item Menu + WhatsApp Cart)
// 5. About Us (Story, Chefs, Kitchen Team & Behind-the-Scenes)
// 6. Contact Us (Multi-Brand WhatsApp Hub & Interactive Map)
// 7. Owner Easy Menu & Price Editor (Built-in CMS Modal)
// ============================================================================

(function () {
  let CONFIG = loadSavedSiteConfig() || window.MK_SITE_CONFIG;
  let MENU_DATA = loadSavedMenuData() || window.MK_MENU_CATEGORIES;
  const MODIFIER_GROUPS = window.MK_MODIFIER_GROUPS || {};
  let LBP_RATE = Number(localStorage.getItem('mk_custom_lbp_rate_v1')) || 89500;

  // Application State
  const state = {
    currentPage: 'catering', // 'catering' | 'catering-menus' | 'restaurant' | 'delivery' | 'about' | 'contact'
    homeShowcaseTab: 'packages', // 'packages' | 'weddings' | 'stations'
    cateringMenusTab: 'packages', // 'packages' | 'alacarte'
    restoViewTab: 'menu', // 'menu' | 'atmosphere'
    cateringPkgFilter: 'all',
    cateringAlaCarteCat: 'all',
    cateringAlaCarteSearch: '',
    deliveryCategory: 'all',
    deliverySearch: '',
    restoCategory: 'all',
    restoSearch: '',
    dietaryFilter: 'all', // 'all' | 'popular' | 'spicy' | 'vegetarian' | 'sharing'
    currency: 'USD', // 'USD' | 'LBP'
    menuLayout: 'split', // 'split' (FineDine Horizontal Split Card) | 'grid' (Photo Grid)
    qrTableMode: new URLSearchParams(window.location.search).get('qr') === '1',
    tableNumber: (new URLSearchParams(window.location.search).get('table') || '').replace(/[^0-9A-Za-z-]/g, '').slice(0, 12),
    lang: localStorage.getItem('mk_site_lang') === 'ar' ? 'ar' : 'en',
    selectedZoneId: new URLSearchParams(window.location.search).get('table')
      ? 'zone-pickup'
      : localStorage.getItem('mk_selected_zone_id') || 'zone-ain-al-remmaneh',
    appliedPromoCode: '',
    cartFormCache: new URLSearchParams(window.location.search).get('table')
      ? { address: `Table #${new URLSearchParams(window.location.search).get('table')} (Aley Terrace Dine-In)` }
      : {},
    calcGuests: 120,
    calcPkgIdx: 0,
    calcStations: ['st-burger'],
    modalCtx: null,
    cart: loadCartFromStorage()
  };

  // Offline-resilient fallback SVG QR code data URI
  const FALLBACK_QR_SVG =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
        <rect width="120" height="120" rx="8" fill="#ffffff"/>
        <rect x="10" y="10" width="32" height="32" rx="4" stroke="#14171c" stroke-width="6"/>
        <rect x="20" y="20" width="12" height="12" fill="#14171c"/>
        <rect x="78" y="10" width="32" height="32" rx="4" stroke="#14171c" stroke-width="6"/>
        <rect x="88" y="20" width="12" height="12" fill="#14171c"/>
        <rect x="10" y="78" width="32" height="32" rx="4" stroke="#14171c" stroke-width="6"/>
        <rect x="20" y="88" width="12" height="12" fill="#14171c"/>
        <rect x="52" y="14" width="8" height="8" fill="#14171c"/>
        <rect x="52" y="30" width="8" height="16" fill="#14171c"/>
        <rect x="14" y="52" width="16" height="8" fill="#14171c"/>
        <rect x="38" y="52" width="24" height="8" fill="#14171c"/>
        <rect x="70" y="52" width="16" height="8" fill="#14171c"/>
        <rect x="94" y="52" width="14" height="8" fill="#14171c"/>
        <rect x="52" y="68" width="16" height="16" fill="#14171c"/>
        <rect x="76" y="76" width="14" height="14" fill="#14171c"/>
        <rect x="96" y="76" width="12" height="32" fill="#14171c"/>
        <rect x="52" y="96" width="32" height="12" fill="#14171c"/>
      </svg>`
    );

  function getQrMenusMeta() {
    const baseOrigin =
      window.location.origin && window.location.origin !== 'null'
        ? window.location.origin
        : 'http://minikitchencatering.com';
    return {
      catering: {
        mode: 'catering',
        pageId: 'catering-menus',
        badge: 'QR Menu #1 • Weddings & Events',
        shortLabel: 'Catering & Events QR Menu',
        title: 'Mini Kitchen Catering & Packages Menu',
        desc: 'Dedicated QR code for wedding couples, corporate planners & event hosts to browse packages and FineDine catering trays.',
        color: '#c59b27',
        phone: CONFIG.contacts.catering.phoneDisplay,
        url: `${baseOrigin}/catering-menus.html?qr=1#catering-menus`,
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
        phone: CONFIG.contacts.restaurant.phoneDisplay,
        url: `${baseOrigin}/restaurant.html?qr=1#restaurant`,
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
        phone: CONFIG.contacts.delivery.phoneDisplay,
        url: `${baseOrigin}/delivery.html?qr=1#delivery`,
        tableHint: 'Delivery Flyer & Packaging Box QR'
      }
    };
  }

  function getQrImageSrc(targetUrl, size = 240) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&color=14171c&bgcolor=ffffff&data=${encodeURIComponent(
      targetUrl
    )}`;
  }

  window.toggleQrTableMode = function (forceState) {
    state.qrTableMode = typeof forceState === 'boolean' ? forceState : !state.qrTableMode;
    document.body.classList.toggle('qr-table-mode', state.qrTableMode);
    renderMainView();
    showToast(
      state.qrTableMode
        ? 'QR Table Mode enabled: Hero banners hidden for fast menu scanning'
        : 'Standard website view restored'
    );
  };

  window.setHomeShowcaseTab = function (tab) {
    state.homeShowcaseTab = tab;
    renderMainView();
  };

  window.setCateringMenusTab = function (tab) {
    state.cateringMenusTab = tab;
    renderMainView();
  };

  window.setRestoViewTab = function (tab) {
    state.restoViewTab = tab;
    renderMainView();
  };

  function formatPrice(usdAmount) {
    const val = Number(usdAmount) || 0;
    if (state.currency === 'LBP') {
      const lbp = Math.round(val * LBP_RATE);
      return `${lbp.toLocaleString('en-US')} L.L.`;
    }
    return `$${val.toFixed(2)}`;
  }

  window.setMenuCurrency = function (curr) {
    state.currency = curr === 'LBP' ? 'LBP' : 'USD';
    renderMainView();
    renderFdFloatingOrderBar();
  };

  window.setMenuLayout = function (layout) {
    state.menuLayout = layout === 'grid' ? 'grid' : 'split';
    renderMainView();
  };

  window.setDietaryFilter = function (filter) {
    state.dietaryFilter = filter || 'all';
    renderMainView();
  };

  function loadSavedSiteConfig() {
    try {
      const saved = localStorage.getItem('mk_custom_site_config_v3');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  const SAFE_PASTA_FALLBACK = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80';
  const SAFE_DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
  const INLINE_DISH_SVG =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
        <rect width="400" height="300" fill="#181b22"/>
        <circle cx="200" cy="140" r="64" stroke="#c59b27" stroke-width="2.5" fill="rgba(197,155,39,0.08)"/>
        <circle cx="200" cy="140" r="46" stroke="rgba(197,155,39,0.35)" stroke-width="1.5" stroke-dasharray="4 4"/>
        <text x="200" y="148" text-anchor="middle" fill="#e6c45a" font-family="Georgia, serif" font-size="22" font-weight="bold">MK</text>
        <text x="200" y="236" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="sans-serif" font-size="13" letter-spacing="2">MINI KITCHEN</text>
      </svg>`
    );

  function sanitizeMenuDataImages(categories) {
    if (!Array.isArray(categories)) return categories;
    const itemImgMap = {
      'mk-item-93': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=800&q=80',
      'mk-item-94': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
      'mk-item-96': 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80'
    };
    categories.forEach(cat => {
      if (cat.fallbackImg && cat.fallbackImg.includes('1621996346565')) {
        cat.fallbackImg = SAFE_PASTA_FALLBACK;
      }
      if (cat.thumbImg && cat.thumbImg.includes('1621996346565')) {
        cat.thumbImg = SAFE_PASTA_FALLBACK;
      }
      if (Array.isArray(cat.items)) {
        cat.items.forEach(it => {
          if (itemImgMap[it.id] && (!it.img || it.img.includes('1621996346565'))) {
            it.img = itemImgMap[it.id];
          } else if (it.img && it.img.includes('1621996346565')) {
            it.img = SAFE_PASTA_FALLBACK;
          }
          if (!it.fallbackImg || it.fallbackImg.includes('1621996346565') || it.fallbackImg === it.img) {
            it.fallbackImg = cat.id === 'pasta' ? SAFE_PASTA_FALLBACK : (cat.fallbackImg || SAFE_DEFAULT_FALLBACK);
          }
        });
      }
    });
    return categories;
  }

  function loadSavedMenuData() {
    try {
      const saved = localStorage.getItem('mk_custom_menu_data_v3');
      if (!saved) return null;
      const parsed = sanitizeMenuDataImages(JSON.parse(saved));
      localStorage.setItem('mk_custom_menu_data_v3', JSON.stringify(parsed));
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function loadCartFromStorage() {
    try {
      const saved = localStorage.getItem('mk_delivery_cart_v2');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCartToStorage() {
    try {
      localStorage.setItem('mk_delivery_cart_v2', JSON.stringify(state.cart));
    } catch (e) {}
  }

  // ==========================================================================
  // BACK OFFICE ORDER & WHATSAPP LEAD RECORDER (PERSISTS TO API + LOCALSTORAGE)
  // ==========================================================================
  let nextOrderSeqHint = Number(localStorage.getItem('mk_next_order_seq_v1')) || 1005;

  function allocateNextOrderId() {
    const seq = nextOrderSeqHint;
    nextOrderSeqHint = seq + 1;
    try {
      localStorage.setItem('mk_next_order_seq_v1', String(nextOrderSeqHint));
    } catch (e) {}
    return `MK-${seq}`;
  }

  function recordOrderToBackOffice(orderPayload) {
    const entry = {
      id: orderPayload.id || allocateNextOrderId(),
      createdAt: new Date().toISOString(),
      status: 'new',
      lbpRate: LBP_RATE,
      ...orderPayload
    };

    // 1. Save to localStorage for instant cross-tab sync
    try {
      const existing = JSON.parse(localStorage.getItem('mk_backoffice_orders_v1') || '[]');
      localStorage.setItem('mk_backoffice_orders_v1', JSON.stringify([entry, ...existing]));
    } catch (e) {}

    // 2. Persist to server.js SQLite REST API (/api/orders)
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
        keepalive: true
      })
        .then(r => (r.ok ? r.json() : null))
        .then(data => {
          if (data && data.order) {
            try {
              const list = JSON.parse(localStorage.getItem('mk_backoffice_orders_v1') || '[]');
              const idx = list.findIndex(o => o.id === entry.id || o.id === data.order.id);
              if (idx !== -1) list[idx] = data.order;
              else list.unshift(data.order);
              localStorage.setItem('mk_backoffice_orders_v1', JSON.stringify(list));
            } catch (e) {}
          }
        })
        .catch(() => {});
    } catch (e) {}

    return entry;
  }

  // Sync live configuration & menu updates from Back Office API
  async function syncWithBackOfficeServer() {
    try {
      const res = await fetch('/api/state', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      let changed = false;
      if (data.nextOrderSeq && Number(data.nextOrderSeq) >= 1000) {
        nextOrderSeqHint = Number(data.nextOrderSeq);
        localStorage.setItem('mk_next_order_seq_v1', String(nextOrderSeqHint));
      }
      if (data.lbpRate && Number(data.lbpRate) !== LBP_RATE) {
        LBP_RATE = Number(data.lbpRate);
        localStorage.setItem('mk_custom_lbp_rate_v1', String(LBP_RATE));
        changed = true;
      }
      if (data.siteConfig) {
        CONFIG = data.siteConfig;
        localStorage.setItem('mk_custom_site_config_v3', JSON.stringify(CONFIG));
        changed = true;
      }
      if (Array.isArray(data.menuCategories) && data.menuCategories.length > 0) {
        MENU_DATA = sanitizeMenuDataImages(data.menuCategories);
        localStorage.setItem('mk_custom_menu_data_v3', JSON.stringify(MENU_DATA));
        changed = true;
      }
      if (Array.isArray(data.orders)) {
        localStorage.setItem('mk_backoffice_orders_v1', JSON.stringify(data.orders));
      }
      if (changed) {
        renderMainView();
        renderFdFloatingOrderBar();
      }
    } catch (e) {}
  }

  // WhatsApp URL Generator (Also logs direct WhatsApp inquiries to Back Office)
  window.openWhatsApp = function (brandKey, customMessage, skipAutoLog) {
    const brand = CONFIG.contacts[brandKey] || CONFIG.contacts.catering;
    const text = customMessage || brand.defaultGreeting;

    if (!skipAutoLog) {
      recordOrderToBackOffice({
        type: brandKey === 'restaurant' ? 'table_reservation' : 'whatsapp_inquiry',
        brand: brandKey || 'catering',
        customerName: 'Website WhatsApp Visitor',
        customerPhone: 'Via WhatsApp Chat',
        address: state.currentPage ? `From ${state.currentPage} page` : 'Website',
        eventType:
          brandKey === 'restaurant'
            ? 'Table Reservation / Dining Inquiry'
            : brandKey === 'delivery'
            ? 'Direct Delivery Chat'
            : 'Catering & Event Inquiry',
        notes: text,
        items: [],
        totalUsd: 0,
        staffNotes: 'Direct WhatsApp button clicked on website',
        whatsappText: text
      });
    }

    const url = `https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Multi-stage resilient image fallback handler
  window.handleImgError = function (imgEl, fallbackUrl) {
    const stage = Number(imgEl.dataset.fallbackStage || 0);
    if (stage === 0) {
      imgEl.dataset.fallbackStage = '1';
      if (
        fallbackUrl &&
        fallbackUrl !== imgEl.src &&
        !fallbackUrl.includes('1621996346565')
      ) {
        imgEl.src = fallbackUrl;
        return;
      }
      if (imgEl.src !== SAFE_DEFAULT_FALLBACK) {
        imgEl.src = SAFE_DEFAULT_FALLBACK;
        return;
      }
    }
    if (stage === 1) {
      imgEl.dataset.fallbackStage = '2';
      if (imgEl.src !== SAFE_DEFAULT_FALLBACK) {
        imgEl.src = SAFE_DEFAULT_FALLBACK;
        return;
      }
    }
    imgEl.dataset.fallbackStage = '3';
    imgEl.onerror = null;
    imgEl.src = INLINE_DISH_SVG;
  };

  // ==========================================================================
  // DARK / LIGHT MODE THEME CONTROLLER & DYNAMIC SEO META UPDATER
  // ==========================================================================
  function getSavedThemeMode() {
    try {
      const saved = localStorage.getItem('mk_theme_mode');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}
    return (CONFIG && CONFIG.defaultTheme === 'dark') ? 'dark' : 'light';
  }

  function applySiteTheme(mode) {
    const cleanMode = mode === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', cleanMode);
    document.body.classList.toggle('dark-mode', cleanMode === 'dark');
    try {
      localStorage.setItem('mk_theme_mode', cleanMode);
    } catch (e) {}

    const iconEl = document.getElementById('themeToggleIcon');
    const headerBtn = document.getElementById('themeToggleBtn');
    if (iconEl) {
      iconEl.className = cleanMode === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
    if (headerBtn) {
      headerBtn.title = cleanMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }

    const drawerBtn = document.getElementById('drawerThemeSwitchBtn');
    if (drawerBtn) {
      drawerBtn.innerHTML =
        cleanMode === 'dark'
          ? '<i class="fa-solid fa-sun"></i> <span>Switch to Light Mode</span>'
          : '<i class="fa-solid fa-moon"></i> <span>Switch to Dark Mode</span>';
    }
  }

  window.toggleSiteTheme = function () {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applySiteTheme(next);
    showToast(next === 'dark' ? 'Dark Mode enabled' : 'Light Mode enabled');
  };

  function updatePageSeoMeta(pageId) {
    const fallbackSeo = (window.MK_SITE_CONFIG && window.MK_SITE_CONFIG.seo) || {};
    const seoCfg = (CONFIG && CONFIG.seo) || fallbackSeo;
    const pagesMap = (seoCfg && seoCfg.pages) || (fallbackSeo && fallbackSeo.pages) || {};
    const pageMeta = pagesMap[pageId] || pagesMap.catering;
    if (!pageMeta) return;

    if (pageMeta.title) {
      document.title = pageMeta.title;
      const ogTitle = document.getElementById('ogTitle');
      if (ogTitle) ogTitle.setAttribute('content', pageMeta.title);
      const twTitle = document.getElementById('twitterTitle');
      if (twTitle) twTitle.setAttribute('content', pageMeta.title);
    }
    if (pageMeta.description) {
      const descEl = document.getElementById('metaDescription') || document.querySelector('meta[name="description"]');
      if (descEl) descEl.setAttribute('content', pageMeta.description);
      const ogDesc = document.getElementById('ogDescription');
      if (ogDesc) ogDesc.setAttribute('content', pageMeta.description);
      const twDesc = document.getElementById('twitterDescription');
      if (twDesc) twDesc.setAttribute('content', pageMeta.description);
    }
    if (pageMeta.keywords) {
      const kwEl = document.getElementById('metaKeywords') || document.querySelector('meta[name="keywords"]');
      if (kwEl) kwEl.setAttribute('content', pageMeta.keywords);
    }
    const baseSiteUrl = (seoCfg && seoCfg.siteUrl) || 'https://minikitchencatering.com';
    const canonicalUrl = baseSiteUrl.replace(/\/$/, '') + (pageMeta.canonicalPath || '/');
    const canEl = document.getElementById('canonicalLink') || document.querySelector('link[rel="canonical"]');
    if (canEl) canEl.setAttribute('href', canonicalUrl);
    const ogUrl = document.getElementById('ogUrl');
    if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);
  }

  function dismissPreloader() {
    const preloader = document.getElementById('mkPreloader');
    if (!preloader) return;
    setTimeout(() => {
      preloader.classList.add('mk-preloader-hidden');
    }, 520);
  }

  // ==========================================================================
  // NAVIGATION & PAGE ROUTING
  // ==========================================================================
  window.navigateToPage = function (pageId, scrollTargetId) {
    const validPages = ['catering', 'catering-menus', 'restaurant', 'delivery', 'about', 'contact'];
    if (!validPages.includes(pageId)) pageId = 'catering';
    state.currentPage = pageId;

    // Set brand theme attribute on body
    if (pageId === 'restaurant') {
      document.body.setAttribute('data-brand', 'restaurant');
    } else if (pageId === 'delivery') {
      document.body.setAttribute('data-brand', 'delivery');
    } else {
      document.body.setAttribute('data-brand', 'catering');
    }

    // Update URL hash without jumping
    if (history.pushState) {
      history.pushState(null, null, `#${pageId}`);
    } else {
      location.hash = `#${pageId}`;
    }

    updatePageSeoMeta(pageId);
    closeNavDrawer();
    renderHeaderActiveStates();
    renderMainView();
    renderFdFloatingOrderBar();

    if (scrollTargetId) {
      setTimeout(() => {
        const el = document.getElementById(scrollTargetId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  window.openNavDrawer = function () {
    document.getElementById('navDrawer')?.classList.add('open');
    document.getElementById('navDrawerBackdrop')?.classList.add('open');
  };

  window.closeNavDrawer = function () {
    document.getElementById('navDrawer')?.classList.remove('open');
    document.getElementById('navDrawerBackdrop')?.classList.remove('open');
  };

  window.openCartDrawer = function () {
    renderCartDrawer();
    document.getElementById('cartDrawer')?.classList.add('open');
    document.getElementById('navDrawerBackdrop')?.classList.add('open');
  };

  window.closeCartDrawer = function () {
    document.getElementById('cartDrawer')?.classList.remove('open');
    document.getElementById('navDrawerBackdrop')?.classList.remove('open');
  };

  function renderHeaderActiveStates() {
    document.querySelectorAll('[data-nav-page]').forEach(el => {
      if (el.getAttribute('data-nav-page') === state.currentPage) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    const subEl = document.getElementById('headerBrandSub');
    const waHeaderBtn = document.getElementById('headerWaBtn');
    if (subEl) {
      if (state.currentPage === 'restaurant') {
        subEl.textContent = 'Restaurant • Aley';
      } else if (state.currentPage === 'delivery') {
        subEl.textContent = 'Delivery • Fast Order';
      } else {
        subEl.textContent = 'Catering & Events';
      }
    }
    if (waHeaderBtn) {
      if (state.currentPage === 'delivery') {
        waHeaderBtn.onclick = () => openWhatsApp('delivery');
        waHeaderBtn.querySelector('.wa-text').textContent = 'Order on WhatsApp';
      } else if (state.currentPage === 'restaurant') {
        waHeaderBtn.onclick = () => openWhatsApp('restaurant');
        waHeaderBtn.querySelector('.wa-text').textContent = 'Book a Table';
      } else {
        waHeaderBtn.onclick = () => openWhatsApp('catering');
        waHeaderBtn.querySelector('.wa-text').textContent = 'Catering WhatsApp';
      }
    }
  }

  // ==========================================================================
  // FINEDINE INTERACTIVE DISH DETAIL & MODIFIER MODAL
  // ==========================================================================
  function findDishAndCategory(itemId) {
    for (const cat of MENU_DATA) {
      const item = cat.items.find(i => i.id === itemId);
      if (item) return { item, cat };
    }
    return null;
  }

  function getModifierGroupsForCategory(cat) {
    if (cat && cat.modType && MODIFIER_GROUPS[cat.modType]) {
      return MODIFIER_GROUPS[cat.modType];
    }
    // Universal FineDine serving preference group so every dish is customizable
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

  function ensureFineDineModalDom() {
    let backdrop = document.getElementById('fdModalBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'fdModalBackdrop';
      backdrop.className = 'fd-modal-backdrop';
      backdrop.onclick = function (e) {
        if (e.target === backdrop) closeFineDineModal();
      };
      document.body.appendChild(backdrop);
    }
    return backdrop;
  }

  window.openFineDineModal = function (itemId, mode) {
    const found = findDishAndCategory(itemId);
    if (!found) return;
    const { item, cat } = found;
    const modGroups = getModifierGroupsForCategory(cat);

    state.modalCtx = {
      item,
      cat,
      mode: mode || 'delivery',
      qty: 1,
      modGroups
    };

    const backdrop = ensureFineDineModalDom();
    const badgesHtml = (item.badges || [])
      .map(b => {
        if (b === 'Popular') return `<span class="fd-badge popular"><i class="fa-solid fa-fire"></i> Popular</span>`;
        if (b === 'Spicy') return `<span class="fd-badge spicy"><i class="fa-solid fa-pepper-hot"></i> Spicy</span>`;
        if (b === 'Vegetarian') return `<span class="fd-badge vegetarian"><i class="fa-solid fa-leaf"></i> Vegetarian</span>`;
        if (b === 'Sharing') return `<span class="fd-badge sharing"><i class="fa-solid fa-users"></i> Sharing</span>`;
        return '';
      })
      .join('');

    const modGroupsHtml = modGroups
      .map(
        (grp, gIdx) => `
        <div class="fd-mod-group">
          <div class="fd-mod-header">
            <span class="fd-mod-name">${grp.name}</span>
            <span class="fd-mod-pill ${grp.required ? 'required' : 'optional'}">
              ${grp.required ? 'Required • Choose 1' : 'Optional • Select any'}
            </span>
          </div>
          <div class="fd-mod-options-list">
            ${grp.options
              .map(
                (opt, oIdx) => `
              <label class="fd-mod-option">
                <span class="fd-mod-option-left">
                  <input
                    type="${grp.type === 'radio' ? 'radio' : 'checkbox'}"
                    name="fd-mod-${grp.id}"
                    data-group-idx="${gIdx}"
                    data-opt-idx="${oIdx}"
                    data-opt-label="${opt.label.replace(/"/g, '&quot;')}"
                    data-opt-price="${opt.price || 0}"
                    ${opt.default ? 'checked' : ''}
                    onchange="recalcFdModalTotal()"
                  />
                  <span>${opt.label}</span>
                </span>
                <span class="fd-mod-option-price">
                  ${opt.price > 0 ? `+ ${formatPrice(opt.price)}` : 'Included'}
                </span>
              </label>
            `
              )
              .join('')}
          </div>
        </div>
      `
      )
      .join('');

    backdrop.innerHTML = `
      <div class="fd-modal-dialog" role="dialog" aria-modal="true">
        <div class="fd-modal-hero">
          <img src="${item.img}" onerror="handleImgError(this, '${item.fallbackImg}')" alt="${item.title.replace(/"/g, '&quot;')}" />
          <button class="fd-modal-close" onclick="closeFineDineModal()" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
          <div class="fd-modal-hero-badges">
            <span style="background:rgba(14,16,21,0.86); color:var(--brand-primary); padding:4px 11px; border-radius:999px; font-size:0.72rem; font-weight:800;">
              <i class="fa-solid ${cat.icon}"></i> ${cat.name}
            </span>
            <span style="background:rgba(14,16,21,0.86); color:#fff; padding:4px 11px; border-radius:999px; font-size:0.72rem; font-weight:700;">
              <i class="fa-regular fa-clock"></i> ${item.prepTime || '15–20 min'}
            </span>
            ${badgesHtml}
          </div>
        </div>

        <div class="fd-modal-body">
          <div class="fd-modal-title-row">
            <h3 class="fd-modal-title">${item.title}</h3>
            <span class="fd-modal-base-price">${formatPrice(item.priceValue)}</span>
          </div>
          <p class="fd-modal-desc">
            ${item.desc || 'Prepared fresh to order in our Ain Al Remmaneh, Aley kitchen using signature Mini Kitchen ingredients.'}
          </p>

          ${modGroupsHtml}

          <div class="fd-modal-notes-wrap">
            <label for="fdModalSpecialNote"><i class="fa-regular fa-comment-dots"></i> Special Instructions for the Kitchen (Optional)</label>
            <input
              type="text"
              id="fdModalSpecialNote"
              class="form-control"
              placeholder="e.g., No pickles, extra napkins, allergy note, or event tray request..."
            />
          </div>
        </div>

        <div class="fd-modal-footer">
          <div class="fd-qty-stepper">
            <button type="button" class="fd-qty-btn" onclick="changeFdModalQty(-1)">−</button>
            <span class="fd-qty-val" id="fdModalQtyDisplay">1</span>
            <button type="button" class="fd-qty-btn" onclick="changeFdModalQty(1)">+</button>
          </div>
          <button type="button" class="fd-modal-submit-btn" id="fdModalSubmitBtn" onclick="confirmFdModalAdd()">
            <span><i class="fa-solid fa-bag-shopping"></i> Add to Order</span>
            <span id="fdModalLiveTotal">${formatPrice(item.priceValue)}</span>
          </button>
        </div>
      </div>
    `;

    backdrop.classList.add('open');
    recalcFdModalTotal();
  };

  window.closeFineDineModal = function () {
    const backdrop = document.getElementById('fdModalBackdrop');
    if (backdrop) backdrop.classList.remove('open');
    state.modalCtx = null;
  };

  window.changeFdModalQty = function (delta) {
    if (!state.modalCtx) return;
    state.modalCtx.qty = Math.max(1, state.modalCtx.qty + delta);
    const qtyEl = document.getElementById('fdModalQtyDisplay');
    if (qtyEl) qtyEl.textContent = state.modalCtx.qty;
    recalcFdModalTotal();
  };

  window.recalcFdModalTotal = function () {
    if (!state.modalCtx) return;
    const base = Number(state.modalCtx.item.priceValue) || 0;
    let addonsTotal = 0;
    const checkedInputs = document.querySelectorAll('#fdModalBackdrop .fd-mod-options-list input:checked');
    checkedInputs.forEach(inp => {
      addonsTotal += Number(inp.getAttribute('data-opt-price')) || 0;
    });
    const unitTotal = base + addonsTotal;
    const grandTotal = unitTotal * state.modalCtx.qty;
    const totalEl = document.getElementById('fdModalLiveTotal');
    if (totalEl) {
      totalEl.textContent = formatPrice(grandTotal);
    }
  };

  window.confirmFdModalAdd = function () {
    if (!state.modalCtx) return;
    const { item, qty } = state.modalCtx;
    const base = Number(item.priceValue) || 0;
    let addonsTotal = 0;
    const chosenMods = [];

    const checkedInputs = document.querySelectorAll('#fdModalBackdrop .fd-mod-options-list input:checked');
    checkedInputs.forEach(inp => {
      const label = inp.getAttribute('data-opt-label');
      const price = Number(inp.getAttribute('data-opt-price')) || 0;
      addonsTotal += price;
      if (price > 0) {
        chosenMods.push(`${label} (+$${price.toFixed(2)})`);
      } else if (label && !label.includes('Classic Signature') && !label.includes('Chef Signature')) {
        chosenMods.push(label);
      }
    });

    const specialNote = document.getElementById('fdModalSpecialNote')?.value?.trim() || '';
    const unitPrice = base + addonsTotal;
    const modKey = `${item.id}::${chosenMods.join('|')}::${specialNote}`;

    const existing = state.cart.find(c => (c.cartKey || c.id) === modKey);
    if (existing) {
      existing.qty += qty;
    } else {
      state.cart.push({
        cartKey: modKey,
        id: item.id,
        title: item.title,
        price: `$${unitPrice.toFixed(2)}`,
        priceValue: unitPrice,
        img: item.img,
        qty,
        modifiers: chosenMods,
        note: specialNote
      });
    }

    saveCartToStorage();
    updateCartBadges();
    closeFineDineModal();
    renderMainView();
    renderFdFloatingOrderBar();
    showToast(`Added ${qty}x "${item.title}" to your Order!`);
  };

  // ==========================================================================
  // CART MANAGEMENT (MINI KITCHEN DELIVERY, RESTAURANT & CATERING)
  // ==========================================================================
  window.addToCart = function (itemId, ev) {
    if (ev && ev.stopPropagation) ev.stopPropagation();
    const found = findDishAndCategory(itemId);
    if (!found) return;
    const { item, cat } = found;

    // If category has FineDine modifiers, open the FineDine Dish & Modifier Modal
    if (cat.modType && cat.modType !== 'none' && MODIFIER_GROUPS[cat.modType]) {
      openFineDineModal(itemId, state.currentPage);
      return;
    }

    const existing = state.cart.find(c => (c.cartKey || c.id) === itemId);
    if (existing) {
      existing.qty += 1;
    } else {
      state.cart.push({
        cartKey: itemId,
        id: item.id,
        title: item.title,
        price: item.price,
        priceValue: item.priceValue,
        img: item.img,
        qty: 1,
        modifiers: [],
        note: ''
      });
    }
    saveCartToStorage();
    updateCartBadges();
    renderMainView();
    renderFdFloatingOrderBar();
    showToast(`Added "${item.title}" to your Order!`);
  };

  window.updateCartQty = function (cartKeyOrId, delta) {
    const idx = state.cart.findIndex(c => (c.cartKey || c.id) === cartKeyOrId);
    if (idx === -1) return;
    state.cart[idx].qty += delta;
    if (state.cart[idx].qty <= 0) {
      state.cart.splice(idx, 1);
    }
    saveCartToStorage();
    updateCartBadges();
    renderCartDrawer();
    renderMainView();
    renderFdFloatingOrderBar();
  };

  window.clearCart = function () {
    state.cart = [];
    saveCartToStorage();
    updateCartBadges();
    renderCartDrawer();
    renderMainView();
    renderFdFloatingOrderBar();
  };

  function updateCartBadges() {
    const totalCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-count-badge').forEach(el => {
      el.textContent = totalCount;
    });
  }

  function renderFdFloatingOrderBar() {
    let bar = document.getElementById('fdFloatingOrderBar');
    const totalCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
    const totalUsd = state.cart.reduce((sum, item) => sum + item.priceValue * item.qty, 0);

    if (totalCount === 0) {
      if (bar) bar.style.display = 'none';
      return;
    }

    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'fdFloatingOrderBar';
      bar.className = 'fd-floating-order-bar';
      document.body.appendChild(bar);
    }

    bar.style.display = 'flex';
    bar.innerHTML = `
      <div class="fd-floating-order-left">
        <div class="fd-floating-bag-badge">${totalCount}</div>
        <div>
          <div style="font-size:0.74rem; color:rgba(255,255,255,0.68); text-transform:uppercase; letter-spacing:0.08em; font-weight:700;">Your FineDine Order Bag</div>
          <div style="font-size:1.05rem; font-weight:800; color:#fff;">${formatPrice(totalUsd)}</div>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:10px;">
        <button class="btn btn-whatsapp" style="padding:10px 18px; font-size:0.86rem;" onclick="openCartDrawer()">
          <i class="fa-brands fa-whatsapp"></i> Review & Send Order
        </button>
      </div>
    `;
  }

  function getDeliveryZonesList() {
    if (Array.isArray(CONFIG.deliveryZones) && CONFIG.deliveryZones.length > 0) {
      return CONFIG.deliveryZones;
    }
    return (
      (window.MK_SITE_CONFIG && window.MK_SITE_CONFIG.deliveryZones) || [
        { id: 'zone-ain-al-remmaneh', name: 'Ain Al Remmaneh (Local Area)', feeUsd: 1.0, eta: '20–30 min' },
        { id: 'zone-aley-center', name: 'Aley Center / Ras El Jabal / Souk', feeUsd: 2.0, eta: '25–35 min' },
        { id: 'zone-bhamdoun-souk', name: 'Bhamdoun / Souk El Gharb / Bsous', feeUsd: 3.0, eta: '30–45 min' },
        { id: 'zone-kahale-araya', name: 'Kahale / Araya / Jamhour', feeUsd: 4.0, eta: '35–50 min' },
        { id: 'zone-pickup', name: 'Restaurant Dine-In / Self Pickup (Aley Terrace)', feeUsd: 0.0, eta: '15–25 min' }
      ]
    );
  }

  function getPromoCodesList() {
    if (Array.isArray(CONFIG.promoCodes) && CONFIG.promoCodes.length > 0) {
      return CONFIG.promoCodes;
    }
    return (window.MK_SITE_CONFIG && window.MK_SITE_CONFIG.promoCodes) || [];
  }

  function computeCartPricing() {
    const subtotalUsd = state.cart.reduce((sum, item) => sum + item.priceValue * item.qty, 0);
    const zones = getDeliveryZonesList();
    const activeZone = zones.find(z => z.id === state.selectedZoneId) || zones[0];
    const deliveryFeeUsd = subtotalUsd > 0 ? Number(activeZone?.feeUsd) || 0 : 0;

    let discountUsd = 0;
    let promoObj = null;
    let promoError = '';

    if (state.appliedPromoCode) {
      const codeUpper = state.appliedPromoCode.trim().toUpperCase();
      const found = getPromoCodesList().find(
        p => p.active !== false && String(p.code || '').toUpperCase() === codeUpper
      );
      if (!found) {
        promoError = `Promo code "${codeUpper}" is not valid.`;
      } else if (subtotalUsd < (Number(found.minOrderUsd) || 0)) {
        promoError = `Code ${found.code} requires a minimum order of $${Number(found.minOrderUsd).toFixed(2)}.`;
      } else {
        promoObj = found;
        if (found.type === 'percent') {
          discountUsd = Math.round(subtotalUsd * (Number(found.value) / 100) * 100) / 100;
        } else {
          discountUsd = Math.min(subtotalUsd + deliveryFeeUsd, Number(found.value) || 0);
        }
      }
    }

    const grandTotalUsd = Math.max(0, Math.round((subtotalUsd + deliveryFeeUsd - discountUsd) * 100) / 100);
    return {
      subtotalUsd,
      activeZone,
      deliveryFeeUsd,
      discountUsd,
      promoObj,
      promoError,
      grandTotalUsd
    };
  }

  function cacheCartFormInputs() {
    const nameEl = document.getElementById('cartCustName');
    const phoneEl = document.getElementById('cartCustPhone');
    const addrEl = document.getElementById('cartCustAddress');
    const notesEl = document.getElementById('cartCustNotes');
    if (nameEl) state.cartFormCache.name = nameEl.value;
    if (phoneEl) state.cartFormCache.phone = phoneEl.value;
    if (addrEl) state.cartFormCache.address = addrEl.value;
    if (notesEl) state.cartFormCache.notes = notesEl.value;
  }

  window.setCartDeliveryZone = function (zoneId) {
    cacheCartFormInputs();
    state.selectedZoneId = zoneId;
    try {
      localStorage.setItem('mk_selected_zone_id', zoneId);
    } catch (e) {}
    renderCartDrawer();
  };

  window.applyCartPromoCode = function (codeOverride) {
    cacheCartFormInputs();
    const raw =
      codeOverride !== undefined
        ? codeOverride
        : document.getElementById('cartPromoInput')?.value || '';
    state.appliedPromoCode = String(raw).trim().toUpperCase();
    renderCartDrawer();
    const pricing = computeCartPricing();
    if (pricing.promoObj) {
      showToast(`Promo code ${pricing.promoObj.code} applied (-${formatPrice(pricing.discountUsd)})!`);
    } else if (pricing.promoError) {
      showToast(pricing.promoError);
    }
  };

  function renderCartDrawer() {
    const bodyEl = document.getElementById('cartDrawerBody');
    const totalEl = document.getElementById('cartDrawerTotal');
    if (!bodyEl || !totalEl) return;

    if (state.cart.length === 0) {
      bodyEl.innerHTML = `
        <div style="text-align:center; padding: 42px 16px; color: var(--text-muted);">
          <i class="fa-solid fa-bag-shopping" style="font-size: 3rem; color: #d1d5db; margin-bottom: 16px;"></i>
          <h4 style="color: var(--text-main); margin-bottom: 8px;">Your Order Bag is Empty</h4>
          <p style="font-size: 0.9rem; margin-bottom: 20px;">Browse our FineDine interactive menu and tap any dish to customize and add to your order.</p>
          <div style="display:flex; flex-direction:column; gap:10px;">
            <button class="btn btn-primary" onclick="closeCartDrawer(); navigateToPage('delivery');">
              <i class="fa-solid fa-utensils"></i> Browse Digital Menu
            </button>
            <button class="btn btn-outline-dark" onclick="closeCartDrawer(); openOrderTrackerModal();">
              <i class="fa-solid fa-truck-fast"></i> Track Existing Order (#MK-XXXX)
            </button>
          </div>
        </div>
      `;
      totalEl.textContent = formatPrice(0);
      return;
    }

    const pricing = computeCartPricing();
    const zones = getDeliveryZonesList();
    const activePromos = getPromoCodesList().filter(p => p.active !== false);

    const rowsHtml = state.cart
      .map(item => {
        const sub = item.priceValue * item.qty;
        const key = (item.cartKey || item.id).replace(/'/g, "\\'");
        const modsText =
          item.modifiers && item.modifiers.length > 0
            ? `<div style="font-size:0.76rem; color:#8c621d; margin-top:2px;"><i class="fa-solid fa-sliders"></i> ${item.modifiers.join(', ')}</div>`
            : '';
        const noteText = item.note
          ? `<div style="font-size:0.75rem; color:#4b5563; font-style:italic; margin-top:2px;">Note: "${item.note}"</div>`
          : '';
        return `
        <div class="cart-item-row">
          <div style="flex:1; padding-right:10px;">
            <div style="font-weight:700; font-size:0.95rem;">${item.title}</div>
            ${modsText}
            ${noteText}
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:3px;">${formatPrice(item.priceValue)} each • Subtotal: <b>${formatPrice(sub)}</b></div>
          </div>
          <div class="cart-qty-controls">
            <button class="cart-qty-btn" onclick="updateCartQty('${key}', -1)">-</button>
            <span style="font-weight:700; min-width:20px; text-align:center;">${item.qty}</span>
            <button class="cart-qty-btn" onclick="updateCartQty('${key}', 1)">+</button>
          </div>
        </div>
      `;
      })
      .join('');

    bodyEl.innerHTML = `
      <div style="margin-bottom: 16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:0.82rem; font-weight:700; text-transform:uppercase; color:var(--text-muted);">Selected Items (${state.cart.reduce((a, b) => a + b.qty, 0)})</span>
          <button onclick="clearCart()" style="background:none; border:none; color:#dc2626; font-size:0.8rem; font-weight:600; cursor:pointer;">Clear All</button>
        </div>
        ${rowsHtml}
      </div>

      <!-- ALEY DELIVERY ZONE CALCULATOR & PROMO CODE -->
      <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); padding:14px; border-radius:12px; margin-bottom:14px;">
        <div class="form-group" style="margin-bottom:10px;">
          <label style="font-size:0.76rem; font-weight:800; text-transform:uppercase; color:var(--text-muted);">
            <i class="fa-solid fa-motorcycle" style="color:#d94e28;"></i> Select Delivery Zone or Dine-In
          </label>
          <select class="form-control" style="padding:9px 12px; font-size:0.85rem; font-weight:600;" onchange="setCartDeliveryZone(this.value)">
            ${zones
              .map(
                z => `
              <option value="${z.id}" ${pricing.activeZone?.id === z.id ? 'selected' : ''}>
                ${z.name} — ${Number(z.feeUsd) > 0 ? `+$${Number(z.feeUsd).toFixed(2)}` : 'FREE'} (${z.eta || '25 min'})
              </option>
            `
              )
              .join('')}
          </select>
        </div>

        <div class="form-group" style="margin-bottom:8px;">
          <label style="font-size:0.76rem; font-weight:800; text-transform:uppercase; color:var(--text-muted);">
            <i class="fa-solid fa-tag" style="color:var(--brand-primary);"></i> Promo / Discount Code
          </label>
          <div style="display:flex; gap:6px;">
            <input
              type="text"
              id="cartPromoInput"
              class="form-control"
              style="padding:8px 11px; font-size:0.84rem; text-transform:uppercase;"
              placeholder="e.g. WELCOME10"
              value="${state.appliedPromoCode.replace(/"/g, '&quot;')}"
            />
            <button type="button" class="btn btn-primary" style="padding:8px 14px; font-size:0.78rem; white-space:nowrap;" onclick="applyCartPromoCode()">
              Apply
            </button>
            ${
              state.appliedPromoCode
                ? `<button type="button" class="btn btn-outline-dark" style="padding:8px 10px; font-size:0.78rem;" onclick="applyCartPromoCode('')">✕</button>`
                : ''
            }
          </div>
          ${
            activePromos.length > 0
              ? `<div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
                  ${activePromos
                    .map(
                      p => `
                    <button
                      type="button"
                      onclick="applyCartPromoCode('${p.code}')"
                      style="background:rgba(197,155,39,0.12); border:1px dashed var(--brand-primary); color:var(--text-main); border-radius:999px; padding:2px 9px; font-size:0.7rem; font-weight:700; cursor:pointer;"
                    >
                      <i class="fa-solid fa-ticket"></i> ${p.code} (${p.label})
                    </button>
                  `
                    )
                    .join('')}
                </div>`
              : ''
          }
          ${
            pricing.promoObj
              ? `<div style="font-size:0.76rem; color:#15803d; font-weight:700; margin-top:5px;"><i class="fa-solid fa-circle-check"></i> ${pricing.promoObj.label} applied (-${formatPrice(pricing.discountUsd)})</div>`
              : pricing.promoError
              ? `<div style="font-size:0.76rem; color:#dc2626; font-weight:600; margin-top:5px;">${pricing.promoError}</div>`
              : ''
          }
        </div>

        <div style="border-top:1px dashed var(--border-subtle); padding-top:10px; margin-top:8px; font-size:0.83rem; display:flex; flex-direction:column; gap:4px;">
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--text-muted);">Items Subtotal:</span>
            <b>${formatPrice(pricing.subtotalUsd)}</b>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--text-muted);">Delivery (${pricing.activeZone?.name || 'Aley'}):</span>
            <b>${pricing.deliveryFeeUsd > 0 ? `+${formatPrice(pricing.deliveryFeeUsd)}` : 'FREE'}</b>
          </div>
          ${
            pricing.discountUsd > 0
              ? `<div style="display:flex; justify-content:space-between; color:#15803d;">
                  <span>Promo (${pricing.promoObj.code}):</span>
                  <b>-${formatPrice(pricing.discountUsd)}</b>
                </div>`
              : ''
          }
          <div style="display:flex; justify-content:space-between; font-size:0.95rem; padding-top:4px; border-top:1px solid var(--border-subtle);">
            <b>Grand Total:</b>
            <b style="color:var(--brand-primary-dark);">${formatPrice(pricing.grandTotalUsd)}</b>
          </div>
        </div>
      </div>

      <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); padding:16px; border-radius:12px;">
        <h5 style="margin-bottom:12px; font-size:0.9rem;"><i class="fa-solid fa-location-dot" style="color:#d94e28;"></i> Customer & Delivery Details</h5>
        <div class="form-group" style="margin-bottom:10px;">
          <label>Your Name *</label>
          <input type="text" id="cartCustName" class="form-control" value="${(state.cartFormCache.name || '').replace(/"/g, '&quot;')}" placeholder="e.g., Rami / Sarah" />
        </div>
        <div class="form-group" style="margin-bottom:10px;">
          <label>Phone / WhatsApp Number *</label>
          <input type="tel" id="cartCustPhone" class="form-control" value="${(state.cartFormCache.phone || '').replace(/"/g, '&quot;')}" placeholder="e.g., +961 3 123 456" />
        </div>
        <div class="form-group" style="margin-bottom:10px;">
          <label>Street / Building / Table Detail *</label>
          <input type="text" id="cartCustAddress" class="form-control" value="${(state.cartFormCache.address || '').replace(/"/g, '&quot;')}" placeholder="e.g., Near Main Square, Bldg 4, 2nd Floor" />
        </div>
        <div class="form-group">
          <label>General Kitchen Instructions</label>
          <input type="text" id="cartCustNotes" class="form-control" value="${(state.cartFormCache.notes || '').replace(/"/g, '&quot;')}" placeholder="e.g., Extra garlic dip, call on arrival" />
        </div>
      </div>
    `;
    totalEl.textContent = formatPrice(pricing.grandTotalUsd);
  }

  window.checkoutCartViaWhatsApp = function () {
    if (state.cart.length === 0) {
      openWhatsApp('delivery');
      return;
    }
    cacheCartFormInputs();
    const name = document.getElementById('cartCustName')?.value?.trim() || 'Valued Customer';
    const phone = document.getElementById('cartCustPhone')?.value?.trim() || 'Sent via WhatsApp';
    const rawAddr = document.getElementById('cartCustAddress')?.value?.trim() || 'To be shared on WhatsApp';
    const rawNotes = document.getElementById('cartCustNotes')?.value?.trim() || 'None';

    const pricing = computeCartPricing();
    const zoneLabel = state.tableNumber
      ? `Dine-In Table #${state.tableNumber} (Aley Terrace)`
      : pricing.activeZone
      ? `${pricing.activeZone.name}`
      : 'Aley';
    const address = `${zoneLabel} — ${rawAddr}`;
    const promoSummary = pricing.promoObj
      ? `Promo ${pricing.promoObj.code} (-$${pricing.discountUsd.toFixed(2)})`
      : '';
    const notes = [rawNotes, promoSummary].filter(s => s && s !== 'None').join(' | ') || 'None';

    const itemLines = state.cart.map((item, idx) => {
      const sub = item.priceValue * item.qty;
      const modsPart = item.modifiers && item.modifiers.length ? `\n   ↳ _Options: ${item.modifiers.join(', ')}_` : '';
      const notePart = item.note ? `\n   ↳ _Note: ${item.note}_` : '';
      return `${idx + 1}. *${item.qty}x ${item.title}* ($${item.priceValue.toFixed(2)}) = $${sub.toFixed(2)}${modsPart}${notePart}`;
    });

    const orderId = allocateNextOrderId();
    const lbpTotal = Math.round(pricing.grandTotalUsd * LBP_RATE).toLocaleString('en-US');
    const trackUrl = `${window.location.origin}/delivery.html?track=${orderId}`;

    const summaryLines = [
      `*Items Subtotal:* $${pricing.subtotalUsd.toFixed(2)}`,
      `*Delivery Zone (${zoneLabel}):* ${pricing.deliveryFeeUsd > 0 ? `+$${pricing.deliveryFeeUsd.toFixed(2)}` : 'FREE'}`
    ];
    if (pricing.discountUsd > 0 && pricing.promoObj) {
      summaryLines.push(`*Promo Code (${pricing.promoObj.code}):* -$${pricing.discountUsd.toFixed(2)}`);
    }

    const message = [
      state.tableNumber
        ? `🍽️ *DINE-IN TABLE #${state.tableNumber} ORDER — MINI KITCHEN RESTAURANT*`
        : `🍔 *NEW FINEDINE DIGITAL ORDER — MINI KITCHEN*`,
      `*Order Reference:* #${orderId}`,
      `-----------------------------------------`,
      `*Customer:* ${name}`,
      `*Phone:* ${phone}`,
      `*${state.tableNumber ? 'Table' : 'Zone & Address'}:* ${address}`,
      `*Order Notes:* ${notes}`,
      `-----------------------------------------`,
      `*SELECTED MENU ITEMS:*`,
      ...itemLines,
      `-----------------------------------------`,
      ...summaryLines,
      `💰 *GRAND TOTAL (USD):* *$${pricing.grandTotalUsd.toFixed(2)}*`,
      `🇱🇧 *APPROX (LBP):* *${lbpTotal} L.L.*`,
      `📍 *Track Live Status:* ${trackUrl}`,
      `-----------------------------------------`,
      `Please confirm my order (#${orderId}) and estimated preparation/delivery time. Thank you!`
    ].join('\n');

    // Automatically record this WhatsApp order in the Back Office SQLite database
    recordOrderToBackOffice({
      id: orderId,
      type: 'delivery_order',
      brand: state.tableNumber || state.currentPage === 'restaurant' ? 'restaurant' : 'delivery',
      customerName: name,
      customerPhone: phone,
      address,
      notes,
      items: JSON.parse(JSON.stringify(state.cart)),
      totalUsd: Number(pricing.grandTotalUsd.toFixed(2)),
      staffNotes: state.tableNumber
        ? `🍽️ DINE-IN TABLE #${state.tableNumber}${pricing.promoObj ? ` | Promo: ${pricing.promoObj.code}` : ''}`
        : `Zone: ${zoneLabel} ($${pricing.deliveryFeeUsd.toFixed(2)})${pricing.promoObj ? ` | Promo: ${pricing.promoObj.code}` : ''}`,
      whatsappText: message
    });

    try {
      localStorage.setItem('mk_last_order_id', orderId);
    } catch (e) {}

    showToast(`Order #${orderId} recorded & opening WhatsApp...`);
    openWhatsApp(state.tableNumber ? 'restaurant' : 'delivery', message, true);
  };

  // ==========================================================================
  // PERSISTENT 3-BRAND ORIENTATION BAR (KEEPS CUSTOMERS ORIENTED AT ALL TIMES)
  // ==========================================================================
  function renderBrandOrientationBar() {
    const isCat = state.currentPage === 'catering' || state.currentPage === 'catering-menus';
    const isResto = state.currentPage === 'restaurant';
    const isDeliv = state.currentPage === 'delivery';

    return `
      <div class="ux-brand-switcher-bar" aria-label="Choose Your Mini Kitchen Experience">
        <div class="container">
          <div class="ux-brand-cards-row">
            <button
              type="button"
              class="ux-brand-choice-card ${isCat ? 'active-catering' : ''}"
              onclick="navigateToPage('catering')"
            >
              <div class="ux-brand-choice-left">
                <div class="ux-brand-choice-icon catering"><i class="fa-solid fa-crown"></i></div>
                <div style="min-width:0;">
                  <div class="ux-brand-choice-title">1. Mini Kitchen Catering</div>
                  <div class="ux-brand-choice-sub">Weddings, Corporate & Private Events</div>
                </div>
              </div>
              <i class="fa-solid fa-chevron-right ux-brand-choice-arrow"></i>
            </button>

            <button
              type="button"
              class="ux-brand-choice-card ${isResto ? 'active-restaurant' : ''}"
              onclick="navigateToPage('restaurant')"
            >
              <div class="ux-brand-choice-left">
                <div class="ux-brand-choice-icon restaurant"><i class="fa-solid fa-mountain-sun"></i></div>
                <div style="min-width:0;">
                  <div class="ux-brand-choice-title">2. Mini Kitchen Restaurant</div>
                  <div class="ux-brand-choice-sub">Scenic Aley Terrace & Dine-In Menu</div>
                </div>
              </div>
              <i class="fa-solid fa-chevron-right ux-brand-choice-arrow"></i>
            </button>

            <button
              type="button"
              class="ux-brand-choice-card ${isDeliv ? 'active-delivery' : ''}"
              onclick="navigateToPage('delivery')"
            >
              <div class="ux-brand-choice-left">
                <div class="ux-brand-choice-icon delivery"><i class="fa-solid fa-motorcycle"></i></div>
                <div style="min-width:0;">
                  <div class="ux-brand-choice-title">3. Mini Kitchen Delivery</div>
                  <div class="ux-brand-choice-sub">Order 239+ Dishes via WhatsApp</div>
                </div>
              </div>
              <i class="fa-solid fa-chevron-right ux-brand-choice-arrow"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // PAGE TEMPLATES
  // ==========================================================================
  function renderMainView() {
    const mainEl = document.getElementById('appMainContent');
    if (!mainEl) return;

    let pageHtml = '';
    switch (state.currentPage) {
      case 'catering':
        pageHtml = buildCateringHomePage();
        break;
      case 'catering-menus':
        pageHtml = buildCateringMenusPage();
        break;
      case 'restaurant':
        pageHtml = buildRestaurantPage();
        break;
      case 'delivery':
        pageHtml = buildDeliveryPage();
        break;
      case 'about':
        pageHtml = buildAboutPage();
        break;
      case 'contact':
        pageHtml = buildContactPage();
        break;
      default:
        pageHtml = buildCateringHomePage();
    }

    mainEl.innerHTML = pageHtml;
  }

  // ==========================================================================
  // INTERACTIVE WEDDING & EVENT BUDGET CALCULATOR + CLIENT TESTIMONIALS
  // ==========================================================================
  function getStationAddonsList() {
    if (Array.isArray(CONFIG.stationAddons) && CONFIG.stationAddons.length > 0) {
      return CONFIG.stationAddons;
    }
    return (
      (window.MK_SITE_CONFIG && window.MK_SITE_CONFIG.stationAddons) || [
        { id: 'st-burger', name: 'Live Charcoal Burger & Cheddar Syringe Station', pricePerGuest: 5 },
        { id: 'st-saj', name: 'Live Lebanese Saj & Bil Foron Bakery Station', pricePerGuest: 4 },
        { id: 'st-pasta', name: 'Live Italian Pasta & Truffle Parmesan Wheel', pricePerGuest: 5 },
        { id: 'st-knefe', name: 'Live Oriental Knefe & Dessert Bar', pricePerGuest: 4 },
        { id: 'st-welcome', name: 'Welcome Mocktail & Grazing Canapé Reception', pricePerGuest: 3 }
      ]
    );
  }

  function computeEventCalculatorTotals() {
    const pkgs = CONFIG.cateringPackages || [];
    const chosenPkg = pkgs[state.calcPkgIdx] || pkgs[0] || { title: 'The Royal Mountain Wedding Feast', pricePerPerson: '$45' };
    const baseRate = parseFloat(String(chosenPkg.pricePerPerson || '35').replace(/[^0-9.]/g, '')) || 35;
    const guests = Math.max(15, Math.min(1500, Number(state.calcGuests) || 120));
    const addons = getStationAddonsList().filter(a => (state.calcStations || []).includes(a.id));
    const addonsPerGuest = addons.reduce((sum, a) => sum + (Number(a.pricePerGuest) || 0), 0);
    const totalPerGuest = baseRate + addonsPerGuest;
    const totalEventUsd = totalPerGuest * guests;
    return {
      chosenPkg,
      baseRate,
      guests,
      addons,
      addonsPerGuest,
      totalPerGuest,
      totalEventUsd
    };
  }

  window.updateEventCalcGuests = function (val) {
    state.calcGuests = Math.max(15, Math.min(1500, Number(val) || 100));
    refreshEventCalcDom();
  };

  window.updateEventCalcPackage = function (idx) {
    state.calcPkgIdx = Number(idx) || 0;
    refreshEventCalcDom();
  };

  window.toggleCalcStation = function (stationId) {
    const set = new Set(state.calcStations || []);
    if (set.has(stationId)) set.delete(stationId);
    else set.add(stationId);
    state.calcStations = Array.from(set);
    refreshEventCalcDom();
  };

  function refreshEventCalcDom() {
    const calc = computeEventCalculatorTotals();
    const gSlider = document.getElementById('calcGuestsSlider');
    const gInput = document.getElementById('calcGuestsNumber');
    if (gSlider && Number(gSlider.value) !== calc.guests) gSlider.value = calc.guests;
    if (gInput && Number(gInput.value) !== calc.guests) gInput.value = calc.guests;

    const perGuestEl = document.getElementById('calcPerGuestDisplay');
    const totalUsdEl = document.getElementById('calcTotalUsdDisplay');
    const totalLbpEl = document.getElementById('calcTotalLbpDisplay');
    const breakdownEl = document.getElementById('calcBreakdownText');

    if (perGuestEl) perGuestEl.textContent = `$${calc.totalPerGuest.toFixed(0)} / guest`;
    if (totalUsdEl) totalUsdEl.textContent = `$${calc.totalEventUsd.toLocaleString('en-US')}`;
    if (totalLbpEl) {
      totalLbpEl.textContent = `${Math.round(calc.totalEventUsd * LBP_RATE).toLocaleString('en-US')} L.L.`;
    }
    if (breakdownEl) {
      breakdownEl.innerHTML = `${calc.guests} Guests × ($${calc.baseRate} Base Package + $${calc.addonsPerGuest} Live Stations)`;
    }
  }

  window.sendBudgetCalculatorToWhatsApp = function () {
    const calc = computeEventCalculatorTotals();
    const quoteId = allocateNextOrderId();
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
      `🇱🇧 *Approx. Total (LBP):* *${Math.round(calc.totalEventUsd * LBP_RATE).toLocaleString('en-US')} L.L.*`,
      `-----------------------------------------`,
      `Hello Mini Kitchen Catering! I built this custom package & live station estimate (#${quoteId}) on your website. Please share date availability and a formal proposal.`
    ].join('\n');

    recordOrderToBackOffice({
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
  };

  function renderEventBudgetCalculator() {
    const pkgs = CONFIG.cateringPackages || [];
    const addons = getStationAddonsList();
    const calc = computeEventCalculatorTotals();

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
                <select class="form-control" onchange="updateEventCalcPackage(this.value)">
                  ${pkgs
                    .map(
                      (p, idx) => `
                    <option value="${idx}" ${state.calcPkgIdx === idx ? 'selected' : ''}>
                      ${p.title} (${p.pricePerPerson}/guest • ${p.minGuests})
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
                      oninput="updateEventCalcGuests(this.value)"
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
                  oninput="updateEventCalcGuests(this.value)"
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
                  ${addons
                    .map(a => {
                      const checked = (state.calcStations || []).includes(a.id);
                      return `
                        <label style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; border-radius:12px; border:1px solid ${
                          checked ? 'var(--brand-primary)' : 'var(--border-subtle)'
                        }; background:${checked ? 'rgba(197,155,39,0.1)' : 'var(--bg-elevated)'}; cursor:pointer; font-size:0.86rem;">
                          <span style="display:flex; align-items:center; gap:10px; font-weight:600;">
                            <input
                              type="checkbox"
                              ${checked ? 'checked' : ''}
                              onchange="toggleCalcStation('${a.id}'); renderMainView();"
                              style="accent-color:var(--brand-primary); width:16px; height:16px;"
                            />
                            <span>${a.name}</span>
                          </span>
                          <span style="font-weight:800; color:var(--brand-primary-dark); white-space:nowrap; margin-left:8px;">+$${a.pricePerGuest}/guest</span>
                        </label>
                      `;
                    })
                    .join('')}
                </div>
              </div>
            </div>

            <!-- Right Live Summary Card -->
            <div style="background:#14171c; color:#fff; border:2px solid var(--brand-primary); border-radius:20px; padding:30px; display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <span style="display:inline-block; background:rgba(197,155,39,0.2); color:#e6c45a; font-size:0.74rem; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; padding:5px 12px; border-radius:999px; margin-bottom:14px;">
                  <i class="fa-solid fa-crown"></i> Live Tailored Estimate
                </span>
                <h3 style="font-family:var(--font-serif); font-size:1.55rem; color:#fff; margin-bottom:6px;">${calc.chosenPkg.title}</h3>
                <div id="calcBreakdownText" style="font-size:0.86rem; color:rgba(255,255,255,0.75); margin-bottom:20px;">
                  ${calc.guests} Guests × ($${calc.baseRate} Base Package + $${calc.addonsPerGuest} Live Stations)
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
                      ${Math.round(calc.totalEventUsd * LBP_RATE).toLocaleString('en-US')} L.L.
                    </div>
                  </div>
                </div>

                <ul style="list-style:none; padding:0; margin:0 0 22px; font-size:0.83rem; color:rgba(255,255,255,0.82); display:flex; flex-direction:column; gap:6px;">
                  <li><i class="fa-solid fa-circle-check" style="color:#25d366; margin-right:8px;"></i> Includes Luxury Buffet Setup, Chafing Dishes & Porcelain</li>
                  <li><i class="fa-solid fa-circle-check" style="color:#25d366; margin-right:8px;"></i> Uniformed Hospitality Waitstaff & On-Site Event Chef</li>
                  <li><i class="fa-solid fa-circle-check" style="color:#25d366; margin-right:8px;"></i> Complimentary Private Menu Tasting in Ain Al Remmaneh, Aley</li>
                </ul>
              </div>

              <button type="button" class="btn btn-whatsapp" style="width:100%; padding:14px; font-size:0.95rem;" onclick="sendBudgetCalculatorToWhatsApp()">
                <i class="fa-brands fa-whatsapp" style="font-size:1.15rem;"></i> Send This Estimate to WhatsApp & Check Dates
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderClientTestimonialsSection() {
    const reviews =
      (Array.isArray(CONFIG.testimonials) && CONFIG.testimonials.length > 0
        ? CONFIG.testimonials
        : window.MK_SITE_CONFIG && window.MK_SITE_CONFIG.testimonials) || [];
    if (reviews.length === 0) return '';

    return `
      <section class="section-pad" style="background:var(--bg-cream);">
        <div class="container">
          <div class="section-header" style="margin-bottom:28px;">
            <span class="section-eyebrow"><i class="fa-solid fa-star"></i> Verified Hospitality Reviews</span>
            <h2 class="section-title">Loved by Wedding Couples, Corporate Hosts & Aley Guests</h2>
            <p class="section-desc">
              Real feedback from clients who trusted Mini Kitchen Catering, Restaurant, and Delivery for their most important occasions.
            </p>
          </div>

          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:22px;">
            ${reviews
              .map(
                r => `
              <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:20px; padding:24px; box-shadow:var(--shadow-soft); display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="color:#f59e0b; font-size:0.9rem; margin-bottom:12px;">
                    ${'<i class="fa-solid fa-star"></i> '.repeat(Math.min(5, Math.max(1, Number(r.rating) || 5)))}
                  </div>
                  <p style="font-size:0.93rem; color:var(--text-main); font-style:italic; line-height:1.65; margin-bottom:18px;">
                    “${r.quote || r.caption || r.desc || ''}”
                  </p>
                </div>
                <div style="display:flex; align-items:center; gap:12px; border-top:1px solid var(--border-subtle); padding-top:14px;">
                  <img
                    src="${r.img || CONFIG.logos.main}"
                    onerror="handleImgError(this)"
                    alt="${(r.name || r.title || 'Client').replace(/"/g, '&quot;')}"
                    style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid var(--brand-primary);"
                  />
                  <div>
                    <div style="font-weight:800; font-size:0.92rem; color:var(--text-main);">${r.name || r.title || 'Valued Client'}</div>
                    <div style="font-size:0.76rem; color:var(--brand-primary-dark); font-weight:700;">${r.role || r.category || r.tag || 'Verified Event Client'}</div>
                  </div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </section>
    `;
  }

  // --------------------------------------------------------------------------
  // 1. HOME PAGE — MINI KITCHEN CATERING (STREAMLINED & USER-FRIENDLY)
  // --------------------------------------------------------------------------
  function buildCateringHomePage() {
    const featuredPackages = CONFIG.cateringPackages.slice(0, 3);
    const activeTab = state.homeShowcaseTab || 'packages';

    let tabBodyHtml = '';
    if (activeTab === 'packages') {
      tabBodyHtml = `
        <div class="packages-grid">
          ${featuredPackages.map(pkg => renderPackageCardHtml(pkg)).join('')}
        </div>
        <div style="text-align:center; margin-top: 32px;">
          <button class="btn btn-primary" onclick="navigateToPage('catering-menus')">
            <i class="fa-solid fa-book-open"></i> View All 8 Catering Packages & À La Carte Trays
          </button>
        </div>
      `;
    } else if (activeTab === 'weddings') {
      tabBodyHtml = `
        <div class="gallery-grid" style="margin-bottom: 32px;">
          ${CONFIG.cateringGallery
            .map(
              g => `
            <div class="gallery-card">
              <img src="${g.img}" onerror="handleImgError(this)" alt="${g.title}" loading="lazy" />
              <div class="gallery-card-overlay">
                <span class="gallery-tag">${g.category}</span>
                <h4>${g.title}</h4>
                <p>${g.caption}</p>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
        <div style="background:#14161b; color:#fff; border-radius:20px; padding:26px 30px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:18px;">
          <div>
            <h4 style="font-family:var(--font-serif); font-size:1.4rem; margin-bottom:4px; color:var(--brand-primary);">Planning a Wedding or Engagement?</h4>
            <p style="color:rgba(255,255,255,0.8); font-size:0.9rem;">Book a private menu tasting in Ain Al Remmaneh, Aley or request our Wedding Brochure on WhatsApp.</p>
          </div>
          <button class="btn btn-whatsapp" onclick="openWhatsApp('catering', 'Hello Mini Kitchen Catering! We are planning our wedding and would love to receive your Wedding Catering Packages & book a tasting.')">
            <i class="fa-brands fa-whatsapp"></i> Wedding Catering WhatsApp
          </button>
        </div>
      `;
    } else {
      tabBodyHtml = `
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 22px;">
          ${CONFIG.liveStations
            .map(
              st => `
            <div style="background:var(--bg-card); border-radius:18px; overflow:hidden; box-shadow:var(--shadow-soft); border:1px solid var(--border-subtle); display:flex; flex-direction:column;">
              <div style="height:195px; position:relative; overflow:hidden;">
                <img src="${st.img}" onerror="handleImgError(this)" alt="${st.title}" style="width:100%; height:100%; object-fit:cover;" />
                <span style="position:absolute; top:12px; left:12px; background:rgba(14,16,21,0.88); color:var(--brand-primary); padding:4px 12px; border-radius:999px; font-size:0.72rem; font-weight:700;">${st.tag}</span>
              </div>
              <div style="padding:20px; flex:1; display:flex; flex-direction:column;">
                <h4 style="font-family:var(--font-serif); font-size:1.25rem; margin-bottom:6px;">${st.title}</h4>
                <p style="font-size:0.86rem; color:var(--text-muted); margin-bottom:16px; flex:1;">${st.desc}</p>
                <button class="btn btn-whatsapp" style="width:100%; padding:10px;" onclick="openWhatsApp('catering', 'Hello Mini Kitchen Catering! I would like to inquire about adding the [${st.title}] live station to my event.')">
                  <i class="fa-brands fa-whatsapp"></i> Add Station to Event Quote
                </button>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    }

    return `
      <!-- CONCISE, HIGH-CLARITY CATERING HERO -->
      <section class="hero-section" style="min-height: 62vh; padding: 64px 0 84px;">
        <div class="hero-bg-media">
          <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1800&q=85" alt="Mini Kitchen Catering Wedding & Event Buffet" />
        </div>
        <div class="hero-overlay"></div>
        <div class="container">
          <div class="hero-content">
            <div class="hero-eyebrow">
              <i class="fa-solid fa-crown"></i>
              <span>Mini Kitchen Catering • Weddings, Corporate & Private Events</span>
            </div>
            <h1 class="hero-title">
              Unforgettable Catering for <span class="gold-accent">Weddings</span> & Special Occasions
            </h1>
            <p class="hero-subtitle">
              Full-service event buffets, chef-manned live cooking stations, and generous Lebanese & international hospitality—crafted in Ain Al Remmaneh, Aley and served across all of Lebanon.
            </p>
            <div class="hero-cta-group" style="margin-bottom:22px;">
              <button class="btn btn-primary" onclick="navigateToPage('catering-menus')">
                <i class="fa-solid fa-book-open"></i> Explore Catering Menus
              </button>
              <button class="btn btn-whatsapp" onclick="openWhatsApp('catering', 'Hello Mini Kitchen Catering! I would like to inquire about your catering menus, packages, and availability for an upcoming event.')">
                <i class="fa-brands fa-whatsapp" style="font-size:1.15rem;"></i> Contact Us on WhatsApp
              </button>
              <button class="btn btn-outline-light" onclick="navigateToPage('catering', 'planEventSection')">
                <i class="fa-solid fa-calendar-check"></i> Request a Catering Quote
              </button>
            </div>
            <div class="hero-event-pills">
              <span class="event-type-pill"><i class="fa-solid fa-ring"></i> Weddings</span>
              <span class="event-type-pill"><i class="fa-solid fa-building-columns"></i> Corporate Events</span>
              <span class="event-type-pill"><i class="fa-solid fa-champagne-glasses"></i> Private Parties</span>
              <span class="event-type-pill"><i class="fa-solid fa-cake-candles"></i> Birthdays & Launches</span>
            </div>
          </div>
        </div>
      </section>

      <!-- SIMPLE 3-STEP HOW IT WORKS GUIDE -->
      <div class="container">
        <div class="ux-steps-strip">
          <div class="ux-step-item">
            <div class="ux-step-num">1</div>
            <div>
              <div class="ux-step-title">Choose Your Package or Menu</div>
              <div class="ux-step-desc">Pick from 8 curated event formulas or build a custom spread from 239+ dishes.</div>
            </div>
          </div>
          <div class="ux-step-item">
            <div class="ux-step-num">2</div>
            <div>
              <div class="ux-step-title">Add Live Cooking Stations</div>
              <div class="ux-step-desc">Impress guests with our Molten Cheddar Fountain, Charcoal Grill, Saj, or Knefe bar.</div>
            </div>
          </div>
          <div class="ux-step-item">
            <div class="ux-step-num">3</div>
            <div>
              <div class="ux-step-title">Get an Instant WhatsApp Quote</div>
              <div class="ux-step-desc">Send your guest count & date directly to our Event Director (+961 71 048 154).</div>
            </div>
          </div>
        </div>
      </div>

      <!-- UNIFIED TABBED CATERING SHOWCASE (NO ENDLESS SCROLLING) -->
      <section class="section-pad">
        <div class="container">
          <div class="section-header" style="margin-bottom:28px;">
            <span class="section-eyebrow">Explore Mini Kitchen Catering</span>
            <h2 class="section-title">Everything You Need for a Flawless Event</h2>
            <p class="section-desc">
              Switch between our signature catering packages, real wedding & event gallery, and interactive live cooking stations below.
            </p>
          </div>

          <div class="ux-section-tabs-nav">
            <button
              type="button"
              class="ux-section-tab-btn ${activeTab === 'packages' ? 'active' : ''}"
              onclick="setHomeShowcaseTab('packages')"
            >
              <i class="fa-solid fa-utensils"></i> 1. Popular Packages (3)
            </button>
            <button
              type="button"
              class="ux-section-tab-btn ${activeTab === 'weddings' ? 'active' : ''}"
              onclick="setHomeShowcaseTab('weddings')"
            >
              <i class="fa-solid fa-camera-retro"></i> 2. Weddings & Event Photos (6)
            </button>
            <button
              type="button"
              class="ux-section-tab-btn ${activeTab === 'stations' ? 'active' : ''}"
              onclick="setHomeShowcaseTab('stations')"
            >
              <i class="fa-solid fa-fire-burner"></i> 3. Live Cooking Stations (5)
            </button>
          </div>

          ${tabBodyHtml}
        </div>
      </section>

      ${renderEventBudgetCalculator()}

      ${renderClientTestimonialsSection()}

      <!-- PLAN YOUR EVENT / REQUEST A CATERING QUOTE -->
      <section class="section-pad section-dark" id="planEventSection">
        <div class="container">
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 44px; align-items:center;">
            <div>
              <span class="section-eyebrow">Direct WhatsApp Event Concierge</span>
              <h2 class="section-title">Request a Tailored Catering Quote in 60 Seconds</h2>
              <p style="color:rgba(255,255,255,0.8); margin-bottom:22px; font-size:1rem;">
                Enter your event details and click <b>"Send Quote Request via WhatsApp"</b>. Your inquiry is formatted automatically and sent straight to our Catering Director (<b>${CONFIG.contacts.catering.phoneDisplay}</b>).
              </p>
              <div style="display:flex; flex-direction:column; gap:14px;">
                <div style="display:flex; align-items:center; gap:14px;">
                  <div style="width:44px; height:44px; border-radius:50%; background:rgba(200,157,84,0.2); color:var(--brand-primary); display:flex; align-items:center; justify-content:center;"><i class="fa-solid fa-phone-volume"></i></div>
                  <div>
                    <div style="font-size:0.78rem; color:rgba(255,255,255,0.6);">Catering & Weddings Direct Line</div>
                    <div style="font-weight:700; font-size:1.05rem;">${CONFIG.contacts.catering.phoneDisplay} / ${CONFIG.contacts.catering.secondaryDisplay}</div>
                  </div>
                </div>
                <div style="display:flex; align-items:center; gap:14px;">
                  <div style="width:44px; height:44px; border-radius:50%; background:rgba(200,157,84,0.2); color:var(--brand-primary); display:flex; align-items:center; justify-content:center;"><i class="fa-solid fa-location-dot"></i></div>
                  <div>
                    <div style="font-size:0.78rem; color:rgba(255,255,255,0.6);">Headquarters & Tasting Lounge</div>
                    <div style="font-weight:700; font-size:1rem;">${CONFIG.location.short} (Serving All of Lebanon)</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-card">
              <h3 style="font-family:var(--font-serif); font-size:1.55rem; margin-bottom:6px;">Instant Catering Quotation Form</h3>
              <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:18px;">Fill in your event details below to send directly via WhatsApp:</p>
              <form onsubmit="submitCateringQuoteForm(event)">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Your Full Name *</label>
                    <input type="text" id="quoteName" class="form-control" placeholder="e.g., Nadine Karam" required />
                  </div>
                  <div class="form-group">
                    <label>Phone / WhatsApp Number *</label>
                    <input type="tel" id="quotePhone" class="form-control" placeholder="e.g., +961 70 123 456" required />
                  </div>
                  <div class="form-group">
                    <label>Event Type *</label>
                    <select id="quoteEventType" class="form-control" required>
                      <option value="Wedding Reception">Wedding Reception</option>
                      <option value="Engagement / Bridal Event">Engagement / Bridal Event</option>
                      <option value="Corporate Event / Gala">Corporate Event / Gala</option>
                      <option value="Private Villa / Garden Party">Private Villa / Garden Party</option>
                      <option value="Birthday / Anniversary">Birthday / Anniversary</option>
                      <option value="Product Launch / Brand Event">Product Launch / Brand Event</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Estimated Number of Guests *</label>
                    <input type="number" id="quoteGuests" class="form-control" placeholder="e.g., 120" min="4" required />
                  </div>
                  <div class="form-group">
                    <label>Preferred Event Date *</label>
                    <input type="date" id="quoteDate" class="form-control" required />
                  </div>
                  <div class="form-group">
                    <label>Event Location / Venue *</label>
                    <input type="text" id="quoteLocation" class="form-control" placeholder="e.g., Aley, Beirut, Bhamdoun" required />
                  </div>
                  <div class="form-group full">
                    <label>Preferred Catering Package or Services</label>
                    <select id="quotePackage" class="form-control">
                      <option value="Custom Tailored Menu & Quotation">Help Me Customize a Menu & Package</option>
                      <option value="The Royal Mountain Wedding Feast ($45/guest)">The Royal Mountain Wedding Feast ($45/guest)</option>
                      <option value="Sunset Garden Cocktail & Canapés ($32/guest)">Sunset Garden Cocktail & Canapés ($32/guest)</option>
                      <option value="Grand Imperial Five-Station Gala ($60/guest)">Grand Imperial Five-Station Gala ($60/guest)</option>
                      <option value="Executive Corporate Gala Buffet ($28/guest)">Executive Corporate Gala Buffet ($28/guest)</option>
                      <option value="Product Launch Canapé Package ($22/guest)">Product Launch Canapé Package ($22/guest)</option>
                      <option value="Authentic Lebanese Mezza Formula ($25/guest)">Authentic Lebanese Mezza Formula ($25/guest)</option>
                      <option value="American Feast & Cheddar Fountain ($25/guest)">American Feast & Cheddar Fountain ($25/guest)</option>
                      <option value="Lebanese Mountain Breakfast & Saj ($15/guest)">Lebanese Mountain Breakfast & Saj ($15/guest)</option>
                    </select>
                  </div>
                  <div class="form-group full">
                    <label>Additional Notes or Live Stations</label>
                    <textarea id="quoteNotes" class="form-control" rows="2" placeholder="Desired live stations, waiter service, or dietary notes..."></textarea>
                  </div>
                </div>
                <button type="submit" class="btn btn-whatsapp" style="width:100%; margin-top:16px; padding:15px; font-size:0.98rem;">
                  <i class="fa-brands fa-whatsapp" style="font-size:1.2rem;"></i> Send Catering Quote Request via WhatsApp
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderPackageCardHtml(pkg) {
    const conciseHighlights = pkg.highlights.slice(0, 4);
    return `
      <div class="package-card">
        <div class="package-card-media">
          <img src="${pkg.img}" onerror="handleImgError(this)" alt="${pkg.title}" loading="lazy" />
          <span class="package-badge">${pkg.badge}</span>
          <span class="package-price-pill">${pkg.pricePerPerson} <small style="font-weight:500;">/ guest</small></span>
        </div>
        <div class="package-card-body">
          <div class="package-card-cat">${pkg.categoryLabel} • ${pkg.minGuests}</div>
          <h3 class="package-card-title">${pkg.title}</h3>
          <p class="package-card-sub">${pkg.subtitle}</p>
          <ul class="package-highlights">
            ${conciseHighlights.map(h => `<li><i class="fa-solid fa-circle-check"></i> <span>${h}</span></li>`).join('')}
          </ul>
          <div class="package-card-footer">
            <button class="btn btn-whatsapp" style="flex:1; padding:11px;" onclick="openWhatsApp('catering', 'Hello Mini Kitchen Catering! I am interested in the *${pkg.title}* (${pkg.pricePerPerson}/guest). Could you share availability and a customized quote?')">
              <i class="fa-brands fa-whatsapp"></i> Inquire on WhatsApp
            </button>
            <button class="btn btn-outline-dark" style="padding:11px 15px;" onclick="prefillPackageInQuote('${pkg.title} (${pkg.pricePerPerson}/guest)')">
              Select
            </button>
          </div>
        </div>
      </div>
    `;
  }

  window.prefillPackageInQuote = function (pkgLabel) {
    navigateToPage('catering', 'planEventSection');
    setTimeout(() => {
      const sel = document.getElementById('quotePackage');
      if (sel) {
        for (const opt of sel.options) {
          if (opt.value.includes(pkgLabel.split(' (')[0])) {
            sel.value = opt.value;
            break;
          }
        }
      }
    }, 200);
  };

  window.submitCateringQuoteForm = function (e) {
    e.preventDefault();
    const name = document.getElementById('quoteName')?.value?.trim() || '';
    const phone = document.getElementById('quotePhone')?.value?.trim() || '';
    const eventType = document.getElementById('quoteEventType')?.value || '';
    const guests = document.getElementById('quoteGuests')?.value || '';
    const date = document.getElementById('quoteDate')?.value || '';
    const location = document.getElementById('quoteLocation')?.value?.trim() || '';
    const pkg = document.getElementById('quotePackage')?.value || '';
    const notes = document.getElementById('quoteNotes')?.value?.trim() || 'None';

    const quoteId = allocateNextOrderId();
    const msg = [
      `✨ *NEW CATERING QUOTATION REQUEST — MINI KITCHEN CATERING*`,
      `*Reference ID:* #${quoteId}`,
      `-----------------------------------------`,
      `*Client Name:* ${name}`,
      `*Contact Phone:* ${phone}`,
      `*Event Type:* ${eventType}`,
      `*Event Date:* ${date}`,
      `*Event Location:* ${location}`,
      `*Number of Guests:* ${guests} Guests`,
      `*Interested Package:* ${pkg}`,
      `*Additional Notes:* ${notes}`,
      `-----------------------------------------`,
      `Please provide a tailored catering menu and quotation for our event (#${quoteId}). Thank you!`
    ].join('\n');

    const isRestoBooking = eventType.toLowerCase().includes('restaurant');
    const isDeliveryGroup = eventType.toLowerCase().includes('delivery');
    const priceMatch = pkg.match(/\$(\d+)/);
    const estPerGuest = priceMatch ? Number(priceMatch[1]) : 0;
    const estTotal = estPerGuest && Number(guests) ? estPerGuest * Number(guests) : 0;

    recordOrderToBackOffice({
      id: quoteId,
      type: isRestoBooking ? 'table_reservation' : 'catering_quote',
      brand: isRestoBooking ? 'restaurant' : isDeliveryGroup ? 'delivery' : 'catering',
      customerName: name,
      customerPhone: phone,
      address: location,
      eventType,
      eventDate: date,
      guests: Number(guests) || 0,
      packageSelected: pkg,
      notes,
      items: [],
      totalUsd: estTotal,
      staffNotes: 'Submitted via Website Event / Quote Form & sent to WhatsApp',
      whatsappText: msg
    });

    showToast(`Inquiry #${quoteId} recorded & opening WhatsApp...`);
    openWhatsApp(isRestoBooking ? 'restaurant' : isDeliveryGroup ? 'delivery' : 'catering', msg, true);
  };

  // --------------------------------------------------------------------------
  // 2. DEDICATED CATERING MENUS & EVENT PACKAGES PAGE (2-TAB ORGANIZED VIEW)
  // --------------------------------------------------------------------------
  function buildCateringMenusPage() {
    const filteredPkgs =
      state.cateringPkgFilter === 'all'
        ? CONFIG.cateringPackages
        : CONFIG.cateringPackages.filter(p => p.category === state.cateringPkgFilter);

    const cateringCatIds = [
      'hot-offers',
      'main-course',
      'lebanese-corner',
      'cheddar-fountain',
      'appetisers',
      'salads',
      'dessert'
    ];
    const cateringAvailableCats = MENU_DATA.filter(c => cateringCatIds.includes(c.id));
    const filteredCateringCats = getFilteredMenuCategories(
      state.cateringAlaCarteCat,
      state.cateringAlaCarteSearch,
      cateringCatIds
    );
    const activeTab = state.cateringMenusTab || 'packages';

    return `
      <section class="hero-section" style="min-height: 40vh; padding: 48px 0;">
        <div class="hero-bg-media">
          <img src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1800&q=85" alt="Catering Menus & Event Packages" />
        </div>
        <div class="hero-overlay"></div>
        <div class="container">
          <div class="hero-content">
            <div class="hero-eyebrow"><i class="fa-solid fa-utensils"></i> <span>Mini Kitchen Catering • Packages & FineDine Trays</span></div>
            <h1 class="hero-title" style="font-size:clamp(2rem, 3.8vw, 3.1rem);">Catering Packages & <span class="gold-accent">À La Carte</span> Menus</h1>
            <p class="hero-subtitle" style="margin-bottom:20px;">
              Choose a complete per-guest event package or build your own custom buffet spread from our FineDine catering platters and 1KG grills.
            </p>
            <div class="hero-cta-group" style="margin-bottom:0;">
              <button class="btn btn-whatsapp" onclick="openWhatsApp('catering', 'Hello Mini Kitchen Catering! I am browsing your Catering Menus & Packages page and would like a customized quotation.')">
                <i class="fa-brands fa-whatsapp"></i> Request Custom Menu on WhatsApp
              </button>
              <button class="btn btn-outline-light" onclick="navigateToPage('catering', 'planEventSection')">
                <i class="fa-solid fa-calculator"></i> Open Event Quote Planner
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="section-pad" style="padding-top:44px;">
        <div class="container">
          <!-- 2-TAB SWITCHER: EVENT PACKAGES VS FINEDINE A LA CARTE TRAYS -->
          <div class="ux-section-tabs-nav">
            <button
              type="button"
              class="ux-section-tab-btn ${activeTab === 'packages' ? 'active' : ''}"
              onclick="setCateringMenusTab('packages')"
            >
              <i class="fa-solid fa-champagne-glasses"></i> 1. Full Event & Wedding Packages (8)
            </button>
            <button
              type="button"
              class="ux-section-tab-btn ${activeTab === 'alacarte' ? 'active' : ''}"
              onclick="setCateringMenusTab('alacarte')"
            >
              <i class="fa-solid fa-table-list"></i> 2. FineDine À La Carte Trays & 1KG Grills
            </button>
          </div>

          ${
            activeTab === 'packages'
              ? `
                ${renderMenuQrCodeBar('catering')}
                <div class="filter-tabs" style="margin-bottom:28px;">
                  <button class="filter-tab-btn ${state.cateringPkgFilter === 'all' ? 'active' : ''}" onclick="setCateringPkgFilter('all')">All Packages (${CONFIG.cateringPackages.length})</button>
                  <button class="filter-tab-btn ${state.cateringPkgFilter === 'wedding' ? 'active' : ''}" onclick="setCateringPkgFilter('wedding')"><i class="fa-solid fa-rings-wedding"></i> Wedding Catering</button>
                  <button class="filter-tab-btn ${state.cateringPkgFilter === 'corporate' ? 'active' : ''}" onclick="setCateringPkgFilter('corporate')"><i class="fa-solid fa-briefcase"></i> Corporate Options</button>
                  <button class="filter-tab-btn ${state.cateringPkgFilter === 'private' ? 'active' : ''}" onclick="setCateringPkgFilter('private')"><i class="fa-solid fa-champagne-glasses"></i> Private Parties & Formulas</button>
                </div>

                <div class="packages-grid">
                  ${filteredPkgs.map(pkg => renderPackageCardHtml(pkg)).join('')}
                </div>
              `
              : `
                <div id="cateringFineDineSection">
                  ${renderInteractiveMenuExplorer(
                    'catering',
                    filteredCateringCats,
                    state.cateringAlaCarteCat,
                    state.cateringAlaCarteSearch,
                    cateringAvailableCats
                  )}
                </div>
              `
          }
        </div>
      </section>
    `;
  }

  window.setCateringPkgFilter = function (filter) {
    state.cateringPkgFilter = filter;
    renderMainView();
  };

  // --------------------------------------------------------------------------
  // 3. MINI KITCHEN RESTAURANT PAGE (2-TAB ORGANIZED: MENU vs VIEWS & MAP)
  // --------------------------------------------------------------------------
  function buildRestaurantPage() {
    const filteredCats = getFilteredMenuCategories(state.restoCategory, state.restoSearch);
    const activeTab = state.restoViewTab || 'menu';

    return `
      <!-- COMPACT RESTAURANT SCENIC HERO -->
      <section class="hero-section" style="min-height: 42vh; padding: 44px 0;">
        <div class="hero-bg-media">
          <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=85" alt="Mini Kitchen Restaurant Scenic View in Aley" />
        </div>
        <div class="hero-overlay"></div>
        <div class="container">
          <div class="hero-content">
            <div class="hero-eyebrow" style="background:rgba(45,106,79,0.38); border-color:#52b788; color:#d8f3dc;">
              <i class="fa-solid fa-mountain-sun"></i>
              <span>Mini Kitchen Restaurant • Ain Al Remmaneh, Aley</span>
            </div>
            <h1 class="hero-title" style="font-size:clamp(2rem, 3.8vw, 3.1rem);">
              Panoramic Mountain Views & <span class="gold-accent">#NotSoTraditional</span> Dining
            </h1>
            <p class="hero-subtitle" style="margin-bottom:20px;">
              Dine on our scenic Aley terrace from 8:00 AM to 10:00 PM. Scan our table QR code or browse our interactive FineDine menu below.
            </p>
            <div class="hero-cta-group" style="margin-bottom:16px;">
              <button class="btn btn-whatsapp" onclick="openWhatsApp('restaurant', 'Hello Mini Kitchen Restaurant! I would like to reserve a table in Ain Al Remmaneh, Aley.')">
                <i class="fa-brands fa-whatsapp" style="font-size:1.15rem;"></i> Reserve a Table on WhatsApp
              </button>
              <button class="btn btn-outline-light" onclick="openQrStudioModal('resto')">
                <i class="fa-solid fa-qrcode"></i> Table Dine-In QR Code
              </button>
              <a class="btn btn-outline-light" href="${CONFIG.location.googleMapsUrl}" target="_blank" rel="noopener">
                <i class="fa-solid fa-location-dot"></i> Get Directions (${CONFIG.location.short})
              </a>
            </div>
            <div class="hero-event-pills">
              <span class="event-type-pill"><i class="fa-solid fa-clock"></i> Daily: 8:00 AM – 10:00 PM</span>
              <span class="event-type-pill"><i class="fa-solid fa-phone"></i> ${CONFIG.contacts.restaurant.phoneDisplay}</span>
              <span class="event-type-pill"><i class="fa-solid fa-mountain"></i> Outdoor View Terrace & Family Area</span>
            </div>
          </div>
        </div>
      </section>

      <section class="section-pad" id="restoDigitalMenuSection" style="background:var(--bg-cream); padding-top:38px;">
        <div class="container">
          <!-- 2-TAB SWITCHER: FINEDINE MENU VS VIEWS, ATMOSPHERE & MAP -->
          <div class="ux-section-tabs-nav">
            <button
              type="button"
              class="ux-section-tab-btn ${activeTab === 'menu' ? 'active' : ''}"
              onclick="setRestoViewTab('menu')"
            >
              <i class="fa-solid fa-qrcode"></i> 1. FineDine Table QR Menu (239 Dishes)
            </button>
            <button
              type="button"
              class="ux-section-tab-btn ${activeTab === 'atmosphere' ? 'active' : ''}"
              onclick="setRestoViewTab('atmosphere')"
            >
              <i class="fa-solid fa-mountain-sun"></i> 2. Terrace Views, Photos & Aley Map
            </button>
          </div>

          ${
            activeTab === 'menu'
              ? renderInteractiveMenuExplorer('resto', filteredCats, state.restoCategory, state.restoSearch, MENU_DATA)
              : `
                <!-- ATMOSPHERE, VIEWS & MAP TAB -->
                <div class="gallery-grid" style="margin-bottom: 40px;">
                  ${CONFIG.restaurantGallery
                    .map(
                      g => `
                    <div class="gallery-card">
                      <img src="${g.img}" onerror="handleImgError(this)" alt="${g.title}" loading="lazy" />
                      <div class="gallery-card-overlay">
                        <span class="gallery-tag">${g.tag}</span>
                        <h4>${g.title}</h4>
                        <p>${g.desc}</p>
                      </div>
                    </div>
                  `
                    )
                    .join('')}
                </div>

                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; align-items:center; background:#14171c; color:#fff; padding:34px; border-radius:22px;">
                  <div>
                    <span class="section-eyebrow">Visit Us in Mount Lebanon</span>
                    <h3 style="font-family:var(--font-serif); font-size:1.75rem; margin-bottom:12px;">Location, Opening Hours & Table Booking</h3>
                    <p style="color:rgba(255,255,255,0.8); margin-bottom:18px; font-size:0.94rem;">
                      Whether you join us at 8:00 AM for hot Manakish Bil Foron and Lebanese Foul overlooking the mountains, or gather at sunset for charcoal burgers, mixed grills, and arguileh—we welcome walk-ins and reservations daily.
                    </p>
                    <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px; font-size:0.92rem;">
                      <div><i class="fa-solid fa-location-dot" style="color:var(--brand-primary); width:22px;"></i> <b>Address:</b> ${CONFIG.location.full}</div>
                      <div><i class="fa-solid fa-clock" style="color:var(--brand-primary); width:22px;"></i> <b>Opening Hours:</b> ${CONFIG.location.hours}</div>
                      <div><i class="fa-solid fa-phone" style="color:var(--brand-primary); width:22px;"></i> <b>Restaurant Line:</b> ${CONFIG.contacts.restaurant.phoneDisplay}</div>
                    </div>
                    <button class="btn btn-whatsapp" onclick="openWhatsApp('restaurant', 'Hello Mini Kitchen Restaurant! I would like to book a table at your restaurant in Ain Al Remmaneh, Aley.')">
                      <i class="fa-brands fa-whatsapp"></i> Reserve a Table via WhatsApp
                    </button>
                  </div>
                  <div style="border-radius:16px; overflow:hidden; height:320px; border:1px solid rgba(255,255,255,0.15);">
                    <iframe src="${CONFIG.location.mapEmbedUrl}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
                  </div>
                </div>
              `
          }
        </div>
      </section>
    `;
  }

  // --------------------------------------------------------------------------
  // 4. MINI KITCHEN DELIVERY PAGE (MENU ABOVE THE FOLD!)
  // --------------------------------------------------------------------------
  function buildDeliveryPage() {
    const filteredCats = getFilteredMenuCategories(state.deliveryCategory, state.deliverySearch);
    const cartCount = state.cart.reduce((sum, i) => sum + i.qty, 0);
    const cartTotal = state.cart.reduce((sum, i) => sum + i.priceValue * i.qty, 0);

    return `
      <!-- COMPACT DELIVERY HEADER SO FINEDINE MENU STARTS IMMEDIATELY -->
      <section class="hero-section" style="min-height: 34vh; padding: 38px 0;">
        <div class="hero-bg-media">
          <img src="${CONFIG.logos.cover}" onerror="handleImgError(this, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1800&q=85')" alt="Mini Kitchen Delivery" />
        </div>
        <div class="hero-overlay"></div>
        <div class="container">
          <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:24px;">
            <div style="max-width:680px;">
              <div style="display:inline-flex; align-items:center; gap:10px; background:rgba(217,78,40,0.3); border:1px solid #f3724f; padding:6px 14px; border-radius:999px; margin-bottom:14px;">
                <img src="${CONFIG.logos.main}" onerror="handleImgError(this)" alt="Mini Kitchen Delivery Logo" style="width:26px; height:26px; border-radius:50%; object-fit:cover;" />
                <span style="color:#ffd8cc; font-weight:800; font-size:0.76rem; letter-spacing:0.1em; text-transform:uppercase;">Mini Kitchen Delivery • Fast WhatsApp Ordering</span>
              </div>
              <h1 class="hero-title" style="font-size:clamp(1.9rem, 3.5vw, 2.85rem); margin-bottom:10px;">
                Order Online & Send Directly to <span class="gold-accent">WhatsApp</span>
              </h1>
              <p style="color:rgba(255,255,255,0.86); font-size:0.95rem; margin-bottom:14px;">
                Serving <b>${CONFIG.deliveryAreas.slice(0, 6).join(', ')}</b> & surrounding Aley areas daily from 8:00 AM – 10:00 PM.
              </p>
            </div>
            <div style="display:flex; flex-direction:column; gap:10px; min-width:250px;">
              <button class="btn btn-whatsapp" onclick="openCartDrawer()">
                <i class="fa-solid fa-bag-shopping"></i> Order Bag (${cartCount} items • ${formatPrice(cartTotal)})
              </button>
              <button class="btn btn-outline-light" onclick="openQrStudioModal('delivery')">
                <i class="fa-solid fa-qrcode"></i> View Delivery Menu QR Code
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- INTERACTIVE FINEDINE DELIVERY MENU -->
      <section class="section-pad" id="deliveryMenuStart" style="background:var(--bg-cream); padding-top:34px;">
        <div class="container">
          ${renderInteractiveMenuExplorer('delivery', filteredCats, state.deliveryCategory, state.deliverySearch, MENU_DATA)}
        </div>
      </section>
    `;
  }

  function getFilteredMenuCategories(selectedCat, searchQuery, allowedCatIds) {
    const q = (searchQuery || '').toLowerCase().trim();
    const diet = state.dietaryFilter || 'all';
    const baseCats = allowedCatIds
      ? MENU_DATA.filter(cat => allowedCatIds.includes(cat.id))
      : MENU_DATA;

    return baseCats
      .filter(cat => selectedCat === 'all' || cat.id === selectedCat)
      .map(cat => {
        const matchedItems = cat.items.filter(item => {
          const matchesQuery =
            !q ||
            item.title.toLowerCase().includes(q) ||
            (item.desc && item.desc.toLowerCase().includes(q)) ||
            cat.name.toLowerCase().includes(q);
          if (!matchesQuery) return false;

          if (diet === 'all') return true;
          const badges = (item.badges || []).map(b => b.toLowerCase());
          return badges.includes(diet.toLowerCase());
        });
        return { ...cat, items: matchedItems };
      })
      .filter(cat => cat.items.length > 0);
  }

  function renderBadgePills(badges) {
    if (!badges || !badges.length) return '';
    return `<div class="fd-item-badges">
      ${badges
        .map(b => {
          if (b === 'Popular') return `<span class="fd-badge popular"><i class="fa-solid fa-fire"></i> Popular</span>`;
          if (b === 'Spicy') return `<span class="fd-badge spicy"><i class="fa-solid fa-pepper-hot"></i> Spicy</span>`;
          if (b === 'Vegetarian') return `<span class="fd-badge vegetarian"><i class="fa-solid fa-leaf"></i> Veg</span>`;
          if (b === 'Sharing') return `<span class="fd-badge sharing"><i class="fa-solid fa-users"></i> Sharing</span>`;
          return '';
        })
        .join('')}
    </div>`;
  }

  // Dedicated QR Code Bar rendered at the top of each of the 3 menus
  function renderMenuQrCodeBar(mode) {
    const qrMenus = getQrMenusMeta();
    const qrInfo = qrMenus[mode] || qrMenus.resto;
    const qrImgUrl = getQrImageSrc(qrInfo.url, 140);

    const tableBanner = state.tableNumber
      ? `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; background:linear-gradient(135deg, #2d6a4f, #1b4332); color:#fff; border-radius:14px; padding:12px 18px; margin-bottom:14px; border:1px solid #52b788;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.05rem;">
              ${state.tableNumber}
            </div>
            <div>
              <div style="font-size:0.72rem; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; color:#d8f3dc;">Welcome to Mini Kitchen Restaurant</div>
              <div style="font-weight:800; font-size:1rem;">You are seated at Table #${state.tableNumber} — Dine-In (No Delivery Fee)</div>
            </div>
          </div>
          <button type="button" class="btn btn-whatsapp" style="padding:8px 14px; font-size:0.8rem;" onclick="openWhatsApp('restaurant', 'Hello! Table #${state.tableNumber} is requesting a waiter please.', true)">
            <i class="fa-solid fa-bell-concierge"></i> Call Waiter
          </button>
        </div>
      `
      : '';

    return `
      ${tableBanner}
      <div class="fd-qr-menu-bar">
        <div class="fd-qr-menu-left">
          <div class="fd-qr-mini-thumb" onclick="openQrStudioModal('${qrInfo.mode}')" title="Click to enlarge & print QR Code">
            <img src="${qrImgUrl}" onerror="handleImgError(this, '${FALLBACK_QR_SVG}')" alt="${qrInfo.shortLabel}" />
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
            onclick="toggleQrTableMode()"
            title="Hide website banners so customers scanning a table QR code see only the digital menu"
          >
            <i class="fa-solid ${state.qrTableMode ? 'fa-compress' : 'fa-expand'}"></i>
            <span>${state.qrTableMode ? 'Exit QR Table Mode' : 'QR Table View'}</span>
          </button>
          <button
            type="button"
            class="fd-qr-action-btn primary"
            onclick="openQrStudioModal('${qrInfo.mode}')"
          >
            <i class="fa-solid fa-qrcode"></i>
            <span>View / Print Menu QR Code</span>
          </button>
          <button
            type="button"
            class="fd-qr-action-btn"
            onclick="openQrStudioModal('all')"
          >
            <i class="fa-solid fa-layer-group"></i>
            <span>All 3 Menu QRs</span>
          </button>
        </div>
      </div>
    `;
  }

  function renderInteractiveMenuExplorer(mode, filteredCats, activeCat, activeSearch, availableCategories) {
    const catsList = availableCategories || MENU_DATA;
    const totalDishCount = catsList.reduce((acc, c) => acc + c.items.length, 0);
    const cartCount = state.cart.reduce((sum, i) => sum + i.qty, 0);
    const cartTotal = state.cart.reduce((sum, i) => sum + i.priceValue * i.qty, 0);
    const isOverviewMode = activeCat === 'all' && !activeSearch && state.dietaryFilter === 'all';

    // Map item quantities currently in cart so cards show live badges
    const qtyByItemId = {};
    for (const cItem of state.cart) {
      qtyByItemId[cItem.id] = (qtyByItemId[cItem.id] || 0) + cItem.qty;
    }

    return `
      <div class="fd-menu-shell" id="fdMenuTopAnchor">
        <!-- 0. DEDICATED QR CODE BAR FOR THIS MENU -->
        ${renderMenuQrCodeBar(mode)}

        <!-- 1. FINEDINE VISUAL CATEGORY STORY CAROUSEL -->
        <div class="fd-cat-stories-wrap">
          <div class="fd-cat-stories-header">
            <div class="fd-cat-stories-title">
              <i class="fa-solid fa-utensils" style="color:var(--brand-primary-dark);"></i>
              <span>Select a Category (${catsList.length})</span>
              ${
                activeCat !== 'all'
                  ? `<button type="button" onclick="handleMenuCatSelect('${mode}', 'all')" style="margin-left:8px; background:#f3f4f6; border:1px solid #d1d5db; border-radius:999px; padding:2px 10px; font-size:0.7rem; font-weight:700; cursor:pointer; color:#111827;">✕ Show All Categories</button>`
                  : ''
              }
            </div>
            <div style="font-size:0.76rem; color:#6b7280; font-weight:600;">
              <i class="fa-solid fa-hand-pointer" style="color:var(--brand-primary-dark);"></i> Tap any dish to customize & add
            </div>
          </div>

          <div class="fd-cat-stories-scroller">
            <div
              class="fd-story-card ${activeCat === 'all' ? 'active' : ''}"
              onclick="handleMenuCatSelect('${mode}', 'all')"
            >
              <div class="fd-story-thumb">
                <img src="${CONFIG.logos.main}" onerror="handleImgError(this)" alt="All Categories" />
              </div>
              <div class="fd-story-name">All Menu</div>
              <div class="fd-story-count">${totalDishCount} dishes</div>
            </div>

            ${catsList
              .map(
                c => `
              <div
                class="fd-story-card ${activeCat === c.id ? 'active' : ''}"
                onclick="handleMenuCatSelect('${mode}', '${c.id}')"
              >
                <div class="fd-story-thumb">
                  <img src="${c.thumbImg || c.items[0]?.img || CONFIG.logos.main}" onerror="handleImgError(this)" alt="${c.name.replace(/"/g, '&quot;')}" loading="lazy" />
                </div>
                <div class="fd-story-name">${c.name}</div>
                <div class="fd-story-count">${c.items.length} items</div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- 2. FINEDINE SMART TOOLBAR: SEARCH, CURRENCY (USD/LBP), LAYOUT & DIETARY TAGS -->
        <div class="fd-toolbar">
          <div class="fd-toolbar-top">
            <div class="fd-search-box">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                class="fd-search-input"
                placeholder="Search ${totalDishCount}+ dishes, ingredients, burgers, mezza, grills..."
                value="${(activeSearch || '').replace(/"/g, '&quot;')}"
                oninput="handleMenuSearch('${mode}', this.value)"
              />
            </div>

            <div class="fd-toolbar-actions">
              <!-- Multi-Currency Toggle (USD / LBP) -->
              <div class="fd-toggle-pill-group" title="Switch Menu Currency">
                <button
                  type="button"
                  class="fd-toggle-btn ${state.currency === 'USD' ? 'active' : ''}"
                  onclick="setMenuCurrency('USD')"
                >
                  $ USD
                </button>
                <button
                  type="button"
                  class="fd-toggle-btn ${state.currency === 'LBP' ? 'active' : ''}"
                  onclick="setMenuCurrency('LBP')"
                >
                  L.L. LBP
                </button>
              </div>

              <!-- View Mode Toggle (Split List vs Photo Grid) -->
              <div class="fd-toggle-pill-group" title="Switch Menu Layout">
                <button
                  type="button"
                  class="fd-toggle-btn ${state.menuLayout === 'split' ? 'active' : ''}"
                  onclick="setMenuLayout('split')"
                >
                  <i class="fa-solid fa-table-list"></i> FineDine Split
                </button>
                <button
                  type="button"
                  class="fd-toggle-btn ${state.menuLayout === 'grid' ? 'active' : ''}"
                  onclick="setMenuLayout('grid')"
                >
                  <i class="fa-solid fa-grip"></i> Photo Grid
                </button>
              </div>

              <button class="btn btn-whatsapp" style="padding:10px 16px; font-size:0.82rem;" onclick="openCartDrawer()">
                <i class="fa-solid fa-bag-shopping"></i>
                <span>Bag (${cartCount}) • ${formatPrice(cartTotal)}</span>
              </button>
            </div>
          </div>

          <div class="fd-dietary-row">
            <div class="fd-dietary-pills">
              <button
                type="button"
                class="fd-diet-chip ${state.dietaryFilter === 'all' ? 'active' : ''}"
                onclick="setDietaryFilter('all')"
              >
                All Dishes
              </button>
              <button
                type="button"
                class="fd-diet-chip ${state.dietaryFilter === 'popular' ? 'active' : ''}"
                onclick="setDietaryFilter('popular')"
              >
                <i class="fa-solid fa-fire" style="color:#d97706;"></i> Popular & Signatures
              </button>
              <button
                type="button"
                class="fd-diet-chip ${state.dietaryFilter === 'spicy' ? 'active' : ''}"
                onclick="setDietaryFilter('spicy')"
              >
                <i class="fa-solid fa-pepper-hot" style="color:#dc2626;"></i> Spicy
              </button>
              <button
                type="button"
                class="fd-diet-chip ${state.dietaryFilter === 'vegetarian' ? 'active' : ''}"
                onclick="setDietaryFilter('vegetarian')"
              >
                <i class="fa-solid fa-leaf" style="color:#16a34a;"></i> Vegetarian
              </button>
              <button
                type="button"
                class="fd-diet-chip ${state.dietaryFilter === 'sharing' ? 'active' : ''}"
                onclick="setDietaryFilter('sharing')"
              >
                <i class="fa-solid fa-users" style="color:#4f46e5;"></i> Group & Sharing
              </button>
            </div>
            <div style="font-size:0.75rem; color:#6b7280;">
              ${state.currency === 'LBP' ? 'Rate: 1 USD = 89,500 L.L.' : 'Prices shown in USD ($)'}
            </div>
          </div>
        </div>

        <!-- 3. FINEDINE MENU CATEGORIES & DISH CARDS -->
        <div id="menuCategoriesResults">
          ${
            filteredCats.length === 0
              ? `<div style="text-align:center; padding:60px 20px; background:var(--bg-card); border-radius:20px; border:1px solid var(--border-subtle);">
                  <i class="fa-solid fa-utensils" style="font-size:2.5rem; color:var(--text-muted); margin-bottom:12px;"></i>
                  <h3>No matching dishes found</h3>
                  <p style="color:var(--text-muted); margin-bottom:18px;">Try clearing your search or dietary filter, or message us directly on WhatsApp!</p>
                  <button class="btn btn-primary" onclick="state.dietaryFilter='all'; handleMenuCatSelect('${mode}', 'all'); handleMenuSearch('${mode}', '');">Reset All Filters</button>
                </div>`
              : filteredCats
                  .map(cat => {
                    const visibleItems = isOverviewMode ? cat.items.slice(0, 6) : cat.items;
                    const hiddenCount = cat.items.length - visibleItems.length;
                    return `
                <div class="fd-category-section" id="cat-block-${cat.id}">
                  <div class="fd-category-banner">
                    <div class="fd-category-banner-left">
                      <img
                        src="${cat.thumbImg || cat.items[0]?.img || CONFIG.logos.main}"
                        onerror="handleImgError(this)"
                        alt="${cat.name.replace(/"/g, '&quot;')}"
                        class="fd-category-banner-thumb"
                        loading="lazy"
                      />
                      <div>
                        <h3 class="fd-category-banner-title">${cat.name}</h3>
                        <div class="fd-category-banner-sub">${cat.subtitle || cat.badge} • ${cat.items.length} dishes</div>
                      </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                      ${
                        activeCat !== 'all'
                          ? `<button type="button" class="btn btn-outline-dark" style="padding:8px 14px; font-size:0.78rem;" onclick="handleMenuCatSelect('${mode}', 'all')"><i class="fa-solid fa-arrow-left"></i> Back to All Categories</button>`
                          : ''
                      }
                      <button
                        class="btn btn-whatsapp"
                        style="padding:8px 14px; font-size:0.78rem;"
                        onclick="openWhatsApp('${mode === 'catering' ? 'catering' : mode === 'resto' ? 'restaurant' : 'delivery'}', 'Hello Mini Kitchen! I have a question about your *${cat.name}* menu section.')"
                      >
                        <i class="fa-brands fa-whatsapp"></i> Ask About ${cat.name}
                      </button>
                    </div>
                  </div>

                  ${
                    state.menuLayout === 'grid'
                      ? `<div class="menu-items-grid">
                          ${visibleItems
                            .map(item => {
                              const inBagQty = qtyByItemId[item.id] || 0;
                              const isSoldOut = Boolean(item.soldOut);
                              return `
                            <div class="dish-card" style="cursor:${isSoldOut ? 'not-allowed' : 'pointer'}; ${isSoldOut ? 'opacity:0.65;' : ''}" onclick="${isSoldOut ? `showToast('This dish is currently marked Sold Out.')` : `openFineDineModal('${item.id}', '${mode}')`}">
                              <div class="dish-card-img-wrap">
                                <img src="${item.img}" onerror="handleImgError(this, '${item.fallbackImg}')" alt="${item.title.replace(/"/g, '&quot;')}" loading="lazy" />
                                <span class="dish-price-tag">${formatPrice(item.priceValue)}</span>
                              </div>
                              <div class="dish-card-body">
                                ${renderBadgePills(item.badges)}
                                <div class="dish-title">${item.title}</div>
                                <div class="dish-desc">${item.desc || 'Prepared fresh to order in our Ain Al Remmaneh, Aley kitchen.'}</div>
                                <div class="dish-actions">
                                  <button class="btn-add-order" ${isSoldOut ? 'disabled style="background:#9ca3af; cursor:not-allowed;"' : ''} onclick="event.stopPropagation(); ${isSoldOut ? '' : `openFineDineModal('${item.id}', '${mode}')`}">
                                    <i class="fa-solid ${isSoldOut ? 'fa-ban' : inBagQty > 0 ? 'fa-check' : 'fa-plus'}"></i>
                                    ${isSoldOut ? 'Sold Out' : inBagQty > 0 ? `In Bag (${inBagQty}) • Add More` : 'Customize & Add'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          `;
                            })
                            .join('')}
                        </div>`
                      : `<div class="fd-split-grid">
                          ${visibleItems
                            .map(item => {
                              const inBagQty = qtyByItemId[item.id] || 0;
                              const hasCustomMods = cat.modType && cat.modType !== 'none';
                              const isSoldOut = Boolean(item.soldOut);
                              return `
                            <div class="fd-item-card" style="${isSoldOut ? 'opacity:0.65; cursor:not-allowed;' : ''}" onclick="${isSoldOut ? `showToast('This dish is currently marked Sold Out.')` : `openFineDineModal('${item.id}', '${mode}')`}">
                              <div class="fd-item-info">
                                <div>
                                  ${renderBadgePills(item.badges)}
                                  <div class="fd-item-title">${item.title}</div>
                                  <div class="fd-item-desc">
                                    ${item.desc || 'Prepared fresh to order with signature Mini Kitchen ingredients.'}
                                  </div>
                                </div>
                                <div class="fd-item-bottom">
                                  <span class="fd-item-price">${formatPrice(item.priceValue)}</span>
                                  <span class="fd-item-meta-pill"><i class="fa-regular fa-clock"></i> ${item.prepTime || '15–20 min'}</span>
                                  ${
                                    isSoldOut
                                      ? `<span class="fd-item-customize-tag" style="color:#dc2626;"><i class="fa-solid fa-ban"></i> Sold Out</span>`
                                      : hasCustomMods
                                      ? `<span class="fd-item-customize-tag"><i class="fa-solid fa-sliders"></i> Customizable</span>`
                                      : `<span class="fd-item-customize-tag"><i class="fa-solid fa-circle-info"></i> View Details</span>`
                                  }
                                </div>
                              </div>

                              <div class="fd-item-media">
                                <img
                                  src="${item.img}"
                                  onerror="handleImgError(this, '${item.fallbackImg}')"
                                  alt="${item.title.replace(/"/g, '&quot;')}"
                                  class="fd-item-media-img"
                                  loading="lazy"
                                />
                                <button
                                  type="button"
                                  class="fd-add-float-btn ${inBagQty > 0 ? 'in-cart' : ''}"
                                  style="${isSoldOut ? 'background:#6b7280; color:#fff; cursor:not-allowed;' : ''}"
                                  onclick="event.stopPropagation(); ${isSoldOut ? '' : `openFineDineModal('${item.id}', '${mode}')`}"
                                >
                                  ${
                                    isSoldOut
                                      ? `<i class="fa-solid fa-ban"></i> Sold Out`
                                      : inBagQty > 0
                                      ? `<i class="fa-solid fa-check"></i> ${inBagQty} in Bag`
                                      : `<i class="fa-solid fa-plus"></i> Add`
                                  }
                                </button>
                              </div>
                            </div>
                          `;
                            })
                            .join('')}
                        </div>`
                  }

                  ${
                    hiddenCount > 0
                      ? `<div class="fd-cat-expand-footer">
                          <button type="button" class="fd-cat-expand-btn" onclick="handleMenuCatSelect('${mode}', '${cat.id}')">
                            <span>View All ${cat.items.length} Dishes in ${cat.name} (+${hiddenCount} more)</span>
                            <i class="fa-solid fa-arrow-right"></i>
                          </button>
                        </div>`
                      : ''
                  }
                </div>
              `;
                  })
                  .join('')
          }
        </div>
      </div>
    `;
  }

  window.handleMenuCatSelect = function (mode, catId) {
    if (mode === 'delivery') {
      state.deliveryCategory = catId;
    } else if (mode === 'catering') {
      state.cateringAlaCarteCat = catId;
    } else {
      state.restoCategory = catId;
    }
    renderMainView();
    setTimeout(() => {
      const anchor = document.getElementById('fdMenuTopAnchor');
      if (anchor) {
        anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 40);
  };

  window.handleMenuSearch = function (mode, query) {
    const cateringCatIds = [
      'hot-offers',
      'main-course',
      'lebanese-corner',
      'cheddar-fountain',
      'appetisers',
      'salads',
      'dessert'
    ];
    let activeCat = state.restoCategory;
    let allowedIds = null;
    if (mode === 'delivery') {
      state.deliverySearch = query;
      activeCat = state.deliveryCategory;
    } else if (mode === 'catering') {
      state.cateringAlaCarteSearch = query;
      activeCat = state.cateringAlaCarteCat;
      allowedIds = cateringCatIds;
    } else {
      state.restoSearch = query;
      activeCat = state.restoCategory;
    }

    const filteredCats = getFilteredMenuCategories(activeCat, query, allowedIds);
    const container = document.getElementById('menuCategoriesResults');
    if (container) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = renderInteractiveMenuExplorer(
        mode,
        filteredCats,
        activeCat,
        query,
        allowedIds ? MENU_DATA.filter(c => allowedIds.includes(c.id)) : MENU_DATA
      );
      const newResults = tempDiv.querySelector('#menuCategoriesResults');
      if (newResults) container.innerHTML = newResults.innerHTML;
    }
  };

  // --------------------------------------------------------------------------
  // 5. ABOUT US PAGE (SECTION 5)
  // --------------------------------------------------------------------------
  function buildAboutPage() {
    return `
      <section class="hero-section" style="min-height: 58vh; padding: 64px 0;">
        <div class="hero-bg-media">
          <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1800&q=85" alt="Mini Kitchen Chefs & Culinary Team" />
        </div>
        <div class="hero-overlay"></div>
        <div class="container">
          <div class="hero-content">
            <div class="hero-eyebrow"><i class="fa-solid fa-heart"></i> <span>The People & Passion Behind Mini Kitchen</span></div>
            <h1 class="hero-title">Our Story, Our Chefs & <span class="gold-accent">Uncompromising</span> Craft</h1>
            <p class="hero-subtitle">
              From a passionate mountain kitchen in Ain Al Remmaneh, Aley to a premier three-brand hospitality group serving weddings, diners, and homes across Mount Lebanon.
            </p>
          </div>
        </div>
      </section>

      <!-- OUR STORY & EVOLUTION -->
      <section class="section-pad">
        <div class="container">
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 50px; align-items:center;">
            <div>
              <span class="section-eyebrow">How It All Started</span>
              <h2 class="section-title">From Aley’s Favorite Kitchen to Lebanon’s Trusted Event Caterer</h2>
              <p style="color:var(--text-muted); margin-bottom:16px; font-size:1.02rem;">
                <b>Mini Kitchen</b> began in <b>Ain Al Remmaneh, Aley</b> with a bold culinary mission: to honor the warmth and generosity of traditional Lebanese cuisine while introducing playful, modern American flavors—our signature <i>#NotSoTraditional</i> twist.
              </p>
              <p style="color:var(--text-muted); margin-bottom:16px; font-size:1.02rem;">
                As word spread about our morning Bil Foron Manakish, authentic Lebanese mezza, charcoal-grilled fillets, and our viral Molten Cheddar Fountain, guests began asking us to bring the Mini Kitchen experience to their weddings, engagements, corporate galas, and private mountain villas.
              </p>
              <p style="color:var(--text-muted); margin-bottom:26px; font-size:1.02rem;">
                Today, Mini Kitchen proudly operates through three dedicated divisions—<b>Mini Kitchen Catering</b>, <b>Mini Kitchen Restaurant</b>, and <b>Mini Kitchen Delivery</b>—united by one kitchen brigade, strict hygiene and halal quality standards, and a genuine love for hospitality.
              </p>
              <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:14px; text-align:center;">
                <div style="background:var(--bg-card); border:1px solid var(--border-subtle); padding:18px; border-radius:14px; box-shadow:var(--shadow-soft);">
                  <div style="font-family:var(--font-serif); font-size:2rem; font-weight:700; color:var(--brand-primary);">3</div>
                  <div style="font-size:0.8rem; font-weight:700; color:var(--text-muted);">Specialized Brands</div>
                </div>
                <div style="background:var(--bg-card); border:1px solid var(--border-subtle); padding:18px; border-radius:14px; box-shadow:var(--shadow-soft);">
                  <div style="font-family:var(--font-serif); font-size:2rem; font-weight:700; color:var(--brand-primary);">239+</div>
                  <div style="font-size:0.8rem; font-weight:700; color:var(--text-muted);">Handcrafted Dishes</div>
                </div>
                <div style="background:var(--bg-card); border:1px solid var(--border-subtle); padding:18px; border-radius:14px; box-shadow:var(--shadow-soft);">
                  <div style="font-family:var(--font-serif); font-size:2rem; font-weight:700; color:var(--brand-primary);">100%</div>
                  <div style="font-size:0.8rem; font-weight:700; color:var(--text-muted);">Fresh & Halal</div>
                </div>
              </div>
            </div>
            <div>
              <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1000&q=85" alt="Chefs Plating at Mini Kitchen" style="border-radius:24px; box-shadow:var(--shadow-hover); width:100%; height:480px; object-fit:cover;" />
            </div>
          </div>
        </div>
      </section>

      <!-- MEET OUR CHEFS & TEAM -->
      <section class="section-pad" style="background:var(--bg-elevated);">
        <div class="container">
          <div class="section-header">
            <span class="section-eyebrow">Culinary & Event Leadership</span>
            <h2 class="section-title">Meet the Chefs & Team Behind Mini Kitchen</h2>
            <p class="section-desc">
              Our experienced chefs, grill masters, pastry artisans, and event coordinators work in harmony to make every plate and every event extraordinary.
            </p>
          </div>

          <div class="team-grid">
            ${CONFIG.teamMembers
              .map(
                m => `
              <div class="team-card">
                <img src="${m.img}" onerror="handleImgError(this)" alt="${m.name}" loading="lazy" />
                <div class="team-card-body">
                  <div class="team-role">${m.role}</div>
                  <h4 style="font-family:var(--font-serif); font-size:1.3rem; margin-bottom:8px;">${m.name}</h4>
                  <p style="font-size:0.88rem; color:var(--text-muted);">${m.bio}</p>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </section>

      ${renderClientTestimonialsSection()}

      <!-- BEHIND THE SCENES: PREP, SETUP & WEDDING EXECUTION -->
      <section class="section-pad section-dark">
        <div class="container">
          <div class="section-header">
            <span class="section-eyebrow">Behind The Scenes</span>
            <h2 class="section-title">From Kitchen Prep to Flawless Event Execution</h2>
            <p class="section-desc">
              See how our team prepares fresh ingredients at dawn, fires up the charcoal grills, builds luxury wedding buffets, and serves your guests with pride.
            </p>
          </div>

          <div class="gallery-grid">
            ${CONFIG.behindTheScenes
              .map(
                b => `
              <div class="gallery-card">
                <img src="${b.img}" onerror="handleImgError(this)" alt="${b.title}" loading="lazy" />
                <div class="gallery-card-overlay">
                  <span class="gallery-tag">${b.stage}</span>
                  <h4>${b.title}</h4>
                  <p>${b.desc}</p>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </section>
    `;
  }

  // --------------------------------------------------------------------------
  // 6. CONTACT US & WHATSAPP INTEGRATION PAGE (SECTION 7)
  // --------------------------------------------------------------------------
  function buildContactPage() {
    return `
      <section class="hero-section" style="min-height: 48vh; padding: 60px 0;">
        <div class="hero-bg-media">
          <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1800&q=85" alt="Contact Mini Kitchen" />
        </div>
        <div class="hero-overlay"></div>
        <div class="container">
          <div class="hero-content">
            <div class="hero-eyebrow"><i class="fa-brands fa-whatsapp"></i> <span>Instant WhatsApp & Direct Lines</span></div>
            <h1 class="hero-title">Get in Touch with <span class="gold-accent">Mini Kitchen</span></h1>
            <p class="hero-subtitle">
              Connect directly with the right team—whether you are booking wedding & event catering, reserving a scenic table at our Aley restaurant, or ordering food delivery.
            </p>
          </div>
        </div>
      </section>

      <section class="section-pad">
        <div class="container">
          <!-- THREE BRAND DIRECT WHATSAPP CARDS -->
          <div class="brands-trio-grid" style="margin-bottom: 64px;">
            <div class="brand-pillar-card" style="padding:30px; border-top: 4px solid #c59b27;">
              <span class="section-eyebrow" style="color:#9e7815;">1. Weddings & Events</span>
              <h3 style="font-family:var(--font-serif); font-size:1.55rem; margin-bottom:8px;">Mini Kitchen Catering</h3>
              <p style="color:var(--text-muted); font-size:0.92rem; margin-bottom:18px;">
                For wedding packages, corporate galas, private parties, live cooking stations, and custom event quotations.
              </p>
              <div style="margin-bottom:20px; font-size:0.92rem;">
                <div><b>Direct Phone / WhatsApp:</b> <a href="tel:+96171048154" style="color:#9e7815; font-weight:700;">${CONFIG.contacts.catering.phoneDisplay}</a></div>
                <div><b>Secondary Line:</b> ${CONFIG.contacts.catering.secondaryDisplay}</div>
                <div><b>Email:</b> ${CONFIG.contacts.catering.email}</div>
              </div>
              <button class="btn btn-whatsapp" style="width:100%;" onclick="openWhatsApp('catering')">
                <i class="fa-brands fa-whatsapp"></i> Message Catering on WhatsApp
              </button>
            </div>

            <div class="brand-pillar-card" style="padding:30px; border-top: 4px solid #2d6a4f;">
              <span class="section-eyebrow" style="color:#2d6a4f;">2. Dine-In & Terrace Views</span>
              <h3 style="font-family:var(--font-serif); font-size:1.55rem; margin-bottom:8px;">Mini Kitchen Restaurant</h3>
              <p style="color:var(--text-muted); font-size:0.92rem; margin-bottom:18px;">
                For table reservations, group dining formulas, birthday tables, and directions in Ain Al Remmaneh, Aley.
              </p>
              <div style="margin-bottom:20px; font-size:0.92rem;">
                <div><b>Restaurant Line:</b> <a href="tel:+9613682186" style="color:#2d6a4f; font-weight:700;">${CONFIG.contacts.restaurant.phoneDisplay}</a></div>
                <div><b>Opening Hours:</b> ${CONFIG.location.hours}</div>
                <div><b>Location:</b> ${CONFIG.location.short}</div>
              </div>
              <button class="btn btn-whatsapp" style="width:100%;" onclick="openWhatsApp('restaurant')">
                <i class="fa-brands fa-whatsapp"></i> Book Restaurant Table on WhatsApp
              </button>
            </div>

            <div class="brand-pillar-card" style="padding:30px; border-top: 4px solid #d94e28;">
              <span class="section-eyebrow" style="color:#d94e28;">3. Fast Home & Office Delivery</span>
              <h3 style="font-family:var(--font-serif); font-size:1.55rem; margin-bottom:8px;">Mini Kitchen Delivery</h3>
              <p style="color:var(--text-muted); font-size:0.92rem; margin-bottom:18px;">
                For fast food delivery orders across Ain Al Remmaneh, Aley, Bhamdoun, Souk El Gharb, Kahale, and surrounding areas.
              </p>
              <div style="margin-bottom:20px; font-size:0.92rem;">
                <div><b>Delivery Hotline / WhatsApp:</b> <a href="tel:+9613682186" style="color:#d94e28; font-weight:700;">${CONFIG.contacts.delivery.phoneDisplay}</a></div>
                <div><b>Delivery Hours:</b> ${CONFIG.location.hours}</div>
                <div><b>Order Online:</b> Select items in our Delivery Menu</div>
              </div>
              <button class="btn btn-whatsapp" style="width:100%;" onclick="openWhatsApp('delivery')">
                <i class="fa-brands fa-whatsapp"></i> Order Delivery on WhatsApp
              </button>
            </div>
          </div>

          <!-- FULL CATERING & GENERAL INQUIRY FORM + MAP -->
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 42px; align-items:start;">
            <div class="form-card">
              <h3 style="font-family:var(--font-serif); font-size:1.65rem; margin-bottom:8px;">Send an Event or Dining Inquiry to WhatsApp</h3>
              <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:22px;">Complete the details below and click send—your message will open directly in WhatsApp with the appropriate Mini Kitchen team.</p>
              <form onsubmit="submitCateringQuoteForm(event)">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Your Name *</label>
                    <input type="text" id="quoteName" class="form-control" placeholder="Full Name" required />
                  </div>
                  <div class="form-group">
                    <label>Your Phone Number *</label>
                    <input type="tel" id="quotePhone" class="form-control" placeholder="+961 ..." required />
                  </div>
                  <div class="form-group">
                    <label>Inquiry Type *</label>
                    <select id="quoteEventType" class="form-control" required>
                      <option value="Wedding Catering Inquiry">Wedding Catering Inquiry</option>
                      <option value="Corporate Catering Inquiry">Corporate Catering Inquiry</option>
                      <option value="Private Party / Birthday Catering">Private Party / Birthday Catering</option>
                      <option value="Restaurant Table Reservation">Restaurant Table Reservation</option>
                      <option value="Delivery / Group Order">Delivery / Group Order</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Number of Guests *</label>
                    <input type="number" id="quoteGuests" class="form-control" placeholder="e.g., 100" required />
                  </div>
                  <div class="form-group">
                    <label>Event / Reservation Date *</label>
                    <input type="date" id="quoteDate" class="form-control" required />
                  </div>
                  <div class="form-group">
                    <label>Event Location / Venue *</label>
                    <input type="text" id="quoteLocation" class="form-control" placeholder="e.g., Aley, Beirut, Villa..." required />
                  </div>
                  <div class="form-group full">
                    <label>Requested Package or Services</label>
                    <input type="text" id="quotePackage" class="form-control" placeholder="e.g., Wedding Buffet, Live Burger Station, Lebanese Mezza Formula" />
                  </div>
                  <div class="form-group full">
                    <label>Message / Details</label>
                    <textarea id="quoteNotes" class="form-control" rows="3" placeholder="Any questions or custom requests..."></textarea>
                  </div>
                </div>
                <button type="submit" class="btn btn-whatsapp" style="width:100%; margin-top:18px;">
                  <i class="fa-brands fa-whatsapp"></i> Send Directly on WhatsApp
                </button>
              </form>
            </div>

            <div>
              <div style="background:var(--bg-card); border:1px solid var(--border-subtle); padding:30px; border-radius:20px; box-shadow:var(--shadow-soft); margin-bottom:24px;">
                <h3 style="font-family:var(--font-serif); font-size:1.5rem; margin-bottom:14px;">Our Location & Social Media</h3>
                <p style="color:var(--text-muted); margin-bottom:16px;">
                  <b>Address:</b> ${CONFIG.location.full}<br/>
                  <b>Opening Hours:</b> ${CONFIG.location.hours}<br/>
                  <b>Email:</b> <a href="mailto:${CONFIG.contacts.catering.email}">${CONFIG.contacts.catering.email}</a>
                </p>
                <div style="display:flex; gap:12px; flex-wrap:wrap;">
                  <a href="${CONFIG.socials.instagram}" target="_blank" class="btn btn-outline-dark" style="padding:10px 18px; font-size:0.85rem;">
                    <i class="fa-brands fa-instagram"></i> Instagram (${CONFIG.socials.instagramHandle})
                  </a>
                  <a href="${CONFIG.socials.tiktok}" target="_blank" class="btn btn-outline-dark" style="padding:10px 18px; font-size:0.85rem;">
                    <i class="fa-brands fa-tiktok"></i> TikTok
                  </a>
                  <a href="${CONFIG.socials.facebook}" target="_blank" class="btn btn-outline-dark" style="padding:10px 18px; font-size:0.85rem;">
                    <i class="fa-brands fa-facebook"></i> Facebook
                  </a>
                </div>
              </div>
              <div style="border-radius:20px; overflow:hidden; height:340px; box-shadow:var(--shadow-soft);">
                <iframe src="${CONFIG.location.mapEmbedUrl}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // ==========================================================================
  // 3-MENU QR CODE STUDIO MODAL (VIEW, SCAN, COPY & PRINT TABLE TENTS)
  // ==========================================================================
  function ensureQrStudioModalDom() {
    let backdrop = document.getElementById('qrStudioBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'qrStudioBackdrop';
      backdrop.className = 'qr-studio-backdrop';
      backdrop.onclick = e => {
        if (e.target === backdrop) closeQrStudioModal();
      };
      document.body.appendChild(backdrop);
    }
    return backdrop;
  }

  window.openQrStudioModal = function (highlightMode = 'all') {
    const backdrop = ensureQrStudioModalDom();
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
            onclick="closeQrStudioModal()"
            style="width:38px; height:38px; border-radius:50%; background:rgba(255,255,255,0.12); color:#fff; border:none; cursor:pointer; font-size:1.1rem;"
            aria-label="Close QR Studio"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="qr-studio-body">
          <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; background:var(--bg-card); padding:14px 18px; border-radius:14px; border:1px solid var(--border-subtle); margin-bottom:20px;">
            <div style="font-size:0.84rem; color:var(--text-muted);">
              <i class="fa-solid fa-circle-info" style="color:var(--brand-primary); margin-right:6px;"></i>
              Each QR code opens its corresponding FineDine menu directly in <b>Full-Screen QR Table Mode</b> (<code>?qr=1</code>) for instant mobile scanning.
            </div>
            <button
              type="button"
              class="fd-qr-action-btn ${state.qrTableMode ? 'primary' : ''}"
              onclick="toggleQrTableMode(); closeQrStudioModal();"
            >
              <i class="fa-solid ${state.qrTableMode ? 'fa-compress' : 'fa-expand'}"></i>
              <span>${state.qrTableMode ? 'Exit QR Table Mode Now' : 'Preview QR Table Mode'}</span>
            </button>
          </div>

          <div class="qr-studio-grid">
            ${list
              .map(m => {
                const isHighlighted = highlightMode === m.mode;
                const qrSrc = getQrImageSrc(m.url, 220);
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
                      <img src="${qrSrc}" onerror="handleImgError(this, '${FALLBACK_QR_SVG}')" alt="${m.title}" />
                    </div>

                    <div class="qr-scan-caption" style="color:${m.color};">
                      <i class="fa-solid fa-mobile-screen-button"></i> ${m.tableHint}
                    </div>
                    <div style="font-size:0.75rem; color:#6b7280; margin-bottom:14px;">
                      WhatsApp Line: <b>${m.phone}</b>
                    </div>

                    <div class="qr-card-btn-stack">
                      <button
                        type="button"
                        class="btn btn-primary"
                        style="background:${m.color}; color:#fff; padding:10px 14px; font-size:0.8rem; width:100%;"
                        onclick="closeQrStudioModal(); navigateToPage('${m.pageId}'); toggleQrTableMode(true);"
                      >
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Open This QR Menu
                      </button>
                      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                        <button
                          type="button"
                          class="fd-qr-action-btn"
                          style="justify-content:center; width:100%;"
                          onclick="printQrStandeeCard('${m.mode}')"
                        >
                          <i class="fa-solid fa-print"></i> Print Standee
                        </button>
                        <button
                          type="button"
                          class="fd-qr-action-btn"
                          style="justify-content:center; width:100%;"
                          onclick="copyQrMenuLink('${m.url}')"
                        >
                          <i class="fa-solid fa-link"></i> Copy Link
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      </div>
    `;

    backdrop.classList.add('open');
  };

  window.closeQrStudioModal = function () {
    document.getElementById('qrStudioBackdrop')?.classList.remove('open');
  };

  window.copyQrMenuLink = function (url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('Direct QR Menu link copied to clipboard!');
      });
    } else {
      showToast(`QR Link: ${url}`);
    }
  };

  window.printQrStandeeCard = function (mode) {
    const qrMenus = getQrMenusMeta();
    const m = qrMenus[mode] || qrMenus.resto;
    const qrSrc = getQrImageSrc(m.url, 340);
    const win = window.open('', '_blank', 'width=520,height=720');
    if (!win) {
      showToast('Please allow pop-ups to print the QR Table Tent card.');
      return;
    }
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print QR Standee — ${m.title}</title>
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
      <body onload="setTimeout(() => window.print(), 450)">
        <div class="standee">
          <div class="eyebrow">${m.badge}</div>
          <h1>MINI KITCHEN</h1>
          <p>${m.title}<br/>${m.desc}</p>
          <div class="qr-box">
            <img src="${qrSrc}" alt="QR Code" />
          </div>
          <div class="footer">Scan with your phone camera to browse & order</div>
          <div class="sub">Ain Al Remmaneh, Aley • WhatsApp: ${m.phone}</div>
        </div>
      </body>
      </html>
    `);
    win.document.close();
  };

  // ==========================================================================
  // OWNER EASY MENU & PRICE MANAGER MODAL (SECTION 8 REQUIREMENT)
  // ==========================================================================
  window.openMenuManagerModal = function () {
    const modal = document.getElementById('cmsManagerModal');
    if (!modal) return;
    modal.style.display = 'flex';
    renderCmsItemList('');
  };

  window.closeMenuManagerModal = function () {
    const modal = document.getElementById('cmsManagerModal');
    if (modal) modal.style.display = 'none';
  };

  window.renderCmsItemList = function (query) {
    const listEl = document.getElementById('cmsItemsContainer');
    if (!listEl) return;
    const q = (query || '').toLowerCase().trim();
    const rows = [];

    for (const cat of MENU_DATA) {
      for (const item of cat.items) {
        if (!q || item.title.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q)) {
          rows.push({ catName: cat.name, item });
        }
        if (rows.length >= 40) break;
      }
      if (rows.length >= 40) break;
    }

    listEl.innerHTML = rows
      .map(
        ({ catName, item }) => `
      <div style="display:grid; grid-template-columns: 1.5fr 2fr 110px 110px; gap:10px; align-items:center; padding:10px 0; border-bottom:1px solid #e5e7eb;">
        <div>
          <div style="font-size:0.72rem; color:var(--text-muted);">${catName}</div>
          <input type="text" value="${item.title.replace(/"/g, '&quot;')}" id="cms-title-${item.id}" class="form-control" style="padding:7px 10px; font-size:0.84rem;" />
        </div>
        <div>
          <div style="font-size:0.72rem; color:var(--text-muted);">Description</div>
          <input type="text" value="${item.desc.replace(/"/g, '&quot;')}" id="cms-desc-${item.id}" class="form-control" style="padding:7px 10px; font-size:0.84rem;" />
        </div>
        <div>
          <div style="font-size:0.72rem; color:var(--text-muted);">Price</div>
          <input type="text" value="${item.price}" id="cms-price-${item.id}" class="form-control" style="padding:7px 10px; font-size:0.84rem;" />
        </div>
        <div style="padding-top:16px;">
          <button class="btn btn-primary" style="padding:8px 12px; font-size:0.78rem; width:100%;" onclick="saveCmsItem('${item.id}')">Save</button>
        </div>
      </div>
    `
      )
      .join('');
  };

  window.saveCmsItem = function (itemId) {
    const newTitle = document.getElementById(`cms-title-${itemId}`)?.value?.trim();
    const newDesc = document.getElementById(`cms-desc-${itemId}`)?.value?.trim();
    const newPrice = document.getElementById(`cms-price-${itemId}`)?.value?.trim();

    for (const cat of MENU_DATA) {
      const item = cat.items.find(i => i.id === itemId);
      if (item) {
        if (newTitle) item.title = newTitle;
        if (newDesc !== undefined) item.desc = newDesc;
        if (newPrice) {
          item.price = newPrice.startsWith('$') ? newPrice : `$${newPrice}`;
          item.priceValue = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
        }
        break;
      }
    }
    localStorage.setItem('mk_custom_menu_data_v3', JSON.stringify(MENU_DATA));
    renderMainView();
    showToast('Menu item updated & saved!');
  };

  window.resetCmsMenuData = function () {
    localStorage.removeItem('mk_custom_menu_data_v3');
    MENU_DATA = window.MK_MENU_CATEGORIES;
    renderCmsItemList('');
    renderMainView();
    showToast('Menu reset to default data.');
  };

  // ==========================================================================
  // LIVE ORDER STATUS TRACKER MODAL (#MK-XXXX)
  // ==========================================================================
  function ensureOrderTrackerModalDom() {
    let backdrop = document.getElementById('orderTrackerBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'orderTrackerBackdrop';
      backdrop.className = 'qr-studio-backdrop';
      backdrop.onclick = e => {
        if (e.target === backdrop) closeOrderTrackerModal();
      };
      document.body.appendChild(backdrop);
    }
    return backdrop;
  }

  window.openOrderTrackerModal = function (prefillId) {
    const backdrop = ensureOrderTrackerModalDom();
    const initialId =
      prefillId ||
      new URLSearchParams(window.location.search).get('track') ||
      localStorage.getItem('mk_last_order_id') ||
      'MK-1001';

    backdrop.innerHTML = `
      <div class="qr-studio-dialog" style="max-width:660px;" role="dialog" aria-modal="true" aria-label="Track Live Order Status">
        <div class="qr-studio-header">
          <div>
            <div style="font-size:0.72rem; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; color:var(--brand-primary); margin-bottom:4px;">
              <i class="fa-solid fa-truck-fast"></i> Live Kitchen & Delivery Order Tracker
            </div>
            <h3 style="font-family:var(--font-serif); font-size:1.45rem; margin:0;">
              Track Your Order or Catering Quote (#MK-XXXX)
            </h3>
          </div>
          <button
            type="button"
            onclick="closeOrderTrackerModal()"
            style="width:38px; height:38px; border-radius:50%; background:rgba(255,255,255,0.12); color:#fff; border:none; cursor:pointer; font-size:1.1rem;"
            aria-label="Close Tracker"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="qr-studio-body">
          <form onsubmit="submitTrackOrderLookup(event)" style="display:flex; gap:10px; margin-bottom:18px; flex-wrap:wrap;">
            <input
              type="text"
              id="trackOrderInput"
              class="form-control"
              style="flex:1; min-width:200px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em;"
              placeholder="Enter Order Reference (e.g. MK-1001)"
              value="${String(initialId).replace(/^#/, '').replace(/"/g, '&quot;')}"
              required
            />
            <button type="submit" class="btn btn-primary" style="padding:12px 22px;">
              <i class="fa-solid fa-magnifying-glass"></i> Track Status
            </button>
          </form>

          <div id="trackOrderResultBox" style="min-height:140px;">
            <div style="text-align:center; padding:26px; color:var(--text-muted); font-size:0.9rem;">
              Looking up order status...
            </div>
          </div>
        </div>
      </div>
    `;

    backdrop.classList.add('open');
    if (initialId) {
      lookupOrderAndRender(initialId);
    }
  };

  window.closeOrderTrackerModal = function () {
    document.getElementById('orderTrackerBackdrop')?.classList.remove('open');
  };

  window.submitTrackOrderLookup = function (e) {
    if (e) e.preventDefault();
    const val = document.getElementById('trackOrderInput')?.value?.trim() || '';
    if (!val) return;
    lookupOrderAndRender(val);
  };

  async function lookupOrderAndRender(rawId) {
    const box = document.getElementById('trackOrderResultBox');
    if (!box) return;
    const cleanId = String(rawId).trim().replace(/^#/, '').toUpperCase();
    box.innerHTML = `<div style="text-align:center; padding:26px; color:var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Checking SQLite database for <b>#${cleanId}</b>...</div>`;

    let order = null;
    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(cleanId)}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.order) order = data.order;
      }
    } catch (e) {}

    // Fallback to local browser storage if offline
    if (!order) {
      try {
        const localOrders = JSON.parse(localStorage.getItem('mk_backoffice_orders_v1') || '[]');
        order = localOrders.find(o => String(o.id || '').toUpperCase() === cleanId);
      } catch (e) {}
    }

    if (!order) {
      box.innerHTML = `
        <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:16px; padding:24px; text-align:center;">
          <i class="fa-solid fa-circle-exclamation" style="font-size:2rem; color:#d94e28; margin-bottom:10px;"></i>
          <h4 style="margin-bottom:6px;">Order #${cleanId.replace(/[<>"']/g, '')} Not Found</h4>
          <p style="font-size:0.86rem; color:var(--text-muted); margin-bottom:14px;">
            Please check your Order Reference ID (for example: <b>MK-1001</b>, <b>MK-1002</b>, <b>MK-1003</b>, or <b>MK-1004</b>).
          </p>
          <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap;">
            <button type="button" class="fd-qr-action-btn" onclick="document.getElementById('trackOrderInput').value='MK-1001'; submitTrackOrderLookup();">Try #MK-1001</button>
            <button type="button" class="fd-qr-action-btn" onclick="document.getElementById('trackOrderInput').value='MK-1002'; submitTrackOrderLookup();">Try #MK-1002</button>
            <button type="button" class="fd-qr-action-btn" onclick="document.getElementById('trackOrderInput').value='MK-1004'; submitTrackOrderLookup();">Try #MK-1004</button>
          </div>
        </div>
      `;
      return;
    }

    const stages = [
      { key: 'new', label: 'Order Received', icon: 'fa-receipt' },
      { key: 'confirmed', label: 'Confirmed', icon: 'fa-circle-check' },
      { key: 'preparing', label: 'Preparing in Kitchen', icon: 'fa-fire-burner' },
      { key: 'out_for_delivery', label: 'Out for Delivery / Ready', icon: 'fa-motorcycle' },
      { key: 'completed', label: 'Completed', icon: 'fa-face-smile-beam' }
    ];
    const currentIdx = Math.max(0, stages.findIndex(s => s.key === order.status));
    const isCancelled = order.status === 'cancelled';

    const itemsSummary =
      Array.isArray(order.items) && order.items.length > 0
        ? order.items
            .map(i => `<div style="display:flex; justify-content:space-between; font-size:0.84rem; padding:4px 0; border-bottom:1px dashed var(--border-subtle);"><span><b>${Number(i.qty) || 1}x</b> ${i.title}</span><b>$${((Number(i.priceValue) || 0) * (Number(i.qty) || 1)).toFixed(2)}</b></div>`)
            .join('')
        : `<div style="font-size:0.85rem; color:var(--text-muted);">
            ${order.eventType ? `<div><b>Occasion:</b> ${order.eventType}</div>` : ''}
            ${order.eventDate ? `<div><b>Event Date:</b> ${order.eventDate}</div>` : ''}
            ${order.guests ? `<div><b>Guest Count:</b> ${order.guests} Guests</div>` : ''}
            ${order.packageSelected ? `<div><b>Selected Package:</b> ${order.packageSelected}</div>` : ''}
          </div>`;

    box.innerHTML = `
      <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:16px; padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px;">
          <div>
            <span style="font-size:0.74rem; font-weight:800; text-transform:uppercase; color:var(--brand-primary);">Reference #${order.id}</span>
            <h4 style="font-family:var(--font-serif); font-size:1.25rem; margin:2px 0 0;">
              ${order.customerFirstName || order.customerName || 'Valued Guest'} — ${
      order.type === 'catering_quote'
        ? 'Catering & Event Quote'
        : order.type === 'table_reservation'
        ? 'Restaurant Table Booking'
        : 'Delivery Order'
    }
            </h4>
          </div>
          <button type="button" class="fd-qr-action-btn" onclick="lookupOrderAndRender('${order.id}')">
            <i class="fa-solid fa-arrows-rotate"></i> Refresh Live Status
          </button>
        </div>

        ${
          isCancelled
            ? `<div style="background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; padding:12px 16px; border-radius:12px; font-weight:700; margin-bottom:16px;">
                <i class="fa-solid fa-ban"></i> This order or inquiry has been marked as Cancelled. Please message us on WhatsApp if you need assistance.
              </div>`
            : `
              <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:8px; margin-bottom:18px;">
                ${stages
                  .map((st, idx) => {
                    const done = idx <= currentIdx;
                    const active = idx === currentIdx;
                    return `
                      <div style="text-align:center; padding:10px 6px; border-radius:12px; border:1px solid ${
                        active ? 'var(--brand-primary)' : done ? '#16a34a' : 'var(--border-subtle)'
                      }; background:${
                        active ? 'rgba(197,155,39,0.14)' : done ? 'rgba(22,163,74,0.08)' : 'var(--bg-elevated)'
                      };">
                        <div style="font-size:1rem; color:${done ? '#16a34a' : 'var(--text-muted)'}; margin-bottom:4px;">
                          <i class="fa-solid ${st.icon}"></i>
                        </div>
                        <div style="font-size:0.7rem; font-weight:${active ? '800' : '600'}; color:var(--text-main); line-height:1.25;">
                          ${st.label}
                        </div>
                      </div>
                    `;
                  })
                  .join('')}
              </div>
            `
        }

        <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:12px; padding:14px; margin-bottom:14px;">
          <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--text-muted); margin-bottom:6px;">Order / Inquiry Summary</div>
          ${itemsSummary}
          ${
            Number(order.totalUsd) > 0
              ? `<div style="display:flex; justify-content:space-between; align-items:center; padding-top:8px; margin-top:6px; border-top:1px solid var(--border-subtle); font-weight:800;">
                  <span>Total Value:</span>
                  <span style="color:var(--brand-primary-dark);">$${Number(order.totalUsd).toFixed(2)} (${Math.round(
                    Number(order.totalUsd) * (Number(order.lbpRate) || LBP_RATE)
                  ).toLocaleString('en-US')} L.L.)</span>
                </div>`
              : ''
          }
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <span style="font-size:0.76rem; color:var(--text-muted);">
            <i class="fa-regular fa-clock"></i> Last updated: ${new Date(order.updatedAt || order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            type="button"
            class="btn btn-whatsapp"
            style="padding:9px 16px; font-size:0.82rem;"
            onclick="openWhatsApp('${order.brand || 'delivery'}', 'Hello Mini Kitchen! I am checking on my Order Reference *#${order.id}*.', true)"
          >
            <i class="fa-brands fa-whatsapp"></i> Chat About #${order.id} on WhatsApp
          </button>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // ARABIC / ENGLISH (العربية / EN) LANGUAGE & RTL SWITCHER
  // ==========================================================================
  const AR_NAV_TRANSLATIONS = {
    catering: 'خدمات التموين والأعراس',
    'catering-menus': 'قوائم الطعام والباقات',
    restaurant: 'المطعم والتراس • عاليه',
    delivery: 'خدمة التوصيل السريع',
    about: 'من نحن وفريق الطهاة',
    contact: 'تواصل معنا'
  };

  const EN_NAV_TRANSLATIONS = {
    catering: 'Catering',
    'catering-menus': 'Menus & Packages',
    restaurant: 'Restaurant',
    delivery: 'Delivery',
    about: 'About Us',
    contact: 'Contact'
  };

  function applySiteLanguage(lang) {
    const clean = lang === 'ar' ? 'ar' : 'en';
    state.lang = clean;
    document.documentElement.setAttribute('lang', clean);
    document.documentElement.setAttribute('dir', clean === 'ar' ? 'rtl' : 'ltr');
    document.body.classList.toggle('rtl-mode', clean === 'ar');
    try {
      localStorage.setItem('mk_site_lang', clean);
    } catch (e) {}

    const headerLabel = document.getElementById('langToggleLabel');
    if (headerLabel) {
      headerLabel.textContent = clean === 'ar' ? 'EN' : 'العربية';
    }
    const drawerLangBtn = document.getElementById('drawerLangSwitchBtn');
    if (drawerLangBtn) {
      drawerLangBtn.innerHTML =
        clean === 'ar'
          ? '<i class="fa-solid fa-globe"></i> <span>English (EN)</span>'
          : '<i class="fa-solid fa-globe"></i> <span>العربية (AR)</span>';
    }

    // Update top navigation pills
    const map = clean === 'ar' ? AR_NAV_TRANSLATIONS : EN_NAV_TRANSLATIONS;
    document.querySelectorAll('.header-center-nav .nav-pill[data-nav-page]').forEach(btn => {
      const key = btn.getAttribute('data-nav-page');
      if (map[key]) btn.textContent = map[key];
    });

    const hamLabel = document.querySelector('.hamburger-label');
    if (hamLabel) {
      hamLabel.textContent = clean === 'ar' ? 'القائمة' : 'Menu';
    }
  }

  window.toggleSiteLanguage = function () {
    const next = state.lang === 'ar' ? 'en' : 'ar';
    applySiteLanguage(next);
    renderHeaderActiveStates();
    showToast(
      next === 'ar'
        ? 'تم تفعيل اللغة العربية (Arabic RTL Enabled)'
        : 'Switched language to English'
    );
  };
  function showToast(msg) {
    let toast = document.getElementById('mkToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'mkToast';
      toast.style.cssText =
        'position:fixed; bottom:90px; right:24px; background:#0e1015; color:#fff; border:1px solid var(--brand-primary); padding:14px 22px; border-radius:12px; font-weight:700; font-size:0.88rem; z-index:3000; box-shadow:0 12px 30px rgba(0,0,0,0.35); transition: opacity 0.3s ease;';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#25d366; margin-right:8px;"></i> ${msg}`;
    toast.style.opacity = '1';
    clearTimeout(window.__mkToastTimer);
    window.__mkToastTimer = setTimeout(() => {
      toast.style.opacity = '0';
    }, 2800);
  }

  // ==========================================================================
  // INITIALIZE APPLICATION ON DOM READY
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    const defaultPageAttr = document.body.getAttribute('data-default-page');
    const hashPage = window.location.hash.replace('#', '').trim();
    const initialPage = hashPage || defaultPageAttr || 'catering';

    applySiteTheme(getSavedThemeMode());
    applySiteLanguage(state.lang);

    if (state.qrTableMode) {
      document.body.classList.add('qr-table-mode');
    }

    updateCartBadges();
    navigateToPage(initialPage);
    dismissPreloader();
    syncWithBackOfficeServer();

    const urlTrackId = new URLSearchParams(window.location.search).get('track');
    if (urlTrackId) {
      setTimeout(() => openOrderTrackerModal(urlTrackId), 350);
    }

    window.addEventListener('storage', e => {
      if (e.key === 'mk_theme_mode' && e.newValue) {
        applySiteTheme(e.newValue);
      }
      if (
        e.key === 'mk_custom_site_config_v3' ||
        e.key === 'mk_custom_menu_data_v3' ||
        e.key === 'mk_custom_lbp_rate_v1'
      ) {
        CONFIG = loadSavedSiteConfig() || window.MK_SITE_CONFIG;
        MENU_DATA = loadSavedMenuData() || window.MK_MENU_CATEGORIES;
        LBP_RATE = Number(localStorage.getItem('mk_custom_lbp_rate_v1')) || 89500;
        updatePageSeoMeta(state.currentPage);
        renderMainView();
        renderFdFloatingOrderBar();
      }
    });

    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.replace('#', '').trim();
      if (newHash && newHash !== state.currentPage) {
        navigateToPage(newHash);
      }
    });
  });
})();
