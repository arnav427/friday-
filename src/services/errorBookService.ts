/**
 * Error Book Service
 * Manages student mistakes, traps, self-logged errors, and entertaining meme breakdowns
 * to transform exam blunders into high-retention mastery.
 */

export type ErrorType =
  | 'Conceptual Gap'
  | 'Calculation Slip'
  | 'Misread Question / Silly'
  | 'Formula Confusion'
  | 'Time Pressure Panic'
  | 'Unit / Sign Error';

export type ErrorStatus = 'Needs Revision' | 'Reviewed' | 'Mastered';

export type ErrorSeverity = 'High' | 'Medium' | 'Low';

export interface StudentError {
  id: string;
  title: string;
  subject: string;
  topic: string;
  errorType: ErrorType;
  questionContext: string;
  studentAttempt: string;
  correctConcept: string;
  keyTakeaway: string;
  severity: ErrorSeverity;
  status: ErrorStatus;
  reviewCount: number;
  lastReviewedDate?: string;
  createdAt: string;
  tags: string[];
  source: 'Self Logged' | 'Mock Test / Quiz' | 'Problem Solver' | 'Doubt Session';
}

export interface ErrorBookStats {
  total: number;
  needsRevision: number;
  reviewed: number;
  mastered: number;
  bySubject: Record<string, number>;
  byType: Record<ErrorType, number>;
  criticalTrap: string;
}

export interface ErrorMemeBreakdown {
  id: string;
  title: string;
  setup: string;
  punchline: string;
  emoji: string;
  tag: 'Physics' | 'Chemistry' | 'Maths' | 'Biology' | 'Exam Hall';
  mistakeCategory: ErrorType;
  trapExplanation: string;
  brainTrap: string;
  goldenRule: string;
  reactions: {
    tooReal: number;
    didThisToday: number;
    neverAgain: number;
    bigBrain: number;
  };
}

