"use client";

import { useCallback, useEffect, useState } from "react";

interface UseLiveDataOptions {
  interval?: number;
  enabled?: boolean;
}

export function useLiveData<T>(
  url: string,
  options: UseLiveDataOptions = {}
) {
  const { interval = 10000, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal memuat data");
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (!enabled) return;
    fetchData();
    const timer = setInterval(fetchData, interval);
    return () => clearInterval(timer);
  }, [fetchData, interval, enabled]);

  return { data, loading, error, lastUpdated, refresh: fetchData };
}
