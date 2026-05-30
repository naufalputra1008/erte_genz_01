# Portal RT — Informasi Warga

Aplikasi web untuk menampilkan informasi RT secara live dan aktual kepada warga.

## Fitur

- **Beranda** — Ringkasan statistik warga, kegiatan, dan keuangan
- **Kegiatan RT** — Jadwal dan informasi kegiatan
- **Visi & Misi** — Profil RT dan pengurus
- **Data Warga** — Daftar warga dengan pencarian dan filter
- **Keuangan RT** — Pemasukan, pengeluaran, dan saldo transparan
- **Panel Admin** — Kelola semua data (dilindungi PIN)
- **Live Update** — Data diperbarui otomatis setiap 10 detik

## Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Admin

Akses panel admin di `/admin`. Login 2 langkah: **Email + Password**, lalu **OTP via Email**.

### Kredensial default (development)

- Email: `admin@tamanbalaraja.rt`
- Password: `AdminRT2026!`

### Konfigurasi

```bash
cp .env.example .env.local
```

| Variable | Keterangan |
|----------|------------|
| `ADMIN_EMAIL` | Email admin |
| `ADMIN_PASSWORD_HASH` | Hash bcrypt password |
| `SMTP_HOST` | Server SMTP (mis. smtp.gmail.com) |
| `SMTP_PORT` | Port SMTP (biasanya 587) |
| `SMTP_USER` | Username/email SMTP |
| `SMTP_PASS` | Password SMTP |
| `SMTP_FROM` | Alamat pengirim (opsional) |
| `OTP_MOCK` | `true` = tampilkan OTP di layar tanpa SMTP |

Development: set `OTP_MOCK=true` untuk melihat OTP langsung di halaman login. Production: konfigurasi SMTP agar OTP dikirim ke email admin.

## Tech Stack

- Next.js 16 + React 19
- Tailwind CSS 4
- SQLite (better-sqlite3)
- TypeScript
