# Deploy Portal RT ke Biznet Gio VPS

Panduan deploy **rtgenz01tamanbalaraja.id** menggunakan VPS Biznet Gio.

> **Catatan:** Aplikasi ini membutuhkan **VPS** (Node.js + SQLite + upload foto). Shared hosting/cPanel saja **tidak** cocok.

## Ringkasan arsitektur

```
Pengunjung → DNS (rtgenz01tamanbalaraja.id) → VPS Biznet Gio
                                              → Nginx (port 443/SSL)
                                              → Next.js via PM2 (port 3000)
                                              → SQLite (data/) + Upload (public/uploads/)
```

---

## 1. Siapkan VPS di Biznet Gio

1. Login [Biznet Gio Console](https://console.biznetgio.com/)
2. Buat VPS baru (rekomendasi: **Ubuntu 22.04 LTS**, min. **1 vCPU / 1 GB RAM**)
3. Catat **IP Public** VPS
4. Tambahkan **SSH Key** atau password root

---

## 2. Atur DNS domain

Di panel DNS domain **rtgenz01tamanbalaraja.id** (Bizznet/registrar):

| Tipe | Host | Value | TTL |
|------|------|-------|-----|
| A | `@` | `IP_VPS_ANDA` | 300 |
| A | `www` | `IP_VPS_ANDA` | 300 |

Tunggu propagasi DNS (5–30 menit). Cek:

```bash
dig +short rtgenz01tamanbalaraja.id
```

---

## 3. SSH ke VPS

```bash
ssh root@IP_VPS_ANDA
```

---

## 4. Setup server (sekali)

```bash
git clone https://github.com/naufalputra1008/erte_genz_01.git /var/www/rtgenz01
cd /var/www/rtgenz01
chmod +x deploy/*.sh
sudo bash deploy/setup-server.sh
```

---

## 5. Konfigurasi environment

```bash
cd /var/www/rtgenz01
cp .env.production.example .env.local
nano .env.local
```

**Wajib ubah di production:**
- `ADMIN_PASSWORD_HASH` — hash password admin baru
- `OTP_MOCK=false`
- Isi `SMTP_*` untuk OTP email

Generate hash password:

```bash
node -e "console.log(require('bcryptjs').hashSync('PasswordBaruAnda', 10))"
```

---

## 6. Deploy aplikasi

```bash
cd /var/www/rtgenz01
bash deploy/deploy.sh
```

Cek aplikasi jalan:

```bash
pm2 status
curl -I http://127.0.0.1:3000
```

---

## 7. Nginx + SSL (HTTPS)

Pastikan DNS sudah mengarah ke IP VPS, lalu:

```bash
cd /var/www/rtgenz01
sudo bash deploy/setup-nginx-ssl.sh
```

Buka: **https://rtgenz01tamanbalaraja.id**

---

## Update setelah ada perubahan kode

Di VPS:

```bash
cd /var/www/rtgenz01
git pull origin main
bash deploy/deploy.sh
```

---

## Perintah berguna

```bash
pm2 logs portal-rt      # Lihat log
pm2 restart portal-rt   # Restart app
pm2 status              # Status proses
sudo nginx -t           # Test config Nginx
sudo certbot renew      # Perpanjang SSL (auto via cron)
```

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Situs tidak bisa diakses | Cek `pm2 status`, `sudo systemctl status nginx` |
| Error 502 Bad Gateway | App belum jalan — `pm2 restart portal-rt` |
| SSL gagal | Pastikan DNS A record sudah benar |
| Upload foto gagal | Cek permission `public/uploads/kegiatan` |
| OTP tidak terkirim | Cek SMTP di `.env.local`, set `OTP_MOCK=false` |

---

## Push kode ke GitHub (dari komputer lokal)

```bash
cd /Users/naufalputra/erte_genz_01
git add .
git commit -m "Siapkan deploy production Biznet Gio"
git push origin main
```

Lalu deploy ulang di VPS dengan `git pull` + `bash deploy/deploy.sh`.
