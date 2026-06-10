"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, MapPin, ImageIcon } from "lucide-react";
import { useLiveData } from "@/hooks/useLiveData";
import { LiveIndicator } from "@/components/LiveIndicator";
import { PageShell } from "@/components/PageShell";
import { formatTanggal, statusKegiatanLabel } from "@/lib/format";
import { card, linkPrimary, statusBadge } from "@/lib/ui";
import type { Kegiatan } from "@/lib/types";

export default function KegiatanDetailContent({
  id,
  initialData,
}: {
  id: string;
  initialData: Kegiatan;
}) {
  const { data, loading, refreshing, lastUpdated, refresh } = useLiveData<Kegiatan>(
    `/api/kegiatan/${id}`,
    { initialData }
  );

  if (loading && !data) {
    return (
      <PageShell className="max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-slate-200 rounded w-32" />
          <div className="h-10 bg-slate-200 rounded w-2/3" />
          <div className="h-48 bg-slate-200 rounded-xl" />
        </div>
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell className="max-w-4xl py-16 text-center">
        <p className="text-slate-500 mb-4">Kegiatan tidak ditemukan.</p>
        <Link href="/kegiatan" className={`${linkPrimary} font-medium`}>
          ← Kembali ke daftar kegiatan
        </Link>
      </PageShell>
    );
  }

  const fotos = data.fotos ?? [];

  return (
    <PageShell className="max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <Link
          href="/kegiatan"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#004ac6] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Kegiatan
        </Link>
        <LiveIndicator lastUpdated={lastUpdated} onRefresh={refresh} refreshing={refreshing} variant="blue" />
      </div>

      <article className={`${card} overflow-hidden`}>
        <div className="p-6 sm:p-8 border-b border-[var(--rt-border)]">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{data.judul}</h1>
            <span className={`inline-flex self-start text-[10px] font-semibold uppercase px-3 py-1 rounded-full shadow-sm ${statusBadge[data.status]}`}>
              {statusKegiatanLabel(data.status)}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-6">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-[#004ac6]" />
              {formatTanggal(data.tanggal)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[#004ac6]" />
              {data.lokasi}
            </span>
          </div>

          <p className="text-slate-600 leading-relaxed">{data.deskripsi}</p>
        </div>

        {data.detail && (
          <div className="p-6 sm:p-8 border-b border-[var(--rt-border)] bg-blue-50/30">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Detail Kegiatan</h2>
            <div className="text-slate-600 leading-relaxed whitespace-pre-line">{data.detail}</div>
          </div>
        )}

        <div className="p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-[#004ac6]" />
            Dokumentasi Foto
            {fotos.length > 0 && (
              <span className="text-sm font-normal text-slate-400">({fotos.length} foto)</span>
            )}
          </h2>

          {fotos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fotos.map((foto) => (
                <figure
                  key={foto.id}
                  className="group relative aspect-video rounded-xl overflow-hidden border border-[var(--rt-border)] bg-slate-100"
                >
                  <Image
                    src={`/uploads/kegiatan/${foto.filename}`}
                    alt={foto.original_name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </figure>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl border-2 border-dashed border-[var(--rt-border)] bg-slate-50">
              <ImageIcon className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Belum ada foto dokumentasi kegiatan ini.</p>
            </div>
          )}
        </div>
      </article>
    </PageShell>
  );
}
