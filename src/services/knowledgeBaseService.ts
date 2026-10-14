import { SourceChunk, SourceDocument } from '../types';

const STORAGE_KEY = 'friday_knowledge_documents';

// Pre-seeded high quality curriculum materials
export const SEED_DOCUMENTS: SourceDocument[] = [
  {
    id: 'doc_ncert_physics_ch4',
    title: 'NCERT Class 11 Physics: Chapter 4 - Motion in a Plane',
    type: 'pdf',
    subject: 'Physics',
    urlOrFilename: 'ncert_class11_physics_ch4.pdf',
    uploadedDate: '2026-09-01T10:00:00Z',
    chunks: [
      {
        id: 'SRC-1',
        documentId: 'doc_ncert_physics_ch4',
        documentTitle: 'NCERT Physics Ch.4 Motion in a Plane',
        pageOrSlideOrTimestamp: 'Page 68, Section 4.10',
        text: 'Projectile Motion: A projectile is an object thrown into space upon which the only acting force is gravity. The horizontal component of velocity remains constant throughout the motion: $u_x = u \\cos\\theta$. The vertical component varies under acceleration due to gravity: $v_y = u \\sin\\theta - gt$.',
        tags: ['projectile', 'kinematics', 'velocity', 'gravity'],
      },
      {
        id: 'SRC-2',
        documentId: 'doc_ncert_physics_ch4',
        documentTitle: 'NCERT Physics Ch.4 Motion in a Plane',
        pageOrSlideOrTimestamp: 'Page 71, Section 4.10.2',
        text: 'Maximum Height and Time of Flight: The time of flight $T_f$ is given by $T_f = \\frac{2u \\sin\\theta}{g}$. The maximum vertical height achieved is $H = \\frac{u^2 \\sin^2\\theta}{2g}$. The horizontal range is $R = \\frac{u^2 \\sin(2\\theta)}{g}$, which attains a maximum value when $\\theta = 45^\\circ$ where $R_{max} = \\frac{u^2}{g}$.',
        tags: ['projectile', 'range', 'maximum height', 'time of flight'],
      },
      {
        id: 'SRC-3',
        documentId: 'doc_ncert_physics_ch4',
        documentTitle: 'NCERT Physics Ch.4 Motion in a Plane',
        pageOrSlideOrTimestamp: 'Page 73, Equation 4.38',
        text: 'Equation of Trajectory: By eliminating time $t$ between the horizontal position $x = (u \\cos\\theta)t$ and vertical position $y = (u \\sin\\theta)t - \\frac{1}{2}gt^2$, the trajectory of a projectile is given by $y = x \\tan\\theta - \\frac{g x^2}{2 u^2 \\cos^2\\theta}$. This is the equation of a parabola.',
        tags: ['trajectory', 'parabola', 'equation of path'],
      },
    ],
  },
  {
    id: 'doc_ncert_physics_ch5',
    title: 'NCERT Class 11 Physics: Chapter 5 - Laws of Motion',
    type: 'pdf',
    subject: 'Physics',
    urlOrFilename: 'ncert_class11_physics_ch5.pdf',
    uploadedDate: '2026-09-02T11:00:00Z',
    chunks: [
      {
        id: 'SRC-4',
        documentId: 'doc_ncert_physics_ch5',
        documentTitle: 'NCERT Physics Ch.5 Laws of Motion',
        pageOrSlideOrTimestamp: 'Page 94, Section 5.4',
        text: "Newton's Second Law of Motion: The rate of change of momentum of a body is directly proportional to the applied force and takes place in the direction in which the force acts: $\\vec{F} = \\frac{d\\vec{p}}{dt} = m\\vec{a}$. Momentum is defined as $\\vec{p} = m\\vec{v}$. Impulse of a force equals the change in momentum: $\\vec{J} = \\vec{F} \\Delta t = \\Delta\\vec{p}$.",
        tags: ['newton', 'momentum', 'force', 'impulse'],
      },
      {
        id: 'SRC-5',
        documentId: 'doc_ncert_physics_ch5',
        documentTitle: 'NCERT Physics Ch.5 Laws of Motion',
        pageOrSlideOrTimestamp: 'Page 101, Section 5.9',
        text: 'Static and Kinetic Friction: Static friction $f_s$ opposes impending motion and is self-adjusting up to a maximum limiting friction: $f_{s,\\max} = \\mu_s N$, where $N$ is the normal reaction. Once relative motion begins, kinetic friction acts with magnitude $f_k = \\mu_k N$. Note that $\\mu_k \\le \\mu_s$ for all ordinary surfaces.',
        tags: ['friction', 'normal force', 'limiting friction', 'coefficient of friction'],
      },
    ],
  },
  {
    id: 'doc_current_electricity',
    title: 'Class 12 Physics: Current Electricity & Ohm\'s Law Lecture Slides',
    type: 'slides',
    subject: 'Physics',
    urlOrFilename: 'current_electricity_slides.pdf',
    uploadedDate: '2026-09-05T09:30:00Z',
    chunks: [
      {
        id: 'SRC-6',
        documentId: 'doc_current_electricity',
        documentTitle: 'Current Electricity Lecture Slides',
        pageOrSlideOrTimestamp: 'Slide 14',
        text: "Ohm's Law and Drift Velocity: Current density $j = n e v_d = \\sigma E$. Ohm's Law states $V = IR$ where resistance $R = \\rho \\frac{L}{A}$. Drift velocity of conduction electrons is $v_d = -\\frac{e E \\tau}{m}$, where $\\tau$ is the relaxation time between collisions.",
        tags: ['electricity', 'ohms law', 'drift velocity', 'resistance', 'resistivity'],
      },
      {
        id: 'SRC-7',
        documentId: 'doc_current_electricity',
        documentTitle: 'Current Electricity Lecture Slides',
        pageOrSlideOrTimestamp: 'Slide 22',
        text: "Kirchhoff's Laws: Junction Rule (KCL) is based on conservation of charge: $\\sum I_{in} = \\sum I_{out}$. Loop Rule (KVL) is based on conservation of energy: the algebraic sum of changes in potential around any closed loop must be zero: $\\sum \\Delta V = 0$.",
        tags: ['kirchhoff', 'kcl', 'kvl', 'circuit', 'conservation'],
      },
    ],
  },
  {
    id: 'doc_calculus_notes',
    title: 'JEE Mathematics: Differential Calculus Master Class',
    type: 'youtube',
    subject: 'Mathematics',
    urlOrFilename: 'https://youtube.com/watch?v=friday_calc_101',
    uploadedDate: '2026-09-10T14:20:00Z',
    chunks: [
      {
        id: 'SRC-8',
        documentId: 'doc_calculus_notes',
        documentTitle: 'JEE Calculus Video Lecture',
        pageOrSlideOrTimestamp: 'Video Timestamp 12:45',
        text: 'Limits & L\'Hospital\'s Rule: For indeterminate forms $\\left[\\frac{0}{0}\\right]$ or $\\left[\\frac{\\infty}{\\infty}\\right]$, $\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\lim_{x \\to a} \\frac{f\'(x)}{g\'(x)}$, provided the limit on the right exists. Standard limits: $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$, $\\lim_{x \\to 0} \\frac{e^x - 1}{x} = 1$.',
        tags: ['limits', 'calculus', 'lhopital', 'derivatives'],
      },
      {
        id: 'SRC-9',
        documentId: 'doc_calculus_notes',
        documentTitle: 'JEE Calculus Video Lecture',
        pageOrSlideOrTimestamp: 'Video Timestamp 28:10',
        text: 'Maxima and Minima Criteria: For a differentiable function $f(x)$, critical points occur where $f\'(x) = 0$. If $f\'\'(x) < 0$ at critical point $x_0$, $f(x)$ has a local maximum at $x_0$. If $f\'\'(x) > 0$, it has a local minimum. If $f\'\'(x_0) = 0$, test higher order derivatives or sign change of $f\'(x)$.',
        tags: ['maxima', 'minima', 'second derivative test', 'critical points'],
      },
    ],
  },
];

