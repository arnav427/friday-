import React, { useState } from 'react';
import {
  BookmarkCheck,
  CheckCircle2,
  Trash2,
  MessageSquare,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';
import { DoubtItem } from '../../types';

interface DoubtInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  doubts: DoubtItem[];
  onToggleResolve: (id: string) => void;
  onDeleteDoubt: (id: string) => void;
  onAskTutorDoubt: (question: string) => void;
  onAddDoubt: (doubt: Omit<DoubtItem, 'id' | 'savedDate' | 'status'>) => void;
}

export const DoubtInboxModal: React.FC<DoubtInboxModalProps> = ({
  isOpen,
  onClose,
  doubts,
  onToggleResolve,
  onDeleteDoubt,
  onAskTutorDoubt,
  onAddDoubt,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');

  if (!isOpen) return null;

  const handleSaveDoubt = () => {
    if (!title.trim() || !question.trim()) return;
    onAddDoubt({
      title: title.trim(),
      subject,
      topic: topic.trim() || 'General',
      question: question.trim(),
    });
    setTitle('');
    setTopic('');
    setQuestion('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl glass-panel rounded-3xl p-6 md:p-8 border border-slate-700/80 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white font-heading">
              Doubt Inbox ({doubts.filter((d) => d.status === 'unresolved').length} Unresolved)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Doubt
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add Doubt Form */}
        {showAddForm && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 my-3 space-y-3 shrink-0">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Doubt title (e.g. Centripetal Work Zero?)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Biology">Biology</option>
              </select>
            </div>
            <textarea
              rows={2}
              placeholder="Describe the exact question or step where you got stuck..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 text-xs text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDoubt}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Doubt List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {doubts.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No unresolved doubts! You are completely up to date.
            </div>
          ) : (
            doubts.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.status === 'resolved'
                    ? 'bg-slate-900/40 border-slate-800 opacity-60'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div>
                    <span className="text-xs font-bold text-white">{item.title}</span>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="text-cyan-400 font-semibold">{item.subject}</span>
                      <span>•</span>
                      <span>{item.topic}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleResolve(item.id)}
                      className={`p-1.5 rounded-lg border text-xs ${
                        item.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                      title={item.status === 'resolved' ? 'Mark Unresolved' : 'Mark Resolved'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteDoubt(item.id)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-400"
                      title="Delete Doubt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{item.question}</p>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-end">
                  <button
                    onClick={() => {
                      onAskTutorDoubt(item.question);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Ask FRIDAY Tutor Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
