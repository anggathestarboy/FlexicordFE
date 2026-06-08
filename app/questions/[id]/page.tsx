"use client";

import React, { useState, use } from 'react';
import { ChevronUp, ChevronDown, Check, Bookmark, MessageSquare, Award, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { 
    questions, 
    currentUser, 
    handleQuestionVote, 
    handleAnswerVote, 
    handleAddAnswer, 
    handleAddCommentToQuestion, 
    handleAddCommentToAnswer, 
    handleAcceptAnswer 
  } = useApp();
  const router = useRouter();

  const question = questions.find(q => q.id === id);

  const [newAnswerBody, setNewAnswerBody] = useState('');
  const [questionComment, setQuestionComment] = useState('');
  const [answerCommentStates, setAnswerCommentStates] = useState<{ [ansId: string]: string }>({});
  const [showQuestionCommentInput, setShowQuestionCommentInput] = useState(false);
  const [showAnswerCommentInputs, setShowAnswerCommentInputs] = useState<{ [ansId: string]: boolean }>({});

  if (!question) {
    return (
      <div className="p-12 text-center text-zinc-500">
        Pertanyaan tidak ditemukan atau telah dihapus.
      </div>
    );
  }

  const handleAddAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswerBody.trim()) return;
    handleAddAnswer(question.id, newAnswerBody);
    setNewAnswerBody('');
  };

  const handleAddQuestionComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionComment.trim()) return;
    handleAddCommentToQuestion(question.id, questionComment);
    setQuestionComment('');
    setShowQuestionCommentInput(false);
  };

  const handleAddAnswerComment = (ansId: string, e: React.FormEvent) => {
    e.preventDefault();
    const commentText = answerCommentStates[ansId] || '';
    if (!commentText.trim()) return;
    handleAddCommentToAnswer(question.id, ansId, commentText);
    setAnswerCommentStates(prev => ({ ...prev, [ansId]: '' }));
    setShowAnswerCommentInputs(prev => ({ ...prev, [ansId]: false }));
  };

  const formatTextBody = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        let language = 'javascript';
        let codeLines = lines;
        if (lines[0] && lines[0].match(/^[a-zA-Z0-9+#]+$/)) {
          language = lines[0];
          codeLines = lines.slice(1);
        }
        return (
          <div key={index} className="my-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner">
            <div className="bg-zinc-100 dark:bg-zinc-900 px-4 py-1.5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">{language}</span>
              <span className="text-[10px] font-sans text-zinc-400">Read-only code editor</span>
            </div>
            <pre className="bg-zinc-900 text-zinc-100 p-4 overflow-x-auto font-mono text-xs sm:text-sm selection:bg-brand-blue/30">
              <code>{codeLines.join('\n')}</code>
            </pre>
          </div>
        );
      }
      return (
        <p key={index} className="whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300 text-sm sm:text-base mb-3 font-sans">
          {part}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500 hover:text-brand-blue dark:text-zinc-400 dark:hover:text-blue-400 transition-colors py-1 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Kembali ke Beranda</span>
      </Link>

      <div className="pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-white leading-tight">
          {question.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          <span>Ditanyakan: <strong className="text-zinc-700 dark:text-zinc-300 font-sans">{question.createdAt}</strong></span>
          <span>Dilihat: <strong className="text-zinc-700 dark:text-zinc-300 font-sans">{question.views.toLocaleString()} kali</strong></span>
          <span>Jumlah Jawaban: <strong className="text-zinc-700 dark:text-zinc-300 font-sans">{question.answers.length}</strong></span>
        </div>
      </div>

      <div className="flex gap-4 sm:gap-6">
        <div className="flex flex-col items-center gap-1.5 text-center shrink-0">
          <button
            onClick={() => handleQuestionVote(question.id, 'up')}
            className={`p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-950 transition-colors cursor-pointer ${
              question.voted === 'up'
                ? 'text-brand-blue bg-brand-blue/10 dark:bg-brand-blue/20'
                : 'text-zinc-400 dark:text-zinc-550'
            }`}
            title="Sangat berkontribusi (Mendukung)"
          >
            <ChevronUp className="h-8 w-8 stroke-[2.5]" />
          </button>
          <span className="text-lg font-bold font-mono text-zinc-800 dark:text-zinc-200">
            {question.votes}
          </span>
          <button
            onClick={() => handleQuestionVote(question.id, 'down')}
            className={`p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-950 transition-colors cursor-pointer ${
              question.voted === 'down'
                ? 'text-zinc-800 dark:text-white bg-zinc-200 dark:bg-zinc-805'
                : 'text-zinc-400 dark:text-zinc-550'
            }`}
            title="Kurang berkontribusi (Menolak)"
          >
            <ChevronDown className="h-8 w-8 stroke-[2.5]" />
          </button>
          <button
            className="mt-3 text-zinc-300 hover:text-zinc-450 dark:text-zinc-705 dark:hover:text-zinc-550 cursor-pointer"
            title="Bookmark pertanyaan ini"
          >
            <Bookmark className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 min-w-0 pr-1 sm:pr-2">
          <article className="prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200">
            {formatTextBody(question.body)}
          </article>

          <div className="flex flex-wrap gap-1.5 mt-5">
            {question.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2.5 py-1.0 bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-800/80 rounded font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <div className="w-56 bg-zinc-100/60 dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-200/40 dark:border-zinc-850">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono block mb-1">
                Ditanyakan {question.createdAt}
              </span>
              <div className="flex items-center gap-2">
                <img
                  src={question.author.avatarUrl}
                  alt={question.author.displayName}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div className="text-left">
                  <span className="block text-xs font-bold text-zinc-700 dark:text-zinc-200">
                    {question.author.displayName}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                    <Award className="h-3 w-3 text-brand-blue" />
                    <span>{question.author.reputation.toLocaleString()} rep</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-900/60 space-y-3.5">
            <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Komentar Pertanyaan ({question.comments.length})</span>
            </h4>
            
            {question.comments.length > 0 && (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-900 pl-3 sm:pl-4 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-2.5 pb-2">
                {question.comments.map((comm) => (
                  <div key={comm.id} className="text-xs text-zinc-650 dark:text-zinc-350 pt-2 first:pt-0 leading-relaxed font-sans">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 mr-1">
                      {comm.author.displayName}:
                    </span>
                    {comm.body}
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-2 font-mono">
                      — {comm.createdAt}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {!showQuestionCommentInput ? (
              <button
                onClick={() => setShowQuestionCommentInput(true)}
                className="text-xs text-zinc-500 hover:text-brand-blue dark:text-zinc-400 dark:hover:text-blue-400 underline cursor-pointer"
              >
                + Tambah komentar baru pada pertanyaan
              </button>
            ) : (
              <form onSubmit={handleAddQuestionComment} className="flex gap-2 max-w-2xl mt-2">
                <input
                  type="text"
                  placeholder="Ketik komentar singkat (hindari memasukkan jawaban di sini)..."
                  value={questionComment}
                  onChange={(e) => setQuestionComment(e.target.value)}
                  className="flex-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
                <button
                  type="submit"
                  className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs px-3 py-1 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <Send className="h-3 w-3" />
                  Kirim
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuestionCommentInput(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-1 cursor-pointer"
                >
                  Batal
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-850 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
            {question.answers.length} Jawaban Solutif
          </h2>
        </div>

        <div className="space-y-6">
          {question.answers.map((ans) => {
            const showCommentInput = showAnswerCommentInputs[ans.id] || false;
            const commentText = answerCommentStates[ans.id] || '';

            return (
              <div
                key={ans.id}
                className={`p-5 rounded-xl border transition-all ${
                  ans.isAccepted
                    ? 'border-emerald-200 dark:border-emerald-950 bg-emerald-500/5 dark:bg-emerald-950/5'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950'
                }`}
              >
                <div className="flex gap-4 sm:gap-6">
                  <div className="flex flex-col items-center gap-1 text-center shrink-0 pt-1">
                    <button
                      onClick={() => handleAnswerVote(question.id, ans.id, 'up')}
                      className={`p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer ${
                        ans.voted === 'up'
                          ? 'text-brand-blue bg-brand-blue/10'
                          : 'text-zinc-400'
                      }`}
                    >
                      <ChevronUp className="h-6 w-6 stroke-[3.0]" />
                    </button>
                    <span className="text-sm font-bold font-mono text-zinc-700 dark:text-zinc-300">
                      {ans.votes}
                    </span>
                    <button
                      onClick={() => handleAnswerVote(question.id, ans.id, 'down')}
                      className={`p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer ${
                        ans.voted === 'down'
                          ? 'text-zinc-800 dark:text-white'
                          : 'text-zinc-400'
                      }`}
                    >
                      <ChevronDown className="h-6 w-6 stroke-[3.0]" />
                    </button>

                    {ans.isAccepted ? (
                      <div className="mt-2 text-emerald-500" title="Solusi yang disepakati pembuat pertanyaan">
                        <CheckCircle2 className="h-6 w-6 fill-emerald-500/10" />
                      </div>
                    ) : (
                      currentUser.id === question.author.id && (
                        <button
                          onClick={() => handleAcceptAnswer(question.id, ans.id)}
                          className="mt-2 text-zinc-300 hover:text-emerald-500 transition-colors cursor-pointer"
                          title="Tandai jawaban ini sebagai solusi yang disepakati"
                        >
                          <Check className="h-5 w-5 hover:scale-110 active:scale-95 transition-transform" />
                        </button>
                      )
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-1">
                    <article className="prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200">
                      {formatTextBody(ans.body)}
                    </article>

                    <div className="flex justify-between items-center mt-6">
                      <div>
                        {ans.isAccepted && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-sans">
                            ✓ Solusi Disepakati
                          </span>
                        )}
                      </div>
                      
                      <div className="w-56 bg-zinc-100/40 dark:bg-zinc-900/40 p-2 rounded-lg border border-zinc-100 dark:border-zinc-850/50">
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono block mb-1">
                          Dijawab oleh:
                        </span>
                        <div className="flex items-center gap-2">
                          <img
                            src={ans.author.avatarUrl}
                            alt={ans.author.displayName}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                          <div className="text-left">
                            <span className="block text-xs font-bold text-zinc-700 dark:text-zinc-200">
                              {ans.author.displayName}
                            </span>
                            <span className="text-[9px] text-zinc-400 font-mono">
                              Rep: {ans.author.reputation.toLocaleString()} • {ans.createdAt}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-900/60 space-y-2">
                      {ans.comments.length > 0 && (
                        <div className="divide-y divide-zinc-105 dark:divide-zinc-900 pl-3 border-l text-left space-y-2 pb-1">
                          {ans.comments.map((ac) => (
                            <div key={ac.id} className="text-xs text-zinc-650 dark:text-zinc-350 pt-1.5 first:pt-0">
                              <span className="font-semibold text-zinc-800 dark:text-zinc-200 mr-1">
                                {ac.author.displayName}:
                              </span>
                              {ac.body}
                              <span className="text-[9px] text-zinc-400 ml-2 font-mono">— {ac.createdAt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {!showCommentInput ? (
                        <button
                          onClick={() => setShowAnswerCommentInputs(prev => ({ ...prev, [ans.id]: true }))}
                          className="text-xs text-zinc-400 hover:text-brand-blue dark:text-zinc-500 dark:hover:text-blue-400 underline pt-1 cursor-pointer"
                        >
                          + Tambah komentar pada jawaban ini
                        </button>
                      ) : (
                        <form onSubmit={(e) => handleAddAnswerComment(ans.id, e)} className="flex gap-2 max-w-xl mt-2">
                          <input
                            type="text"
                            placeholder="Ketik komentar untuk jawaban ini..."
                            value={commentText}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAnswerCommentStates(prev => ({ ...prev, [ans.id]: val }));
                            }}
                            className="flex-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                          />
                          <button
                            type="submit"
                            className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-750 dark:text-zinc-250 text-xs px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                          >
                            Kirim
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAnswerCommentInputs(prev => ({ ...prev, [ans.id]: false }))}
                            className="text-xs text-zinc-400 hover:text-zinc-650 px-1"
                          >
                            Batal
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-850 space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
          Jawaban Anda
        </h3>
        
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-lg text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
          <p className="font-semibold text-zinc-700 dark:text-zinc-300">💡 Tips Format Pengkodean Markdown:</p>
          <p>Gunakan tanda triple backtick (\`\`\`) untuk menyelimuti barisan potongan kode program agar rapi, disertai nama bahasa pemrograman di baris awal. Cth: \`\`\`tsx ... \`\`\`</p>
        </div>

        <form onSubmit={handleAddAnswerSubmit} className="space-y-4">
          <textarea
            id="answer-body-textarea"
            rows={7}
            placeholder="Tuliskan petunjuk penyelesaian, sertakan potongan kode program jika diperlukan..."
            value={newAnswerBody}
            onChange={(e) => setNewAnswerBody(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all duration-150"
            required
          />

          <button
            id="btn-submit-answer"
            type="submit"
            className="bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow active:scale-98 cursor-pointer transition-all duration-150"
          >
            Kirim Jawaban Anda
          </button>
        </form>
      </div>
    </div>
  );
}
