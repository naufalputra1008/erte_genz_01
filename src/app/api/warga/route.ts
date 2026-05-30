import { NextResponse } from "next/server";
import { getWarga, addWarga, updateWarga, deleteWarga } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getWarga());
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const warga = addWarga(body);
  return NextResponse.json(warga, { status: 201 });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const body = await request.json();
  const warga = updateWarga(id, body);
  if (!warga) {
    return NextResponse.json({ error: "Warga tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(warga);
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

  deleteWarga(id);
  return NextResponse.json({ success: true });
}