export const CURATED_ERROR_MEMES: ErrorMemeBreakdown[] = [
  {
    id: 'ememe_1',
    title: 'The +4 to -1 Speedrun',
    setup: 'Solved 2 pages of complex differential calculus, found the critical boundary values, substituted limits...',
    punchline: 'Calculated 14 - 9 = 4 in the final 10 seconds of exam adrenaline. Lost 5 whole marks (+4 vanished, -1 awarded).',
    emoji: '💀',
    tag: 'Maths',
    mistakeCategory: 'Calculation Slip',
    trapExplanation: 'Under cognitive load, the brain prioritizes macro-level logic (calculus) and rushes through micro-arithmetic (basic subtraction).',
    brainTrap: 'Premature Finish-Line Euphoria: You feel the relief of solving the problem before writing the final number down.',
    goldenRule: 'Rule of 3 Seconds: When you reach the final arithmetic line, take one deep breath and recalculate just the final line.',
    reactions: { tooReal: 840, didThisToday: 512, neverAgain: 390, bigBrain: 240 },
  },
  {
    id: 'ememe_2',
    title: 'Selective Exam Dyslexia',
    setup: 'Question: "Which of the following statements is NOT correct about ideal gases?"',
    punchline: 'Me: Reads Option (A), sees it is completely true, vigorously marks (A): "Wow, easiest question of my life!"',
    emoji: '😭',
    tag: 'Chemistry',
    mistakeCategory: 'Misread Question / Silly',
    trapExplanation: 'Human brains are pattern-matching machines primed for confirmation bias. We naturally look for "correct" statements and glaze over negative qualifiers.',
    brainTrap: 'Affirmation Bias Bait: Examiners deliberately put a blatantly true statement in Option (A) to trick speed-runners.',
    goldenRule: 'Pen-Circle Protocol: Whenever you spot "NOT", "INCORRECT", or "EXCEPT", circle it with your pen three times before reading Option A.',
    reactions: { tooReal: 960, didThisToday: 680, neverAgain: 420, bigBrain: 310 },
  },
  {
    id: 'ememe_3',
    title: 'The Spontaneous Rocketing Table',
    setup: 'Horizontal force of 3 N applied on a stationary 10 kg block (μ_s = 0.5). What is the friction force?',
    punchline: 'Student calculates: "fs = μ_s * m * g = 0.5 * 10 * 10 = 50 N! The block accelerates backwards with 47 N of net force!"',
    emoji: '🚀',
    tag: 'Physics',
    mistakeCategory: 'Conceptual Gap',
    trapExplanation: 'Static friction is reactive and self-adjusting. It only matches applied force until its threshold fs(max).',
    brainTrap: 'Formula Blindness: Treating static friction formula as an absolute equation rather than an upper inequality ($f_s \\le \\mu_s N$).',
    goldenRule: 'Physical Sanity Check: Can a passive wooden table push a stationary book backwards on its own? If no, $f_s = F_{\\text{applied}} = 3\\text{ N}$!',
    reactions: { tooReal: 720, didThisToday: 340, neverAgain: 510, bigBrain: 450 },
  },
  {
    id: 'ememe_4',
    title: 'The Missing Integration Constant Ghost',
    setup: 'Indefinite integral evaluated to perfection with trigonometric substitution...',
    punchline: 'Did not write "+ C". Examiner deducted full marks. "+ C" is now haunting my college dreams.',
    emoji: '👻',
    tag: 'Maths',
    mistakeCategory: 'Formula Confusion',
    trapExplanation: 'Without + C, you are specifying a single arbitrary curve instead of the infinite family of antiderivatives.',
    brainTrap: 'Symbolic Tunnel Vision: Focusing 100% on algebraic simplification and dropping bookkeeping constants.',
    goldenRule: 'The "+C" Stamp: Never write an equals sign on an indefinite integral without typing "+ C" at the same instant.',
    reactions: { tooReal: 610, didThisToday: 290, neverAgain: 480, bigBrain: 290 },
  },
  {
    id: 'ememe_5',
    title: 'The Cosmic Factor of 100 Disaster',
    setup: 'Formula: $B = \\frac{\\mu_0 I}{2\\pi r}$. Radius given as $r = 5\\text{ cm}$.',
    punchline: 'Substituted $r = 5$ without converting to meters. Calculated a magnetic field stronger than a neutron star inside a 12V school circuit.',
    emoji: '⚡',
    tag: 'Physics',
    mistakeCategory: 'Unit / Sign Error',
    trapExplanation: 'Formulas in electromagnetism, mechanics, and thermodynamics assume SI standard units (meters, seconds, kilograms, Kelvin).',
    brainTrap: 'Numeric Substitution Rush: Brain copies raw numbers directly from the problem statement without checking SI prefix.',
    goldenRule: 'MKS Quarantine: Underline all units in the question stem. Convert cm → $10^{-2}$ m, grams → $10^{-3}$ kg before touching any formula.',
    reactions: { tooReal: 890, didThisToday: 410, neverAgain: 530, bigBrain: 360 },
  },
  {
    id: 'ememe_6',
    title: 'The 2-Liter Volume Illusion',
    setup: 'Equilibrium mixture: 2 moles of $PCl_5$ in a 2.0 Liter container. Calculate $K_c$.',
    punchline: 'Plugged raw moles (2) directly into $[PCl_5]$. Result was off by factor of 4. Chemistry teacher sheds a single tear.',
    emoji: '🧪',
    tag: 'Chemistry',
    mistakeCategory: 'Conceptual Gap',
    trapExplanation: 'Equilibrium constant $K_c$ depends strictly on molar concentrations ($[X] = \\text{moles}/\\text{Volume in Liters}$), not absolute mole counts.',
    brainTrap: 'Molarity Symbol Dismissal: Treating square brackets $[\\ ]$ as regular algebra parentheses rather than Concentration (mol/L).',
    goldenRule: 'Always construct the "ICE Table" with Volume explicitly in the denominator: $[A] = n_A / V$.',
    reactions: { tooReal: 670, didThisToday: 320, neverAgain: 440, bigBrain: 310 },
  },
  {
    id: 'ememe_7',
    title: 'The Incomplete Electron Shell Illusion',
    setup: 'Electronic configuration of Chromium ($Z = 24$):',
    punchline: 'Wrote $[Ar] 3d^4 4s^2$. The half-filled $3d^5$ subshell stability laughs from the textbook corner.',
    emoji: '⚛️',
    tag: 'Chemistry',
    mistakeCategory: 'Formula Confusion',
    trapExplanation: 'Half-filled ($d^5$) and fully-filled ($d^{10}$) orbitals have extra exchange energy and spherical symmetry stability.',
    brainTrap: 'Mechanical Aufbau Syndrome: Blindly filling 4s before 3d without remembering the famous Cr and Cu exceptions.',
    goldenRule: 'Remember: Chromium is $3d^5 4s^1$, Copper is $3d^{10} 4s^1$. Memorize the "Half & Full" rule permanently.',
    reactions: { tooReal: 540, didThisToday: 210, neverAgain: 390, bigBrain: 420 },
  },
  {
    id: 'ememe_8',
    title: 'The Speed vs Velocity Turning Trap',
    setup: 'A particle moves in a circle at a constant speed of $20\\text{ m/s}$.',
    punchline: 'Student writes: "Speed is constant, derivative is zero, so acceleration is 0 m/s²! No net force acting on the car!"',
    emoji: '🏎️',
    tag: 'Physics',
    mistakeCategory: 'Conceptual Gap',
    trapExplanation: 'Acceleration is the time derivative of the VELOCITY vector. Even if magnitude is constant, directional change requires centripetal acceleration $a_c = v^2/r$.',
    brainTrap: 'Scalar-Vector Equivalence Fallacy: Confusing scalar speed with vector velocity.',
    goldenRule: 'Any change in path curvature demands acceleration and inward force! No turn happens without net force.',
    reactions: { tooReal: 780, didThisToday: 310, neverAgain: 510, bigBrain: 390 },
  },
];

