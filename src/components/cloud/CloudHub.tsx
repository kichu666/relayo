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
  Sparkles,
  QrCode,
  KeyRound,
  Check,
  X,
  HelpCircle,
  ArrowLeft,
  Copy
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { FeedbackModal } from '../FeedbackModal';

interface CloudHubProps {
  isOpenCloudHelp?: boolean;
  onCloseCloudHelp?: () => void;
  onOpenCloudHelp?: () => void;
  onBackToLocal?: () => void;
}

export function CloudHub({
  isOpenCloudHelp,
  onCloseCloudHelp,
  onOpenCloudHelp,
  onBackToLocal
}: CloudHubProps = {}) {
  const store = useStore($cloudStore);
  const [subTab, setSubTab] = useState<'presence' | 'clipboard' | 'link' | 'scratchpad' | 'screenshot'>('presence');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
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
    const roomUrl = `${window.location.origin}/?room=${encodeURIComponent(store.roomId)}`;
    navigator.clipboard.writeText(roomUrl);
    setCopiedCode(true);
    triggerCloudToast('Cloud Room link copied to clipboard!', 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-36 sm:pb-44">
      {/* Back to Local Navigation Button */}
      {onBackToLocal && (
        <button
          type="button"
          onClick={onBackToLocal}
          aria-label="Back to Local P2P Mode"
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white [html[data-theme=light]_&]:text-slate-600 [html[data-theme=light]_&]:hover:text-slate-900 transition-colors cursor-pointer w-fit group py-1.5 px-3 rounded-xl hover:bg-white/5 [html[data-theme=light]_&]:hover:bg-slate-100 min-h-[44px]"
          title="Back to Local P2P Mode"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:text-white [html[data-theme=light]_&]:text-slate-500 [html[data-theme=light]_&]:group-hover:text-slate-900 group-hover:-translate-x-1 transition-transform" strokeWidth={2} />
          <span className="font-semibold">Back to Local</span>
        </button>
      )}

      {/* Toast Notification Alert */}
      {store.toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)] backdrop-blur-xl animate-fade-in">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" strokeWidth={2} />
          <span className="text-xs font-semibold">{store.toast.message}</span>
        </div>
      )}

      {/* Top Banner & Room Switcher (Mobile Responsive & Airy Surface) */}
      <div className="glass-panel p-4 sm:p-6 md:p-8 rounded-3xl border border-white/10 [html[data-theme=light]_&]:border-[#D5E9FF] bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 [html[data-theme=light]_&]:bg-[linear-gradient(135deg,#F8FCFF_0%,#EDF7FF_40%,#E2F2FF_100%)] shadow-2xl [html[data-theme=light]_&]:shadow-[0_18px_45px_rgba(14,165,233,0.10)] backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 [html[data-theme=light]_&]:bg-cyan-400/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 [html[data-theme=light]_&]:bg-cyan-300/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          {/* Header Title & Subtitle Section */}
          <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="p-2 sm:p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 [html[data-theme=light]_&]:bg-cyan-500/10 border border-cyan-500/30 [html[data-theme=light]_&]:border-cyan-400/30 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600 shadow-lg shrink-0">
                <Globe className="w-5 h-5 sm:w-6 sm:h-7" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl md:text-2xl font-extrabold tracking-tight text-white [html[data-theme=light]_&]:text-[#0F172A] truncate">
                  Relayo Cloud Hub
                </h2>
                <p className="text-[11px] sm:text-xs font-medium text-slate-400 [html[data-theme=light]_&]:text-[#475569] mt-0.5 sm:mt-1 truncate">
                  Seamless cross-device productivity over the cloud
                </p>
              </div>
            </div>

            {/* QR Button for small mobile screens */}
            <button
              type="button"
              onClick={() => setShowQRModal(true)}
              aria-label="Share Room & QR Code"
              className="sm:hidden w-10 h-10 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 [html[data-theme=light]_&]:bg-white [html[data-theme=light]_&]:hover:bg-slate-50 border border-cyan-500/30 [html[data-theme=light]_&]:border-[#D8E9FF] text-xs transition cursor-pointer shadow-sm shrink-0"
              title="Share Room & QR Code"
            >
              <QrCode className="w-4 h-4 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600" strokeWidth={2} />
            </button>
          </div>

          {/* Active Room Code Badge & QR Button Container */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end mt-1 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF]">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-3.5 sm:py-2.5 bg-black/40 dark:bg-slate-900/90 [html[data-theme=light]_&]:bg-white border border-white/10 [html[data-theme=light]_&]:border-[#D5E9FF] rounded-xl text-xs font-mono text-slate-300 [html[data-theme=light]_&]:text-[#0F172A] shadow-sm w-full sm:w-auto justify-between sm:justify-start">
              <div className="inline-flex items-center gap-1.5 min-w-0">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600 shrink-0" strokeWidth={2} />
                <span className="font-sans font-medium text-[11px] sm:text-xs text-slate-400 [html[data-theme=light]_&]:text-slate-600 leading-none">Active Room:</span>
              </div>
              <span className="font-mono font-bold text-cyan-300 [html[data-theme=light]_&]:text-cyan-700 tracking-wider truncate text-xs sm:text-sm leading-none pl-2">
                {store.roomId}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowQRModal(true)}
              aria-label="Share Room & QR Code"
              className="hidden sm:flex w-10 h-10 sm:w-11 sm:h-11 min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px] items-center justify-center rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 [html[data-theme=light]_&]:bg-white [html[data-theme=light]_&]:hover:bg-slate-50 border border-cyan-500/30 [html[data-theme=light]_&]:border-[#D8E9FF] text-xs transition cursor-pointer shadow-sm shrink-0"
              title="Share Room & QR Code"
            >
              <QrCode className="w-4 h-4 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600" strokeWidth={2} />
            </button>

            <button
              type="button"
              onClick={handleOpenHelp}
              aria-label="How Cloud Hub Works"
              className="w-10 h-10 sm:w-11 sm:h-11 min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px] flex items-center justify-center rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 [html[data-theme=light]_&]:bg-white [html[data-theme=light]_&]:hover:bg-slate-50 border border-cyan-500/30 [html[data-theme=light]_&]:border-[#D8E9FF] text-xs transition cursor-pointer shadow-sm shrink-0"
              title="How Cloud Hub Works"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Prominent Room Code Input & Quick Switcher */}
        <div className="mt-3.5 sm:mt-6 pt-3.5 sm:pt-5 border-t border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 relative z-10">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 flex-1 max-w-lg">
            <div className="relative flex-1 w-full">
              <KeyRound className="w-4 h-4 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
              <input
                type="text"
                value={newRoomCode}
                onChange={(e) => setNewRoomCode(e.target.value)}
                placeholder="Enter room code (e.g. relayo-x8k3p9)..."
                aria-label="Enter cloud room code"
                className="w-full h-10 sm:h-11 min-h-[40px] bg-black/60 [html[data-theme=light]_&]:bg-white border border-white/15 [html[data-theme=light]_&]:border-[#D7E8FF] focus:[html[data-theme=light]_&]:border-[#22C7F2] rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm font-mono text-cyan-300 [html[data-theme=light]_&]:text-[#0F172A] placeholder-slate-500 [html[data-theme=light]_&]:placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:[html[data-theme=light]_&]:ring-0 focus:[html[data-theme=light]_&]:shadow-[0_0_0_4px_rgba(34,199,242,0.15)] transition"
                onKeyDown={(e) => e.key === 'Enter' && handleSwitchRoom()}
              />
            </div>
            <button
              type="button"
              onClick={handleSwitchRoom}
              aria-label="Join Room"
              className="w-full sm:w-auto h-10 sm:h-11 min-h-[40px] px-5 sm:px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition shadow-md whitespace-nowrap cursor-pointer flex items-center justify-center"
            >
              Join Room
            </button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={handleNewPrivateRoom}
              aria-label="Generate new random private room ID"
              className="w-full sm:w-auto h-10 sm:h-11 min-h-[40px] flex items-center justify-center gap-2 px-4 rounded-xl bg-white/5 [html[data-theme=light]_&]:bg-white hover:bg-white/10 hover:[html[data-theme=light]_&]:bg-slate-50 text-slate-300 [html[data-theme=light]_&]:text-[#0F172A] border border-white/10 [html[data-theme=light]_&]:border-[#D8E9FF] text-xs font-semibold transition whitespace-nowrap cursor-pointer"
              title="Generate new random private room ID"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 [html[data-theme=light]_&]:text-purple-600" strokeWidth={2} />
              <span>New Private Room</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar with Horizontal Scrollability Hint */}
      <div className="relative group/tabs overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF]">
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto gap-1 sm:gap-2 p-1.5 glass-panel bg-black/40 [html[data-theme=light]_&]:bg-white [html[data-theme=light]_&]:shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-xl" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'presence'}
            onClick={() => setSubTab('presence')}
            aria-label="Online Devices"
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-[11px] sm:text-xs transition whitespace-nowrap min-h-[44px] cursor-pointer ${subTab === 'presence'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 [html[data-theme=light]_&]:text-cyan-700 [html[data-theme=light]_&]:bg-cyan-50 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)] [html[data-theme=light]_&]:shadow-none'
              : 'text-slate-400 [html[data-theme=light]_&]:text-slate-600 hover:text-slate-200 [html[data-theme=light]_&]:hover:text-slate-900 hover:bg-white/5 [html[data-theme=light]_&]:hover:bg-slate-100'
              }`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600" strokeWidth={2} />
            <span>Online Devices</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 [html[data-theme=light]_&]:text-emerald-700 text-[10px]">
              {store.devices.filter(d => d.id !== store.deviceId && d.status === 'online').length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'clipboard'}
            onClick={() => setSubTab('clipboard')}
            aria-label="Clipboard Sync"
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-[11px] sm:text-xs transition whitespace-nowrap min-h-[44px] cursor-pointer ${subTab === 'clipboard'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 [html[data-theme=light]_&]:text-cyan-700 [html[data-theme=light]_&]:bg-cyan-50 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)] [html[data-theme=light]_&]:shadow-none'
              : 'text-slate-400 [html[data-theme=light]_&]:text-slate-600 hover:text-slate-200 [html[data-theme=light]_&]:hover:text-slate-900 hover:bg-white/5 [html[data-theme=light]_&]:hover:bg-slate-100'
              }`}
          >
            <ClipboardCopy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600" strokeWidth={2} />
            <span>Clipboard Sync</span>
            {store.clipboards.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 [html[data-theme=light]_&]:text-cyan-700 text-[10px]">
                {store.clipboards.length}
              </span>
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'link'}
            onClick={() => setSubTab('link')}
            aria-label="Links"
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-[11px] sm:text-xs transition whitespace-nowrap min-h-[44px] cursor-pointer ${subTab === 'link'
              ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 [html[data-theme=light]_&]:text-purple-700 [html[data-theme=light]_&]:bg-purple-50 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)] [html[data-theme=light]_&]:shadow-none'
              : 'text-slate-400 [html[data-theme=light]_&]:text-slate-600 hover:text-slate-200 [html[data-theme=light]_&]:hover:text-slate-900 hover:bg-white/5 [html[data-theme=light]_&]:hover:bg-slate-100'
              }`}
          >
            <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 [html[data-theme=light]_&]:text-purple-600" strokeWidth={2} />
            <span>Links</span>
            {store.links.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 [html[data-theme=light]_&]:text-purple-700 text-[10px]">
                {store.links.length}
              </span>
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'scratchpad'}
            onClick={() => setSubTab('scratchpad')}
            aria-label="Notes"
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-[11px] sm:text-xs transition whitespace-nowrap min-h-[44px] cursor-pointer ${subTab === 'scratchpad'
              ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 [html[data-theme=light]_&]:text-emerald-700 [html[data-theme=light]_&]:bg-emerald-50 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)] [html[data-theme=light]_&]:shadow-none'
              : 'text-slate-400 [html[data-theme=light]_&]:text-slate-600 hover:text-slate-200 [html[data-theme=light]_&]:hover:text-slate-900 hover:bg-white/5 [html[data-theme=light]_&]:hover:bg-slate-100'
              }`}
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 [html[data-theme=light]_&]:text-emerald-600" strokeWidth={2} />
            <span>Notes</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'screenshot'}
            onClick={() => setSubTab('screenshot')}
            aria-label="Screenshots"
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-[11px] sm:text-xs transition whitespace-nowrap min-h-[44px] cursor-pointer ${subTab === 'screenshot'
              ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 [html[data-theme=light]_&]:text-amber-700 [html[data-theme=light]_&]:bg-amber-50 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)] [html[data-theme=light]_&]:shadow-none'
              : 'text-slate-400 [html[data-theme=light]_&]:text-slate-600 hover:text-slate-200 [html[data-theme=light]_&]:hover:text-slate-900 hover:bg-white/5 [html[data-theme=light]_&]:hover:bg-slate-100'
              }`}
          >
            <Camera className="w-4 h-4 text-amber-400 [html[data-theme=light]_&]:text-amber-600" strokeWidth={2} />
            <span>Screenshots</span>
            {store.screenshots.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 [html[data-theme=light]_&]:text-amber-700 text-[10px]">
                {store.screenshots.length}
              </span>
            )}
          </button>
        </div>
        {/* Subtle Gradient Fade hint on right edge for horizontal scroll */}
        <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-black/60 via-black/20 to-transparent [html[data-theme=light]_&]:from-slate-50 [html[data-theme=light]_&]:to-transparent pointer-events-none rounded-r-2xl sm:hidden" />
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
      <div className="mt-8 bg-black/40 [html[data-theme=light]_&]:bg-white backdrop-blur-xl border border-white/10 [html[data-theme=light]_&]:border-slate-200/80 [html[data-theme=light]_&]:shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-2xl p-6 md:p-8 text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10 [html[data-theme=light]_&]:border-slate-100">
          <div>
            <h3 className="text-base font-bold text-white [html[data-theme=light]_&]:text-slate-900 tracking-wide">
              Cloud Hub Features
            </h3>
            <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-slate-500 mt-0.5">
              Powerful real-time cross-device productivity tools
            </p>
          </div>
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
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 pt-20 sm:pt-4 bg-black/80 dark:bg-black/80 [html[data-theme=light]_&]:bg-[rgba(248,250,252,0.35)] backdrop-blur-md animate-fade-in">
          <div className="relative max-w-md w-full glass-panel p-6 rounded-3xl border border-white/10 dark:border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900 dark:bg-slate-900 [html[data-theme=light]_&]:bg-[linear-gradient(180deg,#F9FCFF_0%,#EEF7FF_100%)] shadow-2xl [html[data-theme=light]_&]:shadow-[0_20px_60px_rgba(14,165,233,0.12)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-cyan-400 [html[data-theme=light]_&]:text-[#0EA5E9]" strokeWidth={2} />
                <h3 className="text-base font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">Join / Pair Cloud Room</h3>
              </div>
              <button
                onClick={() => setShowRoomModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white [html[data-theme=light]_&]:text-[#475569] [html[data-theme=light]_&]:hover:text-[#0F172A]"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
              Enter any Room Code to pair your devices across the internet. All devices using the same room code will sync clipboard, links, notes, and screen captures instantly!
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 [html[data-theme=light]_&]:text-[#0F172A] mb-1">
                Cloud Room Code
              </label>
              <input
                type="text"
                value={newRoomCode}
                onChange={(e) => setNewRoomCode(e.target.value)}
                placeholder="e.g. my-private-room, team-sync"
                className="w-full bg-black/60 [html[data-theme=light]_&]:bg-white border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] hover:[html[data-theme=light]_&]:border-[#B8DCFF] focus:[html[data-theme=light]_&]:border-[#22C7F2] rounded-xl px-4 py-2.5 font-mono text-sm text-cyan-300 [html[data-theme=light]_&]:text-[#0F172A] tracking-wider focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:[html[data-theme=light]_&]:ring-0 focus:[html[data-theme=light]_&]:shadow-[0_0_0_4px_rgba(34,199,242,0.15)] transition"
                onKeyDown={(e) => e.key === 'Enter' && handleSwitchRoom()}
              />
            </div>

            <div className="flex justify-center p-3 bg-white rounded-xl border border-slate-100">
              <QRCodeSVG
                value={`${window.location.origin}/?room=${store.roomId}`}
                size={160}
                className="w-40 h-40"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRoomModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 [html[data-theme=light]_&]:bg-white hover:bg-white/10 hover:[html[data-theme=light]_&]:bg-slate-50 text-slate-300 [html[data-theme=light]_&]:text-[#0F172A] border border-transparent [html[data-theme=light]_&]:border-[#D8E9FF] text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSwitchRoom}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition shadow-md cursor-pointer"
              >
                Switch Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Hub Tutorial Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 pt-20 sm:pt-4 bg-black/80 dark:bg-black/80 [html[data-theme=light]_&]:bg-[rgba(248,250,252,0.35)] backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-950 dark:bg-slate-950 [html[data-theme=light]_&]:bg-[linear-gradient(180deg,#F9FCFF_0%,#EEF7FF_100%)] border border-white/10 dark:border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] rounded-3xl p-6 shadow-2xl dark:shadow-2xl [html[data-theme=light]_&]:shadow-[0_20px_60px_rgba(14,165,233,0.12)] backdrop-blur-2xl text-slate-100 dark:text-slate-100 [html[data-theme=light]_&]:text-[#0F172A]">
            <button
              onClick={handleCloseHelp}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 dark:bg-white/5 [html[data-theme=light]_&]:bg-white hover:bg-white/10 dark:hover:bg-white/10 hover:[html[data-theme=light]_&]:bg-slate-50 border border-white/10 dark:border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] text-slate-400 dark:text-slate-400 [html[data-theme=light]_&]:text-[#475569] hover:text-white dark:hover:text-white hover:[html[data-theme=light]_&]:text-[#0F172A] [html[data-theme=light]_&]:shadow-sm transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 [html[data-theme=light]_&]:text-[#0EA5E9] [html[data-theme=light]_&]:bg-cyan-50 [html[data-theme=light]_&]:border-[#D7E8FF]">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white dark:text-white [html[data-theme=light]_&]:text-[#0F172A]">How Cloud Hub Works</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 [html[data-theme=light]_&]:text-[#475569]">Real-Time Multi-Device Cloud Productivity</p>
              </div>
            </div>

            <div className="space-y-3.5 my-6 text-xs">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/60 dark:bg-black/60 [html[data-theme=light]_&]:bg-white border border-white/10 dark:border-white/10 [html[data-theme=light]_&]:border-[#E2E8F0] [html[data-theme=light]_&]:shadow-sm">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 [html[data-theme=light]_&]:text-cyan-700 [html[data-theme=light]_&]:bg-cyan-100 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                <div>
                  <p className="font-bold text-white dark:text-white [html[data-theme=light]_&]:text-[#0F172A] mb-0.5">Create or Join a Room</p>
                  <p className="text-slate-400 dark:text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-normal">
                    Use the <strong className="text-cyan-300 dark:text-cyan-300 [html[data-theme=light]_&]:text-cyan-700">New Private Room</strong> button to generate a fresh key, type an existing code into the input field and click <strong className="text-cyan-300 dark:text-cyan-300 [html[data-theme=light]_&]:text-cyan-700">Join Room</strong>, or tap the QR code for instant mobile pairing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/60 dark:bg-black/60 [html[data-theme=light]_&]:bg-white border border-white/10 dark:border-white/10 [html[data-theme=light]_&]:border-[#E2E8F0] [html[data-theme=light]_&]:shadow-sm">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 [html[data-theme=light]_&]:text-indigo-700 [html[data-theme=light]_&]:bg-indigo-100 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                <div>
                  <p className="font-bold text-white dark:text-white [html[data-theme=light]_&]:text-[#0F172A] mb-0.5">Online Devices</p>
                  <p className="text-slate-400 dark:text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-normal">
                    Monitor your active status under <strong className="text-cyan-300 dark:text-cyan-300 [html[data-theme=light]_&]:text-cyan-700">This Device</strong> and view all paired devices in real time under <strong className="text-cyan-300 dark:text-cyan-300 [html[data-theme=light]_&]:text-cyan-700">Connected Devices</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/60 dark:bg-black/60 [html[data-theme=light]_&]:bg-white border border-white/10 dark:border-white/10 [html[data-theme=light]_&]:border-[#E2E8F0] [html[data-theme=light]_&]:shadow-sm">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 [html[data-theme=light]_&]:text-emerald-700 [html[data-theme=light]_&]:bg-emerald-100 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                <div>
                  <p className="font-bold text-white dark:text-white [html[data-theme=light]_&]:text-[#0F172A] mb-0.5">Productivity Tools</p>
                  <p className="text-slate-400 dark:text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-normal">
                    Switch between <strong className="text-cyan-300 dark:text-cyan-300 [html[data-theme=light]_&]:text-cyan-700">Clipboard Sync</strong>, <strong className="text-cyan-300 dark:text-cyan-300 [html[data-theme=light]_&]:text-cyan-700">Links</strong>, <strong className="text-cyan-300 dark:text-cyan-300 [html[data-theme=light]_&]:text-cyan-700">Notes</strong>, and <strong className="text-cyan-300 dark:text-cyan-300 [html[data-theme=light]_&]:text-cyan-700">Screenshots</strong> tabs to instantly share data across devices over the cloud.
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

      {/* Dedicated Share Cloud Room & QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 pt-20 sm:pt-4 bg-slate-950/60 dark:bg-black/80 [html[data-theme=light]_&]:bg-[rgba(248,250,252,0.35)] backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-950 dark:bg-slate-950 [html[data-theme=light]_&]:bg-[linear-gradient(180deg,#F9FCFF_0%,#EEF7FF_100%)] border border-white/10 dark:border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] rounded-3xl p-6 sm:p-7 shadow-2xl dark:shadow-2xl [html[data-theme=light]_&]:shadow-[0_20px_60px_rgba(14,165,233,0.12)] backdrop-blur-2xl text-slate-100 dark:text-slate-100 [html[data-theme=light]_&]:text-[#0F172A] space-y-5">
            <button
              type="button"
              onClick={() => setShowQRModal(false)}
              aria-label="Close share room modal"
              className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 dark:bg-white/5 [html[data-theme=light]_&]:bg-white hover:bg-white/10 dark:hover:bg-white/10 hover:[html[data-theme=light]_&]:bg-slate-50 border border-white/10 dark:border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] text-slate-400 dark:text-slate-400 [html[data-theme=light]_&]:text-[#475569] hover:text-white dark:hover:text-white hover:[html[data-theme=light]_&]:text-[#0F172A] [html[data-theme=light]_&]:shadow-sm transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 [html[data-theme=light]_&]:text-[#0EA5E9] [html[data-theme=light]_&]:bg-cyan-50 [html[data-theme=light]_&]:border-[#D7E8FF]">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white dark:text-white [html[data-theme=light]_&]:text-[#0F172A]">Share Cloud Room</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 [html[data-theme=light]_&]:text-[#475569]">Scan QR code or copy direct room link</p>
              </div>
            </div>

            {/* Prominent Centered QR Code Container */}
            <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-slate-200/80 [html[data-theme=light]_&]:border-[#D7E8FF] shadow-sm">
              <QRCodeSVG
                value={`${window.location.origin}/?room=${store.roomId}`}
                size={160}
                className="w-40 h-40"
              />
              <span className="mt-3 text-[11px] font-semibold text-slate-600 tracking-wide">
                Room Code: <strong className="text-slate-900 font-mono font-extrabold">{store.roomId}</strong>
              </span>
            </div>

            {/* Shareable Link Box & Copy Button */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-300 [html[data-theme=light]_&]:text-[#0F172A] mb-1.5">
                Direct Room Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/?room=${encodeURIComponent(store.roomId)}`}
                  aria-label="Direct room URL"
                  className="flex-1 bg-black/60 dark:bg-black/60 [html[data-theme=light]_&]:bg-white border border-white/10 dark:border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 dark:text-cyan-300 [html[data-theme=light]_&]:text-[#0F172A] truncate focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyRoomCode}
                  aria-label="Copy direct room link"
                  className="h-9 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition shadow-md whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" strokeWidth={2.5} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
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