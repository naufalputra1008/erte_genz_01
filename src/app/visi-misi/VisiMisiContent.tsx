"use client";

import { Target, Eye, Users, UserCheck } from "lucide-react";
import { useLiveData } from "@/hooks/useLiveData";
import { LiveIndicator } from "@/components/LiveIndicator";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { card } from "@/lib/ui";
import type { ProfilRT } from "@/lib/types";

export default function VisiMisiContent({ initialData }: { initialData: ProfilRT }) {
  const { data, loading, refreshing, lastUpdated, refresh } = useLiveData<ProfilRT>("/api/profil", {
    initialData,
  });

  if (loading && !data) {
    return (
      <PageShell>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="h-48 bg-slate-200 rounded-xl" />
        </div>
      </PageShell>
    );
  }

  if (!data) return null;

  const misiItems = data.misi.split("\n").filter(Boolean);

  return (
    <PageShell>
      <PageHeader
        title="Visi & Misi RT"
        description={`Profil dan arah pengembangan ${data.nama_rt}`}
      >
        <LiveIndicator lastUpdated={lastUpdated} onRefresh={refresh} refreshing={refreshing} variant="blue" />
      </PageHeader>

      <div className="bg-gradient-to-br from-[#004ac6] to-[#2563eb] rounded-xl p-6 sm:p-8 text-white mb-6 shadow-md">
        <h2 className="text-2xl sm:text-3xl font-bold">{data.nama_rt}</h2>
        <p className="text-blue-100 mt-2">
          {data.kelurahan}, {data.kecamatan}, {data.kota}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <section className={`${card} p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <Eye className="h-6 w-6 text-[#004ac6]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Visi</h3>
          </div>
          <p className="text-slate-600 leading-relaxed text-lg">{data.visi}</p>
        </section>

        <section className={`${card} p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <Target className="h-6 w-6 text-[#004ac6]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Misi</h3>
          </div>
          <ul className="space-y-3">
            {misiItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-600">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-[#004ac6] text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{item.replace(/^\d+\.\s*/, "")}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className={`${card} p-6`}>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-[#004ac6]" />
          Pengurus RT
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { jabatan: "Ketua RT", nama: data.ketua },
            { jabatan: "Sekretaris", nama: data.sekretaris },
            { jabatan: "Bendahara", nama: data.bendahara },
          ].map((p) => (
            <div key={p.jabatan} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-[var(--rt-border)]">
              <div className="p-2.5 rounded-full bg-blue-100">
                <UserCheck className="h-5 w-5 text-[#004ac6]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{p.jabatan}</p>
                <p className="font-semibold text-slate-900">{p.nama}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
