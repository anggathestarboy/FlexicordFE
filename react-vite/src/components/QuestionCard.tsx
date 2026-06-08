import React from 'react';
import { MessageSquare, Eye, ChevronUp, ChevronDown, CheckCircle2, Award } from 'lucide-react';
import { Question } from '../types';

interface QuestionCardProps {
  key?: string;
  question: Question;
  onClick: () => void;
  onVoteUp: (e: React.MouseEvent) => void;
  onVoteDown: (e: React.MouseEvent) => void;
}

export default function QuestionCard({
  question,
  onClick,
  onVoteUp,
  onVoteDown,
}: QuestionCardProps) {
  const hasAnswers = question.answers.length > 0;
  const hasAcceptedAnswer = question.answers.some((ans) => ans.isAccepted);

  const getAnswerBoxStyles = () => {
    if (hasAcceptedAnswer) {
      return 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400';
    }
    if (hasAnswers) {
      return 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/30';
    }
    return 'border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500';
  };

  return (
    <div
      className="group p-5 sm:p-6 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row gap-5"
    >
      {/* Dynamic Interaction Stats Counter Panel (StackOverflow Classic Left-hand side layout) */}
      <div className="flex sm:flex-col items-center sm:items-stretch sm:justify-start gap-3 sm:gap-2.5 sm:w-20 shrink-0 text-center">
        {/* Votes Count Panel */}
        <div className="flex-1 sm:flex-none flex sm:flex-col items-center justify-center p-2 rounded-lg border border-zinc-100 dark:border-zinc-900/40 bg-zinc-50/50 dark:bg-zinc-900/20">
          {/* Mobile direct upvote/downvote inline arrow or simply score display */}
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 font-mono">
              {question.votes}
            </span>
            <span className="text-[10px] text-zinc-500 tracking-wide uppercase">votes</span>
          </div>
        </div>

        {/* Answers Count Panel */}
        <div
          className={`flex-1 sm:flex-none flex sm:flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${getAnswerBoxStyles()}`}
        >
          <div className="flex flex-col items-center">
            {hasAcceptedAnswer ? (
              <span className="text-sm font-bold font-mono flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {question.answers.length}
              </span>
            ) : (
              <span className="text-sm font-bold font-mono">{question.answers.length}</span>
            )}
            <span className="text-[10px] tracking-wide uppercase">answers</span>
          </div>
        </div>

        {/* Views Count Panel */}
        <div className="flex-1 sm:flex-none flex items-center sm:justify-center gap-1 text-zinc-500 py-1 font-mono text-xs">
          <Eye className="h-3.5 w-3.5 opacity-70" />
          <span className="text-[11px] font-medium">{question.views.toLocaleString()} views</span>
        </div>
      </div>

      {/* Primary Question Headers & Metadata Panel */}
      <div className="flex-1 space-y-3">
        {/* Title */}
        <div>
          <h3
            id={`q-title-${question.id}`}
            onClick={onClick}
            className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white group-hover:text-brand-blue leading-snug cursor-pointer transition-colors duration-150"
          >
            {question.title}
          </h3>
          {/* Excerpt Body Preview */}
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed font-sans">
            {question.body.replace(/```[\s\S]*?```/g, '[Kode program]').replace(/[#*`_]/g, '')}
          </p>
        </div>

        {/* Bottom Metadata row: Tags & Author badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 border-t border-zinc-100 dark:border-zinc-900/40">
          {/* Tag Badges */}
          <div className="flex flex-wrap gap-1.5">
            {question.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2.5 py-1.0 bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-800/80 rounded font-mono transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* User author bio card */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto bg-zinc-50/70 dark:bg-zinc-900/20 px-3 py-1.5 rounded-lg border border-zinc-100/50 dark:border-zinc-900/10">
            <img
              src={question.author.avatarUrl}
              alt={question.author.displayName}
              referrerPolicy="no-referrer"
              className="h-6 w-6 rounded-full object-cover shadow-xs"
            />
            <div className="text-left">
              <span className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-brand-blue transition-colors">
                {question.author.displayName}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 font-mono font-medium flex items-center gap-0.5">
                  <Award className="h-2.5 w-2.5 text-brand-blue" />
                  {question.author.reputation.toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                  • {question.createdAt}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
