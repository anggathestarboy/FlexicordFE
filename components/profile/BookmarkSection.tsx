"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bookmark, ChevronRight, Heart, CheckCircle2, CircleDot } from "lucide-react";
import { BookmarkItem, BookmarkPostDetail, BookmarksApiResponse } from "./types";
import { formatDate } from "./helpers";

interface BookmarkSectionProps {
  onNavigatePost: (id: string) => void;
}

export default function BookmarkSection({ onNavigatePost }: BookmarkSectionProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [posts, setPosts] = useState<Record<string, BookmarkPostDetail>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetches bookmarked posts and their individual details using Axios
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/bookmark");
        if (res.status !== 200) {
          throw new Error("Gagal memuat bookmark.");
        }
        const data: BookmarksApiResponse = res.data;
        const items = data.data ?? [];
        setBookmarks(items);

        if (items.length > 0) {
          const postResults = await Promise.allSettled(
            items.map((b) =>
              axios.get(`/api/posts/${b.post_id}`)
                .then((r) => r.data.data as BookmarkPostDetail)
            )
          );
          const postMap: Record<string, BookmarkPostDetail> = {};
          postResults.forEach((result, idx) => {
            if (result.status === "fulfilled") {
              const postId = items[idx].post_id;
              postMap[postId] = result.value;
            }
          });
          setPosts(postMap);
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Gagal memuat bookmark.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-brand-blue" />
        <span className="text-xs text-zinc-400">Memuat bookmark…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-10 gap-2">
        <Bookmark className="h-8 w-8 text-red-300 dark:text-red-800" />
        <p className="text-xs text-red-500 italic text-center">{error}</p>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 gap-3">
        <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900">
          <Bookmark className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
        </div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Belum ada bookmark.</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">Simpan pertanyaan menarik dengan menekan ikon bookmark.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bookmarks.map((bookmark) => {
        const post = posts[bookmark.post_id];

        return (
          <div
            key={bookmark.id}
            onClick={() => post && onNavigatePost(post.id)}
            className={`p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-all duration-150 space-y-2 text-left ${
              post ? "hover:border-brand-blue cursor-pointer" : "opacity-60 cursor-default"
            }`}
          >
            {post ? (
              <>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white line-clamp-1 hover:text-brand-blue flex-1 flex items-center gap-1">
                    {post.title}
                    <ChevronRight className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      post.is_answered
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : post.status === "open"
                        ? "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {post.is_answered ? (
                      <><CheckCircle2 className="h-2.5 w-2.5" /> Terjawab</>
                    ) : post.status === "open" ? (
                      <><CircleDot className="h-2.5 w-2.5" /> Terbuka</>
                    ) : (
                      "Ditutup"
                    )}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 rounded font-mono">
                    {post.category?.name ?? "—"}
                  </span>
                  {post.tags?.map((t) => (
                    <span
                      key={t.id}
                      style={{ borderColor: t.color, color: t.color }}
                      className="text-[10px] px-1.5 py-0.5 border rounded font-mono font-semibold bg-white dark:bg-zinc-950"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-blue">↑{post.upvotes_count}</span>
                    <span>{post.comments_count} komentar</span>
                    <span>{post.view_count} views</span>
                    <span className="text-rose-400 flex items-center gap-0.5">
                      <Heart className="h-2.5 w-2.5" /> {post.likes_count}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-400">
                    <Bookmark className="h-2.5 w-2.5 fill-current text-brand-blue" />
                    <span>{formatDate(bookmark.created_at)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Bookmark className="h-4 w-4 text-zinc-400 shrink-0" />
                <div>
                  <p className="font-mono text-[11px] text-zinc-400">Post ID: {bookmark.post_id}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    Disimpan: {formatDate(bookmark.created_at)}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
