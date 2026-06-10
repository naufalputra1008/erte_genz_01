export interface ProfilRT {
  nama_rt: string;
  nama_rw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  ketua: string;
  sekretaris: string;
  bendahara: string;
  visi: string;
  misi: string;
  updated_at: string;
}

export interface Kegiatan {
  id: number;
  judul: string;
  deskripsi: string;
  detail: string;
  tanggal: string;
  lokasi: string;
  status: "rencana" | "berlangsung" | "selesai";
  created_at: string;
  fotos?: KegiatanFoto[];
}

export interface KegiatanFoto {
  id: number;
  kegiatan_id: number;
  filename: string;
  original_name: string;
  size: number;
  created_at: string;
}

export interface Warga {
  id: number;
  nama: string;
  alamat: string;
  no_hp: string;
  no_ktp: string;
  status: "aktif" | "pindah";
  created_at: string;
}

export type WargaPublic = Omit<Warga, "no_ktp">;

export interface KeuanganAksesLog {
  id: number;
  warga_id: number;
  no_ktp: string;
  nama_warga: string;
  session_id: string;
  accessed_at: string;
}

export interface TransaksiKeuangan {
  id: number;
  jenis: "pemasukan" | "pengeluaran";
  kategori: string;
  deskripsi: string;
  jumlah: number;
  tanggal: string;
  created_at: string;
}

export interface DashboardData {
  profil: ProfilRT;
  total_warga: number;
  total_pemasukan: number;
  total_pengeluaran: number;
  saldo: number;
  kegiatan_aktif: number;
  kegiatan_terbaru: Kegiatan[];
  transaksi_terbaru: TransaksiKeuangan[];
  updated_at: string;
}
