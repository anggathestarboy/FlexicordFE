"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Heart, FileText, MessageSquare, ChevronRight } from "lucide-react";
import { LikesApiResponse } from "./types";
import { formatDate } from "./helpers";
import PostStatusBadge from "./PostStatusBadge";

interface LikesSectionProps {
  username: string;
  onNavigatePost: (id: string) => void;
}

export default function LikesSection({
  username,
  onNavigatePost,
}: LikesSectionProps) {
  const router = useRouter();
  const [data, setData] = useState<LikesApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetches list of likes for the given user from the API using Axios
  useEffect(() => {
    setLoading(true);
    axios.get(`/api/likes-user/${username}`)
      .then((res) => {
        if (res.status !== 200) throw new Error("Gagal memuat likes.");
        setData(res.data);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue" />
        <span className="text-xs text-zinc-400">Memuat likes…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-xs text-red-500 italic py-6 text-center">
        {error ?? "Gagal memuat data likes."}
      </p>
    );
  }

  if (data.likes.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 gap-2">
        <Heart className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
        <p className="text-xs text-zinc-400 italic">Belum ada like.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.likes.map((like) => (
        <div
          key={like.id}
          className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                like.target_type === "post"
                  ? "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400"
                  : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
              }`}
            >
              {like.target_type === "post" ? (
                <FileText className="h-2.5 w-2.5" />
              ) : (
                <MessageSquare className="h-2.5 w-2.5" />
              )}
              {like.target_type === "post" ? "Post" : "Komentar"}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              {formatDate(like.created_at)}
            </span>
          </div>

          {like.target_type === "post" && like.post ? (
            <div
              className="cursor-pointer group"
              onClick={() => onNavigatePost(like.post!.id)}
            >
              <p className="text-xs font-semibold text-zinc-900 dark:text-white group-hover:text-brand-blue line-clamp-1 flex items-center gap-1">
                {like.post.title}
                <ChevronRight className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                {like.post.body}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400 font-mono">
                <PostStatusBadge post={like.post} />
                <span>↑{like.post.vote_score}</span>
                <span>{like.post.view_count} views</span>
              </div>
            </div>
          ) : like.target_type === "comment" && like.comment ? (
            <div
              className="cursor-pointer group"
              onClick={() => router.push(`/comment/${like.comment!.id}`)}
            >
              <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2 group-hover:text-brand-blue">
                &ldquo;{like.comment.body}&rdquo;
              </p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400 font-mono">
                {like.comment.is_accepted ? (
                  <span className="text-emerald-600 font-bold">✓ Diterima</span>
                ) : null}
                <span>↑{like.comment.vote_score}</span>
                <span className="text-[10px] text-zinc-400">
                  klik untuk lihat detail komentar →
                </span>
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
