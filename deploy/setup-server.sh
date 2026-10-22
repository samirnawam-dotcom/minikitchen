#!/usr/bin/env bash
# One-time setup for a fresh Ubuntu 22.04/24.04 server (Oracle Cloud Always Free, Google e2-micro, any VPS).
# Usage (on the server): bash setup-server.sh
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/minikitchen}"

echo "==> Installing Docker"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
fi

echo "==> Opening ports 80 and 443 in the OS firewall"
# Oracle's Ubuntu images ship iptables rules that block everything except SSH.
if sudo iptables -S INPUT 2>/dev/null | grep -q REJECT; then
  for port in 80 443; do
    sudo iptables -C INPUT -p tcp --dport "$port" -j ACCEPT 2>/dev/null ||
      sudo iptables -I INPUT 5 -p tcp --dport "$port" -j ACCEPT
  done
  sudo iptables -C INPUT -p udp --dport 443 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 5 -p udp --dport 443 -j ACCEPT
  sudo apt-get install -y iptables-persistent >/dev/null
  sudo netfilter-persistent save
fi
if command -v ufw >/dev/null 2>&1 && sudo ufw status | grep -q active; then
  sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw allow 443/udp
fi

echo "==> Creating swap (helps the 1 GB RAM free VMs build the image)"
if ! sudo swapon --show | grep -q /swapfile; then
  sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
  sudo mkswap /swapfile >/dev/null && sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

mkdir -p "$APP_DIR/deploy/data"
# The app container runs as the 'node' user (uid 1000).
sudo chown -R 1000:1000 "$APP_DIR/deploy/data"

echo
echo "Done. Next:"
echo "  1. Log out and back in (so your user can run docker)."
echo "  2. Create $APP_DIR/deploy/.env from deploy/.env.example and set ADMIN_PASSWORD."
echo "  3. Push to main (GitHub Actions deploys), or run: cd $APP_DIR/deploy && docker compose up -d --build"
