import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAndSetAdminSession } from "@/lib/auth";
import { getAdminEnv } from "@/lib/admin-env";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
  }

  const admin = getAdminEnv();
  if (!admin) {
    return NextResponse.json(
      { error: "Admin belum dikonfigurasi. Atur ADMIN_EMAIL dan ADMIN_PASSWORD_HASH di .env.local" },
      { status: 503 }
    );
  }

  if (email.toLowerCase() !== admin.email || !bcrypt.compareSync(password, admin.passwordHash)) {
    return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
  }

  await createAndSetAdminSession(email.toLowerCase());

  return NextResponse.json({ success: true });
}
