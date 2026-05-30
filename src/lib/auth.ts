import { cookies } from "next/headers";
import {
  createAdminSession,
  validateAdminSession,
  deleteAdminSession,
  cleanupExpiredSessions,
} from "./auth-store";

const ADMIN_COOKIE = "rt_admin_session";
const OTP_COOKIE = "rt_otp_session";

export async function isAdminAuthenticated(): Promise<boolean> {
  cleanupExpiredSessions();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!sessionId) return false;
  return validateAdminSession(sessionId);
}

export async function getOtpSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(OTP_COOKIE)?.value ?? null;
}

export async function setOtpPendingCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(OTP_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/",
  });
}

export async function setAdminSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

export async function createAndSetAdminSession(email: string): Promise<void> {
  const { id } = createAdminSession(email);
  await setAdminSessionCookie(id);
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(ADMIN_COOKIE)?.value;
  if (sessionId) {
    deleteAdminSession(sessionId);
  }
  cookieStore.delete(ADMIN_COOKIE);
  cookieStore.delete(OTP_COOKIE);
}

export async function clearOtpPendingCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(OTP_COOKIE);
}
