"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  SlidersHorizontal,
  Inbox,
  Eye,
  ArrowBigUp,
  CheckCircle,
  Heart,
  Bookmark,
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ApiResponse, Post } from "@/lib/types";

type UUID = string;
type SortTab = "terpopuler" | "terbaru";

const AVATAR_BASE = "https://pegaduanmasyarakat.alwaysdata.net/storage/";

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Ambil state dari URL
  const activeSort = (searchParams.get("sort_by") === "created_at" ? "terbaru" : "terpopuler") as SortTab;
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);
  const search = searchParams.get("search") ?? "";

  // Debounce search input lokal supaya tidak langsung push URL setiap ketikan
  const [searchInput, setSearchInput] = useState(search);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  // Debounce: push search ke URL 400ms setelah user berhenti mengetik
  useEffect(() => {
    const timer = setTimeout(() => {
      updateParams({ search: searchInput || null, page: "1" });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    getPosts();
  }, [activeSort, currentPage, search]);

  const getSortParam = (): string => {
    return activeSort === "terbaru" ? "created_at" : "view_count";
  };

  const getPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sort_by: getSortParam(),
        page: String(currentPage),
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/posts?${params.toString()}`);
      const data: ApiResponse = await res.json();
      setPosts(data.data ?? []);
      setLastPage(data.last_page);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (sort: SortTab) => {
    updateParams({
      sort_by: sort === "terbaru" ? "created_at" : "view_count",
      page: "1",
    });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page: String(page) });
  };

  const handleLike = async (e: React.MouseEvent, postId: UUID) => {
    e.stopPropagation();
    const prevPosts = posts;
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes_count: post.user_has_liked
                ? post.likes_count - 1
                : post.likes_count + 1,
              user_has_liked: !post.user_has_liked,
            }
          : post
      )
    );
    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_id: postId }),
      });
      if (!res.ok) setPosts(prevPosts);
    } catch (error) {
      console.error("Like error:", error);
      setPosts(prevPosts);
    }
  };

  const sortTabs: { key: SortTab; label: string }[] = [
    { key: "terpopuler", label: "Terpopuler" },
    { key: "terbaru", label: "Terbaru" },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Semua Pertanyaan
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Jelajahi pertanyaan terbaik dari developer komunitas.
          </p>
        </div>
        <button
          onClick={() => router.push("/ask")}
          className="sm:w-auto w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold py-2.5 px-5 rounded-lg shadow-sm transition-colors"
        >
          Tanya Pertanyaan Baru
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Cari pertanyaan..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
        />
      </div>

      {/* SORT TABS + FILTER INFO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-100/60 dark:bg-zinc-900/40 p-2 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80">
        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-2 flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
          <span>{total} pertanyaan tersedia</span>
        </div>

        <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1 w-full sm:w-auto">
          {sortTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleSortChange(tab.key)}
              className={`flex-1 sm:flex-none text-xs font-medium px-4 py-1.5 rounded-md cursor-pointer transition-all ${
                activeSort === tab.key
                  ? "bg-zinc-100 dark:bg-zinc-800 text-brand-blue font-bold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="text-center py-20 text-zinc-500 text-sm">Memuat data...</div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => router.push(`/questions/${post.id}`)}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-brand-blue transition-all cursor-pointer"
            >
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white hover:text-brand-blue line-clamp-2">
                    {post.title}
                  </h2>
                  {post.is_answered === 1 && (
                    <span className="shrink-0 flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full font-medium">
                      <CheckCircle className="h-3 w-3" />
                      Terjawab
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-sm text-zinc-500 line-clamp-2">
                  {post.body}
                </p>

                {post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="text-xs px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1">
                    <ArrowBigUp className="h-4 w-4" />
                    <span>{post.vote_score}</span>
                  </div>

                  <button
                    onClick={(e) => handleLike(e, post.id)}
                    className={`flex items-center gap-1 transition-colors ${
                      post.user_has_liked
                        ? "text-red-500"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-red-400"
                    }`}
                  >
                    <Heart
                      className="h-4 w-4"
                      fill={post.user_has_liked ? "currentColor" : "none"}
                    />
                    <span>{post.likes_count}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <Bookmark className="h-4 w-4" />
                    <span>{post.bookmarks_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{post.view_count}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                    {post.category.name}
                  </span>
                  {post.is_edited && (
                    <span className="text-xs text-zinc-400 italic">diedit</span>
                  )}
                  {post.user.avatar_url ? (
                    <img
                      src={`${AVATAR_BASE}${post.user.avatar_url}`}
                      alt={post.user.username}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-brand-blue/20 flex items-center justify-center text-[10px] font-bold text-brand-blue uppercase">
                      {post.user.username[0]}
                    </div>
                  )}
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {post.user.username}
                    </span>
                    {" · "}
                    {post.user.reputation_points} rep
                    {" · "}
                    {new Date(post.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-2xl mx-auto space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
            <Inbox className="h-6 w-6 text-zinc-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Pertanyaan tidak ditemukan
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              Tidak ada hasil yang sesuai. Coba ubah kata kunci pencarian.
            </p>
          </div>
          <button
            onClick={() => { setSearchInput(""); updateParams({ search: null, page: "1" }); }}
            className="text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold px-4 py-2 rounded-lg cursor-pointer"
          >
            Reset Pencarian
          </button>
        </div>
      )}

      {/* PAGINATION */}
      {!loading && lastPage > 1 && (
        <div className="flex items-center justify-center gap-1 pt-4">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            ← Prev
          </button>

          {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                currentPage === page
                  ? "bg-brand-blue text-white border-brand-blue font-bold"
                  : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(Math.min(lastPage, currentPage + 1))}
            disabled={currentPage === lastPage}
            className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}