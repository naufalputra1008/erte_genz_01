import type { Kegiatan } from "./types";
import { formatTanggal, statusKegiatanLabel } from "./format";

export const KEGIATAN_NOTIFY_STORAGE_KEY = "kegiatan-notify-enabled";
export const KEGIATAN_SNAPSHOT_KEY = "kegiatan-notify-snapshot";

export type KegiatanSnapshot = Record<string, string>;

export function isKegiatanNotifySupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function isKegiatanNotifyEnabled(): boolean {
  if (!isKegiatanNotifySupported()) return false;
  return localStorage.getItem(KEGIATAN_NOTIFY_STORAGE_KEY) === "1";
}

export function setKegiatanNotifyEnabled(enabled: boolean): void {
  if (enabled) {
    localStorage.setItem(KEGIATAN_NOTIFY_STORAGE_KEY, "1");
  } else {
    localStorage.removeItem(KEGIATAN_NOTIFY_STORAGE_KEY);
  }
}

export function kegiatanFingerprint(k: Kegiatan): string {
  return [k.judul, k.deskripsi, k.detail ?? "", k.tanggal, k.lokasi, k.status, k.created_at].join(
    "|"
  );
}

export function buildSnapshot(items: Kegiatan[]): KegiatanSnapshot {
  const snapshot: KegiatanSnapshot = {};
  for (const k of items) {
    snapshot[String(k.id)] = kegiatanFingerprint(k);
  }
  return snapshot;
}

export function loadSnapshot(): KegiatanSnapshot | null {
  const raw = sessionStorage.getItem(KEGIATAN_SNAPSHOT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as KegiatanSnapshot;
  } catch {
    return null;
  }
}

export function saveSnapshot(snapshot: KegiatanSnapshot): void {
  sessionStorage.setItem(KEGIATAN_SNAPSHOT_KEY, JSON.stringify(snapshot));
}

export type KegiatanChange =
  | { type: "new"; kegiatan: Kegiatan }
  | { type: "updated"; kegiatan: Kegiatan };

export function detectKegiatanChanges(
  previous: KegiatanSnapshot | null,
  items: Kegiatan[]
): KegiatanChange[] {
  if (!previous) return [];

  const current = buildSnapshot(items);
  const changes: KegiatanChange[] = [];
  const byId = new Map(items.map((k) => [String(k.id), k]));

  for (const [id, fingerprint] of Object.entries(current)) {
    const kegiatan = byId.get(id);
    if (!kegiatan) continue;

    if (!(id in previous)) {
      changes.push({ type: "new", kegiatan });
    } else if (previous[id] !== fingerprint) {
      changes.push({ type: "updated", kegiatan });
    }
  }

  return changes.sort((a, b) => b.kegiatan.id - a.kegiatan.id);
}

export function showKegiatanNotification(change: KegiatanChange): void {
  if (!isKegiatanNotifySupported() || Notification.permission !== "granted") return;

  const { kegiatan } = change;
  const isNew = change.type === "new";
  const title = isNew ? "Kegiatan Baru" : "Kegiatan Diperbarui";
  const body = `${kegiatan.judul} · ${statusKegiatanLabel(kegiatan.status)} · ${formatTanggal(kegiatan.tanggal)}`;

  const notification = new Notification(title, {
    body,
    icon: "/logo.png",
    tag: `kegiatan-${kegiatan.id}-${change.type}`,
  });

  notification.onclick = () => {
    window.focus();
    window.location.href = `/kegiatan/${kegiatan.id}`;
    notification.close();
  };
}
