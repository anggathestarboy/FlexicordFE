"use client";

import React, { useState } from 'react';
import { HelpCircle, Sparkles, BookOpen, FileText, Check, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function AskQuestionPage() {
  const { currentUser, handlePostQuestion } = useApp();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');

  const getTagsFromInput = () => {
    return tagInput
      .split(/[\s,]+/)
      .map((t) => t.trim().toLowerCase().replace(/[^a-zA-Z0-9.#+]/g, ''))
      .filter((t) => t.length > 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || title.trim().length < 15) {
      setError('Judul harus spesifik dan berukuran minimal 15 karakter agar mudah dimengerti.');
      return;
    }

    if (!body.trim() || body.trim().length < 40) {
      setError('Tuliskan detail permasalahan lebih lengkap (minimal 40 karakter) beserta potongan kode program.');
      return;
    }

    const tags = getTagsFromInput();
    if (tags.length === 0) {
      setError('Tambahkan minimal 1 tag (seperti: react, next.js) untuk mempermudah developer lain menemukan topik Anda.');
      return;
    }

    handlePostQuestion(title.trim(), body.trim(), tags);
    router.push('/');
  };

  const tagChips = getTagsFromInput();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <HelpCircle className="h-7 w-7 text-brand-blue" />
          <span>Ajukan Pertanyaan Publik</span>
        </h1>
        <p className="text-sm text-zinc-500 mt-1 dark:text-zinc-400">
          Buatlah pertanyaan berkualitas agar dapat dijawab dengan cepat dan akurat oleh komunitas pengembang kami.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-655 dark:text-red-400 text-xs sm:text-sm flex items-start gap-2.5 animate-shake">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Gagal mengirim pertanyaan:</span> {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
              <label htmlFor="q-title" className="block text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Judul Masalah
              </label>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Bayangkan kamu sedang menjelaskan masalah ini ke developer lain di kantor. Buatlah sespesifik mungkin.
              </p>
              <input
                id="q-title"
                type="text"
                maxLength={100}
                placeholder="Cth: Bagaimana cara membaca query string di Next.js 14 App Router?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-450 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all"
                required
              />
              <div className="text-[10px] text-zinc-400 text-right">
                {title.length}/100 karakter
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
              <label htmlFor="q-body" className="block text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Tuliskan Detail Permasalahan dan Kode
              </label>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Jelaskan apa yang ingin dicapai, apa yang sudah dicoba, hasil yang meleset, serta sertakan potongan kode program (*code block*).
              </p>
              <textarea
                id="q-body"
                rows={10}
                placeholder="Tuliskan detail di sini... Gunakan tag ``` untuk code block seperti contoh:&#10;&#10;```tsx&#10;export default function Page() {&#10;  return <div>Halo</div>&#10;}&#10;```"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-4 py-3 text-xs sm:text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-450 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all font-sans"
                required
              />
              <div className="text-[10px] text-zinc-400 text-right">
                Minimal 40 karakter • Saat ini: {body.length} karakter
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
              <label htmlFor="q-tags" className="block text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Tag Pertanyaan
              </label>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Tambahkan maksimal 5 tag yang menggambarkan bahasa pemrograman / framework pertanyaan. Pisahkan dengan spasi atau koma.
              </p>
              <input
                id="q-tags"
                type="text"
                placeholder="Cth: react next.js tailwindcss"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-450 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all"
                required
              />

              {tagChips.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <span className="block text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-550">Preview Tag Aktif:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {tagChips.slice(0, 5).map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-1 bg-brand-blue/10 text-brand-blue border border-brand-blue/20 rounded font-mono font-bold"
                      >
                        #{t}
                      </span>
                    ))}
                    {tagChips.length > 5 && (
                      <span className="text-xs text-zinc-400 flex items-center">
                        +{tagChips.length - 5} lainnya (maks 5 lolos simpan)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                id="btn-submit-question"
                type="submit"
                className="bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all active:scale-97 cursor-pointer"
              >
                Terbitkan Pertanyaan Anda
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-350 bg-white dark:bg-zinc-950 text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
              >
                Batal Saja
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-brand-blue" />
              <span>Panduan Menulis</span>
            </h4>
            <div className="space-y-2.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
              <div className="flex gap-2">
                <div className="h-5 w-5 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue flex items-center justify-center font-bold text-[10px] shrink-0">1</div>
                <p><strong>Ringkas Masalah:</strong> Tulis judul yang pendek namun padat yang mencerminkan inti kesalahan/tujuan kode.</p>
              </div>
              <div className="flex gap-2">
                <div className="h-5 w-5 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue flex items-center justify-center font-bold text-[10px] shrink-0">2</div>
                <p><strong>Beri Konteks:</strong> Beritahu pustaka (*library*) atau versi kerangka kerja yang kamu gunakan (cth: React 19 / Next.js 14).</p>
              </div>
              <div className="flex gap-2">
                <div className="h-5 w-5 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue flex items-center justify-center font-bold text-[10px] shrink-0">3</div>
                <p><strong>Format Code:</strong> Selalu selimuti kode program dengan block markdown (\`\`\`) agar rapi, terbaca jelas, dan indah di layar.</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-emerald-500" />
              <span>Sebelum Dikirim</span>
            </h4>
            <div className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
              <label className="flex items-center gap-2 cursor-pointer py-1 hover:text-zinc-900 dark:hover:text-zinc-200">
                <input type="checkbox" className="accent-brand-blue h-3.5 w-3.5 rounded" defaultChecked />
                <span>Saya sudah mencari permasalahan serupa di internet.</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer py-1 hover:text-zinc-900 dark:hover:text-zinc-200">
                <input type="checkbox" className="accent-brand-blue h-3.5 w-3.5 rounded" defaultChecked />
                <span>Saya memasukkan kode program asli dan bukan hasil rekayasa.</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer py-1 hover:text-zinc-900 dark:hover:text-zinc-200">
                <input type="checkbox" className="accent-brand-blue h-3.5 w-3.5 rounded" defaultChecked />
                <span>Saya mengisi tag dengan tepat.</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
