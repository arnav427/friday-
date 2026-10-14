import React, { useState } from 'react';
import {
  Laugh,
  Brain,
  Sparkles,
  RotateCcw,
  ShieldAlert,
  Lightbulb,
  Check,
  Share2,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ErrorMemeBreakdown,
  CURATED_ERROR_MEMES,
  getMemeBreakdownForDay,
} from '../../services/errorBookService';
import { playChime } from '../../services/soundService';

interface MemeBreakdownWindowProps {
  onAwardXp?: (amount: number, reason?: string) => void;
  className?: string;
}

export const MemeBreakdownWindow: React.FC<MemeBreakdownWindowProps> = ({
  onAwardXp,
  className = '',
}) => {
  const [offset, setOffset] = useState(0);
  const [activeMeme, setActiveMeme] = useState<ErrorMemeBreakdown>(() => getMemeBreakdownForDay(0));
  const [reactions, setReactions] = useState({ ...activeMeme.reactions });
  const [userReacted, setUserReacted] = useState<Record<string, boolean>>({});
  const [showDeepBreakdown, setShowDeepBreakdown] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleNextMeme = () => {
    const nextOffset = offset + 1;
    setOffset(nextOffset);
    const nextMeme = getMemeBreakdownForDay(nextOffset);
    setActiveMeme(nextMeme);
    setReactions({ ...nextMeme.reactions });
    setUserReacted({});
    playChime('click');
  };

  const handleSelectSpecificMeme = (id: string) => {
    const found = CURATED_ERROR_MEMES.find((m) => m.id === id);
    if (found) {
      setActiveMeme(found);
      setReactions({ ...found.reactions });
      setUserReacted({});
      playChime('click');
    }
  };

  const handleReaction = (type: 'tooReal' | 'didThisToday' | 'neverAgain' | 'bigBrain') => {
    if (userReacted[type]) return;

    setUserReacted((prev) => ({ ...prev, [type]: true }));
    setReactions((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    playChime('success');

    if (type === 'neverAgain' && onAwardXp) {
      onAwardXp(15, 'Overcame Exam Mistake Trap');
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleCopy = () => {
    const text = `😂 ${activeMeme.title}\n"${activeMeme.setup}"\n👉 ${activeMeme.punchline}\n💡 Golden Rule: ${activeMeme.goldenRule}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    playChime('click');
  };

  return (
    <div
      className={`glass-panel rounded-3xl p-5 md:p-6 border border-pink-500/30 bg-gradient-to-br from-purple-950/40 via-slate-900/80 to-pink-950/30 relative overflow-hidden shadow-xl ${className}`}
    >
      {/* Decorative background glow */}
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white text-xl shadow-lg shadow-pink-500/25">
            {activeMeme.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm md:text-base font-bold text-white font-heading">
                Meme Breakdown Window
              </span>
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold border border-pink-500/30 flex items-center gap-1">
                <Laugh className="w-3 h-3" /> Relatable Trap
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Transforming painful exam blunders into laugh-out-loud breakthroughs
            </p>
          </div>
        </div>

        {/* Change meme & copy buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-colors text-xs flex items-center gap-1"
            title="Copy meme breakdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
          </button>

          <button
            onClick={handleNextMeme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-pink-500/20 transition-all active:scale-95"
            title="Show next relatable mistake meme"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Next Meme</span>
          </button>
        </div>
      </div>

      {/* Meme Card Centerpiece */}
      <div className="relative z-10 mt-4 space-y-4">
        {/* Setup and punchline */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm md:text-base font-extrabold text-white">
              {activeMeme.title}
            </h4>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30">
                {activeMeme.tag}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[11px] font-semibold border border-rose-500/30">
                {activeMeme.mistakeCategory}
              </span>
            </div>
          </div>

          <p className="text-xs md:text-sm text-slate-300 font-medium">
            {activeMeme.setup}
          </p>

          <div className="p-3 rounded-xl bg-gradient-to-r from-slate-950 via-pink-950/20 to-slate-950 border border-pink-500/20 text-pink-200 text-xs md:text-sm font-semibold italic">
            "{activeMeme.punchline}"
          </div>
        </div>

        {/* Deep Breakdown Window Section */}
        {showDeepBreakdown && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* The Exam Hall Trap */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-amber-500/20 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>The Exam Hall Trap</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {activeMeme.trapExplanation}
              </p>
            </div>

            {/* Brain's Psychological Blindspot */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-purple-500/20 space-y-1">
              <div className="flex items-center gap-1.5 text-purple-300 text-xs font-bold">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>Cognitive Blindspot</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {activeMeme.brainTrap}
              </p>
            </div>

            {/* Golden Rule Defense */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-emerald-500/20 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                <span>Golden Rule Defense</span>
              </div>
              <p className="text-[11px] text-emerald-200/90 font-medium leading-relaxed">
                {activeMeme.goldenRule}
              </p>
            </div>
          </div>
        )}

        {/* Reaction buttons bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleReaction('tooReal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                userReacted.tooReal
                  ? 'bg-rose-500/30 text-rose-200 border-rose-500/50 shadow-sm'
                  : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 border-slate-700/60'
              }`}
            >
              <span>😭 Too Real</span>
              {userReacted.tooReal && <span className="text-[10px] text-rose-300">✓</span>}
            </button>

            <button
              onClick={() => handleReaction('didThisToday')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                userReacted.didThisToday
                  ? 'bg-amber-500/30 text-amber-200 border-amber-500/50 shadow-sm'
                  : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 border-slate-700/60'
              }`}
            >
              <span>💀 Did This Today</span>
              {userReacted.didThisToday && <span className="text-[10px] text-amber-300">✓</span>}
            </button>

            <button
              onClick={() => handleReaction('neverAgain')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                userReacted.neverAgain
                  ? 'bg-emerald-500/30 text-emerald-200 border-emerald-500/50 shadow-sm'
                  : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 border-slate-700/60'
              }`}
            >
              <span>🧠 Never Again</span>
              {userReacted.neverAgain && <span className="text-[10px] text-emerald-300">✓ Mastered</span>}
            </button>

            <button
              onClick={() => handleReaction('bigBrain')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                userReacted.bigBrain
                  ? 'bg-cyan-500/30 text-cyan-200 border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 border-slate-700/60'
              }`}
            >
              <span>💡 Big Brain</span>
              {userReacted.bigBrain && <span className="text-[10px] text-cyan-300">✓</span>}
            </button>
          </div>

          {/* Quick list of other blunder memes */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400 overflow-x-auto py-1">
            <span className="hidden md:inline mr-1 text-slate-500">Quick Jump:</span>
            {CURATED_ERROR_MEMES.map((m, idx) => (
              <button
                key={m.id}
                onClick={() => handleSelectSpecificMeme(m.id)}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  activeMeme.id === m.id
                    ? 'bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400'
                }`}
                title={m.title}
              >
                #{idx + 1} {m.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
