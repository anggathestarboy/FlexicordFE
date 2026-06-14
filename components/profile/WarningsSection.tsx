"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertTriangle } from "lucide-react";
import { SelfWarningResponse } from "./types";
import { formatDateFull } from "./helpers";

export default function WarningsSection() {
  const [data, setData] = useState<SelfWarningResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetches moderation warnings issued to the authenticated user using Axios
  useEffect(() => {
    setLoading(true);
    axios.get(`/api/self-warning`)
      .then((res) => {
        if (res.status !== 200) throw new Error("Gagal memuat history warning.");
        const d = res.data;
        if (d.success) {
          setData(d);
        } else {
          throw new Error(d.message || "Gagal memuat history warning.");
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue" />
        <span className="text-xs text-zinc-400">Memuat riwayat warning…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-xs text-red-500 italic py-6 text-center">
        {error ?? "Gagal memuat riwayat warning."}
      </p>
    );
  }

  if (!data.data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 gap-2">
        <AlertTriangle className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
        <p className="text-xs text-zinc-400 italic">Anda belum memiliki riwayat warning.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.data.map((warning) => (
        <div key={warning.id} className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-2 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
              Tindakan: {warning.action_type}
            </span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800`}>
              Warning
            </span>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
            <p className="text-xs font-semibold text-zinc-900 dark:text-white">Alasan: {warning.reason}</p>
            {warning.notes && (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 italic leading-relaxed">"{warning.notes}"</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] text-zinc-400 font-mono mt-1 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span>Diberikan oleh: @{warning.moderator?.username || "Sistem"}</span>
            <span>Tanggal: {formatDateFull(warning.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
