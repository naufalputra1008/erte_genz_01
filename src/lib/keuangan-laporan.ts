import * as XLSX from "xlsx";
import { buildKeuanganResponse } from "@/lib/keuangan";
import { formatTanggalWaktu } from "@/lib/format";
import type { ProfilRT, TransaksiKeuangan } from "@/lib/types";

const DETAIL_HEADERS = ["No", "Tanggal", "Kategori", "Deskripsi", "Jumlah (Rp)"] as const;

function sortTransaksi(items: TransaksiKeuangan[]): TransaksiKeuangan[] {
  return [...items].sort((a, b) => {
    const byDate = b.tanggal.localeCompare(a.tanggal);
    if (byDate !== 0) return byDate;
    return b.id - a.id;
  });
}

function detailRows(items: TransaksiKeuangan[]): (string | number)[][] {
  return sortTransaksi(items).map((t, i) => [
    i + 1,
    t.tanggal,
    t.kategori,
    t.deskripsi,
    t.jumlah,
  ]);
}

function buildDetailSection(
  title: string,
  items: TransaksiKeuangan[],
  total: number
): (string | number)[][] {
  const rows: (string | number)[][] = [
    [title],
    [...DETAIL_HEADERS],
    ...detailRows(items),
  ];

  if (items.length === 0) {
    rows.push(["-", "-", "-", "Belum ada transaksi", 0]);
  }

  rows.push([]);
  rows.push(["", "", "", `Subtotal ${title}`, total]);
  rows.push([]);

  return rows;
}

function buildLaporanDetailSheet(
  transaksi: TransaksiKeuangan[],
  profil: ProfilRT
): XLSX.WorkSheet {
  const { ringkasan } = buildKeuanganResponse(transaksi);
  const pemasukan = transaksi.filter((t) => t.jenis === "pemasukan");
  const pengeluaran = transaksi.filter((t) => t.jenis === "pengeluaran");
  const generatedAt = formatTanggalWaktu(new Date().toISOString());

  const rows: (string | number)[][] = [
    ["LAPORAN KEUANGAN DETAIL"],
    [profil.nama_rt],
    [`${profil.kelurahan}, ${profil.kecamatan}, ${profil.kota}`],
    [],
    ["Dicetak pada", generatedAt],
    [],
    ["RINGKASAN"],
    ["Total Pemasukan", ringkasan.pemasukan],
    ["Total Pengeluaran", ringkasan.pengeluaran],
    ["Saldo Saat Ini", ringkasan.saldo],
    ["Jumlah Transaksi Pemasukan", pemasukan.length],
    ["Jumlah Transaksi Pengeluaran", pengeluaran.length],
    [],
    [],
    ...buildDetailSection("PEMASUKAN", pemasukan, ringkasan.pemasukan),
    ...buildDetailSection("PENGELUARAN", pengeluaran, ringkasan.pengeluaran),
    ["KESIMPULAN"],
    ["Saldo Akhir", ringkasan.saldo],
  ];

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet["!cols"] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 22 },
    { wch: 48 },
    { wch: 16 },
  ];

  return sheet;
}

function buildTransactionSheet(
  title: string,
  items: TransaksiKeuangan[],
  total: number
): XLSX.WorkSheet {
  const rows: (string | number)[][] = [
    [title],
    [...DETAIL_HEADERS],
    ...detailRows(items),
  ];

  if (items.length === 0) {
    rows.push(["-", "-", "-", "Belum ada transaksi", 0]);
  }

  rows.push([]);
  rows.push(["", "", "", "TOTAL", total]);

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet["!cols"] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 22 },
    { wch: 48 },
    { wch: 16 },
  ];

  return sheet;
}

export function buildKeuanganLaporanXlsx(
  transaksi: TransaksiKeuangan[],
  profil: ProfilRT
): Buffer {
  const { ringkasan } = buildKeuanganResponse(transaksi);
  const pemasukan = transaksi.filter((t) => t.jenis === "pemasukan");
  const pengeluaran = transaksi.filter((t) => t.jenis === "pengeluaran");
  const generatedAt = formatTanggalWaktu(new Date().toISOString());

  const ringkasanSheet = XLSX.utils.aoa_to_sheet([
    ["LAPORAN KEUANGAN"],
    [profil.nama_rt],
    [`${profil.kelurahan}, ${profil.kecamatan}, ${profil.kota}`],
    [],
    ["Dicetak pada", generatedAt],
    [],
    ["RINGKASAN"],
    ["Total Pemasukan", ringkasan.pemasukan],
    ["Total Pengeluaran", ringkasan.pengeluaran],
    ["Saldo Saat Ini", ringkasan.saldo],
    [],
    ["Jumlah Transaksi Pemasukan", pemasukan.length],
    ["Jumlah Transaksi Pengeluaran", pengeluaran.length],
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, buildLaporanDetailSheet(transaksi, profil), "Laporan Detail");
  XLSX.utils.book_append_sheet(workbook, ringkasanSheet, "Ringkasan");
  XLSX.utils.book_append_sheet(
    workbook,
    buildTransactionSheet("DETAIL PEMASUKAN", pemasukan, ringkasan.pemasukan),
    "Pemasukan"
  );
  XLSX.utils.book_append_sheet(
    workbook,
    buildTransactionSheet("DETAIL PENGELUARAN", pengeluaran, ringkasan.pengeluaran),
    "Pengeluaran"
  );

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function keuanganLaporanFilename(profil: ProfilRT): string {
  const date = new Date().toISOString().slice(0, 10);
  const slug = profil.nama_rt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `laporan-keuangan-${slug || "rt"}-${date}.xlsx`;
}
