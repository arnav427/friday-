export type EducationPath = 'school' | 'competitive';

export type SchoolBoard = 'CBSE' | 'ICSE' | 'State Board' | 'IB' | 'Cambridge';

export type CompetitiveExam =
  | 'JEE Main'
  | 'JEE Advanced'
  | 'NEET'
  | 'UPSC CSE'
  | 'GATE'
  | 'CAT'
  | 'SSC CGL'
  | 'CLAT'
  | 'Other';

export type LearningStyle = 'visual' | 'reading' | 'practice-heavy' | 'audio';

export type SupportedLanguage =
  | 'English'
  | 'Hindi'
  | 'Hinglish'
  | 'Bengali'
  | 'Tamil'
  | 'Telugu'
  | 'Marathi'
  | 'Gujarati'
  | 'Kannada'
  | 'Malayalam'
  | 'Punjabi'
  | 'Urdu';

export interface UserProfile {
  id: string;
  name: string;
  avatarSeed: string;
  path: EducationPath;
  board?: SchoolBoard;
  grade?: string; // e.g. "Class 11"
  stream?: string; // "Science PCM", "Science PCB", "Commerce", "Arts"
  competitiveExam?: CompetitiveExam;
  targetYear?: string;
  subjects: string[];
  preferredLanguage: SupportedLanguage;
  learningStyle: LearningStyle;
  dailyStudyHours: number;
  examDate: string; // ISO date string
  subjectConfidence: Record<string, number>; // 0 to 100
  onboardingCompleted: boolean;
  streakDays: number;
  lastActiveDate: string;
  totalXp: number;
  level: number;
  badges: string[];
}

export type QuestionType = 'MCQ' | 'MULTIPLE_SELECT' | 'NUMERICAL' | 'ASSERTION_REASON';

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  id: string;
  type: QuestionType;
  topic: string;
  subtopic: string;
  difficulty: QuestionDifficulty;
  question: string;
  options: string[];
  correct_answer: string;
  step_by_step_solution: string;
  common_misconception: string;
  source_reference: string;
  verified?: boolean;
  verifierNotes?: string;
  hash?: string;
}

export interface QuizAttemptAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  markedForReview?: boolean;
}

export interface QuizResult {
  id: string;
  quizTitle: string;
  subject: string;
  topic: string;
  date: string;
  totalQuestions: number;
  score: number;
  maxScore: number;
  accuracy: number;
  totalTimeSeconds: number;
  answers: QuizAttemptAnswer[];
  topicWiseAccuracy: Record<string, { total: number; correct: number }>;
  weakTopicsDetected: string[];
  misconceptionsDetected: string[];
  recommendedActions: string[];
}

export interface BKTParameters {
  p_init: number; // Prior probability of knowing concept
  p_learn: number; // Probability of transitioning from unlearned to learned
  p_slip: number; // Probability of making an error despite knowing
  p_guess: number; // Probability of guessing correctly without knowing
}

export interface TopicMastery {
  topicId: string;
  topicName: string;
  subject: string;
  masteryProbability: number; // 0.0 to 1.0 (BKT posterior)
  bktParams: BKTParameters;
  lastPracticed: string; // ISO date
  totalAttempts: number;
  correctAttempts: number;
  // SM-2 Spaced Repetition fields
  repetitionNumber: number;
  intervalDays: number;
  easinessFactor: number;
  nextReviewDate: string; // ISO date
  retrievabilityScore: number; // calculated using forgetting curve: e^(-t/S)
}

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  topic: string;
  type: 'concept_study' | 'practice_quiz' | 'revision' | 'mock_exam';
  durationMinutes: number;
  completed: boolean;
  scheduledDate: string; // YYYY-MM-DD
  priority: 'high' | 'medium' | 'low';
}

export interface StudyPlan {
  generatedDate: string;
  targetExamDate: string;
  tasks: StudyTask[];
}

export interface DailyGoal {
  id: string;
  title: string;
  xpReward: number;
  completed: boolean;
  category?: 'practice' | 'reading' | 'revision' | 'doubt';
  targetMinutes?: number;
  createdAt: string;
}

export interface SourceChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  pageOrSlideOrTimestamp: string;
  text: string;
  tags: string[];
}

export interface SourceDocument {
  id: string;
  title: string;
  type: 'pdf' | 'notes' | 'slides' | 'youtube';
  subject: string;
  urlOrFilename: string;
  uploadedDate: string;
  chunks: SourceChunk[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode?: 'standard' | 'eli5' | 'exam' | 'solver' | 'socratic';
  citations?: { id: string; label: string; excerpt: string }[];
  isOutsideKnowledge?: boolean;
  imagePreview?: string;
}

export interface Flashcard {
  id: string;
  topic: string;
  subject: string;
  front: string;
  back: string;
  formulaOrLatex?: string;
  repetition: number;
  interval: number;
  easeFactor: number;
  dueDate: string;
}

export interface DoubtItem {
  id: string;
  title: string;
  subject: string;
  topic: string;
  question: string;
  solution?: string;
  savedDate: string;
  status: 'unresolved' | 'resolved';
}

export interface RagEvaluationTestCase {
  id: string;
  query: string;
  context: string;
  groundTruth: string;
  isRefusalExpected: boolean;
  sourceDoc: string;
  generatedAnswer?: string;
  scores?: {
    faithfulness: number;
    answer_relevancy: number;
    context_precision: number;
    context_recall: number;
    overall_rag_score: number;
    correctly_refused?: boolean;
    critique?: string;
  };
  status?: 'pending' | 'running' | 'completed' | 'failed';
}

export interface VirtualStudentProfile {
  id: string;
  name: string;
  type: 'weak' | 'average' | 'strong' | 'careless';
  description: string;
  trueAbilityTheta: number; // IRT ability parameter (-2.0 to +2.0)
  slipProbability: number;
  guessProbability: number;
  learningRate: number;
  sessionHistory: {
    sessionNumber: number;
    accuracy: number;
    estimatedMastery: number;
    uniqueQuestionsCount: number;
  }[];
}
