import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Minus,
  Sparkles,
  Send,
  RotateCcw,
  Bot,
  Radio,
  Zap,
  Sliders,
  ChevronUp,
} from 'lucide-react';
import { KaTeXRenderer } from './KaTeXRenderer';
import { FridayLogo } from './FridayLogo';
import { sendLiveVoiceTurn, sendChatMessage } from '../../services/geminiService';
import { playChime } from '../../services/soundService';
import { SupportedLanguage } from '../../types';

interface FloatingLiveAssistantProps {
  userLanguage: SupportedLanguage;
  targetExamLabel: string;
}

interface MiniChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const FloatingLiveAssistant: React.FC<FloatingLiveAssistantProps> = ({
  userLanguage,
  targetExamLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'voice'>('chat');

  // Chat State
  const [messages, setMessages] = useState<MiniChatMessage[]>([
    {
      id: 'init_live',
      role: 'assistant',
      content: `Hi! I'm **Friday Live**. Ask me any quick doubt or switch to **Voice Mode** for hands-free study conversation! 🎙️`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'quick_doubt' | 'socratic' | 'exam_eval'>('quick_doubt');

  // Voice Conversation State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<{ user: string; assistant: string }>({
    user: 'Press the microphone to speak with Friday...',
    assistant: 'Ready to listen! Ask anything about your syllabus.',
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

  // Clean up audio on unmount or close
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Send message in Chat Tab
  const handleSendChat = async (overrideText?: string) => {
    const textToSend = overrideText || chatInput.trim();
    if (!textToSend || chatLoading) return;

    const userMsg: MiniChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setChatInput('');
    setChatLoading(true);

    const assistantMsgId = `a_${Date.now()}`;
    const initialAssistantMsg: MiniChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };
    setMessages([...newHistory, initialAssistantMsg]);

    try {
      let accumulated = '';
      await sendChatMessage({
        messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
        mode: selectedRole === 'socratic' ? 'socratic' : selectedRole === 'exam_eval' ? 'exam' : 'standard',
        language: userLanguage,
        onChunk: (chunk) => {
          accumulated = chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: accumulated } : msg
            )
          );
        },
      });
    } catch (err) {
      console.error('Floating chat error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  // Voice Mode Handling
  const handleStartListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = userLanguage === 'Hindi' ? 'hi-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        playChime('click');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onresult = async (event: any) => {
        const spoken = event.results[0][0].transcript;
        if (!spoken.trim()) return;

        setVoiceTranscript((prev) => ({ ...prev, user: spoken, assistant: 'Thinking...' }));
        setIsListening(false);

        // Call live voice turn
        try {
          const res = await sendLiveVoiceTurn({
            userSpeechText: spoken,
            history: messages.map((m) => ({ role: m.role, content: m.content })),
            language: userLanguage,
          });

          setVoiceTranscript({
            user: spoken,
            assistant: res.replyText,
          });

          // Play audio if generated by gemini-3.8-flash-lite-tts
          if (res.audioBase64) {
            setIsSpeaking(true);
            const audioBlob = new Blob(
              [Uint8Array.from(atob(res.audioBase64), (c) => c.charCodeAt(0))],
              { type: 'audio/wav' }
            );
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            currentAudioRef.current = audio;

            audio.onended = () => {
              setIsSpeaking(false);
            };
            audio.onerror = () => {
              setIsSpeaking(false);
              fallbackSpeak(res.replyText);
            };
            audio.play();
          } else {
            fallbackSpeak(res.replyText);
          }
        } catch (err) {
          console.error('Voice turn failed:', err);
          fallbackSpeak("I'm right here with you! Let's conquer this problem together.");
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const fallbackSpeak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = userLanguage === 'Hindi' ? 'hi-IN' : 'en-US';
    utterance.rate = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-auto">
      {/* 1. EXPANDED CHAT / VOICE WINDOW */}
      {isOpen && (
        <div className="mb-3 w-[92vw] sm:w-[400px] h-[540px] glass-panel rounded-3xl border border-indigo-500/40 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 bg-[#0B1020]/95 backdrop-blur-2xl">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FridayLogo size={32} showText={false} />
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5 font-heading">
                  FRIDAY Live
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                </div>
                <div className="text-[10px] text-slate-400">
                  {activeTab === 'chat' ? 'Gemini 3.8 Flash Chat' : 'Gemini Live Voice'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Minimize"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Navigation: Chat vs Voice */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-950/80 border-b border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'chat'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Live Chatbot</span>
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'voice'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>Voice Conversation</span>
            </button>
          </div>

          {/* TAB 1: LIVE CHATBOT */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Role selector bar */}
              <div className="px-3 py-1.5 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-slate-400">
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Role:</span>
                </div>
                <select
                  value={selectedRole}
                  onChange={(e: any) => setSelectedRole(e.target.value)}
                  className="bg-transparent text-indigo-300 font-semibold focus:outline-none text-[11px] cursor-pointer"
                >
                  <option value="quick_doubt" className="bg-slate-900">⚡ Quick Solver</option>
                  <option value="socratic" className="bg-slate-900">🧠 Socratic Guide</option>
                  <option value="exam_eval" className="bg-slate-900">🎯 Exam Drill Master</option>
                </select>
                <button
                  onClick={() =>
                    setMessages([
                      {
                        id: 'reset',
                        role: 'assistant',
                        content: 'Chat refreshed. Ask me anything!',
                        timestamp: new Date().toISOString(),
                      },
                    ])
                  }
                  className="text-slate-400 hover:text-white"
                  title="Clear conversation"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-[10px] font-bold text-indigo-300 shrink-0 mt-0.5">
                          F
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                          isUser
                            ? 'bg-indigo-600 text-white rounded-tr-sm'
                            : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-sm'
                        }`}
                      >
                        {isUser ? (
                          <p>{msg.content}</p>
                        ) : (
                          <KaTeXRenderer content={msg.content} />
                        )}
                      </div>
                    </div>
                  );
                })}

                {chatLoading && (
                  <div className="flex gap-2 items-center text-xs text-slate-400">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600/30 flex items-center justify-center text-[10px] text-indigo-300 animate-pulse">
                      F
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                      <span>Friday is typing...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-2.5 border-t border-slate-800 bg-slate-950/80">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChat();
                  }}
                  className="flex items-center gap-1.5"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type doubt or formula ($x^2$)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE VOICE CONVERSATION */}
          {activeTab === 'voice' && (
            <div className="flex-1 flex flex-col justify-between p-5 text-center bg-gradient-to-b from-slate-950/50 via-indigo-950/20 to-slate-950">
              {/* Header Status */}
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase tracking-wider">
                  Real-Time Voice Companion
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Powered by Gemini 3.8 Live & TTS Audio Synthesis
                </p>
              </div>

              {/* Glowing Visualizer Orb */}
              <div className="my-auto flex flex-col items-center justify-center">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  {/* Outer pulsating wave rings */}
                  <div
                    className={`absolute inset-0 rounded-full border border-cyan-400/40 transition-all duration-700 ${
                      isSpeaking || isListening ? 'scale-125 opacity-70 animate-ping' : 'scale-100 opacity-20'
                    }`}
                  />
                  <div
                    className={`absolute -inset-3 rounded-full border border-indigo-500/40 transition-all duration-500 ${
                      isSpeaking || isListening ? 'scale-110 opacity-50 animate-pulse' : 'scale-95 opacity-10'
                    }`}
                  />

                  {/* Main Orb */}
                  <div
                    className={`w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 flex items-center justify-center shadow-2xl transition-all duration-300 ${
                      isSpeaking
                        ? 'shadow-cyan-500/50 scale-105'
                        : isListening
                        ? 'shadow-rose-500/50 scale-105'
                        : 'shadow-indigo-500/30'
                    }`}
                  >
                    <div className="w-24 h-24 rounded-full bg-[#0B1020] flex items-center justify-center">
                      {isListening ? (
                        <Mic className="w-10 h-10 text-rose-400 animate-pulse" />
                      ) : isSpeaking ? (
                        <Volume2 className="w-10 h-10 text-cyan-300 animate-bounce" />
                      ) : (
                        <Radio className="w-10 h-10 text-indigo-400" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs font-semibold">
                  {isListening ? (
                    <span className="text-rose-400 font-bold animate-pulse">● Listening to you...</span>
                  ) : isSpeaking ? (
                    <span className="text-cyan-300 font-bold animate-pulse">Friday is speaking...</span>
                  ) : (
                    <span className="text-slate-400">Tap the mic to talk</span>
                  )}
                </div>
              </div>

              {/* Live Transcript Box */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-2 mb-3">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Live Conversation:
                </div>
                <div className="text-xs text-slate-300 max-h-24 overflow-y-auto space-y-1 font-mono">
                  <div>
                    <span className="text-cyan-400 font-bold">You: </span>
                    <span>"{voiceTranscript.user}"</span>
                  </div>
                  <div>
                    <span className="text-indigo-300 font-bold">Friday: </span>
                    <span>{voiceTranscript.assistant}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleStartListening}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs shadow-xl transition-all ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30'
                      : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 text-white hover:opacity-90 shadow-indigo-500/30'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isListening ? 'Stop Listening' : 'Speak to Friday'}</span>
                </button>

                {isSpeaking && (
                  <button
                    onClick={handleStopSpeaking}
                    className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
                    title="Mute / Stop audio playback"
                  >
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. FLOATING ORB BUTTON (Collapsed State) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            playChime('click');
          }}
          className="group relative flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-full glass-panel border border-indigo-500/40 shadow-2xl hover:border-cyan-400 transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900"
          title="Open Friday Live Chatbot & Voice Conversation"
        >
          {/* Official Friday Emblem with graduation cap */}
          <div className="relative">
            <FridayLogo size={36} showText={false} animate />
            {/* Live pulsating dot */}
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white flex items-center gap-1 font-heading">
              Friday Live
              <Sparkles className="w-3 h-3 text-cyan-400" />
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Chat & Voice Coach</span>
          </div>
        </button>
      )}
    </div>
  );
};
