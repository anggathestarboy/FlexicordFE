"use client";

import React from "react";
import { Search, FolderTree, Inbox } from "lucide-react";
import { Category } from "@/app/api/categories/CategoryType";

interface CategoryGridProps {
  catSearchInput: string;
  setCatSearchInput: (val: string) => void;
  filteredCategories: Category[];
  loadingCategories: boolean;
  onSelectCategory: (slug: string) => void;
}

export default function CategoryGrid({
  catSearchInput,
  setCatSearchInput,
  filteredCategories,
  loadingCategories,
  onSelectCategory,
}: CategoryGridProps) {
  // Renders the main interface for categories exploration
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <FolderTree className="h-6 w-6 text-brand-blue" />
            Jelajahi Kategori
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Pilih kategori di bawah untuk menemukan topik dan diskusi yang relevan.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Cari nama atau deskripsi kategori..."
          value={catSearchInput}
          onChange={(e) => setCatSearchInput(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
        />
      </div>

      {loadingCategories ? (
        <div className="text-center py-20 text-zinc-500 text-sm animate-pulse">Memuat kategori...</div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className="group bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-brand-blue hover:shadow-md transition-all p-6 rounded-xl flex flex-col justify-between cursor-pointer"
            >
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-brand-blue transition-colors">
                  {cat.name}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                  {cat.description || "Tidak ada deskripsi untuk kategori ini."}
                </p>
              </div>

              {cat.children && cat.children.length > 0 && (
                <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                    Subkategori
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cat.children.map((child) => (
                      <span
                        key={child.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCategory(child.slug);
                        }}
                        className="text-xs px-2.5 py-1 bg-zinc-50 hover:bg-brand-blue/10 hover:text-brand-blue text-zinc-600 dark:bg-zinc-900 dark:hover:bg-brand-blue/25 dark:text-zinc-300 rounded-full border border-zinc-200/50 dark:border-zinc-800 transition-colors"
                      >
                        {child.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-2xl mx-auto space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
            <Inbox className="h-6 w-6 text-zinc-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Kategori tidak ditemukan
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              Tidak ada kategori yang cocok dengan pencarian "{catSearchInput}".
            </p>
          </div>
          <button
            onClick={() => setCatSearchInput("")}
            className="text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold px-4 py-2 rounded-lg cursor-pointer"
          >
            Reset Pencarian
          </button>
        </div>
      )}
    </div>
  );
}
