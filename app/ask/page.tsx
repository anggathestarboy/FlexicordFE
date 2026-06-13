"use client";

import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Sparkles, BookOpen, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import 'quill/dist/quill.snow.css';

export default function AskQuestionPage() {
  const { currentUser, showNotification } = useApp();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [categorySlug, setCategorySlug] = useState('');

  // Tag selector states
  const [allTags, setAllTags] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<any[]>([]);
  const [tagInputValue, setTagInputValue] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [creatingTag, setCreatingTag] = useState(false);

  const quillRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load categories and tags
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const json = await res.json();
          const data = json.data ?? json;
          if (Array.isArray(data)) {
            setCategories(data);
          }
        }
      } catch (err) {
        console.error('Gagal memuat kategori:', err);
      }
    };

    const fetchTags = async () => {
      try {
        const res = await fetch('/api/tags');
        if (res.ok) {
          const json = await res.json();
          const data = json.data ?? json;
          if (Array.isArray(data)) {
            setAllTags(data);
          }
        }
      } catch (err) {
        console.error('Gagal memuat tags:', err);
      }
    };

    fetchCategories();
    fetchTags();
  }, []);

  // Close suggestion popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#q-tags') && !target.closest('.absolute.z-50')) {
        setShowTagSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize Quill Editor
  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current && !quillRef.current) {
      import('quill').then((QuillModule) => {
        const Quill = QuillModule.default;
        
        quillRef.current = new Quill(containerRef.current!, {
          theme: 'snow',
          placeholder: 'Jelaskan apa yang ingin dicapai, apa yang sudah dicoba, hasil yang meleset, serta sertakan potongan kode program...',
          modules: {
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote', 'code-block'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['clean'],
            ],
          },
        });

        // Set initial body if any
        if (body) {
          quillRef.current.root.innerHTML = body;
        }

        // Listen for changes
        quillRef.current.on('text-change', () => {
          setBody(quillRef.current.root.innerHTML);
        });
      });
    }
  }, []);

  // Filter suggestions
  const filteredSuggestions = allTags.filter((tag) => {
    const isAlreadySelected = selectedTags.some((selected) => selected.id === tag.id);
    const matchesInput = tag.name.toLowerCase().includes(tagInputValue.toLowerCase());
    return !isAlreadySelected && matchesInput;
  });

  const isInputExactMatch = allTags.some(
    (tag) => tag.name.toLowerCase() === tagInputValue.trim().toLowerCase()
  );

  const handleAddExistingTag = (tag: any) => {
    if (selectedTags.length >= 5) {
      setError('Maksimal hanya 5 tag yang diperbolehkan.');
      return;
    }
    setSelectedTags([...selectedTags, tag]);
    setTagInputValue('');
    setShowTagSuggestions(false);
    setError('');
  };

  const handleAddNewTag = async (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;
    if (selectedTags.length >= 5) {
      setError('Maksimal hanya 5 tag yang diperbolehkan.');
      return;
    }

    setCreatingTag(true);
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmed,
          slug: trimmed.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-'),
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || 'Gagal membuat tag baru');
      }

      const newTag = resData.data ?? resData;
      setSelectedTags([...selectedTags, newTag]);
      setAllTags([...allTags, newTag]);
      setTagInputValue('');
      setShowTagSuggestions(false);
      setError('');
      showNotification('Tag baru berhasil dibuat dan ditambahkan!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal membuat tag baru.');
    } finally {
      setCreatingTag(false);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Extract text without HTML for length validation
    const textOnly = quillRef.current ? quillRef.current.getText().trim() : body.trim();

    if (!title.trim() || title.trim().length < 15) {
      setError('Judul harus spesifik dan berukuran minimal 15 karakter agar mudah dimengerti.');
      return;
    }

    if (!textOnly || textOnly.length < 40) {
      setError('Tuliskan detail permasalahan lebih lengkap (minimal 40 karakter) beserta potongan kode program.');
      return;
    }

    if (!categorySlug) {
      setError('Silakan pilih kategori postingan.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(), // HTML body from Quill
          category_slug: categorySlug,
          tags: selectedTags.map(t => t.name),
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || 'Gagal mengirim pertanyaan');
      }

      showNotification('Pertanyaan publik baru Anda berhasil diterbitkan! 🚀');
      router.push('/homepage');
    } catch (err: any) {
      console.error('Submit question error:', err);
      setError(err.message || 'Terjadi kesalahan saat memposting pertanyaan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <style>{`
        .ql-toolbar.ql-snow {
          border-color: #e4e4e7 !important;
          background-color: #f4f4f5 !important;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }
        .ql-container.ql-snow {
          border-color: #e4e4e7 !important;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          background-color: #fafafa;
        }
        .dark .ql-toolbar.ql-snow {
          border-color: #27272a !important;
          background-color: #18181b !important;
        }
        .dark .ql-container.ql-snow {
          border-color: #27272a !important;
          background-color: #09090b !important;
        }
        .dark .ql-snow .ql-stroke {
          stroke: #a1a1aa !important;
        }
        .dark .ql-snow .ql-fill {
          fill: #a1a1aa !important;
        }
        .dark .ql-snow .ql-picker {
          color: #a1a1aa !important;
        }
        .dark .ql-snow .ql-picker-options {
          background-color: #18181b !important;
          border-color: #27272a !important;
        }
        .dark .ql-editor.ql-blank::before {
          color: #71717a !important;
          font-style: normal !important;
        }
      `}</style>

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
            {/* Judul */}
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
                disabled={submitting}
                className="w-full px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-450 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all"
                required
              />
              <div className="text-[10px] text-zinc-400 text-right">
                {title.length}/100 karakter
              </div>
            </div>

            {/* Kategori */}
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
              <label htmlFor="q-category" className="block text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Kategori Pertanyaan
              </label>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Pilih kategori yang paling sesuai dengan topik pertanyaan Anda.
              </p>
              <select
                id="q-category"
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                disabled={submitting}
                className="w-full px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all"
                required
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Detail Body (Quill) */}
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
              <label className="block text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Tuliskan Detail Permasalahan dan Kode
              </label>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Jelaskan apa yang ingin dicapai, apa yang sudah dicoba, hasil yang meleset, serta sertakan potongan kode program.
              </p>
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
                <div ref={containerRef} className="min-h-[250px] text-sm text-zinc-900 dark:text-white dark:bg-zinc-900" />
              </div>
              <div className="text-[10px] text-zinc-400 text-right">
                Minimal 40 karakter
              </div>
            </div>

            {/* Tag Selection */}
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs relative">
              <label htmlFor="q-tags" className="block text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Tag Pertanyaan
              </label>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Tambahkan maksimal 5 tag. Pilih dari tag yang sudah ada atau ketik untuk membuat tag baru.
              </p>

              {/* Selected Tag Chips */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded font-mono font-bold border"
                      style={{
                        backgroundColor: `${tag.color || '#3b82f6'}15`,
                        color: tag.color || '#3b82f6',
                        borderColor: `${tag.color || '#3b82f6'}30`,
                      }}
                    >
                      #{tag.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag.id)}
                        className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors cursor-pointer"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tag Input Field */}
              <div className="relative">
                <input
                  id="q-tags"
                  type="text"
                  placeholder="Cari tag atau ketik tag baru..."
                  value={tagInputValue}
                  onChange={(e) => {
                    setTagInputValue(e.target.value);
                    setShowTagSuggestions(true);
                  }}
                  onFocus={() => setShowTagSuggestions(true)}
                  disabled={submitting || creatingTag}
                  className="w-full px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-450 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all"
                />

                {/* Suggestions Dropdown */}
                {showTagSuggestions && (tagInputValue.trim() !== '' || filteredSuggestions.length > 0) && (
                  <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg max-h-60 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
                    {filteredSuggestions.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleAddExistingTag(tag)}
                        className="w-full text-left px-4 py-2 text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/50 flex justify-between items-center cursor-pointer transition-colors"
                      >
                        <span className="font-mono font-bold" style={{ color: tag.color || '#3b82f6' }}>
                          #{tag.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          Digunakan {tag.usage_count || 0} kali
                        </span>
                      </button>
                    ))}

                    {/* Option to create new tag */}
                    {tagInputValue.trim() !== '' && !isInputExactMatch && (
                      <button
                        type="button"
                        onClick={() => handleAddNewTag(tagInputValue)}
                        disabled={creatingTag}
                        className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-brand-blue hover:bg-brand-blue/5 flex items-center justify-between cursor-pointer transition-colors font-semibold"
                      >
                        <span className="flex items-center gap-1.5">
                          {creatingTag ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <span className="text-sm">+</span>
                          )}
                          <span>Buat tag baru: &ldquo;{tagInputValue.trim()}&rdquo;</span>
                        </span>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
                          Baru
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                id="btn-submit-question"
                type="submit"
                disabled={submitting}
                className="bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all active:scale-97 cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Terbitkan Pertanyaan Anda</span>
              </button>
              <button
                type="button"
                onClick={() => router.push('/homepage')}
                disabled={submitting}
                className="border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-350 bg-white dark:bg-zinc-950 text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer disabled:opacity-50"
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
