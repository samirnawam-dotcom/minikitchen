# Mini Kitchen — Catering, Restaurant & Delivery (Production Web Platform & Back Office CRM)

Official multi-brand hospitality website and executive Back Office CRM for **Mini Kitchen** (**Ain Al Remmaneh, Aley, Mount Lebanon** — `minikitchencatering.com`), powered by **Node.js** and a built-in **SQLite 3 Relational Database (`node:sqlite` in WAL mode)** with zero external npm dependencies.

---

## 1. Architecture & Directory Structure

```text
mini-kitchen-catering/
├── server.js                  # Production HTTP server with security headers, Slowloris timeouts & graceful WAL shutdown
├── package.json               # Build, start, dev & verification scripts (Node >= 22.5 / Node 24)
├── Dockerfile                 # Production container image (node:24-alpine, non-root user, healthcheck)
├── .env.example               # Production environment variable template
├── scripts/
│   └── build-pages.js         # Syncs & cache-busts all 6 brand HTML pages (UTF-8 no BOM)
├── src/
│   ├── config.js              # Environment-driven configuration loader (.env support)
│   ├── db.js                  # Native SQLite 3 database engine (WAL mode, ACID transactions, auto-backups)
│   ├── security.js            # PBKDF2-SHA512 (210k iterations), HttpOnly cookies, CSRF check, CSP & rate limiters
│   ├── api.js                 # REST API router (/api/auth/*, /api/orders/*, /api/menu, /api/site-config, /api/db/*)
│   ├── static.js              # Hardened /public static server (Brotli/Gzip, ETag/304, path-traversal isolation)
│   └── demo-data.js           # Development sample orders (disabled automatically in production)
├── data/
│   ├── minikitchen.sqlite     # Live SQLite 3 relational database (WAL mode)
│   └── backups/               # Automatic daily rotating SQLite database snapshots
└── public/                    # Isolated public web root (no backend or database files exposed)
    ├── index.html             # 1. Mini Kitchen Catering (Weddings, Corporate & Private Events)
    ├── catering-menus.html    # Catering Packages ($35–$75/guest) & FineDine Catering Menu (QR Menu #1)
    ├── restaurant.html        # 2. Mini Kitchen Restaurant — Aley Terrace & Dine-In QR Menu (QR Menu #2)
    ├── delivery.html          # 3. Mini Kitchen Delivery — 239+ Dishes & WhatsApp Cart (QR Menu #3)
    ├── about.html             # 4. About Us — Culinary Story, Chefs & Kitchen Brigade
    ├── contact.html           # 5. Contact Us — Direct WhatsApp Lines, Event Form & Aley Map
    ├── admin.html             # Protected Executive Back Office, WhatsApp CRM, SEO & SQLite Manager
    ├── 404.html               # Branded 404 Not Found page
    ├── favicon.svg            # Mini Kitchen Champagne Gold crest icon
    ├── manifest.webmanifest   # Progressive Web App manifest
    ├── robots.txt             # Search engine crawler directives
    ├── sitemap.xml            # Multi-page XML sitemap
    ├── css/                   # Storefront (Light/Dark theme) & Back Office stylesheets
    └── js/                    # Storefront & Back Office controllers + 239-item menu dataset
```

---

## 2. SQLite Relational Database Schema (`data/minikitchen.sqlite`)

All website and Back Office data is persisted in `data/minikitchen.sqlite` using Node's native `node:sqlite` (`DatabaseSync`) with `PRAGMA journal_mode = WAL`:

| Table                | Purpose                                                                                                                                                                                             |
| :------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`orders`**         | Stores all customer WhatsApp delivery orders, wedding/catering quote requests, restaurant table reservations, and manual phone orders. Indexed by `created_at DESC`, `status`, `type`, and `brand`. |
| **`settings`**       | Key-value JSON store for `lbpRate`, `orderSeq`, `siteConfig` (contacts, galleries, packages, live stations, SEO metadata), and `menuCategories` (22 categories / 239+ dishes).                      |
| **`admin_users`**    | Stores administrator credentials encrypted with **PBKDF2-SHA512 (210,000 iterations)** and per-user random salts.                                                                                   |
| **`admin_sessions`** | Stores **SHA-256 hashes** of active session tokens (raw tokens are never stored on disk) with expiration timestamps, IP, and User-Agent metadata.                                                   |
| **`audit_logs`**     | Immutable security and operational audit trail recording logins, failed login attempts, password changes, order mutations, menu edits, and database exports.                                        |

---

## 3. Security Hardening Summary

- **Web Root Isolation:** Only files inside `public/` can ever be served over HTTP. Requests for `/server.js`, `/src/*`, or `/data/minikitchen.sqlite` are blocked with `404 Not Found`.
- **Customer PII Privacy:** `GET /api/state` only returns `orders` and `auditLogs` when the request carries a valid administrator session; public visitors receive only storefront configuration and menu data.
- **Password & Session Security:** Passwords use asynchronous **PBKDF2-SHA512 (210,000 iterations)** with `crypto.timingSafeEqual`. Sessions use `HttpOnly; SameSite=Strict` cookies (plus `Bearer` token support) and store only SHA-256 token hashes in SQLite.
- **Brute-Force & Abuse Rate Limiting:** Dedicated per-IP and per-account rate limiters protect `/api/auth/login`, `/api/orders`, and `/api/*`.
- **XSS & Mass-Assignment Protection:** Server-side input sanitization (`sanitizeContentTree`, control-character stripping, strict field whitelists on `POST /api/orders` and `PATCH /api/orders/:id`) paired with client-side HTML escaping (`esc()`) in `public/js/admin.js`.
- **HTTP Security Headers:** `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security` (over HTTPS).

---

## 4. Running & Deploying

### Local Development / Production Server

```bash
# 1. Sync & fingerprint HTML pages and verify syntax
npm run verify

# 2. Start the server (http://localhost:3000)
npm start
```

### Docker Deployment

```bash
docker build -t mini-kitchen-catering .
docker run -d -p 3000:3000 -v minikitchen_data:/app/data --name minikitchen mini-kitchen-catering
```

### Back Office Access

- **URL:** `http://localhost:3000/admin.html`
- **Default Login:** Username `admin` / Password `minikitchen2026` (can be updated anytime inside the **Security & Admin Login** tab or via `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `.env`).
