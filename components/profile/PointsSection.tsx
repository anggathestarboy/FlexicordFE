"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Award } from "lucide-react";
import { PointsLogsResponse } from "./types";
import { formatDateFull } from "./helpers";

interface PointsSectionProps {
  username: string;
}

export default function PointsSection({ username }: PointsSectionProps) {
  // Fetches points/reputation logs for the user using Axios
  const { data, isLoading: loading, isError, error } = useQuery<PointsLogsResponse, Error>({
    queryKey: ["points-logs", username],
    queryFn: async () => {
      const res = await axios.get(`/api/points-logs/user/${username}`);
      if (res.status !== 200) throw new Error("Gagal memuat histori point.");
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue" />
        <span className="text-xs text-zinc-400">Memuat histori point…</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-xs text-red-500 italic py-6 text-center">
        {error?.message ?? "Gagal memuat histori point."}
      </p>
    );
  }

  if (data.data.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 gap-2">
        <Award className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
        <p className="text-xs text-zinc-400 italic">Belum ada histori point.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.data.map((log) => (
        <div
          key={log.id}
          className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center"
        >
          <div>
            <p className="text-xs font-semibold text-zinc-900 dark:text-white">
              {log.description}
            </p>
            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
              {formatDateFull(log.created_at)}
            </p>
          </div>
          <div
            className={`text-sm font-bold font-mono ${
              log.points > 0 ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {log.points > 0 ? "+" : ""}
            {log.points}
          </div>
        </div>
      ))}
    </div>
  );
}
