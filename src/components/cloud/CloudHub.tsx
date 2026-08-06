import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  $cloudStore,
  initCloudSession,
  switchCloudRoom,
  generateRandomRoomId,
  triggerCloudToast
} from '../../logic/cloudStore';
import { PresenceTracker } from './PresenceTracker';
import { CloudClipboard } from './CloudClipboard';
import { CloudLinkPusher } from './CloudLinkPusher';
import { CloudScratchpad } from './CloudScratchpad';
import { CloudScreenshot } from './CloudScreenshot';
import {
  Users,
  ClipboardCopy,
  Link2,
  FileText,
  Camera,
  Globe,
  Radio,
  Sparkles,
  QrCode,
  KeyRound,
  Check,
  X,
  ShieldCheck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export function CloudHub() {
  const store = useStore($cloudStore);
  const [subTab, setSubTab] = useState<'presence' | 'clipboard' | 'link' | 'scratchpad' | 'screenshot'>('presence');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [newRoomCode, setNewRoomCode] = useState(store.roomId);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    initCloudSession();
  }, []);

  const handleSwitchRoom = () => {
    if (newRoomCode.trim()) {
      switchCloudRoom(newRoomCode);
      setShowRoomModal(false);
    }
  };

  const handleNewPrivateRoom = () => {
    const freshRoom = generateRandomRoomId();
    setNewRoomCode(freshRoom);
    switchCloudRoom(freshRoom);
  };

  const handleCopyRoomCode = () => {
    const roomUrl = `https://relayo-eight.vercel.app/?room=${encodeURIComponent(store.roomId)}`;
    navigator.clipboard.writeText(roomUrl);
    setCopiedCode(true);
    triggerCloudToast('Cloud Room link copied to clipboard!', 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Toast Notification Alert */}
      {store.toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/90 border border-cyan-500/40 text-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.3)] backdrop-blur-xl animate-bounce">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-semibold">{store.toast.message}</span>
        </div>
      )}

      {/* Top Banner & Room Switcher */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 shadow-lg">
              <Globe className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black tracking-tight text-white">
                  Firebase Cloud Hub
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  <Radio className="w-3 h-3 text-cyan-400 animate-ping" />
                  ● Global Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Seamless cross-device productivity over the internet via Firebase
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRoomModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/60 hover:bg-black/80 border border-white/15 text-slate-200 text-xs font-bold transition shadow-md"
            >
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <span>Room:</span>
              <span className="font-mono text-cyan-300 tracking-wider">{store.roomId}</span>
            </button>

            <button
              onClick={handleCopyRoomCode}
              className="p-2 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs transition"
              title="Copy Room Link"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <QrCode className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Prominent Room Code Input & Quick Switcher */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <KeyRound className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={newRoomCode}
                onChange={(e) => setNewRoomCode(e.target.value)}
                placeholder="Type custom shared room code (e.g. my-secret-room)"
                className="w-full bg-black/60 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-cyan-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                onKeyDown={(e) => e.key === 'Enter' && handleSwitchRoom()}
              />
            </div>
            <button
              onClick={handleSwitchRoom}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition shadow-md whitespace-nowrap cursor-pointer"
            >
              Join Room
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewPrivateRoom}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold transition whitespace-nowrap cursor-pointer"
              title="Generate new random private room ID"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>🎲 New Private Room</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center justify-start sm:justify-center overflow-x-auto gap-2 p-1.5 glass-panel rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
        <button
          onClick={() => setSubTab('presence')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition whitespace-nowrap ${
            subTab === 'presence'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4 text-cyan-400" />
          <span>Device Presence</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
            {store.devices.filter(d => d.id !== store.deviceId && d.status === 'online').length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('clipboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition whitespace-nowrap ${
            subTab === 'clipboard'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <ClipboardCopy className="w-4 h-4 text-cyan-400" />
          <span>Clipboard</span>
          {store.clipboards.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px]">
              {store.clipboards.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('link')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition whitespace-nowrap ${
            subTab === 'link'
              ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Link2 className="w-4 h-4 text-purple-400" />
          <span>Send Link</span>
          {store.links.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 text-[10px]">
              {store.links.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('scratchpad')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition whitespace-nowrap ${
            subTab === 'scratchpad'
              ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Scratchpad</span>
        </button>

        <button
          onClick={() => setSubTab('screenshot')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition whitespace-nowrap ${
            subTab === 'screenshot'
              ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Camera className="w-4 h-4 text-amber-400" />
          <span>Screenshots</span>
          {store.screenshots.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">
              {store.screenshots.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="pt-2">
        {subTab === 'presence' && <PresenceTracker />}
        {subTab === 'clipboard' && <CloudClipboard />}
        {subTab === 'link' && <CloudLinkPusher />}
        {subTab === 'scratchpad' && <CloudScratchpad />}
        {subTab === 'screenshot' && <CloudScreenshot />}
      </div>

      {/* Cloud Room Switcher Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative max-w-md w-full glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Join / Pair Cloud Room</h3>
              </div>
              <button
                onClick={() => setShowRoomModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Enter any Room Code to pair your devices across the internet. All devices using the same room code will sync clipboard, links, notes, and screen captures instantly!
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cloud Room Code
              </label>
              <input
                type="text"
                value={newRoomCode}
                onChange={(e) => setNewRoomCode(e.target.value)}
                placeholder="e.g. relayo.world, my-devices"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm text-cyan-300 tracking-wider focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                onKeyDown={(e) => e.key === 'Enter' && handleSwitchRoom()}
              />
            </div>

            <div className="flex justify-center p-3 bg-white rounded-xl">
              <QRCodeSVG
                value={`https://relayo-eight.vercel.app/?room=${encodeURIComponent(store.roomId)}`}
                size={140}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRoomModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSwitchRoom}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition"
              >
                Switch Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
