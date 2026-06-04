"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

type Props = {
  onUnlocked: () => void;
};

export default function AdminKeuanganGate({ onUnlocked }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/keuangan/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setPassword("");
      onUnlocked();
    } else {
      setError(data.error || "Password salah");
    }
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-7 w-7 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Akses Kelola Keuangan</h2>
          <p className="text-slate-500 mt-1 text-sm">
            Masukkan password khusus keuangan (berbeda dari password login admin)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password Keuangan</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password kelola keuangan"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Memverifikasi..." : "Buka Kelola Keuangan"}
          </button>
        </form>
      </div>
    </div>
  );
}
