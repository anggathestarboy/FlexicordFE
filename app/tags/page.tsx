"use client";

import { useEffect, useState } from "react";
import { Hash, TrendingUp, Search, Plus, Calendar, Pencil, Trash2, X, Loader2, Sparkles, Tags } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Tag } from "../api/tags/TagType";
import axios from "axios";

// Standard preset colors for tags
const COLOR_PRESETS = [
  { name: "Blue", value: "#3b82f6", bg: "bg-blue-500" },
  { name: "Red", value: "#ef4444", bg: "bg-red-500" },
  { name: "Emerald", value: "#10b981", bg: "bg-emerald-500" },
  { name: "Amber", value: "#f59e0b", bg: "bg-amber-500" },
  { name: "Violet", value: "#8b5cf6", bg: "bg-violet-500" },
  { name: "Teal", value: "#14b8a6", bg: "bg-teal-500" },
  { name: "Indigo", value: "#6366f1", bg: "bg-indigo-500" },
  { name: "Slate", value: "#64748b", bg: "bg-slate-500" },
];

// ── Tag Card Component ──────────────────────────────────────────────────────
function TagCard({
  tag,
  maxUsage,
  isManageMode,
  onEdit,
  onDelete,
}: {
  tag: Tag;
  maxUsage: number;
  isManageMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const percentage = maxUsage > 0 ? (tag.usage_count / maxUsage) * 100 : 0;

  const getTagColorStyle = (colorVal: string) => {
    const isHex = colorVal && colorVal.startsWith("#");
    return {
      style: isHex ? { backgroundColor: `${colorVal}15`, color: colorVal, borderColor: `${colorVal}30` } : {},
      className: isHex
        ? ""
        : "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-300 border-cyan-500/20",
    };
  };

  const colorStyle = getTagColorStyle(tag.color);

  return (
    <div className="group relative bg-gradient-to-b from-white to-zinc-550/5 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(34,211,238,0.08)] flex flex-col justify-between h-40">
      
      {/* Admin/Moderator actions overlay */}
      {isManageMode && (
        <div className="absolute top-3 right-3 flex items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 dark:bg-zinc-900/90 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 backdrop-blur-xs shadow-sm">
          <button
            onClick={onEdit}
            title="Edit Tag"
            className="p-1.5 text-zinc-500 hover:text-cyan-500 dark:hover:text-cyan-400 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            title="Hapus Tag"
            className="p-1.5 text-zinc-500 hover:text-red-500 dark:hover:text-red-400 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div>
        {/* Header: Name & Slug */}
        <div className="flex items-start justify-between gap-2 text-left">
          <div className="flex items-center gap-2 min-w-0">
            <div 
              className={tag.color && tag.color.startsWith("#") ? "w-8 h-8 rounded-lg flex items-center justify-center shrink-0" : "w-8 h-8 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-500 dark:text-cyan-400 shrink-0"}
              style={tag.color && tag.color.startsWith("#") ? { backgroundColor: `${tag.color}15`, color: tag.color } : {}}
            >
              <Hash className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                {tag.name}
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono tracking-wide">
                #{tag.slug}
              </p>
            </div>
          </div>

          {/* Badge count */}
          <span 
            style={colorStyle.style}
            className={`text-[10px] font-extrabold tabular-nums px-2 py-0.5 rounded-md border shrink-0 ${colorStyle.className}`}
          >
            {tag.usage_count} posts
          </span>
        </div>

        {/* Date Created Info */}
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 text-left">
          <Calendar className="w-3 h-3 text-zinc-400" />
          <span>Dibuat: {tag.created_at ? tag.created_at.split(" ")[0] : "-"}</span>
        </div>
      </div>

      {/* Progress Bar Popularity */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          <span>Popularitas</span>
          <span className="tabular-nums">{Math.round(percentage)}%</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800/60 rounded-full overflow-hidden border border-zinc-200/20 dark:border-zinc-700/30">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
            style={{ 
              width: `${Math.max(percentage, tag.usage_count > 0 ? 5 : 0)}%`,
              backgroundColor: tag.color && tag.color.startsWith("#") ? tag.color : undefined,
              backgroundImage: tag.color && tag.color.startsWith("#") ? "none" : undefined
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────
export default function TagsPage() {
  const { currentUser, showNotification } = useApp();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isManageMode, setIsManageMode] = useState(false);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formName, setFormName] = useState("");
  const [formColor, setFormColor] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Access Control check
  const isAuthorized =
    currentUser?.primary_role?.name === "admin" ||
    currentUser?.primary_role?.name === "moderator";

  // Fetch Tags
  const fetchTags = () => {
    setLoading(true);
    setError(null);
    axios
      .get("/api/tags")
      .then((res) => {
        if (res.data?.data) {
          setTags(res.data.data);
        } else if (Array.isArray(res.data)) {
          setTags(res.data);
        } else {
          setError("Struktur tag tidak dikenali.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Gagal mengambil data tag dari server.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // Filter tags by search query
  const filteredTags = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const maxUsage = Math.max(...tags.map((t) => t.usage_count), 0);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingTag(null);
    setFormName("");
    setFormColor("#3b82f6"); // Default standard blue
    setValidationError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (tag: Tag) => {
    setEditingTag(tag);
    setFormName(tag.name);
    setFormColor(tag.color || "#3b82f6");
    setValidationError(null);
    setIsModalOpen(true);
  };

  // Open Delete Confirmation Modal
  const openDeleteModal = (tag: Tag) => {
    setDeletingTag(tag);
    setIsConfirmOpen(true);
  };

  // Submit Modal Form (Create / Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setValidationError("Nama tag wajib diisi.");
      return;
    }

    setSubmitting(true);
    setValidationError(null);

    const payload = {
      name: formName.trim(),
      color: formColor.trim() || null,
    };

    try {
      let res;
      if (editingTag) {
        res = await axios.put(`/api/tags/${editingTag.slug}`, payload, {
          headers: { "Content-Type": "application/json" },
        });
        showNotification("Tag berhasil diperbarui!", "success");
      } else {
        res = await axios.post("/api/tags", payload, {
          headers: { "Content-Type": "application/json" },
        });
        showNotification("Tag baru berhasil ditambahkan!", "success");
      }

      setIsModalOpen(false);
      fetchTags();
    } catch (err: any) {
      console.error(err);
      setValidationError(
        err.response?.data?.message || "Terjadi kesalahan saat menyimpan tag."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete Action
  const handleDeleteConfirm = async () => {
    if (!deletingTag) return;
    setDeleting(true);

    try {
      await axios.delete(`/api/tags/${deletingTag.slug}`);
      showNotification("Tag berhasil dihapus!", "success");
      setIsConfirmOpen(false);
      setDeletingTag(null);
      fetchTags();
    } catch (err: any) {
      console.error(err);
      showNotification(
        err.response?.data?.message || "Gagal menghapus tag.",
        "info"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="text-left">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent tracking-tight">
            Grup Tagging / Label
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gunakan tag untuk mempermudah pencarian tren, kurasi konten, dan pengelompokan mikro.
          </p>
        </div>

        {/* Action Controls & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 select-none">
          {/* Authorization Toggle Button */}
          {isAuthorized && (
            <button
              onClick={() => setIsManageMode(!isManageMode)}
              className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer active:scale-97 shrink-0 ${
                isManageMode
                  ? "bg-amber-500/10 text-amber-600 border-amber-400/40 dark:bg-amber-500/20 dark:text-amber-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              }`}
            >
              <Tags className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              <span>{isManageMode ? "Keluar Mode Kelola" : "Kelola Tag"}</span>
            </button>
          )}

          {/* Search bar */}
          <div className="relative min-w-[200px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-3.5 w-3.5 text-zinc-400" />
            </span>
            <input
              type="text"
              placeholder="Cari tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
          </div>

          {/* Add New Tag (Manage Mode only) */}
          {isManageMode && (
            <button
              onClick={openCreateModal}
              className="flex items-center justify-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all active:scale-97 cursor-pointer whitespace-nowrap shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tag Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* METRIC INFO BAR */}
      <div className="flex items-center justify-between bg-zinc-100/40 dark:bg-zinc-900/30 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/50 backdrop-blur-sm select-none">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-550 dark:text-zinc-450">
          <TrendingUp className="h-4 w-4 text-cyan-500" />
          <span>Terdaftar: </span>
          <span className="text-zinc-900 dark:text-white font-bold">{tags.length} Label Aktif</span>
        </div>

        <button
          onClick={fetchTags}
          className="text-[10px] font-bold text-zinc-400 hover:text-cyan-550 transition-colors flex items-center gap-1 cursor-pointer"
        >
          Segarkan Data
        </button>
      </div>

      {/* GRID CONTENT */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-zinc-900/50 border border-zinc-150 dark:border-zinc-850 rounded-xl p-5 h-40 animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                </div>
              </div>
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2 mt-4" />
              <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded w-full mt-4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-2xl mx-auto space-y-3">
          <p className="text-base font-bold text-zinc-900 dark:text-white">⚠️ Gagal Memuat Tag</p>
          <p className="text-xs text-zinc-500">{error}</p>
          <button
            onClick={fetchTags}
            className="px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg cursor-pointer transition-colors active:scale-97"
          >
            Coba Lagi
          </button>
        </div>
      ) : filteredTags.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-md mx-auto space-y-2 select-none">
          <p className="text-sm font-bold text-zinc-900 dark:text-white">Tag tidak ditemukan</p>
          <p className="text-xs text-zinc-500">Kata kunci "{searchQuery}" belum terdaftar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTags.map((tag) => (
            <TagCard
              key={tag.id}
              tag={tag}
              maxUsage={maxUsage}
              isManageMode={isManageMode}
              onEdit={() => openEditModal(tag)}
              onDelete={() => openDeleteModal(tag)}
            />
          ))}
        </div>
      )}

      {/* CREATE & EDIT DIALOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md transition-opacity duration-300">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all duration-300 select-none">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/5 dark:bg-zinc-900/5">
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-500" />
                <span>{editingTag ? "Edit Tagging" : "Buat Tag Baru"}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-left">
              {validationError && (
                <div className="p-3 text-xs bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg flex items-center gap-2">
                  <span className="font-extrabold">⚠️</span>
                  <span>{validationError}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Nama Tag / Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Cth: ReactJS, Tren, Humor"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-zinc-250 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  maxLength={255}
                  required
                />
              </div>

              {/* Color Preset Palette Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Pilih Warna Label
                </label>
                
                {/* Custom input with preset preview */}
                <div className="flex gap-2 items-center mb-3">
                  <div 
                    className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-all shrink-0" 
                    style={{ backgroundColor: formColor }}
                  />
                  <input
                    type="text"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    placeholder="Hex Code: Cth #ef4444"
                    className="flex-1 text-xs px-3 py-2 rounded-lg border border-zinc-250 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-mono"
                  />
                  {/* Hex Picker Box native */}
                  <input 
                    type="color" 
                    value={formColor.startsWith("#") && formColor.length === 7 ? formColor : "#3b82f6"}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer shrink-0"
                  />
                </div>

                <div className="grid grid-cols-8 gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setFormColor(preset.value)}
                      title={preset.name}
                      className={`w-full aspect-square rounded-full cursor-pointer transition-all hover:scale-110 flex items-center justify-center ${preset.bg} ${
                        formColor.toLowerCase() === preset.value.toLowerCase()
                          ? "ring-2 ring-cyan-500 ring-offset-2 dark:ring-offset-zinc-900"
                          : ""
                      }`}
                    >
                      {formColor.toLowerCase() === preset.value.toLowerCase() && (
                        <span className="text-[10px] text-white font-bold font-sans">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-500/50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer shadow-sm active:scale-97"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingTag ? "Simpan Perubahan" : "Buat Tag"}</span>
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
      {isConfirmOpen && deletingTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md transition-opacity duration-300">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center transform transition-all duration-300 select-none">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-500 shrink-0">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
              Hapus Tag?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus tag <strong className="text-zinc-900 dark:text-white">"#{deletingTag.name}"</strong>? Pengelompokan tren postingan dengan tag ini akan terhapus.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 disabled:bg-red-500/50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer active:scale-97"
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
                  setDeletingTag(null);
                }}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer active:scale-97"
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