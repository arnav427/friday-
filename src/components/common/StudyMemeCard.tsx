import React, { useState } from 'react';
import {
  Sparkles,
  Laugh,
  Flame,
  Skull,
  Brain,
  RotateCcw,
  Lightbulb,
  Check,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudyMeme, getMemeForDay } from '../../services/memeService';
import { playChime } from '../../services/soundService';

interface StudyMemeCardProps {
  onAwardXp?: (amount: number, reason?: string) => void;
  compact?: boolean;
}

export const StudyMemeCard: React.FC<StudyMemeCardProps> = ({
  onAwardXp,
  compact = false,
}) => {
  const [offset, setOffset] = useState(0);
  const [meme, setMeme] = useState<StudyMeme>(() => getMemeForDay(0));
  const [reactions, setReactions] = useState<{
    tooReal: number;
    motivated: number;
    skull: number;
    bigBrain: number;
  }>({ ...meme.reactions });
  const [userReacted, setUserReacted] = useState<Record<string, boolean>>({});
  const [showTip, setShowTip] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleNextMeme = () => {
    const nextOffset = offset + 1;
    setOffset(nextOffset);
    const nextMeme = getMemeForDay(nextOffset);
    setMeme(nextMeme);
    setReactions({ ...nextMeme.reactions });
    setUserReacted({});
    setShowTip(false);
    playChime('click');
  };

  const handleReaction = (type: 'tooReal' | 'motivated' | 'skull' | 'bigBrain') => {
    if (userReacted[type]) return;

    setUserReacted((prev) => ({ ...prev, [type]: true }));
    setReactions((prev) => ({ ...prev, [type]: prev[type] + 1 }));

    playChime('success');

    if (type === 'motivated' && onAwardXp) {
      onAwardXp(10, 'Study Meme Energy Boost');
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.8 },
      });
    }
  };

  const handleCopyMeme = () => {
    const text = `😂 ${meme.title}\n\n${meme.setup}\n👉 ${meme.punchline}\n\n— via FRIDAY AI Study Companion`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-3xl p-5 md:p-6 border border-pink-500/30 relative overflow-hidden bg-gradient-to-br from-pink-950/30 via-slate-900/60 to-purple-950/40 shadow-xl group">
      {/* Background ambient glow */}
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between gap-3 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-lg">
            {meme.emoji}
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white font-heading">{meme.title}</span>
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[9px] font-bold uppercase tracking-wider">
                {meme.tag}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Study Stress Buster • Interactive Academic Meme</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyMeme}
            className="p-1.5 rounded-lg bg-slate-900/70 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition-colors"
            title="Share meme text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleNextMeme}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-medium transition-all"
            title="Shuffle to another study meme"
          >
            <RotateCcw className="w-3 h-3 text-pink-400" />
            <span>Next Meme</span>
          </button>
        </div>
      </div>

      {/* Meme Content Card */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-4 relative z-10 space-y-2">
        <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
          {meme.setup}
        </p>
        <div className="p-3 rounded-xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-indigo-950/20 border border-pink-500/30 text-xs md:text-sm font-bold text-white leading-relaxed">
          "{meme.punchline}"
        </div>

        {/* Learning tip dropdown toggle */}
        {meme.tipsOrFormula && (
          <div className="pt-1">
            <button
              onClick={() => setShowTip(!showTip)}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Lightbulb className="w-3 h-3 text-amber-400" />
              <span>{showTip ? 'Hide concept takeaway' : 'Why is this conceptually funny? (Read tip)'}</span>
            </button>
            {showTip && (
              <div className="mt-2 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 animate-in fade-in">
                {meme.tipsOrFormula}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Reactions */}
      <div className="flex flex-wrap items-center gap-2 relative z-10">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1">
          React:
        </span>

        <button
          onClick={() => handleReaction('tooReal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            userReacted.tooReal
              ? 'bg-pink-500 text-white shadow-md shadow-pink-500/25 scale-105'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Laugh className="w-3.5 h-3.5 text-pink-400" />
          <span>Too Real</span>
          {userReacted.tooReal && <span className="text-[10px] text-pink-200">✓</span>}
        </button>

        <button
          onClick={() => handleReaction('motivated')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            userReacted.motivated
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-105 font-bold'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
          title="Click to gain +10 XP"
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Boost Me</span>
          {userReacted.motivated && <span className="text-[10px] text-amber-900 font-bold">✓</span>}
        </button>

        <button
          onClick={() => handleReaction('skull')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            userReacted.skull
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25 scale-105'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Skull className="w-3.5 h-3.5 text-purple-400" />
          <span>I'm Dead</span>
          {userReacted.skull && <span className="text-[10px] text-purple-200">✓</span>}
        </button>

        <button
          onClick={() => handleReaction('bigBrain')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            userReacted.bigBrain
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/25 scale-105'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-cyan-400" />
          <span>Big Brain</span>
          {userReacted.bigBrain && <span className="text-[10px] text-cyan-200">✓</span>}
        </button>
      </div>
    </div>
  );
};
