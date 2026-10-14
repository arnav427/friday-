import React, { useState } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import { getDailyQuote, MotivationalQuote } from '../../services/motivationService';

interface DailyMotivationProps {
  className?: string;
}

/**
 * DailyMotivation - A sleek, focused single motivation line at the start of desktop.
 * Changes everyday deterministically based on the calendar date.
 */
export const DailyMotivation: React.FC<DailyMotivationProps> = ({ className = '' }) => {
  const [offset, setOffset] = useState<number>(0);
  const currentQuote: MotivationalQuote = getDailyQuote(offset);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-cyan-950/50 border border-indigo-500/25 px-4 py-2.5 shadow-sm transition-all hover:border-indigo-500/40 ${className}`}
    >
      {/* Subtle ambient glow */}
      <div className="absolute -left-8 -top-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-3 text-xs md:text-sm">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Motivation pill */}
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold text-[11px] shrink-0 border border-indigo-500/30">
            <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Today's Motivation</span>
          </span>

          {/* Motivation quote line */}
          <p className="italic text-slate-200 truncate md:whitespace-normal md:line-clamp-1 lg:line-clamp-2 flex-1 font-medium leading-relaxed">
            "{currentQuote.quote}"
          </p>

          {/* Author */}
          <span className="text-cyan-300 font-bold shrink-0 hidden sm:inline text-xs">
            — {currentQuote.author}
          </span>
        </div>

        {/* Discreet next quote button */}
        <button
          onClick={() => setOffset((prev) => prev + 1)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition-colors shrink-0"
          title="Next motivational quote"
          aria-label="Next quote"
        >
          <RotateCcw className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-45 transition-transform" />
        </button>
      </div>
    </div>
  );
};
