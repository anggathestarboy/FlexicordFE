"use client";

import { useState } from "react";
import { Folder, FolderOpen, ChevronRight, ChevronDown, Layers, Hash } from "lucide-react";

// ── Types Definition ─────────────────────────────────────────────────────────
interface ChildCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
  children: ChildCategory[];
}

// ── Dummy Data (Sesuai JSON kamu) ───────────────────────────────────────────
const INITIAL_CATEGORIES: Category[] = [
  {
    id: "5163a39d-7fae-4c83-b00f-8054d8e348cc",
    name: "Web Development",
    slug: "web-development",
    description: null,
    parent_id: null,
    created_at: "2026-06-10 07:51:26",
    children: [],
  },
  {
    id: "709bb650-b0bc-4f4e-ae8b-1560d5d49809",
    name: "Tech",
    slug: "tech",
    description: null,
    parent_id: null,
    created_at: "2026-06-04 05:50:12",
    children: [
      {
        id: "169508a8-1ac9-431f-8409-8533fdf28319",
        name: "Sekawan Media",
        slug: "sekawan-media",
        description: null,
        parent_id: "709bb650-b0bc-4f4e-ae8b-1560d5d49809",
        created_at: "2026-06-04 05:51:41",
      },
    ],
  },
  {
    id: "a835c9c7-f743-4a67-b613-2f2613dae068",
    name: "Backend Development",
    slug: "backend-development",
    description: null,
    parent_id: null,
    created_at: "2026-06-10 07:51:45",
    children: [],
  },
  {
    id: "b0fd1842-0d2c-4fb3-acc9-aa06449ddee9",
    name: "Mobile Development",
    slug: "mobile-development",
    description: null,
    parent_id: null,
    created_at: "2026-06-10 07:51:08",
    children: [],
  },
  {
    id: "d8d56ec4-7ada-4b61-9d79-cce88fa389c6",
    name: "Dekstop Development",
    slug: "dekstop-development",
    description: null,
    parent_id: null,
    created_at: "2026-06-10 07:51:17",
    children: [],
  },
  {
    id: "e6224e21-338c-4122-9994-3a4e1ac28e5e",
    name: "coding",
    slug: "coding",
    description: null,
    parent_id: null,
    created_at: "2026-06-10 07:50:18",
    children: [],
  },
  {
    id: "ec8117f4-c9e2-43be-b824-4cbd38d53d2f",
    name: "Frontend Development",
    slug: "frontend-development",
    description: null,
    parent_id: null,
    created_at: "2026-06-10 07:51:35",
    children: [],
  },
];

// ── Category Card Component ──────────────────────────────────────────────────
function CategoryCard({ category }: { category: Category }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.children.length > 0;

  return (
    <div className="group bg-gradient-to-b from-white to-zinc-50/30 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(34,211,238,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3.5 items-center min-w-0">
          {/* Icon Folder ala Turkish Theme */}
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-500 dark:text-cyan-400 shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            {isOpen ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
              {category.name}
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5 tracking-wide">
              /{category.slug}
            </p>
          </div>
        </div>

        {/* Badge Total Sub-kategori atau Tombol Toggle */}
        {hasChildren ? (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
          >
            <span>{category.children.length} Sub</span>
            {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : (
          <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md font-medium">
            Empty
          </span>
        )}
      </div>

      {/* Sub-categories Area (Collapsible) */}
      {hasChildren && isOpen && (
        <div className="mt-4 pt-3.5 border-t border-dashed border-zinc-200 dark:border-zinc-800 space-y-2 animate-fadeIn">
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
            Sub Kategori:
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {category.children.map((child) => (
              <div
                key={child.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/40 dark:border-zinc-800/60 hover:border-cyan-500/30 dark:hover:border-cyan-500/30 transition-colors group/sub"
              >
                <Hash className="w-3.5 h-3.5 text-zinc-400 group-hover/sub:text-cyan-500 transition-colors shrink-0" />
                <div className="flex-1 min-w-0 flex items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                    {child.name}
                  </span>
                  <span className="text-[9px] text-zinc-400 font-mono shrink-0">
                    {child.slug}
                  </span>
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
  // Gunakan state jika data ini nantinya di-fetch dari API
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");

  // Handler filter pencarian sederhana berdasarkan nama atau slug
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent tracking-tight">
            Manajemen Kategori
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Kelola rumpun topik, sub-kategori, dan pengelompokan postingan sistem kamu.
          </p>
        </div>

        {/* Input Search Modern */}
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Cari kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* METRIC INFO BAR */}
      <div className="flex items-center gap-1.5 bg-zinc-100/40 dark:bg-zinc-900/30 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/50 backdrop-blur-sm text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        <Layers className="h-4 w-4 text-cyan-500" />
        <span>Terstruktur: </span>
        <span className="text-zinc-900 dark:text-white font-bold">{categories.length} Kategori Utama</span>
      </div>

      {/* GRID CONTENT */}
      {filteredCategories.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-md mx-auto space-y-2">
          <p className="text-sm font-bold text-zinc-900 dark:text-white">Kategori tidak ditemukan</p>
          <p className="text-xs text-zinc-500">Kata kunci "{searchQuery}" tidak cocok dengan data apa pun.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}