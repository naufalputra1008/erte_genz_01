#!/usr/bin/env bash
# Deploy dari Mac ke VPS production
# Jalankan: ssh-add ~/.ssh/id_ed25519 && bash deploy/push-production.sh

set -euo pipefail

VPS_USER="naufalputra"
VPS_HOST="103.93.163.224"
APP_DIR="/var/www/rtgenz01"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

SSH_OPTS=(-i "$SSH_KEY" -o IdentitiesOnly=yes -o ConnectTimeout=30)

echo "==> Cek koneksi SSH..."
ssh "${SSH_OPTS[@]}" "${VPS_USER}@${VPS_HOST}" 'echo SSH OK'

echo "==> Sync kode ke VPS (tanpa .env.local, data, uploads)..."
rsync -az --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude standalone-release \
  --exclude data \
  --exclude public/uploads \
  --exclude .env.local \
  --exclude .git \
  --exclude exports \
  -e "ssh ${SSH_OPTS[*]}" \
  "${LOCAL_DIR}/" \
  "${VPS_USER}@${VPS_HOST}:${APP_DIR}/"

echo "==> Build & restart di VPS..."
ssh "${SSH_OPTS[@]}" "${VPS_USER}@${VPS_HOST}" "cd ${APP_DIR} && bash deploy/deploy.sh"

echo "==> Verifikasi..."
ssh "${SSH_OPTS[@]}" "${VPS_USER}@${VPS_HOST}" \
  'pm2 status | grep portal-rt; curl -sI http://127.0.0.1:3000 | head -3'

echo ""
echo "Deploy selesai: https://rtgenz01tamanbalaraja.id"
echo "Pastikan .env.local di VPS berisi ADMIN_EMAIL, ADMIN_PASSWORD_HASH, KEUANGAN_PASSWORD_HASH, dan URL Instagram/YouTube (NEXT_PUBLIC_*)."