/**
 * Get all stored documents (seeded + user uploaded)
 */
export function getStoredDocuments(): SourceDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DOCUMENTS));
      return SEED_DOCUMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_DOCUMENTS;
  } catch {
    return SEED_DOCUMENTS;
  }
}

/**
 * Save documents to storage
 */
export function saveDocuments(docs: SourceDocument[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch (err) {
    console.error('Failed to save documents to localStorage:', err);
  }
}

/**
 * Add a new user document with auto-chunking
 */
export function addDocument(
  title: string,
  type: 'pdf' | 'notes' | 'slides' | 'youtube',
  subject: string,
  content: string,
  urlOrFilename: string = ''
): SourceDocument {
  const docs = getStoredDocuments();
  const docId = `doc_${Date.now()}`;

  // Simple clean chunking by paragraph / section
  const rawParagraphs = content.split(/\n\s*\n/).filter((p) => p.trim().length > 40);
  const chunks: SourceChunk[] = [];

  rawParagraphs.forEach((para, index) => {
    const chunkId = `SRC-${docs.reduce((acc, d) => acc + d.chunks.length, 0) + index + 1}`;
    // Extract keywords as tags
    const words = para.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    const uniqueTags = Array.from(new Set(words.filter((w) => w.length > 4))).slice(0, 5);

    chunks.push({
      id: chunkId,
      documentId: docId,
      documentTitle: title,
      pageOrSlideOrTimestamp: type === 'youtube' ? `Timestamp 0${index * 3}:00` : `Section ${index + 1}`,
      text: para.trim(),
      tags: uniqueTags,
    });
  });

  const newDoc: SourceDocument = {
    id: docId,
    title,
    type,
    subject,
    urlOrFilename: urlOrFilename || title,
    uploadedDate: new Date().toISOString(),
    chunks: chunks.length > 0 ? chunks : [
      {
        id: `SRC-${Date.now()}`,
        documentId: docId,
        documentTitle: title,
        pageOrSlideOrTimestamp: 'Full Note',
        text: content,
        tags: [subject.toLowerCase(), 'notes'],
      },
    ],
  };

  docs.unshift(newDoc);
  saveDocuments(docs);
  return newDoc;
}

/**
 * Search and retrieve top-K relevant chunks for query
 */
export function retrieveRelevantChunks(
  query: string,
  topK: number = 3
): { chunk: SourceChunk; score: number }[] {
  const docs = getStoredDocuments();
  const allChunks = docs.flatMap((d) => d.chunks);

  const queryTerms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);

  if (queryTerms.length === 0) return [];

  const scored = allChunks.map((chunk) => {
    const textLower = chunk.text.toLowerCase();
    const docTitleLower = chunk.documentTitle.toLowerCase();
    const tagsLower = chunk.tags.map((t) => t.toLowerCase());

    let matchCount = 0;
    queryTerms.forEach((term) => {
      // Direct word match in body
      if (textLower.includes(term)) matchCount += 2;
      // Match in tags
      if (tagsLower.includes(term)) matchCount += 3;
      // Match in doc title
      if (docTitleLower.includes(term)) matchCount += 1.5;
    });

    // Score normalized
    const score = matchCount / (queryTerms.length * 3);
    return { chunk, score };
  });

  return scored
    .filter((item) => item.score > 0.15)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Format retrieved chunks into grounding prompt context
 */
export function formatChunksForPrompt(chunks: { chunk: SourceChunk }[]): string {
  if (chunks.length === 0) return '';
  return chunks
    .map(
      ({ chunk }) =>
        `[CHUNK_START]
Citation ID: [cite:${chunk.id}]
Document: ${chunk.documentTitle}
Location: ${chunk.pageOrSlideOrTimestamp}
Content:
${chunk.text}
[CHUNK_END]`
    )
    .join('\n\n');
}
