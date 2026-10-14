import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  Volume2,
  FileText,
  HelpCircle,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Flashcard, SupportedLanguage, UserProfile } from '../../types';
import { KaTeXRenderer } from '../common/KaTeXRenderer';
import { calculateSM2 } from '../../services/bktService';
import { playChime } from '../../services/soundService';
import { StudyMemeCard } from '../common/StudyMemeCard';

interface RevisionToolsViewProps {
  user: UserProfile;
  userLanguage: SupportedLanguage;
  weakTopics: string[];
}

export const RevisionToolsView: React.FC<RevisionToolsViewProps> = ({
  user,
  userLanguage,
  weakTopics,
}) => {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'cheatsheet' | 'pyq' | 'memes'>('flashcards');

  // Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: 'fc_1',
      topic: 'Kinematics',
      subject: 'Physics',
      front: 'What is the horizontal range of a projectile projected at angle $\\theta$ with speed $u$?',
      back: 'Horizontal Range $R = \\frac{u^2 \\sin(2\\theta)}{g}$. It is maximum when $\\theta = 45^\\circ$ ($R_{\\max} = \\frac{u^2}{g}$).',
      formulaOrLatex: 'R = \\frac{u^2 \\sin(2\\theta)}{g}',
      repetition: 1,
      interval: 1,
      easeFactor: 2.5,
      dueDate: new Date().toISOString(),
    },
    {
      id: 'fc_2',
      topic: 'Laws of Motion',
      subject: 'Physics',
      front: 'Define limiting static friction and state its formula.',
      back: 'Limiting static friction is the maximum resistive force before relative motion starts: $f_{s,\\max} = \\mu_s N$, where $N$ is normal reaction.',
      formulaOrLatex: 'f_{s,\\max} = \\mu_s N',
      repetition: 0,
      interval: 1,
      easeFactor: 2.5,
      dueDate: new Date().toISOString(),
    },
    {
      id: 'fc_3',
      topic: 'Calculus',
      subject: 'Mathematics',
      front: 'What is the derivative of $\\tan(x)$ and $\\ln(x)$ with respect to $x$?',
      back: '$\\frac{d}{dx}(\\tan x) = \\sec^2 x$ and $\\frac{d}{dx}(\\ln x) = \\frac{1}{x}$ for $x > 0$.',
      formulaOrLatex: '\\frac{d}{dx}\\tan x = \\sec^2 x',
      repetition: 2,
      interval: 6,
      easeFactor: 2.6,
      dueDate: new Date().toISOString(),
    },
    {
      id: 'fc_4',
      topic: 'Current Electricity',
      subject: 'Physics',
      front: 'State the relationship between current density $j$, drift velocity $v_d$, and electric field $E$.',
      back: '$j = n e v_d = \\sigma E$, where $v_d = \\frac{e E \\tau}{m}$ and $\\sigma$ is electrical conductivity.',
      formulaOrLatex: 'j = n e v_d = \\sigma E',
      repetition: 1,
      interval: 2,
      easeFactor: 2.5,
      dueDate: new Date().toISOString(),
    },
  ]);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeakingBrief, setIsSpeakingBrief] = useState(false);

  const curCard = flashcards[currentCardIndex];

  // SM-2 Spaced Repetition response: Again (1), Hard (3), Good (4), Easy (5)
  const handleRateCard = (quality: number) => {
    if (!curCard) return;
    playChime('click');

    const sm2 = calculateSM2(quality, curCard.repetition, curCard.interval, curCard.easeFactor);

    setFlashcards((prev) =>
      prev.map((c, i) =>
        i === currentCardIndex
          ? {
              ...c,
              repetition: sm2.repetition,
              interval: sm2.interval,
              easeFactor: sm2.easeFactor,
              dueDate: sm2.nextReviewDate,
            }
          : c
      )
    );

    setIsFlipped(false);
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  // Audio revision brief synthesis
  const handlePlayAudioBrief = () => {
    if (!window.speechSynthesis) return;
    if (isSpeakingBrief) {
      window.speechSynthesis.cancel();
      setIsSpeakingBrief(false);
      return;
    }

    const briefText = `Here is your high-yield audio revision brief for ${user.path === 'competitive' ? user.competitiveExam : user.grade}. First: Projectile motion horizontal range equals u squared sine 2 theta divided by g, maximum at 45 degrees. Second: Newton's second law: force equals mass times acceleration or rate of change of momentum. Limiting static friction equals mu times normal reaction. Third: In current electricity, current density equals n e v d, and drift velocity depends linearly on relaxation time tau. Keep these formulas fresh!`;

    const utterance = new SpeechSynthesisUtterance(briefText);
    utterance.lang = userLanguage === 'Hindi' ? 'hi-IN' : 'en-US';
    utterance.onend = () => setIsSpeakingBrief(false);
    setIsSpeakingBrief(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white font-heading flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-300" /> Rapid Revision & Memory Tools
          </h1>
          <p className="text-xs text-slate-400">
            SuperMemo SM-2 flashcard scheduler, one-page formula cheat sheets, and 2-minute audio briefs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayAudioBrief}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              isSpeakingBrief
                ? 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse'
                : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isSpeakingBrief ? 'Pause Audio Brief' : 'Play 2-Min Audio Brief'}</span>
          </button>

          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'flashcards' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Flashcards
            </button>
            <button
              onClick={() => setActiveTab('cheatsheet')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'cheatsheet' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Formula Cheat Sheet
            </button>
            <button
              onClick={() => setActiveTab('pyq')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'pyq' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              PYQs Bank
            </button>
            <button
              onClick={() => setActiveTab('memes')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'memes' ? 'bg-pink-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Study Memes
            </button>
          </div>
        </div>
      </div>

      {/* 1. FLASHCARDS TAB */}
      {activeTab === 'flashcards' && curCard && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>
              Card {currentCardIndex + 1} of {flashcards.length} • {curCard.subject}
            </span>
            <span>Interval: {curCard.interval}d • Reps: {curCard.repetition}</span>
          </div>

          {/* Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[260px] glass-panel rounded-3xl p-8 border border-slate-700/80 shadow-2xl flex flex-col justify-between cursor-pointer hover:border-indigo-500/60 transition-all select-none relative group"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>{curCard.topic}</span>
              <span className="text-indigo-400 font-semibold group-hover:underline">
                {isFlipped ? 'Answer (Click to flip back)' : 'Click to reveal answer ↺'}
              </span>
            </div>

            <div className="my-6 text-center">
              {!isFlipped ? (
                <div className="text-base md:text-lg font-medium text-white leading-relaxed">
                  <KaTeXRenderer content={curCard.front} />
                </div>
              ) : (
                <div className="text-sm md:text-base text-cyan-200 leading-relaxed animate-in fade-in duration-150">
                  <KaTeXRenderer content={curCard.back} />
                </div>
              )}
            </div>

            <div className="text-center text-[10px] text-slate-500">
              SM-2 Algorithm calibrates next interval by difficulty rating
            </div>
          </div>

          {/* SM-2 Rating Buttons */}
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => handleRateCard(1)}
              className="p-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all text-center"
            >
              <div>Again</div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">1 day</div>
            </button>
            <button
              onClick={() => handleRateCard(3)}
              className="p-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all text-center"
            >
              <div>Hard</div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">2 days</div>
            </button>
            <button
              onClick={() => handleRateCard(4)}
              className="p-3 rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-bold transition-all text-center"
            >
              <div>Good</div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">4 days</div>
            </button>
            <button
              onClick={() => handleRateCard(5)}
              className="p-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all text-center"
            >
              <div>Easy</div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">7 days</div>
            </button>
          </div>
        </div>
      )}

      {/* 2. CHEAT SHEET TAB */}
      {activeTab === 'cheatsheet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-heading text-indigo-300">
              Physics Mechanics High-Yield Formula Sheet
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-semibold text-slate-200">Projectile Range & Height</div>
                <KaTeXRenderer content={"$$R = \\frac{u^2 \\sin 2\\theta}{g}, \\quad H = \\frac{u^2 \\sin^2\\theta}{2g}$$"} />
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-semibold text-slate-200">Work Energy Theorem</div>
                <KaTeXRenderer content={"$$W_{\\text{net}} = \\Delta K = \\frac{1}{2}m v_f^2 - \\frac{1}{2}m v_i^2$$"} />
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-semibold text-slate-200">Centripetal Force & Banking Angle</div>
                <KaTeXRenderer content={"$$F_c = \\frac{mv^2}{r}, \\quad \\tan\\theta = \\frac{v^2}{rg}$$"} />
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-heading text-cyan-300">
              Calculus & Trigonometry Shortcuts
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-semibold text-slate-200">Limits Standard Identities</div>
                <KaTeXRenderer content={"$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1, \\quad \\lim_{x \\to 0} \\frac{1 - \\cos x}{x^2} = \\frac{1}{2}$$"} />
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-semibold text-slate-200">Integration by Parts</div>
                <KaTeXRenderer content={"$$\\int u \\, dv = u v - \\int v \\, du$$"} />
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-semibold text-slate-200">Differential Product & Quotient Rule</div>
                <KaTeXRenderer content={"$$\\left(\\frac{u}{v}\\right)' = \\frac{u'v - u v'}{v^2}$$"} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PYQ BANK TAB */}
      {activeTab === 'pyq' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>
              Target Exam Bank: <strong>{user.path === 'competitive' ? user.competitiveExam : user.board}</strong>
            </span>
            <span className="text-cyan-400 font-semibold">1,240 Verified Questions Available</span>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                {user.path === 'competitive' ? user.competitiveExam : 'Board Exam'} PYQ 2024
              </span>
              <span className="text-xs text-amber-400 font-semibold">Difficulty: Medium</span>
            </div>
            <p className="text-sm text-slate-200">
              A block of mass 5 kg is placed on a rough horizontal plane. A force of 20 N is applied at 30° to horizontal. If coefficient of static friction is 0.4, find the frictional force developed.
            </p>
            <div className="pt-2 flex justify-end">
              <button className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold">
                Solve with Verifier →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MEMES & STRESS BUSTER TAB */}
      {activeTab === 'memes' && (
        <div className="max-w-xl mx-auto space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>
              Take a 2-minute laughter break! Proven to lower cortisol and improve conceptual retention.
            </span>
            <span className="text-pink-400 font-semibold shrink-0 ml-2">Energy Refresh</span>
          </div>
          <StudyMemeCard />
        </div>
      )}
    </div>
  );
};
