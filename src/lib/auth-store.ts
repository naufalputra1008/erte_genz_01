import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { randomBytes } from "crypto";
import type { KeuanganAksesLog } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "rt.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initAuthTables(db);
  }
  return db;
}

function initAuthTables(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS admin_session (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS keuangan_access_session (
      id TEXT PRIMARY KEY,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS warga_keuangan_session (
      id TEXT PRIMARY KEY,
      warga_id INTEGER NOT NULL DEFAULT 0,
      no_ktp TEXT NOT NULL DEFAULT '',
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS keuangan_akses_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      warga_id INTEGER NOT NULL,
      no_ktp TEXT NOT NULL,
      nama_warga TEXT NOT NULL,
      session_id TEXT NOT NULL,
      accessed_at TEXT NOT NULL
    );
  `);

  migrateAuthTables(database);
}

function migrateAuthTables(database: Database.Database) {
  const sessionCols = database.pragma("table_info(warga_keuangan_session)") as { name: string }[];
  if (!sessionCols.some((c) => c.name === "warga_id")) {
    database.exec("ALTER TABLE warga_keuangan_session ADD COLUMN warga_id INTEGER NOT NULL DEFAULT 0");
  }
  if (!sessionCols.some((c) => c.name === "no_ktp")) {
    database.exec("ALTER TABLE warga_keuangan_session ADD COLUMN no_ktp TEXT NOT NULL DEFAULT ''");
  }
}

function generateId(): string {
  return randomBytes(32).toString("hex");
}

export function createAdminSession(email: string, ttlHours = 8) {
  const id = generateId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);

  getDb().prepare(`
    INSERT INTO admin_session (id, email, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(id, email, expiresAt.toISOString(), now.toISOString());

  return { id, expiresAt };
}

export function validateAdminSession(sessionId: string): boolean {
  const session = getDb().prepare("SELECT * FROM admin_session WHERE id = ?").get(sessionId) as {
    expires_at: string;
  } | undefined;

  if (!session) return false;

  if (new Date(session.expires_at) < new Date()) {
    deleteAdminSession(sessionId);
    return false;
  }

  return true;
}

export function deleteAdminSession(sessionId: string): void {
  getDb().prepare("DELETE FROM admin_session WHERE id = ?").run(sessionId);
}

export function createKeuanganAccessSession(ttlHours = 12) {
  const id = generateId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);

  getDb().prepare(`
    INSERT INTO keuangan_access_session (id, expires_at, created_at)
    VALUES (?, ?, ?)
  `).run(id, expiresAt.toISOString(), now.toISOString());

  return { id, expiresAt };
}

export function validateKeuanganAccessSession(sessionId: string): boolean {
  const session = getDb()
    .prepare("SELECT * FROM keuangan_access_session WHERE id = ?")
    .get(sessionId) as { expires_at: string } | undefined;

  if (!session) return false;

  if (new Date(session.expires_at) < new Date()) {
    deleteKeuanganAccessSession(sessionId);
    return false;
  }

  return true;
}

export function deleteKeuanganAccessSession(sessionId: string): void {
  getDb().prepare("DELETE FROM keuangan_access_session WHERE id = ?").run(sessionId);
}

const WARGA_KEUANGAN_SESSION_HOURS = 3;

export function createWargaKeuanganSession(wargaId: number, noKtp: string, ttlHours = WARGA_KEUANGAN_SESSION_HOURS) {
  const id = generateId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);

  getDb().prepare(`
    INSERT INTO warga_keuangan_session (id, warga_id, no_ktp, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, wargaId, noKtp, expiresAt.toISOString(), now.toISOString());

  return { id, expiresAt };
}

export function logKeuanganAkses(
  wargaId: number,
  noKtp: string,
  namaWarga: string,
  sessionId: string
): void {
  getDb().prepare(`
    INSERT INTO keuangan_akses_log (warga_id, no_ktp, nama_warga, session_id, accessed_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(wargaId, noKtp, namaWarga, sessionId, new Date().toISOString());
}

export function getKeuanganAksesLogs(limit = 100): KeuanganAksesLog[] {
  return getDb()
    .prepare("SELECT * FROM keuangan_akses_log ORDER BY accessed_at DESC LIMIT ?")
    .all(limit) as KeuanganAksesLog[];
}

export function validateWargaKeuanganSession(sessionId: string): boolean {
  const session = getDb()
    .prepare("SELECT * FROM warga_keuangan_session WHERE id = ?")
    .get(sessionId) as { expires_at: string } | undefined;

  if (!session) return false;

  if (new Date(session.expires_at) < new Date()) {
    deleteWargaKeuanganSession(sessionId);
    return false;
  }

  return true;
}

export function deleteWargaKeuanganSession(sessionId: string): void {
  getDb().prepare("DELETE FROM warga_keuangan_session WHERE id = ?").run(sessionId);
}

export function cleanupExpiredSessions(): void {
  const now = new Date().toISOString();
  getDb().prepare("DELETE FROM admin_session WHERE expires_at < ?").run(now);
  getDb().prepare("DELETE FROM keuangan_access_session WHERE expires_at < ?").run(now);
  getDb().prepare("DELETE FROM warga_keuangan_session WHERE expires_at < ?").run(now);
}
