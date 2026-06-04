"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Kegiatan } from "@/lib/types";
import {
  buildSnapshot,
  detectKegiatanChanges,
  isKegiatanNotifyEnabled,
  loadSnapshot,
  saveSnapshot,
  showKegiatanNotification,
} from "@/lib/kegiatan-notify";

const POLL_INTERVAL = process.env.NODE_ENV === "development" ? 30_000 : 10_000;

export function KegiatanNotifications() {
  const pathname = usePathname();
  const baselineSet = useRef(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(isKegiatanNotifyEnabled());
    sync();
    window.addEventListener("kegiatan-notify-changed", sync);
    return () => window.removeEventListener("kegiatan-notify-changed", sync);
  }, []);

  useEffect(() => {
    baselineSet.current = false;
  }, [enabled]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (!enabled) return;

    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/kegiatan", { cache: "no-store" });
        if (!res.ok || cancelled) return;

        const items = (await res.json()) as Kegiatan[];
        const previous = loadSnapshot();
        const current = buildSnapshot(items);

        if (!baselineSet.current) {
          saveSnapshot(current);
          baselineSet.current = true;
          return;
        }

        const changes = detectKegiatanChanges(previous, items);
        if (changes.length > 0) {
          saveSnapshot(current);
          for (const change of changes.slice(0, 3)) {
            showKegiatanNotification(change);
          }
        }
      } catch {
        /* abaikan error jaringan */
      }
    }

    poll();
    const timer = setInterval(poll, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [pathname, enabled]);

  return null;
}
