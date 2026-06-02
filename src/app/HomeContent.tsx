"use client";

import Link from "next/link";
import { Users, Calendar, TrendingUp, TrendingDown, Wallet, ArrowRight } from "lucide-react";
import { useLiveData } from "@/hooks/useLiveData";
import { LiveIndicator } from "@/components/LiveIndicator";
import { StatCard } from "@/components/StatCard";
import { formatRupiah, formatTanggal, statusKegiatanLabel } from "@/lib/format";
import type { DashboardData } from "@/lib/types";

const statusColor: Record<string, string> = {
  rencana: "bg-blue-100 text-blue-700",
  berlangsung: "bg-emerald-100 text-emerald-700",
  selesai: "bg-slate-100 text-slate-600",
};

export default function HomeContent({ initialData }: { initialData: DashboardData }) {
  const { data, loading, refreshing, lastUpdated, refresh } = useLiveData<DashboardData>(
    "/api/dashboard",
    { initialData }
  );

  if (loading && !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wide">
            {data.profil.nama_rw} · {data.profil.kelurahan}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
            Selamat Datang, Warga {data.profil.nama_rt}
          </h1>
          <p className="text-slate-500 mt-2">
            Ketua RT: {data.profil.ketua} · {data.profil.kelurahan}
          </p>
        </div>
        <LiveIndicator lastUpdated={lastUpdated} onRefresh={refresh} refreshing={refreshing} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Warga Aktif"
          value={String(data.total_warga)}
          subtitle="KK terdaftar"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Kegiatan Aktif"
          value={String(data.kegiatan_aktif)}
          subtitle="Rencana & berlangsung"
          icon={Calendar}
          color="emerald"
        />
        <StatCard
          title="Total Pemasukan"
          value={formatRupiah(data.total_pemasukan)}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Saldo Keuangan"
          value={formatRupiah(data.saldo)}
          subtitle={`Pengeluaran: ${formatRupiah(data.total_pengeluaran)}`}
          icon={Wallet}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Kegiatan Terbaru</h2>
            <Link href="/kegiatan" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Lihat semua <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {data.kegiatan_terbaru.map((k) => (
              <Link key={k.id} href={`/kegiatan/${k.id}`} className="block px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{k.judul}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{formatTanggal(k.tanggal)} · {k.lokasi}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${statusColor[k.status]}`}>
                    {statusKegiatanLabel(k.status)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Transaksi Keuangan Terbaru</h2>
            <Link href="/keuangan" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Lihat semua <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {data.transaksi_terbaru.map((t) => (
              <div key={t.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${t.jenis === "pemasukan" ? "bg-emerald-100" : "bg-rose-100"}`}>
                      {t.jenis === "pemasukan" ? (
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-rose-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{t.deskripsi}</p>
                      <p className="text-sm text-slate-500">{t.kategori} · {formatTanggal(t.tanggal)}</p>
                    </div>
                  </div>
                  <p className={`font-semibold whitespace-nowrap ${t.jenis === "pemasukan" ? "text-emerald-600" : "text-rose-600"}`}>
                    {t.jenis === "pemasukan" ? "+" : "-"}{formatRupiah(t.jumlah)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
        {[
          { href: "/kegiatan", label: "Kegiatan RT", emoji: "📅" },
          { href: "/visi-misi", label: "Visi & Misi", emoji: "🎯" },
          { href: "/warga", label: "Data Warga", emoji: "👥" },
          { href: "/keuangan", label: "Keuangan", emoji: "💰" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-center"
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className="text-sm font-medium text-slate-700">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
