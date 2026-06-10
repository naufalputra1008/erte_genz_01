"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { btnPrimary, card, input } from "@/lib/ui";

type Props = {
  onUnlocked: () => void;
};

export default function KeuanganKtpGate({ onUnlocked }: Props) {
  const [noKtp, setNoKtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/keuangan/warga-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ no_ktp: noKtp }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setNoKtp("");
      onUnlocked();
    } else {
      setError(data.error || "No. KTP tidak valid");
    }
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <div className={`${card} p-8`}>
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-7 w-7 text-[#004ac6]" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Akses Data Keuangan</h2>
          <p className="text-slate-500 mt-1 text-sm">
            Masukkan NIK (No. KTP) yang terdaftar di data warga RT. Akses berlaku 3 jam.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">NIK (No. KTP)</label>
            <input
              type="text"
              inputMode="numeric"
              value={noKtp}
              onChange={(e) => setNoKtp(e.target.value)}
              placeholder="16 digit NIK"
              className={input}
              required
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 ${btnPrimary}`}
          >
            {loading ? "Memverifikasi..." : "Lihat Data Keuangan"}
          </button>
        </form>
      </div>
    </div>
  );
}
