"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Flag } from "lucide-react";
import { ReportsApiResponse } from "./types";
import { formatDateFull } from "./helpers";

interface ReportsSectionProps {
  username: string;
}

export default function ReportsSection({ username }: ReportsSectionProps) {
  const [data, setData] = useState<ReportsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetches report items made by this user from the API using Axios
  useEffect(() => {
    setLoading(true);
    axios.get(`/api/reports`)
      .then((res) => {
        if (res.status !== 200) throw new Error("Gagal memuat laporan.");
        const d = res.data;
        if (d.success) {
          setData(d);
        } else {
          throw new Error(d.message || "Gagal memuat laporan.");
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [username]);

  // Resolves the tailwind style colors based on report status
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "resolved": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800";
      case "dismissed": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800";
      case "reviewed": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800";
      default: return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue" />
        <span className="text-xs text-zinc-400">Memuat laporan Anda…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-xs text-red-500 italic py-6 text-center">
        {error ?? "Gagal memuat laporan."}
      </p>
    );
  }

  if (data.data.data.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 gap-2">
        <Flag className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
        <p className="text-xs text-zinc-400 italic">Anda belum membuat laporan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.data.data.map((report) => (
        <div key={report.id} className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-2 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1">
              <Flag className="h-3 w-3" />
              Target: {report.target_type === 'user' && report.user ? `@${report.user.username}` : report.target_type}
            </span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusStyle(report.status)}`}>
              {report.status}
            </span>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
            <p className="text-xs font-semibold text-zinc-900 dark:text-white">Alasan: {report.reason}</p>
            {report.description && (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 italic leading-relaxed">"{report.description}"</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] text-zinc-400 font-mono mt-1 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span>Dilaporkan: {formatDateFull(report.created_at)}</span>
            {report.resolved_at && (
              <span className="text-emerald-500 font-bold">Diselesaikan: {formatDateFull(report.resolved_at)}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
