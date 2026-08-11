import { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import {
  $cloudStore,
  updateScratchpadNote,
  clearScratchpadNote,
  copyToSystemClipboard
} from '../../logic/cloudStore';
import {
  FileText,
  Copy,
  Trash2,
  Check,
  Sparkles,
  Code,
  List,
  CheckSquare
} from 'lucide-react';

export function CloudScratchpad() {
  const store = useStore($cloudStore);
  const [localText, setLocalText] = useState(store.scratchpad.text);
  const [isCopied, setIsCopied] = useState(false);
  const isTypingRef = useRef(false);

  // Sync state from store when changed externally
  useEffect(() => {
    if (!isTypingRef.current) {
      setLocalText(store.scratchpad.text);
    }
  }, [store.scratchpad.text]);

  const handleTextChange = (val: string) => {
    setLocalText(val);
    isTypingRef.current = true;

    // Send update to Firebase
    updateScratchpadNote(val);

    setTimeout(() => {
      isTypingRef.current = false;
    }, 800);
  };

  const handleCopyNote = async () => {
    if (!localText) return;
    await copyToSystemClipboard(localText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleInsertTemplate = (type: 'bullets' | 'code' | 'todo') => {
    let prefix = '';
    if (type === 'bullets') prefix = '\n• Item 1\n• Item 2\n• Item 3';
    if (type === 'todo') prefix = '\n[ ] Task 1\n[ ] Task 2\n[ ] Task 3';
    if (type === 'code') prefix = '\n```\n// Code snippet\n```';

    const updated = localText + prefix;
    handleTextChange(updated);
  };

  const formatLastUpdated = (ts: number) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-white/10 [html[data-theme=light]_&]:border-[#E5E5EA] bg-slate-900/60 [html[data-theme=light]_&]:bg-white [html[data-theme=light]_&]:shadow-[0_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400 [html[data-theme=light]_&]:text-[#007AFF]" strokeWidth={2} />
            <div>
              <h3 className="text-base font-extrabold text-white [html[data-theme=light]_&]:text-[#1D1D1F]">Cloud Synced Scratchpad</h3>
              <span className="text-xs font-medium text-slate-400 [html[data-theme=light]_&]:text-[#86868B]">Notes update live across all connected devices</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyNote}
              disabled={!localText}
              aria-label="Copy Scratchpad note to clipboard"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer min-h-[44px] ${
                isCopied
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white/5 hover:bg-white/10 [html[data-theme=light]_&]:bg-[#F5F5F7] [html[data-theme=light]_&]:hover:bg-[#E5E5EA] text-slate-200 [html[data-theme=light]_&]:text-[#1D1D1F] border border-white/10 [html[data-theme=light]_&]:border-transparent disabled:opacity-40'
              }`}
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400 [html[data-theme=light]_&]:text-[#007AFF]" strokeWidth={2} /> : <Copy className="w-4 h-4 text-emerald-400 [html[data-theme=light]_&]:text-[#007AFF]" strokeWidth={2} />}
              <span>{isCopied ? 'Copied!' : 'Copy Note'}</span>
            </button>

            <button
              type="button"
              onClick={clearScratchpadNote}
              disabled={!localText}
              aria-label="Clear Scratchpad note"
              className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs disabled:opacity-40 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Clear Scratchpad"
            >
              <Trash2 className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-2 mb-3 pt-2 border-t border-white/5 [html[data-theme=light]_&]:border-[#E5E5EA]">
          <span className="text-[11px] text-slate-400 [html[data-theme=light]_&]:text-[#86868B] font-medium">Quick Insert:</span>
          <button
            type="button"
            onClick={() => handleInsertTemplate('bullets')}
            aria-label="Insert bullet points template"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 [html[data-theme=light]_&]:bg-[#F5F5F7] [html[data-theme=light]_&]:hover:bg-[#E5E5EA] text-slate-300 [html[data-theme=light]_&]:text-[#1D1D1F] text-xs border border-white/10 [html[data-theme=light]_&]:border-transparent transition cursor-pointer min-h-[36px]"
          >
            <List className="w-3.5 h-3.5 text-emerald-400 [html[data-theme=light]_&]:text-[#007AFF]" strokeWidth={2} /> List
          </button>
          <button
            type="button"
            onClick={() => handleInsertTemplate('todo')}
            aria-label="Insert checklist template"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 [html[data-theme=light]_&]:bg-[#F5F5F7] [html[data-theme=light]_&]:hover:bg-[#E5E5EA] text-slate-300 [html[data-theme=light]_&]:text-[#1D1D1F] text-xs border border-white/10 [html[data-theme=light]_&]:border-transparent transition cursor-pointer min-h-[36px]"
          >
            <CheckSquare className="w-3.5 h-3.5 text-cyan-400 [html[data-theme=light]_&]:text-[#007AFF]" strokeWidth={2} /> Checklist
          </button>
          <button
            type="button"
            onClick={() => handleInsertTemplate('code')}
            aria-label="Insert code block template"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 [html[data-theme=light]_&]:bg-[#F5F5F7] [html[data-theme=light]_&]:hover:bg-[#E5E5EA] text-slate-300 [html[data-theme=light]_&]:text-[#1D1D1F] text-xs border border-white/10 [html[data-theme=light]_&]:border-transparent transition cursor-pointer min-h-[36px]"
          >
            <Code className="w-3.5 h-3.5 text-purple-400 [html[data-theme=light]_&]:text-[#007AFF]" strokeWidth={2} /> Code Block
          </button>
        </div>

        {/* Realtime Scratchpad Text Area (Apple HIG Soft Input) */}
        <div className="relative">
          <textarea
            value={localText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type notes, draft code, or brainstorm here... Changes sync in real-time to your phone & desktop!"
            aria-label="Real-time synchronized scratchpad note"
            className="w-full h-[160px] min-h-[160px] bg-black/70 dark:bg-black/70 [html[data-theme=light]_&]:bg-[#F5F5F7] border border-white/10 dark:border-white/10 [html[data-theme=light]_&]:border-transparent focus:[html[data-theme=light]_&]:border-[#007AFF] rounded-2xl p-5 font-mono text-sm text-slate-100 dark:text-slate-100 [html[data-theme=light]_&]:text-[#1D1D1F] placeholder-slate-500 dark:placeholder-slate-500 [html[data-theme=light]_&]:placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:[html[data-theme=light]_&]:ring-[#007AFF]/20 transition resize-y leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {store.scratchpad.lastUpdatedBy
                ? `Last updated by ${store.scratchpad.lastUpdatedBy} (${formatLastUpdated(store.scratchpad.updatedAt)})`
                : 'Ready for cross-device notes'}
            </span>
          </div>

          <span>{localText.length} chars • {localText.split(/\s+/).filter(Boolean).length} words</span>
        </div>
      </div>
    </div>
  );
}
