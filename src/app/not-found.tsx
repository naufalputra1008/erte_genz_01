import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Halaman tidak ditemukan</h1>
      <p className="text-slate-500 mb-6">Data mungkin sudah dihapus atau tautan tidak valid.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/kegiatan"
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700"
        >
          Daftar Kegiatan
        </Link>
        <Link
          href="/"
          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
        >
          Beranda
        </Link>
      </div>
    </div>
  );
}
