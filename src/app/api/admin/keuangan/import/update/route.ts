import { NextResponse } from "next/server";
import { updateKeuanganBatch } from "@/lib/db";
import { requireAdminKeuanganAccess } from "@/lib/admin-keuangan-guard";
import {
  MAX_IMPORT_FILE_SIZE,
  parseKeuanganUpdateSpreadsheet,
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
  const { rows, errors: parseErrors } = parseKeuanganUpdateSpreadsheet(buffer, file.name);

  if (rows.length === 0) {
    return NextResponse.json(
      {
        updated: 0,
        failed: parseErrors.length,
        errors: parseErrors,
      },
      { status: 400 }
    );
  }

  const { updated, errors: dbErrors } = updateKeuanganBatch(
    rows.map((row) => ({
      id: row.id,
      data: {
        jenis: row.jenis,
        kategori: row.kategori,
        deskripsi: row.deskripsi,
        jumlah: row.jumlah,
        tanggal: row.tanggal,
      },
    }))
  );

  const errors = [
    ...parseErrors,
    ...dbErrors.map((e) => {
      const idx = rows.findIndex((r) => r.id === e.id);
      return {
        row: idx >= 0 ? idx + 2 : 0,
        message: `ID ${e.id}: ${e.message}`,
      };
    }),
  ];

  return NextResponse.json({
    updated: updated.length,
    failed: errors.length,
    errors,
  });
}
