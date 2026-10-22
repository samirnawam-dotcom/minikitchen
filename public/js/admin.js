// ============================================================================
// MINI KITCHEN — BACK OFFICE, WHATSAPP ORDERS CRM & WEBSITE CMS CONTROLLER
// Manages:
// 1. Live Dashboard & KPI Analytics
// 2. WhatsApp Orders, Catering Quotes & Table Reservations CRM
// 3. FineDine Digital Menu Manager (22 Categories & 239+ Dishes CRUD + Stock)
// 4. Catering Packages & Live Cooking Stations Manager
// 5. Website Galleries (Weddings, Restaurant Views, Chefs & Behind-the-Scenes)
// 6. 3-Menu QR Code Generator & Table Tent Printer
// 7. Website Settings, WhatsApp Numbers, Delivery Areas & LBP Exchange Rate
// ============================================================================

(function () {
  function sanitizeAdminMenuCategories(cats) {
    if (!Array.isArray(cats)) return cats;
    const safePasta = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80';
    const itemImgMap = {
      'mk-item-93': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=800&q=80',
      'mk-item-94': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
      'mk-item-96': 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80'
    };
    cats.forEach(cat => {
      if (cat.fallbackImg && cat.fallbackImg.includes('1621996346565')) cat.fallbackImg = safePasta;
      if (cat.thumbImg && cat.thumbImg.includes('1621996346565')) cat.thumbImg = safePasta;
      if (Array.isArray(cat.items)) {
        cat.items.forEach(it => {
          if (itemImgMap[it.id] && (!it.img || it.img.includes('1621996346565'))) {
            it.img = itemImgMap[it.id];
          } else if (it.img && it.img.includes('1621996346565')) {
            it.img = safePasta;
          }
          if (!it.fallbackImg || it.fallbackImg.includes('1621996346565')) {
            it.fallbackImg = safePasta;
          }
        });
      }
    });
    return cats;
  }

  let SITE_CONFIG = loadLocal('mk_custom_site_config_v3') || cloneObj(window.MK_SITE_CONFIG);
  let MENU_CATEGORIES = sanitizeAdminMenuCategories(loadLocal('mk_custom_menu_data_v3') || cloneObj(window.MK_MENU_CATEGORIES));
  let LBP_RATE = Number(localStorage.getItem('mk_custom_lbp_rate_v1')) || 89500;
  let ORDERS = loadLocal('mk_backoffice_orders_v1') || [];

  const boState = {
    activeTab: 'dashboard', // 'dashboard' | 'orders' | 'menu' | 'catering' | 'qrcodes' | 'content' | 'seo' | 'settings' | 'security'
    orderTypeFilter: 'all', // 'all' | 'delivery_order' | 'catering_quote' | 'table_reservation' | 'whatsapp_inquiry'
    orderStatusFilter: 'all', // 'all' | 'new' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'completed' | 'cancelled'
    orderSearch: '',
    menuCatFilter: 'all',
    menuStockFilter: 'all', // 'all' | 'available' | 'soldout'
    menuSearch: '',
    cateringSubTab: 'packages', // 'packages' | 'stations'
    contentSubTab: 'cateringGallery', // 'cateringGallery' | 'restaurantGallery' | 'teamMembers' | 'behindTheScenes'
    seoPageKey: 'catering',
    authenticated: false,
    databaseInfo: null,
    auditLogs: [],
    adminUser: {
      username: 'admin',
      displayName: 'Mini Kitchen Executive Admin',
      role: 'Owner & Hospitality Director'
    }
  };

  function esc(val) {
    if (val === undefined || val === null) return '';
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function cloneObj(o) {
    return JSON.parse(JSON.stringify(o || {}));
  }

  function loadLocal(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveLocal(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
  }

  function formatUsd(val) {
    return `$${(Number(val) || 0).toFixed(2)}`;
  }

  function formatLbp(usdVal) {
    const lbp = Math.round((Number(usdVal) || 0) * LBP_RATE);
    return `${lbp.toLocaleString('en-US')} L.L.`;
  }

  function formatDateTime(iso) {
    if (!iso) return 'Just now';
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return esc(iso);
    }
  }

  // ==========================================================================
  // BACK OFFICE AUTHENTICATION & SESSION CONTROLLER
  // ==========================================================================
  // The session lives in an HttpOnly cookie that the browser sends automatically,
  // so no token is ever stored in localStorage/sessionStorage.
  try {
    localStorage.removeItem('mk_bo_auth_token');
    sessionStorage.removeItem('mk_bo_auth_token');
  } catch (e) {}

  function getAuthHeaders(extra = {}) {
    return { 'Content-Type': 'application/json', ...extra };
  }

  function setAuthenticatedUiState(isAuth, userObj) {
    boState.authenticated = Boolean(isAuth);
    if (userObj) {
      boState.adminUser = { ...boState.adminUser, ...userObj };
    }
    const overlay = document.getElementById('boAuthOverlay');
    if (overlay) {
      overlay.classList.toggle('authenticated', Boolean(isAuth));
    }
    const nameEl = document.getElementById('boAdminDisplayName');
    if (nameEl && boState.adminUser) {
      nameEl.textContent = boState.adminUser.displayName || boState.adminUser.username || 'Mini Kitchen Admin';
    }
  }

  async function verifyBoSessionOnLoad() {
    try {
      const res = await fetch('/api/auth/me', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setAuthenticatedUiState(true, data.user);
          return;
        }
      }
    } catch (e) {}
    setAuthenticatedUiState(false);
  }

  window.submitBoLogin = async function (e) {
    e.preventDefault();
    const userInp = document.getElementById('boLoginUser');
    const passInp = document.getElementById('boLoginPass');
    const rememberInp = document.getElementById('boLoginRemember');
    const errEl = document.getElementById('boAuthError');
    const btnEl = document.getElementById('boLoginSubmitBtn');

    const username = (userInp?.value || '').trim();
    const password = passInp?.value || '';
    const remember = rememberInp ? rememberInp.checked : true;

    if (errEl) errEl.style.display = 'none';
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Verifying Credentials...</span>';
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, remember })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (errEl) {
          errEl.textContent = data.error || 'Invalid username or password.';
          errEl.style.display = 'block';
        }
      } else {
        setAuthenticatedUiState(true, data.user);
        if (passInp) passInp.value = '';
        await refreshFromServer(true);
        showBoToast(
          data.user?.mustChangePassword
            ? 'Please set a new password in the Security & Admin Login tab.'
            : `Welcome back, ${data.user?.displayName || 'Mini Kitchen Admin'}!`
        );
      }
    } catch (networkErr) {
      if (errEl) {
        errEl.textContent = 'Server unreachable. Please check your connection and try again.';
        errEl.style.display = 'block';
      }
    } finally {
      if (btnEl) {
        btnEl.disabled = false;
        btnEl.innerHTML = '<i class="fa-solid fa-lock-open"></i> <span>Sign In to Back Office</span>';
      }
    }
  };

  window.logoutBoSession = async function () {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch (e) {}
    // Cached orders contain customer names, phones and addresses; don't leave them behind.
    try {
      localStorage.removeItem('mk_backoffice_orders_v1');
    } catch (e) {}
    ORDERS = [];
    setAuthenticatedUiState(false);
    showBoToast('Back Office session locked.');
  };

  window.toggleBoPasswordVisibility = function () {
    const passInp = document.getElementById('boLoginPass');
    const icon = document.getElementById('boLoginEyeIcon');
    if (!passInp) return;
    const isHidden = passInp.type === 'password';
    passInp.type = isHidden ? 'text' : 'password';
    if (icon) {
      icon.className = isHidden ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
    }
  };

  // Back Office Dark / Light Workspace Theme Toggle
  function applyBoWorkspaceTheme(mode) {
    const clean = mode === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bo-theme', clean);
    localStorage.setItem('mk_bo_ui_theme', clean);
    const icon = document.getElementById('boThemeToggleIcon');
    const label = document.getElementById('boThemeToggleLabel');
    if (icon) icon.className = clean === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    if (label) label.textContent = clean === 'dark' ? 'Light UI' : 'Dark UI';
  }

  window.toggleBoWorkspaceTheme = function () {
    const current = document.documentElement.getAttribute('data-bo-theme') === 'dark' ? 'dark' : 'light';
    applyBoWorkspaceTheme(current === 'dark' ? 'light' : 'dark');
  };

  // ==========================================================================
  // REAL-TIME AUDIO CHIME & UPLOAD HELPERS
  // ==========================================================================
  let knownOrderIds = new Set((ORDERS || []).map(o => o.id));
  let hasCompletedInitialSync = false;

  function isSoundAlertEnabled() {
    return localStorage.getItem('mk_bo_sound_alerts') !== 'off';
  }

  window.toggleBoSoundAlerts = function () {
    const next = isSoundAlertEnabled() ? 'off' : 'on';
    localStorage.setItem('mk_bo_sound_alerts', next);
    if (next === 'on') {
      playNewOrderChime();
      showBoToast('🔔 Kitchen & Order Sound Alerts enabled!');
    } else {
      showBoToast('🔇 Kitchen & Order Sound Alerts muted.');
    }
    renderActiveTab();
  };

  window.playNewOrderChime = function () {
    if (!isSoundAlertEnabled()) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [587.33, 880, 1174.66]; // D5 -> A5 -> D6 hospitality chime
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.13);
        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.13);
        gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + idx * 0.13 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.13 + 0.42);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.13);
        osc.stop(ctx.currentTime + idx * 0.13 + 0.45);
      });
    } catch (e) {}
  };

  window.uploadBoPhotoFile = function (fileInput, targetInputId, previewImgId) {
    const file = fileInput && fileInput.files && fileInput.files[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      showBoToast('Image must be under 6 MB.');
      fileInput.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = async function () {
      try {
        showBoToast('Uploading photo to server...');
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'same-origin',
          body: JSON.stringify({
            filename: file.name,
            dataUrl: reader.result
          })
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          showBoToast(data.error || 'Photo upload failed.');
          return;
        }
        const targetEl = document.getElementById(targetInputId);
        if (targetEl) targetEl.value = data.url;
        if (previewImgId) {
          const prevEl = document.getElementById(previewImgId);
          if (prevEl) prevEl.src = data.url;
        }
        showBoToast(`Photo uploaded (${data.sizeKb} KB) → ${data.url}`);
      } catch (err) {
        showBoToast('Could not upload photo to server.');
      } finally {
        fileInput.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // ==========================================================================
  // SERVER SYNCHRONIZATION (/api/state, /api/orders, /api/menu, /api/site-config)
  // ==========================================================================
  window.refreshFromServer = async function (silent = false) {
    try {
      const res = await fetch('/api/state', {
        cache: 'no-store',
        headers: getAuthHeaders(),
        credentials: 'same-origin'
      });
      if (!res.ok) throw new Error('Server unreachable');
      const data = await res.json();

      if (data.database) {
        boState.databaseInfo = data.database;
      }
      if (Array.isArray(data.auditLogs)) {
        boState.auditLogs = data.auditLogs;
      }
      if (Array.isArray(data.orders)) {
        const newlyArrived = hasCompletedInitialSync
          ? data.orders.filter(o => !knownOrderIds.has(o.id))
          : [];
        ORDERS = data.orders;
        knownOrderIds = new Set(ORDERS.map(o => o.id));
        hasCompletedInitialSync = true;
        saveLocal('mk_backoffice_orders_v1', ORDERS);

        if (newlyArrived.length > 0) {
          playNewOrderChime();
          const newest = newlyArrived[0];
          showBoToast(`🔔 New Order ${newest.id}: ${newest.customerName || 'Customer'}`);
        }
      }
      if (data.siteConfig) {
        SITE_CONFIG = data.siteConfig;
        if (!SITE_CONFIG.seo && window.MK_SITE_CONFIG && window.MK_SITE_CONFIG.seo) {
          SITE_CONFIG.seo = cloneObj(window.MK_SITE_CONFIG.seo);
        }
        saveLocal('mk_custom_site_config_v3', SITE_CONFIG);
      }
      if (Array.isArray(data.menuCategories) && data.menuCategories.length > 0) {
        MENU_CATEGORIES = sanitizeAdminMenuCategories(data.menuCategories);
        saveLocal('mk_custom_menu_data_v3', MENU_CATEGORIES);
      }
      if (data.lbpRate) {
        LBP_RATE = Number(data.lbpRate) || 89500;
        localStorage.setItem('mk_custom_lbp_rate_v1', String(LBP_RATE));
      }

      updateNavBadges();
      renderActiveTab();
      if (!silent) showBoToast('Synced live data with SQLite database & website!');
    } catch (e) {
      updateNavBadges();
      renderActiveTab();
    }
  };

  async function persistSiteConfigToServer() {
    saveLocal('mk_custom_site_config_v3', SITE_CONFIG);
    localStorage.setItem('mk_custom_lbp_rate_v1', String(LBP_RATE));
    try {
      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ siteConfig: SITE_CONFIG, lbpRate: LBP_RATE })
      });
      if (!res.ok) showBoToast('Website settings could not be saved to the server. Please sign in again and retry.');
    } catch (e) {
      showBoToast('Server unreachable. Website settings saved on this device only.');
    }
  }

  async function persistMenuToServer() {
    saveLocal('mk_custom_menu_data_v3', MENU_CATEGORIES);
    try {
      const res = await fetch('/api/menu', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ menuCategories: MENU_CATEGORIES, lbpRate: LBP_RATE })
      });
      if (!res.ok) showBoToast('Menu could not be saved to the server. Please sign in again and retry.');
    } catch (e) {
      showBoToast('Server unreachable. Menu saved on this device only.');
    }
  }

  function updateNavBadges() {
    const newCount = ORDERS.filter(o => o.status === 'new').length;
    const badgeEl = document.getElementById('navNewOrdersBadge');
    if (badgeEl) {
      badgeEl.textContent = newCount;
      badgeEl.style.display = newCount > 0 ? 'inline-block' : 'none';
    }
  }

  // ==========================================================================
  // TAB ROUTING
  // ==========================================================================
  window.switchBoTab = function (tabId) {
    boState.activeTab = tabId;
    document.querySelectorAll('.bo-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    const titles = {
      dashboard: [
        'Executive Overview & Live WhatsApp Feed',
        'Real-time summary of WhatsApp delivery orders, wedding catering quotes, and menu performance'
      ],
      orders: [
        'WhatsApp Orders, Catering Quotes & Reservations CRM',
        'Every order or quote sent to WhatsApp from the website is automatically recorded here'
      ],
      menu: [
        'FineDine Digital Menu & Dish Manager',
        'Add, edit, price, or toggle Sold Out status across all 22 categories and 239+ dishes'
      ],
      catering: [
        'Catering Event Packages & Live Cooking Stations',
        'Manage wedding packages, corporate formulas, per-guest pricing, and interactive stations'
      ],
      qrcodes: [
        '3-Menu QR Code Studio & Table Tent Printer',
        'Manage and print scannable QR codes for Catering, Restaurant Dine-In, and Delivery menus'
      ],
      content: [
        'Website Galleries, Views & Culinary Team Manager',
        'Manage wedding photos, Aley mountain view photos, chef bios, and behind-the-scenes media'
      ],
      seo: [
        'Search Engine Optimization (SEO) & Google Snippet Manager',
        'Manage Google Search titles, meta descriptions, local Aley keywords & OpenGraph previews for all 6 pages'
      ],
      settings: [
        'Website Settings, Dark/Light Theme, WhatsApp Numbers & Currency Rate',
        'Update WhatsApp phone numbers, default website theme, USD to LBP rate, opening hours & delivery areas'
      ],
      security: [
        'Back Office Security & Administrator Login Credentials',
        'Manage administrator username, display profile, password encryption & active session security'
      ],
      kds: [
        'Live Kitchen Display System (KDS) Kanban Board',
        'Real-time 4-column kitchen workflow board with elapsed timers and 1-tap status progression'
      ],
      reviews: [
        'Verified Client Testimonials & Wedding Reviews Manager',
        'Add, edit, or feature 5-star wedding, corporate event, and Aley restaurant reviews on the live website'
      ]
    };

    const [t, s] = titles[tabId] || titles.dashboard;
    document.getElementById('boTopbarTitle').textContent = t;
    document.getElementById('boTopbarSub').textContent = s;

    renderActiveTab();
  };

  function renderActiveTab() {
    const container = document.getElementById('boMainContainer');
    if (!container) return;

    switch (boState.activeTab) {
      case 'dashboard':
        container.innerHTML = buildDashboardView();
        break;
      case 'orders':
        container.innerHTML = buildOrdersView();
        break;
      case 'kds':
        container.innerHTML = buildKdsView();
        break;
      case 'reviews':
        container.innerHTML = buildReviewsManagerView();
        break;
      case 'menu':
        container.innerHTML = buildMenuManagerView();
        break;
      case 'catering':
        container.innerHTML = buildCateringManagerView();
        break;
      case 'qrcodes':
        container.innerHTML = buildQrCodesView();
        break;
      case 'content':
        container.innerHTML = buildContentManagerView();
        break;
      case 'seo':
        container.innerHTML = buildSeoManagerView();
        break;
      case 'settings':
        container.innerHTML = buildSettingsView();
        break;
      case 'security':
        container.innerHTML = buildSecurityManagerView();
        break;
      default:
        container.innerHTML = buildDashboardView();
    }
  }

  // ==========================================================================
  // 1. DASHBOARD VIEW
  // ==========================================================================
  function buildDashboardView() {
    const newOrdersCount = ORDERS.filter(o => o.status === 'new').length;
    const deliveryOrders = ORDERS.filter(o => o.type === 'delivery_order');
    const cateringQuotes = ORDERS.filter(o => o.type === 'catering_quote');
    const tableBookings = ORDERS.filter(
      o => o.type === 'table_reservation' || o.type === 'whatsapp_inquiry'
    );

    const deliveryRevenueUsd = deliveryOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.totalUsd) || 0), 0);

    const totalMenuItems = MENU_CATEGORIES.reduce((acc, c) => acc + c.items.length, 0);
    const soldOutCount = MENU_CATEGORIES.reduce(
      (acc, c) => acc + c.items.filter(i => i.soldOut).length,
      0
    );

    const recentOrders = ORDERS.slice(0, 5);

    return `
      <!-- KPI METRICS -->
      <div class="bo-kpi-grid">
        <div class="bo-kpi-card">
          <div class="bo-kpi-top">
            <span class="bo-kpi-label">Recorded WhatsApp Orders & Leads</span>
            <div class="bo-kpi-icon" style="background:rgba(29,168,81,0.12); color:var(--bo-wa);">
              <i class="fa-brands fa-whatsapp"></i>
            </div>
          </div>
          <div class="bo-kpi-value">${ORDERS.length}</div>
          <div class="bo-kpi-foot">
            <b style="color:#d94e28;">${newOrdersCount} New Pending</b> • ${deliveryOrders.length} Delivery • ${cateringQuotes.length} Catering
          </div>
        </div>

        <div class="bo-kpi-card">
          <div class="bo-kpi-top">
            <span class="bo-kpi-label">Delivery Order Volume (USD / LBP)</span>
            <div class="bo-kpi-icon" style="background:rgba(217,78,40,0.12); color:var(--bo-terracotta);">
              <i class="fa-solid fa-motorcycle"></i>
            </div>
          </div>
          <div class="bo-kpi-value">${formatUsd(deliveryRevenueUsd)}</div>
          <div class="bo-kpi-foot">${formatLbp(deliveryRevenueUsd)} (${deliveryOrders.length} cart orders)</div>
        </div>

        <div class="bo-kpi-card">
          <div class="bo-kpi-top">
            <span class="bo-kpi-label">Catering & Event Pipeline</span>
            <div class="bo-kpi-icon" style="background:rgba(197,155,39,0.16); color:var(--bo-gold-dark);">
              <i class="fa-solid fa-crown"></i>
            </div>
          </div>
          <div class="bo-kpi-value">${cateringQuotes.length} Events</div>
          <div class="bo-kpi-foot">${SITE_CONFIG.cateringPackages.length} Active Packages • ${tableBookings.length} Table/Chat Leads</div>
        </div>

        <div class="bo-kpi-card">
          <div class="bo-kpi-top">
            <span class="bo-kpi-label">FineDine Digital Menu Status</span>
            <div class="bo-kpi-icon" style="background:rgba(45,106,79,0.14); color:var(--bo-pine);">
              <i class="fa-solid fa-utensils"></i>
            </div>
          </div>
          <div class="bo-kpi-value">${totalMenuItems} Dishes</div>
          <div class="bo-kpi-foot">
            ${MENU_CATEGORIES.length} Categories • <b style="color:${soldOutCount > 0 ? '#dc2626' : '#15803d'};">${soldOutCount} Sold Out</b>
          </div>
        </div>
      </div>

      <!-- QUICK CONTROLS BAR: LBP EXCHANGE RATE & SHORTCUTS -->
      <div class="bo-panel">
        <div class="bo-panel-header">
          <div>
            <div class="bo-panel-title"><i class="fa-solid fa-bolt" style="color:var(--bo-gold);"></i> Quick Website Controls & Live Exchange Rate</div>
            <div style="font-size:0.8rem; color:var(--bo-muted);">Changes made here update all 3 menus (Catering, Restaurant, Delivery) immediately</div>
          </div>
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <div style="display:flex; align-items:center; gap:8px; background:#fff; padding:6px 12px; border-radius:10px; border:1px solid var(--bo-border);">
              <span style="font-size:0.78rem; font-weight:800; color:var(--bo-muted);">1 USD =</span>
              <input
                type="number"
                id="quickLbpRateInput"
                value="${LBP_RATE}"
                step="500"
                class="bo-input"
                style="width:120px; padding:6px 10px; font-weight:800;"
              />
              <span style="font-size:0.78rem; font-weight:800; color:var(--bo-muted);">L.L.</span>
              <button class="bo-btn bo-btn-gold" style="padding:6px 12px;" onclick="saveQuickLbpRate()">
                Update Rate
              </button>
            </div>
            <button class="bo-btn bo-btn-outline" onclick="toggleBoSoundAlerts()" title="Toggle Kitchen Sound Chime for New Orders">
              <i class="fa-solid ${isSoundAlertEnabled() ? 'fa-volume-high' : 'fa-volume-xmark'}" style="color:${isSoundAlertEnabled() ? '#16a34a' : 'var(--bo-muted)'};"></i>
              ${isSoundAlertEnabled() ? 'Sound Alerts: ON' : 'Sound: Muted'}
            </button>
            <button class="bo-btn bo-btn-outline" onclick="switchBoTab('menu')">
              <i class="fa-solid fa-plus"></i> Add / Edit Dish
            </button>
            <button class="bo-btn bo-btn-outline" onclick="switchBoTab('qrcodes')">
              <i class="fa-solid fa-qrcode"></i> Print Menu QR Codes
            </button>
          </div>
        </div>
      </div>

      <!-- RECENT WHATSAPP ORDERS & INQUIRIES -->
      <div class="bo-panel">
        <div class="bo-panel-header">
          <div>
            <div class="bo-panel-title"><i class="fa-brands fa-whatsapp" style="color:var(--bo-wa);"></i> Latest Recorded WhatsApp Orders & Event Quotes</div>
            <div style="font-size:0.8rem; color:var(--bo-muted);">Automatically captured when customers click "Send Order to WhatsApp" or submit an Event Quote</div>
          </div>
          <button class="bo-btn bo-btn-primary" onclick="switchBoTab('orders')">
            View All Orders (${ORDERS.length}) <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
        <div class="bo-panel-body">
          <div class="bo-orders-list">
            ${
              recentOrders.length === 0
                ? `<div style="text-align:center; padding:40px; color:var(--bo-muted);">No orders recorded yet. Place a test order on the website or click "Log Manual Order".</div>`
                : recentOrders.map(o => renderOrderCardHtml(o)).join('')
            }
          </div>
        </div>
      </div>
    `;
  }

  window.saveQuickLbpRate = async function () {
    const val = Number(document.getElementById('quickLbpRateInput')?.value);
    if (!val || val < 1000) {
      showBoToast('Please enter a valid LBP exchange rate.');
      return;
    }
    LBP_RATE = val;
    await persistSiteConfigToServer();
    renderActiveTab();
    showBoToast(`Live exchange rate updated to 1 USD = ${LBP_RATE.toLocaleString('en-US')} L.L.`);
  };

  // ==========================================================================
  // 2. WHATSAPP ORDERS, CATERING QUOTES & RESERVATIONS CRM
  // ==========================================================================
  function buildOrdersView() {
    const q = (boState.orderSearch || '').toLowerCase().trim();
    const filtered = ORDERS.filter(o => {
      if (boState.orderTypeFilter !== 'all' && o.type !== boState.orderTypeFilter) return false;
      if (boState.orderStatusFilter !== 'all' && o.status !== boState.orderStatusFilter) return false;
      if (!q) return true;
      const hay = [
        o.id,
        o.customerName,
        o.customerPhone,
        o.address,
        o.eventType,
        o.packageSelected,
        o.notes,
        ...(o.items || []).map(i => i.title)
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });

    return `
      <div class="bo-panel">
        <div class="bo-panel-header">
          <div class="bo-pill-tabs">
            <button class="bo-pill-tab ${boState.orderTypeFilter === 'all' ? 'active' : ''}" onclick="setBoOrderTypeFilter('all')">
              All Records (${ORDERS.length})
            </button>
            <button class="bo-pill-tab ${boState.orderTypeFilter === 'delivery_order' ? 'active' : ''}" onclick="setBoOrderTypeFilter('delivery_order')">
              <i class="fa-solid fa-motorcycle"></i> Delivery Cart Orders (${ORDERS.filter(o => o.type === 'delivery_order').length})
            </button>
            <button class="bo-pill-tab ${boState.orderTypeFilter === 'catering_quote' ? 'active' : ''}" onclick="setBoOrderTypeFilter('catering_quote')">
              <i class="fa-solid fa-crown"></i> Catering & Wedding Quotes (${ORDERS.filter(o => o.type === 'catering_quote').length})
            </button>
            <button class="bo-pill-tab ${boState.orderTypeFilter === 'table_reservation' ? 'active' : ''}" onclick="setBoOrderTypeFilter('table_reservation')">
              <i class="fa-solid fa-mountain-sun"></i> Restaurant Reservations (${ORDERS.filter(o => o.type === 'table_reservation').length})
            </button>
            <button class="bo-pill-tab ${boState.orderTypeFilter === 'whatsapp_inquiry' ? 'active' : ''}" onclick="setBoOrderTypeFilter('whatsapp_inquiry')">
              <i class="fa-brands fa-whatsapp"></i> Direct WhatsApp Clicks (${ORDERS.filter(o => o.type === 'whatsapp_inquiry').length})
            </button>
          </div>

          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="bo-btn bo-btn-outline" onclick="toggleBoSoundAlerts()" title="Toggle Kitchen Chime for New Orders">
              <i class="fa-solid ${isSoundAlertEnabled() ? 'fa-bell' : 'fa-bell-slash'}" style="color:${isSoundAlertEnabled() ? '#16a34a' : 'var(--bo-muted)'};"></i>
              ${isSoundAlertEnabled() ? 'Chime: ON' : 'Chime: Muted'}
            </button>
            <button class="bo-btn bo-btn-outline" onclick="exportOrdersCsv()">
              <i class="fa-solid fa-file-csv"></i> Export CSV
            </button>
            <button class="bo-btn bo-btn-gold" onclick="openManualOrderModal()">
              <i class="fa-solid fa-plus"></i> Log Manual Order
            </button>
          </div>
        </div>

        <div class="bo-panel-body">
          <div class="bo-toolbar">
            <div style="flex:1; min-width:260px; max-width:460px;">
              <input
                type="text"
                class="bo-input"
                placeholder="Search by Order ID, customer name, phone, address, dish, or event type..."
                value="${(boState.orderSearch || '').replace(/"/g, '&quot;')}"
                oninput="boState.orderSearch = this.value; renderActiveTab();"
              />
            </div>

            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <span style="font-size:0.78rem; font-weight:700; color:var(--bo-muted);">Filter Status:</span>
              <select
                class="bo-select"
                style="width:auto;"
                onchange="boState.orderStatusFilter = this.value; renderActiveTab();"
              >
                <option value="all" ${boState.orderStatusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
                <option value="new" ${boState.orderStatusFilter === 'new' ? 'selected' : ''}>🟡 New / Unread</option>
                <option value="confirmed" ${boState.orderStatusFilter === 'confirmed' ? 'selected' : ''}>🔵 Confirmed</option>
                <option value="preparing" ${boState.orderStatusFilter === 'preparing' ? 'selected' : ''}>🟣 Preparing in Kitchen</option>
                <option value="out_for_delivery" ${boState.orderStatusFilter === 'out_for_delivery' ? 'selected' : ''}>🟠 Out for Delivery</option>
                <option value="completed" ${boState.orderStatusFilter === 'completed' ? 'selected' : ''}>🟢 Completed</option>
                <option value="cancelled" ${boState.orderStatusFilter === 'cancelled' ? 'selected' : ''}>🔴 Cancelled</option>
              </select>
            </div>
          </div>

          <div class="bo-orders-list">
            ${
              filtered.length === 0
                ? `<div style="text-align:center; padding:48px 20px; color:var(--bo-muted);">
                    <i class="fa-solid fa-inbox" style="font-size:2.4rem; margin-bottom:10px; opacity:0.5;"></i>
                    <div>No matching orders or inquiries found.</div>
                  </div>`
                : filtered.map(o => renderOrderCardHtml(o)).join('')
            }
          </div>
        </div>
      </div>
    `;
  }

  window.setBoOrderTypeFilter = function (type) {
    boState.orderTypeFilter = type;
    renderActiveTab();
  };

  function renderOrderCardHtml(o) {
    const typeBadges = {
      delivery_order: `<span class="bo-badge delivery"><i class="fa-solid fa-motorcycle"></i> Delivery Cart Order</span>`,
      catering_quote: `<span class="bo-badge catering"><i class="fa-solid fa-crown"></i> Catering & Event Quote</span>`,
      table_reservation: `<span class="bo-badge restaurant"><i class="fa-solid fa-mountain-sun"></i> Restaurant Table Booking</span>`,
      whatsapp_inquiry: `<span class="bo-badge restaurant"><i class="fa-brands fa-whatsapp"></i> WhatsApp Lead</span>`
    };

    const statusLabels = {
      new: 'New / Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing in Kitchen',
      out_for_delivery: 'Out for Delivery',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };

    const safeId = esc(o.id);
    const hasItems = Array.isArray(o.items) && o.items.length > 0;

    return `
      <div class="bo-order-card type-${esc(o.type)}">
        <div class="bo-order-top">
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <strong style="font-size:1rem; color:var(--bo-text);">${safeId}</strong>
            ${typeBadges[o.type] || typeBadges.delivery_order}
            <span class="bo-status-pill bo-status-${esc(o.status || 'new')}">${esc(statusLabels[o.status] || o.status)}</span>
            <span style="font-size:0.78rem; color:var(--bo-muted);">
              <i class="fa-regular fa-clock"></i> ${formatDateTime(o.createdAt)}
            </span>
          </div>

          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <select
              class="bo-select"
              style="width:auto; padding:6px 10px; font-size:0.78rem; font-weight:700;"
              onchange="updateOrderStatus('${safeId}', this.value)"
            >
              <option value="new" ${o.status === 'new' ? 'selected' : ''}>Status: New / Pending</option>
              <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Status: Confirmed</option>
              <option value="preparing" ${o.status === 'preparing' ? 'selected' : ''}>Status: Preparing</option>
              <option value="out_for_delivery" ${o.status === 'out_for_delivery' ? 'selected' : ''}>Status: Out for Delivery</option>
              <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Status: Completed</option>
              <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Status: Cancelled</option>
            </select>

            <button class="bo-btn bo-btn-wa" style="padding:7px 12px; font-size:0.76rem;" onclick="replyToCustomerOnWhatsApp('${safeId}')">
              <i class="fa-brands fa-whatsapp"></i> Reply on WhatsApp
            </button>

            <button class="bo-btn bo-btn-outline" style="padding:7px 12px; font-size:0.76rem;" onclick="printOrderTicket('${safeId}')">
              <i class="fa-solid fa-print"></i> Print Ticket
            </button>

            <button class="bo-btn bo-btn-gold" style="padding:7px 12px; font-size:0.76rem;" onclick="printOfficialProposal('${safeId}')">
              <i class="fa-solid fa-file-invoice-dollar"></i> Proposal / PDF
            </button>

            <button class="bo-btn bo-btn-danger" style="padding:7px 10px; font-size:0.76rem;" onclick="deleteOrderRecord('${safeId}')" title="Delete Record">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>

        <div class="bo-order-grid">
          <!-- Column 1: Customer & Location -->
          <div>
            <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted); margin-bottom:4px;">Customer & Contact</div>
            <div style="font-weight:800; font-size:1rem; margin-bottom:4px;">${esc(o.customerName || 'Valued Customer')}</div>
            <div style="font-size:0.86rem; color:var(--bo-text); margin-bottom:4px;">
              <i class="fa-solid fa-phone" style="color:var(--bo-gold-dark); width:18px;"></i>
              <b>${esc(o.customerPhone || 'Sent via WhatsApp')}</b>
            </div>
            <div style="font-size:0.84rem; color:var(--bo-muted); margin-bottom:6px;">
              <i class="fa-solid fa-location-dot" style="color:var(--bo-terracotta); width:18px;"></i>
              ${esc(o.address || 'Ain Al Remmaneh, Aley')}
            </div>
            ${
              o.notes
                ? `<div style="font-size:0.8rem; background:#fffbeb; border:1px solid #fde68a; padding:7px 10px; border-radius:8px; color:#92400e; margin-top:6px;">
                    <b>Customer Note:</b> ${esc(o.notes)}
                  </div>`
                : ''
            }
          </div>

          <!-- Column 2: Items or Event Details -->
          <div class="bo-order-items-box">
            ${
              hasItems
                ? `
                  <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted); margin-bottom:6px;">
                    Ordered Dishes (${o.items.reduce((s, i) => s + (Number(i.qty) || 1), 0)} items)
                  </div>
                  ${o.items
                    .map(
                      item => `
                    <div style="display:flex; justify-content:space-between; font-size:0.84rem; padding:4px 0; border-bottom:1px dashed #e5e7eb;">
                      <div>
                        <b>${Number(item.qty) || 1}x ${esc(item.title)}</b>
                        ${
                          item.modifiers && item.modifiers.length
                            ? `<div style="font-size:0.74rem; color:var(--bo-gold-dark);">↳ ${esc(item.modifiers.join(', '))}</div>`
                            : ''
                        }
                        ${
                          item.note
                            ? `<div style="font-size:0.73rem; color:var(--bo-muted); font-style:italic;">↳ Note: "${esc(item.note)}"</div>`
                            : ''
                        }
                      </div>
                      <div style="font-weight:700; white-space:nowrap; margin-left:8px;">
                        ${formatUsd((Number(item.priceValue) || 0) * (Number(item.qty) || 1))}
                      </div>
                    </div>
                  `
                    )
                    .join('')}
                `
                : `
                  <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted); margin-bottom:6px;">
                    Event / Reservation Details
                  </div>
                  ${o.eventType ? `<div style="font-size:0.85rem;"><b>Occasion:</b> ${esc(o.eventType)}</div>` : ''}
                  ${o.eventDate ? `<div style="font-size:0.85rem;"><b>Date:</b> ${esc(o.eventDate)}</div>` : ''}
                  ${o.guests ? `<div style="font-size:0.85rem;"><b>Guest Count:</b> ${Number(o.guests) || 0} Guests</div>` : ''}
                  ${o.packageSelected ? `<div style="font-size:0.85rem; color:var(--bo-gold-dark);"><b>Package:</b> ${esc(o.packageSelected)}</div>` : ''}
                `
            }
          </div>

          <!-- Column 3: Financials & Internal Staff Note -->
          <div>
            <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted); margin-bottom:4px;">Order Total / Est. Value</div>
            <div style="font-family:var(--font-serif); font-size:1.55rem; font-weight:700; color:var(--bo-text);">
              ${o.totalUsd > 0 ? formatUsd(o.totalUsd) : 'Custom Quote'}
            </div>
            ${
              o.totalUsd > 0
                ? `<div style="font-size:0.78rem; color:var(--bo-muted); margin-bottom:10px;">${formatLbp(o.totalUsd)}</div>`
                : '<div style="margin-bottom:10px;"></div>'
            }
            <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted); margin-bottom:4px;">Internal Back Office Note</div>
            <div style="display:flex; gap:6px;">
              <input
                type="text"
                class="bo-input"
                style="padding:6px 9px; font-size:0.78rem;"
                id="staff-note-${safeId}"
                value="${esc(o.staffNotes || '')}"
                placeholder="Add kitchen or event note..."
              />
              <button class="bo-btn bo-btn-outline" style="padding:6px 10px; font-size:0.75rem;" onclick="saveOrderStaffNote('${safeId}')">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.updateOrderStatus = async function (orderId, newStatus) {
    const idx = ORDERS.findIndex(o => o.id === orderId);
    if (idx === -1) return;
    ORDERS[idx].status = newStatus;
    saveLocal('mk_backoffice_orders_v1', ORDERS);
    updateNavBadges();
    renderActiveTab();

    try {
      await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {}
    showBoToast(`Order ${orderId} marked as ${newStatus.toUpperCase()}`);
  };

  window.saveOrderStaffNote = async function (orderId) {
    const val = document.getElementById(`staff-note-${orderId}`)?.value || '';
    const idx = ORDERS.findIndex(o => o.id === orderId);
    if (idx === -1) return;
    ORDERS[idx].staffNotes = val;
    saveLocal('mk_backoffice_orders_v1', ORDERS);

    try {
      await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify({ staffNotes: val })
      });
    } catch (e) {}
    showBoToast(`Saved internal note for ${orderId}`);
  };

  window.deleteOrderRecord = async function (orderId) {
    ORDERS = ORDERS.filter(o => o.id !== orderId);
    saveLocal('mk_backoffice_orders_v1', ORDERS);
    updateNavBadges();
    renderActiveTab();

    try {
      await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'same-origin'
      });
    } catch (e) {}
    showBoToast(`Deleted record ${orderId}`);
  };

  window.replyToCustomerOnWhatsApp = function (orderId) {
    const o = ORDERS.find(x => x.id === orderId);
    if (!o) return;
    const rawDigits = (o.customerPhone || '').replace(/[^0-9]/g, '');
    const targetPhone =
      rawDigits.length >= 7
        ? rawDigits.startsWith('961')
          ? rawDigits
          : `961${rawDigits.replace(/^0/, '')}`
        : SITE_CONFIG.contacts.delivery.whatsappNumber;

    const trackUrl = `${window.location.origin}/delivery.html?track=${encodeURIComponent(o.id)}`;
    const replyMsg =
      o.type === 'catering_quote'
        ? `Hello ${o.customerName}! This is Mini Kitchen Catering regarding your inquiry (#${o.id}) for ${o.eventType || 'your event'} on ${o.eventDate || 'your selected date'}. We have prepared your proposal—you can also check your live status here: ${trackUrl}`
        : `Hello ${o.customerName}! This is Mini Kitchen regarding your order #${o.id} (${formatUsd(o.totalUsd)}). Your order is confirmed and being prepared fresh! Track live status here: ${trackUrl}`;

    window.open(
      `https://wa.me/${targetPhone}?text=${encodeURIComponent(replyMsg)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  window.printOfficialProposal = function (orderId) {
    const o = ORDERS.find(x => x.id === orderId);
    if (!o) return;
    const win = window.open('', '_blank', 'width=880,height=960');
    if (!win) {
      showBoToast('Please allow popups to generate the Official Proposal / Invoice PDF.');
      return;
    }

    const isCatering = o.type === 'catering_quote';
    const docTitle = isCatering ? 'OFFICIAL CATERING & EVENT PROPOSAL' : 'OFFICIAL PRO-FORMA INVOICE & ORDER SUMMARY';
    const lineItemsHtml =
      o.items && o.items.length > 0
        ? o.items
            .map(
              (item, idx) => `
          <tr>
            <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb;">${idx + 1}</td>
            <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb;">
              <b>${esc(item.title)}</b>
              ${item.modifiers && item.modifiers.length ? `<div style="font-size:11px; color:#6b7280;">Options: ${esc(item.modifiers.join(', '))}</div>` : ''}
              ${item.note ? `<div style="font-size:11px; color:#6b7280; font-style:italic;">Note: ${esc(item.note)}</div>` : ''}
            </td>
            <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; text-align:center;">${Number(item.qty) || 1}</td>
            <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; text-align:right;">${formatUsd(item.priceValue)}</td>
            <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:700;">${formatUsd(
              (Number(item.priceValue) || 0) * (Number(item.qty) || 1)
            )}</td>
          </tr>`
            )
            .join('')
        : `
          <tr>
            <td style="padding:12px; border-bottom:1px solid #e5e7eb;">1</td>
            <td style="padding:12px; border-bottom:1px solid #e5e7eb;">
              <b>${esc(o.packageSelected || o.eventType || 'Bespoke Catering & Hospitality Package')}</b>
              <div style="font-size:12px; color:#6b7280; margin-top:4px;">
                Event Date: <b>${esc(o.eventDate || 'TBD')}</b> • Venue: <b>${esc(o.address || 'TBD')}</b><br/>
                Includes full buffet architecture, porcelain & gold chafing dishes, live stations as selected, and uniformed hospitality staff.
              </div>
            </td>
            <td style="padding:12px; border-bottom:1px solid #e5e7eb; text-align:center;">${Number(o.guests) || 1} Guests</td>
            <td style="padding:12px; border-bottom:1px solid #e5e7eb; text-align:right;">${
              o.guests && o.totalUsd ? formatUsd(o.totalUsd / o.guests) + ' / guest' : 'Custom'
            }</td>
            <td style="padding:12px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:700;">${
              o.totalUsd > 0 ? formatUsd(o.totalUsd) : 'Custom Quote'
            }</td>
          </tr>`;

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mini Kitchen — ${docTitle} (#${esc(o.id)})</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <style>
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
        </style>
      </head>
      <body onload="setTimeout(() => window.print(), 450)">
        <div class="no-print">
          <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
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
              <div style="font-size:11px; opacity:0.8;">Date: ${formatDateTime(o.createdAt)}</div>
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
                ${o.guests ? `<div><b>Estimated Guests:</b> ${Number(o.guests)} Guests</div>` : ''}
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
              <tbody>
                ${lineItemsHtml}
              </tbody>
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
                <b>1 USD = ${LBP_RATE.toLocaleString('en-US')} L.L.</b>
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
              <div>
                <div class="sig-line">Mini Kitchen Hospitality & Catering Director</div>
              </div>
              <div>
                <div class="sig-line">Client Acceptance & Signature (${esc(o.customerName)})</div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    win.document.close();
  };

  window.printOrderTicket = function (orderId) {
    const o = ORDERS.find(x => x.id === orderId);
    if (!o) return;
    const win = window.open('', '_blank', 'width=440,height=680');
    if (!win) {
      showBoToast('Please allow popups to print kitchen receipts.');
      return;
    }
    const itemsHtml =
      o.items && o.items.length
        ? o.items
            .map(
              i => `
          <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px dashed #ccc;">
            <div>
              <b>${Number(i.qty) || 1}x ${esc(i.title)}</b>
              ${i.modifiers && i.modifiers.length ? `<div style="font-size:11px;">+ ${esc(i.modifiers.join(', '))}</div>` : ''}
              ${i.note ? `<div style="font-size:11px; font-style:italic;">Note: ${esc(i.note)}</div>` : ''}
            </div>
            <div>${formatUsd(i.priceValue * i.qty)}</div>
          </div>`
            )
            .join('')
        : `<div><b>Occasion:</b> ${esc(o.eventType || 'N/A')}<br/><b>Date:</b> ${esc(o.eventDate || 'N/A')}<br/><b>Guests:</b> ${esc(o.guests || 'N/A')}<br/><b>Package:</b> ${esc(o.packageSelected || 'Custom')}</div>`;

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kitchen Receipt ${esc(o.id)}</title>
        <style>
          body { font-family: monospace; padding: 20px; max-width: 340px; margin: 0 auto; color:#000; }
          h2 { text-align:center; margin:0 0 4px; }
          .sub { text-align:center; font-size:12px; margin-bottom:14px; border-bottom:2px solid #000; padding-bottom:10px; }
          .meta { font-size:12px; margin-bottom:12px; line-height:1.5; }
          .total { font-size:15px; font-weight:bold; border-top:2px solid #000; padding-top:10px; margin-top:12px; display:flex; justify-content:space-between; }
        </style>
      </head>
      <body onload="setTimeout(() => window.print(), 300)">
        <h2>MINI KITCHEN</h2>
        <div class="sub">Ain Al Remmaneh, Aley • Ticket #${esc(o.id)}<br/>${formatDateTime(o.createdAt)}</div>
        <div class="meta">
          <b>Customer:</b> ${esc(o.customerName)}<br/>
          <b>Phone:</b> ${esc(o.customerPhone || 'WhatsApp')}<br/>
          <b>Address/Venue:</b> ${esc(o.address || 'N/A')}<br/>
          <b>Notes:</b> ${esc(o.notes || 'None')}
        </div>
        <div style="border-top:1px solid #000; padding-top:8px;">
          ${itemsHtml}
        </div>
        <div class="total">
          <span>TOTAL:</span>
          <span>${formatUsd(o.totalUsd)} (${formatLbp(o.totalUsd)})</span>
        </div>
      </body>
      </html>
    `);
    win.document.close();
  };

  window.exportOrdersCsv = function () {
    const headers = ['OrderID', 'Date', 'Type', 'Brand', 'Status', 'Customer', 'Phone', 'Address', 'TotalUSD', 'Notes'];
    const rows = ORDERS.map(o => [
      o.id,
      o.createdAt,
      o.type,
      o.brand,
      o.status,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${(o.customerPhone || '').replace(/"/g, '""')}"`,
      `"${(o.address || '').replace(/"/g, '""')}"`,
      o.totalUsd || 0,
      `"${(o.notes || '').replace(/"/g, '""')}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mini-kitchen-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  window.openManualOrderModal = function () {
    openBoModal(
      'Log Manual Phone / WhatsApp Order or Catering Inquiry',
      `
        <form id="manualOrderForm" onsubmit="submitManualOrder(event)">
          <div class="bo-form-grid">
            <div class="bo-form-group">
              <label>Record Type *</label>
              <select id="moType" class="bo-select" required>
                <option value="delivery_order">🛵 Delivery Order</option>
                <option value="catering_quote">👑 Catering & Event Quote</option>
                <option value="table_reservation">🌲 Restaurant Table Reservation</option>
              </select>
            </div>
            <div class="bo-form-group">
              <label>Customer Name *</label>
              <input type="text" id="moName" class="bo-input" placeholder="e.g., Karim Jumblatt" required />
            </div>
            <div class="bo-form-group">
              <label>Customer Phone / WhatsApp *</label>
              <input type="text" id="moPhone" class="bo-input" placeholder="e.g., +961 3 555 123" required />
            </div>
            <div class="bo-form-group">
              <label>Total Amount (USD)</label>
              <input type="number" step="0.5" id="moTotal" class="bo-input" placeholder="e.g., 45.00" value="0" />
            </div>
          </div>
          <div class="bo-form-group" style="margin-top:14px;">
            <label>Delivery Address / Event Venue *</label>
            <input type="text" id="moAddress" class="bo-input" placeholder="e.g., Ain Al Remmaneh, Aley" required />
          </div>
          <div class="bo-form-grid" style="margin-top:14px;">
            <div class="bo-form-group">
              <label>Event Type / Summary</label>
              <input type="text" id="moEvent" class="bo-input" placeholder="e.g., Wedding Tasting / Phone Delivery" />
            </div>
            <div class="bo-form-group">
              <label>Event Date (if applicable)</label>
              <input type="date" id="moDate" class="bo-input" />
            </div>
          </div>
          <div class="bo-form-group" style="margin-top:14px;">
            <label>Items Ordered / Inquiry Notes *</label>
            <textarea id="moNotes" class="bo-textarea" rows="3" placeholder="Enter dishes ordered or event details..." required></textarea>
          </div>
          <div style="margin-top:18px; display:flex; justify-content:flex-end; gap:10px;">
            <button type="button" class="bo-btn bo-btn-outline" onclick="closeBoModal()">Cancel</button>
            <button type="submit" class="bo-btn bo-btn-gold">Save to Back Office</button>
          </div>
        </form>
      `
    );
  };

  window.submitManualOrder = async function (e) {
    e.preventDefault();
    const type = document.getElementById('moType').value;
    const payload = {
      type,
      brand: type === 'catering_quote' ? 'catering' : type === 'table_reservation' ? 'restaurant' : 'delivery',
      status: 'confirmed',
      customerName: document.getElementById('moName').value.trim(),
      customerPhone: document.getElementById('moPhone').value.trim(),
      address: document.getElementById('moAddress').value.trim(),
      totalUsd: Number(document.getElementById('moTotal').value) || 0,
      eventType: document.getElementById('moEvent').value.trim(),
      eventDate: document.getElementById('moDate').value,
      notes: document.getElementById('moNotes').value.trim(),
      staffNotes: 'Logged manually via Back Office'
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.order) {
        ORDERS = [data.order, ...ORDERS];
        saveLocal('mk_backoffice_orders_v1', ORDERS);
      }
    } catch (err) {
      const fallbackOrder = {
        id: `MK-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        ...payload
      };
      ORDERS = [fallbackOrder, ...ORDERS];
      saveLocal('mk_backoffice_orders_v1', ORDERS);
    }

    closeBoModal();
    updateNavBadges();
    renderActiveTab();
    showBoToast('Order logged in Back Office!');
  };

  // ==========================================================================
  // 3. FINEDINE DIGITAL MENU & DISHES MANAGER (22 CATEGORIES / 239+ DISHES)
  // ==========================================================================
  function buildMenuManagerView() {
    const q = (boState.menuSearch || '').toLowerCase().trim();
    const rows = [];

    for (const cat of MENU_CATEGORIES) {
      if (boState.menuCatFilter !== 'all' && cat.id !== boState.menuCatFilter) continue;
      for (const item of cat.items) {
        if (boState.menuStockFilter === 'available' && item.soldOut) continue;
        if (boState.menuStockFilter === 'soldout' && !item.soldOut) continue;
        if (
          q &&
          !item.title.toLowerCase().includes(q) &&
          !(item.desc || '').toLowerCase().includes(q) &&
          !cat.name.toLowerCase().includes(q)
        ) {
          continue;
        }
        rows.push({ cat, item });
      }
    }

    const displayRows = rows.slice(0, 80);

    return `
      <div class="bo-panel">
        <div class="bo-panel-header">
          <div>
            <div class="bo-panel-title">FineDine Menu Database (${MENU_CATEGORIES.length} Categories • ${MENU_CATEGORIES.reduce((a, c) => a + c.items.length, 0)} Dishes)</div>
            <div style="font-size:0.8rem; color:var(--bo-muted);">Edit prices, descriptions, photos, dietary badges, or mark items Sold Out in real time</div>
          </div>

          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="bo-btn bo-btn-outline" onclick="openAddCategoryModal()">
              <i class="fa-solid fa-folder-plus"></i> + New Category
            </button>
            <button class="bo-btn bo-btn-gold" onclick="openAddDishModal()">
              <i class="fa-solid fa-plus"></i> + Add New Dish
            </button>
          </div>
        </div>

        <div class="bo-panel-body">
          <div class="bo-toolbar">
            <div style="flex:1; min-width:240px;">
              <input
                type="text"
                class="bo-input"
                placeholder="Search 239+ dishes by name, ingredient, or category..."
                value="${(boState.menuSearch || '').replace(/"/g, '&quot;')}"
                oninput="boState.menuSearch = this.value; renderActiveTab();"
              />
            </div>

            <select
              class="bo-select"
              style="width:auto; min-width:210px;"
              onchange="boState.menuCatFilter = this.value; renderActiveTab();"
            >
              <option value="all" ${boState.menuCatFilter === 'all' ? 'selected' : ''}>All Categories (${MENU_CATEGORIES.length})</option>
              ${MENU_CATEGORIES.map(
                c =>
                  `<option value="${c.id}" ${boState.menuCatFilter === c.id ? 'selected' : ''}>${c.name} (${c.items.length})</option>`
              ).join('')}
            </select>

            <select
              class="bo-select"
              style="width:auto;"
              onchange="boState.menuStockFilter = this.value; renderActiveTab();"
            >
              <option value="all" ${boState.menuStockFilter === 'all' ? 'selected' : ''}>All Stock States</option>
              <option value="available" ${boState.menuStockFilter === 'available' ? 'selected' : ''}>✅ Available Only</option>
              <option value="soldout" ${boState.menuStockFilter === 'soldout' ? 'selected' : ''}>🚫 Sold Out Only</option>
            </select>
          </div>

          <div style="font-size:0.78rem; color:var(--bo-muted); margin-bottom:10px;">
            Showing ${displayRows.length} of ${rows.length} matching dishes
          </div>

          <div style="border:1px solid var(--bo-border); border-radius:14px; overflow:hidden;">
            ${displayRows
              .map(
                ({ cat, item }) => `
              <div class="bo-dish-row" style="${item.soldOut ? 'background:#fef2f2;' : ''}">
                <img
                  src="${item.img}"
                  onerror="this.src='https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80'"
                  class="bo-dish-thumb"
                  alt="${item.title.replace(/"/g, '&quot;')}"
                />
                <div>
                  <div style="font-size:0.7rem; font-weight:800; text-transform:uppercase; color:var(--bo-gold-dark);">${cat.name}</div>
                  <input
                    type="text"
                    class="bo-input"
                    style="padding:6px 9px; font-weight:700; margin-top:3px;"
                    id="dish-title-${item.id}"
                    value="${item.title.replace(/"/g, '&quot;')}"
                  />
                </div>
                <div>
                  <div style="font-size:0.7rem; color:var(--bo-muted);">Description</div>
                  <input
                    type="text"
                    class="bo-input"
                    style="padding:6px 9px; margin-top:3px;"
                    id="dish-desc-${item.id}"
                    value="${(item.desc || '').replace(/"/g, '&quot;')}"
                  />
                </div>
                <div>
                  <div style="font-size:0.7rem; color:var(--bo-muted);">Price (USD $)</div>
                  <input
                    type="number"
                    step="0.25"
                    class="bo-input"
                    style="padding:6px 9px; font-weight:800; margin-top:3px;"
                    id="dish-price-${item.id}"
                    value="${item.priceValue}"
                  />
                </div>
                <div>
                  <div style="font-size:0.7rem; color:var(--bo-muted);">Stock Status</div>
                  <button
                    type="button"
                    class="bo-btn ${item.soldOut ? 'bo-btn-danger' : 'bo-btn-outline'}"
                    style="width:100%; padding:7px 10px; margin-top:3px; font-size:0.76rem;"
                    onclick="toggleDishSoldOut('${cat.id}', '${item.id}')"
                  >
                    <i class="fa-solid ${item.soldOut ? 'fa-ban' : 'fa-circle-check'}" style="color:${item.soldOut ? '#dc2626' : '#16a34a'};"></i>
                    ${item.soldOut ? 'Sold Out' : 'In Stock'}
                  </button>
                </div>
                <div style="display:flex; gap:6px; padding-top:16px;">
                  <button class="bo-btn bo-btn-primary" style="flex:1; padding:7px 10px; font-size:0.76rem;" onclick="saveQuickDishRow('${cat.id}', '${item.id}')">
                    Save
                  </button>
                  <button class="bo-btn bo-btn-outline" style="padding:7px 10px; font-size:0.76rem;" onclick="openEditDishFullModal('${cat.id}', '${item.id}')" title="Edit Photo & Badges">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button class="bo-btn bo-btn-danger" style="padding:7px 10px; font-size:0.76rem;" onclick="deleteDishItem('${cat.id}', '${item.id}')" title="Delete Dish">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  window.saveQuickDishRow = async function (catId, itemId) {
    const cat = MENU_CATEGORIES.find(c => c.id === catId);
    if (!cat) return;
    const item = cat.items.find(i => i.id === itemId);
    if (!item) return;

    const newTitle = document.getElementById(`dish-title-${itemId}`)?.value?.trim();
    const newDesc = document.getElementById(`dish-desc-${itemId}`)?.value?.trim();
    const newPriceVal = parseFloat(document.getElementById(`dish-price-${itemId}`)?.value);

    if (newTitle) item.title = newTitle;
    if (newDesc !== undefined) item.desc = newDesc;
    if (!isNaN(newPriceVal) && newPriceVal >= 0) {
      item.priceValue = newPriceVal;
      item.price = `$${newPriceVal.toFixed(2)}`;
    }

    await persistMenuToServer();
    showBoToast(`Saved "${item.title}" ($${item.priceValue.toFixed(2)})`);
  };

  window.toggleDishSoldOut = async function (catId, itemId) {
    const cat = MENU_CATEGORIES.find(c => c.id === catId);
    if (!cat) return;
    const item = cat.items.find(i => i.id === itemId);
    if (!item) return;

    item.soldOut = !item.soldOut;
    await persistMenuToServer();
    renderActiveTab();
    showBoToast(`"${item.title}" marked as ${item.soldOut ? 'SOLD OUT' : 'AVAILABLE'}`);
  };

  window.deleteDishItem = async function (catId, itemId) {
    const cat = MENU_CATEGORIES.find(c => c.id === catId);
    if (!cat) return;
    cat.items = cat.items.filter(i => i.id !== itemId);
    cat.count = cat.items.length;
    await persistMenuToServer();
    renderActiveTab();
    showBoToast('Dish removed from menu.');
  };

  window.openEditDishFullModal = function (catId, itemId) {
    const cat = MENU_CATEGORIES.find(c => c.id === catId);
    const item = cat?.items.find(i => i.id === itemId);
    if (!item) return;
    const badges = item.badges || [];

    openBoModal(
      `Edit Dish Details & Photo — ${item.title}`,
      `
        <form onsubmit="submitEditDishFull(event, '${catId}', '${itemId}')">
          <div class="bo-form-grid">
            <div class="bo-form-group">
              <label>Dish Title *</label>
              <input type="text" id="edTitle" class="bo-input" value="${item.title.replace(/"/g, '&quot;')}" required />
            </div>
            <div class="bo-form-group">
              <label>Price (USD $) *</label>
              <input type="number" step="0.25" id="edPrice" class="bo-input" value="${item.priceValue}" required />
            </div>
            <div class="bo-form-group">
              <label>Prep Time Label</label>
              <input type="text" id="edPrep" class="bo-input" value="${(item.prepTime || '15–20 min').replace(/"/g, '&quot;')}" />
            </div>
          </div>
          <div class="bo-form-group" style="margin-top:14px;">
            <label>Dish Photo (Paste URL or Upload from Device) *</label>
            <div style="display:flex; gap:8px; align-items:center;">
              <input type="text" id="edImg" class="bo-input" style="flex:1;" value="${(item.img || '').replace(/"/g, '&quot;')}" required />
              <label class="bo-btn bo-btn-outline" style="cursor:pointer; white-space:nowrap; margin:0;">
                <i class="fa-solid fa-cloud-arrow-up"></i> Upload Photo
                <input type="file" accept="image/*" hidden onchange="uploadBoPhotoFile(this, 'edImg')" />
              </label>
            </div>
          </div>
          <div class="bo-form-group" style="margin-top:14px;">
            <label>Description</label>
            <textarea id="edDesc" class="bo-textarea" rows="3">${item.desc || ''}</textarea>
          </div>
          <div class="bo-form-group" style="margin-top:14px;">
            <label>Dietary & Feature Badges</label>
            <div style="display:flex; gap:14px; flex-wrap:wrap; margin-top:6px;">
              ${['Popular', 'Spicy', 'Vegetarian', 'Sharing']
                .map(
                  b => `
                <label style="display:inline-flex; align-items:center; gap:6px; font-size:0.85rem; text-transform:none;">
                  <input type="checkbox" name="edBadge" value="${b}" ${badges.includes(b) ? 'checked' : ''} /> ${b}
                </label>
              `
                )
                .join('')}
            </div>
          </div>
          <div style="margin-top:18px; display:flex; justify-content:flex-end; gap:10px;">
            <button type="button" class="bo-btn bo-btn-outline" onclick="closeBoModal()">Cancel</button>
            <button type="submit" class="bo-btn bo-btn-gold">Save Dish Changes</button>
          </div>
        </form>
      `
    );
  };

  window.submitEditDishFull = async function (e, catId, itemId) {
    e.preventDefault();
    const cat = MENU_CATEGORIES.find(c => c.id === catId);
    const item = cat?.items.find(i => i.id === itemId);
    if (!item) return;

    item.title = document.getElementById('edTitle').value.trim();
    const pv = parseFloat(document.getElementById('edPrice').value) || 0;
    item.priceValue = pv;
    item.price = `$${pv.toFixed(2)}`;
    item.prepTime = document.getElementById('edPrep').value.trim() || '15–20 min';
    item.img = document.getElementById('edImg').value.trim();
    item.desc = document.getElementById('edDesc').value.trim();
    item.badges = Array.from(document.querySelectorAll('input[name="edBadge"]:checked')).map(el => el.value);

    await persistMenuToServer();
    closeBoModal();
    renderActiveTab();
    showBoToast(`Updated "${item.title}"`);
  };

  window.openAddDishModal = function () {
    openBoModal(
      'Add New Dish to FineDine Menu',
      `
        <form onsubmit="submitAddDish(event)">
          <div class="bo-form-grid">
            <div class="bo-form-group">
              <label>Select Category *</label>
              <select id="newDishCat" class="bo-select" required>
                ${MENU_CATEGORIES.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
            </div>
            <div class="bo-form-group">
              <label>Dish Title *</label>
              <input type="text" id="newDishTitle" class="bo-input" placeholder="e.g., Truffle Wagyu Burger" required />
            </div>
            <div class="bo-form-group">
              <label>Price (USD $) *</label>
              <input type="number" step="0.25" id="newDishPrice" class="bo-input" placeholder="e.g., 12.50" required />
            </div>
          </div>
          <div class="bo-form-group" style="margin-top:14px;">
            <label>Dish Photo (Paste URL or Upload from Device)</label>
            <div style="display:flex; gap:8px; align-items:center;">
              <input type="text" id="newDishImg" class="bo-input" style="flex:1;" value="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80" />
              <label class="bo-btn bo-btn-outline" style="cursor:pointer; white-space:nowrap; margin:0;">
                <i class="fa-solid fa-cloud-arrow-up"></i> Upload Photo
                <input type="file" accept="image/*" hidden onchange="uploadBoPhotoFile(this, 'newDishImg')" />
              </label>
            </div>
          </div>
          <div class="bo-form-group" style="margin-top:14px;">
            <label>Dish Description *</label>
            <textarea id="newDishDesc" class="bo-textarea" rows="2" placeholder="Ingredients and preparation details..." required></textarea>
          </div>
          <div class="bo-form-group" style="margin-top:14px;">
            <label>Badges</label>
            <div style="display:flex; gap:14px; flex-wrap:wrap; margin-top:6px;">
              <label style="display:inline-flex; align-items:center; gap:6px; font-size:0.85rem; text-transform:none;"><input type="checkbox" name="ndBadge" value="Popular" checked /> Popular</label>
              <label style="display:inline-flex; align-items:center; gap:6px; font-size:0.85rem; text-transform:none;"><input type="checkbox" name="ndBadge" value="Spicy" /> Spicy</label>
              <label style="display:inline-flex; align-items:center; gap:6px; font-size:0.85rem; text-transform:none;"><input type="checkbox" name="ndBadge" value="Vegetarian" /> Vegetarian</label>
              <label style="display:inline-flex; align-items:center; gap:6px; font-size:0.85rem; text-transform:none;"><input type="checkbox" name="ndBadge" value="Sharing" /> Sharing</label>
            </div>
          </div>
          <div style="margin-top:18px; display:flex; justify-content:flex-end; gap:10px;">
            <button type="button" class="bo-btn bo-btn-outline" onclick="closeBoModal()">Cancel</button>
            <button type="submit" class="bo-btn bo-btn-gold">Add Dish to Menu</button>
          </div>
        </form>
      `
    );
  };

  window.submitAddDish = async function (e) {
    e.preventDefault();
    const catId = document.getElementById('newDishCat').value;
    const cat = MENU_CATEGORIES.find(c => c.id === catId);
    if (!cat) return;

    const pv = parseFloat(document.getElementById('newDishPrice').value) || 0;
    const img = document.getElementById('newDishImg').value.trim();
    const badges = Array.from(document.querySelectorAll('input[name="ndBadge"]:checked')).map(el => el.value);

    const newDish = {
      id: `mk-custom-${Date.now()}`,
      categoryId: cat.id,
      categoryName: cat.name,
      title: document.getElementById('newDishTitle').value.trim(),
      desc: document.getElementById('newDishDesc').value.trim(),
      price: `$${pv.toFixed(2)}`,
      priceValue: pv,
      img,
      fallbackImg: img,
      hasRealPhoto: true,
      prepTime: '15–20 min',
      badges,
      soldOut: false
    };

    cat.items.unshift(newDish);
    cat.count = cat.items.length;
    await persistMenuToServer();
    closeBoModal();
    renderActiveTab();
    showBoToast(`Added "${newDish.title}" to ${cat.name}!`);
  };

  window.openAddCategoryModal = function () {
    openBoModal(
      'Create New FineDine Menu Category',
      `
        <form onsubmit="submitAddCategory(event)">
          <div class="bo-form-grid">
            <div class="bo-form-group">
              <label>Category Title *</label>
              <input type="text" id="newCatName" class="bo-input" placeholder="e.g., Seasonal Specials" required />
            </div>
            <div class="bo-form-group">
              <label>Category Subtitle *</label>
              <input type="text" id="newCatSub" class="bo-input" placeholder="e.g., Chef limited-edition creations" required />
            </div>
          </div>
          <div class="bo-form-group" style="margin-top:14px;">
            <label>Category Thumbnail Photo (Paste URL or Upload from Device)</label>
            <div style="display:flex; gap:8px; align-items:center;">
              <input type="text" id="newCatImg" class="bo-input" style="flex:1;" value="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80" />
              <label class="bo-btn bo-btn-outline" style="cursor:pointer; white-space:nowrap; margin:0;">
                <i class="fa-solid fa-cloud-arrow-up"></i> Upload Photo
                <input type="file" accept="image/*" hidden onchange="uploadBoPhotoFile(this, 'newCatImg')" />
              </label>
            </div>
          </div>
          <div style="margin-top:18px; display:flex; justify-content:flex-end; gap:10px;">
            <button type="button" class="bo-btn bo-btn-outline" onclick="closeBoModal()">Cancel</button>
            <button type="submit" class="bo-btn bo-btn-gold">Create Category</button>
          </div>
        </form>
      `
    );
  };

  window.submitAddCategory = async function (e) {
    e.preventDefault();
    const name = document.getElementById('newCatName').value.trim();
    const subtitle = document.getElementById('newCatSub').value.trim();
    const thumbImg = document.getElementById('newCatImg').value.trim();
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    MENU_CATEGORIES.unshift({
      id,
      rawCategory: name.toUpperCase(),
      name,
      subtitle,
      badge: subtitle,
      icon: 'fa-utensils',
      thumbImg,
      fallbackImg: thumbImg,
      modType: 'burger',
      count: 0,
      items: []
    });

    await persistMenuToServer();
    closeBoModal();
    boState.menuCatFilter = id;
    renderActiveTab();
    showBoToast(`Category "${name}" created!`);
  };

  // ==========================================================================
  // 4. CATERING PACKAGES & LIVE COOKING STATIONS MANAGER
  // ==========================================================================
  function buildCateringManagerView() {
    const pkgs = SITE_CONFIG.cateringPackages || [];
    const stations = SITE_CONFIG.liveStations || [];

    return `
      <div class="bo-panel">
        <div class="bo-panel-header">
          <div class="bo-pill-tabs">
            <button class="bo-pill-tab ${boState.cateringSubTab === 'packages' ? 'active' : ''}" onclick="boState.cateringSubTab='packages'; renderActiveTab();">
              <i class="fa-solid fa-crown"></i> Event & Wedding Packages (${pkgs.length})
            </button>
            <button class="bo-pill-tab ${boState.cateringSubTab === 'stations' ? 'active' : ''}" onclick="boState.cateringSubTab='stations'; renderActiveTab();">
              <i class="fa-solid fa-fire-burner"></i> Live Cooking Stations (${stations.length})
            </button>
          </div>

          <button
            class="bo-btn bo-btn-gold"
            onclick="${boState.cateringSubTab === 'packages' ? 'openAddPackageModal()' : 'openAddStationModal()'}"
          >
            <i class="fa-solid fa-plus"></i> ${boState.cateringSubTab === 'packages' ? '+ Add Catering Package' : '+ Add Live Station'}
          </button>
        </div>

        <div class="bo-panel-body">
          ${
            boState.cateringSubTab === 'packages'
              ? `
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap:18px;">
                  ${pkgs
                    .map(
                      (p, idx) => `
                    <div style="border:1px solid var(--bo-border); border-radius:16px; overflow:hidden; background:#fff; display:flex; flex-direction:column;">
                      <div style="height:160px; position:relative;">
                        <img src="${p.img}" style="width:100%; height:100%; object-fit:cover;" alt="${p.title}" />
                        <span style="position:absolute; top:10px; left:10px; background:#14171c; color:var(--bo-gold); padding:4px 10px; border-radius:999px; font-size:0.72rem; font-weight:800;">${p.badge}</span>
                        <span style="position:absolute; bottom:10px; right:10px; background:var(--bo-gold); color:#14171c; padding:4px 12px; border-radius:999px; font-weight:800; font-size:0.85rem;">${p.pricePerPerson}/guest</span>
                      </div>
                      <div style="padding:16px; flex:1; display:flex; flex-direction:column; gap:8px;">
                        <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted);">${p.categoryLabel} • ${p.minGuests}</div>
                        <input type="text" class="bo-input" id="pkg-title-${idx}" value="${p.title.replace(/"/g, '&quot;')}" style="font-weight:700;" />
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                          <div>
                            <label style="font-size:0.68rem; color:var(--bo-muted);">Price / Guest</label>
                            <input type="text" class="bo-input" id="pkg-price-${idx}" value="${p.pricePerPerson}" />
                          </div>
                          <div>
                            <label style="font-size:0.68rem; color:var(--bo-muted);">Min Guests</label>
                            <input type="text" class="bo-input" id="pkg-min-${idx}" value="${p.minGuests}" />
                          </div>
                        </div>
                        <textarea class="bo-textarea" id="pkg-sub-${idx}" rows="2" style="font-size:0.8rem;">${p.subtitle}</textarea>
                        <div style="display:flex; gap:8px; margin-top:auto; padding-top:8px;">
                          <button class="bo-btn bo-btn-primary" style="flex:1;" onclick="savePackageCard(${idx})">Save Changes</button>
                          <button class="bo-btn bo-btn-danger" onclick="deletePackageCard(${idx})"><i class="fa-solid fa-trash"></i></button>
                        </div>
                      </div>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              `
              : `
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap:18px;">
                  ${stations
                    .map(
                      (st, idx) => `
                    <div style="border:1px solid var(--bo-border); border-radius:16px; overflow:hidden; background:#fff; display:flex; flex-direction:column;">
                      <img src="${st.img}" style="width:100%; height:160px; object-fit:cover;" alt="${st.title}" />
                      <div style="padding:16px; display:flex; flex-direction:column; gap:8px; flex:1;">
                        <input type="text" class="bo-input" id="st-tag-${idx}" value="${st.tag.replace(/"/g, '&quot;')}" style="font-size:0.75rem; font-weight:700;" />
                        <input type="text" class="bo-input" id="st-title-${idx}" value="${st.title.replace(/"/g, '&quot;')}" style="font-weight:700;" />
                        <textarea class="bo-textarea" id="st-desc-${idx}" rows="3" style="font-size:0.8rem;">${st.desc}</textarea>
                        <div style="display:flex; gap:8px; margin-top:auto; padding-top:8px;">
                          <button class="bo-btn bo-btn-primary" style="flex:1;" onclick="saveStationCard(${idx})">Save Station</button>
                          <button class="bo-btn bo-btn-danger" onclick="deleteStationCard(${idx})"><i class="fa-solid fa-trash"></i></button>
                        </div>
                      </div>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              `
          }
        </div>
      </div>
    `;
  }

  window.savePackageCard = async function (idx) {
    const pkg = SITE_CONFIG.cateringPackages[idx];
    if (!pkg) return;
    pkg.title = document.getElementById(`pkg-title-${idx}`).value.trim();
    pkg.pricePerPerson = document.getElementById(`pkg-price-${idx}`).value.trim();
    pkg.minGuests = document.getElementById(`pkg-min-${idx}`).value.trim();
    pkg.subtitle = document.getElementById(`pkg-sub-${idx}`).value.trim();
    await persistSiteConfigToServer();
    showBoToast(`Saved package "${pkg.title}"`);
  };

  window.deletePackageCard = async function (idx) {
    SITE_CONFIG.cateringPackages.splice(idx, 1);
    await persistSiteConfigToServer();
    renderActiveTab();
    showBoToast('Package deleted.');
  };

  window.openAddPackageModal = function () {
    openBoModal(
      'Add New Catering / Wedding Package',
      `
        <form onsubmit="submitAddPackage(event)">
          <div class="bo-form-grid">
            <div class="bo-form-group">
              <label>Package Title *</label>
              <input type="text" id="npTitle" class="bo-input" placeholder="e.g., Diamond Mountain Wedding Buffet" required />
            </div>
            <div class="bo-form-group">
              <label>Category *</label>
              <select id="npCat" class="bo-select">
                <option value="wedding">Wedding Catering</option>
                <option value="corporate">Corporate Events</option>
                <option value="private">Private Parties & Formulas</option>
              </select>
            </div>
            <div class="bo-form-group">
              <label>Price Per Guest *</label>
              <input type="text" id="npPrice" class="bo-input" placeholder="e.g., $40" required />
            </div>
            <div class="bo-form-group">
              <label>Minimum Guests *</label>
              <input type="text" id="npMin" class="bo-input" placeholder="e.g., 50+ Guests" required />
            </div>
          </div>
          <div class="bo-form-group" style="margin-top:14px;">
            <label>Cover Photo (Paste URL or Upload from Device) *</label>
            <div style="display:flex; gap:8px; align-items:center;">
              <input type="text" id="npImg" class="bo-input" style="flex:1;" value="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=85" required />
              <label class="bo-btn bo-btn-outline" style="cursor:pointer; white-space:nowrap; margin:0;">
                <i class="fa-solid fa-cloud-arrow-up"></i> Upload Photo
                <input type="file" accept="image/*" hidden onchange="uploadBoPhotoFile(this, 'npImg')" />
              </label>
            </div>
          </div>
          <div class="bo-form-group" style="margin-top:14px;">
            <label>Subtitle *</label>
            <input type="text" id="npSub" class="bo-input" placeholder="Brief summary of the event package..." required />
          </div>
          <div class="bo-form-group" style="margin-top:14px;">
            <label>Package Highlights (One per line) *</label>
            <textarea id="npHighlights" class="bo-textarea" rows="4" placeholder="Welcome Drink & Canapés&#10;14+ Cold & Hot Lebanese Mezza&#10;Live Charcoal Mixed Grill Station" required></textarea>
          </div>
          <div style="margin-top:18px; display:flex; justify-content:flex-end; gap:10px;">
            <button type="button" class="bo-btn bo-btn-outline" onclick="closeBoModal()">Cancel</button>
            <button type="submit" class="bo-btn bo-btn-gold">Add Package</button>
          </div>
        </form>
      `
    );
  };

  window.submitAddPackage = async function (e) {
    e.preventDefault();
    const cat = document.getElementById('npCat').value;
    const catLabels = {
      wedding: 'Wedding Catering',
      corporate: 'Corporate Events',
      private: 'Private Parties'
    };
    const newPkg = {
      id: `pkg-custom-${Date.now()}`,
      category: cat,
      categoryLabel: catLabels[cat] || 'Event Catering',
      badge: 'New Package',
      title: document.getElementById('npTitle').value.trim(),
      subtitle: document.getElementById('npSub').value.trim(),
      pricePerPerson: document.getElementById('npPrice').value.trim(),
      minGuests: document.getElementById('npMin').value.trim(),
      img: document.getElementById('npImg').value.trim(),
      highlights: document
        .getElementById('npHighlights')
        .value.split('\n')
        .map(s => s.trim())
        .filter(Boolean)
    };
    SITE_CONFIG.cateringPackages.unshift(newPkg);
    await persistSiteConfigToServer();
    closeBoModal();
    renderActiveTab();
    showBoToast(`Added package "${newPkg.title}"!`);
  };

  window.saveStationCard = async function (idx) {
    const st = SITE_CONFIG.liveStations[idx];
    if (!st) return;
    st.tag = document.getElementById(`st-tag-${idx}`).value.trim();
    st.title = document.getElementById(`st-title-${idx}`).value.trim();
    st.desc = document.getElementById(`st-desc-${idx}`).value.trim();
    await persistSiteConfigToServer();
    showBoToast(`Saved station "${st.title}"`);
  };

  window.deleteStationCard = async function (idx) {
    SITE_CONFIG.liveStations.splice(idx, 1);
    await persistSiteConfigToServer();
    renderActiveTab();
    showBoToast('Live station deleted.');
  };

  window.openAddStationModal = function () {
    openBoModal(
      'Add New Live Cooking Station',
      `
        <form onsubmit="submitAddStation(event)">
          <div class="bo-form-grid">
            <div class="bo-form-group">
              <label>Station Title *</label>
              <input type="text" id="nsTitle" class="bo-input" placeholder="e.g., Live Shawarma & Saj Station" required />
            </div>
            <div class="bo-form-group">
              <label>Badge Tag *</label>
              <input type="text" id="nsTag" class="bo-input" placeholder="e.g., Guest Favorite" required />
            </div>
          </div>
          <div class="bo-form-group" style="margin-top:14px;">
            <label>Station Photo (Paste URL or Upload from Device) *</label>
            <div style="display:flex; gap:8px; align-items:center;">
              <input type="text" id="nsImg" class="bo-input" style="flex:1;" value="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=85" required />
              <label class="bo-btn bo-btn-outline" style="cursor:pointer; white-space:nowrap; margin:0;">
                <i class="fa-solid fa-cloud-arrow-up"></i> Upload Photo
                <input type="file" accept="image/*" hidden onchange="uploadBoPhotoFile(this, 'nsImg')" />
              </label>
            </div>
          </div>
          <div class="bo-form-group" style="margin-top:14px;">
            <label>Description *</label>
            <textarea id="nsDesc" class="bo-textarea" rows="3" required></textarea>
          </div>
          <div style="margin-top:18px; display:flex; justify-content:flex-end; gap:10px;">
            <button type="button" class="bo-btn bo-btn-outline" onclick="closeBoModal()">Cancel</button>
            <button type="submit" class="bo-btn bo-btn-gold">Add Live Station</button>
          </div>
        </form>
      `
    );
  };

  window.submitAddStation = async function (e) {
    e.preventDefault();
    SITE_CONFIG.liveStations.unshift({
      title: document.getElementById('nsTitle').value.trim(),
      tag: document.getElementById('nsTag').value.trim(),
      img: document.getElementById('nsImg').value.trim(),
      desc: document.getElementById('nsDesc').value.trim()
    });
    await persistSiteConfigToServer();
    closeBoModal();
    renderActiveTab();
    showBoToast('New Live Cooking Station added!');
  };

  // ==========================================================================
  // 5. 3-MENU QR CODES & TABLE TENT PRINTER
  // ==========================================================================
  function buildQrCodesView() {
    const baseOrigin =
      window.location.origin && window.location.origin !== 'null'
        ? window.location.origin
        : 'http://minikitchencatering.com';

    const qrList = [
      {
        mode: 'catering',
        badge: 'QR Menu #1 • Weddings & Events',
        title: 'Mini Kitchen Catering & Packages Menu',
        desc: 'Direct QR link to Wedding Packages, Corporate Buffets & FineDine Catering Trays (`?qr=1#catering-menus`).',
        color: '#c59b27',
        phone: SITE_CONFIG.contacts.catering.phoneDisplay,
        url: `${baseOrigin}/catering-menus.html?qr=1#catering-menus`
      },
      {
        mode: 'resto',
        badge: 'QR Menu #2 • Aley Terrace Table Scan',
        title: 'Mini Kitchen Restaurant — Dine-In Table QR',
        desc: 'Direct QR link for restaurant tables in Ain Al Remmaneh, Aley (`?qr=1#restaurant`). Opens directly in Full-Screen Table Mode.',
        color: '#2d6a4f',
        phone: SITE_CONFIG.contacts.restaurant.phoneDisplay,
        url: `${baseOrigin}/restaurant.html?qr=1#restaurant`
      },
      {
        mode: 'delivery',
        badge: 'QR Menu #3 • Fast WhatsApp Delivery',
        title: 'Mini Kitchen Delivery — Instant Order QR',
        desc: 'Direct QR link for delivery flyers, magnets & packaging (`?qr=1#delivery`). Customers scan, fill bag & send to WhatsApp.',
        color: '#d94e28',
        phone: SITE_CONFIG.contacts.delivery.phoneDisplay,
        url: `${baseOrigin}/delivery.html?qr=1#delivery`
      }
    ];

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
            ${qrList
              .map(q => {
                const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&color=14171c&bgcolor=ffffff&data=${encodeURIComponent(
                  q.url
                )}`;
                return `
                  <div style="border:1px solid var(--bo-border); border-top: 5px solid ${q.color}; border-radius:18px; padding:24px; text-align:center; background:#fff; display:flex; flex-direction:column; align-items:center;">
                    <span style="background:${q.color}18; color:${q.color}; font-size:0.72rem; font-weight:800; padding:4px 12px; border-radius:999px; text-transform:uppercase; margin-bottom:10px;">
                      ${q.badge}
                    </span>
                    <h3 style="font-family:var(--font-serif); font-size:1.25rem; margin-bottom:6px;">${q.title}</h3>
                    <p style="font-size:0.82rem; color:var(--bo-muted); margin-bottom:16px;">${q.desc}</p>
                    <div style="padding:14px; border:2px dashed ${q.color}; border-radius:18px; margin-bottom:14px; background:#fff;">
                      <img src="${qrImg}" alt="${q.title}" style="width:190px; height:190px; display:block;" />
                    </div>
                    <input type="text" class="bo-input" value="${q.url}" readonly style="font-size:0.75rem; text-align:center; margin-bottom:12px; background:#f9fafb;" />
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; width:100%;">
                      <button class="bo-btn bo-btn-primary" style="background:${q.color};" onclick="printBoQrStandee('${q.mode}')">
                        <i class="fa-solid fa-print"></i> Print Table Tent
                      </button>
                      <a href="${q.url}" target="_blank" class="bo-btn bo-btn-outline">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Test QR View
                      </a>
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      </div>

      ${buildTableQrGeneratorPanel(baseOrigin)}
    `;
  }

  // ==========================================================================
  // TABLE-NUMBERED DINE-IN QR CODE GENERATOR (?qr=1&table=N)
  // ==========================================================================
  function buildTableQrGeneratorPanel(baseOrigin) {
    const count = Math.max(1, Math.min(60, Number(boState.tableQrCount) || 12));
    const tables = Array.from({ length: count }, (_, i) => i + 1);
    return `
      <div class="bo-panel">
        <div class="bo-panel-header">
          <div>
            <div class="bo-panel-title"><i class="fa-solid fa-chair" style="color:var(--bo-pine);"></i> Table-Numbered Dine-In QR Codes (Aley Terrace)</div>
            <div style="font-size:0.8rem; color:var(--bo-muted);">Each table QR opens the Restaurant menu with <code>?qr=1&amp;table=N</code> — guests see "Table #N", pay no delivery fee, and their order arrives in the CRM tagged with the table number</div>
          </div>
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span style="font-size:0.78rem; font-weight:700; color:var(--bo-muted);">Number of Tables:</span>
            <input type="number" min="1" max="60" class="bo-input" style="width:80px; padding:6px 10px; font-weight:800;" value="${count}" onchange="boState.tableQrCount = Number(this.value) || 12; renderActiveTab();" />
            <button type="button" class="bo-btn bo-btn-gold" onclick="printAllTableQrCards(${count})">
              <i class="fa-solid fa-print"></i> Print All ${count} Table Cards
            </button>
          </div>
        </div>
        <div class="bo-panel-body">
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap:14px;">
            ${tables
              .map(n => {
                const url = `${baseOrigin}/restaurant.html?qr=1&table=${n}#restaurant`;
                const qr = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=6&data=${encodeURIComponent(url)}`;
                return `
                  <div style="border:1px solid var(--bo-border); border-top:4px solid #2d6a4f; border-radius:14px; padding:12px; text-align:center; background:var(--bo-surface, #fff);">
                    <div style="font-weight:800; font-size:0.95rem; margin-bottom:6px;">Table #${n}</div>
                    <img src="${qr}" alt="Table ${n} QR" style="width:110px; height:110px;" loading="lazy" />
                    <div style="display:flex; gap:6px; margin-top:8px;">
                      <a href="${url}" target="_blank" class="bo-btn bo-btn-outline" style="flex:1; padding:5px 6px; font-size:0.7rem;" title="Test">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                      </a>
                      <button type="button" class="bo-btn bo-btn-outline" style="flex:1; padding:5px 6px; font-size:0.7rem;" onclick="printAllTableQrCards(1, ${n})" title="Print">
                        <i class="fa-solid fa-print"></i>
                      </button>
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  window.printAllTableQrCards = function (count, singleTable) {
    const baseOrigin =
      window.location.origin && window.location.origin !== 'null'
        ? window.location.origin
        : 'https://minikitchencatering.com';
    const list = singleTable ? [singleTable] : Array.from({ length: count }, (_, i) => i + 1);
    const win = window.open('', '_blank', 'width=900,height=900');
    if (!win) {
      showBoToast('Please allow popups to print table QR cards.');
      return;
    }
    const cards = list
      .map(n => {
        const url = `${baseOrigin}/restaurant.html?qr=1&table=${n}#restaurant`;
        const qr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(url)}`;
        return `
          <div class="card">
            <div class="badge">Dine-In • Scan to Order</div>
            <h1>MINI KITCHEN</h1>
            <div class="table">TABLE ${n}</div>
            <img src="${qr}" alt="Table ${n}" />
            <div class="foot">Scan with your phone camera to browse the menu & order to your table</div>
            <div class="sub">Ain Al Remmaneh, Aley • ${esc(SITE_CONFIG.contacts.restaurant.phoneDisplay)}</div>
          </div>`;
      })
      .join('');
    win.document.write(`
      <!DOCTYPE html><html><head><title>Mini Kitchen — Table QR Cards</title>
      <style>
        body { font-family: sans-serif; margin: 0; padding: 20px; display:flex; flex-wrap:wrap; gap:18px; justify-content:center; }
        .card { width: 300px; border: 3px solid #2d6a4f; border-radius: 22px; padding: 22px; text-align: center; page-break-inside: avoid; }
        .badge { display:inline-block; background:#2d6a4f; color:#fff; font-size:11px; font-weight:bold; text-transform:uppercase; letter-spacing:0.1em; padding:5px 12px; border-radius:999px; }
        h1 { margin: 10px 0 2px; font-size: 22px; letter-spacing: 0.06em; }
        .table { font-size: 34px; font-weight: 900; color: #c59b27; margin-bottom: 8px; }
        img { width: 200px; height: 200px; border: 2px dashed #2d6a4f; border-radius: 14px; padding: 8px; }
        .foot { font-size: 12px; font-weight: bold; margin-top: 10px; }
        .sub { font-size: 11px; color: #666; margin-top: 4px; }
      </style></head>
      <body onload="setTimeout(() => window.print(), 700)">${cards}</body></html>
    `);
    win.document.close();
  };

  window.printBoQrStandee = function (mode) {
    const baseOrigin =
      window.location.origin && window.location.origin !== 'null'
        ? window.location.origin
        : 'http://minikitchencatering.com';
    const map = {
      catering: {
        badge: 'QR Menu #1 • Weddings & Events',
        title: 'Mini Kitchen Catering & Packages Menu',
        color: '#c59b27',
        phone: SITE_CONFIG.contacts.catering.phoneDisplay,
        url: `${baseOrigin}/catering-menus.html?qr=1#catering-menus`
      },
      resto: {
        badge: 'QR Menu #2 • Aley Terrace Dine-In',
        title: 'Mini Kitchen Restaurant — Table Menu',
        color: '#2d6a4f',
        phone: SITE_CONFIG.contacts.restaurant.phoneDisplay,
        url: `${baseOrigin}/restaurant.html?qr=1#restaurant`
      },
      delivery: {
        badge: 'QR Menu #3 • Fast WhatsApp Delivery',
        title: 'Mini Kitchen Delivery — WhatsApp Menu',
        color: '#d94e28',
        phone: SITE_CONFIG.contacts.delivery.phoneDisplay,
        url: `${baseOrigin}/delivery.html?qr=1#delivery`
      }
    };
    const m = map[mode] || map.resto;
    const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&color=14171c&bgcolor=ffffff&data=${encodeURIComponent(
      m.url
    )}`;
    const win = window.open('', '_blank', 'width=520,height=720');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print QR Standee — ${m.title}</title>
        <style>
          body { font-family: sans-serif; display:flex; align-items:center; justify-content:center; min-height:95vh; margin:0; }
          .card { width: 360px; border: 3px solid ${m.color}; border-radius: 24px; padding: 32px 24px; text-align:center; }
          .badge { display:inline-block; background:${m.color}; color:#fff; padding:6px 14px; border-radius:999px; font-size:11px; font-weight:bold; text-transform:uppercase; margin-bottom:12px; }
          h1 { margin: 0 0 6px; font-size: 24px; }
          p { margin: 0 0 18px; font-size: 13px; color:#555; }
          img { width: 220px; height: 220px; border: 2px dashed ${m.color}; padding: 12px; border-radius: 16px; margin-bottom: 14px; }
        </style>
      </head>
      <body onload="setTimeout(() => window.print(), 400)">
        <div class="card">
          <div class="badge">${m.badge}</div>
          <h1>MINI KITCHEN</h1>
          <p>${m.title}</p>
          <img src="${qrImg}" alt="QR" />
          <div style="font-weight:bold; font-size:13px;">Scan with your phone camera to browse & order</div>
          <div style="font-size:11px; color:#666; margin-top:4px;">Ain Al Remmaneh, Aley • WhatsApp: ${m.phone}</div>
        </div>
      </body>
      </html>
    `);
    win.document.close();
  };

  // ==========================================================================
  // 6. WEBSITE GALLERIES, VIEWS & CHEFS TEAM MANAGER
  // ==========================================================================
  function buildContentManagerView() {
    const sub = boState.contentSubTab || 'cateringGallery';
    const items = SITE_CONFIG[sub] || [];

    return `
      <div class="bo-panel">
        <div class="bo-panel-header">
          <div class="bo-pill-tabs">
            <button class="bo-pill-tab ${sub === 'cateringGallery' ? 'active' : ''}" onclick="boState.contentSubTab='cateringGallery'; renderActiveTab();">
              Wedding & Catering Gallery (${(SITE_CONFIG.cateringGallery || []).length})
            </button>
            <button class="bo-pill-tab ${sub === 'restaurantGallery' ? 'active' : ''}" onclick="boState.contentSubTab='restaurantGallery'; renderActiveTab();">
              Restaurant & Aley Views (${(SITE_CONFIG.restaurantGallery || []).length})
            </button>
            <button class="bo-pill-tab ${sub === 'teamMembers' ? 'active' : ''}" onclick="boState.contentSubTab='teamMembers'; renderActiveTab();">
              Chefs & Culinary Team (${(SITE_CONFIG.teamMembers || []).length})
            </button>
            <button class="bo-pill-tab ${sub === 'behindTheScenes' ? 'active' : ''}" onclick="boState.contentSubTab='behindTheScenes'; renderActiveTab();">
              Behind The Scenes (${(SITE_CONFIG.behindTheScenes || []).length})
            </button>
          </div>

          <button class="bo-btn bo-btn-gold" onclick="openAddContentItemModal('${sub}')">
            <i class="fa-solid fa-plus"></i> + Add Photo / Profile
          </button>
        </div>

        <div class="bo-panel-body">
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap:18px;">
            ${items
              .map(
                (it, idx) => `
              <div style="border:1px solid var(--bo-border); border-radius:16px; overflow:hidden; background:#fff; display:flex; flex-direction:column;">
                <img src="${it.img}" style="width:100%; height:175px; object-fit:cover;" alt="${(it.title || it.name || '').replace(/"/g, '&quot;')}" />
                <div style="padding:14px; display:flex; flex-direction:column; gap:8px; flex:1;">
                  <input
                    type="text"
                    class="bo-input"
                    id="cnt-title-${idx}"
                    value="${(it.title || it.name || '').replace(/"/g, '&quot;')}"
                    style="font-weight:700;"
                    placeholder="Title / Name"
                  />
                  <input
                    type="text"
                    class="bo-input"
                    id="cnt-tag-${idx}"
                    value="${(it.category || it.tag || it.role || it.stage || '').replace(/"/g, '&quot;')}"
                    style="font-size:0.78rem;"
                    placeholder="Category / Tag / Role"
                  />
                  <div style="display:flex; gap:6px; align-items:center;">
                    <input
                      type="text"
                      class="bo-input"
                      id="cnt-img-${idx}"
                      value="${(it.img || '').replace(/"/g, '&quot;')}"
                      style="font-size:0.75rem; flex:1;"
                      placeholder="Image URL"
                    />
                    <label class="bo-btn bo-btn-outline" style="cursor:pointer; padding:7px 10px; font-size:0.74rem; white-space:nowrap; margin:0;" title="Upload Photo from Device">
                      <i class="fa-solid fa-cloud-arrow-up"></i>
                      <input type="file" accept="image/*" hidden onchange="uploadBoPhotoFile(this, 'cnt-img-${idx}')" />
                    </label>
                  </div>
                  <textarea class="bo-textarea" id="cnt-desc-${idx}" rows="2" style="font-size:0.8rem;">${it.caption || it.desc || it.bio || ''}</textarea>
                  <div style="display:flex; gap:8px; margin-top:auto; padding-top:6px;">
                    <button class="bo-btn bo-btn-primary" style="flex:1;" onclick="saveContentCard('${sub}', ${idx})">Save</button>
                    <button class="bo-btn bo-btn-danger" onclick="deleteContentCard('${sub}', ${idx})"><i class="fa-solid fa-trash"></i></button>
                  </div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  window.saveContentCard = async function (sub, idx) {
    const it = SITE_CONFIG[sub]?.[idx];
    if (!it) return;
    const titleVal = document.getElementById(`cnt-title-${idx}`).value.trim();
    const tagVal = document.getElementById(`cnt-tag-${idx}`).value.trim();
    const imgVal = document.getElementById(`cnt-img-${idx}`).value.trim();
    const descVal = document.getElementById(`cnt-desc-${idx}`).value.trim();

    it.img = imgVal;
    if (sub === 'cateringGallery') {
      it.title = titleVal;
      it.category = tagVal;
      it.caption = descVal;
    } else if (sub === 'restaurantGallery') {
      it.title = titleVal;
      it.tag = tagVal;
      it.desc = descVal;
    } else if (sub === 'teamMembers') {
      it.name = titleVal;
      it.role = tagVal;
      it.bio = descVal;
    } else if (sub === 'behindTheScenes') {
      it.title = titleVal;
      it.stage = tagVal;
      it.desc = descVal;
    }

    await persistSiteConfigToServer();
    showBoToast('Gallery / Team card updated on live website!');
  };

  window.deleteContentCard = async function (sub, idx) {
    SITE_CONFIG[sub].splice(idx, 1);
    await persistSiteConfigToServer();
    renderActiveTab();
    showBoToast('Item removed.');
  };

  window.openAddContentItemModal = function (sub) {
    openBoModal(
      'Add New Photo / Team Profile',
      `
        <form onsubmit="submitAddContentItem(event, '${sub}')">
          <div class="bo-form-grid">
            <div class="bo-form-group">
              <label>Title or Chef Name *</label>
              <input type="text" id="ncTitle" class="bo-input" required />
            </div>
            <div class="bo-form-group">
              <label>Tag / Category / Role *</label>
              <input type="text" id="ncTag" class="bo-input" placeholder="e.g., Weddings / The View / Head Chef" required />
            </div>
          </div>
          <div class="bo-form-group" style="margin-top:14px;">
            <label>Photo (Paste URL or Upload from Device) *</label>
            <div style="display:flex; gap:8px; align-items:center;">
              <input type="text" id="ncImg" class="bo-input" style="flex:1;" value="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85" required />
              <label class="bo-btn bo-btn-outline" style="cursor:pointer; white-space:nowrap; margin:0;">
                <i class="fa-solid fa-cloud-arrow-up"></i> Upload Photo
                <input type="file" accept="image/*" hidden onchange="uploadBoPhotoFile(this, 'ncImg')" />
              </label>
            </div>
          </div>
          <div class="bo-form-group" style="margin-top:14px;">
            <label>Caption / Bio *</label>
            <textarea id="ncDesc" class="bo-textarea" rows="3" required></textarea>
          </div>
          <div style="margin-top:18px; display:flex; justify-content:flex-end; gap:10px;">
            <button type="button" class="bo-btn bo-btn-outline" onclick="closeBoModal()">Cancel</button>
            <button type="submit" class="bo-btn bo-btn-gold">Add to Website</button>
          </div>
        </form>
      `
    );
  };

  window.submitAddContentItem = async function (e, sub) {
    e.preventDefault();
    const t = document.getElementById('ncTitle').value.trim();
    const g = document.getElementById('ncTag').value.trim();
    const img = document.getElementById('ncImg').value.trim();
    const d = document.getElementById('ncDesc').value.trim();

    let obj = { title: t, category: g, caption: d, img };
    if (sub === 'restaurantGallery') obj = { title: t, tag: g, desc: d, img };
    if (sub === 'teamMembers') obj = { name: t, role: g, bio: d, img };
    if (sub === 'behindTheScenes') obj = { title: t, stage: g, desc: d, img };

    SITE_CONFIG[sub] = [obj, ...(SITE_CONFIG[sub] || [])];
    await persistSiteConfigToServer();
    closeBoModal();
    renderActiveTab();
    showBoToast('Added new item to website!');
  };

  // ==========================================================================
  // 7. SEARCH ENGINE OPTIMIZATION (SEO) & GOOGLE SNIPPET MANAGER
  // ==========================================================================
  function ensureSiteSeoStructure() {
    if (!SITE_CONFIG.seo) {
      SITE_CONFIG.seo = cloneObj(
        (window.MK_SITE_CONFIG && window.MK_SITE_CONFIG.seo) || {
          siteUrl: 'https://minikitchencatering.com',
          businessName: 'Mini Kitchen — Catering, Restaurant & Delivery',
          geoRegion: 'LB-JL',
          geoPlacename: 'Ain Al Remmaneh, Aley, Mount Lebanon, Lebanon',
          pages: {}
        }
      );
    }
    if (!SITE_CONFIG.seo.pages && window.MK_SITE_CONFIG && window.MK_SITE_CONFIG.seo) {
      SITE_CONFIG.seo.pages = cloneObj(window.MK_SITE_CONFIG.seo.pages);
    }
    return SITE_CONFIG.seo;
  }

  function buildSeoManagerView() {
    const seo = ensureSiteSeoStructure();
    const pageKey = boState.seoPageKey || 'catering';
    const pageLabels = {
      catering: '1. Catering Homepage (index.html)',
      'catering-menus': '2. Catering Menus & Packages (catering-menus.html)',
      restaurant: '3. Mini Kitchen Restaurant Aley (restaurant.html)',
      delivery: '4. Mini Kitchen Delivery Menu (delivery.html)',
      about: '5. About Us & Chefs (about.html)',
      contact: '6. Contact Us & WhatsApp (contact.html)'
    };

    const currentMeta = (seo.pages && seo.pages[pageKey]) || {
      title: 'Mini Kitchen Catering | Luxury Wedding & Event Catering in Aley, Mount Lebanon',
      description:
        'Mini Kitchen Catering in Ain Al Remmaneh, Aley provides bespoke wedding catering, corporate galas, live cooking stations, scenic dining, and WhatsApp delivery.',
      keywords:
        'Mini Kitchen Catering, wedding catering Lebanon, catering Aley, Mount Lebanon catering, Ain Al Remmaneh restaurant',
      canonicalPath: '/'
    };

    const previewUrl =
      (seo.siteUrl || 'https://minikitchencatering.com').replace(/\/$/, '') +
      (currentMeta.canonicalPath || '/');

    return `
      <div class="bo-panel">
        <div class="bo-panel-header">
          <div>
            <div class="bo-panel-title"><i class="fa-solid fa-magnifying-glass-chart" style="color:var(--bo-gold);"></i> Local & Multi-Brand SEO Manager (Ain Al Remmaneh, Aley)</div>
            <div style="font-size:0.8rem; color:var(--bo-muted);">Optimize how Mini Kitchen Catering, Restaurant, and Delivery rank on Google Search & appear when shared on WhatsApp</div>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <a href="/sitemap.xml" target="_blank" class="bo-btn bo-btn-outline">
              <i class="fa-solid fa-sitemap"></i> View sitemap.xml
            </a>
            <a href="/robots.txt" target="_blank" class="bo-btn bo-btn-outline">
              <i class="fa-solid fa-robot"></i> View robots.txt
            </a>
          </div>
        </div>

        <div class="bo-panel-body">
          <!-- Page Selector Pills -->
          <div class="bo-toolbar" style="margin-bottom:20px;">
            ${Object.entries(pageLabels)
              .map(
                ([k, label]) => `
              <button
                type="button"
                class="bo-filter-pill ${pageKey === k ? 'active' : ''}"
                onclick="boState.seoPageKey = '${k}'; renderActiveTab();"
              >
                ${label}
              </button>
            `
              )
              .join('')}
          </div>

          <!-- Live Google Search SERP Preview -->
          <div style="margin-bottom:22px;">
            <div style="font-size:0.74rem; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:var(--bo-muted); margin-bottom:8px;">
              <i class="fa-brands fa-google" style="color:#4285F4;"></i> Live Google Search Result Snippet Preview
            </div>
            <div class="bo-seo-serp-card">
              <div class="bo-seo-serp-url">
                <img src="${SITE_CONFIG.logos.main}" alt="" style="width:18px; height:18px; border-radius:50%; object-fit:cover;" />
                <span><b>Mini Kitchen</b> — ${previewUrl}</span>
              </div>
              <div class="bo-seo-serp-title" id="seoPreviewTitle">${currentMeta.title}</div>
              <div class="bo-seo-serp-desc" id="seoPreviewDesc">${currentMeta.description}</div>
            </div>
          </div>

          <!-- SEO Editor Form -->
          <form onsubmit="saveSeoPageSettings(event)">
            <div class="bo-form-grid">
              <div class="bo-form-group">
                <label>Canonical Domain URL</label>
                <input
                  type="text"
                  id="seoSiteUrl"
                  class="bo-input"
                  value="${(seo.siteUrl || 'https://minikitchencatering.com').replace(/"/g, '&quot;')}"
                />
              </div>
              <div class="bo-form-group">
                <label>Geo-Target Location (Schema.org & Local SEO)</label>
                <input
                  type="text"
                  id="seoGeoPlace"
                  class="bo-input"
                  value="${(seo.geoPlacename || 'Ain Al Remmaneh, Aley, Mount Lebanon, Lebanon').replace(/"/g, '&quot;')}"
                />
              </div>
            </div>

            <div class="bo-form-group" style="margin-top:14px;">
              <label>Page SEO Title Tag (<code>&lt;title&gt;</code> & OpenGraph Title) *</label>
              <input
                type="text"
                id="seoPageTitle"
                class="bo-input"
                value="${(currentMeta.title || '').replace(/"/g, '&quot;')}"
                oninput="document.getElementById('seoPreviewTitle').textContent = this.value"
                required
              />
            </div>

            <div class="bo-form-group" style="margin-top:14px;">
              <label>Meta Description (<code>meta[name="description"]</code> & WhatsApp Share Preview) *</label>
              <textarea
                id="seoPageDesc"
                class="bo-textarea"
                rows="3"
                oninput="document.getElementById('seoPreviewDesc').textContent = this.value"
                required
              >${currentMeta.description || ''}</textarea>
            </div>

            <div class="bo-form-group" style="margin-top:14px;">
              <label>Target SEO Keywords (Comma separated)</label>
              <input
                type="text"
                id="seoPageKeywords"
                class="bo-input"
                value="${(currentMeta.keywords || '').replace(/"/g, '&quot;')}"
              />
            </div>

            <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <div style="font-size:0.8rem; color:var(--bo-muted);">
                <i class="fa-solid fa-circle-check" style="color:var(--bo-wa);"></i> Includes <b>JSON-LD @graph Schema</b> for Catering, Restaurant, Delivery & Local FAQ
              </div>
              <button type="submit" class="bo-btn bo-btn-gold">
                <i class="fa-solid fa-floppy-disk"></i> Save SEO Settings for ${pageLabels[pageKey]}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  window.saveSeoPageSettings = async function (e) {
    e.preventDefault();
    const seo = ensureSiteSeoStructure();
    const pageKey = boState.seoPageKey || 'catering';
    seo.siteUrl = document.getElementById('seoSiteUrl').value.trim() || 'https://minikitchencatering.com';
    seo.geoPlacename = document.getElementById('seoGeoPlace').value.trim();

    if (!seo.pages[pageKey]) {
      seo.pages[pageKey] = { canonicalPath: pageKey === 'catering' ? '/' : `/${pageKey}.html` };
    }
    seo.pages[pageKey].title = document.getElementById('seoPageTitle').value.trim();
    seo.pages[pageKey].description = document.getElementById('seoPageDesc').value.trim();
    seo.pages[pageKey].keywords = document.getElementById('seoPageKeywords').value.trim();

    await persistSiteConfigToServer();
    renderActiveTab();
    showBoToast(`SEO metadata saved for "${pageKey}" page!`);
  };

  // ==========================================================================
  // 8. WEBSITE SETTINGS, DARK/LIGHT THEME, WHATSAPP NUMBERS & CURRENCY RATE
  // ==========================================================================
  function ensureDeliveryZonesAndPromos() {
    if (!Array.isArray(SITE_CONFIG.deliveryZones) || SITE_CONFIG.deliveryZones.length === 0) {
      SITE_CONFIG.deliveryZones = cloneObj(
        (window.MK_SITE_CONFIG && window.MK_SITE_CONFIG.deliveryZones) || [
          { id: 'zone-ain-al-remmaneh', name: 'Ain Al Remmaneh (Local Area)', feeUsd: 1.0, eta: '20–30 min' },
          { id: 'zone-aley-center', name: 'Aley Center / Ras El Jabal / Souk', feeUsd: 2.0, eta: '25–35 min' },
          { id: 'zone-bhamdoun-souk', name: 'Bhamdoun / Souk El Gharb / Bsous', feeUsd: 3.0, eta: '30–45 min' },
          { id: 'zone-kahale-araya', name: 'Kahale / Araya / Jamhour', feeUsd: 4.0, eta: '35–50 min' },
          { id: 'zone-pickup', name: 'Restaurant Dine-In / Self Pickup (Aley Terrace)', feeUsd: 0.0, eta: '15–25 min' }
        ]
      );
    }
    if (!Array.isArray(SITE_CONFIG.promoCodes)) {
      SITE_CONFIG.promoCodes = cloneObj(
        (window.MK_SITE_CONFIG && window.MK_SITE_CONFIG.promoCodes) || [
          { code: 'WELCOME10', type: 'percent', value: 10, minOrderUsd: 15, label: '10% OFF Welcome Discount', active: true },
          { code: 'ALEYVIP', type: 'percent', value: 15, minOrderUsd: 35, label: '15% OFF Aley VIP Order ($35+)', active: true },
          { code: 'FREEDELIVERY', type: 'fixed', value: 2, minOrderUsd: 20, label: '$2.00 Delivery Credit', active: true }
        ]
      );
    }
  }

  function buildSettingsView() {
    ensureDeliveryZonesAndPromos();
    const c = SITE_CONFIG;
    const currentSiteTheme = localStorage.getItem('mk_theme_mode') || c.defaultTheme || 'light';

    return `
      <form onsubmit="saveAllSiteSettings(event)">
        <div class="bo-panel">
          <div class="bo-panel-header">
            <div class="bo-panel-title"><i class="fa-solid fa-circle-half-stroke" style="color:var(--bo-gold);"></i> Website Theme & Appearance (Dark / Light Mode)</div>
            <button type="submit" class="bo-btn bo-btn-gold"><i class="fa-solid fa-floppy-disk"></i> Save All Website Settings</button>
          </div>
          <div class="bo-panel-body">
            <div class="bo-form-grid">
              <div class="bo-form-group">
                <label>Default Public Website Theme</label>
                <select id="setDefaultTheme" class="bo-select">
                  <option value="light" ${currentSiteTheme === 'light' ? 'selected' : ''}>☀️ Light Mode — Warm Alabaster & Champagne Gold</option>
                  <option value="dark" ${currentSiteTheme === 'dark' ? 'selected' : ''}>🌙 Dark Mode — Obsidian & Luminous Gold</option>
                </select>
              </div>
              <div class="bo-form-group">
                <label>Quick Preview Website in Selected Mode</label>
                <div style="display:flex; gap:10px;">
                  <button type="button" class="bo-btn bo-btn-outline" style="flex:1;" onclick="localStorage.setItem('mk_theme_mode', 'light'); document.getElementById('setDefaultTheme').value='light'; showBoToast('Website switched to Light Mode!');">
                    <i class="fa-solid fa-sun"></i> Activate Light Mode
                  </button>
                  <button type="button" class="bo-btn bo-btn-primary" style="flex:1;" onclick="localStorage.setItem('mk_theme_mode', 'dark'); document.getElementById('setDefaultTheme').value='dark'; showBoToast('Website switched to Dark Mode!');">
                    <i class="fa-solid fa-moon"></i> Activate Dark Mode
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bo-panel">
          <div class="bo-panel-header">
            <div>
              <div class="bo-panel-title"><i class="fa-solid fa-motorcycle" style="color:var(--bo-terracotta);"></i> Aley Delivery Zone Fee Calculator & Promo Codes</div>
              <div style="font-size:0.8rem; color:var(--bo-muted);">Control delivery fees by town and manage discount promo codes inside the customer WhatsApp Order Cart</div>
            </div>
          </div>
          <div class="bo-panel-body">
            <div style="font-size:0.76rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted); margin-bottom:10px;">1. Delivery Zones & Fees (USD $)</div>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:10px; margin-bottom:20px;">
              ${c.deliveryZones
                .map(
                  (z, idx) => `
                <div style="display:flex; gap:8px; align-items:center; background:var(--bo-bg); border:1px solid var(--bo-border); padding:10px 12px; border-radius:10px;">
                  <input type="text" class="bo-input" id="zone-name-${idx}" value="${esc(z.name)}" style="flex:1; font-size:0.82rem; font-weight:700;" />
                  <input type="number" step="0.5" class="bo-input" id="zone-fee-${idx}" value="${Number(z.feeUsd) || 0}" style="width:76px; font-weight:800; text-align:right;" title="Delivery Fee USD" />
                  <span style="font-size:0.78rem; font-weight:700; color:var(--bo-muted);">USD</span>
                </div>
              `
                )
                .join('')}
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
              <div style="font-size:0.76rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted);">2. Active Promo & Discount Codes</div>
              <button type="button" class="bo-btn bo-btn-outline" style="padding:6px 12px; font-size:0.76rem;" onclick="openAddPromoModal()">
                <i class="fa-solid fa-plus"></i> + Add Promo Code
              </button>
            </div>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:10px;">
              ${c.promoCodes
                .map(
                  (p, idx) => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bo-bg); border:1px solid var(--bo-border); padding:10px 14px; border-radius:10px;">
                  <div>
                    <div style="font-weight:800; font-size:0.9rem; color:var(--bo-gold-dark);">${esc(p.code)} <span style="font-size:0.72rem; color:${p.active !== false ? '#16a34a' : '#dc2626'};">(${p.active !== false ? 'ACTIVE' : 'PAUSED'})</span></div>
                    <div style="font-size:0.78rem; color:var(--bo-muted);">${esc(p.label)} • Min $${Number(p.minOrderUsd) || 0}</div>
                  </div>
                  <div style="display:flex; gap:6px;">
                    <button type="button" class="bo-btn bo-btn-outline" style="padding:5px 9px; font-size:0.72rem;" onclick="togglePromoCodeActive(${idx})">
                      ${p.active !== false ? 'Pause' : 'Enable'}
                    </button>
                    <button type="button" class="bo-btn bo-btn-danger" style="padding:5px 9px; font-size:0.72rem;" onclick="deletePromoCode(${idx})">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </div>

        <div class="bo-panel">
          <div class="bo-panel-header">
            <div class="bo-panel-title"><i class="fa-brands fa-whatsapp" style="color:var(--bo-wa);"></i> Multi-Brand WhatsApp Numbers & Contact Lines</div>
          </div>
          <div class="bo-panel-body">
            <div class="bo-form-grid">
              <div class="bo-form-group">
                <label>1. Catering WhatsApp Number (Digits Only)</label>
                <input type="text" id="setCatWa" class="bo-input" value="${c.contacts.catering.whatsappNumber}" />
              </div>
              <div class="bo-form-group">
                <label>1. Catering Display Phone</label>
                <input type="text" id="setCatPhone" class="bo-input" value="${c.contacts.catering.phoneDisplay}" />
              </div>
              <div class="bo-form-group">
                <label>2. Restaurant WhatsApp Number (Digits Only)</label>
                <input type="text" id="setRestoWa" class="bo-input" value="${c.contacts.restaurant.whatsappNumber}" />
              </div>
              <div class="bo-form-group">
                <label>2. Restaurant Display Phone</label>
                <input type="text" id="setRestoPhone" class="bo-input" value="${c.contacts.restaurant.phoneDisplay}" />
              </div>
              <div class="bo-form-group">
                <label>3. Delivery WhatsApp Number (Digits Only)</label>
                <input type="text" id="setDelivWa" class="bo-input" value="${c.contacts.delivery.whatsappNumber}" />
              </div>
              <div class="bo-form-group">
                <label>3. Delivery Display Phone</label>
                <input type="text" id="setDelivPhone" class="bo-input" value="${c.contacts.delivery.phoneDisplay}" />
              </div>
            </div>
          </div>
        </div>

        <div class="bo-panel">
          <div class="bo-panel-header">
            <div class="bo-panel-title"><i class="fa-solid fa-location-dot" style="color:var(--bo-gold);"></i> Location, Opening Hours, LBP Rate & Delivery Areas</div>
          </div>
          <div class="bo-panel-body">
            <div class="bo-form-grid">
              <div class="bo-form-group">
                <label>USD to LBP Exchange Rate (1 USD = L.L.)</label>
                <input type="number" step="500" id="setLbpRate" class="bo-input" value="${LBP_RATE}" />
              </div>
              <div class="bo-form-group">
                <label>Opening Hours</label>
                <input type="text" id="setHours" class="bo-input" value="${c.location.hours.replace(/"/g, '&quot;')}" />
              </div>
              <div class="bo-form-group">
                <label>Short Location Label</label>
                <input type="text" id="setLocShort" class="bo-input" value="${c.location.short.replace(/"/g, '&quot;')}" />
              </div>
              <div class="bo-form-group">
                <label>Instagram URL</label>
                <input type="text" id="setInsta" class="bo-input" value="${c.socials.instagram.replace(/"/g, '&quot;')}" />
              </div>
            </div>
            <div class="bo-form-group" style="margin-top:14px;">
              <label>Full Address</label>
              <input type="text" id="setLocFull" class="bo-input" value="${c.location.full.replace(/"/g, '&quot;')}" />
            </div>
            <div class="bo-form-group" style="margin-top:14px;">
              <label>Delivery Areas (Comma separated)</label>
              <input type="text" id="setDelivAreas" class="bo-input" value="${(c.deliveryAreas || []).join(', ').replace(/"/g, '&quot;')}" />
            </div>
            <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <button type="button" class="bo-btn bo-btn-danger" onclick="resetFactoryDefaults()">
                <i class="fa-solid fa-rotate-left"></i> Reset Website Content to Factory Defaults
              </button>
              <button type="submit" class="bo-btn bo-btn-gold">
                <i class="fa-solid fa-floppy-disk"></i> Save All Settings to Live Website
              </button>
            </div>
          </div>
        </div>
      </form>
    `;
  }

  window.saveAllSiteSettings = async function (e) {
    e.preventDefault();
    ensureDeliveryZonesAndPromos();
    const chosenTheme = document.getElementById('setDefaultTheme')?.value === 'dark' ? 'dark' : 'light';
    SITE_CONFIG.defaultTheme = chosenTheme;
    localStorage.setItem('mk_theme_mode', chosenTheme);

    SITE_CONFIG.deliveryZones.forEach((z, idx) => {
      const nameVal = document.getElementById(`zone-name-${idx}`)?.value?.trim();
      const feeVal = parseFloat(document.getElementById(`zone-fee-${idx}`)?.value);
      if (nameVal) z.name = nameVal;
      if (Number.isFinite(feeVal) && feeVal >= 0) z.feeUsd = feeVal;
    });

    SITE_CONFIG.contacts.catering.whatsappNumber = document.getElementById('setCatWa').value.trim();
    SITE_CONFIG.contacts.catering.phoneDisplay = document.getElementById('setCatPhone').value.trim();
    SITE_CONFIG.contacts.restaurant.whatsappNumber = document.getElementById('setRestoWa').value.trim();
    SITE_CONFIG.contacts.restaurant.phoneDisplay = document.getElementById('setRestoPhone').value.trim();
    SITE_CONFIG.contacts.delivery.whatsappNumber = document.getElementById('setDelivWa').value.trim();
    SITE_CONFIG.contacts.delivery.phoneDisplay = document.getElementById('setDelivPhone').value.trim();

    LBP_RATE = Number(document.getElementById('setLbpRate').value) || 89500;
    SITE_CONFIG.location.hours = document.getElementById('setHours').value.trim();
    SITE_CONFIG.location.short = document.getElementById('setLocShort').value.trim();
    SITE_CONFIG.location.full = document.getElementById('setLocFull').value.trim();
    SITE_CONFIG.socials.instagram = document.getElementById('setInsta').value.trim();
    SITE_CONFIG.deliveryAreas = document
      .getElementById('setDelivAreas')
      .value.split(',')
      .map(s => s.trim())
      .filter(Boolean);

    await persistSiteConfigToServer();
    showBoToast('All website settings, delivery zones, promo codes & LBP rate saved!');
  };

  window.togglePromoCodeActive = async function (idx) {
    ensureDeliveryZonesAndPromos();
    const p = SITE_CONFIG.promoCodes[idx];
    if (!p) return;
    p.active = p.active === false;
    await persistSiteConfigToServer();
    renderActiveTab();
    showBoToast(`Promo code ${p.code} is now ${p.active ? 'ACTIVE' : 'PAUSED'}.`);
  };

  window.deletePromoCode = async function (idx) {
    ensureDeliveryZonesAndPromos();
    SITE_CONFIG.promoCodes.splice(idx, 1);
    await persistSiteConfigToServer();
    renderActiveTab();
    showBoToast('Promo code removed.');
  };

  window.openAddPromoModal = function () {
    openBoModal(
      'Create New Promo / Discount Code',
      `
        <form onsubmit="submitAddPromo(event)">
          <div class="bo-form-grid">
            <div class="bo-form-group">
              <label>Promo Code (Uppercase) *</label>
              <input type="text" id="newPromoCode" class="bo-input" placeholder="e.g., SUMMER20" style="text-transform:uppercase; font-weight:800;" required />
            </div>
            <div class="bo-form-group">
              <label>Discount Type *</label>
              <select id="newPromoType" class="bo-select">
                <option value="percent">Percentage Discount (%)</option>
                <option value="fixed">Fixed USD Amount ($)</option>
              </select>
            </div>
            <div class="bo-form-group">
              <label>Discount Value *</label>
              <input type="number" step="0.5" id="newPromoVal" class="bo-input" placeholder="e.g., 15" required />
            </div>
            <div class="bo-form-group">
              <label>Minimum Order (USD $)</label>
              <input type="number" step="1" id="newPromoMin" class="bo-input" value="20" />
            </div>
          </div>
          <div class="bo-form-group" style="margin-top:14px;">
            <label>Display Label *</label>
            <input type="text" id="newPromoLabel" class="bo-input" placeholder="e.g., 15% OFF Summer Special" required />
          </div>
          <div style="margin-top:18px; display:flex; justify-content:flex-end; gap:10px;">
            <button type="button" class="bo-btn bo-btn-outline" onclick="closeBoModal()">Cancel</button>
            <button type="submit" class="bo-btn bo-btn-gold">Save Promo Code</button>
          </div>
        </form>
      `
    );
  };

  window.submitAddPromo = async function (e) {
    e.preventDefault();
    ensureDeliveryZonesAndPromos();
    const code = document.getElementById('newPromoCode').value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    const type = document.getElementById('newPromoType').value === 'fixed' ? 'fixed' : 'percent';
    const value = Number(document.getElementById('newPromoVal').value) || 10;
    const minOrderUsd = Number(document.getElementById('newPromoMin').value) || 0;
    const label = document.getElementById('newPromoLabel').value.trim();

    SITE_CONFIG.promoCodes.push({ code, type, value, minOrderUsd, label, active: true });
    await persistSiteConfigToServer();
    closeBoModal();
    renderActiveTab();
    showBoToast(`Added promo code ${code}!`);
  };

  // ==========================================================================
  // 9. SECURITY & ADMINISTRATOR LOGIN CREDENTIALS MANAGER
  // ==========================================================================
  function buildSecurityManagerView() {
    const u = boState.adminUser || {};
    const dbInfo = boState.databaseInfo || {
      engine: 'SQLite 3 (Node.js native node:sqlite)',
      journalMode: 'WAL',
      filePath: 'data/minikitchen.sqlite',
      fileSizeKb: 48,
      tables: {
        orders: ORDERS.length,
        newOrders: ORDERS.filter(o => o.status === 'new').length,
        activeSessions: 1,
        auditLogs: (boState.auditLogs || []).length
      }
    };
    const logs = (boState.auditLogs || []).slice(0, 15);

    return `
      <div class="bo-panel" style="margin-bottom:22px;">
        <div class="bo-panel-header">
          <div>
            <div class="bo-panel-title"><i class="fa-solid fa-layer-group" style="color:var(--bo-gold);"></i> Production SQLite Relational Database Engine</div>
            <div style="font-size:0.8rem; color:var(--bo-muted);">All WhatsApp orders, catering quotes, FineDine menu items, SEO settings, and sessions are persisted in a transactional SQLite database</div>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="bo-btn bo-btn-outline" onclick="refreshFromServer()">
              <i class="fa-solid fa-arrows-rotate"></i> Refresh DB Stats
            </button>
            <label class="bo-btn bo-btn-outline" style="cursor:pointer; margin:0;">
              <i class="fa-solid fa-file-import"></i> Restore Backup (.json)
              <input type="file" accept=".json,application/json" hidden onchange="restoreSqliteBackup(this)" />
            </label>
            <button type="button" class="bo-btn bo-btn-gold" onclick="downloadSqliteBackup()">
              <i class="fa-solid fa-floppy-disk"></i> Download Full Database Backup (.json)
            </button>
          </div>
        </div>
        <div class="bo-panel-body">
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:14px;">
            <div style="background:var(--bo-bg); border:1px solid var(--bo-border); border-radius:12px; padding:14px 16px;">
              <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted);">Database Engine</div>
              <div style="font-weight:800; font-size:0.95rem; margin-top:4px; color:var(--bo-text);">${esc(dbInfo.engine)}</div>
              <div style="font-size:0.75rem; color:#16a34a; font-weight:700; margin-top:4px;"><i class="fa-solid fa-circle-check"></i> ${esc(dbInfo.journalMode)} Mode • ACID Transactions</div>
            </div>
            <div style="background:var(--bo-bg); border:1px solid var(--bo-border); border-radius:12px; padding:14px 16px;">
              <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted);">Database File & Size</div>
              <div style="font-weight:800; font-size:0.95rem; margin-top:4px; color:var(--bo-text);"><code>${esc(dbInfo.filePath)}</code></div>
              <div style="font-size:0.75rem; color:var(--bo-muted); margin-top:4px;">Size: <b>${Number(dbInfo.fileSizeKb) || 0} KB</b> + Daily Auto-Backup</div>
            </div>
            <div style="background:var(--bo-bg); border:1px solid var(--bo-border); border-radius:12px; padding:14px 16px;">
              <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted);">Stored Orders & Quotes</div>
              <div style="font-weight:800; font-size:1.25rem; margin-top:4px; color:var(--bo-text);">${Number(dbInfo.tables?.orders ?? ORDERS.length)} Records</div>
              <div style="font-size:0.75rem; color:var(--bo-gold-dark); font-weight:700; margin-top:2px;">Indexed by Date, Brand & Status</div>
            </div>
            <div style="background:var(--bo-bg); border:1px solid var(--bo-border); border-radius:12px; padding:14px 16px;">
              <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted);">Security & Audit Events</div>
              <div style="font-weight:800; font-size:1.25rem; margin-top:4px; color:var(--bo-text);">${Number(dbInfo.tables?.auditLogs ?? logs.length)} Logged</div>
              <div style="font-size:0.75rem; color:var(--bo-muted); margin-top:2px;">Active Sessions: <b>${Number(dbInfo.tables?.activeSessions || 1)}</b></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bo-panel" style="margin-bottom:22px;">
        <div class="bo-panel-header">
          <div>
            <div class="bo-panel-title"><i class="fa-solid fa-shield-halved" style="color:var(--bo-gold);"></i> Back Office Authentication & Administrator Credentials</div>
            <div style="font-size:0.8rem; color:var(--bo-muted);">Update your Back Office login username, display name, and encrypted password</div>
          </div>
          <button type="button" class="bo-btn bo-btn-danger" onclick="logoutBoSession()">
            <i class="fa-solid fa-right-from-bracket"></i> Sign Out & Lock Portal Now
          </button>
        </div>

        <div class="bo-panel-body">
          <form onsubmit="submitChangeAdminPassword(event)">
            <div class="bo-form-grid">
              <div class="bo-form-group">
                <label>Admin Login Username *</label>
                <input
                  type="text"
                  id="secAdminUsername"
                  class="bo-input"
                  value="${esc(u.username || 'admin')}"
                  required
                />
              </div>
              <div class="bo-form-group">
                <label>Administrator Display Name *</label>
                <input
                  type="text"
                  id="secAdminDisplayName"
                  class="bo-input"
                  value="${esc(u.displayName || 'Mini Kitchen Executive Admin')}"
                  required
                />
              </div>
              <div class="bo-form-group">
                <label>Current Password (Required to Authorize Changes) *</label>
                <input
                  type="password"
                  id="secCurrentPass"
                  class="bo-input"
                  placeholder="Enter your current password"
                  required
                />
              </div>
              <div class="bo-form-group">
                <label>New Password (Min 10 characters — leave blank to keep current)</label>
                <input
                  type="password"
                  id="secNewPass"
                  class="bo-input"
                  placeholder="Enter new password (optional)"
                />
              </div>
            </div>

            <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <div style="font-size:0.8rem; color:var(--bo-muted);">
                <i class="fa-solid fa-lock" style="color:var(--bo-gold);"></i> Passwords are encrypted with <b>PBKDF2-SHA512 (210,000 iterations)</b> in the SQLite <code>admin_users</code> table.
              </div>
              <button type="submit" class="bo-btn bo-btn-gold">
                <i class="fa-solid fa-key"></i> Update Administrator Credentials
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="bo-panel">
        <div class="bo-panel-header">
          <div>
            <div class="bo-panel-title"><i class="fa-solid fa-table-list" style="color:var(--bo-gold);"></i> Recent Database & Security Audit Log</div>
            <div style="font-size:0.8rem; color:var(--bo-muted);">Recorded in the SQLite <code>audit_logs</code> table</div>
          </div>
        </div>
        <div class="bo-panel-body">
          ${
            logs.length === 0
              ? '<div style="color:var(--bo-muted); font-size:0.85rem;">No audit events recorded yet.</div>'
              : `<div style="overflow-x:auto;">
                  <table style="width:100%; border-collapse:collapse; font-size:0.82rem;">
                    <thead>
                      <tr style="text-align:left; border-bottom:1px solid var(--bo-border); color:var(--bo-muted);">
                        <th style="padding:8px;">Timestamp</th>
                        <th style="padding:8px;">Actor</th>
                        <th style="padding:8px;">Event</th>
                        <th style="padding:8px;">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${logs
                        .map(
                          l => `
                        <tr style="border-bottom:1px dashed var(--bo-border);">
                          <td style="padding:8px; white-space:nowrap; color:var(--bo-muted);">${formatDateTime(l.createdAt)}</td>
                          <td style="padding:8px; font-weight:700;">${esc(l.actor)}</td>
                          <td style="padding:8px;"><code>${esc(l.action)}</code></td>
                          <td style="padding:8px; color:var(--bo-muted);">${esc(l.details)}</td>
                        </tr>`
                        )
                        .join('')}
                    </tbody>
                  </table>
                </div>`
          }
        </div>
      </div>
    `;
  }

  window.downloadSqliteBackup = async function () {
    try {
      const res = await fetch('/api/db/export', {
        headers: getAuthHeaders(),
        credentials: 'same-origin'
      });
      if (!res.ok) throw new Error('Backup failed');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `minikitchen-sqlite-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      showBoToast('Downloaded full SQLite database snapshot!');
    } catch (e) {
      showBoToast('Could not download SQLite backup.');
    }
  };

  window.restoreSqliteBackup = function (fileInput) {
    const file = fileInput && fileInput.files && fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function () {
      try {
        const snapshot = JSON.parse(String(reader.result || '{}'));
        showBoToast('Restoring SQLite database backup...');
        const res = await fetch('/api/db/import', {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'same-origin',
          body: JSON.stringify({ snapshot })
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          showBoToast(data.error || 'Could not restore database backup.');
          return;
        }
        await refreshFromServer(true);
        showBoToast(`Database restored! Imported ${data.ordersImported || 0} order(s).`);
      } catch (err) {
        showBoToast('Invalid JSON backup file.');
      } finally {
        fileInput.value = '';
      }
    };
    reader.readAsText(file);
  };

  window.submitChangeAdminPassword = async function (e) {
    e.preventDefault();
    const newUsername = document.getElementById('secAdminUsername').value.trim();
    const newDisplayName = document.getElementById('secAdminDisplayName').value.trim();
    const currentPassword = document.getElementById('secCurrentPass').value;
    const newPassword = document.getElementById('secNewPass').value;

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify({
          currentPassword,
          newUsername,
          newDisplayName,
          newPassword
        })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showBoToast(data.error || 'Could not update credentials.');
        return;
      }
      setAuthenticatedUiState(true, data.user);
      document.getElementById('secCurrentPass').value = '';
      document.getElementById('secNewPass').value = '';
      await refreshFromServer(true);
      showBoToast('Administrator credentials updated in SQLite database!');
    } catch (err) {
      showBoToast('Server unreachable. Credentials could not be updated.');
    }
  };

  window.resetFactoryDefaults = async function () {
    localStorage.removeItem('mk_custom_site_config_v3');
    localStorage.removeItem('mk_custom_menu_data_v3');
    localStorage.removeItem('mk_custom_lbp_rate_v1');
    SITE_CONFIG = cloneObj(window.MK_SITE_CONFIG);
    MENU_CATEGORIES = cloneObj(window.MK_MENU_CATEGORIES);
    LBP_RATE = 89500;

    try {
      await fetch('/api/reset', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ target: 'all' })
      });
    } catch (e) {}

    renderActiveTab();
    showBoToast('Website menus & settings restored to factory defaults.');
  };

  // ==========================================================================
  // MODAL & TOAST UTILITIES
  // ==========================================================================
  function openBoModal(title, bodyHtml) {
    const backdrop = document.getElementById('boModalBackdrop');
    const dialog = document.getElementById('boModalDialog');
    if (!backdrop || !dialog) return;

    dialog.innerHTML = `
      <div class="bo-modal-header">
        <h3 style="font-family:var(--font-serif); font-size:1.25rem; margin:0;">${title}</h3>
        <button type="button" onclick="closeBoModal()" style="background:none; border:none; color:#fff; font-size:1.1rem; cursor:pointer;">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="bo-modal-body">${bodyHtml}</div>
    `;
    backdrop.classList.add('open');
  }

  window.closeBoModal = function () {
    document.getElementById('boModalBackdrop')?.classList.remove('open');
  };

  function showBoToast(msg) {
    let t = document.getElementById('boToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'boToast';
      t.style.cssText =
        'position:fixed; bottom:24px; right:24px; background:#14171c; color:#fff; border:1px solid #c59b27; padding:13px 20px; border-radius:12px; font-weight:700; font-size:0.86rem; z-index:6000; box-shadow:0 14px 35px rgba(0,0,0,0.3); transition:opacity 0.25s ease;';
      document.body.appendChild(t);
    }
    t.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#1da851; margin-right:8px;"></i> ${msg}`;
    t.style.opacity = '1';
    clearTimeout(window.__boToastTimer);
    window.__boToastTimer = setTimeout(() => {
      t.style.opacity = '0';
    }, 2800);
  }

  // ==========================================================================
  // INITIALIZE BACK OFFICE ON DOM READY
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    const savedUiTheme = localStorage.getItem('mk_bo_ui_theme') || 'light';
    applyBoWorkspaceTheme(savedUiTheme);

    verifyBoSessionOnLoad();
    refreshFromServer(true);

    // Real-time cross-tab listener when a customer submits an order on the main website
    window.addEventListener('storage', e => {
      if (e.key === 'mk_backoffice_orders_v1') {
        ORDERS = loadLocal('mk_backoffice_orders_v1') || ORDERS;
        knownOrderIds = new Set(ORDERS.map(o => o.id));
        updateNavBadges();
        renderActiveTab();
        playNewOrderChime();
        showBoToast('🔔 New WhatsApp Order / Inquiry received from the website!');
      }
    });

    // Poll server every 8 seconds for new orders placed from other devices/tabs
    setInterval(() => {
      if (boState.authenticated) {
        refreshFromServer(true);
      }
    }, 8000);
  });
})();
