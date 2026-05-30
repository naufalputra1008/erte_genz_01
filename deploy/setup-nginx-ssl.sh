#!/usr/bin/env bash
# Pasang Nginx + SSL Let's Encrypt untuk rtgenz01tamanbalaraja.id
# Jalankan di VPS setelah DNS A record mengarah ke IP server

set -euo pipefail

DOMAIN="rtgenz01tamanbalaraja.id"
APP_DIR="/var/www/rtgenz01"

cp "$APP_DIR/deploy/nginx/${DOMAIN}.conf" "/etc/nginx/sites-available/${DOMAIN}"
ln -sf "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

echo "==> Pasang SSL dengan Certbot..."
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m admin@${DOMAIN} || \
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN"

echo ""
echo "SSL selesai. Buka: https://${DOMAIN}"
