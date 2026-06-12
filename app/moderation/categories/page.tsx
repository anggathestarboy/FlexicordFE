"use client";

import { useEffect, useState, useRef } from "react";
import { Folder, FolderOpen, ChevronRight, ChevronDown, Layers, Hash, Pencil, Trash2, Plus, X, Loader2, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Category, CategoryChild } from "../../api/categories/CategoryType";
import axios from "axios";

// ── Category Card Component ──────────────────────────────────────────────────
function CategoryCard({
  category,
  isManageMode,
  onEdit,
  onDelete,
  onEditChild,
  onDeleteChild,
}: {
  category: Category;
  isManageMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onEditChild: (child: CategoryChild) => void;
  onDeleteChild: (child: CategoryChild) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="group relative bg-gradient-to-b from-white to-zinc-50/30 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(34,211,238,0.08)]">
      
      {/* Admin actions overlay for main category */}
      {isManageMode && (
        <div className="absolute top-3 right-3 flex items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 dark:bg-zinc-900/90 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 backdrop-blur-xs shadow-xs">
          <button
            onClick={onEdit}
            title="Edit Kategori Utama"
            className="p-1.5 text-zinc-500 hover:text-cyan-500 dark:hover:text-cyan-400 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer animate-none"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            title="Hapus Kategori Utama"
            className="p-1.5 text-zinc-500 hover:text-red-500 dark:hover:text-red-400 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer animate-none"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-start justify-between gap-3 text-left">
        <div className="flex gap-3.5 items-center min-w-0">
          {/* Icon Folder */}
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-500 dark:text-cyan-400 shrink-0 shadow-xs group-hover:scale-105 transition-transform select-none">
            {isOpen ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors pr-12">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-1 mt-0.5 pr-8">
                {category.description}
              </p>
            )}
            <p className="text-[10px] text-zinc-400 font-mono mt-0.5 tracking-wide bg-zinc-100/50 dark:bg-zinc-900/60 px-1.5 py-0.5 rounded-md inline-block select-all">
              /{category.slug}
            </p>
          </div>
        </div>

        {/* Badge Total Sub-kategori atau Tombol Toggle */}
        {hasChildren ? (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors shrink-0"
          >
            <span>{category.children.length} Sub</span>
            {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : (
          <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md font-medium shrink-0 select-none">
            Empty
          </span>
        )}
      </div>

      {/* Sub-categories Area (Collapsible) */}
      {hasChildren && isOpen && (
        <div className="mt-4 pt-3.5 border-t border-dashed border-zinc-200 dark:border-zinc-800 space-y-2 select-none">
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-505 uppercase tracking-wider mb-2 text-left">
            Sub Kategori:
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {category.children.map((child) => (
              <div
                key={child.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/40 dark:border-zinc-800/60 hover:border-cyan-500/30 dark:hover:border-cyan-500/30 transition-colors group/sub"
              >
                <Hash className="w-3.5 h-3.5 text-zinc-400 group-hover/sub:text-cyan-500 transition-colors shrink-0" />
                <div className="flex-1 min-w-0 flex items-center justify-between gap-2 text-left">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate block">
                      {child.name}
                    </span>
                    {child.description && (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block truncate">
                        {child.description}
                      </span>
                    )}
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono block mt-0.5">
                      /{child.slug}
                    </span>
                  </div>

                  {/* Admin actions overlay for child category */}
                  {isManageMode && (
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/sub:opacity-100 transition-opacity duration-150 bg-white/80 dark:bg-zinc-900/80 p-0.5 rounded border border-zinc-200/50 dark:border-zinc-800/50">
                      <button
                        onClick={() => onEditChild(child)}
                        title="Edit Sub-kategori"
                        className="p-1 text-zinc-500 hover:text-cyan-500 dark:hover:text-cyan-400 rounded hover:bg-zinc-150 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onDeleteChild(child)}
                        title="Hapus Sub-kategori"
                        className="p-1 text-zinc-500 hover:text-red-500 dark:hover:text-red-400 rounded hover:bg-zinc-150 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────
export default function CategoriesPage() {
  const { currentUser, showNotification } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Admin / Moderator States
  const [isManageMode, setIsManageMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | CategoryChild | null>(null);

  // Form States
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formParentId, setFormParentId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Delete Confirmation States
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | CategoryChild | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Check role authorization
  const isAuthorized =
    currentUser?.primary_role?.name === "admin" ||
    currentUser?.primary_role?.name === "moderator";

  const fetchCategoriesList = () => {
    setLoading(true);
    fetch("/api/categories")
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setCategories(res.data);
        } else if (Array.isArray(res)) {
          setCategories(res);
        } else {
          setError("Gagal memuat data kategori.");
        }
      })
      .catch(() => setError("Terjadi kesalahan koneksi."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategoriesList();
  }, []);

  // Filter categories by search query
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Parent Category options list
  const parentCategoryOptions = categories.filter((c) => !c.parent_id);

  // Handlers for modals
  const handleEditMainClick = (category: Category) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormDescription(category.description || "");
    setFormParentId("");
    setValidationError(null);
    setIsModalOpen(true);
  };

  const handleEditChildClick = (child: CategoryChild) => {
    setEditingCategory(child);
    setFormName(child.name);
    setFormDescription(child.description || "");
    setFormParentId(child.parent_id || "");
    setValidationError(null);
    setIsModalOpen(true);
  };

  const handleDeleteMainClick = (category: Category) => {
    setDeletingCategory(category);
    setIsConfirmOpen(true);
  };

  const handleDeleteChildClick = (child: CategoryChild) => {
    setDeletingCategory(child);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setDeleting(true);
    try {
      const res = await axios.delete(`/api/categories/${deletingCategory.slug}`);
      if (res.status === 200 || res.data?.success) {
        showNotification(`Kategori "${deletingCategory.name}" berhasil dihapus!`, "success");
        fetchCategoriesList();
      } else {
        showNotification(res.data?.message || "Gagal menghapus kategori.", "info");
      }
    } catch (err: any) {
      console.error(err);
      showNotification(
        err.response?.data?.message || "Terjadi kesalahan saat menghapus kategori.",
        "info"
      );
    } finally {
      setDeleting(false);
      setIsConfirmOpen(false);
      setDeletingCategory(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setValidationError("Nama kategori wajib diisi.");
      return;
    }

    setSubmitting(true);
    setValidationError(null);

    const payload = {
      name: formName.trim(),
      description: formDescription.trim() || null,
      parent_id: formParentId || null,
    };

    try {
      let res;
      if (editingCategory) {
        // Edit mode (PUT)
        res = await axios.put(`/api/categories/${editingCategory.slug}`, payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        // Create mode (POST)
        res = await axios.post("/api/categories", payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      if (res.status === 200 || res.status === 201 || res.data?.success) {
        showNotification(
          editingCategory
            ? `Kategori "${formName}" berhasil diperbarui!`
            : `Kategori "${formName}" berhasil dibuat!`,
          "success"
        );
        setIsModalOpen(false);
        fetchCategoriesList();
      } else {
        setValidationError(res.data?.message || "Gagal menyimpan kategori.");
      }
    } catch (err: any) {
      console.error(err);
      let errorMsg = "Terjadi kesalahan server saat menyimpan kategori.";
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="text-left">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent tracking-tight">
            Manajemen Kategori
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Kelola rumpun topik, sub-kategori, dan pengelompokan postingan sistem kamu.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full md:w-auto">
          {/* Input Search */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
          </div>

          {/* Manage Switch */}
          {isAuthorized && (
            <button
              onClick={() => setIsManageMode(!isManageMode)}
              className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer active:scale-97 shrink-0 ${
                isManageMode
                  ? "bg-amber-500/10 text-amber-600 border-amber-400/40 dark:bg-amber-500/20 dark:text-amber-400 shadow-sm"
                  : "text-zinc-650 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              <span>{isManageMode ? "Keluar Mode Kelola" : "Kelola Kategori"}</span>
            </button>
          )}
        </div>
      </div>

      {/* METRIC INFO & CONTROL BAR */}
      {!loading && !error && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-100/40 dark:bg-zinc-900/30 p-2 rounded-xl border border-zinc-200/60 dark:border-zinc-800/50 backdrop-blur-sm">
          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-2 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-cyan-500" />
            <span>Terstruktur: </span>
            <span className="text-zinc-900 dark:text-white font-bold">{categories.length} Kategori Utama</span>
          </div>

          {isManageMode && (
            <button
              onClick={() => {
                setEditingCategory(null);
                setFormName("");
                setFormDescription("");
                setFormParentId("");
                setValidationError(null);
                setIsModalOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors cursor-pointer w-full sm:w-auto shadow-sm active:scale-97"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Kategori</span>
            </button>
          )}
        </div>
      )}

      {/* CONTENT GRID */}
      {loading ? (
        <div className="text-center py-20 text-zinc-500 text-sm animate-pulse select-none">Memuat data...</div>
      ) : error ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-2xl mx-auto space-y-3 select-none">
          <p className="text-base font-bold text-zinc-900 dark:text-white">⚠️ {error}</p>
          <p className="text-xs text-zinc-500">Coba muat ulang halaman ini.</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-md mx-auto space-y-2 select-none">
          <p className="text-sm font-bold text-zinc-900 dark:text-white text-center">Kategori tidak ditemukan</p>
          <p className="text-xs text-zinc-550 text-center">Kata kunci "{searchQuery}" tidak cocok dengan data apa pun.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              isManageMode={isManageMode}
              onEdit={() => handleEditMainClick(category)}
              onDelete={() => handleDeleteMainClick(category)}
              onEditChild={handleEditChildClick}
              onDeleteChild={handleDeleteChildClick}
            />
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md transition-opacity duration-300">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all duration-300">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/5 dark:bg-zinc-900/5 select-none">
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-500" />
                <span>{editingCategory ? "Edit Kategori" : "Buat Kategori Baru"}</span>
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
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Cth: Framework & Library"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-zinc-250 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Deskripsi Kategori
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Tuliskan deskripsi singkat kategori..."
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-zinc-250 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Parent Category Select */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 font-sans">
                  Kategori Induk (Pilih jika sub-kategori)
                </label>
                <select
                  value={formParentId}
                  onChange={(e) => setFormParentId(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-zinc-250 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-semibold"
                >
                  <option value="">-- Tanpa Induk (Kategori Utama) --</option>
                  {parentCategoryOptions
                    // Do not allow choosing itself as parent
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((c) => (
                      <option key={c.name} value={c.name || ""}>
                        {c.name}
                      </option> 
                    ))}
                </select>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-650/50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer shadow-sm active:scale-97 animate-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? "Simpan Perubahan" : "Buat Kategori"}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-550/5 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer active:scale-97"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {isConfirmOpen && deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md transition-opacity duration-300">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center transform transition-all duration-300 select-none">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-500 animate-none">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
              Hapus Kategori?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus kategori <strong className="text-zinc-900 dark:text-white">"{deletingCategory.name}"</strong>? 
              {!deletingCategory.parent_id && (
                <span className="block text-red-500 font-bold mt-2">
                  ⚠️ Peringatan: Menghapus kategori utama dapat menghapus atau melepaskan sub-kategori di dalamnya!
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 disabled:bg-red-650/50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer active:scale-97 animate-none"
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
                  setDeletingCategory(null);
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