import { NextResponse } from "next/server";
import { getOtpSessionId } from "@/lib/auth";
import {
  generateOtpCode,
  createOtpSession,
  getOtpSession,
  deleteOtpSession,
} from "@/lib/auth-store";
import { setOtpPendingCookie } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/otp-mail";

export async function POST() {
  const sessionId = await getOtpSessionId();
  if (!sessionId) {
    return NextResponse.json({ error: "Sesi login tidak ditemukan. Silakan login ulang." }, { status: 401 });
  }

  const session = getOtpSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Sesi OTP kedaluwarsa. Silakan login ulang." }, { status: 401 });
  }

  if (new Date(session.expires_at) < new Date()) {
    deleteOtpSession(sessionId);
    return NextResponse.json({ error: "Sesi OTP kedaluwarsa. Silakan login ulang." }, { status: 401 });
  }

  const otp = generateOtpCode();
  deleteOtpSession(sessionId);
  const { id: newSessionId } = createOtpSession(session.email, otp);

  const otpResult = await sendOtpEmail(session.email, otp);
  if (!otpResult.success) {
    return NextResponse.json(
      { error: otpResult.error || "Gagal mengirim ulang OTP" },
      { status: 502 }
    );
  }

  await setOtpPendingCookie(newSessionId);

  const response: Record<string, unknown> = {
    success: true,
    maskedEmail: otpResult.maskedEmail,
    message: "Kode OTP baru telah dikirim ke email",
  };

  if (otpResult.mock && (process.env.NODE_ENV === "development" || process.env.OTP_MOCK === "true")) {
    response.devOtp = otp;
  }

  return NextResponse.json(response);
}
