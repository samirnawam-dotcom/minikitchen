# Mini Kitchen — Catering, Restaurant & Delivery

Website and Back Office for **Mini Kitchen** (Ain Al Remmaneh, Aley, Mount Lebanon — `minikitchencatering.com`).

- **Storefront:** catering, catering menus, restaurant (QR table menu), delivery (WhatsApp cart), about and contact pages.
- **Back Office (`/admin`):** orders and WhatsApp leads, kitchen display, menu and price editor, website content and
  SEO settings, database backup/restore, admin account.
- **Stack:** Node.js (≥ 22.13) with the built-in `node:sqlite` database. No runtime npm dependencies.

## Quick start

```bash
npm install          # dev tools only (ESLint, Prettier, Playwright)
npm run dev          # http://localhost:3000 — restarts on file changes
```

On first start in development an admin password is generated and printed in the console. Set `ADMIN_PASSWORD`
(see [`.env.example`](.env.example)) to choose your own. Demo orders are seeded in development only.

| Command            | What it does                                                  |
| :----------------- | :------------------------------------------------------------ |
| `npm start`        | Run the server                                                |
| `npm test`         | API, static-server and security tests (`node:test`)           |
| `npm run test:e2e` | Headless-browser smoke test of every page and Back Office tab |
| `npm run lint`     | ESLint                                                        |
| `npm run format`   | Prettier                                                      |
| `npm run check`    | Lint + format check + tests (what CI runs)                    |

## Project layout

```text
server.js               Entry point: initialises the database and starts the HTTP server
src/
  app.js                Request handler: security headers, HTTPS redirect, API vs. static routing
  config.js             Settings from environment variables / .env
  db.js                 SQLite schema, queries, migrations and daily backups
  security.js           Password hashing, cookies, proxy-aware IP, rate limiter, CSP, input sanitising
  pages.js              Renders views/*.html with per-page SEO tags and fingerprinted asset URLs
  static.js             Serves pages, public/ files and uploads (Brotli/Gzip, ETag, traversal-safe)
  demo-data.js          Sample orders for development
  api/
    index.js            Route table and error handling
    http.js             JSON responses and body parsing
    session.js          Cookie sessions
    auth.js             Login, logout, current user, change password
    orders.js           Order creation, tracking, updates
    content.js          Site settings, menu, public state
    database.js         Backup export/import, status
    uploads.js          Image uploads
views/                  HTML templates (storefront.html is shared by all six storefront pages)
public/
  js/storefront/        Website: main.js entry, state, api, cart, menu, dish modal, tracker, i18n, pages/*
  js/admin/             Back Office: main.js entry, api, auth, sync, router, ui/*, orders/*, tabs/* (one per tab)
  js/shared/            actions.js (data-action event wiring), dom.js (esc, selectors), storage.js
  js/data/              Default site configuration and the 239-dish menu (ES modules)
  js/theme-init.js      Applies the saved light/dark theme before first paint
  css/storefront/       Website styles, split in cascade order (tokens → base → layout → … → dark)
  css/admin/            Back Office styles, split in cascade order
  favicon, manifest, robots.txt, sitemap.xml, 404.html
scripts/                Maintenance scripts (reset-admin-password.js)
test/                   Automated tests (e2e/ holds the browser smoke test)
deploy/                 Production Docker Compose + Caddy (HTTPS) setup
docs/DEPLOYMENT.md      Step-by-step free hosting guide
data/                   Runtime only, not in git: SQLite database, backups, uploaded images
```

## Frontend conventions

- Plain ES modules, no build step. Each page loads one entry module (`js/storefront/main.js` or `js/admin/main.js`).
- No inline scripts or `on*=""` attributes — the CSP forbids them. Wire events declaratively and register handlers:

  ```html
  <button data-action="cart:add" data-id="mk-item-12">Add</button>
  ```

  ```js
  import { registerActions } from '../shared/actions.js';
  registerActions({ 'cart:add': el => addToCart(el.dataset.id) });
  ```

  Also `data-on-input`, `data-on-change`, `data-on-submit` and `<img data-fallback="…">`.

