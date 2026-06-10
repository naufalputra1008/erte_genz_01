"use client";

import Link from "next/link";
import {
  Users,
  Calendar,
  TrendingUp,
  Wallet,
  ArrowRight,
  CalendarDays,
  MapPin,
  HandCoins,
  ShoppingCart,
  HeartHandshake,
} from "lucide-react";
import { useLiveData } from "@/hooks/useLiveData";
import { LiveIndicator } from "@/components/LiveIndicator";
import { PageShell } from "@/components/PageShell";
import { StatCard } from "@/components/StatCard";
import { BlurValue } from "@/components/BlurValue";
import { formatRupiah, formatTanggal, statusKegiatanLabel } from "@/lib/format";
import { btnOutline, card, linkPrimaryBold, sectionTitle, statusBadge } from "@/lib/ui";
import type { DashboardData } from "@/lib/types";

const quickLinks = [
  { href: "/kegiatan", label: "Kegiatan RT", emoji: "📅", bg: "bg-orange-50" },
  { href: "/visi-misi", label: "Visi & Misi", emoji: "🎯", bg: "bg-blue-50" },
  { href: "/warga", label: "Data Warga", emoji: "👥", bg: "bg-emerald-50" },
  { href: "/keuangan", label: "Keuangan", emoji: "💰", bg: "bg-yellow-50" },
];

function transactionIcon(jenis: string, kategori: string) {
  if (jenis === "pemasukan") return HeartHandshake;
  if (kategori.toLowerCase().includes("operasional")) return HandCoins;
  return ShoppingCart;
}

export default function HomeContent({ initialData }: { initialData: DashboardData }) {
  const { data, loading, refreshing, lastUpdated, refresh } = useLiveData<DashboardData>(
    "/api/dashboard",
    { initialData }
  );

  if (loading && !data) {
    return (
      <PageShell className="py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-slate-200 rounded w-2/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl" />
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  if (!data) return null;

  const featuredKegiatan = data.kegiatan_terbaru[0];

  return (
    <PageShell>
      <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-1">
            Selamat Datang, Warga {data.profil.nama_rt}
          </h1>
          <p className="text-slate-500">
            Ketua RT: <span className="font-bold text-[#004ac6]">{data.profil.ketua}</span>
          </p>
        </div>
        <LiveIndicator
          lastUpdated={lastUpdated}
          onRefresh={refresh}
          refreshing={refreshing}
          variant="blue"
        />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Total Warga Aktif"
          value={String(data.total_warga)}
          subtitle="KK terdaftar"
          icon={Users}
          color="blue"
          variant="modern"
        />
        <StatCard
          title="Kegiatan Aktif"
          value={String(data.kegiatan_aktif)}
          subtitle="Rencana & berlangsung"
          icon={Calendar}
          color="emerald"
          variant="modern"
        />
        <StatCard
          title="Total Pemasukan"
          value={formatRupiah(data.total_pemasukan)}
          subtitle="Akumulasi tahun berjalan"
          icon={TrendingUp}
          color="emerald"
          variant="modern"
          blurHalf
        />
        <StatCard
          title="Saldo Keuangan"
          value={formatRupiah(data.saldo)}
          subtitle={`Pengeluaran: ${formatRupiah(data.total_pengeluaran)}`}
          icon={Wallet}
          color="amber"
          variant="modern"
          blurHalf
          blurSubtitle
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <section className="lg:col-span-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className={sectionTitle}>Kegiatan Terbaru</h2>
            <Link href="/kegiatan" className={linkPrimaryBold}>
              Lihat semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featuredKegiatan ? (
            <div className={`${card} p-6`}>
              <div className="relative overflow-hidden rounded-lg mb-4 group">
                <div className="h-40 bg-gradient-to-br from-blue-100 via-slate-100 to-blue-50 overflow-hidden flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-blue-200" />
                </div>
                <span
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-semibold uppercase shadow-md ${statusBadge[featuredKegiatan.status]}`}
                >
                  {statusKegiatanLabel(featuredKegiatan.status)}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">{featuredKegiatan.judul}</h3>
              <div className="flex flex-wrap items-center gap-4 text-slate-500 mb-4">
                <div className="flex items-center gap-1.5 text-xs">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>{formatTanggal(featuredKegiatan.tanggal)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{featuredKegiatan.lokasi}</span>
                </div>
              </div>
              <Link
                href={`/kegiatan/${featuredKegiatan.id}`}
                className={`block w-full py-2.5 text-center ${btnOutline}`}
              >
                Detail Kegiatan
              </Link>
            </div>
          ) : (
            <div className={`${card} p-6 text-center text-slate-500`}>
              Belum ada kegiatan.
            </div>
          )}
        </section>

        <section className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className={sectionTitle}>Transaksi Keuangan Terbaru</h2>
            <Link href="/keuangan" className={linkPrimaryBold}>
              Lihat semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className={`${card} overflow-hidden`}>
            {data.transaksi_terbaru.map((t, i) => {
              const TxIcon = transactionIcon(t.jenis, t.kategori);
              const isLast = i === data.transaksi_terbaru.length - 1;
              return (
                <div
                  key={t.id}
                  className={`p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors ${
                    !isLast ? "border-b border-[var(--rt-border)]" : ""
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      t.jenis === "pemasukan" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                    }`}
                  >
                    <TxIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{t.deskripsi}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      {formatTanggal(t.tanggal)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold ${t.jenis === "pemasukan" ? "text-green-600" : "text-red-500"}`}>
                      <BlurValue>
                        {t.jenis === "pengeluaran" ? "-" : "+"}
                        {formatRupiah(t.jumlah)}
                      </BlurValue>
                    </p>
                    <p className="text-xs text-slate-500">{t.kategori}</p>
                  </div>
                </div>
              );
            })}
            {data.transaksi_terbaru.length === 0 && (
              <p className="text-center text-slate-500 py-10">Belum ada transaksi.</p>
            )}
          </div>
        </section>
      </div>

      <section className="mb-10">
        <h2 className={`${sectionTitle} mb-6`}>Akses Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${card} p-8 rounded-2xl flex flex-col items-center justify-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all group`}
            >
              <div
                className={`w-16 h-16 rounded-full ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <span className="text-3xl">{item.emoji}</span>
              </div>
              <span className="text-sm font-bold text-slate-900 text-center">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
