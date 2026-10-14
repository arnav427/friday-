import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  AlertOctagon,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Tag,
  HelpCircle,
} from 'lucide-react';
import {
  ErrorType,
  ErrorSeverity,
  StudentError,
  saveStudentError,
} from '../../services/errorBookService';
import { playChime } from '../../services/soundService';

interface AddErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: (newErr: StudentError) => void;
  targetExamLabel?: string;
}

const ERROR_TYPES: ErrorType[] = [
  'Conceptual Gap',
  'Calculation Slip',
  'Misread Question / Silly',
  'Formula Confusion',
  'Time Pressure Panic',
  'Unit / Sign Error',
];

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'General Aptitude'];

export const AddErrorModal: React.FC<AddErrorModalProps> = ({
  isOpen,
  onClose,
  onAdded,
  targetExamLabel,
}) => {
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [errorType, setErrorType] = useState<ErrorType>('Calculation Slip');
  const [questionContext, setQuestionContext] = useState('');
  const [studentAttempt, setStudentAttempt] = useState('');
  const [correctConcept, setCorrectConcept] = useState('');
  const [keyTakeaway, setKeyTakeaway] = useState('');
  const [severity, setSeverity] = useState<ErrorSeverity>('High');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Exam Prep']);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tToRemove: string) => {
    setTags(tags.filter((t) => t !== tToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !questionContext.trim()) return;

    const newError = saveStudentError({
      title: title.trim(),
      subject,
      topic: topic.trim() || 'General',
      errorType,
      questionContext: questionContext.trim(),
      studentAttempt: studentAttempt.trim() || 'N/A',
      correctConcept: correctConcept.trim() || 'Refer to standard derivation.',
      keyTakeaway: keyTakeaway.trim() || 'Always double check before bubbling OMR.',
      severity,
      status: 'Needs Revision',
      tags,
      source: 'Self Logged',
    });

    playChime('success');
    onAdded(newError);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel rounded-3xl border border-rose-500/30 p-6 md:p-8 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/25">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                Log Error in Mistake Notebook
              </h3>
              <p className="text-xs text-slate-400">
                Transform your blunder into permanent understanding {targetExamLabel && `for ${targetExamLabel}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs md:text-sm">
          {/* Subject & Error Classification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Error Trap Type</label>
              <select
                value={errorType}
                onChange={(e) => setErrorType(e.target.value as ErrorType)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              >
                {ERROR_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Topic & Error Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Topic / Chapter</label>
              <input
                type="text"
                placeholder="e.g. Rotational Motion / Thermodynamics"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mistake Summary Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Forgot negative sign on restoring force"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Question context */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              What was the Question asking? *
            </label>
            <textarea
              required
              rows={2}
              placeholder="State the core problem statement or numbers involved..."
              value={questionContext}
              onChange={(e) => setQuestionContext(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* What I did wrong vs Right way */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-rose-300 font-semibold mb-1">
                ❌ What Did I Do Wrong?
              </label>
              <textarea
                rows={2}
                placeholder="e.g. I multiplied by 2 instead of dividing; used sin instead of cos..."
                value={studentAttempt}
                onChange={(e) => setStudentAttempt(e.target.value)}
                className="w-full bg-slate-950 border border-rose-500/30 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-emerald-300 font-semibold mb-1">
                ✅ Correct Concept / Approach
              </label>
              <textarea
                rows={2}
                placeholder="e.g. F = -kx implies negative work during displacement; normal reaction is mg cosθ..."
                value={correctConcept}
                onChange={(e) => setCorrectConcept(e.target.value)}
                className="w-full bg-slate-950 border border-emerald-500/30 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Golden Rule Key Takeaway */}
          <div>
            <label className="block text-amber-300 font-semibold mb-1">
              🎯 Golden Rule to Never Repeat This in Exam
            </label>
            <input
              type="text"
              placeholder="e.g. Always draw the free-body diagram before writing equations!"
              value={keyTakeaway}
              onChange={(e) => setKeyTakeaway(e.target.value)}
              className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Severity & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mistake Severity</label>
              <div className="flex items-center gap-2">
                {(['High', 'Medium', 'Low'] as ErrorSeverity[]).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      severity === sev
                        ? sev === 'High'
                          ? 'bg-rose-500/30 text-rose-200 border-rose-500/60'
                          : sev === 'Medium'
                          ? 'bg-amber-500/30 text-amber-200 border-amber-500/60'
                          : 'bg-emerald-500/30 text-emerald-200 border-emerald-500/60'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tags</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add tag (e.g. OMR)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Tags list */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs border border-indigo-500/30"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save into Error Book</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
