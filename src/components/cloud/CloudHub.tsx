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
  ShieldCheck,
  HelpCircle,
  MessageSquareHeart
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useFirebasePresence } from '../../logic/useFirebasePresence';
import { FeedbackModal } from '../FeedbackModal';

interface CloudHubProps {
  isOpenCloudHelp?: boolean;
  onCloseCloudHelp?: () => void;
  onOpenCloudHelp?: () => void;
}

export function CloudHub({ isOpenCloudHelp, onCloseCloudHelp, onOpenCloudHelp }: CloudHubProps = {}) {
  const store = useStore($cloudStore);
  const [subTab, setSubTab] = useState<'presence' | 'clipboard' | 'link' | 'scratchpad' | 'screenshot'>('presence');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [localCloudHelpModal, setLocalCloudHelpModal] = useState(false);
  const [showCloudReviewModal, setShowCloudReviewModal] = useState(false);
  const [newRoomCode, setNewRoomCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const isHelpModalOpen = isOpenCloudHelp !== undefined ? isOpenCloudHelp : localCloudHelpModal;
  const handleOpenHelp = () => {
    if (onOpenCloudHelp) onOpenCloudHelp();
    else setLocalCloudHelpModal(true);
  };
  const handleCloseHelp = () => {
    if (onCloseCloudHelp) onCloseCloudHelp();
    else setLocalCloudHelpModal(false);
  };

  useFirebasePresence(store.roomId, store.deviceName || 'Windows Desktop');

  useEffect(() => {
    initCloudSession();
  }, []);

  const handleSwitchRoom = () => {
    if (newRoomCode.trim()) {
      switchCloudRoom(newRoomCode.trim());
      setNewRoomCode('');
      setShowRoomModal(false);
    }
  };

  const handleNewPrivateRoom = () => {
    const freshRoom = generateRandomRoomId();
    switchCloudRoom(freshRoom);
    setNewRoomCode('');
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
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 shadow-lg">
              <Globe className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Relayo Cloud Hub
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">
                Seamless cross-device productivity over the cloud
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => setShowCloudReviewModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer shadow-md"
              title="Leave a Review"
            >
              <MessageSquareHeart className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Leave a Review</span>
            </button>

            <button
              onClick={handleOpenHelp}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition cursor-pointer shadow-md"
              title="Help & Tutorial"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Help & Tutorial</span>
            </button>

            <button
              onClick={() => setShowRoomModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/60 hover:bg-black/80 border border-white/15 text-slate-200 text-xs font-bold transition shadow-md cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Change Room</span>
            </button>

            <button
              onClick={handleCopyRoomCode}
              className="p-2 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs transition cursor-pointer"
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
                placeholder="Enter room code (e.g. relayo-x8k3p9)..."
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
              <span>New Private Room</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center justify-start sm:justify-center overflow-x-auto gap-1 sm:gap-2 p-1 sm:p-1.5 glass-panel rounded-xl sm:rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
        <button
          onClick={() => setSubTab('presence')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-[11px] sm:text-xs transition whitespace-nowrap ${
            subTab === 'presence'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
          <span>Online Devices</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
            {store.devices.filter(d => d.id !== store.deviceId && d.status === 'online').length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('clipboard')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-[11px] sm:text-xs transition whitespace-nowrap ${
            subTab === 'clipboard'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <ClipboardCopy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
          <span>Clipboard Sync</span>
          {store.clipboards.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px]">
              {store.clipboards.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('link')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-[11px] sm:text-xs transition whitespace-nowrap ${
            subTab === 'link'
              ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
          <span>Links</span>
          {store.links.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 text-[10px]">
              {store.links.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('scratchpad')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-[11px] sm:text-xs transition whitespace-nowrap ${
            subTab === 'scratchpad'
              ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
          <span>Notes</span>
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

      {/* Single Unified Cloud Hub Features Panel */}
      <div className="mt-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Cloud Hub Features
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Powerful real-time cross-device productivity tools
            </p>
          </div>
          <button
            onClick={() => setShowCloudReviewModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
          >
            <MessageSquareHeart className="w-4 h-4 text-rose-400" />
            <span>Leave a Review</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Instant Cloud Sync</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time multi-device pairing across the global internet.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
              <ClipboardCopy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Clipboard Sync</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Copy text on one device and instantly paste it on any linked device.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Links</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Push and trigger URLs directly across your connected phones and PCs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Notes</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Shared cross-device scratchpad for quick joint notes and ideas.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Screenshot Sync</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Capture or upload screenshots for instant remote viewing and streaming.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Multi-Device Access</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect desktop PCs, laptops, tablets, and phones under isolated rooms.
              </p>
            </div>
          </div>
        </div>
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

      {/* Cloud Hub Tutorial Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl text-slate-100">
            <button
              onClick={handleCloseHelp}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">How Cloud Hub Works</h3>
                <p className="text-[11px] text-slate-400">Real-Time Multi-Device Cloud Productivity</p>
              </div>
            </div>

            <div className="space-y-3.5 my-6 text-xs">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/60 border border-white/10">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                <div>
                  <p className="font-bold text-white mb-0.5">Create or Join a Room</p>
                  <p className="text-slate-400 leading-normal">
                    Use the <strong className="text-cyan-300">New Private Room</strong> button to generate a fresh key, type an existing code into the input field and click <strong className="text-cyan-300">Join Room</strong>, or tap the QR code for instant mobile pairing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/60 border border-white/10">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                <div>
                  <p className="font-bold text-white mb-0.5">Online Devices</p>
                  <p className="text-slate-400 leading-normal">
                    Monitor your active status under <strong className="text-cyan-300">This Device</strong> and view all paired devices in real time under <strong className="text-cyan-300">Connected Devices</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/60 border border-white/10">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                <div>
                  <p className="font-bold text-white mb-0.5">Productivity Tools</p>
                  <p className="text-slate-400 leading-normal">
                    Switch between <strong className="text-cyan-300">Clipboard Sync</strong>, <strong className="text-cyan-300">Links</strong>, <strong className="text-cyan-300">Notes</strong>, and <strong className="text-cyan-300">Screenshots</strong> tabs to instantly share data across devices over the cloud.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleCloseHelp}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition cursor-pointer shadow-md"
            >
              Got it
            </button>
          </div>
        </div>
      )}
      {/* Cloud Hub User Review & Feedback Modal */}
      <FeedbackModal
        isOpen={showCloudReviewModal}
        onClose={() => setShowCloudReviewModal(false)}
      />
    </div>
  );
}
