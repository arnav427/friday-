import React from 'react';
import {
  Globe,
  Moon,
  Sun,
  Search,
  BookmarkCheck,
  User,
  Sliders,
} from 'lucide-react';
import { SupportedLanguage, UserProfile } from '../../types';
import { FridayLogo } from './FridayLogo';

interface HeaderProps {
  user: UserProfile;
  activeLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  unresolvedDoubtsCount: number;
  onOpenDoubts: () => void;
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
}

const LANGUAGES: SupportedLanguage[] = [
  'English',
  'Hindi',
  'Hinglish',
  'Bengali',
  'Tamil',
  'Telugu',
  'Marathi',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Punjabi',
  'Urdu',
];

export const Header: React.FC<HeaderProps> = ({
  user,
  activeLanguage,
  onLanguageChange,
  isDarkMode,
  onToggleTheme,
  unresolvedDoubtsCount,
  onOpenDoubts,
  onOpenCommandPalette,
  onOpenSettings,
}) => {
  const [langMenuOpen, setLangMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 w-full glass-panel border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between">
      {/* Left: Mobile branding / quick search */}
      <div className="flex items-center gap-2.5">
        <div className="md:hidden flex items-center">
          <FridayLogo size={32} showText={false} />
        </div>
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50 text-xs md:text-sm transition-all group"
        >
          <Search className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Search concepts, doubts or tests...</span>
          <span className="sm:hidden">Search...</span>
          <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded border border-slate-700">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">


        {/* Doubt Inbox */}
        <button
          onClick={onOpenDoubts}
          className="relative p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition-colors"
          title="Doubt Inbox"
        >
          <BookmarkCheck className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 text-xs font-medium transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span className="max-w-[70px] truncate">{activeLanguage}</span>
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 py-1.5 rounded-xl glass-panel shadow-2xl border border-slate-700/80 z-50 max-h-72 overflow-y-auto">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Language / भाषा
              </div>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    onLanguageChange(lang);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between ${
                    activeLanguage === lang
                      ? 'bg-indigo-600/30 text-indigo-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <span>{lang}</span>
                  {activeLanguage === lang && <span className="text-cyan-400 text-xs">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition-colors"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        {/* Profile / Settings Button */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-700/60 transition-all text-xs text-slate-200"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white text-[11px]">
            {user.name ? user.name[0].toUpperCase() : 'F'}
          </div>
          <span className="hidden lg:inline font-medium max-w-[80px] truncate">{user.name}</span>
          <Sliders className="w-3 h-3 text-slate-400 hidden sm:inline" />
        </button>
      </div>
    </header>
  );
};
