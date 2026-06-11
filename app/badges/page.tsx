"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { Badge } from "../api/badges/BadgesType";

// ── Tier config ───────────────────────────────────────────────────────────────
const TIER_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    dot: string;
    badge: string;
    glow: string;
    hex: string;
    order: number;
  }
> = {
  platinum: {
    label: "Platinum",
    color: "text-cyan-200 dark:text-cyan-100",
    dot: "bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.6)]",
    badge: "text-cyan-400 bg-cyan-500/10 border border-cyan-400/30 dark:text-cyan-200 dark:bg-cyan-500/20",
    glow: "hover:border-cyan-400/60 hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]",
    hex: "#22D3EE",
    order: 1,
  },
  gold: {
    label: "Gold",
    color: "text-teal-400 dark:text-teal-300",
    dot: "bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]",
    badge: "text-teal-500 bg-teal-500/10 border border-teal-500/30 dark:text-teal-300 dark:bg-teal-500/20",
    glow: "hover:border-teal-400/60 hover:shadow-[0_0_15px_rgba(45,212,191,0.15)]",
    hex: "#2DD4BF",
    order: 2,
  },
  silver: {
    label: "Silver",
    color: "text-emerald-400 dark:text-emerald-300",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
    badge: "text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 dark:text-emerald-300 dark:bg-emerald-500/20",
    glow: "hover:border-emerald-400/60 hover:shadow-[0_0_15px_rgba(52,211,153,0.15)]",
    hex: "#34D399",
    order: 3,
  },
  bronze: {
    label: "Bronze",
    color: "text-sky-400 dark:text-sky-300",
    dot: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]",
    badge: "text-sky-500 bg-sky-500/10 border border-sky-500/30 dark:text-sky-300 dark:bg-sky-500/20",
    glow: "hover:border-sky-400/60 hover:shadow-[0_0_15px_rgba(56,189,248,0.15)]",
    hex: "#38BDF8",
    order: 4,
  },
};

const CONDITION_LABEL: Record<string, string> = {
  answers_accepted: "Jawaban Diterima",
  posts_count: "Postingan",
  reputation_points: "Poin Reputasi",
};

// ── Dynamic Shape Icon Component ──────────────────────────────────────────────
function DynamicBadgeIcon({
  tier,
  hex,
  iconUrl,
  name,
}: {
  tier: string;
  hex: string;
  iconUrl: string | null;
  name: string;
}) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const fill = `rgba(${r},${g},${b},0.08)`;

  // Render SVG polygon berbeda berdasarkan tier-nya
  const renderShape = () => {
    switch (tier) {
      case "platinum":
        // Diamond / Rhombus Shape
        return <polygon points="36,2 68,36 36,70 4,36" fill={fill} stroke={hex} strokeWidth="2" strokeLinejoin="round" />;
      case "gold":
        // Shield Shape
        return <path d="M10,6 L62,6 L62,32 C62,54 36,68 36,68 C36,68 10,54 10,32 Z" fill={fill} stroke={hex} strokeWidth="2" strokeLinejoin="round" />;
      case "silver":
        // Hexagon Shape
        return <polygon points="36,4 66,20 66,52 36,68 6,52 6,20" fill={fill} stroke={hex} strokeWidth="2" strokeLinejoin="round" />;
      case "bronze":
      default:
        // Octagon Shape
        return <polygon points="22,4 50,4 68,22 68,50 50,68 22,68 4,50 4,22" fill={fill} stroke={hex} strokeWidth="2" strokeLinejoin="round" />;
    }
  };

  return (
    <div
      className="relative w-14 h-14 shrink-0 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-3"
      style={{ filter: `drop-shadow(0 0 10px rgba(${r},${g},${b},0.35))` }}
    >
      <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {renderShape()}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://pegaduanmasyarakat.alwaysdata.net/storage/${iconUrl}`}
            alt={name}
            className="w-7 h-7 object-contain brightness-110"
          />
        ) : (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={hex}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        )}
      </div>
    </div>
  );
}

