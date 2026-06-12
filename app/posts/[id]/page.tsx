"use client";

import React, { useState, use, useEffect, useRef } from "react";
import {
  ChevronUp,
  ChevronDown,
  Check,
  Bookmark,
  MessageSquare,
  Award,
  ArrowLeft,
  Send,
  CheckCircle2,
  Heart,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Post, Comment } from "@/app/api/posts/[id]/PostDetailType";

// Extend Post type to include optional bookmark_id used for optimistic UI
interface PostWithBookmark extends Post {
  bookmark_id?: string | null;
}

const AVATAR_BASE = "https://pegaduanmasyarakat.alwaysdata.net/storage/";
const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80";

function resolveAvatar(avatarUrl?: string | null): string {
  if (!avatarUrl) return FALLBACK_AVATAR;
  if (avatarUrl.startsWith("http")) return avatarUrl;
  return `${AVATAR_BASE}${avatarUrl}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTextBody(text: string) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, index) => {
    if (part.startsWith("```") && part.endsWith("```")) {
      const lines = part.slice(3, -3).trim().split("\n");
      let language = "javascript";
      let codeLines = lines;
      if (lines[0] && lines[0].match(/^[a-zA-Z0-9+#]+$/)) {
        language = lines[0];
        codeLines = lines.slice(1);
      }
      return (
        <div
          key={index}
          className="my-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner"
        >
          <div className="bg-zinc-100 dark:bg-zinc-900 px-4 py-1.5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
              {language}
            </span>
            <span className="text-[10px] font-sans text-zinc-400">
              Read-only code editor
            </span>
          </div>
          <pre className="bg-zinc-900 text-zinc-100 p-4 overflow-x-auto font-mono text-xs sm:text-sm selection:bg-brand-blue/30">
            <code>{codeLines.join("\n")}</code>
          </pre>
        </div>
      );
    }
    return (
      <p
        key={index}
        className="whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300 text-sm sm:text-base mb-3 font-sans"
      >
        {part}
      </p>
    );
  });
}

const fetchCache: Record<string, Promise<any>> = {};

export default function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [post, setPost] = useState<PostWithBookmark | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [questionComment, setQuestionComment] = useState("");
  const [showQuestionCommentInput, setShowQuestionCommentInput] =
    useState(false);

  // ─── Like / Unlike handler ────────────────────────────────────────────────────
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!post) return;

    const isLiked = post.user_has_liked;
    const prevPost = post;

    // Optimistic update
    setPost((prev) =>
      prev
        ? {
            ...prev,
            likes_count: isLiked ? prev.likes_count - 1 : prev.likes_count + 1,
            user_has_liked: !isLiked,
          }
        : prev
    );

    try {
      if (isLiked) {
        const res = await fetch("/api/unlikes", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target_id: post.id }),
        });
        if (!res.ok) {
          const data = await res.json();
          console.error("Unlike error:", data.message);
          setPost(prevPost);
        }
      } else {
        const res = await fetch("/api/likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target_id: post.id }),
        });
        if (!res.ok) {
          const data = await res.json();
          console.error("Like error:", data.message);
          setPost(prevPost);
        }
      }
    } catch (error) {
      console.error("Like/Unlike error:", error);
      setPost(prevPost);
    }
  };

  // ─── Bookmark / Unbookmark handler ────────────────────────────────────────────
  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!post) return;

    const isBookmarked = post.user_has_bookmarked;
    const prevPost = post;

    // Optimistic update
    setPost((prev) =>
      prev
        ? {
            ...prev,
            bookmarks_count: isBookmarked
              ? prev.bookmarks_count - 1
              : prev.bookmarks_count + 1,
            user_has_bookmarked: !isBookmarked,
            // Ensure bookmark_id is string or null
            bookmark_id: isBookmarked ? null : (prev.bookmark_id ?? null),
          }
        : prev
    );

    try {
      if (isBookmarked) {
        const bookmarkId = prevPost.bookmark_id;
        if (!bookmarkId) {
          console.error("Unbookmark error: bookmark_id tidak ditemukan");
          setPost(prevPost);
          return;
        }
        const res = await fetch(`/api/bookmark/${bookmarkId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json();
          console.error("Unbookmark error:", data.message);
          setPost(prevPost);
        }
      } else {
        const res = await fetch("/api/bookmark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_id: post.id }),
        });
        if (!res.ok) {
          const data = await res.json();
          console.error("Bookmark error:", data.message);
          setPost(prevPost);
          return;
        }
        const data = await res.json();
        const newBookmarkId = data.data?.id ?? data.data ?? null;
        setPost((prev) =>
          prev ? { ...prev, bookmark_id: newBookmarkId } : prev
        );
      }
    } catch (error) {
      console.error("Bookmark/Unbookmark error:", error);
      setPost(prevPost);
    }
  };

  // ─── Comment Like / Unlike handler ────────────────────────────────────────────
  const handleCommentLike = async (e: React.MouseEvent, commentId: string) => {
    e.stopPropagation();
    if (!post) return;

    let isLiked = false;
    let targetComment: Comment | undefined = post.comments.find((c) => c.id === commentId);

    if (!targetComment) {
      for (const c of post.comments) {
        if (c.replies) {
          const found = c.replies.find((r) => r.id === commentId);
          if (found) {
            targetComment = found;
            break;
          }
        }
      }
    }

    if (!targetComment) return;

    isLiked = targetComment.user_has_liked;
    const prevPost = post;

    // Optimistic update
    setPost((prev) => {
      if (!prev) return null;

      const updateComment = (c: Comment): Comment => {
        if (c.id === commentId) {
          return {
            ...c,
            likes_count: isLiked ? c.likes_count - 1 : c.likes_count + 1,
            user_has_liked: !isLiked,
          };
        }
        if (c.replies && c.replies.length > 0) {
          return {
            ...c,
            replies: c.replies.map(updateComment),
          };
        }
        return c;
      };

      return {
        ...prev,
        comments: prev.comments.map(updateComment),
      };
    });

    try {
      if (isLiked) {
        const res = await fetch("/api/unlikes", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target_id: commentId }),
        });
        if (!res.ok) {
          const data = await res.json();
          console.error("Unlike comment error:", data.message);
          setPost(prevPost);
        }
      } else {
        const res = await fetch("/api/likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target_id: commentId }),
        });
        if (!res.ok) {
          const data = await res.json();
          console.error("Like comment error:", data.message);
          setPost(prevPost);
        }
      }
    } catch (error) {
      console.error("Like/Unlike comment error:", error);
      setPost(prevPost);
    }
  };

  // ─── Scroll to top on navigation ─────────────────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  // ─── Fetch post detail ───────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;

    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!fetchCache[id]) {
          fetchCache[id] = fetch(`/api/posts/${id}`).then(async (res) => {
            if (!res.ok) {
              const json = await res.json();
              throw new Error(json.message || "Post tidak ditemukan");
            }
            return res.json();
          });

          // Clean up cache after a delay to ensure subsequent page loads get fresh data
          fetchCache[id].finally(() => {
            setTimeout(() => {
              delete fetchCache[id];
            }, 1000);
          });
        }

        const json = await fetchCache[id];
        if (active) {
          // Route mengembalikan { status, data } sesuai PostDetailResponse
          const postData: PostWithBookmark = (json.data ?? json) as any;

          try {
            const bookmarksRes = await fetch("/api/bookmark");
            if (bookmarksRes.ok) {
              const bookmarksJson = await bookmarksRes.json();
              const bookmarksList = bookmarksJson.data ?? [];
              const matchedBookmark = bookmarksList.find((b: any) => b.post_id === postData.id);
              if (matchedBookmark) {
                postData.bookmark_id = matchedBookmark.id;
              }
            }
          } catch (bookmarkErr) {
            console.error("Gagal mencocokkan bookmark_id:", bookmarkErr);
          }

          setPost(postData);
        }
      } catch (err: any) {
        console.error("Fetch post detail error:", err);
        if (active) {
          setError(err.message || "Gagal memuat data. Silakan coba lagi.");
        }
        delete fetchCache[id];
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      active = false;
    };
  }, [id]);

  // ─── Add comment handler (placeholder, sambungkan ke API komentar jika ada) ──
  const handleAddQuestionComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionComment.trim()) return;
    // TODO: hubungkan ke route /api/comments saat tersedia
    setQuestionComment("");
    setShowQuestionCommentInput(false);
  };

  // ─── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-2 text-zinc-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Memuat pertanyaan...</span>
      </div>
    );
  }

  // ─── Error state ──────────────────────────────────────────────────────────────
  if (error || !post) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-red-400" />
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {error || "Pertanyaan tidak ditemukan atau telah dihapus."}
        </p>
        <button
          onClick={() => router.push("/homepage")}
          className="text-xs text-brand-blue underline cursor-pointer"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* BACK LINK */}
      <Link
        href="/homepage"
        className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500 hover:text-brand-blue dark:text-zinc-400 dark:hover:text-blue-400 transition-colors py-1 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Kembali ke Beranda</span>
      </Link>

      {/* TITLE + META */}
      <div className="pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-white leading-tight">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          <span>
            Ditanyakan:{" "}
            <strong className="text-zinc-700 dark:text-zinc-300 font-sans">
              {formatDate(post.created_at)}
            </strong>
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <strong className="text-zinc-700 dark:text-zinc-300 font-sans">
              {post.view_count.toLocaleString()} kali
            </strong>
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            <strong className="text-zinc-700 dark:text-zinc-300 font-sans">
              {post.comments_count} komentar
            </strong>
          </span>
          {post.is_answered === 1 && (
            <span className="flex items-center gap-1 text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full font-semibold">
              <CheckCircle2 className="h-3 w-3" />
              Terjawab
            </span>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="flex gap-4 sm:gap-6">
        {/* VOTE + ACTIONS SIDEBAR */}
        <div className="flex flex-col items-center gap-1.5 text-center shrink-0">
          {/* Vote up */}
          <button
            className="p-1.5 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-950 hover:text-brand-blue transition-colors cursor-pointer"
            title="Sangat berkontribusi (Mendukung)"
          >
            <ChevronUp className="h-8 w-8 stroke-[2.5]" />
          </button>
          <span className="text-lg font-bold font-mono text-zinc-800 dark:text-zinc-200">
            {post.vote_score}
          </span>
          {/* Vote down */}
          <button
            className="p-1.5 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-950 transition-colors cursor-pointer"
            title="Kurang berkontribusi (Menolak)"
          >
            <ChevronDown className="h-8 w-8 stroke-[2.5]" />
          </button>

          {/* Like */}
          <button
            onClick={handleLike}
            className={`mt-2 transition-colors cursor-pointer ${
              post.user_has_liked
                ? "text-red-500"
                : "text-zinc-300 hover:text-red-400 dark:text-zinc-600"
            }`}
            title="Like pertanyaan ini"
          >
            <Heart
              className="h-5 w-5"
              fill={post.user_has_liked ? "currentColor" : "none"}
            />
          </button>
          <span className="text-[10px] font-mono text-zinc-400">
            {post.likes_count}
          </span>

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            className={`mt-1 transition-colors cursor-pointer ${
              post.user_has_bookmarked
                ? "text-yellow-500"
                : "text-zinc-300 hover:text-yellow-400 dark:text-zinc-600"
            }`}
            title="Bookmark pertanyaan ini"
          >
            <Bookmark
              className="h-5 w-5"
              fill={post.user_has_bookmarked ? "currentColor" : "none"}
            />
          </button>
          <span className="text-[10px] font-mono text-zinc-400">
            {post.bookmarks_count}
          </span>
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-w-0 pr-1 sm:pr-2">
          <article className="prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200">
            {formatTextBody(post.body)}
          </article>

          {/* TAGS */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-5">
              {post.tags.map((tag: any) => (
                <span
                  key={tag.id ?? tag}
                  className="text-[11px] px-2.5 py-1 bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-800/80 rounded font-mono"
                >
                  #{tag.name ?? tag}
                </span>
              ))}
            </div>
          )}

          {/* CATEGORY */}
          <div className="mt-3">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              {post.category.name}
            </span>
          </div>

          {/* AUTHOR CARD */}
          <div className="flex justify-end gap-4 mt-6">
            <div className="w-56 bg-zinc-100/60 dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-200/40 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono block mb-1">
                Ditanyakan {formatDate(post.created_at)}
              </span>
              <div className="flex items-center gap-2">
                <img
                  src={resolveAvatar(post.user.avatar_url)}
                  alt={post.user.username}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div className="text-left">
                  <span className="block text-xs font-bold text-zinc-700 dark:text-zinc-200">
                    {post.user.username}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                    <Award className="h-3 w-3 text-brand-blue" />
                    <span>{post.user.reputation_points.toLocaleString()} rep</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COMMENTS */}
          <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-900/60 space-y-3.5">
            <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Komentar Pertanyaan ({post.comments.length})</span>
            </h4>

            {post.comments.length > 0 && (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-900 pl-3 sm:pl-4 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-2.5 pb-2">
                {post.comments.map((comm: Comment) => (
                  <div
                    key={comm.id}
                    className="group flex items-start justify-between gap-4 text-xs text-zinc-650 dark:text-zinc-350 pt-2 first:pt-0 leading-relaxed font-sans"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 mr-1">
                        {comm.user.username}:
                      </span>
                      {comm.body}
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-2 font-mono whitespace-nowrap">
                        — {formatDate(comm.created_at)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleCommentLike(e, comm.id)}
                      className={`flex items-center gap-1 cursor-pointer transition-colors shrink-0 ${
                        comm.user_has_liked
                          ? "text-red-500"
                          : "text-zinc-400 hover:text-red-500 dark:text-zinc-550"
                      }`}
                      title="Like komentar ini"
                    >
                      <Heart
                        className="h-3 w-3"
                        fill={comm.user_has_liked ? "currentColor" : "none"}
                      />
                      <span className="text-[10px] font-mono">{comm.likes_count}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!showQuestionCommentInput ? (
              <button
                onClick={() => setShowQuestionCommentInput(true)}
                className="text-xs text-zinc-500 hover:text-brand-blue dark:text-zinc-400 dark:hover:text-blue-400 underline cursor-pointer"
              >
                + Tambah komentar baru pada pertanyaan
              </button>
            ) : (
              <form
                onSubmit={handleAddQuestionComment}
                className="flex gap-2 max-w-2xl mt-2"
              >
                <input
                  type="text"
                  placeholder="Ketik komentar singkat (hindari memasukkan jawaban di sini)..."
                  value={questionComment}
                  onChange={(e) => setQuestionComment(e.target.value)}
                  className="flex-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
                <button
                  type="submit"
                  className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs px-3 py-1 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <Send className="h-3 w-3" />
                  Kirim
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuestionCommentInput(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-1 cursor-pointer"
                >
                  Batal
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* REPLIES (top-level comments treated as answers/replies) */}
      {post.comments.some((c: Comment) => c.replies && c.replies.length > 0) && (
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-850 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
              Balasan
            </h2>
          </div>
          <div className="space-y-6">
            {post.comments
              .filter((c: Comment) => c.replies && c.replies.length > 0)
              .flatMap((c: Comment) => c.replies)
              .map((reply: Comment) => (
                <div
                  key={reply.id}
                  className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                >
                  <div className="flex gap-4 sm:gap-6">
                    <div className="flex flex-col items-center gap-1 text-center shrink-0 pt-1">
                      <button className="p-1 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer">
                        <ChevronUp className="h-6 w-6 stroke-[3.0]" />
                      </button>
                      <span className="text-sm font-bold font-mono text-zinc-700 dark:text-zinc-300">
                        {reply.vote_score}
                      </span>
                      <button className="p-1 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer">
                        <ChevronDown className="h-6 w-6 stroke-[3.0]" />
                      </button>
                      {reply.is_accepted === 1 ? (
                        <div
                          className="mt-2 text-emerald-500"
                          title="Solusi yang disepakati"
                        >
                          <CheckCircle2 className="h-6 w-6 fill-emerald-500/10" />
                        </div>
                      ) : (
                        <button
                          className="mt-2 text-zinc-300 hover:text-emerald-500 transition-colors cursor-pointer"
                          title="Tandai sebagai solusi"
                        >
                          <Check className="h-5 w-5 hover:scale-110 active:scale-95 transition-transform" />
                        </button>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-1">
                      <article className="prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200">
                        {formatTextBody(reply.body)}
                      </article>

                      <div className="flex justify-between items-center mt-6">
                        <div>
                          <div className="flex items-center gap-3">
                            {reply.is_accepted === 1 && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-sans">
                                ✓ Solusi Disepakati
                              </span>
                            )}
                            <button
                              onClick={(e) => handleCommentLike(e, reply.id)}
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer transition-colors ${
                                reply.user_has_liked
                                  ? "text-red-500"
                                  : "text-zinc-450 hover:text-red-550 dark:text-zinc-500"
                              }`}
                              title="Like balasan ini"
                            >
                              <Heart
                                className="h-3.5 w-3.5"
                                fill={reply.user_has_liked ? "currentColor" : "none"}
                              />
                              <span>{reply.likes_count}</span>
                            </button>
                          </div>
                        </div>
                        <div className="w-56 bg-zinc-100/40 dark:bg-zinc-900/40 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono block mb-1">
                            Dijawab oleh:
                          </span>
                          <div className="flex items-center gap-2">
                            <img
                              src={resolveAvatar(reply.user.avatar_url)}
                              alt={reply.user.username}
                              className="h-6 w-6 rounded-full object-cover"
                            />
                            <div className="text-left">
                              <span className="block text-xs font-bold text-zinc-700 dark:text-zinc-200">
                                {reply.user.username}
                              </span>
                              <span className="text-[9px] text-zinc-400 font-mono">
                                Rep: {reply.user.reputation_points.toLocaleString()} •{" "}
                                {formatDate(reply.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ADD ANSWER / COMMENT FORM */}
      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-850 space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
          Jawaban Anda
        </h3>

        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-lg text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
          <p className="font-semibold text-zinc-700 dark:text-zinc-300">
            💡 Tips Format Pengkodean Markdown:
          </p>
          <p>
            Gunakan tanda triple backtick (```) untuk menyelimuti barisan
            potongan kode program agar rapi, disertai nama bahasa pemrograman di
            baris awal. Cth: ```tsx ... ```
          </p>
        </div>

        <form className="space-y-4">
          <textarea
            id="answer-body-textarea"
            rows={7}
            placeholder="Tuliskan petunjuk penyelesaian, sertakan potongan kode program jika diperlukan..."
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all duration-150"
            required
          />
          <button
            id="btn-submit-answer"
            type="submit"
            className="bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow active:scale-98 cursor-pointer transition-all duration-150"
          >
            Kirim Jawaban Anda
          </button>
        </form>
      </div>
    </div>
  );
}
