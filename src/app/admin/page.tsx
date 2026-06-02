"use client";

import { useState, useEffect } from "react";
import { Lock, LogOut, Plus, Trash2, Save, ChevronDown, ChevronUp, Upload, ImageIcon, Pencil, X, Mail } from "lucide-react";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { formatFileSize, MAX_FOTO_SIZE } from "@/lib/upload";
import type { ProfilRT, Kegiatan, KegiatanFoto, Warga, TransaksiKeuangan } from "@/lib/types";

type Tab = "profil" | "kegiatan" | "warga" | "keuangan";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("profil");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const res = await fetch("/api/auth/check");
    const data = await res.json();
    setAuthenticated(data.authenticated);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setAuthenticated(true);
      setPassword("");
    } else {
      setError(data.error || "Login gagal. Periksa email dan password.");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    setAuthenticated(false);
    setEmail("");
    setPassword("");
  }

  if (authenticated === null) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="animate-pulse h-8 bg-slate-200 rounded w-1/2 mx-auto" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-7 w-7 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Panel Admin RT</h1>
            <p className="text-slate-500 mt-1">Masuk dengan email dan password</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password admin"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Memverifikasi..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "profil", label: "Profil & Visi Misi" },
    { id: "kegiatan", label: "Kegiatan" },
    { id: "warga", label: "Warga" },
    { id: "keuangan", label: "Keuangan" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel Admin RT</h1>
          <p className="text-slate-500 text-sm">Kelola data portal warga</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.id ? "bg-emerald-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profil" && <ProfilForm />}
      {tab === "kegiatan" && <KegiatanForm />}
      {tab === "warga" && <WargaForm />}
      {tab === "keuangan" && <KeuanganForm />}
    </div>
  );
}

