
"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  Calendar,
  FileText,
  Users,
  UserCheck,
  Shield,
  CheckCircle2,
  CircleDot,
  TrendingUp,
  Heart,
  MessageSquare,
  ChevronRight,
  Edit3,
  Mail,
  Star,
  ShieldCheck,
  Bookmark,
  Key,
  Flag,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

// ─── Types (mirror dari /profile/[username]) ──────────────────────────────────

interface RolePivot {
  user_id: string;
  role_id: string;
}

interface Role {
  id: string;
  name: string;
  permissions: string | null;
  created_at: string;
  pivot: RolePivot;
}

interface BadgePivot {
  user_id: string;
  badge_id: string;
  created_at: string;
  updated_at: string;
}

export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  tier: BadgeTier;
  condition_type: string;
  condition_value: number;
  pivot: BadgePivot;
}

interface TagPivot {
  post_id: string;
  tag_id: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  usage_count: number;
  created_at: string;
  pivot: TagPivot;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
}

interface Post {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  body: string;
  status: "open" | "closed" | "archived";
  view_count: number;
  vote_score: number;
  is_answered: 0 | 1;
  accepted_answer_id: string | null;
  created_at: string;
  updated_at: string;
  likes_count: number;
  bookmarks_count: number;
  comments_count: number;
  upvotes_count: number;
  downvotes_count: number;
  votes_count: number;
  user_has_liked: boolean;
  user_has_bookmarked: boolean;
  tags: Tag[];
  category: Category;
}

interface UserDetail {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  reputation_points: number;
  level: number;
  is_banned: 0 | 1;
  created_at: string;
  updated_at: string;
  posts_count: number;
  followers_count: number;
  following_count: number;
  badges_count: number;
  roles: Role[];
  badges: Badge[];
  posts: Post[];
}

interface UserDetailResponse {
  message: string;
  user: UserDetail;
  is_following: boolean;
}

// Likes types
interface LikeComment {
  id: string;
  post_id: string;
  body: string;
  vote_score: number;
  is_accepted: 0 | 1;
  created_at: string;
}

interface LikePost {
  id: string;
  title: string;
  body: string;
  status: "open" | "closed";
  view_count: number;
  vote_score: number;
  is_answered: 0 | 1;
  created_at: string;
}

interface LikeItem {
  id: string;
  user_id: string;
  target_id: string;
  target_type: "post" | "comment";
  created_at: string;
  post: LikePost | null;
  comment: LikeComment | null;
}

interface LikesApiResponse {
  likes: LikeItem[];
}

// ─── Bookmark types ───────────────────────────────────────────────────────────

interface BookmarkItem {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

interface BookmarksApiResponse {
  message: string;
  data: BookmarkItem[];
}

interface BookmarkPostDetail {
  id: string;
  title: string;
  body: string;
  status: string;
  view_count: number;
  vote_score: number;
  is_answered: number;
  likes_count: number;
  comments_count: number;
  upvotes_count: number;
  created_at: string;
  category: { id: string; name: string; slug: string };
  tags: { id: string; name: string; color: string }[];
  user: { id: string; username: string; avatar_url: string | null };
}

interface PointLog {
  id: string;
  user_id: string;
  points: number;
  action_type: string;
  reference_id: string;
  description: string;
  created_at: string;
}

interface PointsLogsResponse {
  status: string;
  username: string;
  reputation_points: number;
  data: PointLog[];
}

interface ReportItem {
  id: string;
  reporter_id: string;
  target_id: string;
  target_type: "user" | "post" | "comment" | string;
  reason: string;
  description: string | null;
  status: string;
  resolved_by: UserDetail | null;
  created_at: string;
  resolved_at: string | null;
  reporter: UserDetail;
  user: UserDetail | null;
  post: any | null;
  comment: any | null;
}

interface ReportsApiResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: ReportItem[];
    last_page: number;
    total: number;
  };
}

interface SelfWarningItem {
  id: string;
  moderator_id: string;
  target_user_id: string;
  action_type: string;
  reason: string;
  notes: string | null;
  created_at: string;
  moderator: UserDetail;
  user: UserDetail;
}

interface SelfWarningResponse {
  success: boolean;
  message: string;
  data: SelfWarningItem[];
}

