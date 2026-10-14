import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Filter,
  CheckCircle2,
  Clock,
  Radio,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { ExamNewsFeed, ExamNewsItem, fetchLiveExamNews } from '../../services/examNewsService';
import { OfficialExamLinks } from '../dashboard/OfficialExamLinks';

interface LiveExamNewsViewProps {
  user: UserProfile;
  targetExamLabel: string;
}

export const LiveExamNewsView: React.FC<LiveExamNewsViewProps> = ({
  user,
  targetExamLabel,
}) => {
  const [newsFeed, setNewsFeed] = useState<ExamNewsFeed | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const targetExamIdentifier =
    user.path === 'competitive' ? user.competitiveExam || 'JEE Main' : `${user.board || 'CBSE'} Board`;

  const loadNews = async () => {
    setLoading(true);
    try {
      const feed = await fetchLiveExamNews(
        user.path === 'competitive' ? user.competitiveExam : undefined,
        user.board,
        user.targetYear || '2026'
      );
      setNewsFeed(feed);
    } catch (err) {
      console.error('Error fetching live news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, [user.competitiveExam, user.board, user.path]);

  const categories = ['all', 'Admit Card', 'Dates & Schedule', 'Syllabus & Pattern', 'Results & Cutoffs', 'Official Notice'];

  const filteredItems = (newsFeed?.newsItems || []).filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.headline.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.source.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl relative overflow-hidden bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-indigo-950/40">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                Live Examination Intelligence Feed
              </span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold">
                Strictly Filtered: {targetExamIdentifier}
              </span>
            </div>

            <h1 className="text-xl md:text-3xl font-extrabold text-white font-heading">
              Official News & Updates for {targetExamIdentifier}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Curated and real-time verified updates from official conducting bodies (NTA, CBSE, NMC, JoSAA, UPSC).
              Zero clickbait or irrelevant exams.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={loadNews}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Fetching Official Feed...' : 'Refresh Live News'}</span>
            </button>
          </div>
        </div>

        {/* Urgent Alert Banner */}
        {newsFeed?.urgentAlert && (
          <div className="mt-5 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-3 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex-1">
              <strong className="text-amber-300">Urgent Notification: </strong>
              <span>{newsFeed.urgentAlert}</span>
            </div>
            <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase">
              Action Required
            </span>
          </div>
        )}
      </div>

      {/* 2. Filter & Category Bar */}
      <div className="glass-panel rounded-2xl p-3 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {cat === 'all' ? 'All Updates' : cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter headlines or source..."
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-full sm:w-60"
        />
      </div>

      {/* 3. News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`glass-panel rounded-3xl p-5 border transition-all flex flex-col justify-between group ${
              item.urgent
                ? 'border-amber-500/40 bg-gradient-to-br from-amber-950/15 via-slate-900/60 to-slate-900/40'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              {/* Category & Status */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                  {item.category}
                </span>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{item.date}</span>
                </div>
              </div>

              {/* Headline */}
              <h3 className="text-sm md:text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors leading-snug">
                {item.headline}
              </h3>

              {/* Summary */}
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {item.summary}
              </p>
            </div>

            {/* Footer with Source & Verification */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold text-slate-300">{item.source}</span>
                {item.verified && (
                  <span title="Officially Verified Source">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </span>
                )}
              </div>

              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold text-xs transition-colors"
                >
                  <span>Official Notice</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800 space-y-3">
          <Newspaper className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No announcements found matching filter</h3>
          <p className="text-xs text-slate-400">Try changing your category selection or search query.</p>
        </div>
      )}

      {/* 4. Integrated Official Exam Links Directory */}
      <OfficialExamLinks user={user} />
    </div>
  );
};
