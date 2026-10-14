import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Modality } from '@google/genai';
import { WebSocketServer } from 'ws';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

// Initialize GoogleGenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
});

// 1. Structured JSON generation endpoint
app.post('/api/gemini/generate-json', async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || 'You are an expert educational AI. Output valid JSON only, without markdown fences.',
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const text = response.text || '{}';
    try {
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch {
      // Clean possible fences if any
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      res.json(JSON.parse(cleaned));
    }
  } catch (err: any) {
    console.error('Error in /api/gemini/generate-json:', err);
    res.status(500).json({ error: err.message || 'Failed to generate JSON response' });
  }
});

// 2. Chat endpoint (Supports Streaming SSE)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const {
      messages,
      systemInstruction,
      mode = 'standard',
      groundedContent,
      groundedMode = false,
      language = 'English',
      image,
    } = req.body;

    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server.' });
    }

    // Build context-rich prompt
    let enhancedSystemInstruction = `You are "FRIDAY", a calm, supportive, highly intelligent AI Study Companion for school students (Classes 6-12) and competitive aspirants (JEE, NEET, UPSC, GATE, CAT).
Target language: ${language}. If user asks in Hinglish or regional language, explain with English technical terms and natural regional phrasing.
Mode: ${mode}.
${
  mode === 'eli5'
    ? 'Explain like I am 12: use real-world analogies, intuitive stories, and simple breakdown.'
    : mode === 'exam'
    ? 'Provide exam-ready structured answers: Key Definition, Mathematical Formulation/Equation, Key Points/Assumptions, and Conclusion for maximum marks.'
    : mode === 'socratic'
    ? 'Act as a Socratic tutor: ask a guiding question first, encouraging the student to think step-by-step rather than giving the solution outright.'
    : mode === 'solver'
    ? 'Solve methodically: Given Data, Formula to Apply, Step-by-Step Substitution, Final Answer boxed/highlighted, and Common Pitfalls.'
    : 'Provide clear, encouraging, conceptually rigorous explanations.'
}
Always format formulas with LaTeX math notation using $ inline $ or $$ block $$.
`;

    if (groundedMode && groundedContent) {
      enhancedSystemInstruction += `
CRITICAL GROUNDED MODE:
You have access to the following student study material:
=== STUDENT MATERIAL START ===
${groundedContent}
=== STUDENT MATERIAL END ===

RULES FOR GROUNDED MODE:
1. Base your primary explanation strictly on the facts present in the student's material above.
2. Whenever you state a claim or fact from the material, insert a citation tag in the exact format: [cite:ID] where ID matches the chunk ID provided in the material (e.g., [cite:SRC-1]).
3. If the user's question CANNOT be answered from the provided material, you must explicitly begin with:
"⚠️ [NOT_COVERED_IN_MATERIAL] This topic is not covered in your uploaded study notes."
Then, provide a separate, clearly labeled section:
"### Outside Knowledge (Standard Syllabus Reference)"
Never secretly blend ungrounded claims into the material summary.
`;
    }

    // Format contents
    const contents: any[] = [];

    // History
    if (Array.isArray(messages)) {
      for (const msg of messages) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }

    // If multimodal image provided with latest query
    if (image && contents.length > 0) {
      const lastUser = contents[contents.length - 1];
      if (lastUser && lastUser.role === 'user') {
        const mimeType = image.mimeType || 'image/png';
        const base64Data = image.base64.replace(/^data:image\/\w+;base64,/, '');
        lastUser.parts.unshift({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
      }
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const streamResponse = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: enhancedSystemInstruction,
        temperature: 0.6,
      },
    });

    for await (const chunk of streamResponse) {
      const chunkText = chunk.text;
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error('Error in /api/gemini/chat:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Chat generation failed' });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

