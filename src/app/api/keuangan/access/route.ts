import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  isKeuanganPasswordConfigured,
  verifyKeuanganPassword,
  createAndSetKeuanganAccessSession,
  clearKeuanganAccessSession,
  isKeuanganAccessGranted,
} from "@/lib/keuangan-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const granted = await isKeuanganAccessGranted();
  return NextResponse.json({ granted, configured: isKeuanganPasswordConfigured() });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { password } = await request.json();

  if (!password) {
    return NextResponse.json({ error: "Password wajib diisi" }, { status: 400 });
  }

  if (!isKeuanganPasswordConfigured()) {
    return NextResponse.json(
      { error: "Password keuangan belum dikonfigurasi. Atur KEUANGAN_PASSWORD_HASH di .env.local" },
      { status: 503 }
    );
  }

  if (!verifyKeuanganPassword(password)) {
    return NextResponse.json({ error: "Password salah" }, { status: 401 });
  }

  await createAndSetKeuanganAccessSession();
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await clearKeuanganAccessSession();
  return NextResponse.json({ success: true });
}
