import { BookOpen, HelpCircle, MessageSquare, Flame, Tag, CheckCircle2 } from 'lucide-react';
import { Question } from '../types';

interface RightSidebarProps {
  hotQuestions: Question[];
  popularTags: { name: string; count: number }[];
  selectedTag: string | null;
  onTagClick: (tag: string | null) => void;
  onQuestionClick: (id: string) => void;
}

export default function RightSidebar({
  hotQuestions,
  popularTags,
  selectedTag,
  onTagClick,
  onQuestionClick,
}: RightSidebarProps) {
  return (
    <aside className="w-80 hidden xl:block shrink-0 pl-6 pt-6">
      <div className="space-y-6 sticky top-22">
        {/* The Flexicord Blog & Tips */}
        <div className="rounded-xl border border-blue-200/50 dark:border-blue-950/40 bg-blue-50/40 dark:bg-blue-950/10 overflow-hidden shadow-xs">
          <div className="bg-blue-100/40 dark:bg-blue-950/30 px-4 py-3 border-b border-blue-200/30">
            <h4 className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Kabar Flexicord & Tips</span>
            </h4>
          </div>
          <div className="p-4 space-y-3.5 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex gap-2.5 items-start">
              <MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <a href="#blog-1" className="font-medium hover:text-blue-600 dark:hover:text-blue-300">
                  Meluncurkan Fitur Tema Gelap/Terang Reaktif untuk Kenyamanan Mata Developer
                </a>
              </div>
            </div>
            <div className="flex gap-2.5 items-start">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <a href="#blog-2" className="font-medium hover:text-blue-600 dark:hover:text-blue-300">
                  Mengapa React 19 mempertemukan kita kembali dengan useRef dan action state
                </a>
              </div>
            </div>
            <div className="flex gap-2.5 items-start">
              <HelpCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <a href="#blog-3" className="font-medium hover:text-blue-600 dark:hover:text-blue-300">
                  Panduan Menghindari Error Hydration di Server Components Next.js
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Hot Questions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Flame className="h-4 w-4 text-brand-blue animate-pulse" />
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Pertanyaan Terhangat
            </h4>
          </div>
          <div className="space-y-2.5">
            {hotQuestions.map((q) => (
              <div
                key={q.id}
                onClick={() => onQuestionClick(q.id)}
                className="group flex gap-2.5 p-2.5 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900/50 cursor-pointer transition-all duration-150"
              >
                <div className="shrink-0 flex items-center justify-center h-6 w-7 bg-brand-blue/5 dark:bg-brand-blue/15 text-[11px] font-semibold text-brand-blue font-mono rounded">
                  {q.votes}
                </div>
                <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-brand-blue transition-colors line-clamp-2 leading-relaxed">
                  {q.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Tags */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Tag className="h-4 w-4 text-zinc-500" />
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Popular Tags
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => {
              const isActive = selectedTag === tag.name;
              return (
                <button
                  key={tag.name}
                  onClick={() => onTagClick(isActive ? null : tag.name)}
                  className={`text-xs px-2.5 py-1.5 rounded-md font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 ${
                    isActive
                      ? 'bg-brand-blue text-white ring-1 ring-brand-blue font-semibold'
                      : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-800/80'
                  }`}
                >
                  <span>#{tag.name}</span>
                  <span className={`text-[10px] pl-1 font-sans ${isActive ? 'text-blue-100' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    ({tag.count.toLocaleString()})
                  </span>
                </button>
              );
            })}
          </div>
          {selectedTag && (
            <button
              onClick={() => onTagClick(null)}
              className="text-xs text-brand-blue hover:text-brand-blue-hover font-medium underline px-1 cursor-pointer hover:no-underline transition-all block mt-1"
            >
              Hapus filter tag (#{selectedTag})
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
