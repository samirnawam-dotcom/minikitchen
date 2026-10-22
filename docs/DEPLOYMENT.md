# Deploying Mini Kitchen for free

The site runs on one small Linux server with Docker. **Oracle Cloud's Always Free tier** is the recommended host:
it costs $0 indefinitely, stays on 24/7 and has a real disk, so the SQLite database, uploaded photos and admin
login are kept. (Free "platform" hosts such as Render's free tier wipe the disk on every restart.)

```text
Visitor ──HTTPS──▶ Caddy (ports 80/443, free Let's Encrypt certificate) ──▶ Node app (port 3000) ──▶ deploy/data/
```

Every push to `main` is tested and deployed automatically by `.github/workflows/deploy.yml`.

---

## 1. Create the free server (one time, ~15 minutes)

1. Sign up at <https://www.oracle.com/cloud/free/>. A card is required for identity checks; Always Free resources are
   never charged. Pick a home region close to Lebanon (e.g. _Frankfurt_, _Milan_ or _Marseille_).
2. **Compute → Instances → Create instance**
   - Image: **Ubuntu 24.04**
   - Shape: **VM.Standard.A1.Flex** (Ampere, Always Free) with 1 OCPU / 6 GB RAM.
     If A1 capacity is unavailable, use **VM.Standard.E2.1.Micro** (also Always Free).
   - Networking: keep "Assign a public IPv4 address".
   - SSH keys: **Generate a key pair** and download **both** keys. Keep the private key safe.
3. Note the instance's **Public IP address**.
4. Open the web ports: on the instance page click the **Subnet → Default Security List → Add Ingress Rules**:
   - Source CIDR `0.0.0.0/0`, IP protocol TCP, destination port `80,443`
   - Source CIDR `0.0.0.0/0`, IP protocol UDP, destination port `443`

> Any other Ubuntu server works the same way (Google Cloud e2-micro free tier, a paid VPS…).

## 2. Prepare the server (one time)

From your computer (replace the key file and IP):

```bash
ssh -i ~/Downloads/ssh-key.key ubuntu@YOUR_SERVER_IP
```

On the server:

```bash
mkdir -p ~/minikitchen/deploy
curl -fsSL https://raw.githubusercontent.com/samirnawam-dotcom/minikitchen/main/deploy/setup-server.sh -o setup-server.sh
bash setup-server.sh          # installs Docker, opens ports 80/443, adds swap
exit                          # log out and back in so Docker works without sudo
```

> If the repository is private the `curl` above returns 404. Copy the script instead:
> `scp -i ~/Downloads/ssh-key.key deploy/setup-server.sh ubuntu@YOUR_SERVER_IP:`

Create the server's settings file:

```bash
ssh -i ~/Downloads/ssh-key.key ubuntu@YOUR_SERVER_IP
nano ~/minikitchen/deploy/.env
```

Paste the contents of [`deploy/.env.example`](../deploy/.env.example) and set:

- `ADMIN_PASSWORD` — your Back Office password (at least 10 characters).
- `SITE_ADDRESS` — use `:80` for now if your domain does not point at the server yet.

## 3. Connect GitHub Actions (one time)

In GitHub: **Settings → Secrets and variables → Actions**

| Type     | Name              | Value                                                    |
| :------- | :---------------- | :------------------------------------------------------- |
| Secret   | `SSH_HOST`        | The server's public IP                                   |
| Secret   | `SSH_USER`        | `ubuntu`                                                 |
| Secret   | `SSH_PRIVATE_KEY` | The full contents of the private key file you downloaded |
| Variable | `DEPLOY_ENABLED`  | `true`                                                   |

Then go to **Actions → Deploy → Run workflow** (or merge anything into `main`). The first build takes a few
minutes. Open `http://YOUR_SERVER_IP` to check the site, and `/admin` to sign in.

## 4. Point the domain at the server

At your domain registrar, create DNS records for `minikitchencatering.com`:

| Type | Name  | Value          |
| :--- | :---- | :------------- |
| A    | `@`   | YOUR_SERVER_IP |
| A    | `www` | YOUR_SERVER_IP |

When `ping minikitchencatering.com` shows the server IP, set in `~/minikitchen/deploy/.env`:

```env
SITE_ADDRESS=minikitchencatering.com, www.minikitchencatering.com
```

and restart: `cd ~/minikitchen/deploy && docker compose up -d`. Caddy fetches the HTTPS certificate automatically.

---

## Day-to-day

| Task                       | Command (on the server, in `~/minikitchen/deploy`)                       |
| :------------------------- | :----------------------------------------------------------------------- |
| View logs                  | `docker compose logs -f app`                                             |
| Restart                    | `docker compose restart app`                                             |
| Status                     | `docker compose ps`                                                      |
| Download a database backup | from your computer: `scp -r ubuntu@IP:minikitchen/deploy/data/backups .` |

The app snapshots the database daily into `deploy/data/backups/` (kept 14 days). The Back Office
**Database** tab can also export a JSON backup. Copy a backup off the server now and then.

### Forgot the admin password?

```bash
cd ~/minikitchen/deploy
docker compose exec app node scripts/reset-admin-password.js 'NEW-PASSWORD-HERE'
```
