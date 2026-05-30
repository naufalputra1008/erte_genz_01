import { NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/password";
import { setOtpPendingCookie, clearOtpPendingCookie, getOtpSessionId } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/otp-mail";
import { generateOtpCode, createOtpSession, deleteOtpSession } from "@/lib/auth-store";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
  }

  if (!verifyAdminCredentials(email, password)) {
    return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
  }

  const normalizedEmail = email.toLowerCase();
  const otp = generateOtpCode();
  const { id: sessionId } = createOtpSession(normalizedEmail, otp);

  const otpResult = await sendOtpEmail(normalizedEmail, otp);
  if (!otpResult.success) {
    return NextResponse.json(
      { error: otpResult.error || "Gagal mengirim OTP ke email" },
      { status: 502 }
    );
  }

  await setOtpPendingCookie(sessionId);

  const response: Record<string, unknown> = {
    success: true,
    requiresOtp: true,
    maskedEmail: otpResult.maskedEmail,
    message: "Kode OTP telah dikirim ke email Anda",
  };

  if (otpResult.mock && (process.env.NODE_ENV === "development" || process.env.OTP_MOCK === "true")) {
    response.devOtp = otp;
    response.message = "Mode development: OTP ditampilkan di bawah";
  }

  return NextResponse.json(response);
}

export async function DELETE() {
  const sessionId = await getOtpSessionId();
  if (sessionId) {
    deleteOtpSession(sessionId);
  }
  await clearOtpPendingCookie();
  return NextResponse.json({ success: true });
}
