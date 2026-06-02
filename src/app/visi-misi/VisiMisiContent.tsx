"use client";

import { Target, Eye, Users, UserCheck } from "lucide-react";
import { useLiveData } from "@/hooks/useLiveData";
import { LiveIndicator } from "@/components/LiveIndicator";
import { PageHeader } from "@/components/PageHeader";
import type { ProfilRT } from "@/lib/types";

export default function VisiMisiContent({ initialData }: { initialData: ProfilRT }) {
  const { data, loading, refreshing, lastUpdated, refresh } = useLiveData<ProfilRT>("/api/profil", {
    initialData,
  });

  if (loading && !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="h-48 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const misiItems = data.misi.split("\n").filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        title="Visi & Misi RT"
        description={`Profil dan arah pengembangan ${data.nama_rt}`}
      >
        <LiveIndicator lastUpdated={lastUpdated} onRefresh={refresh} refreshing={refreshing} />
      </PageHeader>

      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 sm:p-8 text-white mb-6 shadow-lg">
        <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">{data.nama_rw}</p>
        <h2 className="text-3xl font-bold mt-1">{data.nama_rt}</h2>
        <p className="text-emerald-100 mt-2">
          {data.kelurahan}, {data.kecamatan}, {data.kota}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-100">
              <Eye className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Visi</h3>
          </div>
          <p className="text-slate-600 leading-relaxed text-lg">{data.visi}</p>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-teal-100">
              <Target className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Misi</h3>
          </div>
          <ul className="space-y-3">
            {misiItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-600">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{item.replace(/^\d+\.\s*/, "")}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-600" />
          Pengurus RT
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { jabatan: "Ketua RT", nama: data.ketua },
            { jabatan: "Sekretaris", nama: data.sekretaris },
            { jabatan: "Bendahara", nama: data.bendahara },
          ].map((p) => (
            <div key={p.jabatan} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="p-2.5 rounded-full bg-emerald-100">
                <UserCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">{p.jabatan}</p>
                <p className="font-semibold text-slate-900">{p.nama}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
