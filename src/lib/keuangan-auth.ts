import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import {
  createKeuanganAccessSession,
  validateKeuanganAccessSession,
  deleteKeuanganAccessSession,
  cleanupExpiredSessions,
} from "./auth-store";
import { getKeuanganPasswordHash } from "./admin-env";

const KEUANGAN_COOKIE = "rt_keuangan_access";

export function isKeuanganPasswordConfigured(): boolean {
  return getKeuanganPasswordHash() !== null;
}

export function verifyKeuanganPassword(password: string): boolean {
  const hash = getKeuanganPasswordHash();
  if (!hash) return false;
  return bcrypt.compareSync(password, hash);
}

export async function isKeuanganAccessGranted(): Promise<boolean> {
  cleanupExpiredSessions();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(KEUANGAN_COOKIE)?.value;
  if (!sessionId) return false;
  return validateKeuanganAccessSession(sessionId);
}

export async function createAndSetKeuanganAccessSession(): Promise<void> {
  const { id } = createKeuanganAccessSession();
  const cookieStore = await cookies();
  cookieStore.set(KEUANGAN_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
}

export async function clearKeuanganAccessSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(KEUANGAN_COOKIE)?.value;
  if (sessionId) {
    deleteKeuanganAccessSession(sessionId);
  }
  cookieStore.delete(KEUANGAN_COOKIE);
}
