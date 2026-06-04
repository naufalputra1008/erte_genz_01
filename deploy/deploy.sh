#!/usr/bin/env bash
# Deploy / update aplikasi Portal RT di VPS
# Jalankan dari /var/www/rtgenz01: bash deploy/deploy.sh

set -euo pipefail

APP_DIR="/var/www/rtgenz01"
cd "$APP_DIR"

echo "==> Install dependencies..."
export CXX=g++-10
npm ci

echo "==> Build Next.js..."
rm -rf standalone-release
npm run build

echo "==> Siapkan standalone server..."
rm -rf standalone-release
mkdir -p standalone-release

cp -r .next/standalone/. standalone-release/
mkdir -p standalone-release/.next
cp -r .next/static standalone-release/.next/static
mkdir -p standalone-release/public

# Data & upload persisten di luar release
mkdir -p standalone-release/public
mkdir -p data public/uploads/kegiatan
rm -rf standalone-release/data standalone-release/public/uploads
ln -sfn "$APP_DIR/data" standalone-release/data
ln -sfn "$APP_DIR/public/uploads" standalone-release/public/uploads

if [ -f .env.local ]; then
  cp .env.local standalone-release/.env.local
fi

# Standalone bundles its own better-sqlite3 copy; copy compiled native binary
if [ -f node_modules/better-sqlite3/build/Release/better_sqlite3.node ]; then
  mkdir -p standalone-release/node_modules/better-sqlite3/build/Release
  cp node_modules/better-sqlite3/build/Release/better_sqlite3.node \
    standalone-release/node_modules/better-sqlite3/build/Release/
fi

echo "==> Restart PM2..."
pm2 delete portal-rt 2>/dev/null || true
pm2 start "$APP_DIR/deploy/ecosystem.config.cjs"
pm2 save
pm2 startup systemd -u "$USER" --hp "$HOME" 2>/dev/null || true

echo ""
echo "Deploy selesai. Cek: pm2 status && curl -I http://127.0.0.1:3000"
