export interface StudyMeme {
  id: string;
  title: string;
  setup: string;
  punchline: string;
  tag: 'Physics' | 'Chemistry' | 'Maths' | 'Biology' | 'Exam Hall' | 'Study Life' | 'All-Nighter';
  emoji: string;
  reactions: {
    tooReal: number;
    motivated: number;
    skull: number;
    bigBrain: number;
  };
  tipsOrFormula?: string;
}

export const CURATED_STUDY_MEMES: StudyMeme[] = [
  {
    id: 'meme_1',
    title: 'The Integration by Parts Infinite Loop',
    setup: 'Me on page 3 of deriving ∫ e^x sin(x) dx:',
    punchline: 'Wait... why is the original integral staring right back at me with a smirk?!',
    tag: 'Maths',
    emoji: '🔄',
    reactions: { tooReal: 342, motivated: 120, skull: 284, bigBrain: 195 },
    tipsOrFormula: '💡 Pro-tip: Add the original integral $I$ to the other side: $2I = e^x(\\sin x - \\cos x) \\implies I = \\frac{e^x}{2}(\\sin x - \\cos x) + C$.',
  },
  {
    id: 'meme_2',
    title: 'The Direction of Gravity in Physics Exams',
    setup: 'Step 1: Let downwards be positive (+y).',
    punchline: 'Step 14: Ball has negative velocity, upwards acceleration, and has successfully escaped earth gravity into Andromeda.',
    tag: 'Physics',
    emoji: '🚀',
    reactions: { tooReal: 512, motivated: 98, skull: 430, bigBrain: 112 },
    tipsOrFormula: '💡 Remember: Always write your chosen sign convention in a box at the top right of your sheet before step 1!',
  },
  {
    id: 'meme_3',
    title: 'Organic Chemistry Resonance Energy',
    setup: 'Benzene in the NCERT textbook: "I am a remarkably stable aromatic hexagon."',
    punchline: 'Benzene in JEE Advanced: "Here are 4 reagents, 3 Lewis acids, and a secret electrophile. Guess which hydrogen leaves first."',
    tag: 'Chemistry',
    emoji: '🧪',
    reactions: { tooReal: 670, motivated: 154, skull: 589, bigBrain: 230 },
    tipsOrFormula: '💡 Huckel Rule: $4n+2$ $\\pi$ electrons + Planar ring = Stability.',
  },
  {
    id: 'meme_4',
    title: 'The Limiting Friction Mirage',
    setup: 'Question: Horizontal force of 5 N applied on a 10 kg block (μs = 0.4). What is the friction?',
    punchline: 'Student calculates: "fs = μs * m * g = 0.4 * 10 * 10 = 40 N! The table is now pushing the block backwards with 35 N of speed!"',
    tag: 'Physics',
    emoji: '🛑',
    reactions: { tooReal: 420, motivated: 89, skull: 360, bigBrain: 290 },
    tipsOrFormula: '💡 Static friction is SELF-ADJUSTING! $f_s = F_{\\text{applied}}$ as long as $F_{\\text{applied}} \\le f_{s,\\max}$. Friction is 5 N, not 40 N!',
  },
  {
    id: 'meme_5',
    title: 'The Circadian Clock of an Aspirant',
    setup: 'My Brain at 3:00 PM: "What is the formula for area of a circle again?"',
    punchline: 'My Brain at 2:30 AM: "Let us derive the Navier-Stokes equations and solve quantum gravity before tomorrow\'s breakfast."',
    tag: 'Study Life',
    emoji: '☕',
    reactions: { tooReal: 820, motivated: 310, skull: 710, bigBrain: 405 },
    tipsOrFormula: '💡 Sleep consolidates memory in the hippocampus. 7 hours of sleep beats 3 hours of half-awake midnight cramming!',
  },
  {
    id: 'meme_6',
    title: "L'Hôpital's Rule Addiction",
    setup: 'Exam problem: Evaluate lim (x → 0) of an indeterminate form 0/0.',
    punchline: 'Me differentiating the numerator and denominator for the 5th consecutive time: "I will not stop until this fraction surrenders a number!"',
    tag: 'Maths',
    emoji: '🏥',
    reactions: { tooReal: 388, motivated: 140, skull: 210, bigBrain: 345 },
    tipsOrFormula: '💡 Before applying L’Hôpital, always verify it is strictly $0/0$ or $\\infty/\\infty$, otherwise you will differentiate into oblivion!',
  },
  {
    id: 'meme_7',
    title: 'The Krebs Cycle Amnesia',
    setup: 'Studying Cellular Respiration 2 hours before the mock test:',
    punchline: 'Citrate, Isocitrate, alpha-ketoglutarate, Succinyl-CoA... 10 minutes into the test: "Ah yes, Mitochondria is the powerhouse of the cell."',
    tag: 'Biology',
    emoji: '🧬',
    reactions: { tooReal: 590, motivated: 110, skull: 520, bigBrain: 180 },
    tipsOrFormula: '💡 Mnemonic: "Can I Keep Selling Substances For Money, Officer?" (Citrate, Isocitrate, alpha-Ketoglutarate, Succinyl-CoA, Succinate, Fumarate, Malate, Oxaloacetate).',
  },
  {
    id: 'meme_8',
    title: 'Revision Day Procrastination',
    setup: 'Plan: "I will revise Mechanics and Electrostatics in 2 hours."',
    punchline: 'Reality: Spends 90 minutes picking the exact Spotify lo-fi playlist and color-coding three highlighter pens.',
    tag: 'All-Nighter',
    emoji: '🎧',
    reactions: { tooReal: 910, motivated: 280, skull: 840, bigBrain: 150 },
    tipsOrFormula: '💡 5-Minute Rule: Commit to studying just 5 minutes without music or setup. 80% of resistance disappears once you start!',
  },
];

export function getMemeForDay(offset = 0): StudyMeme {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = Math.abs((dayOfYear + offset) % CURATED_STUDY_MEMES.length);
  return CURATED_STUDY_MEMES[index];
}
