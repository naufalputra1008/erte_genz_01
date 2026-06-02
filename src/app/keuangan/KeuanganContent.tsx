"use client";

import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useLiveData } from "@/hooks/useLiveData";
import { LiveIndicator } from "@/components/LiveIndicator";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { formatRupiah, formatTanggal } from "@/lib/format";
import type { KeuanganResponse } from "@/lib/keuangan";

export default function KeuanganContent({ initialData }: { initialData: KeuanganResponse }) {
  const { data, loading, refreshing, lastUpdated, refresh } = useLiveData<KeuanganResponse>(
    "/api/keuangan",
    { initialData }
  );

  const pemasukan = data?.transaksi.filter((t) => t.jenis === "pemasukan") ?? [];
  const pengeluaran = data?.transaksi.filter((t) => t.jenis === "pengeluaran") ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        title="Keuangan RT"
        description="Laporan pemasukan dan pengeluaran RT secara transparan dan aktual"
      >
        <LiveIndicator lastUpdated={lastUpdated} onRefresh={refresh} refreshing={refreshing} />
      </PageHeader>

      {loading && !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              title="Total Pemasukan"
              value={formatRupiah(data.ringkasan.pemasukan)}
              icon={TrendingUp}
              color="emerald"
            />
            <StatCard
              title="Total Pengeluaran"
              value={formatRupiah(data.ringkasan.pengeluaran)}
              icon={TrendingDown}
              color="rose"
            />
            <StatCard
              title="Saldo Saat Ini"
              value={formatRupiah(data.ringkasan.saldo)}
              icon={Wallet}
              color="amber"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-emerald-50">
                <h2 className="font-semibold text-emerald-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Pemasukan
                </h2>
              </div>
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {pemasukan.map((t) => (
                  <div key={t.id} className="px-6 py-4 flex justify-between items-start gap-3 hover:bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900">{t.deskripsi}</p>
                      <p className="text-sm text-slate-500">{t.kategori} · {formatTanggal(t.tanggal)}</p>
                    </div>
                    <p className="font-semibold text-emerald-600 whitespace-nowrap">+{formatRupiah(t.jumlah)}</p>
                  </div>
                ))}
                {pemasukan.length === 0 && (
                  <p className="text-center text-slate-500 py-8">Belum ada pemasukan.</p>
                )}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-rose-50">
                <h2 className="font-semibold text-rose-800 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Pengeluaran
                </h2>
              </div>
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {pengeluaran.map((t) => (
                  <div key={t.id} className="px-6 py-4 flex justify-between items-start gap-3 hover:bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900">{t.deskripsi}</p>
                      <p className="text-sm text-slate-500">{t.kategori} · {formatTanggal(t.tanggal)}</p>
                    </div>
                    <p className="font-semibold text-rose-600 whitespace-nowrap">-{formatRupiah(t.jumlah)}</p>
                  </div>
                ))}
                {pengeluaran.length === 0 && (
                  <p className="text-center text-slate-500 py-8">Belum ada pengeluaran.</p>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
