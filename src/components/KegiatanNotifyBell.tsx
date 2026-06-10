"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import {
  isKegiatanNotifyEnabled,
  isKegiatanNotifySupported,
  setKegiatanNotifyEnabled,
} from "@/lib/kegiatan-notify";

export function KegiatanNotifyBell() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    "default"
  );

  useEffect(() => {
    const ok = isKegiatanNotifySupported();
    setSupported(ok);
    if (!ok) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
    setEnabled(isKegiatanNotifyEnabled() && Notification.permission === "granted");
  }, []);

  const toggle = useCallback(async () => {
    if (!supported) return;

    if (enabled) {
      setKegiatanNotifyEnabled(false);
      setEnabled(false);
      window.dispatchEvent(new Event("kegiatan-notify-changed"));
      return;
    }

    const result =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();

    setPermission(result);

    if (result === "granted") {
      setKegiatanNotifyEnabled(true);
      setEnabled(true);
      sessionStorage.removeItem("kegiatan-notify-snapshot");
      window.dispatchEvent(new Event("kegiatan-notify-changed"));
    }
  }, [enabled, supported]);

  if (!supported) return null;

  const label = enabled
    ? "Notifikasi kegiatan aktif"
    : permission === "denied"
      ? "Notifikasi diblokir browser"
      : "Aktifkan notifikasi kegiatan";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={permission === "denied" && !enabled}
      title={label}
      aria-label={label}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        enabled
          ? "text-[#004ac6] bg-blue-50 hover:bg-blue-100"
          : permission === "denied"
            ? "text-slate-400 cursor-not-allowed"
            : "text-slate-600 hover:text-[#004ac6] hover:bg-blue-50"
      }`}
    >
      {enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
      <span className="hidden lg:inline">{enabled ? "Notif ON" : "Notif"}</span>
    </button>
  );
}
