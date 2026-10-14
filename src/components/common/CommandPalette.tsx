import React, { useState, useEffect } from 'react';
import {
  Search,
  MessageSquare,
  GraduationCap,
  Calculator,
  CalendarCheck,
  FlaskConical,
  Sparkles,
  BarChart3,
  X,
  Clock,
  BookOpen,
  Newspaper,
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavTab) => void;
  onQuickAction: (actionId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onQuickAction,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    {
      id: 'tab_news',
      title: 'Live Exam News & Official Alerts',
      category: 'Official Intelligence',
      icon: <Newspaper className="w-4 h-4 text-cyan-400" />,
      action: () => {
        onSelectTab('news');
        onClose();
      },
    },
    {
      id: 'tab_tutor',
      title: 'Ask FRIDAY (AI Tutor Chat)',
      category: 'Navigation',
      icon: <MessageSquare className="w-4 h-4 text-indigo-400" />,
      action: () => {
        onSelectTab('tutor');
        onClose();
      },
    },
    {
      id: 'tab_assessment',
      title: 'Take Adaptive Quiz / Full Mock Test',
      category: 'Assessment',
      icon: <GraduationCap className="w-4 h-4 text-cyan-400" />,
      action: () => {
        onSelectTab('assessment');
        onClose();
      },
    },
    {
      id: 'tab_solver',
      title: 'Solve a Problem (Photo / Math OCR)',
      category: 'Tools',
      icon: <Calculator className="w-4 h-4 text-amber-400" />,
      action: () => {
        onSelectTab('solver');
        onClose();
      },
    },
    {
      id: 'tab_simulations',
      title: 'Open Visual Simulation Lab',
      category: 'Interactive',
      icon: <FlaskConical className="w-4 h-4 text-pink-400" />,
      action: () => {
        onSelectTab('simulations');
        onClose();
      },
    },
    {
      id: 'tab_planner',
      title: 'View Study Planner & Focus Pomodoro',
      category: 'Planning',
      icon: <CalendarCheck className="w-4 h-4 text-rose-400" />,
      action: () => {
        onSelectTab('planner');
        onClose();
      },
    },
    {
      id: 'tab_revision',
      title: 'Spaced Repetition Flashcards & Formula Sheets',
      category: 'Revision',
      icon: <Sparkles className="w-4 h-4 text-amber-300" />,
      action: () => {
        onSelectTab('revision');
        onClose();
      },
    },
    {
      id: 'tab_evaluation',
      title: 'Open Hackathon Evaluation Benchmark',
      category: 'System',
      icon: <BarChart3 className="w-4 h-4 text-teal-400" />,
      action: () => {
        onSelectTab('evaluation');
        onClose();
      },
    },
    {
      id: 'action_focus_timer',
      title: 'Start 25-Min Focus Mode with Ambient Binaural Beats',
      category: 'Quick Actions',
      icon: <Clock className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onSelectTab('planner');
        onQuickAction('focus_mode');
        onClose();
      },
    },
    {
      id: 'action_add_notes',
      title: 'Upload / Ingest Notes to Knowledge Base',
      category: 'Quick Actions',
      icon: <BookOpen className="w-4 h-4 text-cyan-400" />,
      action: () => {
        onSelectTab('knowledge');
        onQuickAction('upload_notes');
        onClose();
      },
    },
  ];

  const filtered = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl glass-panel rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            placeholder="Type a command or search action (e.g., 'quiz', 'solver', 'focus')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching actions found for "{query}"
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs md:text-sm text-slate-200 hover:bg-slate-800/80 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-indigo-500/50 transition-colors">
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.title}</span>
                </div>
                <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  {item.category}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Use ⬆ ⬇ to navigate</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
