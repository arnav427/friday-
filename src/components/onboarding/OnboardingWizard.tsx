import React, { useState } from 'react';
import {
  Sparkles,
  School,
  Trophy,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Clock,
  Gauge,
  Flame,
  Check,
} from 'lucide-react';
import {
  EducationPath,
  SchoolBoard,
  CompetitiveExam,
  LearningStyle,
  SupportedLanguage,
  UserProfile,
} from '../../types';
import { FridayLogo } from '../common/FridayLogo';

interface OnboardingWizardProps {
  onComplete: (profile: UserProfile, launchDiagnostic: boolean) => void;
}

const BOARDS: SchoolBoard[] = ['CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge'];
const COMPETITIVE_EXAMS: CompetitiveExam[] = [
  'JEE Main',
  'JEE Advanced',
  'NEET',
  'UPSC CSE',
  'GATE',
  'CAT',
  'SSC CGL',
  'CLAT',
  'Other',
];

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

const LEARNING_STYLES: { id: LearningStyle; title: string; desc: string; icon: string }[] = [
  { id: 'visual', title: 'Visual Learner', desc: 'Flowcharts, diagrams, animations, visual simulations', icon: '🎨' },
  { id: 'practice-heavy', title: 'Practice-Heavy', desc: 'Lots of MCQs, numerical problems, step-by-step solving', icon: '⚡' },
  { id: 'reading', title: 'Reading & Depth', desc: 'Thorough derivations, textbook excerpts, structured notes', icon: '📖' },
  { id: 'audio', title: 'Audio & Discussion', desc: 'Voice explanations, listenable podcasts, Socratic dialog', icon: '🎙️' },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState('');
  const [path, setPath] = useState<EducationPath>('competitive');
  const [board, setBoard] = useState<SchoolBoard>('CBSE');
  const [grade, setGrade] = useState('Class 12');
  const [stream, setStream] = useState('Science PCM');
  const [competitiveExam, setCompetitiveExam] = useState<CompetitiveExam>('JEE Main');
  const [targetYear, setTargetYear] = useState('2027');

  // Subjects
  const [subjects, setSubjects] = useState<string[]>(['Physics', 'Chemistry', 'Mathematics']);

  // Preferences
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedLanguage>('English');
  const [learningStyle, setLearningStyle] = useState<LearningStyle>('practice-heavy');

  // Study hours & Exam date
  const [dailyHours, setDailyHours] = useState(4);
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });

  // Confidence sliders per subject
  const [confidence, setConfidence] = useState<Record<string, number>>({
    Physics: 50,
    Chemistry: 45,
    Mathematics: 60,
  });

  // Update subjects automatically when stream or exam changes
  const handlePathOrStreamChange = (newPath: EducationPath, newStream?: string, newExam?: CompetitiveExam) => {
    let newSubs = ['Physics', 'Chemistry', 'Mathematics'];
    if (newPath === 'competitive') {
      const ex = newExam || competitiveExam;
      if (ex === 'NEET') newSubs = ['Physics', 'Chemistry', 'Biology'];
      else if (ex === 'UPSC CSE' || ex === 'SSC CGL') newSubs = ['General Studies', 'Current Affairs', 'Logical Reasoning', 'History & Polity'];
      else if (ex === 'CAT') newSubs = ['Quantitative Aptitude', 'Data Interpretation', 'Verbal Ability'];
      else if (ex === 'CLAT') newSubs = ['Legal Reasoning', 'Logical Reasoning', 'English Language', 'General Knowledge'];
    } else {
      const st = newStream || stream;
      if (st === 'Science PCB') newSubs = ['Physics', 'Chemistry', 'Biology'];
      else if (st === 'Commerce') newSubs = ['Accountancy', 'Economics', 'Business Studies', 'Mathematics'];
      else if (st === 'Arts') newSubs = ['History', 'Political Science', 'Geography', 'Economics'];
    }
    setSubjects(newSubs);

    const initialConf: Record<string, number> = {};
    newSubs.forEach((s) => {
      initialConf[s] = 50;
    });
    setConfidence(initialConf);
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleFinish = (launchDiagnostic: boolean) => {
    const profile: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name.trim() || 'Aspirant',
      avatarSeed: name || 'friday',
      path,
      board: path === 'school' ? board : undefined,
      grade: path === 'school' ? grade : undefined,
      stream: path === 'school' ? stream : undefined,
      competitiveExam: path === 'competitive' ? competitiveExam : undefined,
      targetYear,
      subjects,
      preferredLanguage,
      learningStyle,
      dailyStudyHours: dailyHours,
      examDate,
      subjectConfidence: confidence,
      onboardingCompleted: true,
      streakDays: 1,
      lastActiveDate: new Date().toISOString(),
      totalXp: 100,
      level: 1,
      badges: ['New Explorer', 'FRIDAY Pilot'],
    };

    onComplete(profile, launchDiagnostic);
  };

  // Calculate days remaining to exam
  const daysUntilExam = Math.max(
    1,
    Math.round((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="min-h-screen bg-[#0B1020] flex items-center justify-center p-4 md:p-8">
      {/* Background ambient glow orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl glass-panel rounded-3xl p-6 md:p-10 border border-slate-800 shadow-2xl relative z-10">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <FridayLogo size={32} showText={false} />
            <span className="font-heading font-black text-slate-100 tracking-wider">FRIDAY SETUP</span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-7 bg-gradient-to-r from-indigo-500 to-cyan-400'
                    : s < step
                    ? 'w-3 bg-indigo-500/60'
                    : 'w-3 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Welcome & Name */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Welcome to your AI Study Companion
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white font-heading">
                What should FRIDAY call you?
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Let's configure your personalized adaptive learning engine.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Your Name or Nickname</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aryan, Ananya, Kabir"
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-base"
                autoFocus
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-start gap-3">
              <span className="text-2xl">🤖</span>
              <div className="text-xs text-slate-300 leading-relaxed">
                FRIDAY uses <strong>Bayesian Knowledge Tracing</strong> to measure topic mastery, adapts to your exam syllabus, and grounds answers strictly in verified curriculum notes.
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Path & Exam Selection */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white font-heading">
                Select your academic path
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Choose between school board curriculum or competitive exam preparation.
              </p>
            </div>

            {/* Path Toggle */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setPath('competitive');
                  handlePathOrStreamChange('competitive');
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  path === 'competitive'
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Trophy className="w-6 h-6 text-cyan-400 mb-2" />
                <div className="font-bold text-white text-sm">Competitive Exam</div>
                <div className="text-xs text-slate-400 mt-1">JEE, NEET, UPSC, GATE, CAT, etc.</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPath('school');
                  handlePathOrStreamChange('school');
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  path === 'school'
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <School className="w-6 h-6 text-indigo-400 mb-2" />
                <div className="font-bold text-white text-sm">School / Board Exam</div>
                <div className="text-xs text-slate-400 mt-1">Class 6–12 (CBSE, ICSE, State)</div>
              </button>
            </div>

            {path === 'competitive' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Exam</label>
                  <select
                    value={competitiveExam}
                    onChange={(e) => {
                      const ex = e.target.value as CompetitiveExam;
                      setCompetitiveExam(ex);
                      handlePathOrStreamChange('competitive', undefined, ex);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {COMPETITIVE_EXAMS.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Year</label>
                  <select
                    value={targetYear}
                    onChange={(e) => setTargetYear(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Board</label>
                  <select
                    value={board}
                    onChange={(e) => setBoard(e.target.value as SchoolBoard)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none"
                  >
                    {BOARDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Class</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none"
                  >
                    {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                {(grade === 'Class 11' || grade === 'Class 12') && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Stream</label>
                    <select
                      value={stream}
                      onChange={(e) => {
                        setStream(e.target.value);
                        handlePathOrStreamChange('school', e.target.value);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none"
                    >
                      <option value="Science PCM">Science (Physics, Chemistry, Maths)</option>
                      <option value="Science PCB">Science (Physics, Chemistry, Biology)</option>
                      <option value="Commerce">Commerce with Maths</option>
                      <option value="Arts">Humanities / Arts</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Active Subjects for Friday:</label>
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Language & Learning Style */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white font-heading">
                Language & Learning Style
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                FRIDAY explains technical terminology in English with seamless explanations in your preferred tongue.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Preferred Language</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setPreferredLanguage(lang)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      preferredLanguage === lang
                        ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">How do you learn best?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LEARNING_STYLES.map((ls) => (
                  <button
                    key={ls.id}
                    type="button"
                    onClick={() => setLearningStyle(ls.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      learningStyle === ls.id
                        ? 'bg-cyan-500/10 border-cyan-400 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{ls.icon}</span>
                      <span className="font-semibold text-white text-xs md:text-sm">{ls.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{ls.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Study Hours, Exam Date & Subject Confidence */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white font-heading">
                Pacing & Baseline Confidence
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                FRIDAY uses this to calibrate the study schedule and initialize your Bayesian priors.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> Daily Study Hours
                  </span>
                  <span className="text-indigo-400 font-bold text-sm">{dailyHours} hours/day</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Exam Date
                  </span>
                  <span className="text-cyan-400 font-bold text-xs">{daysUntilExam} days away</span>
                </div>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-3 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-400" /> Rate Your Initial Confidence per Subject (0–100%)
              </label>
              <div className="space-y-3">
                {subjects.map((sub) => (
                  <div key={sub} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-200 font-medium">{sub}</span>
                      <span className="text-indigo-400 font-bold">{confidence[sub] ?? 50}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="95"
                      value={confidence[sub] ?? 50}
                      onChange={(e) =>
                        setConfidence({ ...confidence, [sub]: parseInt(e.target.value) })
                      }
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Diagnostic Test or Skip */}
        {step === 5 && (
          <div className="space-y-6 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-cyan-400 mx-auto flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white font-heading">
                All Set, {name || 'Aspirant'}!
              </h2>
              <p className="text-slate-300 text-sm max-w-md mx-auto mt-2">
                Would you like to take a short 15-minute <strong>Diagnostic Test</strong> to accurately calibrate your Knowledge Map, or start directly on the Dashboard?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <button
                type="button"
                onClick={() => handleFinish(true)}
                className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-cyan-500/20 border-2 border-indigo-400 hover:border-cyan-300 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Recommended</span>
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="font-bold text-white text-base">Take Diagnostic Test</div>
                <div className="text-xs text-slate-300 mt-1">
                  15 adaptive questions generated by Gemini. Seeds your Bayesian Knowledge Tracing model with empirical data.
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFinish(false)}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fast Start</span>
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </div>
                <div className="font-bold text-slate-200 text-base">Skip, Start Fresh</div>
                <div className="text-xs text-slate-400 mt-1">
                  Use your self-rated slider estimates. You can always take diagnostic assessments later from the tests tab.
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 && (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold text-sm hover:opacity-90 shadow-lg shadow-indigo-500/25 transition-all"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
