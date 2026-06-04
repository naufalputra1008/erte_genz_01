# Portal RT — Informasi Warga

Aplikasi web untuk menampilkan informasi RT secara live dan aktual kepada warga.

## Fitur

- **Beranda** — Ringkasan statistik warga, kegiatan, dan keuangan
- **Kegiatan RT** — Jadwal dan informasi kegiatan
- **Visi & Misi** — Profil RT dan pengurus
- **Data Warga** — Daftar warga dengan pencarian dan filter
- **Keuangan RT** — Pemasukan, pengeluaran, dan saldo transparan
- **Panel Admin** — Kelola semua data (login email & password)
- **Live Update** — Data diperbarui otomatis setiap 10 detik

## Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Admin

Akses panel admin di `/admin`. Login dengan **Email + Password**.

### Konfigurasi

```bash
cp .env.example .env.local
# Isi ADMIN_EMAIL dan ADMIN_PASSWORD_HASH (hash bcrypt password admin)
```

| Variable | Keterangan |
|----------|------------|
| `ADMIN_EMAIL` | Email admin |
| `ADMIN_PASSWORD_HASH` | Hash bcrypt password |

Generate hash:

```bash
node -e "console.log(require('bcryptjs').hashSync('password-anda', 10))"
```

Di `.env.local`, escape setiap `$` menjadi `\$` pada hash (Next.js memproses `$` sebagai variabel).

## Tech Stack

- Next.js 16 + React 19
- Tailwind CSS 4
- SQLite (better-sqlite3)
- TypeScript
