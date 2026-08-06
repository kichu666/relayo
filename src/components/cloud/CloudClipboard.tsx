import { useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  $cloudStore,
  sendClipboardPayload,
  copyToSystemClipboard,
  readAndPushSystemClipboard,
  deleteClipboardItem
} from '../../logic/cloudStore';
import {
  ClipboardCopy,
  ClipboardPaste,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Clock,
  Laptop,
  Smartphone
} from 'lucide-react';

export function CloudClipboard() {
  const store = useStore($cloudStore);
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    await sendClipboardPayload(inputText);
    setInputText('');
  };

  const handleCopyItem = async (id: string, text: string) => {
    await copyToSystemClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const formatTime = (ts: number) => {
    const seconds = Math.floor((Date.now() - ts) / 1000);
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Input Box Card */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 [html[data-theme=light]_&]:border-slate-200 bg-slate-900/60 [html[data-theme=light]_&]:bg-white [html[data-theme=light]_&]:shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ClipboardCopy className="w-5 h-5 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600" />
            <h3 className="text-base font-bold text-white [html[data-theme=light]_&]:text-slate-900">Send Clipboard to Cloud</h3>
          </div>
          <button
            onClick={readAndPushSystemClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 [html[data-theme=light]_&]:bg-slate-50 [html[data-theme=light]_&]:hover:bg-slate-100 [html[data-theme=light]_&]:text-slate-700 border border-cyan-500/30 [html[data-theme=light]_&]:border-[#D7E6F4] text-xs font-semibold transition cursor-pointer"
            title="Read system clipboard and send directly"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600" />
            <span>Paste System Clipboard</span>
          </button>
        </div>

        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste text payload here to copy across your linked devices..."
            className="w-full h-[160px] bg-black/60 dark:bg-black/60 [html[data-theme=light]_&]:bg-white border border-white/10 dark:border-white/10 [html[data-theme=light]_&]:border-[#D7E6F4] rounded-2xl p-5 text-sm font-mono text-white dark:text-white [html[data-theme=light]_&]:text-[#1E293B] placeholder-slate-500 dark:placeholder-slate-500 [html[data-theme=light]_&]:placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:[html[data-theme=light]_&]:ring-0 focus:[html[data-theme=light]_&]:border-[#22B8FF] focus:[html[data-theme=light]_&]:shadow-[0_0_0_4px_rgba(34,184,255,0.15)] transition resize-none leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-slate-400 [html[data-theme=light]_&]:text-slate-500">
            {inputText.length} characters
          </span>
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)] transition transform active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Sync Payload</span>
          </button>
        </div>
      </div>

      {/* Synced Clipboard History */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Cloud Clipboard Stream ({store.clipboards.length})
          </h4>
          <span className="text-xs text-slate-500">Auto-copies across linked devices</span>
        </div>

        {store.clipboards.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-white/5 bg-black/30">
            <ClipboardCopy className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No clipboard items synced yet.</p>
            <p className="text-xs text-slate-500 mt-1">Copy text on your phone or desktop to view it live here!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {store.clipboards.map((item) => {
              const isSender = item.senderId === store.deviceId;
              const isJustCopied = copiedId === item.id;

              return (
                <div
                  key={item.id}
                  className="glass-panel p-4 rounded-2xl border border-white/10 bg-slate-900/40 hover:bg-slate-900/60 transition group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-white/5 text-cyan-400 text-xs">
                        {isSender ? <Laptop className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                      </span>
                      <span className="text-xs font-semibold text-slate-300">
                        {item.senderName}
                      </span>
                      {isSender && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          You
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatTime(item.timestamp)}
                      </span>
                      <button
                        onClick={() => deleteClipboardItem(item.id)}
                        className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-black/50 p-3 rounded-xl border border-white/5 font-mono text-sm text-slate-200 break-all select-text max-h-36 overflow-y-auto">
                    {item.text}
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-3">
                    <button
                      onClick={() => handleCopyItem(item.id, item.text)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        isJustCopied
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                      }`}
                    >
                      {isJustCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Copy Text</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
