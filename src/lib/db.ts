import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import type { ProfilRT, Kegiatan, KegiatanFoto, Warga, TransaksiKeuangan, DashboardData } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "rt.db");
export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "kegiatan");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initDb(db);
  }
  return db;
}

function initDb(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS profil_rt (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      nama_rt TEXT NOT NULL,
      nama_rw TEXT NOT NULL,
      kelurahan TEXT NOT NULL,
      kecamatan TEXT NOT NULL,
      kota TEXT NOT NULL,
      ketua TEXT NOT NULL,
      sekretaris TEXT NOT NULL,
      bendahara TEXT NOT NULL,
      visi TEXT NOT NULL,
      misi TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS kegiatan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      judul TEXT NOT NULL,
      deskripsi TEXT NOT NULL,
      tanggal TEXT NOT NULL,
      lokasi TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('rencana', 'berlangsung', 'selesai')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS warga (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      alamat TEXT NOT NULL,
      no_hp TEXT NOT NULL,
      no_ktp TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL CHECK (status IN ('aktif', 'pindah')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS keuangan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jenis TEXT NOT NULL CHECK (jenis IN ('pemasukan', 'pengeluaran')),
      kategori TEXT NOT NULL,
      deskripsi TEXT NOT NULL,
      jumlah INTEGER NOT NULL,
      tanggal TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS kegiatan_foto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kegiatan_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      size INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (kegiatan_id) REFERENCES kegiatan(id) ON DELETE CASCADE
    );
  `);

  migrateDb(database);

  const count = database.prepare("SELECT COUNT(*) as c FROM profil_rt").get() as { c: number };
  if (count.c === 0) {
    seedDb(database);
  }
}

function migrateDb(database: Database.Database) {
  const kegiatanCols = database.pragma("table_info(kegiatan)") as { name: string }[];
  if (!kegiatanCols.some((c) => c.name === "detail")) {
    database.exec("ALTER TABLE kegiatan ADD COLUMN detail TEXT NOT NULL DEFAULT ''");
  }

  const wargaCols = database.pragma("table_info(warga)") as { name: string }[];
  if (!wargaCols.some((c) => c.name === "no_ktp")) {
    database.exec("ALTER TABLE warga ADD COLUMN no_ktp TEXT NOT NULL DEFAULT ''");
  }

  database
    .prepare(
      `UPDATE profil_rt
       SET kecamatan = ?, kota = ?, updated_at = ?
       WHERE kelurahan = ? AND kecamatan = ? AND kota = ?`
    )
    .run(
      "Parahu",
      "Sukamulya, Kabupaten Tangerang",
      new Date().toISOString(),
      "Taman Balaraja",
      "Balaraja",
      "Kabupaten Tangerang"
    );
}

function seedDb(database: Database.Database) {
  const now = new Date().toISOString();

  database.prepare(`
    INSERT INTO profil_rt (id, nama_rt, nama_rw, kelurahan, kecamatan, kota, ketua, sekretaris, bendahara, visi, misi, updated_at)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "RT 01 Taman Balaraja",
    "RW 01",
    "Taman Balaraja",
    "Parahu",
    "Sukamulya, Kabupaten Tangerang",
    "Bapak H. Jasmani",
    "Ibu Siti Rahayu",
    "Bapak Budi Santoso",
    "Menjadi RT yang harmonis, transparan, dan peduli terhadap seluruh warga dengan semangat gotong royong.",
    "1. Meningkatkan keharmonisan antarwarga\n2. Mengelola keuangan RT secara transparan\n3. Mengadakan kegiatan sosial rutin\n4. Menjaga keamanan dan ketertiban lingkungan\n5. Mendorong partisipasi aktif seluruh warga",
    now
  );

  const kegiatan = [
    ["Kerja Bakti Bulanan", "Membersihkan lingkungan RT dan saluran air", "2026-06-07", "Lapangan RT", "rencana"],
    ["Rapat Warga Triwulan", "Pembahasan program kerja dan laporan keuangan", "2026-06-14", "Balai RT", "rencana"],
    ["Posyandu Balita", "Pemeriksaan kesehatan balita dan imunisasi", "2026-06-01", "Balai RT", "berlangsung"],
    ["Pembagian Sembako", "Bantuan sembako untuk warga yang membutuhkan", "2026-05-20", "Balai RT", "selesai"],
  ];

  const insertKegiatan = database.prepare(
    "INSERT INTO kegiatan (judul, deskripsi, detail, tanggal, lokasi, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  for (const k of kegiatan) {
    insertKegiatan.run(k[0], k[1], k[1], ...k.slice(2), now);
  }

  const warga = [
    ["Ahmad Suryadi", "Jl. Merdeka No. 1", "081234567890", "3201010101010001", "aktif"],
    ["Siti Rahayu", "Jl. Merdeka No. 2", "081234567891", "3201010202020002", "aktif"],
    ["Budi Santoso", "Jl. Merdeka No. 3", "081234567892", "3201010303030003", "aktif"],
    ["Dewi Lestari", "Jl. Merdeka No. 4", "081234567893", "3201010404040004", "aktif"],
    ["Eko Prasetyo", "Jl. Merdeka No. 5", "081234567894", "3201010505050005", "aktif"],
    ["Fitri Handayani", "Jl. Merdeka No. 6", "081234567895", "3201010606060006", "aktif"],
    ["Gunawan Wijaya", "Jl. Merdeka No. 7", "081234567896", "3201010707070007", "pindah"],
  ];

  const insertWarga = database.prepare(
    "INSERT INTO warga (nama, alamat, no_hp, no_ktp, status, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  );
  for (const w of warga) {
    insertWarga.run(...w, now);
  }

  const keuangan = [
    ["pemasukan", "Iuran Warga", "Iuran bulan Mei 2026", 2500000, "2026-05-05"],
    ["pemasukan", "Donasi", "Donasi dari alumni RT", 500000, "2026-05-10"],
    ["pengeluaran", "Kebersihan", "Bayar tukang sampah bulan Mei", 400000, "2026-05-08"],
    ["pengeluaran", "Kegiatan", "Biaya kerja bakti (snack & alat)", 350000, "2026-05-15"],
    ["pemasukan", "Iuran Warga", "Iuran bulan April 2026", 2300000, "2026-04-05"],
    ["pengeluaran", "Perbaikan", "Perbaikan pagar balai RT", 1200000, "2026-04-20"],
  ];

  const insertKeuangan = database.prepare(
    "INSERT INTO keuangan (jenis, kategori, deskripsi, jumlah, tanggal, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  );
  for (const t of keuangan) {
    insertKeuangan.run(...t, now);
  }
}

export function getProfil(): ProfilRT {
  return getDb().prepare("SELECT * FROM profil_rt WHERE id = 1").get() as ProfilRT;
}

export function updateProfil(data: Partial<ProfilRT>): ProfilRT {
  const now = new Date().toISOString();
  const current = getProfil();
  const updated = { ...current, ...data, updated_at: now };

  getDb().prepare(`
    UPDATE profil_rt SET
      nama_rt = ?, nama_rw = ?, kelurahan = ?, kecamatan = ?, kota = ?,
      ketua = ?, sekretaris = ?, bendahara = ?, visi = ?, misi = ?, updated_at = ?
    WHERE id = 1
  `).run(
    updated.nama_rt, updated.nama_rw, updated.kelurahan, updated.kecamatan, updated.kota,
    updated.ketua, updated.sekretaris, updated.bendahara, updated.visi, updated.misi, now
  );

  return updated;
}

export function getKegiatan(): Kegiatan[] {
  return getDb().prepare("SELECT * FROM kegiatan ORDER BY tanggal DESC").all() as Kegiatan[];
}

export function getKegiatanById(id: number): Kegiatan | null {
  const kegiatan = getDb().prepare("SELECT * FROM kegiatan WHERE id = ?").get(id) as Kegiatan | undefined;
  if (!kegiatan) return null;
  return { ...kegiatan, fotos: getKegiatanFotos(id) };
}

export function getKegiatanFotos(kegiatanId: number): KegiatanFoto[] {
  return getDb()
    .prepare("SELECT * FROM kegiatan_foto WHERE kegiatan_id = ? ORDER BY created_at ASC")
    .all(kegiatanId) as KegiatanFoto[];
}

export function addKegiatan(data: Omit<Kegiatan, "id" | "created_at" | "fotos">): Kegiatan {
  const now = new Date().toISOString();
  const result = getDb().prepare(
    "INSERT INTO kegiatan (judul, deskripsi, detail, tanggal, lokasi, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(
    data.judul,
    data.deskripsi,
    data.detail ?? "",
    data.tanggal,
    data.lokasi,
    data.status,
    now
  );

  return getDb().prepare("SELECT * FROM kegiatan WHERE id = ?").get(result.lastInsertRowid) as Kegiatan;
}

export function updateKegiatan(id: number, data: Partial<Omit<Kegiatan, "id" | "created_at" | "fotos">>): Kegiatan | null {
  const current = getDb().prepare("SELECT * FROM kegiatan WHERE id = ?").get(id) as Kegiatan | undefined;
  if (!current) return null;

  const updated = { ...current, ...data };
  getDb().prepare(`
    UPDATE kegiatan SET
      judul = ?, deskripsi = ?, detail = ?, tanggal = ?, lokasi = ?, status = ?
    WHERE id = ?
  `).run(
    updated.judul,
    updated.deskripsi,
    updated.detail ?? "",
    updated.tanggal,
    updated.lokasi,
    updated.status,
    id
  );

  return getKegiatanById(id);
}

export function addKegiatanFoto(
  kegiatanId: number,
  filename: string,
  originalName: string,
  size: number
): KegiatanFoto {
  const now = new Date().toISOString();
  const result = getDb().prepare(
    "INSERT INTO kegiatan_foto (kegiatan_id, filename, original_name, size, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(kegiatanId, filename, originalName, size, now);

  return getDb().prepare("SELECT * FROM kegiatan_foto WHERE id = ?").get(result.lastInsertRowid) as KegiatanFoto;
}

export function getKegiatanFotoById(fotoId: number): KegiatanFoto | null {
  return getDb().prepare("SELECT * FROM kegiatan_foto WHERE id = ?").get(fotoId) as KegiatanFoto | null;
}

export function deleteKegiatanFoto(fotoId: number): KegiatanFoto | null {
  const foto = getKegiatanFotoById(fotoId);
  if (!foto) return null;
  getDb().prepare("DELETE FROM kegiatan_foto WHERE id = ?").run(fotoId);
  return foto;
}

export function deleteKegiatan(id: number): void {
  const fotos = getKegiatanFotos(id);
  getDb().prepare("DELETE FROM kegiatan WHERE id = ?").run(id);
  for (const foto of fotos) {
    deleteFotoFile(foto.filename);
  }
}

export function deleteFotoFile(filename: string): void {
  const filePath = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export function getWarga(): Warga[] {
  return getDb().prepare("SELECT * FROM warga ORDER BY nama ASC").all() as Warga[];
}

export function normalizeKtp(noKtp: string): string {
  return noKtp.replace(/\D/g, "");
}

export function findWargaByKtp(noKtp: string): Warga | null {
  const normalized = normalizeKtp(noKtp);
  if (!normalized) return null;

  const warga = getWarga();
  return (
    warga.find(
      (w) => w.status === "aktif" && normalizeKtp(w.no_ktp) === normalized && w.no_ktp.trim() !== ""
    ) ?? null
  );
}

export function addWarga(data: Omit<Warga, "id" | "created_at">): Warga {
  const now = new Date().toISOString();
  const result = getDb().prepare(
    "INSERT INTO warga (nama, alamat, no_hp, no_ktp, status, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(data.nama, data.alamat, data.no_hp, data.no_ktp ?? "", data.status, now);

  return getDb().prepare("SELECT * FROM warga WHERE id = ?").get(result.lastInsertRowid) as Warga;
}

export function updateWarga(id: number, data: Partial<Omit<Warga, "id" | "created_at">>): Warga | null {
  const current = getDb().prepare("SELECT * FROM warga WHERE id = ?").get(id) as Warga | undefined;
  if (!current) return null;

  const updated = { ...current, ...data };
  getDb().prepare(`
    UPDATE warga SET nama = ?, alamat = ?, no_hp = ?, no_ktp = ?, status = ?
    WHERE id = ?
  `).run(updated.nama, updated.alamat, updated.no_hp, updated.no_ktp ?? "", updated.status, id);

  return getDb().prepare("SELECT * FROM warga WHERE id = ?").get(id) as Warga;
}

export function deleteWarga(id: number): void {
  getDb().prepare("DELETE FROM warga WHERE id = ?").run(id);
}

export function getKeuangan(): TransaksiKeuangan[] {
  return getDb().prepare("SELECT * FROM keuangan ORDER BY tanggal DESC, id DESC").all() as TransaksiKeuangan[];
}

export function addKeuangan(data: Omit<TransaksiKeuangan, "id" | "created_at">): TransaksiKeuangan {
  const [created] = addKeuanganBatch([data]);
  return created;
}

export function addKeuanganBatch(
  items: Omit<TransaksiKeuangan, "id" | "created_at">[]
): TransaksiKeuangan[] {
  if (items.length === 0) return [];

  const database = getDb();
  const now = new Date().toISOString();
  const insert = database.prepare(
    "INSERT INTO keuangan (jenis, kategori, deskripsi, jumlah, tanggal, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  );

  const insertMany = database.transaction((rows: typeof items) => {
    const ids: number[] = [];
    for (const row of rows) {
      const result = insert.run(
        row.jenis,
        row.kategori,
        row.deskripsi,
        row.jumlah,
        row.tanggal,
        now
      );
      ids.push(Number(result.lastInsertRowid));
    }
    return ids;
  });

  const ids = insertMany(items);
  const select = database.prepare("SELECT * FROM keuangan WHERE id = ?");
  return ids.map((id) => select.get(id) as TransaksiKeuangan);
}

export function updateKeuanganBatch(
  items: { id: number; data: Omit<TransaksiKeuangan, "id" | "created_at"> }[]
): { updated: TransaksiKeuangan[]; errors: { id: number; message: string }[] } {
  const updated: TransaksiKeuangan[] = [];
  const errors: { id: number; message: string }[] = [];

  for (const item of items) {
    const result = updateKeuangan(item.id, item.data);
    if (result) updated.push(result);
    else errors.push({ id: item.id, message: "Transaksi tidak ditemukan" });
  }

  return { updated, errors };
}

export function updateKeuangan(
  id: number,
  data: Partial<Omit<TransaksiKeuangan, "id" | "created_at">>
): TransaksiKeuangan | null {
  const current = getDb().prepare("SELECT * FROM keuangan WHERE id = ?").get(id) as TransaksiKeuangan | undefined;
  if (!current) return null;

  const updated = { ...current, ...data };
  getDb().prepare(`
    UPDATE keuangan SET jenis = ?, kategori = ?, deskripsi = ?, jumlah = ?, tanggal = ?
    WHERE id = ?
  `).run(updated.jenis, updated.kategori, updated.deskripsi, updated.jumlah, updated.tanggal, id);

  return getDb().prepare("SELECT * FROM keuangan WHERE id = ?").get(id) as TransaksiKeuangan;
}

export function deleteKeuangan(id: number): void {
  getDb().prepare("DELETE FROM keuangan WHERE id = ?").run(id);
}

export function getDashboard(): DashboardData {
  const profil = getProfil();
  const totalWarga = getDb().prepare("SELECT COUNT(*) as c FROM warga WHERE status = 'aktif'").get() as { c: number };
  const pemasukan = getDb().prepare("SELECT COALESCE(SUM(jumlah), 0) as total FROM keuangan WHERE jenis = 'pemasukan'").get() as { total: number };
  const pengeluaran = getDb().prepare("SELECT COALESCE(SUM(jumlah), 0) as total FROM keuangan WHERE jenis = 'pengeluaran'").get() as { total: number };
  const kegiatanAktif = getDb().prepare("SELECT COUNT(*) as c FROM kegiatan WHERE status IN ('rencana', 'berlangsung')").get() as { c: number };
  const kegiatanTerbaru = getDb().prepare("SELECT * FROM kegiatan ORDER BY tanggal DESC LIMIT 3").all() as Kegiatan[];
  const transaksiTerbaru = getDb().prepare("SELECT * FROM keuangan ORDER BY tanggal DESC, id DESC LIMIT 4").all() as TransaksiKeuangan[];

  return {
    profil,
    total_warga: totalWarga.c,
    total_pemasukan: pemasukan.total,
    total_pengeluaran: pengeluaran.total,
    saldo: pemasukan.total - pengeluaran.total,
    kegiatan_aktif: kegiatanAktif.c,
    kegiatan_terbaru: kegiatanTerbaru,
    transaksi_terbaru: transaksiTerbaru,
    updated_at: new Date().toISOString(),
  };
}
