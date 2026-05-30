#!/usr/bin/env bash
# Setup awal VPS Biznet Gio (Ubuntu 22.04/24.04)
# Jalankan di server: bash setup-server.sh

set -euo pipefail

echo "==> Update sistem..."
apt-get update -y
apt-get upgrade -y

echo "==> Install dependensi..."
apt-get install -y curl git nginx ufw build-essential python3-certbot-nginx

echo "==> Install Node.js 20 LTS..."
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "==> Install PM2..."
npm install -g pm2

echo "==> Firewall..."
ufw allow OpenSSH
ufw allow "Nginx Full"
ufw --force enable

echo "==> Buat folder aplikasi..."
mkdir -p /var/www/rtgenz01
mkdir -p /var/www/rtgenz01/data
mkdir -p /var/www/rtgenz01/public/uploads/kegiatan
chown -R "$SUDO_USER:$SUDO_USER" /var/www/rtgenz01 2>/dev/null || true

echo ""
echo "Setup server selesai."
echo "Node: $(node -v) | npm: $(npm -v) | PM2: $(pm2 -v)"
echo ""
echo "Langkah berikutnya:"
echo "  1. Clone repo ke /var/www/rtgenz01"
echo "  2. Salin .env.production ke .env.local"
echo "  3. Jalankan: bash deploy/deploy.sh"
