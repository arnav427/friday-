import React, { useState } from 'react';
import {
  Video,
  FileText,
  Sparkles,
  Clock,
  Download,
  Copy,
  Check,
  HelpCircle,
  BookmarkPlus,
  Play,
  Languages,
} from 'lucide-react';
import { summarizeContent } from '../../services/geminiService';
import { addDocument } from '../../services/knowledgeBaseService';
import { KaTeXRenderer } from '../common/KaTeXRenderer';
import { SupportedLanguage } from '../../types';

interface SummarizerViewProps {
  userLanguage: SupportedLanguage;
  onGenerateQuizFromNotes: (topic: string, subject: string) => void;
  onGenerateFlashcards: (topic: string, notes: string) => void;
}

export const SummarizerView: React.FC<SummarizerViewProps> = ({
  userLanguage,
  onGenerateQuizFromNotes,
  onGenerateFlashcards,
}) => {
  const [sourceType, setSourceType] = useState<'youtube' | 'notes'>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('https://www.youtube.com/watch?v=friday_physics_ch4');
  const [notesInput, setNotesInput] = useState(
    'A projectile is an object in flight under gravitational acceleration. Horizontal velocity remains constant (u_x = u cos θ). Vertical motion is governed by v_y = u sin θ - gt. Time of flight is T = (2 u sin θ)/g. Maximum height is H = (u^2 sin^2 θ)/(2g). Range is R = (u^2 sin 2θ)/g.'
  );
  const [loading, setLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [addedToKnowledge, setAddedToKnowledge] = useState(false);

  const handleGenerateSummary = async () => {
    setLoading(true);
    setAddedToKnowledge(false);
    try {
      const result = await summarizeContent({
        content: sourceType === 'notes' ? notesInput : `YouTube Video Source: ${youtubeUrl}`,
        youtubeUrl: sourceType === 'youtube' ? youtubeUrl : undefined,
        targetLanguage: userLanguage,
      });
      setSummaryResult(result);
    } catch (err) {
      console.error('Summary error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToKnowledgeBase = () => {
    if (!summaryResult) return;
    addDocument(
      summaryResult.title || 'Synthesized Video Notes',
      sourceType === 'youtube' ? 'youtube' : 'notes',
      'Physics',
      summaryResult.detailed_notes || summaryResult.tldr,
      youtubeUrl
    );
    setAddedToKnowledge(true);
  };

  const handleDownloadMarkdown = () => {
    if (!summaryResult) return;
    const md = `# ${summaryResult.title}

## TL;DR
${summaryResult.tldr}

## Key Concepts
${summaryResult.key_concepts?.map((c: string) => `- ${c}`).join('\n')}

## Detailed Notes
${summaryResult.detailed_notes}

## Exam Highlights
${summaryResult.exam_highlights?.map((h: string) => `- ${h}`).join('\n')}
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summaryResult.title.replace(/\s+/g, '_')}_Notes.md`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-white font-heading flex items-center gap-2">
          <Video className="w-6 h-6 text-violet-400" /> Video & Lecture Notes Synthesizer
        </h1>
        <p className="text-xs text-slate-400">
          Transform YouTube lectures, slides, and notes into timestamped chapter outlines, formulas, and instant study tools.
        </p>
      </div>

      {/* Input Box Card */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setSourceType('youtube')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              sourceType === 'youtube'
                ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" /> YouTube Video URL
          </button>
          <button
            onClick={() => setSourceType('notes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              sourceType === 'notes'
                ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" /> Raw Notes / Textbook Excerpt
          </button>
        </div>

        {sourceType === 'youtube' ? (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Paste YouTube Video Link:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs md:text-sm focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={handleGenerateSummary}
                disabled={loading || !youtubeUrl.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 disabled:opacity-40 flex items-center gap-2 shadow-lg shadow-violet-500/20"
              >
                {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Summarize Video</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Paste Lecture Text / PDF Excerpt:
            </label>
            <textarea
              rows={4}
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Paste notes, formula lists, or textbook chapter excerpts..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs md:text-sm focus:outline-none focus:border-violet-500"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleGenerateSummary}
                disabled={loading || !notesInput.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 disabled:opacity-40 flex items-center gap-2"
              >
                {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Synthesize Notes</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Output */}
      {summaryResult && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Action Toolbar */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-bold text-white font-heading">
              {summaryResult.title}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onGenerateFlashcards(summaryResult.title, summaryResult.detailed_notes)}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold"
              >
                ⚡ Generate Flashcards
              </button>
              <button
                onClick={() => onGenerateQuizFromNotes(summaryResult.title, 'Physics')}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold"
              >
                🎓 Generate Quiz
              </button>
              <button
                onClick={handleAddToKnowledgeBase}
                disabled={addedToKnowledge}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1"
              >
                {addedToKnowledge ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                <span>{addedToKnowledge ? 'Added to Knowledge Base' : 'Add to Knowledge Base'}</span>
              </button>
              <button
                onClick={handleDownloadMarkdown}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
                title="Download Markdown"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 cols: Detailed Notes & Formulas */}
            <div className="lg:col-span-2 space-y-6">
              {/* TL;DR */}
              <div className="glass-panel rounded-3xl p-6 border border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  TL;DR (Executive Summary)
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {summaryResult.tldr}
                </p>
              </div>

              {/* Detailed Notes */}
              <div className="glass-panel rounded-3xl p-6 border border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Detailed Formatted Notes
                </h3>
                <div className="prose-sm text-slate-200 leading-relaxed">
                  <KaTeXRenderer content={summaryResult.detailed_notes} />
                </div>
              </div>

              {/* Formulas & Definitions */}
              {summaryResult.formulas_and_definitions?.length > 0 && (
                <div className="glass-panel rounded-3xl p-6 border border-slate-800">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    Key Formulas & Mathematical Relationships
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {summaryResult.formulas_and_definitions.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800"
                      >
                        <div className="text-xs font-bold text-indigo-300 mb-1">{item.term}</div>
                        <div className="text-xs text-white my-1 font-mono">
                          <KaTeXRenderer content={item.definitionOrFormula} />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">{item.significance}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 1 col: Chapter Timestamps & Exam Highlights */}
            <div className="space-y-6">
              {/* Chapter Timeline */}
              {summaryResult.chapter_outline?.length > 0 && (
                <div className="glass-panel rounded-3xl p-6 border border-slate-800">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-400" /> Chapter Timestamps
                  </h3>
                  <div className="space-y-3">
                    {summaryResult.chapter_outline.map((ch: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5"
                      >
                        <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-[11px] font-bold shrink-0">
                          {ch.timestamp}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-200">{ch.title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{ch.summary}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exam Highlights */}
              {summaryResult.exam_highlights?.length > 0 && (
                <div className="glass-panel rounded-3xl p-6 border border-slate-800">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                    High-Yield Exam Highlights
                  </h3>
                  <div className="space-y-2">
                    {summaryResult.exam_highlights.map((h: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2"
                      >
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
