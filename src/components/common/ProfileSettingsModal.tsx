import React, { useState } from 'react';
import {
  X,
  User,
  Sliders,
  Download,
  Upload,
  RotateCcw,
  Award,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onResetAllData: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onResetAllData,
}) => {
  const [name, setName] = useState(user.name);
  const [dailyHours, setDailyHours] = useState(user.dailyStudyHours);
  const [examDate, setExamDate] = useState(user.examDate);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateUser({
      ...user,
      name: name.trim() || user.name,
      dailyStudyHours: dailyHours,
      examDate,
    });
    onClose();
  };

  const handleExportJSON = () => {
    const backup = {
      user,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `friday_study_backup_${user.name.toLowerCase()}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl glass-panel rounded-3xl p-6 md:p-8 border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white font-heading">
              Student Profile & Engine Settings
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Badges & Level banner */}
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg">
              {name ? name[0].toUpperCase() : 'F'}
            </div>
            <div>
              <div className="text-sm font-bold text-white font-heading">{user.name}</div>
              <div className="text-xs text-indigo-300">
                Level {Math.round(user.level)} Aspirant • {new Intl.NumberFormat().format(Math.round(user.totalXp))} XP
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 max-w-[150px] justify-end">
            {user.badges.map((b, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-200 text-[10px] font-semibold"
              >
                🏅 {b}
              </span>
            ))}
          </div>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs md:text-sm focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Daily Study Target
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs md:text-sm focus:outline-none"
                />
                <span className="text-xs text-slate-400">hours</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Exam Date</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs md:text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Academic target display */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            <span className="text-slate-400">Active Syllabus: </span>
            <strong className="text-cyan-300">
              {user.path === 'competitive'
                ? `${user.competitiveExam} (${user.targetYear})`
                : `${user.board} ${user.grade} ${user.stream || ''}`}
            </strong>
          </div>
        </div>

        {/* Export / Import & Reset */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" /> Export Data (JSON)
          </button>

          <button
            onClick={onResetAllData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Fresh State
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs hover:opacity-90 shadow-md"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
