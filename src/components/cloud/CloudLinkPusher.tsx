import { useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  $cloudStore,
  sendLinkPayload,
  copyToSystemClipboard,
  deleteLinkItem
} from '../../logic/cloudStore';
import {
  Link2,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Send,
  Globe,
  Clock,
  Laptop,
  Smartphone
} from 'lucide-react';

export function CloudLinkPusher() {
  const store = useStore($cloudStore);
  const [urlInput, setUrlInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handlePushLink = async () => {
    if (!urlInput.trim()) return;
    await sendLinkPayload(urlInput, noteInput);
    setUrlInput('');
    setNoteInput('');
  };

  const handleCopy = async (id: string, url: string) => {
    await copyToSystemClipboard(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getDomain = (urlStr: string) => {
    try {
      const parsed = new URL(urlStr);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return urlStr;
    }
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
      {/* Input Link Card */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 [html[data-theme=light]_&]:border-[#E5E5EA] bg-slate-900/60 [html[data-theme=light]_&]:bg-white [html[data-theme=light]_&]:shadow-[0_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="w-5 h-5 text-purple-400 [html[data-theme=light]_&]:text-[#007AFF]" strokeWidth={2} />
          <h3 className="text-base font-extrabold text-white [html[data-theme=light]_&]:text-[#1D1D1F]">Push & Trigger Link across Devices</h3>
        </div>

        <div className="space-y-3.5">
          <div>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste or type URL (e.g. https://github.com or google.com)"
              className="w-full h-11 min-h-[44px] bg-black/60 dark:bg-black/60 [html[data-theme=light]_&]:bg-[#F5F5F7] border border-white/10 dark:border-white/10 [html[data-theme=light]_&]:border-transparent focus:[html[data-theme=light]_&]:border-[#007AFF] rounded-xl px-4 py-2 text-sm font-mono text-white dark:text-white [html[data-theme=light]_&]:text-[#1D1D1F] placeholder-slate-500 dark:placeholder-slate-500 [html[data-theme=light]_&]:placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:[html[data-theme=light]_&]:ring-[#007AFF]/20 transition"
              onKeyDown={(e) => e.key === 'Enter' && handlePushLink()}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Optional note / title..."
              className="flex-1 h-11 min-h-[44px] bg-black/60 dark:bg-black/60 [html[data-theme=light]_&]:bg-[#F5F5F7] border border-white/10 dark:border-white/10 [html[data-theme=light]_&]:border-transparent focus:[html[data-theme=light]_&]:border-[#007AFF] rounded-xl px-4 py-2 text-xs sm:text-sm text-white dark:text-white [html[data-theme=light]_&]:text-[#1D1D1F] placeholder-slate-500 dark:placeholder-slate-500 [html[data-theme=light]_&]:placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:[html[data-theme=light]_&]:ring-[#007AFF]/20 transition"
              onKeyDown={(e) => e.key === 'Enter' && handlePushLink()}
            />
            <button
              onClick={handlePushLink}
              disabled={!urlInput.trim()}
              className="h-11 min-h-[44px] flex items-center justify-center gap-2 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 [html[data-theme=light]_&]:bg-[#007AFF] [html[data-theme=light]_&]:from-[#007AFF] [html[data-theme=light]_&]:to-[#007AFF] hover:from-purple-500 hover:to-indigo-500 hover:[html[data-theme=light]_&]:bg-[#0066CC] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-[0_0_15px_rgba(147,51,234,0.3)] [html[data-theme=light]_&]:shadow-md transition transform active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Send className="w-4 h-4" strokeWidth={2} />
              <span>Push URL</span>
            </button>
          </div>
        </div>
      </div>

      {/* Synced Links History */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Cloud Link Stream ({store.links.length})
          </h4>
          <span className="text-xs text-slate-500">Click to open instantly on any device</span>
        </div>

        {store.links.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-white/5 bg-black/30">
            <Globe className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No links pushed yet.</p>
            <p className="text-xs text-slate-500 mt-1">Push links from your phone to open them on your desktop!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {store.links.map((item) => {
              const isSender = item.senderId === store.deviceId;
              const domain = getDomain(item.url);
              const isJustCopied = copiedId === item.id;

              return (
                <div
                  key={item.id}
                  className="glass-panel p-4 rounded-2xl border border-white/10 bg-slate-900/40 hover:bg-slate-900/60 transition group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-white/5 text-purple-400 text-xs">
                        {isSender ? <Laptop className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                      </span>
                      <span className="text-xs font-semibold text-slate-300">
                        {item.senderName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                        {domain}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatTime(item.timestamp)}
                      </span>
                      <button
                        onClick={() => deleteLinkItem(item.id)}
                        className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-1">
                    {item.note && (
                      <p className="text-xs text-slate-300 font-medium mb-1">
                        {item.note}
                      </p>
                    )}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-cyan-300 hover:text-cyan-200 underline underline-offset-2 break-all"
                    >
                      {item.url}
                    </a>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-3">
                    <button
                      onClick={() => handleCopy(item.id, item.url)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        isJustCopied
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                      }`}
                    >
                      {isJustCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
                      <span>{isJustCopied ? 'Copied!' : 'Copy Link'}</span>
                    </button>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-semibold transition shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Link 🚀</span>
                    </a>
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