// Initial realistic seed student errors for instant value
export const SEED_STUDENT_ERRORS: StudentError[] = [
  {
    id: 'err_1',
    title: 'Dropped negative sign during Work-Energy Integration',
    subject: 'Physics',
    topic: 'Work, Energy & Power',
    errorType: 'Unit / Sign Error',
    questionContext: 'Find work done by restoring spring force $F = -kx$ as displacement goes from $0$ to $x_0$.',
    studentAttempt: 'Wrote $\\int_0^{x_0} kx\\, dx = +\\frac{1}{2}kx_0^2$. Forgot the minus sign in the force definition.',
    correctConcept: 'Work done BY the spring is negative when expanding: $W = \\int (-kx)\\,dx = -\\frac{1}{2}kx_0^2$. Work done AGAINST the spring is positive.',
    keyTakeaway: 'Always distinguish "work done BY the field/spring" vs "work done by EXTERNAL agent".',
    severity: 'High',
    status: 'Needs Revision',
    reviewCount: 1,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['Spring Force', 'Sign Convention', 'Integration'],
    source: 'Mock Test / Quiz',
  },
  {
    id: 'err_2',
    title: 'Assumed static friction was μ_s * N without checking applied force',
    subject: 'Physics',
    topic: 'Laws of Motion & Friction',
    errorType: 'Conceptual Gap',
    questionContext: 'Block on rough horizontal floor ($m = 5\\text{ kg}, \\mu_s = 0.4$). Horizontal force applied is $10\\text{ N}$. Find friction force.',
    studentAttempt: 'Calculated $f = 0.4 \\times 5 \\times 9.8 = 19.6\\text{ N}$, wrote friction is $19.6\\text{ N}$.',
    correctConcept: 'Maximum available static friction is $19.6\\text{ N}$. Since applied force is only $10\\text{ N}$, static friction adjusts to exactly $10\\text{ N}$ to prevent motion.',
    keyTakeaway: 'Static friction is self-adjusting ($0 \\le f_s \\le \\mu_s N$). It only equals $\\mu_s N$ at impending slippage!',
    severity: 'High',
    status: 'Needs Revision',
    reviewCount: 2,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['Friction', 'Equilibrium', 'Classic Trap'],
    source: 'Problem Solver',
  },
  {
    id: 'err_3',
    title: 'Misread "Which statement is INCORRECT" as correct',
    subject: 'Chemistry',
    topic: 'Chemical Equilibrium & Thermodynamics',
    errorType: 'Misread Question / Silly',
    questionContext: 'Assertion-Reason question on Le Chatelier principle with "Which of the following is INCORRECT?".',
    studentAttempt: 'Read Option A, recognized it as a true statement of exothermic shift, and marked Option A immediately.',
    correctConcept: 'The question asked for the incorrect statement. Option C had false statement about catalyst affecting equilibrium constant $K_{eq}$.',
    keyTakeaway: 'Highlight the word INCORRECT/NOT in the question header before reading choices.',
    severity: 'Medium',
    status: 'Reviewed',
    reviewCount: 3,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['Le Chatelier', 'OMR Trap', 'Speed Panic'],
    source: 'Mock Test / Quiz',
  },
  {
    id: 'err_4',
    title: 'Forgot to divide moles by container volume in Kc calculation',
    subject: 'Chemistry',
    topic: 'Ionic & Chemical Equilibrium',
    errorType: 'Calculation Slip',
    questionContext: 'Reaction $A(g) + B(g) \\rightleftharpoons C(g)$ in a $5.0\\text{ Liter}$ reaction flask.',
    studentAttempt: 'Plugged raw moles at equilibrium into $K_c = \\frac{n_C}{n_A n_B}$ instead of molarities.',
    correctConcept: 'Must divide every mole quantity by volume ($V = 5.0\\text{ L}$). Since $\\Delta n = -1$, the volume does not cancel out!',
    keyTakeaway: 'Always write concentration terms $[X] = n_X / V$ explicitly in $K_c$ expressions when $\\Delta n \\ne 0$.',
    severity: 'Medium',
    status: 'Needs Revision',
    reviewCount: 0,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['Equilibrium Constant', 'Volume Effect', 'Concentration'],
    source: 'Self Logged',
  },
  {
    id: 'err_5',
    title: 'L’Hôpital Rule applied on non-indeterminate form (1/0)',
    subject: 'Mathematics',
    topic: 'Limits, Continuity & Differentiability',
    errorType: 'Formula Confusion',
    questionContext: 'Evaluating $\\lim_{x \\to 0} \\frac{\\cos x}{x}$.',
    studentAttempt: 'Directly differentiated numerator and denominator: $\\frac{-\\sin x}{1} = 0$. Marked 0.',
    correctConcept: 'At $x = 0$, $\\frac{\\cos 0}{0} = \\frac{1}{0}$, which is NOT an indeterminate form ($0/0$ or $\\infty/\\infty$). The limit does not exist (diverges to $\\pm\\infty$).',
    keyTakeaway: 'Always substitute the limit value first to verify indeterminate form before triggering L’Hôpital!',
    severity: 'High',
    status: 'Mastered',
    reviewCount: 4,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['Limits', 'L’Hopital', 'Calculus Trap'],
    source: 'Problem Solver',
  },
];

