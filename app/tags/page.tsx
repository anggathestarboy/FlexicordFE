"use client";

import { useState } from "react";
import { Hash, TrendingUp, Search, Plus, Calendar } from "lucide-react";

// ── Types Definition ─────────────────────────────────────────────────────────
interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  usage_count: number;
  created_at: string;
}

// ── Dummy Data (Sesuai JSON kamu) ───────────────────────────────────────────
const INITIAL_TAGS: Tag[] = [
  {
    id: "6930ab6d-32fd-4a38-84ce-d8333d6f03a9",
    name: "fyp",
    slug: "fyp",
    color: "blue",
    usage_count: 0,
    created_at: "2026-06-06 05:06:15",
  },
  {
    id: "e8ebde92-e48c-4778-903f-d54ff54de632",
    name: "Hot",
    slug: "hot",
    color: "red",
    usage_count: 21,
    created_at: "2026-06-04 06:57:32",
  },
];

// ── Tag Card Component ──────────────────────────────────────────────────────
function TagCard({ tag, maxUsage }: { tag: Tag; maxUsage: number }) {
  // Hitung persentase bar relatif terhadap penggunaan tag tertinggi
  const percentage = maxUsage > 0 ? (tag.usage_count / maxUsage) * 100 : 0;

  return (
    <div className="group bg-gradient-to-b from-white to-zinc-50/50 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(34,211,238,0.08)] flex flex-col justify-between h-40">
      <div>
        {/* Header: Name & Slug */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-500 dark:text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
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

          {/* Badge indicator jumlah pemakaian */}
          <span className="text-[10px] font-extrabold tabular-nums px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-500/20">
            {tag.usage_count} posts
          </span>
        </div>

        {/* Date Created Info */}
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
          <Calendar className="w-3 h-3 text-zinc-400" />
          <span>Dibuat: {tag.created_at.split(" ")[0]}</span>
        </div>
      </div>

      {/* Progress Bar Popularitas Mini */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          <span>Popularitas</span>
          <span className="tabular-nums">{Math.round(percentage)}%</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800/60 rounded-full overflow-hidden border border-zinc-200/20 dark:border-zinc-700/30">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
            style={{ width: `${Math.max(percentage, tag.usage_count > 0 ? 5 : 0)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────
export default function TagsPage() {
  const [tags] = useState<Tag[]>(INITIAL_TAGS);
  const [searchQuery, setSearchQuery] = useState("");

  // Cari pemakaian (usage_count) tertinggi untuk acuan kalkulasi progress bar
  const maxUsage = Math.max(...tags.map((t) => t.usage_count), 0);

  // Filter pencarian berdasarkan nama tag atau slug
  const filteredTags = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent tracking-tight">
            Grup Tagging / Label
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gunakan tag untuk mempermudah pencarian tren, kurasi konten, dan pengelompokan mikro.
          </p>
        </div>

        {/* Input Search + Tombol Tambah Opsional */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
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
          <button className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap">
            <Plus className="w-3.5 h-3.5" />
            <span>Tag Baru</span>
          </button>
        </div>
      </div>

      {/* METRIC INFO BAR */}
      <div className="flex items-center gap-1.5 bg-zinc-100/40 dark:bg-zinc-900/30 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/50 backdrop-blur-sm text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        <TrendingUp className="h-4 w-4 text-cyan-500" />
        <span>Terdaftar: </span>
        <span className="text-zinc-900 dark:text-white font-bold">{tags.length} Label Aktif</span>
      </div>

      {/* GRID CONTENT */}
      {filteredTags.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-md mx-auto space-y-2">
          <p className="text-sm font-bold text-zinc-900 dark:text-white">Tag tidak ditemukan</p>
          <p className="text-xs text-zinc-500">Kata kunci "{searchQuery}" belum terdaftar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTags.map((tag) => (
            <TagCard key={tag.id} tag={tag} maxUsage={maxUsage} />
          ))}
        </div>
      )}
    </div>
  );
}