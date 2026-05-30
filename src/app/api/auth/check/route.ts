import { NextResponse } from "next/server";
import { isAdminAuthenticated, getOtpSessionId } from "@/lib/auth";
import { getOtpSession } from "@/lib/auth-store";

export async function GET() {
  const authenticated = await isAdminAuthenticated();

  if (authenticated) {
    return NextResponse.json({ authenticated: true, pendingOtp: false });
  }

  const otpSessionId = await getOtpSessionId();
  if (otpSessionId) {
    const session = getOtpSession(otpSessionId);
    if (session && new Date(session.expires_at) > new Date()) {
      return NextResponse.json({ authenticated: false, pendingOtp: true });
    }
  }

  return NextResponse.json({ authenticated: false, pendingOtp: false });
}
