import React, { useMemo } from 'react';
import katex from 'katex';
import { Copy, Check, FileText } from 'lucide-react';

interface KaTeXRendererProps {
  content: string;
  className?: string;
  onCitationClick?: (citationId: string) => void;
}

export const KaTeXRenderer: React.FC<KaTeXRendererProps> = ({
  content,
  className = '',
  onCitationClick,
}) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to render KaTeX safely
  const renderMath = (math: string, displayMode: boolean): string => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode,
        throwOnError: false,
      });
    } catch {
      return math;
    }
  };

  const parsedBlocks = useMemo(() => {
    if (!content) return [];

    // First split by code blocks ```...```
    const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
    const parts: { type: 'code' | 'text'; code?: string; lang?: string; text?: string }[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', text: content.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'code', lang: match[1] || 'text', code: match[2] });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({ type: 'text', text: content.substring(lastIndex) });
    }

    return parts;
  }, [content]);

  // Transform markdown + math in a text block
  const formatTextWithMathAndMarkdown = (text: string) => {
    // 1. Process block math: $$...$$
    const blockMathRegex = /\$\$([\s\S]*?)\$\$/g;
    let processed = text.replace(blockMathRegex, (_, math) => {
      return `<div class="my-3 py-1 px-3 bg-slate-900/60 rounded-xl overflow-x-auto text-center border border-indigo-500/20">${renderMath(math, true)}</div>`;
    });

    // 2. Process inline math: $...$
    const inlineMathRegex = /\$([^\$\n]+?)\$/g;
    processed = processed.replace(inlineMathRegex, (_, math) => {
      return `<span class="inline-math px-1 rounded font-mono text-cyan-300">${renderMath(math, false)}</span>`;
    });

    // 3. Process citation chips: [cite:SRC-X]
    const citeRegex = /\[cite:([A-Za-z0-9-_]+)\]/g;
    processed = processed.replace(citeRegex, (_, id) => {
      return `<button data-citation="${id}" class="citation-chip inline-flex items-center gap-1 mx-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 hover:text-indigo-100 border border-indigo-500/40 cursor-pointer transition-all">📎 ${id}</button>`;
    });

    // 4. Headings & basic markdown
    const lines = processed.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h3
            key={idx}
            className="text-lg font-bold text-slate-100 mt-4 mb-2 font-heading tracking-wide border-b border-slate-800/80 pb-1"
            dangerouslySetInnerHTML={{ __html: line.substring(4) }}
          />
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2
            key={idx}
            className="text-xl font-bold text-indigo-300 mt-5 mb-2 font-heading tracking-wide"
            dangerouslySetInnerHTML={{ __html: line.substring(3) }}
          />
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h1
            key={idx}
            className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300 mt-6 mb-3 font-heading"
            dangerouslySetInnerHTML={{ __html: line.substring(2) }}
          />
        );
      }

      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const bulletContent = line.trim().substring(2);
        return (
          <li
            key={idx}
            className="ml-5 list-disc text-slate-300 my-1 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: bulletContent }}
          />
        );
      }

      // Numbered items
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex gap-2 my-1 ml-2 text-slate-300 leading-relaxed">
            <span className="text-indigo-400 font-semibold">{numMatch[1]}.</span>
            <span dangerouslySetInnerHTML={{ __html: numMatch[2] }} />
          </div>
        );
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="border-l-4 border-indigo-500 pl-3 my-2 text-slate-400 italic bg-indigo-950/20 py-1 rounded-r-lg"
            dangerouslySetInnerHTML={{ __html: line.substring(2) }}
          />
        );
      }

      // Regular paragraph or blank line
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p
          key={idx}
          className="my-1 text-slate-200 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: line }}
        />
      );
    });
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const button = target.closest('button[data-citation]');
    if (button && onCitationClick) {
      const citationId = button.getAttribute('data-citation');
      if (citationId) {
        onCitationClick(citationId);
      }
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`prose-sm max-w-none text-slate-200 break-words ${className}`}
    >
      {parsedBlocks.map((block, idx) => {
        if (block.type === 'code') {
          return (
            <div
              key={idx}
              className="my-3 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 shadow-lg"
            >
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono">
                <span>{block.lang || 'code'}</span>
                <button
                  onClick={() => copyCode(block.code || '', idx)}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-100 transition-colors"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 text-xs md:text-sm font-mono overflow-x-auto text-emerald-300">
                <code>{block.code}</code>
              </pre>
            </div>
          );
        }

        return <div key={idx}>{formatTextWithMathAndMarkdown(block.text || '')}</div>;
      })}
    </div>
  );
};
