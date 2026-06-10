"use client";

import { useEffect, useState } from "react";
import { Heart, MessageSquare, FileText, Clock, Filter, Inbox } from "lucide-react";
import { Like, LikesResponse, LikeTargetType } from "@/app/api/likes-user/[username]/LikesUserType";


// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK: LikesResponse = {
  likes: [
    {
      id: "0e5bce79-4205-4ad7-8ba1-6b44e3e38273",
      user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
      target_id: "0ef45316-42a1-4f6a-a080-76637765e7d4",
      target_type: "comment",
      created_at: "2026-06-05 02:09:33",
    },
    {
      id: "11124e06-42f4-48ae-979e-2452892ffed4",
      user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
      target_id: "1c28c7c5-c0d9-45c4-b966-60af97b03eea",
      target_type: "post",
      created_at: "2026-06-07 09:18:29",
    },
    {
      id: "eff3403c-d5f6-430f-a339-36cca69ebc8a",
      user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
      target_id: "20c2029f-27ca-4610-b46f-3405f6ef2dc0",
      target_type: "post",
      created_at: "2026-06-05 02:24:31",
    },
    {
      id: "fb9e8286-fa17-4e31-8a1f-36469613153c",
      user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
      target_id: "4b122d63-e6e8-4f14-9bb0-861848dca24d",
      target_type: "comment",
      created_at: "2026-06-07 09:39:35",
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(raw: string): string {
  return new Date(raw).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

type TargetConfig = {
  label: string;
  Icon: React.ElementType;
  bg: string;
  iconColor: string;
  border: string;
  badgeBg: string;
  badgeText: string;
};

function getTargetConfig(type: LikeTargetType): TargetConfig {
  if (type === "post") {
    return {
      label: "Postingan",
      Icon: FileText,
      bg: "#EEF2FF",
      iconColor: "#6366F1",
      border: "#C7D2FE",
      badgeBg: "#EEF2FF",
      badgeText: "#4338CA",
    };
  }
  if (type === "comment") {
    return {
      label: "Komentar",
      Icon: MessageSquare,
      bg: "#F0FDF4",
      iconColor: "#22C55E",
      border: "#BBF7D0",
      badgeBg: "#F0FDF4",
      badgeText: "#166534",
    };
  }
  return {
    label: type,
    Icon: FileText,
    bg: "#F8FAFC",
    iconColor: "#94A3B8",
    border: "#E2E8F0",
    badgeBg: "#F1F5F9",
    badgeText: "#475569",
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{
      borderRadius: 12,
      border: "1px solid #E2E8F0",
      padding: "16px 18px",
      display: "flex",
      gap: 14,
      alignItems: "center",
      background: "#fff",
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: "#F1F5F9" }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 12, width: "40%", borderRadius: 6, background: "#F1F5F9", marginBottom: 8 }} />
        <div style={{ height: 10, width: "65%", borderRadius: 6, background: "#F1F5F9" }} />
      </div>
      <style>{`
        @keyframes shimmer {
          0% { opacity: 1 }
          50% { opacity: 0.4 }
          100% { opacity: 1 }
        }
      `}</style>
    </div>
  );
}

function LikeCard({ like, index }: { like: Like; index: number }) {
  const cfg = getTargetConfig(like.target_type);
  const { Icon } = cfg;

  return (
    <div
      style={{
        borderRadius: 12,
        border: `1px solid ${cfg.border}`,
        background: "#fff",
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        transition: "transform .15s, box-shadow .15s",
        cursor: "default",
        animation: `fadeUp .3s ease both`,
        animationDelay: `${index * 50}ms`,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,.07)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Target type icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: cfg.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={20} color={cfg.iconColor} strokeWidth={2} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          {/* Type badge */}
          <span style={{
            fontSize: 11, fontWeight: 700,
            padding: "2px 9px", borderRadius: 20,
            background: cfg.badgeBg, color: cfg.badgeText,
            letterSpacing: "0.03em",
            textTransform: "capitalize",
          }}>
            {cfg.label}
          </span>

          {/* Target ID */}
          <span style={{
            fontSize: 11, fontFamily: "monospace",
            color: "#94A3B8",
            background: "#F8FAFC",
            padding: "2px 8px", borderRadius: 6,
            border: "1px solid #E2E8F0",
          }}>
            #{shortId(like.target_id)}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#94A3B8", fontSize: 12 }}>
          <Clock size={12} strokeWidth={2} />
          <span>{formatDate(like.created_at)}</span>
        </div>
      </div>

      {/* Heart icon */}
      <Heart
        size={18}
        strokeWidth={0}
        fill="#F43F5E"
        style={{ flexShrink: 0, opacity: 0.85 }}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      textAlign: "center",
      padding: "52px 16px",
      border: "1.5px dashed #E2E8F0",
      borderRadius: 14,
      color: "#94A3B8",
    }}>
      <Inbox size={36} strokeWidth={1.5} style={{ margin: "0 auto 12px", display: "block", opacity: 0.5 }} />
      <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Belum ada aktivitas like.</p>
      <p style={{ margin: "4px 0 0", fontSize: 12 }}>Like pada postingan atau komentar akan muncul di sini.</p>
    </div>
  );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type FilterType = "all" | "post" | "comment";

const FILTERS: { key: FilterType; label: string; Icon: React.ElementType }[] = [
  { key: "all",     label: "Semua",     Icon: Heart },
  { key: "post",    label: "Postingan", Icon: FileText },
  { key: "comment", label: "Komentar",  Icon: MessageSquare },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LikesPage({ username }: { username?: string }) {
  const [data, setData]       = useState<LikesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [filter, setFilter]   = useState<FilterType>("all");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        // Ganti dengan fetch nyata:
        // const res = await fetch(`/api/profile/${username}/likes`);
        // const json: LikesResponse = await res.json();
        await new Promise(r => setTimeout(r, 500));
        setData(MOCK);
      } catch {
        setError("Gagal memuat data likes.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [username]);

  const likes = data?.likes ?? [];
  const filtered = filter === "all" ? likes : likes.filter(l => l.target_type === filter);

  const counts = {
    all:     likes.length,
    post:    likes.filter(l => l.target_type === "post").length,
    comment: likes.filter(l => l.target_type === "comment").length,
  };

  return (
    <div style={{
      maxWidth: 640,
      margin: "0 auto",
      padding: "32px 16px 64px",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: "#1E293B",
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "linear-gradient(135deg, #F43F5E, #FB7185)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Heart size={20} fill="#fff" strokeWidth={0} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Aktivitas Like
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#94A3B8" }}>
            {username ? `@${username} · ` : ""}{likes.length} total like
          </p>
        </div>
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 20,
        background: "#F8FAFC", borderRadius: 10,
        padding: 4, border: "1px solid #E2E8F0",
      }}>
        <Filter size={14} color="#CBD5E1" style={{ alignSelf: "center", marginLeft: 6, flexShrink: 0 }} />
        {FILTERS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              flex: 1,
              padding: "7px 10px",
              borderRadius: 7,
              border: "none",
              background: filter === key ? "#fff" : "transparent",
              boxShadow: filter === key ? "0 1px 4px rgba(0,0,0,.08)" : "none",
              color: filter === key ? "#1E293B" : "#94A3B8",
              fontWeight: filter === key ? 600 : 400,
              fontSize: 13,
              cursor: "pointer",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 5,
              transition: "all .15s",
            }}
          >
            <Icon size={13} strokeWidth={2} />
            {label}
            <span style={{
              fontSize: 11, fontWeight: 700,
              background: filter === key ? "#F1F5F9" : "transparent",
              color: filter === key ? "#475569" : "#CBD5E1",
              padding: "1px 6px", borderRadius: 10,
              minWidth: 18, textAlign: "center",
            }}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div style={{
          textAlign: "center", padding: "40px 16px",
          color: "#EF4444", fontSize: 14,
          border: "1px solid #FEE2E2", borderRadius: 12,
          background: "#FFF5F5",
        }}>
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((like, i) => (
            <LikeCard key={like.id} like={like} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}