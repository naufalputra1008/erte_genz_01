import { cookies } from "next/headers";
import {
  createWargaKeuanganSession,
  validateWargaKeuanganSession,
  deleteWargaKeuanganSession,
  cleanupExpiredSessions,
  logKeuanganAkses,
} from "./auth-store";
import { findWargaByNama, normalizeNama } from "./db";

const WARGA_KEUANGAN_COOKIE = "rt_warga_keuangan";
const WARGA_KEUANGAN_SESSION_SECONDS = 60 * 60 * 3;

export async function isWargaKeuanganAccessGranted(): Promise<boolean> {
  cleanupExpiredSessions();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(WARGA_KEUANGAN_COOKIE)?.value;
  if (!sessionId) return false;
  return validateWargaKeuanganSession(sessionId);
}

export async function verifyAndGrantWargaKeuanganAccess(nama: string): Promise<boolean> {
  const warga = findWargaByNama(nama);
  if (!warga) return false;

  const normalizedNama = normalizeNama(nama);
  const { id } = createWargaKeuanganSession(warga.id, normalizedNama);
  logKeuanganAkses(warga.id, normalizedNama, warga.nama, id);

  const cookieStore = await cookies();
  cookieStore.set(WARGA_KEUANGAN_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: WARGA_KEUANGAN_SESSION_SECONDS,
    path: "/",
  });

  return true;
}

export async function clearWargaKeuanganAccessSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(WARGA_KEUANGAN_COOKIE)?.value;
  if (sessionId) {
    deleteWargaKeuanganSession(sessionId);
  }
  cookieStore.delete(WARGA_KEUANGAN_COOKIE);
}