const LOCAL_STORAGE_KEY = 'friday_student_error_book';

export function getStudentErrors(): StudentError[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // If the storage only contains the old auto-seeded mock errors, clear them so student has a clean error book
    const userCreated = parsed.filter((e: StudentError) => e.id && !e.id.startsWith('em_'));
    if (parsed.length > 0 && userCreated.length === 0 && parsed.every((e: StudentError) => e.id && e.id.startsWith('em_'))) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return [];
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load error book:', e);
    return [];
  }
}

export function loadSeedErrors(): StudentError[] {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_STUDENT_ERRORS));
    return SEED_STUDENT_ERRORS;
  } catch (e) {
    return SEED_STUDENT_ERRORS;
  }
}

export function clearStudentErrors(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear error book:', e);
  }
}

export function saveStudentError(
  errorData: Omit<StudentError, 'id' | 'createdAt' | 'reviewCount'>
): StudentError {
  const current = getStudentErrors();
  const newError: StudentError = {
    ...errorData,
    id: 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    createdAt: new Date().toISOString(),
    reviewCount: 0,
  };

  const updated = [newError, ...current];
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to persist error:', e);
  }
  return newError;
}

export function updateStudentError(
  id: string,
  updates: Partial<StudentError>
): StudentError | null {
  const current = getStudentErrors();
  const index = current.findIndex((e) => e.id === id);
  if (index === -1) return null;

  const updatedItem: StudentError = {
    ...current[index],
    ...updates,
    lastReviewedDate: new Date().toISOString(),
  };

  current[index] = updatedItem;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to update error:', e);
  }
  return updatedItem;
}

export function deleteStudentError(id: string): boolean {
  const current = getStudentErrors();
  const filtered = current.filter((e) => e.id !== id);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Failed to delete error:', e);
    return false;
  }
}

export function getErrorStats(errors: StudentError[]): ErrorBookStats {
  const stats: ErrorBookStats = {
    total: errors.length,
    needsRevision: errors.filter((e) => e.status === 'Needs Revision').length,
    reviewed: errors.filter((e) => e.status === 'Reviewed').length,
    mastered: errors.filter((e) => e.status === 'Mastered').length,
    bySubject: {},
    byType: {
      'Conceptual Gap': 0,
      'Calculation Slip': 0,
      'Misread Question / Silly': 0,
      'Formula Confusion': 0,
      'Time Pressure Panic': 0,
      'Unit / Sign Error': 0,
    },
    criticalTrap: 'Calculation Slip',
  };

  errors.forEach((e) => {
    stats.bySubject[e.subject] = (stats.bySubject[e.subject] || 0) + 1;
    if (stats.byType[e.errorType] !== undefined) {
      stats.byType[e.errorType]++;
    }
  });

  // Determine top trap
  let maxCount = -1;
  let topTrap: ErrorType = 'Calculation Slip';
  (Object.keys(stats.byType) as ErrorType[]).forEach((type) => {
    if (stats.byType[type] > maxCount) {
      maxCount = stats.byType[type];
      topTrap = type;
    }
  });
  stats.criticalTrap = topTrap;

  return stats;
}

export function getMemeBreakdownForDay(offset = 0): ErrorMemeBreakdown {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = Math.abs((dayOfYear + offset) % CURATED_ERROR_MEMES.length);
  return CURATED_ERROR_MEMES[index];
}
