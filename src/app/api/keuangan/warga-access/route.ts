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
  const { no_ktp } = await request.json();

  if (!no_ktp || typeof no_ktp !== "string" || !no_ktp.trim()) {
    return NextResponse.json({ error: "No. KTP wajib diisi" }, { status: 400 });
  }

  const granted = await verifyAndGrantWargaKeuanganAccess(no_ktp);
  if (!granted) {
    return NextResponse.json(
      { error: "No. KTP tidak terdaftar atau warga tidak aktif" },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  await clearWargaKeuanganAccessSession();
  return NextResponse.json({ success: true });
}
