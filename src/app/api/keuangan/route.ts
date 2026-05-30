import { NextResponse } from "next/server";
import { getKeuangan, addKeuangan, updateKeuangan, deleteKeuangan } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const transaksi = getKeuangan();
  const pemasukan = transaksi.filter((t) => t.jenis === "pemasukan").reduce((s, t) => s + t.jumlah, 0);
  const pengeluaran = transaksi.filter((t) => t.jenis === "pengeluaran").reduce((s, t) => s + t.jumlah, 0);

  return NextResponse.json({
    transaksi,
    ringkasan: {
      pemasukan,
      pengeluaran,
      saldo: pemasukan - pengeluaran,
    },
    updated_at: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const transaksi = addKeuangan(body);
  return NextResponse.json(transaksi, { status: 201 });
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
  const transaksi = updateKeuangan(id, body);
  if (!transaksi) {
    return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(transaksi);
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

  deleteKeuangan(id);
  return NextResponse.json({ success: true });
}
