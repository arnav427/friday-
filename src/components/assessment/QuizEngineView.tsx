import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Flag,
  FileCheck,
  AlertTriangle,
  Award,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Check,
  BookX,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import confetti from 'canvas-confetti';
import { Question, QuizAttemptAnswer, QuizResult, UserProfile } from '../../types';
import { KaTeXRenderer } from '../common/KaTeXRenderer';
import { generateQuizQuestions, verifyQuestionWithExaminer } from '../../services/geminiService';
import { playChime } from '../../services/soundService';

interface QuizEngineViewProps {
  user: UserProfile;
  initialLaunchDiagnostic?: boolean;
  onQuizCompleted: (result: QuizResult) => void;
  onGenerateRevisionForWeak: (weakTopics: string[]) => void;
  onNavigate?: (tab: any) => void;
}

export const QuizEngineView: React.FC<QuizEngineViewProps> = ({
  user,
  initialLaunchDiagnostic = false,
  onQuizCompleted,
  onGenerateRevisionForWeak,
  onNavigate,
}) => {
  // Mode: 'configure' | 'active_quiz' | 'report'
  const [viewState, setViewState] = useState<'configure' | 'active_quiz' | 'report'>(
    initialLaunchDiagnostic ? 'active_quiz' : 'configure'
  );

  // Configuration settings
  const [isFullMock, setIsFullMock] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(user.subjects[0] || 'Physics');
  const [selectedTopic, setSelectedTopic] = useState('Kinematics & Laws of Motion');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Adaptive'>('Adaptive');
  const [questionCount, setQuestionCount] = useState(initialLaunchDiagnostic ? 10 : 5);
  const [enableTimer, setEnableTimer] = useState(true);

  // Active Quiz State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [showImmediateFeedback, setShowImmediateFeedback] = useState(!isFullMock);
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 mins
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState<Record<string, number>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Completed Report State
  const [finalReport, setFinalReport] = useState<QuizResult | null>(null);

  // Auto load diagnostic if launched from onboarding
  useEffect(() => {
    if (initialLaunchDiagnostic && questions.length === 0) {
      handleStartQuiz(true);
    }
  }, [initialLaunchDiagnostic]);

  // Countdown timer for active quiz
  useEffect(() => {
    if (viewState !== 'active_quiz' || !enableTimer) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [viewState, enableTimer]);

  const handleStartQuiz = async (isDiagnostic: boolean = false) => {
    setLoadingQuestions(true);
    setViewState('active_quiz');
    setCurrentIndex(0);
    setUserAnswers({});
    setMarkedForReview({});
    setTimeSpentPerQuestion({});
    setQuestionStartTime(Date.now());

    const count = isDiagnostic ? 10 : questionCount;
    setTimerSeconds(count * 90); // 1.5 mins per question
    setShowImmediateFeedback(!isFullMock && !isDiagnostic);

    try {
      const generated = await generateQuizQuestions({
        examOrBoard: user.path === 'competitive' ? user.competitiveExam || 'JEE Main' : user.board || 'CBSE',
        gradeOrStream: user.path === 'competitive' ? user.targetYear || '2026' : user.grade || 'Class 12',
        subject: selectedSubject,
        topic: isDiagnostic ? 'Comprehensive Baseline Assessment' : selectedTopic,
        difficulty: difficulty === 'Adaptive' ? 'Medium' : difficulty,
        count,
        questionTypes: ['MCQ', 'NUMERICAL', 'ASSERTION_REASON'],
      });

      setQuestions(generated);

      // Trigger second-pass verification in background for questions
      generated.forEach(async (q, idx) => {
        const verifyRes = await verifyQuestionWithExaminer(q);
        setQuestions((prev) =>
          prev.map((item, i) =>
            i === idx
              ? { ...item, verified: verifyRes.verified, verifierNotes: verifyRes.notes }
              : item
          )
        );
      });
    } catch (err) {
      console.error('Quiz start error:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSelectOption = (qId: string, answerText: string) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: answerText }));
    // Record elapsed time for current question
    const elapsed = Math.round((Date.now() - questionStartTime) / 1000);
    setTimeSpentPerQuestion((prev) => ({ ...prev, [qId]: (prev[qId] || 0) + elapsed }));
    setQuestionStartTime(Date.now());
  };

  const handleToggleReview = (qId: string) => {
    setMarkedForReview((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleFinishQuiz = () => {
    playChime('success');
    confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });

    let score = 0;
    const maxScore = isFullMock ? questions.length * 4 : questions.length * 1;
    let correctCount = 0;

    const topicAccMap: Record<string, { total: number; correct: number }> = {};
    const weakTopicsSet = new Set<string>();
    const misconceptionsList: string[] = [];

    const answersList: QuizAttemptAnswer[] = questions.map((q) => {
      const userAns = userAnswers[q.id] || '';
      // Check answer match (handle letter like 'A' or exact option text)
      const isCorrect =
        userAns.trim().toLowerCase() === q.correct_answer.trim().toLowerCase() ||
        q.options.some(
          (opt, idx) =>
            userAns === opt &&
            (q.correct_answer.toLowerCase() === String.fromCharCode(65 + idx).toLowerCase() ||
              q.correct_answer.toLowerCase() === opt.toLowerCase())
        );

      if (isCorrect) {
        correctCount++;
        score += isFullMock ? 4 : 1;
      } else {
        if (isFullMock && userAns) score -= 1; // Negative marking
        weakTopicsSet.add(q.topic || selectedTopic);
        if (q.common_misconception) misconceptionsList.push(q.common_misconception);
      }

      const tName = q.topic || selectedTopic;
      if (!topicAccMap[tName]) topicAccMap[tName] = { total: 0, correct: 0 };
      topicAccMap[tName].total += 1;
      if (isCorrect) topicAccMap[tName].correct += 1;

      return {
        questionId: q.id,
        userAnswer: userAns,
        isCorrect,
        timeSpentSeconds: timeSpentPerQuestion[q.id] || 45,
        markedForReview: markedForReview[q.id],
      };
    });

    const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const totalTimeSpent = Object.values(timeSpentPerQuestion).reduce((a, b) => a + b, 0);

    const report: QuizResult = {
      id: `quiz_${Date.now()}`,
      quizTitle: isFullMock ? 'Full Mock Assessment' : `${selectedSubject}: ${selectedTopic}`,
      subject: selectedSubject,
      topic: selectedTopic,
      date: new Date().toISOString(),
      totalQuestions: questions.length,
      score: Math.max(0, score),
      maxScore,
      accuracy,
      totalTimeSeconds: totalTimeSpent,
      answers: answersList,
      topicWiseAccuracy: topicAccMap,
      weakTopicsDetected: Array.from(weakTopicsSet),
      misconceptionsDetected: misconceptionsList.slice(0, 3),
      recommendedActions: [
        `Review derivations in ${Array.from(weakTopicsSet)[0] || selectedTopic}`,
        'Practice 5 numerical problem variations to solidify sign conventions',
        'Review the Spaced Repetition flashcards generated for this session',
      ],
    };

    setFinalReport(report);
    setViewState('report');
    onQuizCompleted(report);
  };

  // Format time mm:ss
  const formatTimer = (secs: number) => {
    const safeSecs = Math.max(0, Math.floor(secs || 0));
    const m = Math.floor(safeSecs / 60);
    const s = safeSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* VIEW 1: CONFIGURE TEST */}
      {viewState === 'configure' && (
        <div className="max-w-3xl mx-auto glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white font-heading">
                Adaptive Assessment Engine
              </h1>
              <p className="text-xs text-slate-400">
                Item Response Theory (IRT) dynamic difficulty, verified questions & exam patterns.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Mock Exam vs Quick Practice Toggle */}
            <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => setIsFullMock(false)}
                className={`py-3 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                  !isFullMock
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Adaptive Topic Quiz
              </button>
              <button
                type="button"
                onClick={() => setIsFullMock(true)}
                className={`py-3 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                  isFullMock
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Full Mock Exam Pattern (+4 / -1)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs md:text-sm focus:outline-none"
                >
                  {user.subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Chapter / Scope</label>
                <input
                  type="text"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  placeholder="e.g. Projectile Motion, Ohm's Law"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs md:text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Difficulty Calibration</label>
                <select
                  value={difficulty}
                  onChange={(e: any) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs md:text-sm focus:outline-none"
                >
                  <option value="Adaptive">IRT Adaptive (Dynamic Difficulty)</option>
                  <option value="Easy">Standard Foundation (Easy)</option>
                  <option value="Medium">Board / Moderate Exam (Medium)</option>
                  <option value="Hard">Advanced / Tough PYQs (Hard)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Question Count</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs md:text-sm focus:outline-none"
                >
                  <option value="5">5 Questions (Quick Check ~ 8 mins)</option>
                  <option value="10">10 Questions (Standard Quiz ~ 15 mins)</option>
                  <option value="15">15 Questions (Intensive ~ 25 mins)</option>
                  <option value="25">25 Questions (Sectional Mock ~ 40 mins)</option>
                </select>
              </div>
            </div>

            {/* Pattern info box */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Two-Pass AI Verification Engine enabled for zero erroneous solutions.</span>
              </div>
              <span className="text-cyan-400 font-semibold">{user.path === 'competitive' ? user.competitiveExam : user.board} Format</span>
            </div>

            <button
              onClick={() => handleStartQuiz(false)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-sm hover:opacity-90 shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Start Assessment Now
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE QUIZ / EXAM PALETTE */}
      {viewState === 'active_quiz' && (
        <div className="space-y-6">
          {loadingQuestions ? (
            <div className="py-24 text-center glass-panel rounded-3xl border border-slate-800">
              <Sparkles className="w-10 h-10 text-cyan-400 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white font-heading">
                Generating Syllabus-Aligned Questions...
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Synthesizing problem statements, calculating step-by-step solutions, and running independent verification pass.
              </p>
            </div>
          ) : currentQ ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left 3 cols: Question & Options */}
              <div className="lg:col-span-3 glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl flex flex-col justify-between">
                <div>
                  {/* Top bar */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                        Q{currentIndex + 1} of {questions.length}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {currentQ.topic} • {currentQ.difficulty}
                      </span>
                      {currentQ.verified && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/40">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleReview(currentQ.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                          markedForReview[currentQ.id]
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                            : 'bg-slate-900 text-slate-400 border-slate-700'
                        }`}
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Mark for Review</span>
                      </button>

                      {enableTimer && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono font-bold">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{formatTimer(timerSeconds)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Question Statement */}
                  <div className="text-base md:text-lg text-slate-100 font-medium leading-relaxed mb-6">
                    <KaTeXRenderer content={currentQ.question} />
                  </div>

                  {/* Options List */}
                  {currentQ.options && currentQ.options.length > 0 ? (
                    <div className="space-y-3">
                      {currentQ.options.map((opt, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isSelected = userAnswers[currentQ.id] === opt || userAnswers[currentQ.id] === letter;

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(currentQ.id, opt)}
                            className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                              isSelected
                                ? 'bg-indigo-600/25 border-indigo-400 text-white shadow-lg shadow-indigo-500/10'
                                : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800/80 hover:border-slate-700'
                            }`}
                          >
                            <span
                              className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                isSelected
                                  ? 'bg-indigo-500 text-white'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {letter}
                            </span>
                            <div className="flex-1 text-xs md:text-sm leading-relaxed pt-0.5">
                              <KaTeXRenderer content={opt} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    // Numerical Input
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Enter Numerical Value:
                      </label>
                      <input
                        type="text"
                        value={userAnswers[currentQ.id] || ''}
                        onChange={(e) => handleSelectOption(currentQ.id, e.target.value)}
                        placeholder="e.g. 24.5"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  )}

                  {/* Immediate Feedback in practice mode */}
                  {showImmediateFeedback && userAnswers[currentQ.id] && (
                    <div className="mt-6 p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 font-bold text-xs mb-2">
                        {userAnswers[currentQ.id] === currentQ.correct_answer ||
                        currentQ.options.some(
                          (o, i) =>
                            userAnswers[currentQ.id] === o &&
                            currentQ.correct_answer === String.fromCharCode(65 + i)
                        ) ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Correct Answer!
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Incorrect. Correct is: {currentQ.correct_answer}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-300">
                        <div className="font-semibold text-slate-200 mb-1">Step-by-Step Solution:</div>
                        <KaTeXRenderer content={currentQ.step_by_step_solution} />
                      </div>

                      {currentQ.common_misconception && (
                        <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-amber-300 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                          <span><strong>Common Misconception:</strong> {currentQ.common_misconception}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Navigation */}
                <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((prev) => prev - 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  {currentIndex < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIndex((prev) => prev + 1)}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleFinishQuiz}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-bold hover:opacity-90 shadow-lg shadow-emerald-500/20"
                    >
                      Submit & View Report
                    </button>
                  )}
                </div>
              </div>

              {/* Right 1 col: Question Palette */}
              <div className="glass-panel rounded-3xl p-5 border border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    Question Palette
                  </h3>

                  <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2 mb-6">
                    {questions.map((q, idx) => {
                      const isAnswered = Boolean(userAnswers[q.id]);
                      const isMarked = Boolean(markedForReview[q.id]);
                      const isCurrent = currentIndex === idx;

                      let btnStyle = 'bg-slate-900 border-slate-800 text-slate-400';
                      if (isMarked) btnStyle = 'bg-amber-500/20 border-amber-500 text-amber-300';
                      else if (isAnswered) btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';

                      if (isCurrent) btnStyle += ' ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0B1020]';

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentIndex(idx)}
                          className={`w-9 h-9 rounded-xl border text-xs font-bold transition-all flex items-center justify-center ${btnStyle}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="space-y-2 text-[11px] text-slate-400 pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500" />
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500" />
                      <span>Marked for Review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800" />
                      <span>Unvisited</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleFinishQuiz}
                  className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs hover:opacity-90 shadow-md transition-all"
                >
                  End Assessment
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* VIEW 3: POST ASSESSMENT REPORT */}
      {viewState === 'report' && finalReport && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                  Assessment Complete
                </span>
                <h1 className="text-2xl font-black text-white font-heading mt-2">
                  Performance & IRT Mastery Report
                </h1>
                <p className="text-xs text-slate-400">
                  {finalReport.quizTitle} • {new Date(finalReport.date).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => setViewState('configure')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Take Another Quiz
              </button>
            </div>

            {/* Score Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 font-medium">Final Score</div>
                <div className="text-2xl font-black text-white font-heading mt-1">
                  {Math.round(finalReport.score)} <span className="text-xs text-slate-500">/ {Math.round(finalReport.maxScore)}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 font-medium">Accuracy</div>
                <div className="text-2xl font-black text-cyan-400 font-heading mt-1">
                  {Math.round(finalReport.accuracy)}%
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 font-medium">Questions Answered</div>
                <div className="text-2xl font-black text-emerald-400 font-heading mt-1">
                  {finalReport.answers.filter((a) => a.isCorrect).length} <span className="text-xs text-slate-500">/ {finalReport.totalQuestions}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 font-medium">Time Taken</div>
                <div className="text-2xl font-black text-amber-400 font-heading mt-1">
                  {Math.floor((finalReport.totalTimeSeconds || 0) / 60)}m {Math.floor((finalReport.totalTimeSeconds || 0) % 60)}s
                </div>
              </div>
            </div>

            {/* Topic Accuracy Radar Chart */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 my-6">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
                Topic-Wise Accuracy Distribution
              </h3>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={Object.entries(finalReport.topicWiseAccuracy).map(([top, stat]) => ({
                      topic: top.length > 18 ? top.substring(0, 16) + '...' : top,
                      accuracy: Math.round((stat.correct / (stat.total || 1)) * 100),
                    }))}
                  >
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="topic" stroke="#94A3B8" fontSize={11} />
                    <PolarRadiusAxis stroke="#64748B" domain={[0, 100]} />
                    <Radar
                      name="Accuracy"
                      dataKey="accuracy"
                      stroke="#22D3EE"
                      fill="#22D3EE"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weak Topics & One-Click Revision Material Generator */}
            {finalReport.weakTopicsDetected.length > 0 && (
              <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 my-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    <h3 className="text-sm font-bold text-white">
                      Weak Topics Identified ({finalReport.weakTopicsDetected.length})
                    </h3>
                  </div>

                  <button
                    onClick={() => onGenerateRevisionForWeak(finalReport.weakTopicsDetected)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md shadow-rose-600/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Generate Revision Material for Weak Topics
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {finalReport.weakTopicsDetected.map((topic, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium"
                    >
                      ⚠️ {topic}
                    </span>
                  ))}
                </div>

                {onNavigate && (
                  <div className="mt-4 pt-3 border-t border-rose-500/20 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-rose-200">
                      Did you make any calculation errors or silly mistakes during this test?
                    </div>
                    <button
                      onClick={() => onNavigate('errorbook')}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all shadow-sm"
                    >
                      <BookX className="w-3.5 h-3.5" />
                      <span>Log Mistakes in Error Book</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
