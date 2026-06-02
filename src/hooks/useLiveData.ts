"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseLiveDataOptions<T> {
  interval?: number;
  enabled?: boolean;
  initialData?: T | null;
}

const DEFAULT_INTERVAL =
  process.env.NODE_ENV === "development" ? 30_000 : 10_000;

export function useLiveData<T>(
  url: string,
  options: UseLiveDataOptions<T> = {}
) {
  const { interval = DEFAULT_INTERVAL, enabled = true, initialData = null } = options;
  const hasDataRef = useRef(initialData != null);
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(initialData == null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(
    initialData != null ? new Date() : null
  );

  const fetchData = useCallback(async () => {
    if (hasDataRef.current) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal memuat data");
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
      setError(null);
      hasDataRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [url]);

  useEffect(() => {
    if (!enabled) return;
    if (!hasDataRef.current) {
      fetchData();
    }
    const timer = setInterval(fetchData, interval);
    return () => clearInterval(timer);
  }, [fetchData, interval, enabled]);

  return { data, loading, refreshing, error, lastUpdated, refresh: fetchData };
}
