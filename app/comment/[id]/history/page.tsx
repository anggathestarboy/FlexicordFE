"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  History,
  Clock,
  User as UserIcon,
  AlertTriangle,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { CommentEditHistory } from "@/app/api/comment-histories/[id]/CommentHistoriesType";

export default function CommentHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { currentUser } = useApp();

  const [comment, setComment] = useState<any>(null);
  const [histories, setHistories] = useState<CommentEditHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Fetch comment details (to get context)
  useEffect(() => {
    const fetchComment = async () => {
      try {
        const res = await fetch(`/api/comment/${id}`);
        if (res.ok) {
          const data = await res.json();
          setComment(data.data || data);
        }
      } catch (err) {
        console.error("Gagal memuat detail komentar:", err);
      }
    };
    fetchComment();
  }, [id]);

  // Fetch comment histories & check permissions
  useEffect(() => {
    if (currentUser === undefined) return;

    if (!currentUser) {
      setError("Anda harus login terlebih dahulu.");
      setLoading(false);
      return;
    }

    const isAdminOrModerator =
      currentUser.primary_role?.name === "admin" ||
      currentUser.primary_role?.name === "moderator";

    if (!isAdminOrModerator) {
      setError("Akses Ditolak: Anda tidak memiliki izin untuk mengakses halaman ini.");
      setLoading(false);
      return;
    }

    const fetchHistories = async () => {
      try {
        const res = await fetch(`/api/comment-histories/${id}`);
        if (!res.ok) {
          if (res.status === 401) throw new Error("Sesi berakhir, silakan login ulang.");
          if (res.status === 403) throw new Error("Akses ditolak oleh server.");
          throw new Error("Gagal memuat riwayat suntingan.");
        }
        const data = await res.json();
        setHistories(data.histories || []);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan saat mengambil riwayat.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistories();
  }, [id, currentUser]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3.5">
        <Loader2 className="h-9 w-9 text-brand-blue animate-spin" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
          Memuat riwayat suntingan komentar...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center space-y-4 shadow-sm">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Terjadi Masalah
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {error}
          </p>
        </div>
        <button
          onClick={() => router.push(`/comment/${id}`)}
          className="w-full text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 py-2.5 rounded-xl transition-all cursor-pointer"
        >
          Kembali ke Komentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* BACK BUTTON */}
      <Link
        href={`/comment/${id}`}
        className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500 hover:text-brand-blue dark:text-zinc-400 dark:hover:text-blue-400 transition-colors py-1 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Kembali ke Komentar</span>
      </Link>

      {/* HEADER SECTION */}
      <div className="pb-5 border-b border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
            <History className="h-5 w-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
            Riwayat Suntingan Komentar
          </h1>
        </div>
        {comment && (
          <div className="text-sm text-zinc-500 dark:text-zinc-400 flex items-start gap-1.5 bg-zinc-50 dark:bg-zinc-900/35 p-3 rounded-lg border border-zinc-100 dark:border-zinc-900">
            <MessageSquare className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block font-mono">
                Isi Komentar Saat Ini:
              </span>
              <p className="text-zinc-750 dark:text-zinc-300 italic font-medium leading-relaxed font-sans">
                &ldquo;{comment.body}&rdquo;
              </p>
            </div>
          </div>
        )}
      </div>

      {/* TIMELINE LIST */}
      {histories.length > 0 ? (
        <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-3.5 pl-6 space-y-6">
          {histories.map((history, idx) => (
            <div key={history.id} className="relative space-y-3 text-left">
              {/* Timeline Dot Indicator */}
              <span className="absolute -left-[33px] top-1.5 h-4 w-4 rounded-full border-2 border-white dark:border-zinc-950 bg-brand-blue flex items-center justify-center shrink-0 shadow-sm" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-400 font-mono">
                <span className="font-bold text-brand-blue">
                  Versi #{histories.length - idx}
                </span>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <UserIcon className="h-3.5 w-3.5" />
                    Oleh: <strong className="text-zinc-700 dark:text-zinc-300 font-sans font-medium">{history.edited_by}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(history.edited_at)}
                  </span>
                </div>
              </div>

              {/* Revision Box */}
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Before */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                      Sebelumnya:
                    </div>
                    <div className="p-3 bg-red-50/30 dark:bg-red-950/5 border border-red-100 dark:border-red-950/20 rounded-lg text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 min-h-[80px] line-through text-red-650/80 whitespace-pre-wrap leading-relaxed font-sans">
                      {history.body_before}
                    </div>
                  </div>

                  {/* After */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                      Sesudah:
                    </div>
                    <div className="p-3 bg-emerald-50/20 dark:bg-emerald-950/5 border border-emerald-100/40 dark:border-emerald-950/20 rounded-lg text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 min-h-[80px] whitespace-pre-wrap leading-relaxed font-sans">
                      {history.body_after}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-xl mx-auto space-y-3.5">
          <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
            <History className="h-6 w-6 text-zinc-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Belum Ada Riwayat Suntingan
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              Komentar ini belum pernah disunting sejak pertama kali diterbitkan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
