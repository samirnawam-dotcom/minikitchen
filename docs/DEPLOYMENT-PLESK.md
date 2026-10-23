# Deploying on a Plesk server

For servers managed with **Plesk** (no root/sudo needed). Plesk runs the app with its built-in Node.js support
(Phusion Passenger) behind its own nginx, and handles the domain and the free Let's Encrypt certificate. Docker is
not used, so other sites on the same server are not affected.

Requirements: Plesk with the **NodeJS support** and **Phusion Passenger** components (Tools & Settings → Updates →
Add/Remove Components → Web hosting) and Node.js **20.12 or newer**. On Node 20/21 the app uses the `better-sqlite3`
package for its database (installed by step 3); on Node 22.13+ it uses Node's built-in SQLite.

The examples use the subscription `restbits.online` and the domain `minikitchen.restbits.online`.

## 1. Get the code onto the server

Open **Websites & Domains → minikitchen.restbits.online → SSH Terminal** (or SSH in as the subscription user) and run:

```bash
git clone https://github.com/samirnawam-dotcom/minikitchen.git ~/minikitchen-app
```

This creates `/var/www/vhosts/restbits.online/minikitchen-app`. (Already done? Run `cd ~/minikitchen-app && git pull`.)

## 2. Configure the Node.js app in Plesk

**Websites & Domains → minikitchen.restbits.online → Node.js**, then click **Enable Node.js** and set:

| Setting                  | Value                          |
| :----------------------- | :----------------------------- |
| Node.js Version          | the newest offered (e.g. 20.x) |
| Package Manager          | npm                            |
| Document Root            | `/minikitchen-app/public`      |
| Application Mode         | production                     |
| Application Root         | `/minikitchen-app`             |
| Application Startup File | `server.js`                    |

Under **Custom environment variables**, click **specify** and add:

| Variable         | Value                                      |
| :--------------- | :----------------------------------------- |
| `NODE_ENV`       | `production`                               |
| `ADMIN_PASSWORD` | your Back Office password (10+ characters) |
| `TRUST_PROXY`    | `1`                                        |
| `SITE_URL`       | `https://minikitchen.restbits.online`      |

Click **OK** to save.

> `ADMIN_PASSWORD` is only used the first time, when the database is created. Change it later in the Back Office
> (**Account** tab) or with `node scripts/reset-admin-password.js 'NEW-PASSWORD'` from the app folder.

## 3. Install the database driver and start

On the same Node.js page click **NPM install**, wait for it to finish, then click **Restart App**.

Open `https://minikitchen.restbits.online` — the website — and `https://minikitchen.restbits.online/admin` to sign
in as `admin` with your password.

## 4. HTTPS

**Websites & Domains → minikitchen.restbits.online → SSL/TLS Certificates → Install** a free Let's Encrypt
certificate, then in **Hosting Settings** tick **Permanent SEO-safe 301 redirect from HTTP to HTTPS**.

## Updating to a new version

```bash
cd ~/minikitchen-app && git pull
```

Then **Node.js → NPM install** (only needed if `package.json` changed) and **Restart App**.

## Where things are

| What                   | Where                                              |
| :--------------------- | :------------------------------------------------- |
| Database               | `~/minikitchen-app/data/minikitchen.sqlite`        |
| Daily database backups | `~/minikitchen-app/data/backups/` (kept 14 days)   |
| Uploaded photos        | `~/minikitchen-app/data/uploads/`                  |
| App logs               | Node.js page → the log link, or `~/logs/` in Plesk |

`data/` is outside the document root, so it is never served to visitors, and `git pull` never touches it.

## Troubleshooting

- **"No SQLite driver available"** in the log: click **NPM install** on the Node.js page, then **Restart App**.
- **"ADMIN_PASSWORD must be set"**: add the `ADMIN_PASSWORD` environment variable (step 2) and restart.
- **Plesk's default page still shows**: the Document Root must be `/minikitchen-app/public`; remove any old
  `index.html` from the domain's previous folder if it is still selected.
- **Check the app directly** from the SSH terminal, after **NPM install**. This uses a throw-away database in
  `/tmp`, so it cannot affect the real one:
  ```bash
  cd ~/minikitchen-app && DATA_DIR=/tmp/mk-check ADMIN_PASSWORD=test-password-1 PORT=3999 /opt/plesk/node/20/bin/node server.js
  ```
  then press Ctrl+C. Errors are printed in the terminal.
