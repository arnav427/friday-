import { BKTParameters, TopicMastery } from '../types';

/**
 * Standard default Bayesian Knowledge Tracing parameters:
 * p_init: Prior probability of student knowing the concept
 * p_learn: Transition probability of acquiring the knowledge after an attempt/interaction
 * p_slip: Probability student knows it but slips (e.g. calculation blunder)
 * p_guess: Probability student doesn't know it but guesses right
 */
export const DEFAULT_BKT_PARAMS: BKTParameters = {
  p_init: 0.25,
  p_learn: 0.18,
  p_slip: 0.10,
  p_guess: 0.20,
};

/**
 * Bayesian Knowledge Tracing Bayesian Update Step
 * @param currentMastery Prior belief P(L_{t-1})
 * @param isCorrect Whether student gave a correct answer
 * @param params BKT parameters for this topic
 * @returns Posterior belief P(L_t)
 */
export function updateBKT(
  currentMastery: number,
  isCorrect: boolean,
  params: BKTParameters = DEFAULT_BKT_PARAMS
): number {
  const { p_learn, p_slip, p_guess } = params;
  const pL_prev = Math.max(0.01, Math.min(0.99, currentMastery));

  let pL_given_obs: number;

  if (isCorrect) {
    // P(L | correct) = P(L)(1 - P(S)) / [ P(L)(1 - P(S)) + (1 - P(L))P(G) ]
    const numerator = pL_prev * (1 - p_slip);
    const denominator = numerator + (1 - pL_prev) * p_guess;
    pL_given_obs = numerator / (denominator || 1);
  } else {
    // P(L | incorrect) = P(L)P(S) / [ P(L)P(S) + (1 - P(L))(1 - P(G)) ]
    const numerator = pL_prev * p_slip;
    const denominator = numerator + (1 - pL_prev) * (1 - p_guess);
    pL_given_obs = numerator / (denominator || 1);
  }

  // Knowledge acquisition transition step:
  // P(L_t) = P(L_{t-1} | obs) + (1 - P(L_{t-1} | obs)) * P(T)
  const pL_new = pL_given_obs + (1 - pL_given_obs) * p_learn;

  return Math.min(0.99, Math.max(0.01, Number(pL_new.toFixed(4))));
}

/**
 * SuperMemo SM-2 Spaced Repetition Calculation
 * @param quality Rating 0 to 5 (0-2: Fail, 3: Hard, 4: Good, 5: Easy)
 * @param repetition Current repetition count
 * @param interval Current interval in days
 * @param easeFactor Current easiness factor (min 1.3)
 */
export function calculateSM2(
  quality: number,
  repetition: number,
  interval: number,
  easeFactor: number
): { repetition: number; interval: number; easeFactor: number; nextReviewDate: string } {
  let nextRepetition = repetition;
  let nextInterval = interval;
  let nextEaseFactor = easeFactor;

  if (quality >= 3) {
    if (repetition === 0) {
      nextInterval = 1;
    } else if (repetition === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(interval * easeFactor);
    }
    nextRepetition = repetition + 1;
  } else {
    nextRepetition = 0;
    nextInterval = 1;
  }

  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  nextEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (nextEaseFactor < 1.3) nextEaseFactor = 1.3;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + nextInterval);

  return {
    repetition: nextRepetition,
    interval: nextInterval,
    easeFactor: Number(nextEaseFactor.toFixed(2)),
    nextReviewDate: targetDate.toISOString(),
  };
}

/**
 * Calculate Forgetting Curve Retrievability: R(t) = e^(-t / S)
 * where t is elapsed days and S is memory stability in days.
 */
export function calculateRetrievability(lastPracticedIso: string, intervalDays: number): number {
  if (!lastPracticedIso) return 0.5;
  const now = new Date().getTime();
  const last = new Date(lastPracticedIso).getTime();
  const elapsedDays = Math.max(0, (now - last) / (1000 * 60 * 60 * 24));

  // Stability proportional to spaced repetition interval
  const stability = Math.max(1, intervalDays * 1.5);
  const retrievability = Math.exp(-elapsedDays / stability);
  return Math.min(1.0, Math.max(0.1, Number(retrievability.toFixed(3))));
}

/**
 * Calculate dynamic Effective Mastery considering retention decay
 */
