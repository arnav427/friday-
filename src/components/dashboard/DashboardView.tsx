import React from 'react';
import {
  Calendar,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
  BookOpen,
  Award,
  AlertTriangle,
  PlayCircle,
  CheckCircle2,
  CheckSquare,
  Square,
  GraduationCap,
  Calculator,
  FlaskConical,
  MessageSquare,
  Newspaper,
  Radio,
  BookX,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { TopicMastery, UserProfile, StudyTask, QuizResult } from '../../types';
import { NavTab } from '../common/Sidebar';
import { getDecayedMastery } from '../../services/bktService';
import { DailyMotivation } from './DailyMotivation';
import { DailyGoalsWidget } from './DailyGoalsWidget';
import { OfficialExamLinks } from './OfficialExamLinks';
import { StudyMemeCard } from '../common/StudyMemeCard';

interface DashboardViewProps {
  user: UserProfile;
  masteryMap: Record<string, TopicMastery>;
  studyTasks: StudyTask[];
  onToggleTask: (taskId: string) => void;
  recentQuizzes: QuizResult[];
  onNavigate: (tab: NavTab) => void;
  onPracticeTopic: (topic: string, subject: string) => void;
  onAwardXp: (amount: number, reason?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  masteryMap,
  studyTasks,
  onToggleTask,
  recentQuizzes,
  onNavigate,
  onPracticeTopic,
  onAwardXp,
}) => {
  const topicsList = Object.values(masteryMap);

  // Compute Overall Readiness (average decayed mastery across all topics)
  const totalMastery = topicsList.reduce((acc, t) => acc + getDecayedMastery(t), 0);
  const overallReadiness = topicsList.length > 0 ? Math.round(totalMastery / topicsList.length) : 45;

  // Identify Weakest Topics (< 60% mastery)
  const weakTopics = [...topicsList]
    .sort((a, b) => getDecayedMastery(a) - getDecayedMastery(b))
    .slice(0, 4);

  // Subject-wise mastery grouping
  const subjectAverages: Record<string, { total: number; count: number }> = {};
  topicsList.forEach((t) => {
    if (!subjectAverages[t.subject]) subjectAverages[t.subject] = { total: 0, count: 0 };
    subjectAverages[t.subject].total += getDecayedMastery(t);
    subjectAverages[t.subject].count += 1;
  });

  const subjectMasteryData = Object.entries(subjectAverages).map(([subject, data]) => ({
    subject,
    mastery: Math.round(data.total / (data.count || 1)),
  }));

  // Spaced Repetition Due Today
  const nowIso = new Date().toISOString();
  const dueForRevision = topicsList.filter(
    (t) => new Date(t.nextReviewDate).getTime() <= new Date().getTime() || t.retrievabilityScore < 0.6
  );

  // Days until exam
  const daysUntilExam = Math.max(
    1,
    Math.round((new Date(user.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );

  // Weekly study hours chart mock/computed data
  const weeklyStudyData = [
    { day: 'Mon', hours: 3.5, accuracy: 78 },
    { day: 'Tue', hours: 4.2, accuracy: 82 },
    { day: 'Wed', hours: 2.8, accuracy: 74 },
    { day: 'Thu', hours: 5.0, accuracy: 88 },
    { day: 'Fri', hours: 3.9, accuracy: 80 },
    { day: 'Sat', hours: 6.2, accuracy: 85 },
    { day: 'Sun', hours: 4.8, accuracy: 91 },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 0. Daily Motivation Line at the start of desktop (Changes Everyday) */}
      <DailyMotivation />

      {/* 1. Hero Greeting Banner */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 relative overflow-hidden bg-gradient-to-r from-indigo-950/40 via-slate-900/50 to-slate-900/40">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -top-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                {user.path === 'competitive' ? user.competitiveExam : `${user.board} ${user.grade}`}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white font-heading">
              Good day, {user.name} 👋
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Friday is tracking your knowledge retention across {topicsList.length} syllabus topics using Bayesian Knowledge Tracing.
            </p>
          </div>

          {/* Exam Countdown & Readiness Radial Preview */}
          <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            {/* Radial Gauge */}
            <div className="relative w-18 h-18 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="36"
                  cy="36"
                  r="30"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="36"
                  cy="36"
                  r="30"
                  stroke="url(#gradientGauge)"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 30}
                  strokeDashoffset={2 * Math.PI * 30 * (1 - overallReadiness / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradientGauge" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#22D3EE" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-base font-extrabold text-white font-heading">
                  {Math.round(overallReadiness)}%
                </span>
              </div>
            </div>

            <div className="border-l border-slate-800 pl-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Exam Countdown
              </div>
              <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400 font-heading">
                {new Intl.NumberFormat().format(Math.max(1, Math.round(daysUntilExam)))} Days
              </div>
              <div className="text-[11px] text-slate-400">
                Target: {new Date(user.examDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Chips */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('news')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all group"
          >
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse group-hover:scale-110 transition-transform" />
            <span>Live Exam News</span>
          </button>
          <button
            onClick={() => onNavigate('errorbook')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all group"
          >
            <BookX className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            <span>Error Book</span>
          </button>
          <button
            onClick={() => onNavigate('tutor')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all group"
          >
            <MessageSquare className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>Ask FRIDAY</span>
          </button>
          <button
            onClick={() => onNavigate('assessment')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 text-xs font-semibold transition-all group"
          >
            <GraduationCap className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
            <span>Take Adaptive Quiz</span>
          </button>
          <button
            onClick={() => onNavigate('solver')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all group"
          >
            <Calculator className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Solve Photo / Problem</span>
          </button>
          <button
            onClick={() => onNavigate('simulations')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 text-xs font-semibold transition-all group"
          >
            <FlaskConical className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
            <span>Open Simulation Lab</span>
          </button>
        </div>
      </div>

      {/* 2. Current Study Session Mini-Goals Widget */}
      <DailyGoalsWidget onAwardXp={onAwardXp} />

      {/* 3. Grid Row: Today's Plan & Spaced Repetition Due */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks Checklist (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white font-heading">Today's Study Plan</h2>
            </div>
            <button
              onClick={() => onNavigate('planner')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
            >
              Open Full Planner <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {studyTasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  task.completed
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-900/80 border-slate-700/60 hover:border-indigo-500/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="shrink-0 text-indigo-400">
                    {task.completed ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <div
                      className={`text-xs md:text-sm font-semibold ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-100'
                      }`}
                    >
                      {task.title}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="text-cyan-400">{task.subject}</span>
                      <span>•</span>
                      <span>{task.durationMinutes} mins</span>
                      <span>•</span>
                      <span
                        className={`capitalize ${
                          task.priority === 'high' ? 'text-rose-400' : 'text-slate-400'
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPracticeTopic(task.topic, task.subject);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-medium border border-indigo-500/30"
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Spaced Repetition Due Card */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white font-heading">Due for Revision</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Based on the Ebbinghaus forgetting curve, these topics have decayed below your optimal retention threshold.
            </p>

            <div className="space-y-2">
              {dueForRevision.slice(0, 3).map((item) => (
                <div
                  key={item.topicId}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {item.topicName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Retention: {Math.round(item.retrievabilityScore * 100)}%
                    </div>
                  </div>
                  <button
                    onClick={() => onPracticeTopic(item.topicName, item.subject)}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30"
                  >
                    Revise
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('revision')}
            className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600/30 to-cyan-500/20 border border-indigo-500/40 text-xs font-semibold text-indigo-200 hover:text-white transition-all text-center"
          >
            Review All Spaced Flashcards ({dueForRevision.length})
          </button>
        </div>
      </div>

      {/* 3. Subject Mastery Bars & Weak Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Mastery Distribution */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" /> Subject Mastery Breakdown
            </h2>
            <button
              onClick={() => onNavigate('knowledge')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Knowledge Map →
            </button>
          </div>

          <div className="space-y-4">
            {subjectMasteryData.map((item) => (
              <div key={item.subject} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">{item.subject}</span>
                  <span className="font-bold text-indigo-400">{Math.round(item.mastery)}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(5, Math.round(item.mastery)))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Topics to Target Immediately */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> Focus Weak Topics
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">BKT Posterior &lt; 60%</span>
          </div>

          <div className="space-y-2.5">
            {weakTopics.map((topic) => (
              <div
                key={topic.topicId}
                className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200">{topic.topicName}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="text-indigo-400">{topic.subject}</span>
                    <span>•</span>
                    <span className="text-rose-400 font-semibold">
                      {Math.round(getDecayedMastery(topic))}% Mastery
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onPracticeTopic(topic.topicName, topic.subject)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 transition-colors"
                >
                  Practice Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Weekly Analytics & Accuracy Trend */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" /> Study Hours & Accuracy Trend
            </h2>
            <p className="text-xs text-slate-400">Weekly breakdown of daily study effort and accuracy</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyStudyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#F8FAFC',
                }}
              />
              <Bar dataKey="hours" name="Study Hours" fill="#6366F1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Official Examination Portals & Regulatory Authorities strictly for user's exam */}
      <OfficialExamLinks user={user} />

      {/* 6. Interactive Study Stress Buster & Relatable Academic Memes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
            <span className="text-xl">🎭</span> Exam Stress Buster & Study Memes
          </h2>
          <span className="text-xs text-slate-400">Interactive humor • Boost energy & earn XP</span>
        </div>
        <StudyMemeCard onAwardXp={onAwardXp} />
      </div>
    </div>
  );
};
