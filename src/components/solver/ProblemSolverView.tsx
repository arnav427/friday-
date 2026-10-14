import React, { useState, useRef } from 'react';
import {
  Calculator,
  Upload,
  Mic,
  MicOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  ArrowRight,
  ImageIcon,
  X,
  FileText,
  Globe,
  Search,
  ExternalLink,
} from 'lucide-react';
import { solveProblem, solveWithGoogleSearchGrounding } from '../../services/geminiService';
import { KaTeXRenderer } from '../common/KaTeXRenderer';
import { SupportedLanguage } from '../../types';

interface ProblemSolverViewProps {
  userLanguage: SupportedLanguage;
  targetExamLabel: string;
  onPracticeSimilar: (problemText: string) => void;
}

export const ProblemSolverView: React.FC<ProblemSolverViewProps> = ({
  userLanguage,
  targetExamLabel,
  onPracticeSimilar,
}) => {
  const [solverMode, setSolverMode] = useState<'standard' | 'google_search'>('standard');
  const [problemText, setProblemText] = useState(
    'A stone is thrown horizontally from the top of a cliff of height 45 m with an initial speed of 15 m/s. Taking g = 10 m/s^2, find the time taken to reach the ground and the speed with which it strikes the ground.'
  );
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Standard solver state
  const [solutionResult, setSolutionResult] = useState<any | null>(null);

  // Google Search Grounding state
  const [searchGroundedResult, setSearchGroundedResult] = useState<{
    solution: string;
    sources: Array<{ title: string; url: string }>;
    webSearchQueries: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage({
        base64: reader.result as string,
        mimeType: file.type || 'image/png',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSolve = async () => {
    if (!problemText.trim() && !selectedImage) return;
    setLoading(true);

    try {
      if (solverMode === 'google_search') {
        const res = await solveWithGoogleSearchGrounding({
          query: problemText,
          subject: 'STEM Mechanics',
          examLevel: targetExamLabel,
          language: userLanguage,
        });
        setSearchGroundedResult(res);
      } else {
        const res = await solveProblem({
          problemText,
          image: selectedImage || undefined,
          examLevel: targetExamLabel,
          language: userLanguage,
        });
        setSolutionResult(res);
      }
    } catch (err) {
      console.error('Solve error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white font-heading flex items-center gap-2">
            <Calculator className="w-6 h-6 text-amber-400" /> Multimodal Problem Solver & Verifier
          </h1>
          <p className="text-xs text-slate-400">
            Derive mathematical proofs, check against official national exam keys, and query real-time Google Search sources.
          </p>
        </div>

        {/* Tab Switcher: Standard Solver vs Google Search Grounding */}
        <div className="flex rounded-2xl bg-slate-900 border border-slate-800 p-1 text-xs font-semibold">
          <button
            onClick={() => setSolverMode('standard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              solverMode === 'standard'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI Verified Derivation</span>
          </button>

          <button
            onClick={() => setSolverMode('google_search')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              solverMode === 'google_search'
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-300" />
            <span>Google Search Grounding</span>
          </button>
        </div>
      </div>

      {/* Input Card */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4">
        {/* Mode Indicator Banner */}
        {solverMode === 'google_search' ? (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-cyan-950/20 border border-cyan-500/30 flex items-center justify-between text-xs text-cyan-200">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>
                <strong>Google Search Grounding Enabled:</strong> Gemini 3.8 Flash queries live web databases, PYQs, and official NCERT textbook answer keys.
              </span>
            </div>
            <span className="hidden md:inline px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
              gemini-3.8-flash + googleSearch
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>
                <strong>Two-Pass AI Verification:</strong> Second model call independently calculates and compares sign conventions and numerical tolerances.
              </span>
            </div>
            <span className="hidden md:inline px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">
              IRT Double-Pass
            </span>
          </div>
        )}

        {selectedImage && (
          <div className="relative inline-block rounded-2xl overflow-hidden border border-slate-700 max-h-48">
            <img src={selectedImage.base64} alt="Problem preview" className="max-h-48 object-contain" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Problem Statement / Question Formulation:
          </label>
          <textarea
            rows={4}
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
            placeholder="Type or paste question statement here (e.g. 'A stone is thrown horizontally...')"
            className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs md:text-sm focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold"
            >
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>Attach Diagram / Photo</span>
            </button>
          </div>

          <button
            onClick={handleSolve}
            disabled={loading || (!problemText.trim() && !selectedImage)}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs hover:opacity-90 disabled:opacity-40 flex items-center gap-2 shadow-lg transition-all ${
              solverMode === 'google_search'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-blue-500/20'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-amber-500/20'
            }`}
          >
            {loading ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : solverMode === 'google_search' ? (
              <Globe className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>
              {solverMode === 'google_search'
                ? 'Search Google & Solve'
                : 'Solve & Double-Verify'}
            </span>
          </button>
        </div>
      </div>

      {/* 1. GOOGLE SEARCH GROUNDED OUTPUT */}
      {solverMode === 'google_search' && searchGroundedResult && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-3 h-3 text-cyan-400" /> Google Grounded Response
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Web Verified
                </span>
              </div>
              <h2 className="text-lg font-bold text-white font-heading">
                Grounded Examination Reference & Solution
              </h2>
            </div>
          </div>

          {/* Search Queries Executed */}
          {searchGroundedResult.webSearchQueries?.length > 0 && (
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-cyan-400" /> Google Search Queries Triggered:
              </div>
              <div className="flex flex-wrap gap-2">
                {searchGroundedResult.webSearchQueries.map((q, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300"
                  >
                    "{q}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Solution Body */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <KaTeXRenderer content={searchGroundedResult.solution} />
          </div>

          {/* Web Sources & Citations */}
          {searchGroundedResult.sources?.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400" /> Grounded Web Sources & Official Citations:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {searchGroundedResult.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between text-xs text-slate-300 hover:text-white transition-all group"
                  >
                    <span className="truncate pr-2 font-medium">{src.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. STANDARD AI DERIVATION & VERIFICATION OUTPUT */}
      {solverMode === 'standard' && solutionResult && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl space-y-6 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-semibold text-[10px] uppercase">
                  Concept: {solutionResult.concept_used}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Solution
                </span>
              </div>
              <h2 className="text-lg font-bold text-white font-heading">
                Step-by-Step Mathematical Derivation
              </h2>
            </div>

            <button
              onClick={() => onPracticeSimilar(solutionResult.similar_practice_problem)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              Practice Similar Problem →
            </button>
          </div>

          {/* Given Data Chips */}
          {solutionResult.given_data?.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Given Parameters:
              </div>
              <div className="flex flex-wrap gap-2">
                {solutionResult.given_data.map((item: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 text-xs font-mono"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Derivation Steps */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <KaTeXRenderer content={solutionResult.step_by_step_solution} />
          </div>

          {/* Final Answer Highlight Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-2 border-emerald-500/40 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                Final Result / Boxed Answer
              </div>
              <div className="text-base md:text-lg font-black text-white font-mono mt-0.5">
                <KaTeXRenderer content={solutionResult.final_answer} />
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Alternate Method & Common Pitfalls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {solutionResult.alternate_method && (
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 mb-2">
                  <Lightbulb className="w-4 h-4" /> Alternate Shortcut / Verification Method
                </div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  <KaTeXRenderer content={solutionResult.alternate_method} />
                </div>
              </div>
            )}

            {solutionResult.common_mistakes?.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400 mb-2">
                  <AlertTriangle className="w-4 h-4" /> Common Student Pitfalls & Traps
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc ml-4">
                  {solutionResult.common_mistakes.map((m: string, i: number) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
