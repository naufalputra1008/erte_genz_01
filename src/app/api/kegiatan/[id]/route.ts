import { NextResponse } from "next/server";
import { getKegiatanById, updateKegiatan } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const kegiatanId = Number(id);
  if (!kegiatanId) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const kegiatan = getKegiatanById(kegiatanId);
  if (!kegiatan) {
    return NextResponse.json({ error: "Kegiatan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(kegiatan);
}

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const kegiatanId = Number(id);
  if (!kegiatanId) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const body = await request.json();
  const kegiatan = updateKegiatan(kegiatanId, body);
  if (!kegiatan) {
    return NextResponse.json({ error: "Kegiatan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(kegiatan);
}
