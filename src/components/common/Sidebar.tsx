import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  GraduationCap,
  Network,
  Video,
  Calculator,
  CalendarCheck,
  FlaskConical,
  Sparkles,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Newspaper,
  BookX,
} from 'lucide-react';
import { FridayLogo } from './FridayLogo';

export type NavTab =
  | 'dashboard'
  | 'news'
  | 'errorbook'
  | 'tutor'
  | 'assessment'
  | 'knowledge'
  | 'summarizer'
  | 'solver'
  | 'planner'
  | 'simulations'
  | 'revision'
  | 'evaluation';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  targetExamLabel: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  targetExamLabel,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    {
      id: 'news',
      label: 'Live Exam News',
      icon: <Newspaper className="w-5 h-5 text-cyan-400" />,
      badge: 'Live',
    },
    {
      id: 'errorbook',
      label: 'Error Book',
      icon: <BookX className="w-5 h-5 text-rose-400" />,
      badge: 'Memes & Traps',
    },
    {
      id: 'tutor',
      label: 'AI Tutor Chat',
      icon: <MessageSquare className="w-5 h-5 text-indigo-400" />,
      badge: 'Grounded',
    },
    {
      id: 'assessment',
      label: 'Mock Tests & Quizzes',
      icon: <GraduationCap className="w-5 h-5 text-cyan-400" />,
      badge: 'Adaptive',
    },
    {
      id: 'knowledge',
      label: 'Knowledge & Concept Map',
      icon: <Network className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'summarizer',
      label: 'Video & Notes Summarizer',
      icon: <Video className="w-5 h-5 text-violet-400" />,
    },
    {
      id: 'solver',
      label: 'Problem Solver',
      icon: <Calculator className="w-5 h-5 text-amber-400" />,
      badge: 'Verified',
    },
    {
      id: 'planner',
      label: 'AI Study Planner',
      icon: <CalendarCheck className="w-5 h-5 text-rose-400" />,
    },
    {
      id: 'simulations',
      label: 'Visual Simulation Lab',
      icon: <FlaskConical className="w-5 h-5 text-pink-400" />,
      badge: 'Interactive',
    },
    {
      id: 'revision',
      label: 'Revision Tools',
      icon: <Sparkles className="w-5 h-5 text-amber-300" />,
    },
    {
      id: 'evaluation',
      label: 'System Evaluation',
      icon: <BarChart3 className="w-5 h-5 text-teal-400" />,
      badge: 'Judges',
    },
  ];

  return (
    <aside
      className={`fixed md:sticky top-0 left-0 z-40 h-screen transition-all duration-300 glass-panel border-r border-slate-800/80 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-4 border-b border-slate-800/80 justify-between">
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Official Friday Graduation-Cap Stylized F Emblem */}
            <FridayLogo size={38} showText={false} animate />

            {!collapsed && (
              <div>
                <div className="font-heading font-black text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-cyan-200">
                  FRIDAY
                </div>
                <div className="text-[9px] font-bold tracking-[0.16em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-300 to-violet-300 truncate max-w-[140px]">
                  {targetExamLabel || 'AI Study Companion'}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/30 to-violet-600/20 text-white border border-indigo-500/40 shadow-sm shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className="shrink-0 group-hover:scale-110 transition-transform">{item.icon}</div>

                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between text-left">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold tracking-wider ${
                          item.badge === 'Judges'
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            : item.badge === 'Verified'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-indigo-500/20 text-indigo-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Engine Status */}
      <div className="p-3 border-t border-slate-800/80">
        {!collapsed ? (
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-slate-200 flex items-center gap-1">
                <span>FRIDAY Engine</span>
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-[10px] text-slate-400 truncate">Adaptive Learning Active</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"
              title="FRIDAY Core Online"
            />
          </div>
        )}
      </div>
    </aside>
  );
};
