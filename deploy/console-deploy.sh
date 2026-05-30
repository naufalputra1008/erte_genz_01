#!/usr/bin/env bash
# Jalankan via Biznet Gio Web Console (paste seluruh isi file ini)
set -euo pipefail

APP_DIR="/var/www/rtgenz01"
REPO="https://github.com/naufalputra1008/erte_genz_01.git"
DOMAIN="rtgenz01tamanbalaraja.id"

echo "==> Update & install dependencies..."
sudo apt-get update -y
sudo apt-get install -y curl git nginx ufw build-essential python3-certbot-nginx

if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

sudo npm install -g pm2

echo "==> Clone / update repo..."
sudo mkdir -p "$APP_DIR"
sudo chown -R "$USER:$USER" "$APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git pull origin main
else
  git clone "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

echo "==> Environment..."
if [ ! -f .env.local ]; then
  cp .env.production.example .env.local
  sed -i 's/OTP_MOCK=true/OTP_MOCK=false/' .env.local 2>/dev/null || true
fi

chmod +x deploy/*.sh
bash deploy/deploy.sh

echo "==> Nginx..."
sudo cp deploy/nginx/${DOMAIN}.conf /etc/nginx/sites-available/${DOMAIN}
sudo ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/${DOMAIN}
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "==> Firewall..."
sudo ufw allow OpenSSH
sudo ufw allow "Nginx Full"
sudo ufw --force enable || true

echo "==> SSL (butuh DNS A record sudah mengarah ke IP ini)..."
sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m admin@${DOMAIN} || echo "SSL gagal — pastikan DNS sudah benar, jalankan ulang: sudo certbot --nginx -d $DOMAIN"

echo ""
echo "Deploy selesai!"
echo "Cek: pm2 status"
echo "Buka: http://${DOMAIN} atau https://${DOMAIN}"
