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
  Clock,
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
      <div className="glass-panel p-5 rounded-2xl border border-white/10 [html[data-theme=light]_&]:border-slate-200 bg-slate-900/60 [html[data-theme=light]_&]:bg-white [html[data-theme=light]_&]:shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400 [html[data-theme=light]_&]:text-emerald-600" />
            <div>
              <h3 className="text-base font-bold text-white [html[data-theme=light]_&]:text-slate-900">Cloud Synced Scratchpad</h3>
              <span className="text-xs text-slate-400 [html[data-theme=light]_&]:text-slate-500">Notes update live across all connected devices</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyNote}
              disabled={!localText}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isCopied
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white/5 hover:bg-white/10 [html[data-theme=light]_&]:bg-slate-100 [html[data-theme=light]_&]:hover:bg-slate-200 text-slate-200 [html[data-theme=light]_&]:text-slate-700 border border-white/10 [html[data-theme=light]_&]:border-slate-200 disabled:opacity-40'
              }`}
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400 [html[data-theme=light]_&]:text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-emerald-400 [html[data-theme=light]_&]:text-emerald-600" />}
              <span>{isCopied ? 'Copied!' : 'Copy Note'}</span>
            </button>

            <button
              onClick={clearScratchpadNote}
              disabled={!localText}
              className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs disabled:opacity-40 transition cursor-pointer"
              title="Clear Scratchpad"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-2 mb-2 pt-1 border-t border-white/5 [html[data-theme=light]_&]:border-slate-100">
          <span className="text-[11px] text-slate-400 [html[data-theme=light]_&]:text-slate-500 font-medium">Quick Insert:</span>
          <button
            onClick={() => handleInsertTemplate('bullets')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 [html[data-theme=light]_&]:bg-slate-100 [html[data-theme=light]_&]:hover:bg-slate-200 text-slate-300 [html[data-theme=light]_&]:text-slate-700 text-xs border border-white/10 [html[data-theme=light]_&]:border-slate-200 transition cursor-pointer"
          >
            <List className="w-3 h-3 text-emerald-400 [html[data-theme=light]_&]:text-emerald-600" /> List
          </button>
          <button
            onClick={() => handleInsertTemplate('todo')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 [html[data-theme=light]_&]:bg-slate-100 [html[data-theme=light]_&]:hover:bg-slate-200 text-slate-300 [html[data-theme=light]_&]:text-slate-700 text-xs border border-white/10 [html[data-theme=light]_&]:border-slate-200 transition cursor-pointer"
          >
            <CheckSquare className="w-3 h-3 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600" /> Checklist
          </button>
          <button
            onClick={() => handleInsertTemplate('code')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 [html[data-theme=light]_&]:bg-slate-100 [html[data-theme=light]_&]:hover:bg-slate-200 text-slate-300 [html[data-theme=light]_&]:text-slate-700 text-xs border border-white/10 [html[data-theme=light]_&]:border-slate-200 transition cursor-pointer"
          >
            <Code className="w-3 h-3 text-purple-400 [html[data-theme=light]_&]:text-purple-600" /> Code Block
          </button>
        </div>

        {/* Realtime Scratchpad Text Area */}
        <div className="relative">
          <textarea
            value={localText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type notes, draft code, or brainstorm here... Changes sync in real-time to your phone & desktop!"
            className="w-full h-[160px] min-h-[160px] bg-black/70 dark:bg-black/70 [html[data-theme=light]_&]:bg-white border border-white/10 dark:border-white/10 [html[data-theme=light]_&]:border-[#D7E6F4] rounded-2xl p-5 font-mono text-sm text-slate-100 dark:text-slate-100 [html[data-theme=light]_&]:text-[#1E293B] placeholder-slate-500 dark:placeholder-slate-500 [html[data-theme=light]_&]:placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:[html[data-theme=light]_&]:ring-0 focus:[html[data-theme=light]_&]:border-[#22B8FF] focus:[html[data-theme=light]_&]:shadow-[0_0_0_4px_rgba(34,184,255,0.15)] transition resize-y leading-relaxed"
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
