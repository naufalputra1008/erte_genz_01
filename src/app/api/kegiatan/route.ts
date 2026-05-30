import { NextResponse } from "next/server";
import { getKegiatan, addKegiatan, deleteKegiatan } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getKegiatan());
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const kegiatan = addKegiatan(body);
  return NextResponse.json(kegiatan, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  deleteKegiatan(id);
  return NextResponse.json({ success: true });
}
