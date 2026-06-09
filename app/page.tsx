"use client";

import { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Inbox,
  Eye,
  ArrowBigUp,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ApiResponse, Post } from "@/lib/types";



type User = {
  id: string;
  username: string;
  avatar_url: string | null;
  reputation_points: number;
  level: number;
};



type PaginationLink = {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
};


type SortTab = "terpopuler" | "terbaru" | "belum-terjawab";

const AVATAR_BASE = "https://pegaduanmasyarakat.alwaysdata.net/storage/";

export default function HomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeSort, setActiveSort] = useState<SortTab>("terpopuler");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    getPosts(currentPage);
  }, [activeSort, currentPage]);

  const getSortParam = (): string => {
    if (activeSort === "terpopuler") return "view_count";
    if (activeSort === "belum-terjawab") return "created_at";
    return "created_at";
  };

  const getPosts = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?sort_by=${getSortParam()}&page=${page}`);
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

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.body.toLowerCase().includes(search.toLowerCase())
  );

  const handleSortChange = (sort: SortTab) => {
    setActiveSort(sort);
    setCurrentPage(1);
  };

  const sortTabs: { key: SortTab; label: string }[] = [
    { key: "terbaru", label: "Terbaru" },
    { key: "terpopuler", label: "Terpopuler" },
    { key: "belum-terjawab", label: "Belum Terjawab" },
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => router.push(`/questions/${post.id}`)}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-brand-blue transition-all cursor-pointer"
            >
              <div className="flex flex-col md:flex-row gap-5">
                {/* STATS */}
                <div className="flex md:flex-col gap-4 md:gap-3 text-xs text-zinc-500 md:w-20 md:items-center md:text-center shrink-0">
                  <div className="flex md:flex-col items-center gap-1">
                    <ArrowBigUp className="h-4 w-4" />
                    <span>{post.vote_score}</span>
                    <span className="hidden md:inline text-zinc-400">votes</span>
                  </div>
                  <div className="flex md:flex-col items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.comments_count}</span>
                    <span className="hidden md:inline text-zinc-400">jawaban</span>
                  </div>
                  <div className="flex md:flex-col items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{post.view_count}</span>
                    <span className="hidden md:inline text-zinc-400">views</span>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="flex-1 min-w-0">
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

                  {/* TAGS */}
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

                  {/* FOOTER: category + user + date */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                        {post.category.name}
                      </span>
                      {post.is_edited && (
                        <span className="text-xs text-zinc-400 italic">diedit</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
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
            onClick={() => setSearch("")}
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
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            ← Prev
          </button>

          {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
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
            onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
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