import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { randomBytes, createHash } from "crypto";

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
    CREATE TABLE IF NOT EXISTS otp_session (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      otp_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_session (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

function generateId(): string {
  return randomBytes(32).toString("hex");
}

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function createOtpSession(email: string, otp: string, ttlMinutes = 5) {
  const id = generateId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

  getDb().prepare(`
    INSERT INTO otp_session (id, email, otp_hash, expires_at, attempts, created_at)
    VALUES (?, ?, ?, ?, 0, ?)
  `).run(id, email, hashOtp(otp), expiresAt.toISOString(), now.toISOString());

  // Hapus OTP lama untuk email yang sama
  getDb().prepare(`
    DELETE FROM otp_session WHERE email = ? AND id != ?
  `).run(email, id);

  return { id, expiresAt };
}

export function verifyOtpSession(sessionId: string, otp: string): { valid: boolean; email?: string; error?: string } {
  const session = getDb().prepare("SELECT * FROM otp_session WHERE id = ?").get(sessionId) as {
    id: string;
    email: string;
    otp_hash: string;
    expires_at: string;
    attempts: number;
  } | undefined;

  if (!session) {
    return { valid: false, error: "Sesi OTP tidak ditemukan. Silakan login ulang." };
  }

  if (new Date(session.expires_at) < new Date()) {
    deleteOtpSession(sessionId);
    return { valid: false, error: "Kode OTP sudah kedaluwarsa. Silakan minta kode baru." };
  }

  if (session.attempts >= 5) {
    deleteOtpSession(sessionId);
    return { valid: false, error: "Terlalu banyak percobaan. Silakan login ulang." };
  }

  if (hashOtp(otp) !== session.otp_hash) {
    getDb().prepare("UPDATE otp_session SET attempts = attempts + 1 WHERE id = ?").run(sessionId);
    return { valid: false, error: "Kode OTP salah." };
  }

  deleteOtpSession(sessionId);
  return { valid: true, email: session.email };
}

export function deleteOtpSession(sessionId: string): void {
  getDb().prepare("DELETE FROM otp_session WHERE id = ?").run(sessionId);
}

export function getOtpSession(sessionId: string) {
  return getDb().prepare("SELECT * FROM otp_session WHERE id = ?").get(sessionId) as {
    id: string;
    email: string;
    expires_at: string;
  } | undefined;
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

export function cleanupExpiredSessions(): void {
  const now = new Date().toISOString();
  getDb().prepare("DELETE FROM otp_session WHERE expires_at < ?").run(now);
  getDb().prepare("DELETE FROM admin_session WHERE expires_at < ?").run(now);
}
