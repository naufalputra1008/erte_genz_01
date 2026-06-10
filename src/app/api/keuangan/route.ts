import { NextResponse } from "next/server";
import { getKeuangan } from "@/lib/db";
import { buildKeuanganResponse } from "@/lib/keuangan";
import { isAdminAuthenticated } from "@/lib/auth";
import { isWargaKeuanganAccessGranted } from "@/lib/warga-keuangan-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await isAdminAuthenticated();
  const wargaAccess = await isWargaKeuanganAccessGranted();

  if (!admin && !wargaAccess) {
    return NextResponse.json({ error: "Verifikasi nama lengkap diperlukan" }, { status: 403 });
  }

  return NextResponse.json(buildKeuanganResponse(getKeuangan()));
}
