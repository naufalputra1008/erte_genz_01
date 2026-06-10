"use client";

import { useState } from "react";
import { Search, MapPin, Phone } from "lucide-react";
import { useLiveData } from "@/hooks/useLiveData";
import { LiveIndicator } from "@/components/LiveIndicator";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { splitNamaBelakang } from "@/lib/format";
import { card, filterActive, filterInactive, input } from "@/lib/ui";
import type { WargaPublic, ProfilRT } from "@/lib/types";

export default function WargaContent({
  initialWarga,
  initialProfil,
}: {
  initialWarga: WargaPublic[];
  initialProfil: ProfilRT;
}) {
  const { data, loading, refreshing, lastUpdated, refresh } = useLiveData<WargaPublic[]>("/api/warga", {
    initialData: initialWarga,
  });
  const { data: profil } = useLiveData<ProfilRT>("/api/profil", { initialData: initialProfil });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "aktif" | "pindah">("all");

  const filtered = data?.filter((w) => {
    const matchSearch =
      w.nama.toLowerCase().includes(search.toLowerCase()) ||
      w.alamat.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || w.status === filter;
    return matchSearch && matchFilter;
  });

  const aktifCount = data?.filter((w) => w.status === "aktif").length ?? 0;

  return (
    <PageShell>
      <PageHeader
        title={`Data Warga ${profil?.nama_rt ?? "RT 01 Taman Balaraja"}`}
        description={`${aktifCount} warga aktif terdaftar — data diperbarui secara live`}
      >
        <LiveIndicator lastUpdated={lastUpdated} onRefresh={refresh} refreshing={refreshing} variant="blue" />
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau alamat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${input} pl-10`}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "aktif", "pindah"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                filter === f ? filterActive : filterInactive
              }`}
            >
              {f === "all" ? "Semua" : f === "aktif" ? "Aktif" : "Pindah"}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-[var(--rt-border)]">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">No</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nama</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Alamat</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">No. HP</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered?.map((w, i) => {
                  const { depan, belakang } = splitNamaBelakang(w.nama);
                  return (
                  <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-500">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <span title="Nama belakang dirahasiakan">
                        {depan}
                        {belakang && (
                          <>
                            {" "}
                            <span className="blur-[5px] select-none pointer-events-none" aria-hidden="true">
                              {belakang}
                            </span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5" title="Alamat dirahasiakan">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="blur-[5px] select-none pointer-events-none" aria-hidden="true">
                          {w.alamat}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5" title="Nomor HP dirahasiakan">
                        <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="blur-[5px] select-none pointer-events-none" aria-hidden="true">
                          {w.no_hp}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        w.status === "aktif" ? "bg-blue-100 text-[#004ac6]" : "bg-slate-100 text-slate-500"
                      }`}>
                        {w.status === "aktif" ? "Aktif" : "Pindah"}
                      </span>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered?.length === 0 && (
            <p className="text-center text-slate-500 py-12">Tidak ada data warga ditemukan.</p>
          )}
        </div>
      )}
    </PageShell>
  );
}
