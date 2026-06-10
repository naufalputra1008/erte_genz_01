"use client";

import { RefreshCw } from "lucide-react";
import { formatTanggalWaktu } from "@/lib/format";

interface LiveIndicatorProps {
  lastUpdated: Date | null;
  onRefresh?: () => void;
  refreshing?: boolean;
  variant?: "emerald" | "blue";
}

export function LiveIndicator({ lastUpdated, onRefresh, refreshing, variant = "emerald" }: LiveIndicatorProps) {
  const isBlue = variant === "blue";

  return (
    <div
      className={`flex items-center gap-2 sm:gap-3 text-sm rounded-xl px-4 py-2 border ${
        isBlue
          ? "text-[#004ac6] bg-blue-50 border-blue-100"
          : "text-emerald-700 bg-emerald-50 border-emerald-200"
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isBlue ? "bg-green-400" : "bg-emerald-400"
          }`}
        />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isBlue ? "bg-green-500" : "bg-emerald-500"}`} />
      </span>
      <span className="font-semibold text-xs uppercase tracking-wide">Data Live</span>
      {lastUpdated && (
        <>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className={`hidden sm:inline text-xs ${isBlue ? "text-slate-500" : "text-emerald-600"}`}>
            Diperbarui {formatTanggalWaktu(lastUpdated.toISOString())}
          </span>
        </>
      )}
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className={`ml-1 p-1 rounded-full transition-colors disabled:opacity-50 ${
            isBlue ? "hover:bg-blue-100 text-[#004ac6]" : "hover:bg-emerald-100"
          }`}
          title="Refresh data"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : "hover:rotate-180 transition-transform duration-500"}`} />
        </button>
      )}
    </div>
  );
}
