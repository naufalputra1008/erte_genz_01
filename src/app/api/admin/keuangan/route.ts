import { NextResponse } from "next/server";
import { getKeuangan, addKeuangan, updateKeuangan, deleteKeuangan } from "@/lib/db";
import { buildKeuanganResponse } from "@/lib/keuangan";
import { requireAdminKeuanganAccess } from "@/lib/admin-keuangan-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdminKeuanganAccess();
  if (denied) return denied;
  return NextResponse.json(buildKeuanganResponse(getKeuangan()));
}

export async function POST(request: Request) {
  const denied = await requireAdminKeuanganAccess();
  if (denied) return denied;

  const body = await request.json();
  const transaksi = addKeuangan(body);
  return NextResponse.json(transaksi, { status: 201 });
}

export async function PUT(request: Request) {
  const denied = await requireAdminKeuanganAccess();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const body = await request.json();
  const transaksi = updateKeuangan(id, body);
  if (!transaksi) {
    return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(transaksi);
}

export async function DELETE(request: Request) {
  const denied = await requireAdminKeuanganAccess();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  deleteKeuangan(id);
  return NextResponse.json({ success: true });
}