// 3. Question generation endpoint with IRT difficulty & structured schema
app.post('/api/gemini/generate-quiz', async (req, res) => {
  try {
    const {
      examOrBoard,
      gradeOrStream,
      subject,
      topic,
      difficulty = 'Medium',
      count = 5,
      questionTypes = ['MCQ'],
      previousQuestionHashes = [],
    } = req.body;

    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server.' });
    }

    const prompt = `Generate ${count} high-quality, authentic assessment questions for:
Exam / Board: ${examOrBoard}
Class / Stream: ${gradeOrStream}
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty} (Ensure questions strictly match this difficulty on a 1-5 scale)
Allowed Types: ${questionTypes.join(', ')}

Ensure NO repetitive questions. Generate diverse concepts.
Format formulas with LaTeX math notation ($ or $$).

Return a JSON array of question objects where each object has:
- id: unique string id (e.g. "q_1")
- type: one of "MCQ", "MULTIPLE_SELECT", "NUMERICAL", "ASSERTION_REASON"
- topic: string
- subtopic: string
- difficulty: "Easy" | "Medium" | "Hard"
- question: string (the complete question statement with LaTeX math)
- options: array of 4 string options (for MCQ / MULTIPLE_SELECT / ASSERTION_REASON) or empty array if numerical
- correct_answer: string (e.g. "A", "B", or numerical value like "4.5" or list like "A, C")
- step_by_step_solution: string (detailed step-by-step mathematical/conceptual solution)
- common_misconception: string (explain what common mistake students make that leads to wrong options)
- source_reference: string (e.g. "NCERT Class 11 Physics Chapter 4" or "JEE Main 2022 Pattern")
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a Senior National Examiner and Psychometric Assessment Specialist. Always produce rigorous, syllabus-aligned questions in clean JSON.',
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/gemini/generate-quiz:', err);
    res.status(500).json({ error: err.message || 'Failed to generate quiz' });
  }
});

// 4. Two-Pass Answer Verifier (Independent verification agent)
app.post('/api/gemini/verify-question', async (req, res) => {
  try {
    const { question, options, claimedAnswer, stepByStepSolution } = req.body;

    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server.' });
    }

    const verifierPrompt = `You are an independent Senior Verification Examiner.
Please solve the following question from first principles WITHOUT looking at the claimed answer first:

QUESTION:
${question}

OPTIONS (if any):
${Array.isArray(options) ? options.map((opt, i) => `${String.fromCharCode(65 + i)}: ${opt}`).join('\n') : 'N/A'}

CLAIMED ANSWER: ${claimedAnswer}
CLAIMED SOLUTION: ${stepByStepSolution}

Tasks:
1. Solve independently and calculate the true correct answer.
2. Does your independent answer match the claimed answer?
3. Is the claimed step-by-step solution mathematically and conceptually sound?

Respond in JSON with:
{
  "verified": true/false,
  "independent_answer": "string",
  "matches_claimed": true/false,
  "accuracy_confidence": 0.0 - 1.0,
  "verification_notes": "concise rationale"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: verifierPrompt,
      config: {
        systemInstruction: 'You are an exacting verification engine. Be uncompromising on numerical precision and signs.',
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/gemini/verify-question:', err);
    res.status(500).json({ error: err.message || 'Failed to verify question' });
  }
});

// 5. Problem Solver endpoint (Text & Multimodal OCR/Diagram)
app.post('/api/gemini/solve-problem', async (req, res) => {
  try {
    const { problemText, image, examLevel, language = 'English' } = req.body;

    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server.' });
    }

    const contents: any[] = [];
    const parts: any[] = [];

    if (image?.base64) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType || 'image/png',
          data: image.base64.replace(/^data:image\/\w+;base64,/, ''),
        },
      });
    }

    parts.push({
      text: `Please solve this problem step-by-step for a ${examLevel || 'high school / competitive exam'} student.
Problem: ${problemText || 'Solve the problem shown in the attached image.'}
Language: ${language}.
Format all mathematical expressions in LaTeX.

Return a JSON object with:
{
  "problem_statement": "Clean transcribed text of the problem",
  "concept_used": "Core theorem/concept used",
  "given_data": ["list of given parameters with units"],
  "step_by_step_solution": "Complete LaTeX formatted step by step derivation and arithmetic",
  "final_answer": "Precise final answer with units highlighted",
  "alternate_method": "A quick shortcut or alternate method if applicable",
  "common_mistakes": ["List of 2-3 common pitfalls students make on this type of problem"],
  "similar_practice_problem": "A similar question with answer for the student to practice right now"
}`,
    });

    contents.push({ role: 'user', parts });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: 'You are a master physics, math, and chemistry tutor. Provide rigorous, clear, and clean solutions.',
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/gemini/solve-problem:', err);
    res.status(500).json({ error: err.message || 'Failed to solve problem' });
  }
});

