import type { TransaksiKeuangan } from "./types";

export interface KeuanganResponse {
  transaksi: TransaksiKeuangan[];
  ringkasan: {
    pemasukan: number;
    pengeluaran: number;
    saldo: number;
  };
  updated_at: string;
}

export function buildKeuanganResponse(transaksi: TransaksiKeuangan[]): KeuanganResponse {
  const pemasukan = transaksi
    .filter((t) => t.jenis === "pemasukan")
    .reduce((s, t) => s + t.jumlah, 0);
  const pengeluaran = transaksi
    .filter((t) => t.jenis === "pengeluaran")
    .reduce((s, t) => s + t.jumlah, 0);

  return {
    transaksi,
    ringkasan: {
      pemasukan,
      pengeluaran,
      saldo: pemasukan - pengeluaran,
    },
    updated_at: new Date().toISOString(),
  };
}
