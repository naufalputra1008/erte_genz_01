import { NextResponse } from "next/server";
import { createAndSetAdminSession } from "@/lib/auth";
import { getAdminAccounts } from "@/lib/admin-env";
import { verifyAdminCredentials } from "@/lib/password";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
  }

  if (getAdminAccounts().length === 0) {
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
