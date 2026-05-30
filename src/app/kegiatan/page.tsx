"use client";

import Link from "next/link";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { useLiveData } from "@/hooks/useLiveData";
import { LiveIndicator } from "@/components/LiveIndicator";
import { PageHeader } from "@/components/PageHeader";
import { formatTanggal, statusKegiatanLabel } from "@/lib/format";
import type { Kegiatan } from "@/lib/types";

export default function KegiatanPage() {
  const { data, loading, lastUpdated, refresh } = useLiveData<Kegiatan[]>("/api/kegiatan");

  const statusColor: Record<string, string> = {
    rencana: "bg-blue-100 text-blue-700 border-blue-200",
    berlangsung: "bg-emerald-100 text-emerald-700 border-emerald-200",
    selesai: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        title="Informasi Kegiatan RT"
        description="Jadwal dan informasi kegiatan warga secara aktual"
      >
        <LiveIndicator lastUpdated={lastUpdated} onRefresh={refresh} loading={loading} />
      </PageHeader>

      {loading && !data ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.map((k) => (
            <Link
              key={k.id}
              href={`/kegiatan/${k.id}`}
              className="block bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <h2 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {k.judul}
                </h2>
                <span className={`inline-flex self-start text-xs font-semibold px-3 py-1 rounded-full border ${statusColor[k.status]}`}>
                  {statusKegiatanLabel(k.status)}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed mb-4 line-clamp-2">{k.deskripsi}</p>
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
                <div className="flex flex-wrap gap-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    {formatTanggal(k.tanggal)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    {k.lokasi}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-emerald-600 font-medium group-hover:gap-2 transition-all">
                  Lihat detail <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
          {data?.length === 0 && (
            <p className="text-center text-slate-500 py-12">Belum ada kegiatan terdaftar.</p>
          )}
        </div>
      )}
    </div>
  );
}
