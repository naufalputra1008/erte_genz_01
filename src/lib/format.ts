export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTanggal(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function formatTanggalWaktu(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export function statusKegiatanLabel(status: string): string {
  const map: Record<string, string> = {
    rencana: "Rencana",
    berlangsung: "Berlangsung",
    selesai: "Selesai",
  };
  return map[status] ?? status;
}

export function splitNamaBelakang(nama: string): { depan: string; belakang: string | null } {
  const parts = nama.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { depan: parts[0] ?? "", belakang: null };
  }
  const belakang = parts.pop()!;
  return { depan: parts.join(" "), belakang };
}
