"use client";

import Link from "next/link";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { useLiveData } from "@/hooks/useLiveData";
import { LiveIndicator } from "@/components/LiveIndicator";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { formatTanggal, statusKegiatanLabel } from "@/lib/format";
import { card, cardHover, linkPrimaryBold, statusBadge } from "@/lib/ui";
import type { Kegiatan } from "@/lib/types";

export default function KegiatanContent({ initialData }: { initialData: Kegiatan[] }) {
  const { data, loading, refreshing, lastUpdated, refresh } = useLiveData<Kegiatan[]>("/api/kegiatan", {
    initialData,
  });

  return (
    <PageShell>
      <PageHeader
        title="Informasi Kegiatan RT"
        description="Jadwal dan informasi kegiatan warga secara aktual"
      >
        <LiveIndicator lastUpdated={lastUpdated} onRefresh={refresh} refreshing={refreshing} variant="blue" />
      </PageHeader>

      {loading && !data ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.map((k) => (
            <Link
              key={k.id}
              href={`/kegiatan/${k.id}`}
              className={`block ${card} p-6 ${cardHover} group`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <h2 className="text-xl font-bold text-slate-900 group-hover:text-[#004ac6] transition-colors">
                  {k.judul}
                </h2>
                <span className={`inline-flex self-start text-[10px] font-semibold uppercase px-3 py-1 rounded-full shadow-sm ${statusBadge[k.status]}`}>
                  {statusKegiatanLabel(k.status)}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed mb-4 line-clamp-2">{k.deskripsi}</p>
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
                <div className="flex flex-wrap gap-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-[#004ac6]" />
                    {formatTanggal(k.tanggal)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[#004ac6]" />
                    {k.lokasi}
                  </span>
                </div>
                <span className={`${linkPrimaryBold} font-medium`}>
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
    </PageShell>
  );
}