- Escape every interpolated value in HTML strings with `esc()` from `js/shared/dom.js`.

## API

All endpoints are under `/api`. Admin endpoints need the session cookie set by `POST /api/auth/login`.

| Method & path                        | Access | Purpose                                             |
| :----------------------------------- | :----- | :-------------------------------------------------- |
| `GET /api/health`                    | public | Liveness check                                      |
| `GET /api/state`                     | public | Menu, site settings, LBP rate (+ orders for admins) |
| `POST /api/orders`                   | public | Record a website order / quote / reservation        |
| `GET /api/orders/track/:id`          | public | Order status for the tracker                        |
| `POST /api/auth/login` · `logout`    | public | Sign in / out                                       |
| `GET /api/auth/me`                   | admin  | Current user                                        |
| `POST /api/auth/change-password`     | admin  | Change username / password                          |
| `GET /api/orders`                    | admin  | All orders                                          |
| `PATCH` · `DELETE /api/orders/:id`   | admin  | Update / delete an order                            |
| `PUT /api/site-config` · `/api/menu` | admin  | Save website content / menu                         |
| `POST /api/reset`                    | admin  | Restore default menu / content                      |
| `POST /api/upload`                   | admin  | Upload an image (stored in `data/uploads`)          |
| `GET /api/db/status` · `export`      | admin  | Database stats / JSON backup                        |
| `POST /api/db/import`                | admin  | Restore a JSON backup                               |

## Database

`data/minikitchen.sqlite` (WAL mode):

| Table            | Contents                                                            |
| :--------------- | :------------------------------------------------------------------ |
| `orders`         | Delivery orders, catering quotes, table reservations, phone orders  |
| `settings`       | `lbpRate`, `orderSeq`, `siteConfig`, `menuCategories` (JSON values) |
| `admin_users`    | Administrator with PBKDF2-SHA512 password hash                      |
| `admin_sessions` | SHA-256 hashes of session tokens (raw tokens are never stored)      |
| `audit_logs`     | Logins, order changes, content edits, exports (last 1,000 entries)  |

A snapshot is copied to `data/backups/` daily and kept for `BACKUP_RETENTION_DAYS` (default 14).

## Security

- Only `public/`, rendered `views/` and `data/uploads/` images are served; source, templates and the database are not.
- Sessions use a random token in an `HttpOnly; SameSite=Strict` cookie; only its SHA-256 hash is stored.
- Passwords: PBKDF2-SHA512 (210,000 iterations), minimum 10 characters. There is no default password — production
  refuses to start without `ADMIN_PASSWORD` on first run.
- Rate limits on login, order submission and the API; cross-origin writes are rejected.
- `TRUST_PROXY` is a hop count: only the address added by your own proxy is trusted, so clients cannot spoof their IP.
- Content saved from the Back Office is sanitised; CSP, HSTS (over HTTPS), `nosniff` and frame protections are sent.

## Deployment

### Free preview on GitHub Pages (website only)

`.github/workflows/pages.yml` publishes a static copy of the six storefront pages to
`https://samirnawam-dotcom.github.io/minikitchen/` on every push to `main`. One-time setup: **Settings → Pages →
Build and deployment → Source: GitHub Actions**. Build it locally with `npm run build:static` (output in `dist/`).

The static copy has no server: browsing, the menu, cart, calculator and quote forms work, and orders go out via
WhatsApp, but nothing is saved to the database and the Back Office, online menu editing and order tracking are not
available. Use the server deployment below for the full system.

### Full system (server)

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for free hosting on an Oracle Cloud Always Free server with automatic
HTTPS and deploy-on-push. For any Docker host:

```bash
docker build -t minikitchen .
docker run -d -p 3000:3000 -v minikitchen_data:/app/data -e ADMIN_PASSWORD='choose-a-strong-one' minikitchen
```

Forgot the admin password: `node scripts/reset-admin-password.js 'NEW-PASSWORD'` (inside the container:
`docker compose exec app node scripts/reset-admin-password.js 'NEW-PASSWORD'`).
