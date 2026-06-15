"use client";

import { useEffect, useState, useRef } from "react";
import { Trophy, Pencil, Trash2, Plus, X, Upload, Loader2, Sparkles } from "lucide-react";
import { Badge } from "../../api/badges/BadgesType";
import { useApp } from "@/context/AppContext";
import axios from "axios";

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
  reputation_points: "Poin Reputasi",
  posts_count: "Jumlah Postingan",
  answers_accepted: "Jawaban Diterima",
  comments_count: "Jumlah Komentar",
  bookmarks_count: "Jumlah Bookmark",
  followers_count: "Jumlah Pengikut",
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
            src={iconUrl.startsWith("data:") ? iconUrl : `https://pegaduanmasyarakat.alwaysdata.net/storage/${iconUrl}`}
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
function BadgeCard({
  badge,
  isManageMode,
  onEdit,
  onDelete,
}: {
  badge: Badge;
  isManageMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const tier = TIER_CONFIG[badge.tier] ?? TIER_CONFIG["bronze"];

  return (
    <div
      className={`group relative bg-gradient-to-b from-white to-zinc-50/50 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 transition-all duration-300 ${tier.glow}`}
    >
      {/* Admin / Moderator actions overlay */}
      {isManageMode && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 dark:bg-zinc-900/90 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 backdrop-blur-xs shadow-xs">
          <button
            onClick={onEdit}
            title="Edit Badge"
            className="p-1.5 text-zinc-500 hover:text-cyan-500 dark:hover:text-cyan-400 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            title="Hapus Badge"
            className="p-1.5 text-zinc-500 hover:text-red-500 dark:hover:text-red-400 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex gap-4 items-start">
        <DynamicBadgeIcon tier={badge.tier} hex={tier.hex} iconUrl={badge.icon_url} name={badge.name} />

        <div className="flex-1 min-w-0 text-left">
          {/* Name + Tier */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5 pr-14">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex-1 min-w-0 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
              {badge.name}
            </h3>
            <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md ${tier.badge}`}>
              {tier.label}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3.5 line-clamp-2 h-8" title={badge.description}>
            {badge.description || "Tidak ada deskripsi."}
          </p>

          {/* Condition */}
          <div className="flex items-center justify-between bg-zinc-100/50 dark:bg-zinc-900/60 rounded-lg px-3 py-2 border border-zinc-200/40 dark:border-zinc-800/50">
            <span className="text-[11px] text-zinc-400 dark:text-zinc-550 font-medium">
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
  const { currentUser, showNotification } = useApp();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Admin / Moderator States
  const [isManageMode, setIsManageMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);

  // Form States
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTier, setFormTier] = useState("bronze");
  const [formConditionType, setFormConditionType] = useState("reputation_points");
  const [formConditionValue, setFormConditionValue] = useState<number>(0);
  const [formIconFile, setFormIconFile] = useState<File | null>(null);
  const [formIconPreview, setFormIconPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Delete Confirmation States
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingBadge, setDeletingBadge] = useState<Badge | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check role authorization
  const isAuthorized =
    currentUser?.primary_role?.name === "admin" ||
    currentUser?.primary_role?.name === "moderator";

  const fetchBadgesList = () => {
    setLoading(true);
    fetch("/api/badges")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setBadges(res.data);
        else setError("Gagal memuat data badges.");
      })
      .catch(() => setError("Terjadi kesalahan koneksi."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBadgesList();
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

  // Form handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setValidationError("Ukuran berkas melebihi batas 2MB.");
      return;
    }

    setValidationError(null);
    setFormIconFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormIconPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEditClick = (badge: Badge) => {
    setEditingBadge(badge);
    setFormName(badge.name);
    setFormDescription(badge.description || "");
    setFormTier(badge.tier);
    setFormConditionType(badge.condition_type);
    setFormConditionValue(badge.condition_value);
    setFormIconFile(null);
    if (badge.icon_url) {
      setFormIconPreview(
        badge.icon_url.startsWith("data:")
          ? badge.icon_url
          : `https://pegaduanmasyarakat.alwaysdata.net/storage/${badge.icon_url}`
      );
    } else {
      setFormIconPreview(null);
    }
    setValidationError(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (badge: Badge) => {
    setDeletingBadge(badge);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBadge) return;
    setDeleting(true);
    try {
      const res = await axios.delete(`/api/badges/${deletingBadge.id}`);
      if (res.data.success || res.status === 200) {
        showNotification(`Badge "${deletingBadge.name}" berhasil dihapus!`, "success");
        setBadges((prev) => prev.filter((b) => b.id !== deletingBadge.id));
      } else {
        showNotification(res.data.message || "Gagal menghapus badge.", "info");
      }
    } catch (err: any) {
      console.error(err);
      showNotification(
        err.response?.data?.message || "Terjadi kesalahan saat menghapus badge.",
        "info"
      );
    } finally {
      setDeleting(false);
      setIsConfirmOpen(false);
      setDeletingBadge(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setValidationError("Nama badge wajib diisi.");
      return;
    }
    if (formConditionValue < 0) {
      setValidationError("Nilai syarat pencapaian tidak boleh negatif.");
      return;
    }

    setSubmitting(true);
    setValidationError(null);

    try {
      const formData = new FormData();
      formData.append("name", formName.trim());
      formData.append("description", formDescription.trim());
      formData.append("tier", formTier);
      formData.append("condition_type", formConditionType);
      formData.append("condition_value", formConditionValue.toString());
      if (editingBadge) {
        formData.append("id", editingBadge.id);
      }
      if (formIconFile) {
        formData.append("icon_url", formIconFile);
      }

      let res;
      if (editingBadge) {
        // Edit mode (uses POST request proxy for PUT spoofing)
        res = await axios.post(`/api/badges/${editingBadge.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Create mode
        res = await axios.post("/api/badges", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (res.data.success || res.status === 200 || res.status === 201) {
        showNotification(
          editingBadge
            ? `Badge "${formName}" berhasil diperbarui!`
            : `Badge "${formName}" berhasil dibuat!`,
          "success"
        );
        setIsModalOpen(false);
        fetchBadgesList();
      } else {
        setValidationError(res.data.message || "Gagal menyimpan data badge.");
      }
    } catch (err: any) {
      console.error(err);
      let errorMsg = "Terjadi kesalahan server saat menyimpan badge.";
      if (err.response?.data) {
        if (err.response.data.errors) {
          const detailedErrors = Object.values(err.response.data.errors).flat();
          if (detailedErrors.length > 0) {
            errorMsg = detailedErrors.join(" • ");
          } else {
            errorMsg = err.response.data.message || errorMsg;
          }
        } else {
          errorMsg = err.response.data.message || errorMsg;
        }
      }
      setValidationError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="text-left">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent tracking-tight">
            Badges & Pencapaian
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Raih badges dengan berkontribusi — menjawab pertanyaan, membuat postingan, dan mengumpulkan reputasi.
          </p>
        </div>
        {isAuthorized && (
          <button
            onClick={() => setIsManageMode(!isManageMode)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer self-start sm:self-center active:scale-97 ${
              isManageMode
                ? "bg-amber-500/10 text-amber-600 border-amber-400/40 dark:bg-amber-500/20 dark:text-amber-400 shadow-sm"
                : "text-zinc-650 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <Trophy className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            <span>{isManageMode ? "Keluar Mode Kelola" : "Kelola Badge"}</span>
          </button>
        )}
      </div>

      {/* FILTER & CONTROL BAR */}
      {!loading && !error && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-100/40 dark:bg-zinc-900/30 p-2 rounded-xl border border-zinc-200/60 dark:border-zinc-800/50 backdrop-blur-sm">
          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-2 flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-cyan-500" />
            <span>{badges.length} badges tersedia</span>
          </div>

          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto items-center">
            {isManageMode && (
              <button
                onClick={() => {
                  setEditingBadge(null);
                  setFormName("");
                  setFormDescription("");
                  setFormTier("bronze");
                  setFormConditionType("reputation_points");
                  setFormConditionValue(0);
                  setFormIconFile(null);
                  setFormIconPreview(null);
                  setValidationError(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors cursor-pointer mr-1.5 shadow-sm active:scale-97"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Badge</span>
              </button>
            )}

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
          <p className="text-base font-bold text-zinc-900 dark:text-white">⚠️ {error}</p>
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
            <BadgeCard
              key={badge.id}
              badge={badge}
              isManageMode={isManageMode}
              onEdit={() => handleEditClick(badge)}
              onDelete={() => handleDeleteClick(badge)}
            />
          ))}
        </div>
      )}

      {/* MODAL CREATE / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md transition-opacity duration-300">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all duration-300">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/5 dark:bg-zinc-900/5 select-none">
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-500" />
                <span>{editingBadge ? "Edit Badge" : "Buat Badge Baru"}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-left max-h-[75vh] overflow-y-auto">
              {validationError && (
                <div className="p-3 text-xs bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg flex items-center gap-2">
                  <span className="font-extrabold">⚠️</span>
                  <span>{validationError}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Nama Badge <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Cth: Penjawab Teratas"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-zinc-250 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Deskripsi
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Cth: Diberikan untuk developer yang memiliki kontribusi besar..."
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-zinc-250 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Tier & Condition Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tier */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Tier Badge <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-zinc-250 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-semibold"
                  >
                    <option value="bronze">Bronze (Perunggu)</option>
                    <option value="silver">Silver (Perak)</option>
                    <option value="gold">Gold (Emas)</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>

                {/* Condition Type */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Tipe Syarat <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formConditionType}
                    onChange={(e) => setFormConditionType(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-zinc-250 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-semibold"
                  >
                    <option value="reputation_points">Poin Reputasi</option>
                    <option value="posts_count">Jumlah Postingan</option>
                    <option value="answers_accepted">Jawaban Diterima</option>
                    <option value="comments_count">Jumlah Komentar</option>
                    <option value="bookmarks_count">Jumlah Bookmark</option>
                    <option value="followers_count">Jumlah Pengikut</option>
                  </select>
                </div>
              </div>

              {/* Condition Value */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Nilai Syarat Pencapaian <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formConditionValue}
                  onChange={(e) => setFormConditionValue(parseInt(e.target.value) || 0)}
                  placeholder="Cth: 100"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-zinc-250 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-mono"
                  required
                />
              </div>

              {/* Icon upload */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Ikon Badge (Unggah Berkas)
                </label>
                <div className="flex gap-4 items-center">
                  {/* Current / Selected Image Preview */}
                  <div className="w-14 h-14 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-550/5 dark:bg-zinc-950/20 flex items-center justify-center shrink-0 overflow-hidden relative select-none">
                    {formIconPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formIconPreview}
                        alt="Preview"
                        className="w-full h-full object-contain brightness-110"
                      />
                    ) : (
                      <Trophy className="h-6 w-6 text-zinc-400" />
                    )}
                  </div>

                  {/* Upload button */}
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-cyan-500 dark:hover:border-cyan-500 rounded-lg hover:bg-cyan-500/5 transition-all text-zinc-600 dark:text-zinc-400 cursor-pointer w-full justify-center active:scale-97 select-none"
                    >
                      <Upload className="h-4 w-4 text-zinc-500" />
                      <span>{formIconFile ? "Ubah Berkas" : "Pilih Gambar Ikon"}</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                      Mendukung format PNG, JPG, SVG, WebP. Maks 2MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-650/50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer shadow-sm active:scale-97"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingBadge ? "Simpan Perubahan" : "Buat Badge"}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer active:scale-97"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {isConfirmOpen && deletingBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md transition-opacity duration-300">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center transform transition-all duration-300 select-none">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-500">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
              Hapus Badge ini?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus badge <strong className="text-zinc-900 dark:text-white">"{deletingBadge.name}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 disabled:bg-red-650/50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer active:scale-97"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Ya, Hapus</span>
                )}
              </button>
              <button
                onClick={() => {
                  setIsConfirmOpen(false);
                  setDeletingBadge(null);
                }}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-zinc-850 dark:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer active:scale-97"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}