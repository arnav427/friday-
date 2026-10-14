/**
 * Daily Motivational Quotes for Students & Competitive Exam Aspirants.
 * Deterministically changes every day based on the calendar date,
 * with support for manual shuffle when students need an extra spark of energy.
 */

export interface MotivationalQuote {
  quote: string;
  author: string;
  category: string;
  actionPrompt: string;
}

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  {
    quote: "You have to dream before your dreams can come true. Difficulties in your life do not come to destroy you, but to help you realize your hidden potential.",
    author: "Dr. A.P.J. Abdul Kalam",
    category: "Resilience & Vision",
    actionPrompt: "Give your 100% in this session — every small equation solved builds your future.",
  },
  {
    quote: "I was taught that the way of progress was neither swift nor easy. Nothing in life is to be feared, it is only to be understood.",
    author: "Marie Curie",
    category: "Curiosity & Scientific Grit",
    actionPrompt: "Don't fear tricky problems. Break them down step-by-step.",
  },
  {
    quote: "Arise, awake, and stop not until the goal is reached. All the power is within you; you can do anything and everything.",
    author: "Swami Vivekananda",
    category: "Inner Strength",
    actionPrompt: "Lock in your focus for the next 45 minutes with zero distractions.",
  },
  {
    quote: "Nobody ever figures out what life is, and it doesn't matter. Explore the world. Nearly everything is really interesting if you go into it deeply enough.",
    author: "Richard Feynman",
    category: "Deep Learning",
    actionPrompt: "Approach your hardest topic today with childlike curiosity.",
  },
  {
    quote: "It's not that I'm so smart, it's just that I stay with problems longer. In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    category: "Perseverance",
    actionPrompt: "When you hit a stumbling block today, spend 5 more minutes before checking the solution.",
  },
  {
    quote: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
    category: "Consistency",
    actionPrompt: "Show up today, complete your mini-goals, and trust your compounding knowledge.",
  },
  {
    quote: "An equation for me has no meaning unless it expresses a thought of God. Infinite patterns emerge from honest contemplation.",
    author: "Srinivasa Ramanujan",
    category: "Mathematical Mastery",
    actionPrompt: "Look for the elegant symmetry behind the formulas you memorize.",
  },
  {
    quote: "The secret of getting ahead is getting started. The secret of getting started is breaking your complex overwhelming tasks into small manageable tasks.",
    author: "Mark Twain",
    category: "Action Over Procrastination",
    actionPrompt: "Start with just 1 mini-goal right now.",
  },
  {
    quote: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
    category: "Momentum",
    actionPrompt: "Pick your weakest subject and solve just two problems right now.",
  },
  {
    quote: "Energy and persistence conquer all things. What we hope to do with ease, we must first learn to do with diligence.",
    author: "Benjamin Franklin",
    category: "Diligence",
    actionPrompt: "Consistency is your armor. Keep your focus burning bright.",
  },
  {
    quote: "Continuous effort — not strength or intelligence — is the key to unlocking our potential.",
    author: "Winston Churchill",
    category: "Endurance",
    actionPrompt: "Your future self will thank you for the focus you put into today.",
  },
  {
    quote: "Believe you can and you're halfway there. The harder you work for something, the greater you'll feel when you achieve it.",
    author: "Theodore Roosevelt",
    category: "Self-Belief",
    actionPrompt: "Stand tall. You are completely capable of mastering this syllabus.",
  },
];

/**
 * Returns the daily quote based on the day of the year so it changes every day automatically.
 */
export function getDailyQuote(offset: number = 0): MotivationalQuote {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const index = Math.abs((dayOfYear + offset) % MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[index];
}
