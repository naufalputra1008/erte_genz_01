import { NextResponse } from "next/server";
import { verifyOtpSession } from "@/lib/auth-store";
import {
  getOtpSessionId,
  createAndSetAdminSession,
  clearOtpPendingCookie,
} from "@/lib/auth";

export async function POST(request: Request) {
  const { otp } = await request.json();

  if (!otp) {
    return NextResponse.json({ error: "Kode OTP wajib diisi" }, { status: 400 });
  }

  const sessionId = await getOtpSessionId();
  if (!sessionId) {
    return NextResponse.json({ error: "Sesi login tidak ditemukan. Silakan login ulang." }, { status: 401 });
  }

  const result = verifyOtpSession(sessionId, String(otp).trim());
  if (!result.valid || !result.email) {
    return NextResponse.json({ error: result.error || "Kode OTP tidak valid" }, { status: 401 });
  }

  await createAndSetAdminSession(result.email);
  await clearOtpPendingCookie();

  return NextResponse.json({ success: true, authenticated: true });
}
