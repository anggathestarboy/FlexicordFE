"use client";

import React from "react";
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
  ArrowLeft,
  Layers,
} from "lucide-react";
import { Post } from "@/lib/types";

type UUID = string;
type SortTab = "terpopuler" | "terbaru";

const AVATAR_BASE = "https://pegaduanmasyarakat.alwaysdata.net/storage/";

interface CategoryPostListProps {
  activeCategoryName: string;
  activeCategoryDescription: string;
  postSearchInput: string;
  setPostSearchInput: (val: string) => void;
  posts: Post[];
  loadingPosts: boolean;
  total: number;
  activeSort: SortTab;
  handleSortChange: (sort: SortTab) => void;
  currentPage: number;
  lastPage: number;
  handlePageChange: (page: number) => void;
  handleLike: (e: React.MouseEvent, postId: UUID) => void;
  handleBookmark: (e: React.MouseEvent, postId: UUID) => void;
  onBack: () => void;
  onNavigatePost: (id: string) => void;
}

export default function CategoryPostList({
  activeCategoryName,
  activeCategoryDescription,
  postSearchInput,
  setPostSearchInput,
  posts,
  loadingPosts,
  total,
  activeSort,
  handleSortChange,
  currentPage,
  lastPage,
  handlePageChange,
  handleLike,
  handleBookmark,
  onBack,
  onNavigatePost,
}: CategoryPostListProps) {
  const sortTabs: { key: SortTab; label: string }[] = [
    { key: "terpopuler", label: "Terpopuler" },
    { key: "terbaru", label: "Terbaru" },
  ];

  // Renders the list of posts under the currently active category slug
  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-brand-blue dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Kategori
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-blue/10 text-brand-blue shrink-0">
              <Layers className="h-5 w-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Kategori: {activeCategoryName}
            </h1>
          </div>
          {activeCategoryDescription && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-3xl leading-relaxed">
              {activeCategoryDescription}
            </p>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder={`Cari pertanyaan di kategori ${activeCategoryName}...`}
          value={postSearchInput}
          onChange={(e) => setPostSearchInput(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
        />
      </div>

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

      {loadingPosts ? (
        <div className="text-center py-20 text-zinc-500 text-sm animate-pulse">Memuat postingan...</div>
      ) : posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => onNavigatePost(post.id)}
              className="group bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-brand-blue hover:shadow-sm transition-all cursor-pointer"
            >
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

              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {post.body ? post.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : ''}
              </p>

              {post.tags && post.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-[11px] px-2 py-0.5 rounded border font-mono font-semibold bg-white dark:bg-zinc-950"
                      style={{
                        borderColor: tag.color || '#3b82f6',
                        color: tag.color || '#3b82f6',
                      }}
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                  <div className="flex items-center gap-1" title="Votes">
                    <ArrowBigUp className="h-3.5 w-3.5" />
                    <span>{post.vote_score ?? 0}</span>
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
                    <span>{post.likes_count ?? 0}</span>
                  </button>

                  <div className="flex items-center gap-1" title="Komentar">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>{post.comments_count ?? 0}</span>
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
                    <span>{post.bookmarks_count ?? 0}</span>
                  </button>

                  <div className="flex items-center gap-1" title="Dilihat">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{post.view_count ?? 0}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shrink-0 font-medium">
                    {post.category?.name ?? activeCategoryName}
                  </span>

                  <div className="flex items-center gap-1.5 min-w-0">
                    {post.user?.avatar_url ? (
                      <img
                        src={`${AVATAR_BASE}${post.user.avatar_url}`}
                        alt={post.user.username}
                        className="w-5 h-5 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-brand-blue/20 flex items-center justify-center text-[10px] font-bold text-brand-blue uppercase shrink-0">
                        {post.user?.username ? post.user.username[0] : "?"}
                      </div>
                    )}
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {post.user?.username ?? "Anonim"}
                      </span>
                      {post.created_at && (
                        <>
                          {" · "}
                          {new Date(post.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </>
                      )}
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
              Postingan tidak ditemukan
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              Tidak ada pertanyaan di dalam kategori ini yang sesuai dengan filter Anda.
            </p>
          </div>
          {postSearchInput && (
            <button
              onClick={() => setPostSearchInput("")}
              className="text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold px-4 py-2 rounded-lg cursor-pointer"
            >
              Reset Pencarian
            </button>
          )}
        </div>
      )}

      {!loadingPosts && lastPage > 1 && (
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
