import React, { useState } from 'react';
import {
  Sparkles,
  Quote,
  RotateCcw,
  Volume2,
  VolumeX,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { getDailyQuote, MotivationalQuote } from '../../services/motivationService';

interface DailyMotivationBannerProps {
  userLanguage?: string;
}

export const DailyMotivationBanner: React.FC<DailyMotivationBannerProps> = ({ userLanguage = 'English' }) => {
  const [quoteOffset, setQuoteOffset] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentQuote: MotivationalQuote = getDailyQuote(quoteOffset);

  const handleNextQuote = () => {
    setQuoteOffset((prev) => prev + 1);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSpeakQuote = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `${currentQuote.quote} — ${currentQuote.author}. ${currentQuote.actionPrompt}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = userLanguage === 'Hindi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="glass-panel rounded-3xl p-5 md:p-6 border border-indigo-500/30 relative overflow-hidden bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-cyan-950/40 shadow-xl group">
      {/* Glow highlight */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Quote content */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/25">
            <Quote className="w-5 h-5 fill-white" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> Daily Motivation
              </span>
              <span className="text-[11px] text-indigo-300 font-semibold">
                • {currentQuote.category}
              </span>
            </div>

            <p className="text-sm md:text-base font-medium text-slate-100 italic leading-relaxed">
              "{currentQuote.quote}"
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-300 to-white font-heading">
                — {currentQuote.author}
              </span>
              <span className="hidden sm:inline text-slate-400 font-normal">
                | <span className="text-amber-300 font-medium">💡 Tip:</span> {currentQuote.actionPrompt}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            onClick={handleSpeakQuote}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
              isSpeaking
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700/60'
            }`}
            title={isSpeaking ? 'Stop Audio' : 'Listen to Quote'}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={handleNextQuote}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-semibold transition-all"
            title="Next inspirational quote"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Next Spark</span>
          </button>
        </div>
      </div>
    </div>
  );
};
