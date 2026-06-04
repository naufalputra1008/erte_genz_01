import { NextResponse } from "next/server";
import { requireAdminKeuanganAccess } from "@/lib/admin-keuangan-guard";
import {
  KEUANGAN_IMPORT_TEMPLATE,
  KEUANGAN_UPDATE_IMPORT_TEMPLATE,
} from "@/lib/keuangan-import";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await requireAdminKeuanganAccess();
  if (denied) return denied;

  const mode = new URL(request.url).searchParams.get("mode");
  const isUpdate = mode === "update";

  return new NextResponse(
    isUpdate ? KEUANGAN_UPDATE_IMPORT_TEMPLATE : KEUANGAN_IMPORT_TEMPLATE,
    {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${
          isUpdate ? "template-ubah-keuangan.csv" : "template-import-keuangan.csv"
        }"`,
      },
    }
  );
}
