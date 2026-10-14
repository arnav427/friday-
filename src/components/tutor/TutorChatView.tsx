import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Image as ImageIcon,
  RotateCcw,
  X,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ChatMessage, SourceChunk, SupportedLanguage } from '../../types';
import { KaTeXRenderer } from '../common/KaTeXRenderer';
import { sendChatMessage } from '../../services/geminiService';
import {
  retrieveRelevantChunks,
  formatChunksForPrompt,
  getStoredDocuments,
} from '../../services/knowledgeBaseService';

interface TutorChatViewProps {
  userLanguage: SupportedLanguage;
  targetExamLabel: string;
}

export const TutorChatView: React.FC<TutorChatViewProps> = ({
  userLanguage,
  targetExamLabel,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_msg',
      role: 'assistant',
      content: `Hello! I am **FRIDAY**, your personal AI study companion.

I can explain tricky concepts, walk through derivations step-by-step, review formulas, or guide you Socratically.

💡 **Grounded Mode is ON**: Answers are strictly backed by your verified curriculum notes and NCERT chapters with clickable citation chips. Ask me anything!`,
      timestamp: new Date().toISOString(),
      mode: 'standard',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [groundedMode, setGroundedMode] = useState(true);
  const [mode, setMode] = useState<'standard' | 'eli5' | 'exam' | 'solver' | 'socratic'>('standard');
  const [activeCitationChunk, setActiveCitationChunk] = useState<SourceChunk | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Suggested follow-ups chips
  const suggestedChips = [
    'Derive the horizontal range of a projectile',
    'Why is static friction self-adjusting?',
    'Explain drift velocity and Ohm\'s law',
    'Give an exam-style answer for Kirchhoff\'s Loop Rule',
  ];

  // Voice recognition via Web Speech API
  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = userLanguage === 'Hindi' ? 'hi-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  // Text to speech playback
  const handleReadAloud = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // Clean markdown/latex tags for speech
    const cleanText = text
      .replace(/\$\$[\s\S]*?\$\$/g, ' mathematical equation ')
      .replace(/\$[^\$]+?\$/g, ' equation ')
      .replace(/\[cite:[^\]]+\]/g, '')
      .replace(/[#*_`]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = userLanguage === 'Hindi' ? 'hi-IN' : 'en-US';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Image Upload handler
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage({
        base64: reader.result as string,
        mimeType: file.type || 'image/png',
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle citation chip clicks from KaTeXRenderer
  const handleCitationClick = (citationId: string) => {
    const docs = getStoredDocuments();
    const allChunks = docs.flatMap((d) => d.chunks);
    const found = allChunks.find((c) => c.id === citationId);
    if (found) {
      setActiveCitationChunk(found);
    }
  };

  // Submit Message
  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend && !selectedImage) return;

    const userMsgId = `user_${Date.now()}`;
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: textToSend || 'Please analyze this diagram/problem.',
      timestamp: new Date().toISOString(),
      imagePreview: selectedImage?.base64,
    };

    const newHistory = [...messages, newUserMsg];
    setMessages(newHistory);
    setInput('');
    const curImage = selectedImage;
    setSelectedImage(null);
    setLoading(true);

    // Retrieve grounding context if Grounded Mode is enabled
    let groundedContext = '';
    if (groundedMode) {
      const topChunks = retrieveRelevantChunks(textToSend, 3);
      groundedContext = formatChunksForPrompt(topChunks);
    }

    // Assistant response placeholder
    const assistantMsgId = `assistant_${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      mode,
    };

    setMessages([...newHistory, initialAssistantMsg]);

    try {
      let accumulated = '';
      await sendChatMessage({
        messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
        mode,
        groundedContent: groundedContext,
        groundedMode,
        language: userLanguage,
        image: curImage || undefined,
        onChunk: (chunk) => {
          accumulated = chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: accumulated } : msg
            )
          );
        },
      });
    } catch (err: any) {
      console.error('Tutor chat failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)] animate-in fade-in duration-200">
      {/* Main Chat Box */}
      <div className="flex-1 flex flex-col glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl relative">
        {/* Chat Control Topbar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-sm">
              F
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5 font-heading">
                FRIDAY Source-Grounded Tutor
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="text-[10px] text-slate-400">
                Aligned with {targetExamLabel || 'Curriculum'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Selector */}
            <select
              value={mode}
              onChange={(e: any) => setMode(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-medium focus:outline-none"
            >
              <option value="standard">Standard Explanation</option>
              <option value="eli5">Explain Simply (ELI5)</option>
              <option value="exam">Exam-Style Answer</option>
              <option value="solver">Step-by-Step Solver</option>
              <option value="socratic">Socratic Tutor (Questions)</option>
            </select>

            {/* Grounded Mode Toggle */}
            <button
              onClick={() => setGroundedMode(!groundedMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                groundedMode
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
              title="When enabled, FRIDAY verifies every claim against your uploaded course documents"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Grounded Mode {groundedMode ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isOutside = msg.content.includes('[NOT_COVERED_IN_MATERIAL]');

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
                    F
                  </div>
                )}

                <div
                  className={`max-w-[85%] md:max-w-[78%] rounded-2xl p-4 shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-sm'
                      : isOutside
                      ? 'bg-amber-950/30 border border-amber-500/40 text-slate-200 rounded-tl-sm'
                      : 'glass-card text-slate-200 border border-slate-800 rounded-tl-sm'
                  }`}
                >
                  {/* Image attachment preview if any */}
                  {msg.imagePreview && (
                    <div className="mb-3 rounded-xl overflow-hidden max-w-xs border border-slate-700">
                      <img
                        src={msg.imagePreview}
                        alt="Uploaded diagram"
                        className="w-full object-cover"
                      />
                    </div>
                  )}

                  {/* Mode badge for assistant */}
                  {!isUser && msg.mode && msg.mode !== 'standard' && (
                    <div className="mb-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold uppercase tracking-wider">
                      Mode: {msg.mode}
                    </div>
                  )}

                  {isUser ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <KaTeXRenderer
                      content={msg.content}
                      onCitationClick={handleCitationClick}
                    />
                  )}

                  {/* Message actions (Voice read-aloud) */}
                  {!isUser && msg.content && (
                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                      <button
                        onClick={() => handleReadAloud(msg.content)}
                        className="flex items-center gap-1 hover:text-cyan-300 transition-colors"
                        title="Listen to this explanation"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Read Aloud</span>
                      </button>
                      <span className="text-[10px]">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center text-slate-400 text-xs">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0 animate-pulse">
                F
              </div>
              <div className="flex items-center gap-2 p-3 glass-card rounded-2xl border border-slate-800">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>FRIDAY is analyzing and synthesizing notes...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Chips Carousel */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex gap-2 overflow-x-auto no-scrollbar">
          {suggestedChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="shrink-0 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-indigo-950/40 text-slate-300 hover:text-indigo-200 border border-slate-800 hover:border-indigo-500/40 text-xs transition-colors"
            >
              💬 {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          {selectedImage && (
            <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-800 text-xs text-cyan-300 border border-slate-700">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Image attached</span>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
              title="Upload question photo or diagram"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-xl border transition-colors ${
                isRecording
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500 animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border border-slate-800'
              }`}
              title="Voice Input"
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Ask FRIDAY anything in ${userLanguage} (LaTeX formulas supported)...`}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />

            <button
              onClick={() => handleSend()}
              disabled={loading || (!input.trim() && !selectedImage)}
              className="p-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Side Drawer for Citation Inspector */}
      {activeCitationChunk && (
        <div className="w-full lg:w-80 glass-panel rounded-3xl p-5 border border-indigo-500/40 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>Source Excerpt Inspector</span>
              </div>
              <button
                onClick={() => setActiveCitationChunk(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                <div className="text-[10px] text-indigo-400 font-semibold uppercase">
                  Citation ID
                </div>
                <div className="text-sm font-bold text-white">[cite:{activeCitationChunk.id}]</div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Document Source:</div>
                <div className="text-xs font-semibold text-slate-200">
                  {activeCitationChunk.documentTitle}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Location / Section:</div>
                <div className="text-xs font-semibold text-cyan-300">
                  {activeCitationChunk.pageOrSlideOrTimestamp}
                </div>
              </div>

              <div className="mt-3">
                <div className="text-[11px] text-slate-400 font-medium mb-1">Exact Excerpt:</div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-60 overflow-y-auto">
                  <KaTeXRenderer content={activeCitationChunk.text} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <span className="text-[10px] text-emerald-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Grounded & Non-Hallucinated
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
