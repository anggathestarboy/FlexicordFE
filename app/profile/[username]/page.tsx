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
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Role {
  id: string;
  name: string;
  permissions: string | null;
}

interface Badge {
  id: string;
  name: string;
  description?: string;
  image_url?: string | null;
  color?: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

interface Post {
  id: string;
  title: string;
  body: string;
  status: "open" | "closed";
  view_count: number;
  vote_score: number;
  is_answered: 0 | 1;
  comments_count: number;
  upvotes_count: number;
  downvotes_count: number;
  created_at: string;
  tags: Tag[];
  category: Category;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  reputation_points: number;
  level: number;
  is_banned: 0 | 1;
  created_at: string;
  posts_count: number;
  followers_count: number;
  following_count: number;
  badges_count: number;
  roles: Role[];
  badges: Badge[];
  posts: Post[];
}

interface ApiResponse {
  message: string;
  user: UserProfile;
  is_following: boolean;
}

// ─── Likes types ──────────────────────────────────────────────────────────────

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

// ─── Tab type ─────────────────────────────────────────────────────────────────

type TabKey = "posts" | "activity" | "likes";

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
    month: "short",
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

// ─── Badges Section ───────────────────────────────────────────────────────────

function BadgesSection({ badges, count }: { badges: Badge[]; count: number }) {
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
          {b.image_url ? (
            <img
              src={avatarSrc(b.image_url) ?? ""}
              alt={b.name}
              className="h-6 w-6 rounded object-cover"
            />
          ) : (
            <Award
              className="h-5 w-5 shrink-0"
              style={{ color: b.color ?? "#6366f1" }}
            />
          )}
          <div className="text-left">
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 leading-none">
              {b.name}
            </p>
            {b.description && (
              <p className="text-[10px] text-zinc-400 mt-0.5">{b.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Likes Section ────────────────────────────────────────────────────────────

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
        <div key={like.id} className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5">
          {/* type badge */}
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

          {/* content */}
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
                "{like.comment.body}"
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const username = params?.username;

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("posts");

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    fetch(`/api/profile/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("Pengguna tidak ditemukan.");
        return res.json() as Promise<ApiResponse>;
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-brand-blue" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Memuat profil…</p>
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
          onClick={() => router.back()}
          className="text-xs text-brand-blue hover:underline"
        >
          ← Kembali
        </button>
      </div>
    );
  }

  const { user, is_following } = data;
  const role = primaryRole(user.roles);
  const src = avatarSrc(user.avatar_url);
  const answeredPosts = user.posts.filter((p) => p.is_answered);
  const openPosts = user.posts.filter((p) => p.status === "open" && !p.is_answered);

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "posts", label: "Pertanyaan", icon: <FileText className="h-3.5 w-3.5" />, count: user.posts_count },
    { key: "activity", label: "Aktivitas", icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { key: "likes", label: "Disukai", icon: <Heart className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="space-y-5">
      {/* ── Hero Card ─────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-brand-blue to-sky-500" />

        <div className="px-5 pb-5 relative">
          {/* Avatar row */}
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

            {/* Follow button */}
            <div className="pt-18">
              <button
                className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all ${
                  is_following
                    ? "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800"
                    : "bg-brand-blue hover:bg-brand-blue/90 text-white border-transparent"
                }`}
              >
                {is_following ? "Mengikuti" : "+ Ikuti"}
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
                  mengikuti{" "}
                  
                 
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
                  <span className="italic text-zinc-400">Belum ada bio ditulis.</span>
                )}
              </p>

              {/* Badges (not roles) */}
              {user.badges.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {user.badges.map((b) => (
                    <span
                      key={b.id}
                      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                      style={{
                        borderColor: b.color ?? "#6366f1",
                        color: b.color ?? "#6366f1",
                        backgroundColor: `${b.color ?? "#6366f1"}18`,
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
          { label: "Reputasi", value: user.reputation_points, sub: `Level ${user.level}` },
          { label: "Total Post", value: user.posts_count, sub: "pertanyaan" },
          { label: "Lencana", value: user.badges_count, sub: "badge" },
        ].map(({ label, value, sub }) => (
          <div
            key={label}
            className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center"
          >
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</div>
            <div className="text-xl font-black text-brand-blue font-mono mt-0.5">{value.toLocaleString()}</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tab nav ───────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Tab header */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
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
          {/* ── Posts tab ─────────────────────────────────────────────────── */}
          {activeTab === "posts" && (
            <div className="space-y-2">
              {user.posts.length > 0 ? (
                user.posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => router.push(`/questions/${post.id}`)}
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
                        <span className="font-bold text-brand-blue">↑{post.upvotes_count}</span>
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
                  <p className="text-xs text-zinc-400 italic">Belum ada pertanyaan.</p>
                </div>
              )}
            </div>
          )}

          {/* ── Activity tab ──────────────────────────────────────────────── */}
          {activeTab === "activity" && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="space-y-2">
                {[
                  { label: "Total pertanyaan ditulis", value: user.posts_count },
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
                    <span className="font-bold text-zinc-900 dark:text-white font-mono">{value}</span>
                  </div>
                ))}
              </div>

              {/* Accept rate */}
              {user.posts_count > 0 && (
                <div className="pt-2">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    <span>Accept rate</span>
                    <span className="text-brand-blue font-mono">
                      {Math.round((answeredPosts.length / user.posts_count) * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-blue transition-all"
                      style={{
                        width: `${Math.round((answeredPosts.length / user.posts_count) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Badges */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                  Lencana ({user.badges_count})
                </p>
                <BadgesSection badges={user.badges} count={user.badges_count} />
              </div>
            </div>
          )}

          {/* ── Likes tab ─────────────────────────────────────────────────── */}
          {activeTab === "likes" && username && (
            <LikesSection
              username={username}
              onNavigatePost={(id) => router.push(`/questions/${id}`)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
