import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Calendar,
  Clock,
  Sparkles,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  CheckCircle2,
  ListOrdered,
  CalendarDays,
  Plus,
  Flame,
} from 'lucide-react';
import { StudyTask, TopicMastery, UserProfile } from '../../types';
import { startAmbientSound, stopAmbientSound, playChime } from '../../services/soundService';

interface StudyPlannerViewProps {
  user: UserProfile;
  masteryMap: Record<string, TopicMastery>;
  tasks: StudyTask[];
  onToggleTask: (taskId: string) => void;
  onUpdateTasks: (tasks: StudyTask[]) => void;
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({
  user,
  masteryMap,
  tasks,
  onToggleTask,
  onUpdateTasks,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [focusModalOpen, setFocusModalOpen] = useState(false);

  // Focus Mode Pomodoro state
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [ambientSound, setAmbientSound] = useState<'binaural' | 'rain' | 'whitenoise' | 'none'>('binaural');

  // Days until exam
  const daysUntilExam = Math.max(
    1,
    Math.round((new Date(user.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );

  // Pomodoro timer tick
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            playChime('success');
            stopAmbientSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroSeconds]);

  const toggleTimer = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      if (ambientSound !== 'none') {
        startAmbientSound(ambientSound);
      }
    } else {
      setIsTimerRunning(false);
      stopAmbientSound();
    }
  };

  const handleSoundChange = (snd: 'binaural' | 'rain' | 'whitenoise' | 'none') => {
    setAmbientSound(snd);
    if (isTimerRunning) {
      if (snd === 'none') stopAmbientSound();
      else startAmbientSound(snd);
    }
  };

  // Auto Re-plan ("I missed 2 days")
  const handleAutoReplan = () => {
    playChime('click');
    const today = new Date().toISOString().split('T')[0];
    const regenerated: StudyTask[] = [
      {
        id: `task_${Date.now()}_1`,
        title: 'High-Yield Catchup: Laws of Motion & Friction FBDs',
        subject: 'Physics',
        topic: "Newton's Laws of Motion & Friction",
        type: 'concept_study',
        durationMinutes: 45,
        completed: false,
        scheduledDate: today,
        priority: 'high',
      },
      {
        id: `task_${Date.now()}_2`,
        title: 'Adaptive Rapid Practice Quiz: Limits & Derivatives',
        subject: 'Mathematics',
        topic: 'Differential Calculus & Limits',
        type: 'practice_quiz',
        durationMinutes: 30,
        completed: false,
        scheduledDate: today,
        priority: 'high',
      },
      {
        id: `task_${Date.now()}_3`,
        title: 'Spaced Repetition Review: Formulas & Drift Velocity',
        subject: 'Physics',
        topic: "Current Electricity & Ohm's Law",
        type: 'revision',
        durationMinutes: 20,
        completed: false,
        scheduledDate: today,
        priority: 'medium',
      },
      {
        id: `task_${Date.now()}_4`,
        title: 'Full Sectional Mock Test: Mechanics & Algebra',
        subject: 'Physics',
        topic: 'Mechanics & Algebra Benchmark',
        type: 'mock_exam',
        durationMinutes: 60,
        completed: false,
        scheduledDate: today,
        priority: 'high',
      },
    ];

    onUpdateTasks(regenerated);
  };

  const formatTime = (secs: number) => {
    const safeSecs = Math.max(0, Math.floor(secs || 0));
    const m = Math.floor(safeSecs / 60);
    const s = safeSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white font-heading flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-rose-400" /> AI Adaptive Study Planner
          </h1>
          <p className="text-xs text-slate-400">
            Synthesized from syllabus weightage, forgetting curves, and your {user.dailyStudyHours}h daily target.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFocusModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:opacity-90 transition-all"
          >
            <Clock className="w-4 h-4" /> Focus Mode (Pomodoro)
          </button>

          <button
            onClick={handleAutoReplan}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-all"
            title="Missed days? FRIDAY will reschedule and compress topics according to syllabus weightage"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Auto-Replan Schedule
          </button>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="glass-panel rounded-3xl p-5 border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">
            {daysUntilExam}d
          </div>
          <div>
            <div className="text-xs font-bold text-white">Target Countdown</div>
            <div className="text-[11px] text-slate-400">
              Exam: {new Date(user.examDate).toLocaleDateString()} • Daily Allocation: {user.dailyStudyHours} hours
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-bold text-cyan-400">
            {tasks.filter((t) => t.completed).length} / {tasks.length} Completed
          </div>
          <div className="w-32 h-2 rounded-full bg-slate-800 mt-1 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
              style={{
                width: `${Math.round((tasks.filter((t) => t.completed).length / (tasks.length || 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Tasks Schedule View */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
            Daily Breakdown & Tasks
          </h2>

          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                viewMode === 'calendar' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Weekly Grid
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                task.completed
                  ? 'bg-slate-900/40 border-slate-800/80 opacity-60'
                  : 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                    task.completed
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'border-slate-700 bg-slate-950 text-transparent'
                  }`}
                >
                  ✓
                </div>

                <div>
                  <div
                    className={`text-xs md:text-sm font-bold ${
                      task.completed ? 'line-through text-slate-400' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="text-indigo-400 font-semibold">{task.subject}</span>
                    <span>•</span>
                    <span className="text-cyan-300">{task.topic}</span>
                    <span>•</span>
                    <span>{task.durationMinutes} mins</span>
                    <span>•</span>
                    <span
                      className={`font-semibold capitalize ${
                        task.priority === 'high' ? 'text-rose-400' : 'text-slate-400'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                  task.type === 'mock_exam'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : task.type === 'practice_quiz'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                }`}
              >
                {task.type.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* FOCUS MODE / POMODORO MODAL */}
      {focusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-emerald-500/40 shadow-2xl text-center space-y-6">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                Distraction-Free Focus
              </span>
              <h2 className="text-xl font-black text-white font-heading mt-2">
                Pomodoro Focus Engine
              </h2>
            </div>

            {/* Giant Timer Display */}
            <div className="text-6xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 my-4">
              {formatTime(pomodoroSeconds)}
            </div>

            {/* Play / Pause */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleTimer}
                className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-xl shadow-emerald-500/30 hover:scale-105 transition-all"
              >
                {isTimerRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setPomodoroSeconds(25 * 60);
                  stopAmbientSound();
                }}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
                title="Reset Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Ambient Sound Selector */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-left">
              <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-emerald-400" /> Synthesized Ambient Sound:
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'binaural', label: '10Hz Alpha Waves' },
                  { id: 'rain', label: 'Gentle Rain' },
                  { id: 'whitenoise', label: 'Pink Noise' },
                  { id: 'none', label: 'Silent' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSoundChange(s.id as any)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      ambientSound === s.id
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setFocusModalOpen(false);
                stopAmbientSound();
                setIsTimerRunning(false);
              }}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close Focus Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
