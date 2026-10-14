/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavTab, Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { CommandPalette } from './components/common/CommandPalette';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { DashboardView } from './components/dashboard/DashboardView';
import { TutorChatView } from './components/tutor/TutorChatView';
import { QuizEngineView } from './components/assessment/QuizEngineView';
import { KnowledgeBaseView } from './components/knowledge/KnowledgeBaseView';
import { SummarizerView } from './components/summarizer/SummarizerView';
import { ProblemSolverView } from './components/solver/ProblemSolverView';
import { StudyPlannerView } from './components/planner/StudyPlannerView';
import { SimulationLabView } from './components/simulations/SimulationLabView';
import { RevisionToolsView } from './components/revision/RevisionToolsView';
import { EvaluationView } from './components/evaluation/EvaluationView';
import { DoubtInboxModal } from './components/doubts/DoubtInboxModal';
import { ProfileSettingsModal } from './components/common/ProfileSettingsModal';
import { FloatingLiveAssistant } from './components/common/FloatingLiveAssistant';
import { LiveExamNewsView } from './components/news/LiveExamNewsView';
import { ErrorBookView } from './components/errorbook/ErrorBookView';
import {
  UserProfile,
  TopicMastery,
  StudyTask,
  QuizResult,
  DoubtItem,
  SupportedLanguage,
} from './types';
import { seedCurriculumTopics, updateBKT } from './services/bktService';

// Default initial user profile (seeded demo state)
const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr_demo_101',
  name: 'Aryan Sharma',
  avatarSeed: 'Aryan',
  path: 'competitive',
  competitiveExam: 'JEE Main',
  targetYear: '2026',
  subjects: ['Physics', 'Chemistry', 'Mathematics'],
  preferredLanguage: 'English',
  learningStyle: 'practice-heavy',
  dailyStudyHours: 4,
  examDate: '2026-11-20',
  subjectConfidence: { Physics: 55, Chemistry: 45, Mathematics: 65 },
  onboardingCompleted: true,
  streakDays: 5,
  lastActiveDate: new Date().toISOString(),
  totalXp: 540,
  level: 3,
  badges: ['Daily Achiever', 'Kinematics Ace', 'Two-Pass Verified'],
};

// Initial Seed Tasks
const INITIAL_STUDY_TASKS: StudyTask[] = [
  {
    id: 'task_1',
    title: 'Kinematics: 2D Projectile Trajectory Derivation & Problem Solving',
    subject: 'Physics',
    topic: 'Kinematics & Projectile Motion',
    type: 'concept_study',
    durationMinutes: 45,
    completed: false,
    scheduledDate: new Date().toISOString().split('T')[0],
    priority: 'high',
  },
  {
    id: 'task_2',
    title: 'Newtonian Dynamics: Limiting Friction & Incline Angles',
    subject: 'Physics',
    topic: "Newton's Laws of Motion & Friction",
    type: 'practice_quiz',
    durationMinutes: 30,
    completed: true,
    scheduledDate: new Date().toISOString().split('T')[0],
    priority: 'high',
  },
  {
    id: 'task_3',
    title: 'Differential Calculus: Critical Points & Maxima/Minima',
    subject: 'Mathematics',
    topic: 'Differential Calculus & Limits',
    type: 'concept_study',
    durationMinutes: 40,
    completed: false,
    scheduledDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
  },
  {
    id: 'task_4',
    title: 'Drift Velocity & Kirchhoff Network Rules Spaced Revision',
    subject: 'Physics',
    topic: "Current Electricity & Ohm's Law",
    type: 'revision',
    durationMinutes: 25,
    completed: false,
    scheduledDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
  },
];

const INITIAL_DOUBTS: DoubtItem[] = [
  {
    id: 'd_1',
    title: 'Zero Work Done in Uniform Circular Motion?',
    subject: 'Physics',
    topic: 'Work, Energy & Power',
    question:
      'Why is the work done by a centripetal force strictly zero over any orbital arc? If acceleration is non-zero (v^2/r), why does kinetic energy remain constant?',
    savedDate: new Date().toISOString(),
    status: 'unresolved',
  },
  {
    id: 'd_2',
    title: 'Distinction between Static and Kinetic Friction',
    subject: 'Physics',
    topic: "Newton's Laws of Motion & Friction",
    question:
      'When an applied force is smaller than mu_s * N, does friction equal the applied force or mu_s * N? Why is it self-adjusting?',
    savedDate: new Date().toISOString(),
    status: 'unresolved',
  },
];