// 6. Video & Notes Summarizer endpoint
app.post('/api/gemini/summarize', async (req, res) => {
  try {
    const { content, youtubeUrl, targetLanguage = 'English' } = req.body;

    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server.' });
    }

    const prompt = `Analyze and generate a comprehensive study summary from the following content:
${youtubeUrl ? `YouTube Video URL: ${youtubeUrl}` : ''}
Content / Notes:
${content}

Language: ${targetLanguage}.

Provide a structured JSON output with:
{
  "title": "Concise topic title",
  "tldr": "2-3 sentence executive summary",
  "key_concepts": ["List of 4-6 primary concepts covered"],
  "chapter_outline": [
    { "timestamp": "00:00", "title": "Introduction", "summary": "brief summary" },
    { "timestamp": "03:15", "title": "Core Theorem", "summary": "brief summary" }
  ],
  "detailed_notes": "Well-formatted markdown study notes with definitions and formulas in LaTeX",
  "formulas_and_definitions": [
    { "term": "string", "definitionOrFormula": "LaTeX or text", "significance": "why it matters" }
  ],
  "exam_highlights": ["List of 3-5 high-yield exam takeaways / recurring PYQ points"],
  "quick_check_questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A",
      "explanation": "string"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite academic synthesizer. Produce clear, high-yield study notes with timestamps.',
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/gemini/summarize:', err);
    res.status(500).json({ error: err.message || 'Failed to summarize' });
  }
});

// 7. AI Interactive Simulation Generator
app.post('/api/gemini/generate-simulation', async (req, res) => {
  try {
    const { topic, prompt: userPrompt } = req.body;

    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server.' });
    }

    const genPrompt = `Create a self-contained, interactive HTML5 + Canvas/JavaScript educational simulation for:
Topic: ${topic}
Concept / Request: ${userPrompt}

Requirements:
1. Complete standalone HTML string with <!DOCTYPE html>, inline CSS, and inline <script>.
2. High quality dark-themed visual design matching background #0B1020, with glowing lines (indigo, cyan, emerald).
3. Include interactive controls: sliders (with live value readouts), Play/Pause button, Reset button.
4. Render smooth requestAnimationFrame animations (e.g. moving pendulums, ray optics, wave packets, projectile trajectories, or electric field vectors).
5. Live telemetry readout on canvas (e.g., Velocity, Kinetic Energy, Angle, Period T).
6. Must have NO external dependencies or network calls; everything self-contained in canvas/svg.

Return JSON:
{
  "title": "Simulation Title",
  "description": "Short explanation of the physical/mathematical principle demonstrated",
  "html_code": "<!DOCTYPE html><html>...</html>",
  "controls_explanation": "Explanation of how to use the sliders and buttons",
  "key_observations": ["Observation 1", "Observation 2"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: genPrompt,
      config: {
        systemInstruction: 'You are an award-winning STEM interactive visualization engineer. Generate flawless, safe, self-contained HTML/JS simulations.',
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/gemini/generate-simulation:', err);
    res.status(500).json({ error: err.message || 'Failed to generate simulation' });
  }
});

// 8. RAG Evaluation Engine (Faithfulness, Relevancy, Precision, Recall)
app.post('/api/gemini/evaluate-rag', async (req, res) => {
  try {
    const { testCase } = req.body;

    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server.' });
    }

    const evalPrompt = `You are a RAG evaluation judge (RAGAS framework).
Evaluate the following QA retrieval pair against the retrieved context:

QUERY: ${testCase.query}
RETRIEVED CONTEXT:
${testCase.context}
GENERATED ANSWER:
${testCase.generatedAnswer}
GROUND TRUTH / EXPECTED:
${testCase.groundTruth || 'N/A'}
IS REFUSAL EXPECTED (Out of scope query)?: ${testCase.isRefusalExpected ? 'YES' : 'NO'}

Score the following metrics from 0.0 to 1.0 (with 1.0 being optimal):
1. faithfulness: Are all claims in the generated answer directly supported by the retrieved context? (If answer claims out-of-material facts without labeling, score low. If refusal expected and correctly refused, score 1.0).
2. answer_relevancy: Does the answer directly address the user query without irrelevant fluff?
3. context_precision: Did the retrieved context contain the precise facts needed?
4. context_recall: Did the answer cover all key aspects present in the context/ground truth?

Return JSON:
{
  "faithfulness": 0.95,
  "answer_relevancy": 0.92,
  "context_precision": 0.88,
  "context_recall": 0.90,
  "overall_rag_score": 0.91,
  "correctly_refused": true,
  "critique": "Concise judge feedback on answer grounding and fidelity."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: evalPrompt,
      config: {
        systemInstruction: 'You are an objective AI evaluation benchmark judge.',
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/gemini/evaluate-rag:', err);
    res.status(500).json({ error: err.message || 'Evaluation failed' });
  }
});

// 9. Google Search Grounded Problem Solver
app.post('/api/gemini/search-grounded-solve', async (req, res) => {
  try {
    const { query, subject, examLevel, language = 'English' } = req.body;
    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server.' });
    }

    const prompt = `Solve this academic/examination problem with Google Search Grounding:
Problem Statement: ${query}
Subject: ${subject || 'General STEM'}
Target Syllabus / Level: ${examLevel || 'Class 11-12 & Competitive Exams (JEE, NEET, CBSE)'}
Language: ${language}

Tasks:
1. Search real-world curriculum sources, NCERT textbooks, official answer keys, and previous years' questions (PYQs).
2. Produce a rigorous, step-by-step mathematical/conceptual solution with LaTeX formatting ($ or $$).
3. Explicitly state the governing laws and formulas.
4. Highlight whether this exact pattern or concept appeared in recent national exams.
5. Provide relevant verified web references.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an authoritative examination problem solver with real-time Google Search Grounding.',
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    const text = response.text || '';
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const searchChunks = groundingMetadata?.groundingChunks || [];
    const webSearchQueries = groundingMetadata?.webSearchQueries || [];

    const sources = searchChunks
      .map((c: any) => ({
        title: c.web?.title || 'Web Reference',
        url: c.web?.uri || '',
      }))
      .filter((s: any) => Boolean(s.url));

    res.json({
      solution: text,
      sources,
      webSearchQueries,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/search-grounded-solve:', err);
    res.status(500).json({ error: err.message || 'Search grounded solve failed' });
  }
});

// 10. Live Voice Turn (Conversational response + TTS)
app.post('/api/gemini/live-voice-turn', async (req, res) => {
  try {
    const { userSpeechText, history = [], language = 'English' } = req.body;
    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server.' });
    }

    const messages = Array.isArray(history) ? [...history] : [];
    messages.push({ role: 'user', content: userSpeechText });

    const contents = messages.slice(-6).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: `You are "FRIDAY", a calm, supportive, friendly voice-first AI study companion for students.
Keep answers concise (under 3-4 sentences), encouraging, and crystal clear so it sounds natural when spoken aloud.
Language: ${language}.`,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I'm right here with you! Let's conquer this problem together.";

    // Generate high quality spoken audio using gemini-3.8-flash-lite-tts
    let audioBase64 = '';
    try {
      const ttsResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [{ text: replyText, speechMetadata: { style: 'Encouraging, clear, supportive study tutor' } }],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            },
          },
        },
      });

      audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
    } catch (ttsErr) {
      console.warn('TTS error (falling back to client audio):', ttsErr);
    }

    res.json({
      replyText,
      audioBase64,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/live-voice-turn:', err);
    res.status(500).json({ error: err.message || 'Voice turn failed' });
  }
});

