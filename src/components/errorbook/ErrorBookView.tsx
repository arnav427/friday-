import React, { useState, useEffect, useMemo } from 'react';
import {
  BookX,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Trash2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Tag,
  BookOpen,
  Laugh,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { NavTab } from '../common/Sidebar';
import {
  StudentError,
  ErrorType,
  ErrorStatus,
  getStudentErrors,
  updateStudentError,
  deleteStudentError,
  getErrorStats,
  loadSeedErrors,
  clearStudentErrors,
} from '../../services/errorBookService';
import { MemeBreakdownWindow } from './MemeBreakdownWindow';
import { AddErrorModal } from './AddErrorModal';
import { playChime } from '../../services/soundService';

interface ErrorBookViewProps {
  user: UserProfile;
  targetExamLabel: string;
  onNavigate: (tab: NavTab) => void;
  onAwardXp?: (amount: number, reason?: string) => void;
  onAskTutorWithContext?: (query: string) => void;
}

export const ErrorBookView: React.FC<ErrorBookViewProps> = ({
  user,
  targetExamLabel,
  onNavigate,
  onAwardXp,
  onAskTutorWithContext,
}) => {
  const [errors, setErrors] = useState<StudentError[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [showMemeWindow, setShowMemeWindow] = useState(true);

  // Load errors from localStorage
  useEffect(() => {
    setErrors(getStudentErrors());
  }, []);

  const stats = useMemo(() => getErrorStats(errors), [errors]);

  // Filtered list
  const filteredErrors = useMemo(() => {
    return errors.filter((err) => {
      const matchesSearch =
        searchQuery === '' ||
        err.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        err.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        err.questionContext.toLowerCase().includes(searchQuery.toLowerCase()) ||
        err.keyTakeaway.toLowerCase().includes(searchQuery.toLowerCase()) ||
        err.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSubject = selectedSubject === 'All' || err.subject === selectedSubject;
      const matchesType = selectedType === 'All' || err.errorType === selectedType;
      const matchesStatus = selectedStatus === 'All' || err.status === selectedStatus;

      return matchesSearch && matchesSubject && matchesType && matchesStatus;
    });
  }, [errors, searchQuery, selectedSubject, selectedType, selectedStatus]);

  const handleStatusChange = (id: string, newStatus: ErrorStatus) => {
    const updated = updateStudentError(id, {
      status: newStatus,
      reviewCount: (errors.find((e) => e.id === id)?.reviewCount || 0) + 1,
    });
    if (updated) {
      setErrors((prev) => prev.map((e) => (e.id === id ? updated : e)));
      playChime('success');
      if (newStatus === 'Mastered' && onAwardXp) {
        onAwardXp(20, 'Mastered Exam Mistake from Error Book');
      }
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this mistake log from your Error Book?')) {
      deleteStudentError(id);
      setErrors((prev) => prev.filter((e) => e.id !== id));
      playChime('click');
    }
  };

  const handleReviewIncrement = (id: string) => {
    const current = errors.find((e) => e.id === id);
    if (!current) return;
    const updated = updateStudentError(id, {
      reviewCount: current.reviewCount + 1,
    });
    if (updated) {
      setErrors((prev) => prev.map((e) => (e.id === id ? updated : e)));
      playChime('click');
      if (onAwardXp) {
        onAwardXp(5, 'Reviewed Mistake in Error Book');
      }
    }
  };

  const handleAskTutorAboutError = (err: StudentError) => {
    const query = `In my Error Book for ${err.subject} (${err.topic}), I made this mistake: "${err.title}". The question was: "${err.questionContext}". My wrong attempt was: "${err.studentAttempt}". Please explain why this trap occurs and generate 1 similar tricky practice question to test if I have mastered it.`;
    if (onAskTutorWithContext) {
      onAskTutorWithContext(query);
    }
    onNavigate('tutor');
  };

  const subjectsList = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology'];
  const errorTypesList: (string | ErrorType)[] = [
    'All',
    'Conceptual Gap',
    'Calculation Slip',
    'Misread Question / Silly',
    'Formula Confusion',
    'Time Pressure Panic',
    'Unit / Sign Error',
  ];

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-rose-500/25 relative overflow-hidden bg-gradient-to-r from-rose-950/40 via-slate-900/60 to-purple-950/40 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -top-10 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 flex items-center gap-1.5">
                <BookX className="w-4 h-4 text-rose-400" />
                <span>Mistake Notebook (Galti Diary)</span>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                {targetExamLabel}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white font-heading">
              Student Error Book
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Every ranker's secret weapon: log calculation slips, conceptual traps, and misread questions. Review them until they transform into your highest scoring strengths.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowMemeWindow(!showMemeWindow)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition-all shadow-md ${
                showMemeWindow
                  ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 shadow-pink-500/10'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <Laugh className="w-4 h-4 text-pink-400" />
              <span>{showMemeWindow ? 'Hide Meme Breakdown' : 'Show Meme Breakdown'}</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log New Error</span>
            </button>
          </div>
        </div>

        {/* 2. Error Book Metrics Quick Bar or Clean Status */}
        {stats.total > 0 ? (
          <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Total Errors Logged
              </div>
              <div className="text-xl font-black text-white font-heading mt-0.5">
                {stats.total}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/30">
              <div className="text-[11px] uppercase tracking-wider text-rose-300 font-semibold">
                Needs Revision
              </div>
              <div className="text-xl font-black text-rose-400 font-heading mt-0.5">
                {stats.needsRevision}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
              <div className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold">
                Mastered Traps
              </div>
              <div className="text-xl font-black text-emerald-400 font-heading mt-0.5">
                {stats.mastered}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30">
              <div className="text-[11px] uppercase tracking-wider text-purple-300 font-semibold">
                Top Recurring Pitfall
              </div>
              <div className="text-xs font-bold text-purple-200 mt-1 truncate">
                {stats.criticalTrap}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Your error book is currently clean — no pending mistakes!</span>
            </div>
            <button
              onClick={() => {
                const loaded = loadSeedErrors();
                setErrors(loaded);
                playChime('click');
              }}
              className="text-[11px] text-rose-300 hover:text-white underline font-semibold transition-colors"
            >
              Load Example Tricky Traps (Optional)
            </button>
          </div>
        )}
      </div>

      {/* 3. The Meme Breakdown Window (Entertain & Educate Students, Changes dynamically) */}
      {showMemeWindow && (
        <div className="animate-in fade-in slide-in-from-top-3 duration-300">
          <MemeBreakdownWindow onAwardXp={onAwardXp} />
        </div>
      )}

      {/* 4. Filter & Search Controls */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3 bg-slate-900/60">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search mistakes by keyword, topic, or golden rule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/90 border border-slate-700/80 text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {subjectsList.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSubject === sub
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Second row filters: Type & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-rose-500"
            >
              {errorTypesList.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Status:</span>
            <div className="flex items-center gap-1">
              {['All', 'Needs Revision', 'Reviewed', 'Mastered'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-2.5 py-0.5 rounded-lg transition-all ${
                    selectedStatus === status
                      ? 'bg-indigo-500/30 text-indigo-200 font-bold border border-indigo-500/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Error Logs List */}
      <div className="space-y-4">
        {filteredErrors.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800 space-y-3">
            <BookX className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No mistakes found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No errors match your current filters. Log mistakes regularly after solving problems or mock tests to turn your weaknesses into top scores!
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-md shadow-rose-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log a Mistake Now</span>
            </button>
          </div>
        ) : (
          filteredErrors.map((err) => {
            const isNeedsRevision = err.status === 'Needs Revision';
            const isMastered = err.status === 'Mastered';

            return (
              <div
                key={err.id}
                className={`glass-panel rounded-3xl p-5 md:p-6 border transition-all ${
                  isNeedsRevision
                    ? 'border-rose-500/30 bg-slate-900/80 hover:border-rose-500/50'
                    : isMastered
                    ? 'border-emerald-500/30 bg-slate-900/60 hover:border-emerald-500/50'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                }`}
              >
                {/* Top card bar: Badges, topic & actions */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Subject badge */}
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-semibold text-xs border border-indigo-500/30">
                      {err.subject}
                    </span>

                    {/* Topic */}
                    <span className="text-xs font-bold text-slate-300">
                      • {err.topic}
                    </span>

                    {/* Error Type */}
                    <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/15 text-rose-300 font-medium text-[11px] border border-rose-500/30">
                      ⚠️ {err.errorType}
                    </span>

                    {/* Severity */}
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                        err.severity === 'High'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : err.severity === 'Medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {err.severity} Priority
                    </span>
                  </div>

                  {/* Status switcher & delete */}
                  <div className="flex items-center gap-2">
                    {/* Status badge & dropdown */}
                    <select
                      value={err.status}
                      onChange={(e) => handleStatusChange(err.id, e.target.value as ErrorStatus)}
                      className={`text-xs font-bold rounded-xl px-2.5 py-1 border transition-all cursor-pointer ${
                        err.status === 'Needs Revision'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : err.status === 'Mastered'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      <option value="Needs Revision">Needs Revision</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Mastered">Mastered ✅</option>
                    </select>

                    <button
                      onClick={() => handleDelete(err.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete error log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base md:text-lg font-bold text-white mt-3 font-heading">
                  {err.title}
                </h3>

                {/* Question context */}
                <div className="mt-2 text-xs md:text-sm text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                  <span className="font-semibold text-slate-400">Context: </span>
                  {err.questionContext}
                </div>

                {/* Side by side: What I Did Wrong vs Correct Way */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {/* Wrong Attempt */}
                  <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-1">
                    <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <span>❌ My Blunder / Attempt:</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-mono text-[11px]">
                      {err.studentAttempt}
                    </p>
                  </div>

                  {/* Correct Solution */}
                  <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>✅ Correct Rule / Solution:</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-mono text-[11px]">
                      {err.correctConcept}
                    </p>
                  </div>
                </div>

                {/* Golden Takeaway Rule */}
                <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/20 border border-amber-500/30 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-amber-300">Golden Rule to Remember: </span>
                    <span className="text-slate-200 italic font-medium">"{err.keyTakeaway}"</span>
                  </div>
                </div>

                {/* Bottom metadata and action chips */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  {/* Tags and Review count */}
                  <div className="flex flex-wrap items-center gap-2 text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{err.reviewCount > 0 ? `Reviewed ${err.reviewCount} time${err.reviewCount > 1 ? 's' : ''}` : 'Fresh Log'}</span>
                    </span>

                    {err.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Quick Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReviewIncrement(err.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1 transition-colors"
                      title="Mark as reviewed today"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Review (+1)</span>
                    </button>

                    <button
                      onClick={() => handleAskTutorAboutError(err)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 font-semibold text-xs transition-colors"
                      title="Ask AI Tutor to generate a practice drill on this exact error"
                    >
                      <span>AI Practice Drill</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 6. Modal for Adding New Error */}
      <AddErrorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdded={(newErr) => {
          setErrors((prev) => [newErr, ...prev]);
        }}
        targetExamLabel={targetExamLabel}
      />
    </div>
  );
};