export function getDecayedMastery(topic: TopicMastery): number {
  const retrievability = calculateRetrievability(topic.lastPracticed, topic.intervalDays);
  // Blended score: 70% BKT posterior * 30% retention factor
  const effective = topic.masteryProbability * (0.7 + 0.3 * retrievability);
  return Math.round(effective * 100);
}

/**
 * Create initial mastery state for a topic given student self-rated confidence
 */
export function createInitialTopicMastery(
  topicId: string,
  topicName: string,
  subject: string,
  confidencePercent: number = 40
): TopicMastery {
  // Map confidence 0-100 to prior p_init 0.15 - 0.75
  const normalizedPrior = 0.15 + (confidencePercent / 100) * 0.6;
  const now = new Date().toISOString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    topicId,
    topicName,
    subject,
    masteryProbability: normalizedPrior,
    bktParams: {
      ...DEFAULT_BKT_PARAMS,
      p_init: normalizedPrior,
    },
    lastPracticed: now,
    totalAttempts: 0,
    correctAttempts: 0,
    repetitionNumber: 0,
    intervalDays: 1,
    easinessFactor: 2.5,
    nextReviewDate: tomorrow.toISOString(),
    retrievabilityScore: 1.0,
  };
}

/**
 * Seed initial mastery map for common curricula
 */
export function seedCurriculumTopics(
  subjects: string[],
  confidences: Record<string, number> = {}
): Record<string, TopicMastery> {
  const topicRegistry: Record<string, string[]> = {
    Physics: [
      'Kinematics & Projectile Motion',
      "Newton's Laws of Motion & Friction",
      'Work, Energy & Power',
      'Rotational Dynamics & Torque',
      'Gravitation & Planetary Orbits',
      'Thermodynamics & Heat Engines',
      'Simple Harmonic Motion & Waves',
      'Electrostatics & Gauss Law',
      "Current Electricity & Ohm's Law",
      'Magnetism & Electromagnetic Induction',
      'Ray & Wave Optics',
      'Modern Physics & Dual Nature',
    ],
    Mathematics: [
      'Quadratic Equations & Polynomials',
      'Sequences, Series & Progressions',
      'Trigonometric Functions & Identities',
      'Coordinate Geometry: Straight Lines & Circles',
      'Conic Sections (Parabola, Ellipse, Hyperbola)',
      'Differential Calculus & Limits',
      'Applications of Derivatives (Maxima/Minima)',
      'Integral Calculus & Area Under Curves',
      'Vectors & 3D Geometry',
      'Probability & Combinatorics',
      'Matrices & Determinants',
    ],
    Chemistry: [
      'Atomic Structure & Bohr Model',
      'Periodic Trends & Chemical Bonding',
      'Thermodynamics & Enthalpy',
      'Chemical & Ionic Equilibrium',
      'Redox Reactions & Electrochemistry',
      'Chemical Kinetics & Rate Laws',
      'Coordination Compounds',
      'Organic Chemistry: Hydrocarbons & Haloalkanes',
      'Alcohols, Phenols & Ethers',
      'Aldehydes, Ketones & Carboxylic Acids',
      'Biomolecules & Polymers',
    ],
    Biology: [
      'Cell Biology & Organelles',
      'DNA Structure, Replication & Genetics',
      'Human Physiology: Circulatory System',
      'Human Physiology: Nervous System',
      'Plant Physiology & Photosynthesis',
      'Biotechnology: Principles & Processes',
      'Ecology & Biodiversity',
    ],
    General: [
      'Logical Reasoning & Analytical Thinking',
      'Verbal Ability & Reading Comprehension',
      'Quantitative Aptitude',
      'General Awareness & Science',
    ],
  };

  const masteryMap: Record<string, TopicMastery> = {};

  for (const subject of subjects) {
    const topics = topicRegistry[subject] || topicRegistry['General'];
    const subjectConfidence = confidences[subject] || 45;

    for (let i = 0; i < topics.length; i++) {
      const topicName = topics[i];
      const topicId = `${subject.toLowerCase()}_t${i + 1}`;
      // Slight natural variance per topic
      const topicConfidence = Math.max(10, Math.min(95, subjectConfidence + ((i % 3) - 1) * 10));
      masteryMap[topicId] = createInitialTopicMastery(topicId, topicName, subject, topicConfidence);
    }
  }

  return masteryMap;
}
