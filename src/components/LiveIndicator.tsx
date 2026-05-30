"use client";

import { RefreshCw, Wifi } from "lucide-react";
import { formatTanggalWaktu } from "@/lib/format";

interface LiveIndicatorProps {
  lastUpdated: Date | null;
  onRefresh?: () => void;
  loading?: boolean;
}

export function LiveIndicator({ lastUpdated, onRefresh, loading }: LiveIndicatorProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <Wifi className="h-3.5 w-3.5" />
      <span className="font-medium">Data Live</span>
      {lastUpdated && (
        <span className="text-emerald-600 hidden sm:inline">
          · Diperbarui {formatTanggalWaktu(lastUpdated.toISOString())}
        </span>
      )}
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading}
          className="ml-1 p-1 rounded-full hover:bg-emerald-100 transition-colors disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      )}
    </div>
  );
}
