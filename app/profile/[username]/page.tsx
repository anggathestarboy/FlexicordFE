"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Award,
  Calendar,
  FileText,
  Users,
  UserCheck,
  UserPlus,
  UserMinus,
  Shield,
  CheckCircle2,
  CircleDot,
  TrendingUp,
  Heart,
  MessageSquare,
  ChevronRight,
  Ban,
  ShieldAlert,
  Flag,
  AlertTriangle,
  Loader2,
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
  const router = useRouter();
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
              onClick={() => router.push(`/comment/${like.comment!.id}`)}
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const username = params?.username;

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("posts");

  // Auth & Ban states
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [showBanForm, setShowBanForm] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banNotes, setBanNotes] = useState("");
  const [isBanning, setIsBanning] = useState(false);
  const [banError, setBanError] = useState<string | null>(null);

  // Follow states
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);

  // Report states
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Warning states
  const [showWarningForm, setShowWarningForm] = useState(false);
  const [warningReason, setWarningReason] = useState("");
  const [warningNotes, setWarningNotes] = useState("");
  const [isWarning, setIsWarning] = useState(false);
  const [warningError, setWarningError] = useState<string | null>(null);
  const [warningSuccess, setWarningSuccess] = useState(false);

  // Fetch current user
  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((data) => {
        if (data.user?.primary_role?.name) {
          setCurrentUserRole(data.user.primary_role.name);
        }
        if (data.user?.username) {
          setCurrentUsername(data.user.username);
        }
      })
      .catch(() => {
        setCurrentUserRole(null);
        setCurrentUsername(null);
      });
  }, []);

  const fetchProfile = useCallback(async (showLoading = true) => {
    if (!username) return;
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/profile/${username}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Pengguna tidak ditemukan.");
      const d: ApiResponse = await res.json();
      setData(d);
      setIsFollowing(d.is_following);
      setFollowersCount(d.user.followers_count);
    } catch (e: any) {
      setError(e.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfile(true);
  }, [fetchProfile]);

  // Promote / Demote Action Handlers
  const [isAdminPromoting, setIsAdminPromoting] = useState(false);
  const [isModPromoting, setIsModPromoting] = useState(false);
  const [isDemoting, setIsDemoting] = useState(false);
  const [roleActionError, setRoleActionError] = useState<string | null>(null);
  const [roleActionSuccess, setRoleActionSuccess] = useState<string | null>(null);

  // Auto-dismiss role action notifications
  useEffect(() => {
    if (!roleActionError && !roleActionSuccess) return;
    const t = setTimeout(() => {
      setRoleActionError(null);
      setRoleActionSuccess(null);
    }, 4000);
    return () => clearTimeout(t);
  }, [roleActionError, roleActionSuccess]);

  const handlePromoteAdmin = async () => {
    setIsAdminPromoting(true);
    setRoleActionError(null);
    setRoleActionSuccess(null);
    try {
      const res = await fetch(`/api/admin/promote-admin/${username}`, {
        method: "POST",
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Gagal mempromosikan user menjadi admin.");
      setRoleActionSuccess(resData.message || "User berhasil dipromosikan menjadi admin.");
      await fetchProfile(false);
    } catch (err: any) {
      setRoleActionError(err.message);
    } finally {
      setIsAdminPromoting(false);
    }
  };

  const handlePromoteModerator = async () => {
    setIsModPromoting(true);
    setRoleActionError(null);
    setRoleActionSuccess(null);
    try {
      const res = await fetch(`/api/admin/promote-moderator/${username}`, {
        method: "POST",
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Gagal mempromosikan user menjadi moderator.");
      setRoleActionSuccess(resData.message || "User berhasil dipromosikan menjadi moderator.");
      await fetchProfile(false);
    } catch (err: any) {
      setRoleActionError(err.message);
    } finally {
      setIsModPromoting(false);
    }
  };

  const handleDemote = async () => {
    setIsDemoting(true);
    setRoleActionError(null);
    setRoleActionSuccess(null);
    try {
      const res = await fetch(`/api/admin/turunkan/${username}`, {
        method: "POST",
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Gagal menurunkan jabatan user.");
      setRoleActionSuccess(resData.message || "Jabatan user berhasil diturunkan.");
      await fetchProfile(false);
    } catch (err: any) {
      setRoleActionError(err.message);
    } finally {
      setIsDemoting(false);
    }
  };

  // Auto-dismiss follow error
  useEffect(() => {
    if (!followError) return;
    const t = setTimeout(() => setFollowError(null), 3500);
    return () => clearTimeout(t);
  }, [followError]);

  const handleFollow = async () => {
    if (!username || isFollowLoading) return;

    // Optimistic update
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setFollowersCount((c) => (wasFollowing ? c - 1 : c + 1));
    setIsFollowLoading(true);
    setFollowError(null);

    try {
      const res = await fetch("/api/follows", {
        method: wasFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) {
        // Roll back optimistic update
        setIsFollowing(wasFollowing);
        setFollowersCount((c) => (wasFollowing ? c + 1 : c - 1));
        const errData = await res.json().catch(() => ({}));
        setFollowError(errData.message || (wasFollowing ? "Gagal unfollow." : "Gagal follow."));
      }
    } catch {
      // Roll back on network error
      setIsFollowing(wasFollowing);
      setFollowersCount((c) => (wasFollowing ? c + 1 : c - 1));
      setFollowError("Terjadi kesalahan jaringan.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banReason.trim()) return;
    
    setIsBanning(true);
    setBanError(null);

    try {
      const res = await fetch(`/api/banned/${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: banReason,
          notes: banNotes.trim() ? banNotes : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal membanned pengguna.");
      }

      // Update UI manually
      if (data) {
        setData({
          ...data,
          user: { ...data.user, is_banned: 1 },
        });
      }
      setShowBanForm(false);
      setBanReason("");
      setBanNotes("");
    } catch (err: any) {
      setBanError(err.message);
    } finally {
      setIsBanning(false);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim() || !data?.user.id) return;
    
    setIsReporting(true);
    setReportError(null);
    setReportSuccess(false);

    try {
      const res = await fetch(`/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_id: data.user.id,
          reason: reportReason,
          description: reportDescription.trim() ? reportDescription : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal melaporkan pengguna.");
      }

      setReportSuccess(true);
      setTimeout(() => {
        setShowReportForm(false);
        setReportSuccess(false);
        setReportReason("");
        setReportDescription("");
      }, 2000);
    } catch (err: any) {
      setReportError(err.message);
    } finally {
      setIsReporting(false);
    }
  };

  const handleWarning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warningReason.trim()) return;
    
    setIsWarning(true);
    setWarningError(null);
    setWarningSuccess(false);

    try {
      const res = await fetch(`/api/warnings/${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: warningReason,
          notes: warningNotes.trim() ? warningNotes : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal memberikan warning.");
      }

      setWarningSuccess(true);
      setTimeout(() => {
        setShowWarningForm(false);
        setWarningSuccess(false);
        setWarningReason("");
        setWarningNotes("");
      }, 2000);
    } catch (err: any) {
      setWarningError(err.message);
    } finally {
      setIsWarning(false);
    }
  };

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

  const { user } = data;
  const role = primaryRole(user.roles);
  const src = avatarSrc(user.avatar_url);
  const answeredPosts = user.posts.filter((p) => p.is_answered);
  const openPosts = user.posts.filter((p) => p.status === "open" && !p.is_answered);
  // True if the logged-in user is viewing their own profile
  const isOwnProfile = !!currentUsername && currentUsername === username;

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "posts", label: "Pertanyaan", icon: <FileText className="h-3.5 w-3.5" />, count: user.posts_count },
    { key: "activity", label: "Aktivitas", icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { key: "likes", label: "Disukai", icon: <Heart className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="space-y-5">
      {/* ── Hero Card ─────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-brand-blue to-sky-500 rounded-t-2xl" />

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

            {/* Actions: Follow, Report & Ban */}
            <div className="pt-16 flex flex-col items-end gap-2 relative">
              {/* Follow / Unfollow button — hidden on own profile */}
              {!isOwnProfile && (
                <button
                  id="btn-follow-toggle"
                  onClick={handleFollow}
                  disabled={isFollowLoading}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                    isFollowing
                      ? "bg-zinc-100 hover:bg-red-50 dark:bg-zinc-900 dark:hover:bg-red-950/30 text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 border-zinc-200 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-800"
                      : "bg-brand-blue hover:bg-brand-blue/90 text-white border-transparent shadow-sm"
                  }`}
                >
                  {isFollowLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isFollowing ? (
                    <UserMinus className="h-3.5 w-3.5" />
                  ) : (
                    <UserPlus className="h-3.5 w-3.5" />
                  )}
                  {isFollowing ? "Mengikuti" : "Ikuti"}
                </button>
              )}

              {/* Follow error toast */}
              {followError && (
                <div className="absolute top-full right-0 mt-1 max-w-[200px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-3 py-1.5 text-[10px] text-red-600 dark:text-red-400 font-medium shadow-sm z-10">
                  {followError}
                </div>
              )}

              {/* Role Management (Only for Admin) */}
              {currentUserRole === "admin" && !isOwnProfile && (
                <div className="flex flex-wrap items-center gap-1.5 justify-end mt-1">
                  {/* Promote Admin: shown for regular users and moderators */}
                  {role !== "admin" && (
                    <button
                      onClick={handlePromoteAdmin}
                      disabled={isAdminPromoting || isModPromoting || isDemoting}
                      className="text-[10px] font-semibold px-3 py-1 rounded border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isAdminPromoting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Shield className="h-3 w-3" />
                      )}
                      Promote Admin
                    </button>
                  )}

                  {/* Promote Moderator: only shown for regular users */}
                  {role !== "admin" && role !== "moderator" && role !== "mod" && (
                    <button
                      onClick={handlePromoteModerator}
                      disabled={isAdminPromoting || isModPromoting || isDemoting}
                      className="text-[10px] font-semibold px-3 py-1 rounded border border-violet-200 dark:border-violet-900/50 text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isModPromoting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Shield className="h-3 w-3" />
                      )}
                      Promote Moderator
                    </button>
                  )}

                  {/* Turunkan Jabatan: shown for moderators and admins */}
                  {(role === "admin" || role === "moderator" || role === "mod") && (
                    <button
                      onClick={handleDemote}
                      disabled={isAdminPromoting || isModPromoting || isDemoting}
                      className="text-[10px] font-semibold px-3 py-1 rounded border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isDemoting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <ShieldAlert className="h-3 w-3" />
                      )}
                      Turunkan Jabatan
                    </button>
                  )}
                </div>
              )}

              {roleActionError && (
                <div className="text-[10px] font-bold text-red-500 mt-1 text-right">
                  {roleActionError}
                </div>
              )}
              {roleActionSuccess && (
                <div className="text-[10px] font-bold text-emerald-500 mt-1 text-right">
                  {roleActionSuccess}
                </div>
              )}

              <div className="flex items-center gap-2">
                {/* Tombol Laporkan (Selalu Muncul Jika Bukan Diri Sendiri, tapi untuk sekarang muncul selalu) */}
                <button
                  onClick={() => {
                    setShowReportForm(!showReportForm);
                    if (showBanForm) setShowBanForm(false);
                    if (showWarningForm) setShowWarningForm(false);
                  }}
                  className="text-[10px] font-semibold px-3 py-1 rounded border border-orange-200 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors flex items-center gap-1"
                >
                  <Flag className="h-3 w-3" />
                  Laporkan
                </button>

                {(currentUserRole === "admin" || currentUserRole === "mod" || currentUserRole === "moderator") && (
                  <>
                    <button
                      onClick={() => {
                        setShowWarningForm(!showWarningForm);
                        if (showReportForm) setShowReportForm(false);
                        if (showBanForm) setShowBanForm(false);
                      }}
                      className="text-[10px] font-semibold px-3 py-1 rounded border border-yellow-200 dark:border-yellow-900/50 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors flex items-center gap-1"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      Warning
                    </button>

                    <button
                      onClick={() => {
                        setShowBanForm(!showBanForm);
                        if (showReportForm) setShowReportForm(false);
                        if (showWarningForm) setShowWarningForm(false);
                      }}
                      className="text-[10px] font-semibold px-3 py-1 rounded border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-1"
                    >
                      <Ban className="h-3 w-3" />
                      {user.is_banned ? "Unban Pengguna" : "Ban Pengguna"}
                    </button>
                  </>
                )}
              </div>

              {/* Ban Form Popover */}
              {showBanForm && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-3 z-10 text-left">
                  <h4 className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5 mb-3">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Ban Pengguna
                  </h4>
                  <form onSubmit={handleBan} className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 block uppercase tracking-wider">
                        Alasan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        maxLength={255}
                        placeholder="Alasan ban..."
                        className="w-full text-xs px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-red-500 dark:text-white transition-shadow"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 block uppercase tracking-wider">
                        Catatan (opsional)
                      </label>
                      <textarea
                        value={banNotes}
                        onChange={(e) => setBanNotes(e.target.value)}
                        maxLength={500}
                        placeholder="Catatan internal..."
                        className="w-full text-xs px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[60px] resize-none dark:text-white transition-shadow"
                      />
                    </div>
                    {banError && (
                      <p className="text-[10px] text-red-500 font-medium">{banError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={isBanning || !banReason.trim()}
                      className="w-full text-[11px] font-bold px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1 flex justify-center"
                    >
                      {isBanning ? (
                        <span className="flex items-center gap-1.5">
                          <span className="animate-spin h-3 w-3 border-2 border-white/20 border-t-white rounded-full" />
                          Memproses...
                        </span>
                      ) : (
                        "Konfirmasi Ban"
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Report Form Popover */}
              {showReportForm && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-3 z-20 text-left">
                  <h4 className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5 mb-3">
                    <Flag className="h-3.5 w-3.5" />
                    Laporkan Pengguna
                  </h4>
                  {reportSuccess ? (
                    <div className="text-center py-4 space-y-2">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Laporan Terkirim</p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Terima kasih atas laporan Anda.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleReport} className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 block uppercase tracking-wider">
                          Alasan <span className="text-orange-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={reportReason}
                          onChange={(e) => setReportReason(e.target.value)}
                          maxLength={255}
                          placeholder="Alasan laporan..."
                          className="w-full text-xs px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:text-white transition-shadow"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 block uppercase tracking-wider">
                          Deskripsi (opsional)
                        </label>
                        <textarea
                          value={reportDescription}
                          onChange={(e) => setReportDescription(e.target.value)}
                          maxLength={500}
                          placeholder="Deskripsi detail..."
                          className="w-full text-xs px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-orange-500 min-h-[60px] resize-none dark:text-white transition-shadow"
                        />
                      </div>
                      {reportError && (
                        <p className="text-[10px] text-red-500 font-medium">{reportError}</p>
                      )}
                      <button
                        type="submit"
                        disabled={isReporting || !reportReason.trim()}
                        className="w-full text-[11px] font-bold px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1 flex justify-center"
                      >
                        {isReporting ? (
                          <span className="flex items-center gap-1.5">
                            <span className="animate-spin h-3 w-3 border-2 border-white/20 border-t-white rounded-full" />
                            Mengirim...
                          </span>
                        ) : (
                          "Kirim Laporan"
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
              {/* Warning Form Popover */}
              {showWarningForm && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-3 z-20 text-left">
                  <h4 className="text-xs font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5 mb-3">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Beri Warning
                  </h4>
                  {warningSuccess ? (
                    <div className="text-center py-4 space-y-2">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Warning Terkirim</p>
                    </div>
                  ) : (
                    <form onSubmit={handleWarning} className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 block uppercase tracking-wider">
                          Alasan <span className="text-yellow-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={warningReason}
                          onChange={(e) => setWarningReason(e.target.value)}
                          maxLength={255}
                          placeholder="Alasan warning..."
                          className="w-full text-xs px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-yellow-500 dark:text-white transition-shadow"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 block uppercase tracking-wider">
                          Catatan (opsional)
                        </label>
                        <textarea
                          value={warningNotes}
                          onChange={(e) => setWarningNotes(e.target.value)}
                          maxLength={500}
                          placeholder="Catatan internal..."
                          className="w-full text-xs px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-yellow-500 min-h-[60px] resize-none dark:text-white transition-shadow"
                        />
                      </div>
                      {warningError && (
                        <p className="text-[10px] text-red-500 font-medium">{warningError}</p>
                      )}
                      <button
                        type="submit"
                        disabled={isWarning || !warningReason.trim()}
                        className="w-full text-[11px] font-bold px-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1 flex justify-center"
                      >
                        {isWarning ? (
                          <span className="flex items-center gap-1.5">
                            <span className="animate-spin h-3 w-3 border-2 border-zinc-900/20 border-t-zinc-900 rounded-full" />
                            Mengirim...
                          </span>
                        ) : (
                          "Kirim Warning"
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
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
              <button
                onClick={() => router.push(`/profile/${username}/followers`)}
                className="flex items-center gap-1.5 hover:text-brand-blue transition-colors cursor-pointer group"
              >
                <Users className="h-3.5 w-3.5 shrink-0 text-zinc-400 group-hover:text-brand-blue transition-colors" />
                <span>
                  <strong className="text-zinc-800 dark:text-zinc-200 font-semibold group-hover:text-brand-blue transition-colors">
                    {followersCount}
                  </strong>{" "}
                  <span className="underline-offset-2 group-hover:underline">pengikut</span>
                </span>
              </button>
              <button
                onClick={() => router.push(`/profile/${username}/following`)}
                className="flex items-center gap-1.5 hover:text-brand-blue transition-colors cursor-pointer group"
              >
                <UserCheck className="h-3.5 w-3.5 shrink-0 text-zinc-400 group-hover:text-brand-blue transition-colors" />
                <span>
                  <strong className="text-zinc-800 dark:text-zinc-200 font-semibold group-hover:text-brand-blue transition-colors">
                    {user.following_count}
                  </strong>{" "}
                  <span className="underline-offset-2 group-hover:underline">mengikuti</span>
                </span>
              </button>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Reputasi", value: user.reputation_points, sub: `Level ${user.level}`, onClick: undefined as (() => void) | undefined },
          { label: "Total Post", value: user.posts_count, sub: "pertanyaan", onClick: undefined },
          { label: "Pengikut", value: followersCount, sub: "followers", onClick: () => router.push(`/profile/${username}/followers`) },
          { label: "Mengikuti", value: user.following_count, sub: "following", onClick: () => router.push(`/profile/${username}/following`) },
        ].map(({ label, value, sub, onClick }) => (
          <div
            key={label}
            onClick={onClick}
            className={`p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center ${
              onClick ? "cursor-pointer hover:border-brand-blue transition-all" : ""
            }`}
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
              onNavigatePost={(id) => router.push(`/posts/${id}`)}
            />
          )}
        </div>
      </div>
    </div>
  );
}