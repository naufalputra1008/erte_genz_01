import { NextResponse } from "next/server";
import { getKeuangan, getProfil } from "@/lib/db";
import { requireAdminKeuanganAccess } from "@/lib/admin-keuangan-guard";
import { buildKeuanganLaporanXlsx, keuanganLaporanFilename } from "@/lib/keuangan-laporan";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdminKeuanganAccess();
  if (denied) return denied;

  const profil = getProfil();
  const buffer = buildKeuanganLaporanXlsx(getKeuangan(), profil);
  const filename = keuanganLaporanFilename(profil);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
