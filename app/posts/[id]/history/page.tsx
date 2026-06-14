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
  FileText,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PostEditHistory } from "@/app/api/post-histories/[id]/PostHistoriesType";

export default function PostHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { currentUser } = useApp();

  const [post, setPost] = useState<any>(null);
  const [histories, setHistories] = useState<PostEditHistory[]>([]);
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

  // Fetch post details (to get the title)
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (res.ok) {
          const data = await res.json();
          // Adjust for API data wrap differences
          setPost(data.data || data);
        }
      } catch (err) {
        console.error("Gagal memuat detail post:", err);
      }
    };
    fetchPost();
  }, [id]);

  // Fetch post histories & check permissions
  useEffect(() => {
    // Wait until currentUser is loaded
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
        const res = await fetch(`/api/post-histories/${id}`);
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

  // Render HTML body safely or linebreaks
  const renderBody = (text: string) => {
    if (!text) return null;
    // Check if it's HTML (from Quill editor)
    if (text.trim().startsWith("<") && text.trim().endsWith(">")) {
      return <div className="ql-editor p-0 reset-ql-style" dangerouslySetInnerHTML={{ __html: text }} />;
    }
    return <p className="whitespace-pre-wrap">{text}</p>;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3.5">
        <Loader2 className="h-9 w-9 text-brand-blue animate-spin" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
          Memuat riwayat suntingan...
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
          onClick={() => router.push(`/posts/${id}`)}
          className="w-full text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 py-2.5 rounded-xl transition-all cursor-pointer"
        >
          Kembali ke Postingan
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* BACK BUTTON */}
      <Link
        href={`/posts/${id}`}
        className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500 hover:text-brand-blue dark:text-zinc-400 dark:hover:text-blue-400 transition-colors py-1 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Kembali ke Postingan</span>
      </Link>

      {/* HEADER SECTION */}
      <div className="pb-5 border-b border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
            <History className="h-5 w-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
            Riwayat Suntingan Postingan
          </h1>
        </div>
        {post && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-normal">
            Pertanyaan: <span className="font-semibold text-zinc-850 dark:text-zinc-200">{post.title}</span>
          </p>
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
                {/* Reason for Edit */}
                {history.reason && (
                  <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-xs italic text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Alasan Suntingan: &ldquo;{history.reason}&rdquo;</span>
                  </div>
                )}

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Before */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                      Sebelumnya:
                    </div>
                    <div className="p-3 bg-red-50/30 dark:bg-red-950/5 border border-red-100 dark:border-red-950/20 rounded-lg text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 min-h-[100px] ql-snow line-through text-red-650/80">
                      {renderBody(history.body_before)}
                    </div>
                  </div>

                  {/* After */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                      Sesudah:
                    </div>
                    <div className="p-3 bg-emerald-50/20 dark:bg-emerald-950/5 border border-emerald-100/40 dark:border-emerald-950/20 rounded-lg text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 min-h-[100px] ql-snow">
                      {renderBody(history.body_after)}
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
              Postingan ini belum pernah disunting sejak pertama kali diterbitkan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
