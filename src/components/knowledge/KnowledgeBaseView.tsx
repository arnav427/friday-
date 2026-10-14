import React, { useState } from 'react';
import {
  Network,
  BookOpen,
  Plus,
  FileText,
  Video,
  Upload,
  Search,
  ExternalLink,
  Sparkles,
  Layers,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { SourceDocument, TopicMastery } from '../../types';
import {
  getStoredDocuments,
  addDocument,
} from '../../services/knowledgeBaseService';
import { getDecayedMastery } from '../../services/bktService';
import { KaTeXRenderer } from '../common/KaTeXRenderer';

interface KnowledgeBaseViewProps {
  masteryMap: Record<string, TopicMastery>;
  onStudyTopic: (topicName: string, subject: string) => void;
  onQuizTopic: (topicName: string, subject: string) => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  masteryMap,
  onStudyTopic,
  onQuizTopic,
}) => {
  const [activeTab, setActiveTab] = useState<'graph' | 'documents'>('graph');
  const [documents, setDocuments] = useState<SourceDocument[]>(getStoredDocuments());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  // New Note Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Physics');
  const [newType, setNewType] = useState<'pdf' | 'notes' | 'slides' | 'youtube'>('notes');
  const [newContent, setNewContent] = useState('');

  // Course Flow Graph Nodes (constructed from curriculum & mastery)
  const graphNodes = [
    {
      id: 'n_vec',
      label: 'Vectors & Trigonometry',
      subject: 'Mathematics',
      x: 80,
      y: 120,
      prereq: [],
      mastery: 85,
    },
    {
      id: 'n_1d',
      label: '1D Kinematics',
      subject: 'Physics',
      x: 260,
      y: 100,
      prereq: ['n_vec'],
      mastery: 75,
    },
    {
      id: 'n_2d',
      label: 'Projectile & 2D Motion',
      subject: 'Physics',
      x: 440,
      y: 100,
      prereq: ['n_1d'],
      mastery: 60,
    },
    {
      id: 'n_nlm',
      label: "Newton's Laws of Motion",
      subject: 'Physics',
      x: 620,
      y: 100,
      prereq: ['n_2d'],
      mastery: 52,
    },
    {
      id: 'n_fric',
      label: 'Friction & Dynamics',
      subject: 'Physics',
      x: 800,
      y: 100,
      prereq: ['n_nlm'],
      mastery: 45,
    },
    {
      id: 'n_calc',
      label: 'Differential Calculus',
      subject: 'Mathematics',
      x: 260,
      y: 280,
      prereq: ['n_vec'],
      mastery: 80,
    },
    {
      id: 'n_work',
      label: 'Work, Energy & Power',
      subject: 'Physics',
      x: 620,
      y: 280,
      prereq: ['n_nlm', 'n_calc'],
      mastery: 68,
    },
    {
      id: 'n_circ',
      label: "Current Electricity & Ohm's",
      subject: 'Physics',
      x: 440,
      y: 380,
      prereq: ['n_work'],
      mastery: 58,
    },
    {
      id: 'n_kirch',
      label: "Kirchhoff's Laws & Networks",
      subject: 'Physics',
      x: 680,
      y: 380,
      prereq: ['n_circ'],
      mastery: 40,
    },
  ];

  // Helper node color based on BKT mastery
  const getNodeColor = (mastery: number) => {
    if (mastery >= 75) return '#10B981'; // Emerald
    if (mastery >= 50) return '#6366F1'; // Indigo
    return '#F59E0B'; // Amber
  };

  const handleAddNote = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const added = addDocument(newTitle, newType, newSubject, newContent);
    setDocuments(getStoredDocuments());
    setShowAddModal(false);
    setNewTitle('');
    setNewContent('');
  };

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white font-heading flex items-center gap-2">
            <Network className="w-6 h-6 text-emerald-400" />
            Knowledge Base & Course Flow Map
          </h1>
          <p className="text-xs text-slate-400">
            Node-link dependency graph colored by Bayesian mastery + Ingested source library.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
            <button
              onClick={() => setActiveTab('graph')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'graph'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Interactive Map
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'documents'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Source Documents ({documents.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-bold hover:opacity-90 transition-all shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" /> Add Notes
          </button>
        </div>
      </div>

      {/* 1. INTERACTIVE COURSE FLOW MAP VIEW */}
      {activeTab === 'graph' && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-300">Prerequisite Concept Flow</span>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> &gt;75% Mastered
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> 50-75% In Progress
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> &lt;50% Weak/Due
                </span>
              </div>
            </div>
            <span className="text-[11px] text-slate-500">Click any node to study or quiz</span>
          </div>

          {/* SVG Node Graph Canvas */}
          <div className="w-full overflow-x-auto bg-[#070b16] rounded-2xl border border-slate-800/80 p-4">
            <svg viewBox="0 0 950 480" className="w-full min-w-[700px] h-[360px]">
              {/* Directed Edges */}
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                </marker>
              </defs>

              {/* Render Connection Lines */}
              {graphNodes.map((node) =>
                node.prereq.map((preId) => {
                  const target = graphNodes.find((n) => n.id === preId);
                  if (!target) return null;
                  return (
                    <line
                      key={`${node.id}-${preId}`}
                      x1={target.x}
                      y1={target.y}
                      x2={node.x}
                      y2={node.y}
                      stroke="#334155"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      markerEnd="url(#arrow)"
                    />
                  );
                })
              )}

              {/* Render Nodes */}
              {graphNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const color = getNodeColor(node.mastery);

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer transition-all"
                    onClick={() => setSelectedNode(node)}
                  >
                    {/* Glow outline if selected */}
                    {isSelected && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="34"
                        fill="none"
                        stroke="#22D3EE"
                        strokeWidth="3"
                        className="animate-pulse"
                      />
                    )}

                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="26"
                      fill="#0F172A"
                      stroke={color}
                      strokeWidth="3"
                      className="hover:scale-110 transition-transform"
                    />

                    <text
                      x={node.x}
                      y={node.y + 4}
                      fill="#FFFFFF"
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {Math.round(node.mastery)}%
                    </text>

                    <text
                      x={node.x}
                      y={node.y + 42}
                      fill="#E2E8F0"
                      fontSize="11"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {node.label}
                    </text>

                    <text
                      x={node.x}
                      y={node.y + 56}
                      fill="#64748B"
                      fontSize="9"
                      textAnchor="middle"
                    >
                      {node.subject}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Node Detail Drawer below canvas */}
          {selectedNode && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-150">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white font-heading">
                    {selectedNode.label}
                  </span>
                  <span className="text-xs text-indigo-400 font-semibold">({selectedNode.subject})</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Current BKT Mastery: <span className="text-cyan-300 font-bold">{Math.round(selectedNode.mastery)}%</span> • Prerequisites:{' '}
                  {selectedNode.prereq.length === 0 ? 'None (Foundational)' : selectedNode.prereq.join(', ')}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onStudyTopic(selectedNode.label, selectedNode.subject)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm"
                >
                  Study with FRIDAY
                </button>
                <button
                  onClick={() => onQuizTopic(selectedNode.label, selectedNode.subject)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40"
                >
                  Quiz Topic
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. SOURCE DOCUMENTS LIST */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by title, chapter or subject..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                      {doc.type}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(doc.uploadedDate).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1">{doc.title}</h3>
                  <div className="text-xs text-cyan-400 font-medium mb-3">{doc.subject}</div>

                  <div className="space-y-1.5">
                    {doc.chunks.slice(0, 2).map((chunk) => (
                      <div
                        key={chunk.id}
                        className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300"
                      >
                        <div className="font-semibold text-indigo-300 flex items-center justify-between mb-0.5">
                          <span>[cite:{chunk.id}] {chunk.pageOrSlideOrTimestamp}</span>
                        </div>
                        <p className="line-clamp-2 text-slate-400">{chunk.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    {doc.chunks.length} Grounded Excerpts
                  </span>
                  <button
                    onClick={() => onStudyTopic(doc.title, doc.subject)}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Ask Tutor About This →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD NEW DOCUMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xl glass-panel rounded-3xl p-6 border border-slate-700 shadow-2xl">
            <h2 className="text-lg font-bold text-white font-heading mb-4">
              Add Study Material to Knowledge Base
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Thermodynamics Chapter 12 Notes"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs md:text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Source Format</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                  >
                    <option value="notes">Pasted Text Notes</option>
                    <option value="pdf">Textbook / PDF Text</option>
                    <option value="slides">Lecture Slides</option>
                    <option value="youtube">YouTube Lecture Notes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Content (Will be auto-chunked into citation segments):
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={6}
                  placeholder="Paste textbook excerpt, lecture notes or definitions here..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs md:text-sm focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!newTitle.trim() || !newContent.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-bold hover:opacity-90 disabled:opacity-40"
                >
                  Save & Ingest Chunks
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
