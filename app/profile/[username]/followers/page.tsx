"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  ChevronLeft,
  ChevronRight,
  Award,
  Search,
  UserX,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FollowerUser {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  reputation_points: number;
  level: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_BASE = "https://pegaduanmasyarakat.alwaysdata.net/storage/";

function avatarSrc(url: string | null): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : `${STORAGE_BASE}${url}`;
}

function levelColor(level: number): string {
  if (level >= 20) return "#8b5cf6"; // platinum-ish
  if (level >= 10) return "#f59e0b"; // gold
  if (level >= 5) return "#94a3b8";  // silver
  return "#6366f1";                  // default brand
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 animate-pulse">
      <div className="h-14 w-14 rounded-2xl bg-zinc-200 dark:bg-zinc-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
        <div className="h-2.5 w-48 bg-zinc-100 dark:bg-zinc-900 rounded-full" />
      </div>
      <div className="h-6 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-full shrink-0" />
    </div>
  );
}

// ─── Follower Card ────────────────────────────────────────────────────────────

function FollowerCard({
  follower,
  onClick,
}: {
  follower: FollowerUser;
  onClick: () => void;
}) {
  const src = avatarSrc(follower.avatar_url);
  const lvColor = levelColor(follower.level);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-brand-blue hover:shadow-sm dark:hover:border-brand-blue transition-all duration-150 group text-left"
    >
      {/* Avatar */}
      <div className="shrink-0 relative">
        {src ? (
          <img
            src={src}
            alt={follower.username}
            className="h-14 w-14 rounded-2xl object-cover bg-zinc-100"
          />
        ) : (
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl text-white uppercase select-none"
            style={{ background: `linear-gradient(135deg, ${lvColor}cc, ${lvColor})` }}
          >
            {follower.username.charAt(0)}
          </div>
        )}
        {/* Level dot */}
        <span
          className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white dark:border-zinc-950 flex items-center justify-center text-[8px] font-black text-white shadow-sm"
          style={{ background: lvColor }}
        >
          {follower.level}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-brand-blue transition-colors truncate">
          {follower.username}
        </p>
        {follower.bio ? (
          <p className="text-xs text-zinc-400 truncate mt-0.5">{follower.bio}</p>
        ) : (
          <p className="text-xs text-zinc-300 dark:text-zinc-600 italic truncate mt-0.5">
            Belum ada bio
          </p>
        )}
        <div className="flex items-center gap-1.5 mt-1.5">
          <Award className="h-3 w-3" style={{ color: lvColor }} />
          <span className="text-[10px] font-mono font-bold" style={{ color: lvColor }}>
            {follower.reputation_points.toLocaleString()} pts
          </span>
        </div>
      </div>

      {/* Chevron */}
      <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-brand-blue shrink-0 transition-colors" />
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FollowersPage() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const username = params?.username ?? "";

  const [followers, setFollowers] = useState<FollowerUser[]>([]);
  const [filtered, setFiltered] = useState<FollowerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const fetchFollowers = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/followers/${encodeURIComponent(username)}`);
      if (res.status === 404) {
        setFollowers([]);
        setFiltered([]);
        return;
      }
      if (!res.ok) throw new Error("Gagal memuat daftar pengikut.");
      const data = await res.json();
      const parsed: FollowerUser[] =
        typeof data.followers === "string"
          ? JSON.parse(data.followers)
          : Array.isArray(data.followers)
          ? data.followers
          : [];
      setFollowers(parsed);
      setFiltered(parsed);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]);

  // Filter by search query
  useEffect(() => {
    if (!query.trim()) {
      setFiltered(followers);
      return;
    }
    const q = query.toLowerCase();
    setFiltered(
      followers.filter(
        (f) =>
          f.username.toLowerCase().includes(q) ||
          (f.bio ?? "").toLowerCase().includes(q)
      )
    );
  }, [query, followers]);

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-20 bg-gradient-to-r from-brand-blue to-sky-500 relative flex items-end px-5 pb-3">
          <span className="text-white/80 text-xs font-semibold tracking-widest uppercase select-none">
            Pengikut
          </span>
        </div>

        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Back button */}
            <button
              id="btn-back-followers"
              onClick={() => router.back()}
              className="h-9 w-9 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-blue" />
                <h1 className="text-base font-bold text-zinc-900 dark:text-white">
                  Daftar Pengikut
                </h1>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                @{username}
              </p>
            </div>
          </div>

          {/* Count badge */}
          {!loading && !error && (
            <span className="shrink-0 text-xs font-mono font-bold text-brand-blue bg-brand-blue/10 px-3 py-1.5 rounded-full">
              {followers.length} pengikut
            </span>
          )}
        </div>
      </div>

      {/* ── Search Bar ──────────────────────────────────────────────────────── */}
      {!loading && !error && followers.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            id="input-search-followers"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari pengikut berdasarkan username atau bio…"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-bold transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        {/* Loading */}
        {loading && (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/20">
              <Users className="h-10 w-10 text-red-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-red-500 mb-1">{error}</p>
              <button
                onClick={fetchFollowers}
                className="text-xs text-brand-blue hover:underline font-medium"
              >
                Coba lagi
              </button>
            </div>
          </div>
        )}

        {/* Empty — no followers at all */}
        {!loading && !error && followers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900">
              <Users className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                Belum ada pengikut
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                @{username} belum memiliki pengikut.
              </p>
            </div>
          </div>
        )}

        {/* Empty — search returned no results */}
        {!loading && !error && followers.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900">
              <UserX className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                Tidak ada hasil untuk &ldquo;{query}&rdquo;
              </p>
              <button
                onClick={() => setQuery("")}
                className="text-xs text-brand-blue hover:underline mt-1"
              >
                Hapus pencarian
              </button>
            </div>
          </div>
        )}

        {/* Follower list */}
        {!loading && !error && filtered.length > 0 &&
          filtered.map((f) => (
            <FollowerCard
              key={f.id}
              follower={f}
              onClick={() => router.push(`/profile/${f.username}`)}
            />
          ))}
      </div>

      {/* ── Footer count ────────────────────────────────────────────────────── */}
      {!loading && !error && filtered.length > 0 && (
        <p className="text-center text-[11px] text-zinc-400 font-mono pb-2">
          Menampilkan {filtered.length} dari {followers.length} pengikut
        </p>
      )}
    </div>
  );
}
