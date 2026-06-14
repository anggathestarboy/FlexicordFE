"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  Calendar,
  FileText,
  Users,
  UserCheck,
  Shield,
  TrendingUp,
  Heart,
  Bookmark,
  ChevronRight,
  Edit3,
  Key,
  Flag,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useApp } from "@/context/AppContext";

import { UserDetailResponse, TabKey } from "@/components/profile/types";
import { avatarSrc, formatDate, formatDateShort, primaryRole, roleBadgeStyle, tierColor } from "@/components/profile/helpers";
import PostStatusBadge from "@/components/profile/PostStatusBadge";
import BadgesSection from "@/components/profile/BadgesSection";
import LikesSection from "@/components/profile/LikesSection";
import BookmarkSection from "@/components/profile/BookmarkSection";
import PointsSection from "@/components/profile/PointsSection";
import ReportsSection from "@/components/profile/ReportsSection";
import WarningsSection from "@/components/profile/WarningsSection";
import CredentialsSection from "@/components/profile/CredentialsSection";

export default function MyProfilePage() {
  const router = useRouter();
  const { currentUser } = useApp();

  const [data, setData] = useState<UserDetailResponse | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("posts");

  useEffect(() => {
    if (currentUser === null && !initialLoading) {
      router.push("/login");
    }
  }, [currentUser, initialLoading, router]);

  // Fetches user self information and complete profile details
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!data) setInitialLoading(true);

        const meRes = await axios.get("/api/me");
        if (meRes.status !== 200) {
          router.push("/login");
          return;
        }
        const meData = meRes.data;
        const username = meData.user?.username;
        if (!username) throw new Error("Username tidak ditemukan.");

        const profileRes = await axios.get(`/api/profile/${encodeURIComponent(username)}`);
        if (profileRes.status !== 200) throw new Error("Gagal memuat profil detail.");
        const profileData: UserDetailResponse = profileRes.data;
        setData(profileData);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, currentUser?.avatar_url, currentUser?.username, currentUser?.bio, currentUser?.email]);

  if (initialLoading) {
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
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-brand-blue to-sky-500 relative flex items-end px-5 pb-3">
          <span className="text-white/80 text-xs font-semibold tracking-widest uppercase select-none">
            Profil Saya
          </span>
        </div>

        <div className="px-5 pb-5 relative">
          <div className="-mt-12 mb-4 flex items-end justify-between gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-row sm:flex-col gap-3 sm:gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <button
                onClick={() => router.push(`/profile/${user.username}/followers`)}
                className="flex items-center gap-1.5 hover:text-brand-blue transition-colors cursor-pointer group"
              >
                <Users className="h-3.5 w-3.5 shrink-0 text-zinc-400 group-hover:text-brand-blue transition-colors" />
                <span>
                  <strong className="text-zinc-800 dark:text-zinc-200 font-semibold group-hover:text-brand-blue transition-colors">
                    {user.followers_count}
                  </strong>{" "}
                  <span className="underline-offset-2 group-hover:underline">pengikut</span>
                </span>
              </button>
              <button
                onClick={() => router.push(`/profile/${user.username}/following`)}
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

      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Reputasi",
            value: user.reputation_points,
            sub: `Level ${user.level}`,
            onClick: () => setActiveTab("points"),
          },
          { label: "Total Post", value: user.posts_count, sub: "pertanyaan", onClick: undefined as (() => void) | undefined },
          { label: "Lencana", value: user.badges_count, sub: "badge", onClick: undefined },
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

      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
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

        <div className="p-4">
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

          {activeTab === "likes" && (
            <LikesSection
              username={user.username}
              onNavigatePost={(id) => router.push(`/posts/${id}`)}
            />
          )}

          {activeTab === "bookmarks" && (
            <BookmarkSection
              onNavigatePost={(id) => router.push(`/posts/${id}`)}
            />
          )}

          {activeTab === "credentials" && (
            <CredentialsSection user={user} onNavigatePoints={() => setActiveTab("points")} />
          )}

          {activeTab === "points" && (
            <PointsSection username={user.username} />
          )}

          {activeTab === "reports" && (
            <ReportsSection username={user.username} />
          )}

          {activeTab === "warnings" && (
            <WarningsSection />
          )}
        </div>
      </div>
    </div>
  );
}