// ── Badge Card ────────────────────────────────────────────────────────────────
function BadgeCard({ badge }: { badge: Badge }) {
  const tier = TIER_CONFIG[badge.tier] ?? TIER_CONFIG["bronze"];

  return (
    <div
      className={`group bg-gradient-to-b from-white to-zinc-50/50 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 transition-all duration-300 ${tier.glow}`}
    >
      <div className="flex gap-4 items-start">
        <DynamicBadgeIcon tier={badge.tier} hex={tier.hex} iconUrl={badge.icon_url} name={badge.name} />

        <div className="flex-1 min-w-0">
          {/* Name + Tier */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex-1 min-w-0 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
              {badge.name}
            </h3>
            <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md ${tier.badge}`}>
              {tier.label}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3.5">
            {badge.description}
          </p>

          {/* Condition */}
          <div className="flex items-center justify-between bg-zinc-100/50 dark:bg-zinc-900/60 rounded-lg px-3 py-2 border border-zinc-200/40 dark:border-zinc-800/50">
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
              {CONDITION_LABEL[badge.condition_type] ?? badge.condition_type}
            </span>
            <span className={`text-xs font-extrabold tabular-nums tracking-wider ${tier.color}`}>
              {badge.condition_value.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Filter Pill ───────────────────────────────────────────────────────────────
function FilterPill({
  label,
  dotClass,
  active,
  count,
  onClick,
}: {
  label: string;
  dotClass: string;
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
        active
          ? "bg-cyan-500/10 text-cyan-600 border-cyan-400/40 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/40 font-bold shadow-sm"
          : "text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/5 dark:hover:bg-cyan-500/5 hover:border-cyan-500/20"
      }`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
      {label}
      <span className={`rounded-full px-1.5 py-px text-[10px] tabular-nums transition-colors ${
        active 
          ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-300" 
          : "bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
      }`}>
        {count}
      </span>
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/badges")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setBadges(res.data);
        else setError("Gagal memuat data badges.");
      })
      .catch(() => setError("Terjadi kesalahan koneksi."))
      .finally(() => setLoading(false));
  }, []);

  const tiers = Object.entries(TIER_CONFIG).sort(([, a], [, b]) => a.order - b.order);

  const filtered =
    activeFilter === "all"
      ? [...badges].sort(
          (a, b) =>
            (TIER_CONFIG[a.tier]?.order ?? 99) - (TIER_CONFIG[b.tier]?.order ?? 99)
        )
      : badges.filter((b) => b.tier === activeFilter);

  const countByTier = (tier: string) => badges.filter((b) => b.tier === tier).length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent tracking-tight">
            Badges & Pencapaian
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Raih badges dengan berkontribusi — menjawab pertanyaan, membuat postingan, dan mengumpulkan reputasi.
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      {!loading && !error && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-100/40 dark:bg-zinc-900/30 p-2 rounded-xl border border-zinc-200/60 dark:border-zinc-800/50 backdrop-blur-sm">
          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-2 flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-cyan-500" />
            <span>{badges.length} badges tersedia</span>
          </div>

          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            <FilterPill
              label="Semua"
              dotClass="bg-gradient-to-r from-cyan-400 to-teal-400"
              active={activeFilter === "all"}
              count={badges.length}
              onClick={() => setActiveFilter("all")}
            />
            {tiers.map(([key, cfg]) => (
              <FilterPill
                key={key}
                label={cfg.label}
                dotClass={cfg.dot}
                active={activeFilter === key}
                count={countByTier(key)}
                onClick={() => setActiveFilter(key)}
              />
            ))}
          </div>
        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <div className="text-center py-20 text-zinc-500 text-sm animate-pulse">Memuat data...</div>
      ) : error ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-2xl mx-auto space-y-3">
          <p className="text-base font-bold text-zinc-900 dark:text-white">⚠ {error}</p>
          <p className="text-xs text-zinc-500">Coba muat ulang halaman ini.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-2xl mx-auto space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-cyan-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Tidak ada badge ditemukan
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              Tidak ada badge untuk tier ini.
            </p>
          </div>
          <button
            onClick={() => setActiveFilter("all")}
            className="text-xs bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm"
          >
            Lihat Semua Badge
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      )}
    </div>
  );
}   