
"use client";

export const dynamic = "force-dynamic";


import { useEffect, useState, useCallback, Suspense } from "react";
import {
  Search,
  SlidersHorizontal,
  Inbox,
  Eye,
  ArrowBigUp,
  CheckCircle,
  Heart,
  Bookmark,
  MessageCircle,
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ApiResponse, Post } from "@/lib/types";

type UUID = string;
type SortTab = "terpopuler" | "terbaru";

const AVATAR_BASE = "https://pegaduanmasyarakat.alwaysdata.net/storage/";

function HomePageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const activeSort = (searchParams.get("sort_by") === "created_at" ? "terbaru" : "terpopuler") as SortTab;
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);
  const search = searchParams.get("search") ?? "";

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
      const fetchedPosts = data.data ?? [];

      try {
        const bookmarksRes = await fetch("/api/bookmark");
        if (bookmarksRes.ok) {
          const bookmarksJson = await bookmarksRes.json();
          const bookmarksList = bookmarksJson.data ?? [];
          const bookmarkMap = new Map<string, string>();
          bookmarksList.forEach((b: any) => {
            if (b.post_id && b.id) {
              bookmarkMap.set(b.post_id, b.id);
            }
          });
          fetchedPosts.forEach((post) => {
            if (bookmarkMap.has(post.id)) {
              post.bookmark_id = bookmarkMap.get(post.id);
            }
          });
        }
      } catch (err) {
        console.error("Gagal mencocokkan bookmark_id:", err);
      }

      setPosts(fetchedPosts);
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

    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    const isLiked = targetPost.user_has_liked;
    const prevPosts = posts;

    // Optimistic update
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes_count: isLiked
                ? post.likes_count - 1
                : post.likes_count + 1,
              user_has_liked: !isLiked,
            }
          : post
      )
    );

    try {
      if (isLiked) {
        // Sudah di-like → unlike via DELETE /api/unlikes
        const res = await fetch("/api/unlikes", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target_id: postId }),
        });
        if (!res.ok) {
          const data = await res.json();
          console.error("Unlike error:", data.message);
          setPosts(prevPosts);
        }
      } else {
        // Belum di-like → like via POST /api/likes
        const res = await fetch("/api/likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target_id: postId }),
        });
        if (!res.ok) {
          const data = await res.json();
          console.error("Like error:", data.message);
          setPosts(prevPosts);
        }
      }
    } catch (error) {
      console.error("Like/Unlike error:", error);
      setPosts(prevPosts);
    }
  };

  const handleBookmark = async (e: React.MouseEvent, postId: UUID) => {
    e.stopPropagation();

    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    const isBookmarked = targetPost.user_has_bookmarked;
    const prevPosts = posts;

    // Optimistic update
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              bookmarks_count: isBookmarked
                ? post.bookmarks_count - 1
                : post.bookmarks_count + 1,
              user_has_bookmarked: !isBookmarked,
              bookmark_id: isBookmarked ? null : post.bookmark_id,
            }
          : post
      )
    );

    try {
      if (isBookmarked) {
        // Sudah di-bookmark → hapus via DELETE /api/bookmark/[bookmark_id]
        const bookmarkId = targetPost.bookmark_id;

        if (!bookmarkId) {
          console.error("Unbookmark error: bookmark_id tidak ditemukan");
          setPosts(prevPosts);
          return;
        }

        const res = await fetch(`/api/bookmark/${bookmarkId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json();
          console.error("Unbookmark error:", data.message);
          setPosts(prevPosts);
        }
      } else {
        // Belum di-bookmark → tambah via POST /api/bookmark
        const res = await fetch("/api/bookmark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_id: postId }),
        });

        if (!res.ok) {
          const data = await res.json();
          console.error("Bookmark error:", data.message);
          setPosts(prevPosts);
          return;
        }

        // Simpan bookmark_id dari response ke state post
        const data = await res.json();
        const newBookmarkId = data.data?.id ?? data.data ?? null;

        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, bookmark_id: newBookmarkId }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Bookmark/Unbookmark error:", error);
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
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => router.push(`/posts/${post.id}`)}
              className="group bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-brand-blue hover:shadow-sm transition-all cursor-pointer"
            >
              {/* TOP ROW: title + badge */}
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-brand-blue transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h2>
                <div className="flex items-center gap-1.5 shrink-0">
                  {post.is_answered === 1 && (
                    <span className="flex items-center gap-1 text-[11px] text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full font-semibold">
                      <CheckCircle className="h-3 w-3" />
                      Terjawab
                    </span>
                  )}
                  {post.is_edited && (
                    <span className="text-[11px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full italic">
                      diedit
                    </span>
                  )}
                </div>
              </div>

              {/* BODY */}
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {post.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}
              </p>

              {/* TAGS */}
              {post.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-[11px] px-2 py-0.5 rounded border font-mono font-semibold bg-white dark:bg-zinc-950"
                      style={{
                        borderColor: (tag as any).color || '#3b82f6',
                        color: (tag as any).color || '#3b82f6',
                      }}
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* FOOTER */}
              <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">

                {/* STATS */}
                <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                  <div className="flex items-center gap-1" title="Votes">
                    <ArrowBigUp className="h-3.5 w-3.5" />
                    <span>{post.vote_score}</span>
                  </div>

                  <button
                    onClick={(e) => handleLike(e, post.id)}
                    title="Like"
                    className={`flex items-center gap-1 transition-colors ${
                      post.user_has_liked
                        ? "text-red-500"
                        : "text-zinc-400 dark:text-zinc-500 hover:text-red-400"
                    }`}
                  >
                    <Heart
                      className="h-3.5 w-3.5"
                      fill={post.user_has_liked ? "currentColor" : "none"}
                    />
                    <span>{post.likes_count}</span>
                  </button>

                  <div className="flex items-center gap-1" title="Komentar">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>{post.comments_count}</span>
                  </div>

                  <button
                    onClick={(e) => handleBookmark(e, post.id)}
                    title="Bookmark"
                    className={`flex items-center gap-1 transition-colors ${
                      post.user_has_bookmarked
                        ? "text-yellow-500"
                        : "text-zinc-400 dark:text-zinc-500 hover:text-yellow-400"
                    }`}
                  >
                    <Bookmark
                      className="h-3.5 w-3.5"
                      fill={post.user_has_bookmarked ? "currentColor" : "none"}
                    />
                    <span>{post.bookmarks_count}</span>
                  </button>

                  <div className="flex items-center gap-1" title="Dilihat">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{post.view_count}</span>
                  </div>
                </div>

                {/* USER + CATEGORY + DATE */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shrink-0">
                    {post.category.name}
                  </span>

                  <div className="flex items-center gap-1.5 min-w-0">
                    {post.user.avatar_url ? (
                      <img
                        src={`${AVATAR_BASE}${post.user.avatar_url}`}
                        alt={post.user.username}
                        className="w-5 h-5 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-brand-blue/20 flex items-center justify-center text-[10px] font-bold text-brand-blue uppercase shrink-0">
                        {post.user.username[0]}
                      </div>
                    )}
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {post.user.username}
                      </span>
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

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-zinc-500 text-sm">Memuat data...</div>}>
      <HomePageContent />
    </Suspense>
  );
}