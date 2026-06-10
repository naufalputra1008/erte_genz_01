"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Wallet, HandCoins, ShoppingCart, HeartHandshake } from "lucide-react";
import { useLiveData } from "@/hooks/useLiveData";
import { LiveIndicator } from "@/components/LiveIndicator";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { StatCard } from "@/components/StatCard";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { card, sectionTitle } from "@/lib/ui";
import type { KeuanganResponse } from "@/lib/keuangan";
import KeuanganKtpGate from "./KeuanganKtpGate";

function transactionIcon(jenis: string, kategori: string) {
  if (jenis === "pemasukan") return HeartHandshake;
  if (kategori.toLowerCase().includes("operasional")) return HandCoins;
  return ShoppingCart;
}

export default function KeuanganContent() {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/keuangan/warga-access").then((r) => r.json()),
      fetch("/api/auth/check").then((r) => r.json()),
    ])
      .then(([wargaAccess, auth]) => setUnlocked(!!wargaAccess.granted || !!auth.authenticated))
      .catch(() => setUnlocked(false));
  }, []);

  const { data, loading, refreshing, lastUpdated, refresh } = useLiveData<KeuanganResponse>(
    "/api/keuangan",
    { enabled: unlocked === true }
  );

  const pemasukan = data?.transaksi.filter((t) => t.jenis === "pemasukan") ?? [];
  const pengeluaran = data?.transaksi.filter((t) => t.jenis === "pengeluaran") ?? [];

  if (unlocked === null) {
    return (
      <PageShell>
        <div className="h-40 bg-slate-200 rounded-xl animate-pulse" />
      </PageShell>
    );
  }

  if (!unlocked) {
    return (
      <PageShell>
        <PageHeader
          title="Keuangan RT"
          description="Laporan pemasukan dan pengeluaran RT — verifikasi diperlukan"
        />
        <KeuanganKtpGate onUnlocked={() => setUnlocked(true)} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Keuangan RT"
        description="Laporan pemasukan dan pengeluaran RT secara transparan dan aktual"
      >
        <LiveIndicator lastUpdated={lastUpdated} onRefresh={refresh} refreshing={refreshing} variant="blue" />
      </PageHeader>

      {loading && !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Pemasukan"
              value={formatRupiah(data.ringkasan.pemasukan)}
              icon={TrendingUp}
              color="emerald"
              variant="modern"
            />
            <StatCard
              title="Total Pengeluaran"
              value={formatRupiah(data.ringkasan.pengeluaran)}
              icon={TrendingDown}
              color="rose"
              variant="modern"
            />
            <StatCard
              title="Saldo Saat Ini"
              value={formatRupiah(data.ringkasan.saldo)}
              icon={Wallet}
              color="amber"
              variant="modern"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className={`${card} overflow-hidden`}>
              <div className="px-6 py-4 border-b border-[var(--rt-border)] bg-blue-50">
                <h2 className={`${sectionTitle} flex items-center gap-2 text-[#004ac6]`}>
                  <TrendingUp className="h-5 w-5" />
                  Pemasukan
                </h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {pemasukan.map((t, i) => {
                  const TxIcon = transactionIcon(t.jenis, t.kategori);
                  const isLast = i === pemasukan.length - 1;
                  return (
                    <div
                      key={t.id}
                      className={`p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors ${
                        !isLast ? "border-b border-[var(--rt-border)]" : ""
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                        <TxIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{t.deskripsi}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{t.kategori} · {formatTanggal(t.tanggal)}</p>
                      </div>
                      <p className="font-bold text-green-600 whitespace-nowrap flex-shrink-0">+{formatRupiah(t.jumlah)}</p>
                    </div>
                  );
                })}
                {pemasukan.length === 0 && (
                  <p className="text-center text-slate-500 py-10">Belum ada pemasukan.</p>
                )}
              </div>
            </section>

            <section className={`${card} overflow-hidden`}>
              <div className="px-6 py-4 border-b border-[var(--rt-border)] bg-red-50">
                <h2 className={`${sectionTitle} flex items-center gap-2 text-red-600`}>
                  <TrendingDown className="h-5 w-5" />
                  Pengeluaran
                </h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {pengeluaran.map((t, i) => {
                  const TxIcon = transactionIcon(t.jenis, t.kategori);
                  const isLast = i === pengeluaran.length - 1;
                  return (
                    <div
                      key={t.id}
                      className={`p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors ${
                        !isLast ? "border-b border-[var(--rt-border)]" : ""
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                        <TxIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{t.deskripsi}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{t.kategori} · {formatTanggal(t.tanggal)}</p>
                      </div>
                      <p className="font-bold text-red-500 whitespace-nowrap flex-shrink-0">
                        -{formatRupiah(t.jumlah)}
                      </p>
                    </div>
                  );
                })}
                {pengeluaran.length === 0 && (
                  <p className="text-center text-slate-500 py-10">Belum ada pengeluaran.</p>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </PageShell>
  );
}
