import { NextResponse } from "next/server";
import { isAdminConfigured, verifyAdminCredentials } from "@/lib/password";
import { createAndSetAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin belum dikonfigurasi. Atur ADMIN_EMAIL dan ADMIN_PASSWORD_HASH di .env.local" },
      { status: 503 }
    );
  }

  if (!verifyAdminCredentials(email, password)) {
    return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
  }

  await createAndSetAdminSession(email.toLowerCase());

  return NextResponse.json({ success: true });
}