// 11. Live Education News strictly filtered to user's chosen exam/board
app.post('/api/gemini/live-exam-news', async (req, res) => {
  try {
    const { targetExam, board, targetYear = '2026' } = req.body;
    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server.' });
    }

    const examIdentifier = targetExam || board || 'CBSE Board Examination';

    const prompt = `Search the web for the absolute latest, verified official education news, dates, notifications, and updates strictly for: "${examIdentifier}" (Session ${targetYear}).
Do NOT include news for unrelated exams. ONLY include updates regarding ${examIdentifier}.

Format the output strictly as a JSON object with this structure:
{
  "examName": "${examIdentifier}",
  "lastUpdated": "${new Date().toISOString()}",
  "urgentAlert": "One-line urgent bulletin or deadline (e.g. registration date, admit card release, or syllabus update)",
  "newsItems": [
    {
      "id": "news_1",
      "headline": "Clear, informative headline",
      "summary": "2-3 sentences explaining the announcement, what candidates must do, and dates.",
      "category": "Admit Card" | "Dates & Schedule" | "Syllabus & Pattern" | "Results & Cutoffs" | "Official Notice",
      "date": "Recent date string",
      "source": "Official authority name (e.g. NTA, CBSE, UPSC, NMC)",
      "verified": true,
      "link": "Official URL or portal reference"
    }
  ]
}
Return JSON only, without markdown fences.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are an authoritative examination news intelligence service. Return valid JSON only. Strictly filter news to "${examIdentifier}".`,
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    const text = response.text || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/gemini/live-exam-news:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch live exam news' });
  }
});

// Setup Vite development middlewares or serve static build
async function startServer() {
  const distDir = path.resolve(__dirname, 'dist');
  const indexHtml = path.resolve(distDir, 'index.html');
  const distExists = fs.existsSync(indexHtml);

  // In production deployment (Cloud Run), serve the built static SPA
  const isProd =
    process.env.NODE_ENV === 'production' ||
    process.env.npm_lifecycle_event === 'start' ||
    (distExists && process.env.npm_lifecycle_event !== 'dev');

  if (!isProd) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn('Vite dev middleware could not be initialized, falling back to static build:', err);
      if (distExists) {
        app.use(express.static(distDir));
        app.get('*', (req, res) => {
          res.sendFile(indexHtml);
        });
      }
    }
  } else {
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      res.sendFile(indexHtml);
    });
  }

  const server = http.createServer(app);

  server.on('error', (err: any) => {
    console.error('HTTP Server error:', err);
  });

  // Setup WebSocket server for real-time Live audio streams
  const wss = new WebSocketServer({ server, path: '/live-ws' });
  wss.on('error', (err) => {
    console.warn('WebSocket server warning:', err);
  });

  wss.on('connection', (ws) => {
    console.log('Client connected to Live audio WebSocket');
    ws.on('message', async (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch {}
    });
    ws.on('close', () => console.log('Live audio WebSocket client disconnected'));
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`FRIDAY server is running on http://0.0.0.0:${port} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