type TabKey = "posts" | "activity" | "likes" | "bookmarks" | "credentials" | "points" | "reports" | "warnings";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_BASE = "https://pegaduanmasyarakat.alwaysdata.net/storage/";

function avatarSrc(url: string | null): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : `${STORAGE_BASE}${url}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

function formatDateFull(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function primaryRole(roles: Role[]): string {
  const priority = ["admin", "moderator", "user"];
  for (const p of priority) {
    const found = roles.find((r) => r.name === p);
    if (found) return found.name;
  }
  return roles[0]?.name ?? "member";
}

function roleBadgeStyle(role: string): string {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
    case "moderator":
      return "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400";
    default:
      return "bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20";
  }
}

function tierColor(tier: BadgeTier): string {
  switch (tier) {
    case "gold":
      return "#f59e0b";
    case "silver":
      return "#94a3b8";
    case "platinum":
      return "#8b5cf6";
    default:
      return "#b45309";
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PostStatusBadge({ post }: { post: Post | LikePost }) {
  if (post.is_answered) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded">
        <CheckCircle2 className="h-2.5 w-2.5" />
        Terjawab
      </span>
    );
  }
  if (post.status === "open") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 px-1.5 py-0.5 rounded">
        <CircleDot className="h-2.5 w-2.5" />
        Terbuka
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 px-1.5 py-0.5 rounded">
      Ditutup
    </span>
  );
}

function BadgesSection({
  badges,
  count,
}: {
  badges: Badge[];
  count: number;
}) {
  if (count === 0 || badges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <Award className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
        <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">
          Belum ada lencana diraih.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 pt-1">
      {badges.map((b) => (
        <div
          key={b.id}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl"
        >
          {b.icon_url ? (
            <img
              src={avatarSrc(b.icon_url) ?? ""}
              alt={b.name}
              className="h-6 w-6 rounded object-cover"
            />
          ) : (
            <Award
              className="h-5 w-5 shrink-0"
              style={{ color: tierColor(b.tier) }}
            />
          )}
          <div className="text-left">
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 leading-none">
              {b.name}
            </p>
            {b.description && (
              <p className="text-[10px] text-zinc-400 mt-0.5">
                {b.description}
              </p>
            )}
            <span
              className="text-[9px] font-bold uppercase tracking-wider mt-0.5 inline-block"
              style={{ color: tierColor(b.tier) }}
            >
              {b.tier}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LikesSection({
  username,
  onNavigatePost,
}: {
  username: string;
  onNavigatePost: (id: string) => void;
}) {
  const [data, setData] = useState<LikesApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/likes-user/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat likes.");
        return res.json() as Promise<LikesApiResponse>;
      })
      .then(setData)
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
              onClick={() => onNavigatePost(like.comment!.post_id)}
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
                  klik untuk lihat post →
                </span>
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

// ─── Bookmark Section ─────────────────────────────────────────────────────────

function BookmarkSection({
  onNavigatePost,
}: {
  onNavigatePost: (id: string) => void;
}) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [posts, setPosts] = useState<Record<string, BookmarkPostDetail>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/bookmark");
        if (!res.ok) {
          if (res.status === 401) throw new Error("Sesi telah berakhir, silakan login ulang.");
          throw new Error("Gagal memuat bookmark.");
        }
        const data: BookmarksApiResponse = await res.json();
        const items = data.data ?? [];
        setBookmarks(items);

        // Fetch post details secara paralel
        if (items.length > 0) {
          const postResults = await Promise.allSettled(
            items.map((b) =>
              fetch(`/api/posts/${b.post_id}`)
                .then((r) => (r.ok ? r.json() : Promise.reject()))
                .then((d) => ({ id: b.post_id, detail: d.data as BookmarkPostDetail }))
            )
          );
          const postMap: Record<string, BookmarkPostDetail> = {};
          postResults.forEach((result) => {
            if (result.status === "fulfilled") {
              postMap[result.value.id] = result.value.detail;
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
                {/* Header: title + status */}
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

                {/* Tags + category */}
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

                {/* Stats */}
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
              /* fallback jika detail post gagal dimuat */
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

// ─── Points Section ───────────────────────────────────────────────────────

function PointsSection({ username }: { username: string }) {
  const [data, setData] = useState<PointsLogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/points-logs/user/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat histori point.");
        return res.json();
      })
      .then((d) => setData(d))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue" />
        <span className="text-xs text-zinc-400">Memuat histori point…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-xs text-red-500 italic py-6 text-center">
        {error ?? "Gagal memuat histori point."}
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

// ─── Reports Section ────────────────────────────────────────────────────────
function ReportsSection({ username }: { username: string }) {
  const [data, setData] = useState<ReportsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat laporan.");
        return res.json();
      })
      .then((d) => {
        if (d.success) {
          setData(d);
        } else {
          throw new Error(d.message || "Gagal memuat laporan.");
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue" />
        <span className="text-xs text-zinc-400">Memuat laporan Anda…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-xs text-red-500 italic py-6 text-center">
        {error ?? "Gagal memuat laporan."}
      </p>
    );
  }

  if (data.data.data.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 gap-2">
        <Flag className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
        <p className="text-xs text-zinc-400 italic">Anda belum membuat laporan.</p>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "resolved": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800";
      case "dismissed": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800";
      case "reviewed": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800";
      default: return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800";
    }
  };

  return (
    <div className="space-y-3">
      {data.data.data.map((report) => (
        <div key={report.id} className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-2 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1">
              <Flag className="h-3 w-3" />
              Target: {report.target_type === 'user' && report.user ? `@${report.user.username}` : report.target_type}
            </span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusStyle(report.status)}`}>
              {report.status}
            </span>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
            <p className="text-xs font-semibold text-zinc-900 dark:text-white">Alasan: {report.reason}</p>
            {report.description && (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 italic leading-relaxed">"{report.description}"</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] text-zinc-400 font-mono mt-1 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span>Dilaporkan: {formatDateFull(report.created_at)}</span>
            {report.resolved_at && (
              <span className="text-emerald-500 font-bold">Diselesaikan: {formatDateFull(report.resolved_at)}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Warnings Section ───────────────────────────────────────────────────────
function WarningsSection() {
  const [data, setData] = useState<SelfWarningResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/self-warning`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat history warning.");
        return res.json();
      })
      .then((d) => {
        if (d.success) {
          setData(d);
        } else {
          throw new Error(d.message || "Gagal memuat history warning.");
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue" />
        <span className="text-xs text-zinc-400">Memuat riwayat warning…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-xs text-red-500 italic py-6 text-center">
        {error ?? "Gagal memuat riwayat warning."}
      </p>
    );
  }

  if (!data.data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 gap-2">
        <AlertTriangle className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
        <p className="text-xs text-zinc-400 italic">Anda belum memiliki riwayat warning.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.data.map((warning) => (
        <div key={warning.id} className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-2 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
              Tindakan: {warning.action_type}
            </span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800`}>
              Warning
            </span>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
            <p className="text-xs font-semibold text-zinc-900 dark:text-white">Alasan: {warning.reason}</p>
            {warning.notes && (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 italic leading-relaxed">"{warning.notes}"</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] text-zinc-400 font-mono mt-1 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span>Diberikan oleh: @{warning.moderator?.username || "Sistem"}</span>
            <span>Tanggal: {formatDateFull(warning.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Credentials Section ──────────────────────────────────────────────────────

function CredentialsSection({ user, onNavigatePoints }: { user: UserDetail; onNavigatePoints?: () => void }) {
  const role = primaryRole(user.roles);
  const router = useRouter();

  return (
    <div className="space-y-5">
      {/* Identitas Akun */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-blue" />
          Identitas Akun
        </p>

        {[
          { icon: <FileText className="h-3.5 w-3.5" />, label: "ID Pengguna", value: user.id },
          { icon: <Mail className="h-3.5 w-3.5" />, label: "Email", value: user.email },
          { icon: <Star className="h-3.5 w-3.5" />, label: "Username", value: `@${user.username}` },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-start justify-between gap-3 text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">
            <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 shrink-0">
              <span className="text-zinc-400">{icon}</span>
              {label}
            </span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-white text-right break-all">
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Status & Keamanan */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-brand-blue" />
          Status & Keamanan
        </p>

        <div className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
          <span className="text-zinc-500 dark:text-zinc-400">Status Akun</span>
          {user.is_banned ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">
              <Shield className="h-3 w-3" /> Dibanned
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="h-3 w-3" /> Aktif
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
          <span className="text-zinc-500 dark:text-zinc-400">Role Utama</span>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${roleBadgeStyle(role)}`}>
            {role}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3 text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
          <span className="text-zinc-500 dark:text-zinc-400">Semua Role</span>
          <div className="flex flex-wrap gap-1 justify-end">
            {user.roles.length > 0 ? user.roles.map((r) => (
              <span key={r.id} className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${roleBadgeStyle(r.name)}`}>
                {r.name}
              </span>
            )) : (
              <span className="text-zinc-400 italic">Tidak ada role</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
          <span className="text-zinc-500 dark:text-zinc-400">Level</span>
          <span className="font-mono font-bold text-brand-blue">Lv. {user.level}</span>
        </div>

        <div className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
          <span className="text-zinc-500 dark:text-zinc-400">Reputasi</span>
          <span 
            className="font-mono font-black text-brand-blue text-sm cursor-pointer hover:underline"
            onClick={() => onNavigatePoints && onNavigatePoints()}
          >
            {user.reputation_points.toLocaleString()} pts
          </span>
        </div>

        <div className="flex items-center justify-between text-xs py-1.5">
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">Kata Sandi</span>
          <button
            onClick={() => router.push("/profile/change-password")}
            className="text-[10px] font-bold text-brand-blue hover:underline cursor-pointer"
          >
            Ubah Password
          </button>
        </div>
      </div>

      {/* Timestamps */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-brand-blue" />
          Riwayat Akun
        </p>
        {[
          { label: "Tanggal Daftar", value: formatDateFull(user.created_at) },
          { label: "Terakhir Diperbarui", value: formatDateFull(user.updated_at) },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between gap-3 text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">
            <span className="text-zinc-500 dark:text-zinc-400 shrink-0">{label}</span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-white text-right">{value}</span>
          </div>
        ))}
      </div>

      {/* Statistik Sosial */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-brand-blue" />
          Statistik Sosial
        </p>
        {[
          { label: "Total Pertanyaan", value: user.posts_count },
          { label: "Pengikut", value: user.followers_count },
          { label: "Mengikuti", value: user.following_count },
          { label: "Total Lencana", value: user.badges_count },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">
            <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
            <span className="font-mono font-bold text-zinc-900 dark:text-white">{value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MyProfilePage() {
  const router = useRouter();
  const { currentUser } = useApp();

  const [data, setData] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("posts");

  // Redirect jika belum login
  useEffect(() => {
    if (currentUser === null && !loading) {
      router.push("/login");
    }
  }, [currentUser, loading, router]);

  // Fetch /api/me lalu /api/profile/{username}
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Step 1: dapatkan username dari /api/me
        const meRes = await fetch("/api/me");
        if (!meRes.ok) {
          router.push("/login");
          return;
        }
        const meData = await meRes.json();
        const username = meData.user?.username;
        if (!username) throw new Error("Username tidak ditemukan.");

        // Step 2: fetch detail lengkap dari /api/profile/{username}
        const profileRes = await fetch(`/api/profile/${encodeURIComponent(username)}`);
        if (!profileRes.ok) throw new Error("Gagal memuat profil detail.");
        const profileData: UserDetailResponse = await profileRes.json();
        setData(profileData);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-brand-blue" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Memuat profil Anda…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <p className="text-sm font-semibold text-red-500">
          {error ?? "Gagal memuat profil."}
        </p>
        <button
          onClick={() => router.push("/login")}
          className="text-xs text-brand-blue hover:underline"
        >
          ← Kembali ke Login
        </button>
      </div>
    );
  }

  const { user } = data;
  const role = primaryRole(user.roles);
  const src = avatarSrc(user.avatar_url);
  const answeredPosts = user.posts.filter((p) => p.is_answered);
  const openPosts = user.posts.filter(
    (p) => p.status === "open" && !p.is_answered
  );

  const tabs: {
    key: TabKey;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      key: "posts",
      label: "Pertanyaan",
      icon: <FileText className="h-3.5 w-3.5" />,
      count: user.posts_count,
    },
    {
      key: "activity",
      label: "Aktivitas",
      icon: <TrendingUp className="h-3.5 w-3.5" />,
    },
    {
      key: "likes",
      label: "Disukai",
      icon: <Heart className="h-3.5 w-3.5" />,
    },
    {
      key: "bookmarks",
      label: "Bookmark",
      icon: <Bookmark className="h-3.5 w-3.5" />,
    },
    {
      key: "credentials",
      label: "Kredensial",
      icon: <ShieldCheck className="h-3.5 w-3.5" />,
    },
    {
      key: "points",
      label: "Histori Point",
      icon: <Award className="h-3.5 w-3.5" />,
    },
    {
      key: "reports",
      label: "Laporan Saya",
      icon: <Flag className="h-3.5 w-3.5" />,
    },
    {
      key: "warnings",
      label: "Warning",
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div className="space-y-5">
      {/* ── Hero Card ─────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Banner dengan gradient + "Profil Saya" label */}
        <div className="h-28 bg-gradient-to-r from-brand-blue to-sky-500 relative flex items-end px-5 pb-3">
          <span className="text-white/80 text-xs font-semibold tracking-widest uppercase select-none">
            Profil Saya
          </span>
        </div>

        <div className="px-5 pb-5 relative">
          {/* Avatar + Edit button row */}
          <div className="-mt-12 mb-4 flex items-end justify-between gap-4">
            {/* Avatar */}
            <div className="shrink-0">
              {src ? (
                <img
                  src={src}
                  alt={user.username}
                  referrerPolicy="no-referrer"
                  className="h-20 w-20 rounded-xl object-cover border-4 border-white dark:border-zinc-950 shadow-md bg-zinc-100"
                />
              ) : (
                <div className="h-20 w-20 rounded-xl bg-brand-blue text-white flex items-center justify-center font-black text-2xl shadow-inner uppercase border-4 border-white dark:border-zinc-950 select-none">
                  {user.username.charAt(0)}
                </div>
              )}
            </div>

            {/* Edit Profile Button */}
            <div className="pt-17 flex flex-col gap-2 items-end">
              <button
                id="btn-edit-profile-toggle"
                onClick={() => router.push("/profile/edit")}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-all cursor-pointer whitespace-nowrap w-40"
              >
                <Edit3 className="h-3 w-3" />
                Edit Profil
              </button>
              <button
                id="btn-change-password-toggle"
                onClick={() => router.push("/profile/change-password")}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-all cursor-pointer whitespace-nowrap w-40"
              >
                <Key className="h-3 w-3" />
                Ubah Password
              </button>
            </div>
          </div>

          {/* Name + role badge */}
          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
                {user.username}
              </h1>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${roleBadgeStyle(role)}`}
              >
                {role}
              </span>
              {user.is_banned ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 inline-flex items-center gap-1">
                  <Shield className="h-2.5 w-2.5" />
                  Dibanned
                </span>
              ) : null}
            </div>
            <p className="text-xs text-zinc-400 font-mono">@{user.username}</p>
            <p className="text-xs text-zinc-400 font-mono">{user.email}</p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 mt-0.5">
              <Calendar className="h-3 w-3" />
              Bergabung {formatDateShort(user.created_at)}
            </p>
          </div>

          {/* Bio + social stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            {/* Social stats */}
            <div className="flex flex-row sm:flex-col gap-3 sm:gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <span>
                  <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">
                    {user.followers_count}
                  </strong>{" "}
                  pengikut
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <span>
                  <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">
                    {user.following_count}
                  </strong>{" "}
                  mengikuti
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <span>
                  <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">
                    {user.badges_count}
                  </strong>{" "}
                  lencana
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="sm:col-span-2">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                Bio
              </p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {user.bio || (
                  <span className="italic text-zinc-400">
                    Belum ada bio ditulis.
                  </span>
                )}
              </p>

              {/* Badges chips */}
              {user.badges.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {user.badges.map((b) => (
                    <span
                      key={b.id}
                      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                      style={{
                        borderColor: tierColor(b.tier),
                        color: tierColor(b.tier),
                        backgroundColor: `${tierColor(b.tier)}18`,
                      }}
                    >
                      <Award className="h-2.5 w-2.5" />
                      {b.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick stats strip ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Reputasi",
            value: user.reputation_points,
            sub: `Level ${user.level}`,
            onClick: () => setActiveTab("points"),
          },
          { label: "Total Post", value: user.posts_count, sub: "pertanyaan" },
          { label: "Lencana", value: user.badges_count, sub: "badge" },
        ].map(({ label, value, sub, onClick }) => (
          <div
            key={label}
            onClick={onClick}
            className={`p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center ${onClick ? 'cursor-pointer hover:border-brand-blue transition-all' : ''}`}
          >
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              {label}
            </div>
            <div className="text-xl font-black text-brand-blue font-mono mt-0.5">
              {value.toLocaleString()}
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tab nav ───────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Tab header */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-brand-blue text-brand-blue"
                  : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-0.5 font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-4">
          {/* ── Posts tab ───────────────────────────────────────────────── */}
          {activeTab === "posts" && (
            <div className="space-y-2">
              {user.posts.length > 0 ? (
                user.posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => router.push(`/posts/${post.id}`)}
                    className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-brand-blue cursor-pointer transition-all duration-150 space-y-2 text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white line-clamp-1 hover:text-brand-blue flex-1">
                        {post.title}
                      </h4>
                      <PostStatusBadge post={post} />
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 rounded font-mono">
                        {post.category.name}
                      </span>
                      {post.tags.map((t) => (
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
                        <span className="font-bold text-brand-blue">
                          ↑{post.upvotes_count}
                        </span>
                        <span>{post.comments_count} komentar</span>
                        <span>{post.view_count} views</span>
                      </div>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center py-10 gap-2">
                  <FileText className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                  <p className="text-xs text-zinc-400 italic">
                    Belum ada pertanyaan.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Activity tab ────────────────────────────────────────────── */}
          {activeTab === "activity" && (
            <div className="space-y-4">
              <div className="space-y-2">
                {[
                  {
                    label: "Total pertanyaan ditulis",
                    value: user.posts_count,
                  },
                  { label: "Post terjawab", value: answeredPosts.length },
                  { label: "Post masih terbuka", value: openPosts.length },
                  { label: "Pengikut", value: user.followers_count },
                  { label: "Mengikuti", value: user.following_count },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center text-xs text-zinc-600 dark:text-zinc-400 py-1.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0"
                  >
                    <span>{label}</span>
                    <span className="font-bold text-zinc-900 dark:text-white font-mono">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {user.posts_count > 0 && (
                <div className="pt-2">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    <span>Accept rate</span>
                    <span className="text-brand-blue font-mono">
                      {Math.round(
                        (answeredPosts.length / user.posts_count) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-blue transition-all"
                      style={{
                        width: `${Math.round(
                          (answeredPosts.length / user.posts_count) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                  Lencana ({user.badges_count})
                </p>
                <BadgesSection badges={user.badges} count={user.badges_count} />
              </div>
            </div>
          )}

          {/* ── Likes tab ───────────────────────────────────────────────── */}
          {activeTab === "likes" && (
            <LikesSection
              username={user.username}
              onNavigatePost={(id) => router.push(`/posts/${id}`)}
            />
          )}

          {/* ── Bookmarks tab ────────────────────────────────────────────── */}
          {activeTab === "bookmarks" && (
            <BookmarkSection
              onNavigatePost={(id) => router.push(`/posts/${id}`)}
            />
          )}

          {/* ── Credentials tab ─────────────────────────────────────────── */}
          {activeTab === "credentials" && (
            <CredentialsSection user={user} onNavigatePoints={() => setActiveTab("points")} />
          )}

          {/* ── Points tab ────────────────────────────────────────────────── */}
          {activeTab === "points" && (
            <PointsSection username={user.username} />
          )}

          {/* ── Reports tab ───────────────────────────────────────────────── */}
          {activeTab === "reports" && (
            <ReportsSection username={user.username} />
          )}

          {/* ── Warnings tab ──────────────────────────────────────────────── */}
          {activeTab === "warnings" && (
            <WarningsSection />
          )}
        </div>
      </div>
    </div>
  );
}
