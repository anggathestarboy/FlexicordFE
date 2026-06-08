"use client";

import React, { useState } from 'react';
import { Search, SlidersHorizontal, BookOpen, UserCheck, Inbox } from 'lucide-react';
import QuestionCard from '@/components/QuestionCard';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

type SortTab = 'terbaru' | 'terpopuler' | 'belum-terjawab';

export default function HomeView() {
  const { 
    questions, 
    searchQuery, 
    setSearchQuery, 
    selectedTag, 
    setSelectedTag,
    handleQuestionVote,
    setQuestions
  } = useApp();
  const router = useRouter();
  const [activeSort, setActiveSort] = useState<SortTab>('terbaru');

  // Filter and sort computation
  const filteredQuestions = questions
    .filter((q) => {
      // Search filter
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        q.title.toLowerCase().includes(query) ||
        q.body.toLowerCase().includes(query) ||
        q.tags.some((t) => t.toLowerCase().includes(query)) ||
        q.author.displayName.toLowerCase().includes(query);

      // Tag filter
      const matchesTag = !selectedTag || q.tags.includes(selectedTag.toLowerCase());

      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (activeSort === 'terpopuler') {
        return b.votes - a.votes;
      }
      if (activeSort === 'belum-terjawab') {
        return a.answers.length - b.answers.length;
      }
      return b.id.localeCompare(a.id);
    });

  const onQuestionClick = (id: string) => {
    // Simulate increasing views counter on select
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, views: q.views + 1 } : q))
    );
    router.push(`/questions/${id}`);
  };

  const onAskQuestionClick = () => {
    router.push('/ask');
  };

  return (
    <div className="space-y-6">
      {/* Title Header with Ask Action and question count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            {selectedTag ? (
              <span>
                Pertanyaan Tagged <span className="font-mono text-brand-blue">#{selectedTag}</span>
              </span>
            ) : searchQuery ? (
              <span>Hasil Pencarian</span>
            ) : (
              <span>Semua Pertanyaan</span>
            )}
          </h1>
          <p className="text-sm text-zinc-500 mt-1 dark:text-zinc-400">
            {searchQuery
              ? `Menampilkan hasil pencarian untuk "${searchQuery}"`
              : 'Jelajahi permasalahan kode terbaik oleh developer berbakat.'}
          </p>
        </div>

        <button
          onClick={onAskQuestionClick}
          className="sm:hidden w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold py-2.5 px-4 rounded-lg shadow-sm"
        >
          Tanya Pertanyaan Baru
        </button>
      </div>

      {/* Sorting Tabs & Filters Header Option */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-100/60 dark:bg-zinc-900/40 p-2 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80">
        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-2 flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
          <span>{filteredQuestions.length} pertanyaan cocok</span>
        </div>

        {/* Sorting Buttons */}
        <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveSort('terbaru')}
            className={`flex-1 sm:flex-none text-xs font-medium px-4 py-1.5 rounded-md cursor-pointer transition-all ${
              activeSort === 'terbaru'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-brand-blue font-bold font-sans'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Terbaru
          </button>
          <button
            onClick={() => setActiveSort('terpopuler')}
            className={`flex-1 sm:flex-none text-xs font-medium px-4 py-1.5 rounded-md cursor-pointer transition-all ${
              activeSort === 'terpopuler'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-brand-blue font-bold font-sans'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Terpopuler
          </button>
          <button
            onClick={() => setActiveSort('belum-terjawab')}
            className={`flex-1 sm:flex-none text-xs font-medium px-4 py-1.5 rounded-md cursor-pointer transition-all ${
              activeSort === 'belum-terjawab'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-brand-blue font-bold font-sans'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Belum Terjawab
          </button>
        </div>
      </div>

      {/* Main Listing or Empty State Handling */}
      {filteredQuestions.length > 0 ? (
        <div className="space-y-4">
          {filteredQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              onClick={() => onQuestionClick(q.id)}
              onVoteUp={(e) => {
                e.stopPropagation();
                handleQuestionVote(q.id, 'up');
              }}
              onVoteDown={(e) => {
                e.stopPropagation();
                handleQuestionVote(q.id, 'down');
              }}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-2xl mx-auto space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
            <Inbox className="h-6 w-6 text-zinc-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Pertanyaan tidak ditemukan</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              Tidak ada hasil yang sesuai dengan kueri penelusuran atau filter aktif. Pastikan ejaan benar atau bersihkan filter.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag(null);
              }}
              className="text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold px-3.5 py-2.0 rounded-lg cursor-pointer"
            >
              Ulangi Pencarian
            </button>
            <button
              onClick={onAskQuestionClick}
              className="text-xs bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold px-3.5 py-2.0 rounded-lg shadow-xs cursor-pointer"
            >
              Ajukan Tanya Baru
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
