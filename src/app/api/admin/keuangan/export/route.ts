import { NextResponse } from "next/server";
import { getKeuangan } from "@/lib/db";
import { requireAdminKeuanganAccess } from "@/lib/admin-keuangan-guard";
import { buildKeuanganExportCsv } from "@/lib/keuangan-import";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdminKeuanganAccess();
  if (denied) return denied;

  const csv = buildKeuanganExportCsv(getKeuangan());
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="data-keuangan-${date}.csv"`,
    },
  });
}
