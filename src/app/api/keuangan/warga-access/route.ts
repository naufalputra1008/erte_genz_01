import { NextResponse } from "next/server";
import {
  isWargaKeuanganAccessGranted,
  verifyAndGrantWargaKeuanganAccess,
  clearWargaKeuanganAccessSession,
} from "@/lib/warga-keuangan-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const granted = await isWargaKeuanganAccessGranted();
  return NextResponse.json({ granted });
}

export async function POST(request: Request) {
  const { nama } = await request.json();

  if (!nama || typeof nama !== "string" || !nama.trim()) {
    return NextResponse.json({ error: "Nama lengkap wajib diisi" }, { status: 400 });
  }

  const granted = await verifyAndGrantWargaKeuanganAccess(nama);
  if (!granted) {
    return NextResponse.json(
      { error: "Nama tidak terdaftar atau warga tidak aktif" },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  await clearWargaKeuanganAccessSession();
  return NextResponse.json({ success: true });
}
