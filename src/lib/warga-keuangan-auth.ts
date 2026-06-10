import { cookies } from "next/headers";
import {
  createWargaKeuanganSession,
  validateWargaKeuanganSession,
  deleteWargaKeuanganSession,
  cleanupExpiredSessions,
  logKeuanganAkses,
} from "./auth-store";
import { findWargaByKtp, normalizeKtp } from "./db";

const WARGA_KEUANGAN_COOKIE = "rt_warga_keuangan";
const WARGA_KEUANGAN_SESSION_SECONDS = 60 * 60 * 3;

export async function isWargaKeuanganAccessGranted(): Promise<boolean> {
  cleanupExpiredSessions();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(WARGA_KEUANGAN_COOKIE)?.value;
  if (!sessionId) return false;
  return validateWargaKeuanganSession(sessionId);
}

export async function verifyAndGrantWargaKeuanganAccess(noKtp: string): Promise<boolean> {
  const warga = findWargaByKtp(noKtp);
  if (!warga) return false;

  const normalizedKtp = normalizeKtp(noKtp);
  const { id } = createWargaKeuanganSession(warga.id, normalizedKtp);
  logKeuanganAkses(warga.id, normalizedKtp, warga.nama, id);

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