export default function App() {
  // 1. Persistent User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('friday_user_profile');
      return stored ? JSON.parse(stored) : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  });

  // 2. Persistent BKT Mastery Map
  const [masteryMap, setMasteryMap] = useState<Record<string, TopicMastery>>(() => {
    try {
      const stored = localStorage.getItem('friday_topic_mastery');
      return stored
        ? JSON.parse(stored)
        : seedCurriculumTopics(user.subjects, user.subjectConfidence);
    } catch {
      return seedCurriculumTopics(user.subjects, user.subjectConfidence);
    }
  });

  // 3. Persistent Study Tasks
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>(() => {
    try {
      const stored = localStorage.getItem('friday_study_tasks');
      return stored ? JSON.parse(stored) : INITIAL_STUDY_TASKS;
    } catch {
      return INITIAL_STUDY_TASKS;
    }
  });

  // 4. Doubts Inbox
  const [doubts, setDoubts] = useState<DoubtItem[]>(() => {
    try {
      const stored = localStorage.getItem('friday_doubts');
      return stored ? JSON.parse(stored) : INITIAL_DOUBTS;
    } catch {
      return INITIAL_DOUBTS;
    }
  });

  // 5. Recent Quizzes
  const [recentQuizzes, setRecentQuizzes] = useState<QuizResult[]>(() => {
    try {
      const stored = localStorage.getItem('friday_recent_quizzes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // App UI Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDoubtsModalOpen, setIsDoubtsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [launchDiagnosticDirectly, setLaunchDiagnosticDirectly] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('friday_user_profile', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('friday_topic_mastery', JSON.stringify(masteryMap));
  }, [masteryMap]);

  useEffect(() => {
    localStorage.setItem('friday_study_tasks', JSON.stringify(studyTasks));
  }, [studyTasks]);

  useEffect(() => {
    localStorage.setItem('friday_doubts', JSON.stringify(doubts));
  }, [doubts]);

  useEffect(() => {
    localStorage.setItem('friday_recent_quizzes', JSON.stringify(recentQuizzes));
  }, [recentQuizzes]);

  // Handle dark mode toggle
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDarkMode]);

  // Handle Onboarding Completion
  const handleOnboardingComplete = (profile: UserProfile, launchDiagnostic: boolean) => {
    setUser(profile);
    const initialMastery = seedCurriculumTopics(profile.subjects, profile.subjectConfidence);
    setMasteryMap(initialMastery);

    if (launchDiagnostic) {
      setLaunchDiagnosticDirectly(true);
      setCurrentTab('assessment');
    } else {
      setCurrentTab('dashboard');
    }
  };

  // Toggle study task completion
  const handleToggleTask = (taskId: string) => {
    setStudyTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  // Bayesian Knowledge Tracing Update after Quiz
  const handleQuizCompleted = (result: QuizResult) => {
    setRecentQuizzes((prev) => [result, ...prev]);

    // Update BKT mastery for each answered topic
    setMasteryMap((prev) => {
      const updated = { ...prev };
      result.answers.forEach((ans) => {
        // Find matching topic or closest
        const foundKey = Object.keys(updated).find((k) =>
          updated[k].topicName.toLowerCase().includes(result.topic.toLowerCase())
        );

        if (foundKey && updated[foundKey]) {
          const old = updated[foundKey];
          const newProb = updateBKT(old.masteryProbability, ans.isCorrect, old.bktParams);

          updated[foundKey] = {
            ...old,
            masteryProbability: newProb,
            totalAttempts: old.totalAttempts + 1,
            correctAttempts: old.correctAttempts + (ans.isCorrect ? 1 : 0),
            lastPracticed: new Date().toISOString(),
          };
        }
      });
      return updated;
    });

    // Award XP
    // Award XP
    setUser((prev) => {
      const addedXp = Math.round(result.score * 15 + 50);
      const newTotalXp = Math.round(prev.totalXp + addedXp);
      const newLevel = Math.floor(newTotalXp / 250) + 1;
      return {
        ...prev,
        totalXp: newTotalXp,
        level: newLevel,
      };
    });
  };

  // Award XP from completing session mini-goals
  const handleAwardXp = (amount: number, reason?: string) => {
    setUser((prev) => {
      const nextXp = Math.round(prev.totalXp + (amount || 0));
      const nextLevel = Math.floor(nextXp / 250) + 1;
      return {
        ...prev,
        totalXp: nextXp,
        level: nextLevel,
      };
    });
  };

  // Deep link from dashboard to practice topic
  const handlePracticeTopic = (topicName: string, subject: string) => {
    setCurrentTab('assessment');
  };

  const handleStudyTopicInTutor = (topicName: string, subject: string) => {
    setCurrentTab('tutor');
  };

  // Quick Action from Command Palette
  const handleQuickAction = (actionId: string) => {
    if (actionId === 'focus_mode') {
      setCurrentTab('planner');
    } else if (actionId === 'upload_notes') {
      setCurrentTab('knowledge');
    }
  };

  // Doubt Actions
  const handleToggleResolveDoubt = (id: string) => {
    setDoubts((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: d.status === 'resolved' ? 'unresolved' : 'resolved' } : d
      )
    );
  };

  const handleDeleteDoubt = (id: string) => {
    setDoubts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleAddDoubt = (doubt: Omit<DoubtItem, 'id' | 'savedDate' | 'status'>) => {
    const newItem: DoubtItem = {
      ...doubt,
      id: `doubt_${Date.now()}`,
      savedDate: new Date().toISOString(),
      status: 'unresolved',
    };
    setDoubts((prev) => [newItem, ...prev]);
  };

  const handleResetAllData = () => {
    localStorage.clear();
    setUser({ ...DEFAULT_USER_PROFILE, onboardingCompleted: false });
    setIsSettingsOpen(false);
  };

  // If user hasn't completed onboarding, render onboarding wizard
  if (!user.onboardingCompleted) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  const targetExamLabel =
    user.path === 'competitive' ? user.competitiveExam || 'JEE Main' : `${user.board} ${user.grade}`;

  const unresolvedDoubtsCount = doubts.filter((d) => d.status === 'unresolved').length;

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header */}
      <Header
        user={user}
        activeLanguage={user.preferredLanguage}
        onLanguageChange={(lang: SupportedLanguage) =>
          setUser((prev) => ({ ...prev, preferredLanguage: lang }))
        }
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        unresolvedDoubtsCount={unresolvedDoubtsCount}
        onOpenDoubts={() => setIsDoubtsModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="flex-1 flex w-full">
        {/* Left Collapsible Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          targetExamLabel={targetExamLabel}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 md:p-8 max-w-7xl mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              user={user}
              masteryMap={masteryMap}
              studyTasks={studyTasks}
              onToggleTask={handleToggleTask}
              recentQuizzes={recentQuizzes}
              onNavigate={setCurrentTab}
              onPracticeTopic={handlePracticeTopic}
              onAwardXp={handleAwardXp}
            />
          )}

          {currentTab === 'news' && (
            <LiveExamNewsView
              user={user}
              targetExamLabel={targetExamLabel}
            />
          )}

          {currentTab === 'errorbook' && (
            <ErrorBookView
              user={user}
              targetExamLabel={targetExamLabel}
              onNavigate={setCurrentTab}
              onAwardXp={handleAwardXp}
            />
          )}

          {currentTab === 'tutor' && (
            <TutorChatView
              userLanguage={user.preferredLanguage}
              targetExamLabel={targetExamLabel}
            />
          )}

          {currentTab === 'assessment' && (
            <QuizEngineView
              user={user}
              initialLaunchDiagnostic={launchDiagnosticDirectly}
              onQuizCompleted={handleQuizCompleted}
              onGenerateRevisionForWeak={(weakList) => {
                setCurrentTab('revision');
              }}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'knowledge' && (
            <KnowledgeBaseView
              masteryMap={masteryMap}
              onStudyTopic={handleStudyTopicInTutor}
              onQuizTopic={handlePracticeTopic}
            />
          )}

          {currentTab === 'summarizer' && (
            <SummarizerView
              userLanguage={user.preferredLanguage}
              onGenerateQuizFromNotes={(top, sub) => {
                setCurrentTab('assessment');
              }}
              onGenerateFlashcards={(top, notes) => {
                setCurrentTab('revision');
              }}
            />
          )}

          {currentTab === 'solver' && (
            <ProblemSolverView
              userLanguage={user.preferredLanguage}
              targetExamLabel={targetExamLabel}
              onPracticeSimilar={(prob) => {
                setCurrentTab('assessment');
              }}
            />
          )}

          {currentTab === 'planner' && (
            <StudyPlannerView
              user={user}
              masteryMap={masteryMap}
              tasks={studyTasks}
              onToggleTask={handleToggleTask}
              onUpdateTasks={setStudyTasks}
            />
          )}

          {currentTab === 'simulations' && (
            <SimulationLabView
              onExplainWithTutor={(concept) => {
                setCurrentTab('tutor');
              }}
            />
          )}

          {currentTab === 'revision' && (
            <RevisionToolsView
              user={user}
              userLanguage={user.preferredLanguage}
              weakTopics={Object.values(masteryMap)
                .filter((t) => t.masteryProbability < 0.6)
                .map((t) => t.topicName)}
            />
          )}

          {currentTab === 'evaluation' && <EvaluationView />}
        </main>
      </div>

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setCurrentTab}
        onQuickAction={handleQuickAction}
      />

      {/* Doubt Inbox Modal */}
      <DoubtInboxModal
        isOpen={isDoubtsModalOpen}
        onClose={() => setIsDoubtsModalOpen(false)}
        doubts={doubts}
        onToggleResolve={handleToggleResolveDoubt}
        onDeleteDoubt={handleDeleteDoubt}
        onAskTutorDoubt={(q) => {
          setCurrentTab('tutor');
        }}
        onAddDoubt={handleAddDoubt}
      />

      {/* Profile & Settings Modal */}
      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onUpdateUser={setUser}
        onResetAllData={handleResetAllData}
      />

      {/* Floating Live Gemini Chatbot & Real-Time Voice Conversation (Bottom Right) */}
      <FloatingLiveAssistant
        userLanguage={user.preferredLanguage}
        targetExamLabel={targetExamLabel}
      />
    </div>
  );
}
