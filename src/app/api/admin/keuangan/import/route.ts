import { NextResponse } from "next/server";
import { addKeuanganBatch } from "@/lib/db";
import { requireAdminKeuanganAccess } from "@/lib/admin-keuangan-guard";
import {
  MAX_IMPORT_FILE_SIZE,
  parseKeuanganSpreadsheet,
} from "@/lib/keuangan-import";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = await requireAdminKeuanganAccess();
  if (denied) return denied;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "File wajib diunggah" }, { status: 400 });
  }

  if (file.size > MAX_IMPORT_FILE_SIZE) {
    return NextResponse.json({ error: "Ukuran file maksimal 2 MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { rows, errors } = parseKeuanganSpreadsheet(buffer, file.name);

  if (rows.length === 0) {
    return NextResponse.json(
      {
        imported: 0,
        failed: errors.length,
        errors,
      },
      { status: 400 }
    );
  }

  addKeuanganBatch(rows);

  return NextResponse.json({
    imported: rows.length,
    failed: errors.length,
    errors,
  });
}
