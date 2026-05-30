import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import {
  getKegiatanById,
  addKegiatanFoto,
  getKegiatanFotoById,
  deleteKegiatanFoto,
  deleteFotoFile,
  ensureUploadDir,
  UPLOAD_DIR,
} from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { ALLOWED_IMAGE_TYPES, MAX_FOTO_SIZE } from "@/lib/upload";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const kegiatanId = Number(id);
  if (!kegiatanId) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const kegiatan = getKegiatanById(kegiatanId);
  if (!kegiatan) {
    return NextResponse.json({ error: "Kegiatan tidak ditemukan" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("foto");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Foto wajib diupload" }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return NextResponse.json({ error: "Format foto harus JPG, PNG, WEBP, atau GIF" }, { status: 400 });
  }

  if (file.size > MAX_FOTO_SIZE) {
    return NextResponse.json({ error: "Ukuran foto maksimal 2MB" }, { status: 400 });
  }

  ensureUploadDir();

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${kegiatanId}-${Date.now()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);

  const foto = addKegiatanFoto(kegiatanId, filename, file.name, file.size);
  return NextResponse.json(foto, { status: 201 });
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const kegiatanId = Number(id);
  const { searchParams } = new URL(request.url);
  const fotoId = Number(searchParams.get("fotoId"));

  if (!kegiatanId || !fotoId) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const foto = getKegiatanFotoById(fotoId);
  if (!foto || foto.kegiatan_id !== kegiatanId) {
    return NextResponse.json({ error: "Foto tidak ditemukan" }, { status: 404 });
  }

  deleteKegiatanFoto(fotoId);
  deleteFotoFile(foto.filename);

  return NextResponse.json({ success: true });
}
