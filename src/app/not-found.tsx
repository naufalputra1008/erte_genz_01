import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { btnOutline, btnPrimary, card } from "@/lib/ui";

export default function NotFound() {
  return (
    <PageShell className="py-20 text-center">
      <div className={`${card} max-w-md mx-auto p-8`}>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Halaman tidak ditemukan</h1>
        <p className="text-slate-500 mb-6">Data mungkin sudah dihapus atau tautan tidak valid.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/kegiatan" className={`px-4 py-2.5 ${btnPrimary}`}>
            Daftar Kegiatan
          </Link>
          <Link href="/" className={`px-4 py-2.5 ${btnOutline}`}>
            Beranda
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
