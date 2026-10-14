import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Sparkles,
  Zap,
  Award,
  Clock,
  RotateCcw,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyGoal } from '../../types';
import { playChime } from '../../services/soundService';

interface DailyGoalsWidgetProps {
  onAwardXp: (xp: number, reason?: string) => void;
}

const STORAGE_KEY = 'friday_session_daily_goals';

const DEFAULT_GOALS: DailyGoal[] = [
  {
    id: 'g_1',
    title: 'Solve 10 Kinematics or Calculus MCQs',
    xpReward: 50,
    completed: false,
    category: 'practice',
    targetMinutes: 25,
    createdAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'g_2',
    title: 'Revise Spaced Repetition Flashcard Deck',
    xpReward: 30,
    completed: true,
    category: 'revision',
    targetMinutes: 15,
    createdAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'g_3',
    title: 'Ask FRIDAY to clarify 1 tricky concept or derivation',
    xpReward: 40,
    completed: false,
    category: 'doubt',
    targetMinutes: 15,
    createdAt: new Date().toISOString().split('T')[0],
  },
];

export const DailyGoalsWidget: React.FC<DailyGoalsWidgetProps> = ({ onAwardXp }) => {
  const [goals, setGoals] = useState<DailyGoal[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_GOALS;
    } catch {
      return DEFAULT_GOALS;
    }
  });

  const [newTitle, setNewTitle] = useState('');
  const [newXp, setNewXp] = useState(50);
  const [newMinutes, setNewMinutes] = useState(25);
  const [showAddForm, setShowAddForm] = useState(false);
  const [lastEarnedNotification, setLastEarnedNotification] = useState<string | null>(null);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  const completedCount = goals.filter((g) => g.completed).length;
  const totalCount = goals.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalXpEarnedToday = goals
    .filter((g) => g.completed)
    .reduce((sum, g) => sum + g.xpReward, 0);

  const handleToggleGoal = (goal: DailyGoal) => {
    const isNowCompleted = !goal.completed;

    if (isNowCompleted) {
      // Award XP
      onAwardXp(goal.xpReward, goal.title);
      playChime('success');
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
      });

      setLastEarnedNotification(`+${new Intl.NumberFormat().format(Math.round(goal.xpReward))} XP Earned! "${goal.title}"`);
      setTimeout(() => setLastEarnedNotification(null), 3500);
    } else {
      playChime('click');
    }

    setGoals((prev) =>
      prev.map((g) => (g.id === goal.id ? { ...g, completed: isNowCompleted } : g))
    );
  };

  const handleAddGoal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;

    const newGoal: DailyGoal = {
      id: `goal_${Date.now()}`,
      title: newTitle.trim(),
      xpReward: newXp,
      completed: false,
      category: 'practice',
      targetMinutes: newMinutes,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setGoals((prev) => [newGoal, ...prev]);
    setNewTitle('');
    setShowAddForm(false);
    playChime('click');
  };

  const handleAddPreset = (presetTitle: string, xp: number, minutes: number) => {
    const newGoal: DailyGoal = {
      id: `goal_${Date.now()}`,
      title: presetTitle,
      xpReward: xp,
      completed: false,
      category: 'practice',
      targetMinutes: minutes,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setGoals((prev) => [newGoal, ...prev]);
    playChime('click');
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleResetGoals = () => {
    setGoals(
      DEFAULT_GOALS.map((g, i) => ({
        ...g,
        id: `goal_${Date.now()}_${i}`,
        completed: false,
      }))
    );
    playChime('click');
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-slate-800 relative overflow-hidden shadow-xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/20">
      {/* Background soft glow */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                Session Mini-Goals
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-sans font-semibold">
                  Today's Sprint
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Set micro-targets for this study session. Complete them to earn instant XP and level up!
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* XP Earned Today Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>+{new Intl.NumberFormat().format(Math.round(totalXpEarnedToday))} XP Earned</span>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Goal</span>
          </button>
        </div>
      </div>

      {/* Floating XP Reward Notification */}
      {lastEarnedNotification && (
        <div className="mb-4 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-between text-xs font-bold text-emerald-300 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>{lastEarnedNotification}</span>
          </div>
          <span className="text-[10px] text-slate-300 uppercase tracking-wider">Leveling Up!</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-4 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>
            Progress: <strong className="text-white">{completedCount} of {totalCount}</strong> mini-goals completed
          </span>
          <span className="font-bold text-cyan-400 font-mono">{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${Math.round(progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Add New Goal Inline Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddGoal}
          className="mb-4 p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-3 animate-in fade-in duration-150"
        >
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              What do you want to accomplish in this study session?
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Master 5 projectile derivation problems, Revise Chapter 4..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs md:text-sm focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* XP reward selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">Reward:</span>
                {[25, 50, 100].map((xp) => (
                  <button
                    key={xp}
                    type="button"
                    onClick={() => setNewXp(xp)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
                      newXp === xp
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    +{xp} XP
                  </button>
                ))}
              </div>

              {/* Target minutes selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">Est:</span>
                {[15, 25, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setNewMinutes(mins)}
                    className={`px-2.5 py-1 rounded-lg font-medium text-xs transition-colors ${
                      newMinutes === mins
                        ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-bold hover:opacity-90 disabled:opacity-40 transition-all shadow-md shadow-indigo-500/20"
              >
                Add Mini-Goal
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Quick Add Presets (One-click add) */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-cyan-400" /> Quick Add:
        </span>
        <button
          onClick={() => handleAddPreset('Solve 5 Topic MCQs with Instant Feedback', 25, 15)}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-[11px] transition-colors"
        >
          ⚡ Solve 5 MCQs (+25 XP)
        </button>
        <button
          onClick={() => handleAddPreset('25-Minute Focused Pomodoro Sprint', 50, 25)}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-[11px] transition-colors"
        >
          ⏱ 25m Focus Sprint (+50 XP)
        </button>
        <button
          onClick={() => handleAddPreset('Review 1 Formula Sheet & Derivations', 35, 15)}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-[11px] transition-colors"
        >
          📖 Revise Formula Sheet (+35 XP)
        </button>
        <button
          onClick={() => handleAddPreset('Clear 1 Tough Question in Tutor Chat', 40, 20)}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-[11px] transition-colors"
        >
          💡 Ask Friday Tutor (+40 XP)
        </button>
      </div>

      {/* Goals List */}
      <div className="space-y-2.5">
        {goals.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No mini-goals set for this session yet. Click "+ Add Goal" or pick a Quick Add preset above!
          </div>
        ) : (
          goals.map((goal) => (
            <div
              key={goal.id}
              onClick={() => handleToggleGoal(goal)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                goal.completed
                  ? 'bg-slate-950/40 border-slate-800/80 opacity-75'
                  : 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 pr-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleGoal(goal);
                  }}
                  className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                    goal.completed
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'border-slate-700 bg-slate-950 text-slate-600 group-hover:border-indigo-400'
                  }`}
                >
                  {goal.completed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Circle className="w-3.5 h-3.5" />}
                </button>

                <div className="min-w-0">
                  <div
                    className={`text-xs md:text-sm font-semibold truncate ${
                      goal.completed ? 'line-through text-slate-400' : 'text-slate-100'
                    }`}
                  >
                    {goal.title}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    {goal.targetMinutes && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>{Math.round(goal.targetMinutes)}m target</span>
                      </span>
                    )}
                    {goal.completed && (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* XP Reward Badge */}
                <div
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1 ${
                    goal.completed
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}
                >
                  <Zap className="w-3 h-3 fill-current" />
                  <span>+{new Intl.NumberFormat().format(Math.round(goal.xpReward))} XP</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteGoal(goal.id);
                  }}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove Goal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px]">
          Session goals refresh every day • Stored locally
        </span>
        <button
          onClick={handleResetGoals}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
          title="Reset to fresh session goals"
        >
          <RotateCcw className="w-3 h-3" /> Reset Session
        </button>
      </div>
    </div>
  );
};