function ProfilForm() {
  const [profil, setProfil] = useState<ProfilRT | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profil").then((r) => r.json()).then(setProfil);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profil) return;
    await fetch("/api/profil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profil),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!profil) return <div className="animate-pulse h-64 bg-slate-200 rounded-2xl" />;

  const fields: { key: keyof ProfilRT; label: string; multiline?: boolean }[] = [
    { key: "nama_rt", label: "Nama RT" },
    { key: "nama_rw", label: "Nama RW" },
    { key: "kelurahan", label: "Kelurahan" },
    { key: "kecamatan", label: "Kecamatan" },
    { key: "kota", label: "Kota" },
    { key: "ketua", label: "Ketua RT" },
    { key: "sekretaris", label: "Sekretaris" },
    { key: "bendahara", label: "Bendahara" },
    { key: "visi", label: "Visi", multiline: true },
    { key: "misi", label: "Misi (satu per baris)", multiline: true },
  ];

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(({ key, label, multiline }) => (
          <div key={key} className={multiline ? "sm:col-span-2" : ""}>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            {multiline ? (
              <textarea
                value={profil[key] as string}
                onChange={(e) => setProfil({ ...profil, [key]: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            ) : (
              <input
                value={profil[key] as string}
                onChange={(e) => setProfil({ ...profil, [key]: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            )}
          </div>
        ))}
      </div>
      <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700">
        <Save className="h-4 w-4" />
        {saved ? "Tersimpan!" : "Simpan Perubahan"}
      </button>
    </form>
  );
}

function KegiatanForm() {
  const [items, setItems] = useState<Kegiatan[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    detail: "",
    tanggal: "",
    lokasi: "",
    status: "rencana" as const,
  });

  async function load() {
    const res = await fetch("/api/kegiatan");
    setItems(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/kegiatan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ judul: "", deskripsi: "", detail: "", tanggal: "", lokasi: "", status: "rencana" });
    load();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/kegiatan?id=${id}`, { method: "DELETE" });
    if (expandedId === id) setExpandedId(null);
    load();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-slate-200 p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input placeholder="Judul kegiatan" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200" required />
        <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200" required />
        <input placeholder="Lokasi" value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200" required />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "rencana" })} className="px-3 py-2 rounded-xl border border-slate-200">
          <option value="rencana">Rencana</option>
          <option value="berlangsung">Berlangsung</option>
          <option value="selesai">Selesai</option>
        </select>
        <textarea placeholder="Deskripsi singkat" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200" rows={2} required />
        <textarea placeholder="Detail kegiatan (opsional)" value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200" rows={3} />
        <button type="submit" className="sm:col-span-2 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Tambah Kegiatan
        </button>
      </form>
      <div className="space-y-3">
        {items.map((k) => (
          <KegiatanAdminItem
            key={k.id}
            kegiatan={k}
            expanded={expandedId === k.id}
            onToggle={() => setExpandedId(expandedId === k.id ? null : k.id)}
            onDelete={() => handleDelete(k.id)}
            onUpdated={load}
          />
        ))}
      </div>
    </div>
  );
}

function KegiatanAdminItem({
  kegiatan,
  expanded,
  onToggle,
  onDelete,
  onUpdated,
}: {
  kegiatan: Kegiatan;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onUpdated: () => void;
}) {
  const [form, setForm] = useState({
    judul: kegiatan.judul,
    deskripsi: kegiatan.deskripsi,
    detail: kegiatan.detail ?? "",
    tanggal: kegiatan.tanggal,
    lokasi: kegiatan.lokasi,
    status: kegiatan.status,
  });
  const [fotos, setFotos] = useState<KegiatanFoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({
      judul: kegiatan.judul,
      deskripsi: kegiatan.deskripsi,
      detail: kegiatan.detail ?? "",
      tanggal: kegiatan.tanggal,
      lokasi: kegiatan.lokasi,
      status: kegiatan.status,
    });
  }, [kegiatan]);

  useEffect(() => {
    if (expanded) {
      fetch(`/api/kegiatan/${kegiatan.id}`)
        .then((r) => r.json())
        .then((data) => setFotos(data.fotos ?? []));
    }
  }, [expanded, kegiatan.id]);

  async function handleSave() {
    await fetch(`/api/kegiatan/${kegiatan.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onUpdated();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    if (file.size > MAX_FOTO_SIZE) {
      setUploadError("Ukuran foto maksimal 2MB");
      e.target.value = "";
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("foto", file);

    const res = await fetch(`/api/kegiatan/${kegiatan.id}/foto`, {
      method: "POST",
      body: formData,
    });

    setUploading(false);
    e.target.value = "";

    if (!res.ok) {
      const data = await res.json();
      setUploadError(data.error ?? "Gagal upload foto");
      return;
    }

    const foto = await res.json();
    setFotos((prev) => [...prev, foto]);
  }

  async function handleDeleteFoto(fotoId: number) {
    await fetch(`/api/kegiatan/${kegiatan.id}/foto?fotoId=${fotoId}`, { method: "DELETE" });
    setFotos((prev) => prev.filter((f) => f.id !== fotoId));
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <button type="button" onClick={onToggle} className="flex-1 text-left">
          <p className="font-medium">{kegiatan.judul}</p>
          <p className="text-sm text-slate-500">{formatTanggal(kegiatan.tanggal)} · {kegiatan.status}</p>
        </button>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onToggle} className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button type="button" onClick={onDelete} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Judul</label>
              <input
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Kegiatan["status"] })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="rencana">Rencana</option>
                <option value="berlangsung">Berlangsung</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi</label>
              <input
                value={form.lokasi}
                onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Singkat</label>
              <textarea
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Detail Kegiatan</label>
              <textarea
                value={form.detail}
                onChange={(e) => setForm({ ...form, detail: e.target.value })}
                rows={4}
                placeholder="Tulis detail lengkap kegiatan..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700"
          >
            <Save className="h-4 w-4" />
            {saved ? "Tersimpan!" : "Simpan Perubahan"}
          </button>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Foto Dokumentasi (maks. 2MB per foto)
            </label>

            <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors">
              <Upload className="h-6 w-6 text-slate-400" />
              <span className="text-sm text-slate-600">
                {uploading ? "Mengupload..." : "Klik untuk upload foto"}
              </span>
              <span className="text-xs text-slate-400">JPG, PNG, WEBP, GIF · Maks. 2MB</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            {uploadError && <p className="text-sm text-rose-600 mt-2">{uploadError}</p>}

            {fotos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {fotos.map((foto) => (
                  <div key={foto.id} className="relative group rounded-lg overflow-hidden border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/uploads/kegiatan/${foto.filename}`}
                      alt={foto.original_name}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs px-2 py-1 truncate">
                      {foto.original_name} · {formatFileSize(foto.size)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteFoto(foto.id)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function WargaForm() {
  const [items, setItems] = useState<Warga[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ nama: "", alamat: "", no_hp: "", status: "aktif" as Warga["status"] });
  const [form, setForm] = useState({ nama: "", alamat: "", no_hp: "", status: "aktif" as const });
  const [saved, setSaved] = useState(false);

  async function load() {
    const res = await fetch("/api/warga");
    setItems(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/warga", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ nama: "", alamat: "", no_hp: "", status: "aktif" });
    load();
  }

  function startEdit(w: Warga) {
    setEditingId(w.id);
    setEditForm({ nama: w.nama, alamat: w.alamat, no_hp: w.no_hp, status: w.status });
    setSaved(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setSaved(false);
  }

  async function handleSaveEdit(id: number) {
    await fetch(`/api/warga?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setSaved(true);
    setEditingId(null);
    load();
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleDelete(id: number) {
    await fetch(`/api/warga?id=${id}`, { method: "DELETE" });
    if (editingId === id) setEditingId(null);
    load();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-slate-200 p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input placeholder="Nama lengkap" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200" required />
        <input placeholder="No. HP" value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200" required />
        <input placeholder="Alamat" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200" required />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "aktif" })} className="px-3 py-2 rounded-xl border border-slate-200">
          <option value="aktif">Aktif</option>
          <option value="pindah">Pindah</option>
        </select>
        <button type="submit" className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Tambah Warga
        </button>
      </form>
      {saved && <p className="text-sm text-emerald-600 font-medium">Perubahan warga berhasil disimpan.</p>}
      <div className="space-y-2">
        {items.map((w) => (
          editingId === w.id ? (
            <div key={w.id} className="bg-white rounded-xl border border-emerald-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={editForm.nama} onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })} placeholder="Nama" className="px-3 py-2 rounded-xl border border-slate-200" />
              <input value={editForm.no_hp} onChange={(e) => setEditForm({ ...editForm, no_hp: e.target.value })} placeholder="No. HP" className="px-3 py-2 rounded-xl border border-slate-200" />
              <input value={editForm.alamat} onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })} placeholder="Alamat" className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200" />
              <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Warga["status"] })} className="px-3 py-2 rounded-xl border border-slate-200">
                <option value="aktif">Aktif</option>
                <option value="pindah">Pindah</option>
              </select>
              <div className="flex gap-2">
                <button type="button" onClick={() => handleSaveEdit(w.id)} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700">
                  <Save className="h-4 w-4" /> Simpan
                </button>
                <button type="button" onClick={cancelEdit} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50">
                  <X className="h-4 w-4" /> Batal
                </button>
              </div>
            </div>
          ) : (
            <div key={w.id} className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
              <div>
                <p className="font-medium">{w.nama}</p>
                <p className="text-sm text-slate-500">{w.alamat} · {w.no_hp} · {w.status}</p>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => startEdit(w)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleDelete(w.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

function KeuanganForm() {
  const [items, setItems] = useState<TransaksiKeuangan[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    jenis: "pemasukan" as TransaksiKeuangan["jenis"],
    kategori: "",
    deskripsi: "",
    jumlah: "",
    tanggal: "",
  });
  const [form, setForm] = useState({ jenis: "pemasukan" as const, kategori: "", deskripsi: "", jumlah: "", tanggal: "" });
  const [saved, setSaved] = useState(false);

  async function load() {
    const res = await fetch("/api/keuangan");
    const data = await res.json();
    setItems(data.transaksi);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/keuangan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, jumlah: Number(form.jumlah) }),
    });
    setForm({ jenis: "pemasukan", kategori: "", deskripsi: "", jumlah: "", tanggal: "" });
    load();
  }

  function startEdit(t: TransaksiKeuangan) {
    setEditingId(t.id);
    setEditForm({
      jenis: t.jenis,
      kategori: t.kategori,
      deskripsi: t.deskripsi,
      jumlah: String(t.jumlah),
      tanggal: t.tanggal,
    });
    setSaved(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setSaved(false);
  }

  async function handleSaveEdit(id: number) {
    await fetch(`/api/keuangan?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, jumlah: Number(editForm.jumlah) }),
    });
    setSaved(true);
    setEditingId(null);
    load();
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleDelete(id: number) {
    await fetch(`/api/keuangan?id=${id}`, { method: "DELETE" });
    if (editingId === id) setEditingId(null);
    load();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-slate-200 p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <select value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value as "pemasukan" })} className="px-3 py-2 rounded-xl border border-slate-200">
          <option value="pemasukan">Pemasukan</option>
          <option value="pengeluaran">Pengeluaran</option>
        </select>
        <input type="number" placeholder="Jumlah (Rp)" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200" required />
        <input placeholder="Kategori" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200" required />
        <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200" required />
        <input placeholder="Deskripsi" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200" required />
        <button type="submit" className="sm:col-span-2 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Tambah Transaksi
        </button>
      </form>
      {saved && <p className="text-sm text-emerald-600 font-medium">Perubahan keuangan berhasil disimpan.</p>}
      <div className="space-y-2">
        {items.map((t) => (
          editingId === t.id ? (
            <div key={t.id} className="bg-white rounded-xl border border-emerald-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={editForm.jenis} onChange={(e) => setEditForm({ ...editForm, jenis: e.target.value as TransaksiKeuangan["jenis"] })} className="px-3 py-2 rounded-xl border border-slate-200">
                <option value="pemasukan">Pemasukan</option>
                <option value="pengeluaran">Pengeluaran</option>
              </select>
              <input type="number" value={editForm.jumlah} onChange={(e) => setEditForm({ ...editForm, jumlah: e.target.value })} placeholder="Jumlah (Rp)" className="px-3 py-2 rounded-xl border border-slate-200" />
              <input value={editForm.kategori} onChange={(e) => setEditForm({ ...editForm, kategori: e.target.value })} placeholder="Kategori" className="px-3 py-2 rounded-xl border border-slate-200" />
              <input type="date" value={editForm.tanggal} onChange={(e) => setEditForm({ ...editForm, tanggal: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200" />
              <input value={editForm.deskripsi} onChange={(e) => setEditForm({ ...editForm, deskripsi: e.target.value })} placeholder="Deskripsi" className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200" />
              <div className="flex gap-2 sm:col-span-2">
                <button type="button" onClick={() => handleSaveEdit(t.id)} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700">
                  <Save className="h-4 w-4" /> Simpan
                </button>
                <button type="button" onClick={cancelEdit} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50">
                  <X className="h-4 w-4" /> Batal
                </button>
              </div>
            </div>
          ) : (
            <div key={t.id} className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
              <div>
                <p className="font-medium">{t.deskripsi}</p>
                <p className="text-sm text-slate-500">
                  {t.jenis === "pemasukan" ? "+" : "-"}{formatRupiah(t.jumlah)} · {t.kategori} · {formatTanggal(t.tanggal)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => startEdit(t)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleDelete(t.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
