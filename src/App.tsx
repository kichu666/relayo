import { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { QRCodeSVG } from 'qrcode.react';
import {
  $shareStore,
  hostFilesOnSender,
  loadReceiverShareInfo,
  resetRtcSession,
  getActiveRtcManager,
  extractRoomIdFromUrl,
  triggerToast,
} from './logic/shareStore';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import {
  Share2,
  Download,
  Copy,
  Check,
  FileUp,
  File as FileIcon,
  X,
  Sparkles,
  Globe,
  Loader2,
  QrCode,
  ChevronDown,
  ShieldCheck,
  Zap,
  Wifi,
  HelpCircle,
  Laptop,
  Smartphone,
  CloudOff,
  ArrowLeftRight,
  Package,
  Cloud,
  Radio
} from 'lucide-react';
import { CloudHub } from './components/cloud/CloudHub';
import { initCloudSession } from './logic/cloudStore';

const ITEMS_PER_PAGE = 20;

export function App() {
  const store = useStore($shareStore);
  const [selectedFiles, setSelectedFiles] = useState<FileIcon[]>([]);
  const [copied, setCopied] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_PAGE);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [appMode, setAppMode] = useState<'p2p' | 'cloud'>('p2p');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room') || urlParams.get('cloudRoom');
    if (roomParam) {
      setAppMode('cloud');
      initCloudSession(roomParam.trim());
    }

    const urlRoomId = extractRoomIdFromUrl();
    if (urlRoomId && !hasInitializedReceiver.current) {
      hasInitializedReceiver.current = true;
      loadReceiverShareInfo(urlRoomId);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartShareHost = async () => {
    if (selectedFiles.length === 0) return;
    try {
      await hostFilesOnSender(selectedFiles);
    } catch (err: any) {
      console.error('[Relayo] Failed to start host session:', err);
    }
  };

  const handleCopyLink = () => {
    if (store.shareUrl) {
      navigator.clipboard.writeText(store.shareUrl);
      setCopied(true);
      triggerToast('Share link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleResetHome = () => {
    hasInitializedReceiver.current = false;
    setSelectedFiles([]);
    resetRtcSession();
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleDownloadSingleFile = (fileIndex: number, fileName: string) => {
    const targetFile = store.files.find((f) => f.index === fileIndex);
    if (targetFile?.receivedBlob) {
      const url = URL.createObjectURL(targetFile.receivedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const rtc = getActiveRtcManager();
      if (rtc) {
        rtc.requestFileDownload(fileIndex);
        triggerToast(`Requested download for file: ${fileName}`);
      }
    }
  };

  const handleDownloadAllZip = () => {
    const rtc = getActiveRtcManager();
    if (rtc) {
      store.files.forEach((file) => {
        if (!file.receivedBlob) {
          rtc.requestFileDownload(file.index);
        } else {
          handleDownloadSingleFile(file.index, file.name);
        }
      });
      triggerToast('Requesting all file downloads...');
    }
  };

  const visibleFiles = store.files.slice(0, displayLimit);

  const getConnectionStateBadge = () => {
    switch (store.connectionState) {
      case 'error':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] sm:text-[11px] font-bold shadow-sm shrink-0">
            <X className="w-3 h-3 text-rose-400" />
            <span>Offline</span>
          </div>
        );
      case 'transferring':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] sm:text-[11px] font-bold shadow-sm shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span>Transferring...</span>
          </div>
        );
      case 'connecting_peer':
      case 'connecting_signaling':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] sm:text-[11px] font-bold shadow-sm shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span>Connecting via P2P</span>
          </div>
        );
      case 'connected':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] sm:text-[11px] font-bold shadow-sm shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span>P2P Connected</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] sm:text-[11px] font-bold shadow-sm shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>Complete</span>
          </div>
        );
      case 'waiting_for_peer':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] sm:text-[11px] font-bold shadow-sm shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>Ready</span>
          </div>
        );
      default:
        return null;
    }
  };

  const isReceiverUrl = extractRoomIdFromUrl() !== null;
  const activeViewMode = store.viewMode === 'home' && isReceiverUrl ? 'receiver_download' : store.viewMode;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden transition-colors duration-300">
      {/* Background Ambient Orbs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none animate-orb-slow" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none animate-orb-slow" />

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        className="hidden"
      />

      {/* Toast Notification - Bottom Right Corner */}
      {store.toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[var(--card-bg)] border border-[var(--panel-border)] text-[var(--text-primary)] text-xs font-semibold backdrop-blur-xl shadow-2xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span>{store.toastMessage}</span>
        </div>
      )}

      {/* Top Navbar with Persistent Theme Switcher */}
      <header className="w-full border-b border-[var(--panel-border)] glass-panel sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={handleResetHome}>
            <Share2 className="w-6 h-6 theme-accent-text shrink-0" />
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-[var(--text-primary)] via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                Relayo
              </span>
              <span className="hidden xs:inline-block text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded border theme-badge font-semibold">
                P2P
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-full bg-black border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
            <button
              onClick={() => setAppMode('p2p')}
              className={`flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full font-bold text-xs tracking-wide transition-all duration-300 cursor-pointer ${
                appMode === 'p2p'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/5'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Wi-Fi P2P</span>
            </button>
            <button
              onClick={() => setAppMode('cloud')}
              className={`flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full font-bold text-xs tracking-wide transition-all duration-300 cursor-pointer ${
                appMode === 'cloud'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/5'
              }`}
            >
              <Cloud className="w-4 h-4" />
              <span>Cloud Hub</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {getConnectionStateBadge()}
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      {appMode === 'cloud' ? (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 relative z-10">
          <CloudHub />
        </main>
      ) : (
        <main className="max-w-4xl mx-auto px-6 py-10 w-full flex-1 flex flex-col items-center justify-center relative z-10">
        {/* Original Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold mb-4 backdrop-blur-md theme-badge shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Relayo Direct Transfer Engine</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
            Instant Device-to-Device Sharing
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto">
            Direct browser-to-browser transfer. No uploads. No server storage.
          </p>
        </div>

        {store.isLoadingInfo ? (
          <div className="w-full max-w-md glass-panel rounded-3xl p-8 text-center border border-[var(--panel-border)] flex flex-col items-center">
            <Loader2 className="w-10 h-10 theme-accent-text animate-spin mb-4" />
            <h3 className="text-base font-bold mb-1">Connecting P2P Stream...</h3>
            <p className="text-xs text-[var(--text-muted)]">{store.statusMessage || 'Connecting to peer...'}</p>
          </div>
        ) : activeViewMode === 'home' ? (
          /* Home Screen: Select Files to Host */
          <>
            <div className="w-full max-w-xl glass-panel rounded-3xl p-8 border border-[var(--panel-border)] shadow-2xl text-center">
              <div
                onClick={handleDropzoneClick}
                className="w-full p-8 rounded-2xl border-2 border-dashed border-cyan-500/40 bg-[var(--card-bg)] hover:opacity-90 transition-colors cursor-pointer mb-6 flex flex-col items-center justify-center group"
              >
                <FileUp className="w-12 h-12 theme-accent-text mb-3 group-hover:scale-110 transition-transform animate-bounce" />
                <p className="text-base font-bold">Drop files here or click to select</p>
                <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                  Direct Browser-to-Browser Transfer • Zero-Server Storage
                </p>
              </div>

              {selectedFiles.length > 0 && (
                <div className="w-full mb-6 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">
                      Selected Files ({selectedFiles.length})
                    </span>
                    <button
                      onClick={() => setSelectedFiles([])}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>

                  {/* Paginated File Queue View */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedFiles.slice(0, displayLimit).map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--panel-border)] text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <FileIcon className="w-4 h-4 theme-accent-text shrink-0" />
                          <span className="truncate font-medium">{file.name}</span>
                          <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(idx);
                          }}
                          className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {selectedFiles.length > displayLimit && (
                    <button
                      onClick={() => setDisplayLimit((prev) => prev + ITEMS_PER_PAGE)}
                      className="w-full mt-2 py-1 text-center text-xs theme-accent-text hover:underline cursor-pointer flex items-center justify-center gap-1 font-semibold"
                    >
                      <span>Show More Files ({selectedFiles.length - displayLimit} remaining)</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={handleStartShareHost}
                    disabled={store.isUploading}
                    className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 fill-white" />
                      <span>Share Files ({selectedFiles.length})</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Why Relayo? Unified AMOLED Glassmorphism Card */}
            <div className="w-full max-w-xl mt-8 p-6 sm:p-7 rounded-3xl bg-black/90 border border-zinc-800/90 shadow-2xl backdrop-blur-2xl text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              <h3 className="text-lg font-bold tracking-wide text-zinc-100 mb-6">
                Why Relayo?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0 shadow-lg shadow-cyan-500/10">
                    <CloudOff className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-100">No cloud uploads</p>
                    <p className="text-[10px] text-zinc-400 font-medium">100% Zero server data storage</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shrink-0 shadow-lg shadow-indigo-500/10">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-100">Direct P2P transfer</p>
                    <p className="text-[10px] text-zinc-400 font-medium">Browser-to-browser streaming</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-100">Scan QR & download</p>
                    <p className="text-[10px] text-zinc-400 font-medium">Instant pairing for mobile</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-violet-400 shrink-0 shadow-lg shadow-violet-500/10">
                    <div className="flex items-center gap-0.5">
                      <Laptop className="w-3.5 h-3.5" />
                      <Smartphone className="w-3 h-3" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-100">Phone & desktop</p>
                    <p className="text-[10px] text-zinc-400 font-medium">Cross-platform compatibility</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-100">Large file support</p>
                    <p className="text-[10px] text-zinc-400 font-medium">Zero file size limitations</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 shrink-0 shadow-lg shadow-blue-500/10">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-100">Same local network</p>
                    <p className="text-[10px] text-zinc-400 font-medium">Ultra-fast Wi-Fi speed</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : store.viewMode === 'sender_host' ? (
          /* Sender View: Display WebRTC Network Share Link & QR Code */
          <div className="w-full max-w-xl glass-panel rounded-3xl p-8 border border-[var(--panel-border)] shadow-2xl text-center relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center theme-accent-text mx-auto mb-4 shadow-lg shadow-cyan-500/20">
              <Globe className="w-7 h-7 animate-pulse" />
            </div>

            <h3 className="text-lg font-bold mb-1">Share Link Ready</h3>
            <p className="text-xs text-[var(--text-muted)] mb-5">
              Open this link on any device to download files.
            </p>

            {/* Share Link Display Box */}
            <div className="w-full p-4 rounded-2xl bg-[var(--input-bg)] border border-cyan-500/40 mb-6 flex items-center justify-between gap-3">
              <div className="text-left min-w-0 flex-1">
                <p className="text-xs font-mono font-bold truncate">{store.shareUrl}</p>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Transfer Progress Bar with Percentage & Live Speed */}
            {(store.isUploading || store.connectionState === 'transferring' || (store.uploadProgressPercent > 0 && store.uploadProgressPercent <= 100)) && (
              <div className="w-full mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md text-left">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>Transferring files...</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    {store.transferSpeed && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                        ⚡ {store.transferSpeed}
                      </span>
                    )}
                    <span className="text-cyan-400 font-bold text-sm">{store.uploadProgressPercent}%</span>
                  </div>
                </div>

                <div className="w-full h-3 bg-slate-900/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500 rounded-full transition-all duration-150 shadow-lg shadow-cyan-500/50"
                    style={{ width: `${store.uploadProgressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] mt-2">
                  {store.currentUploadingFileName ? (
                    <span className="truncate max-w-[200px] sm:max-w-[280px]">
                      File: <span className="text-[var(--text-primary)] font-medium">{store.currentUploadingFileName}</span>
                    </span>
                  ) : (
                    <span />
                  )}
                  {store.totalBytesExpected > 0 && (
                    <span className="shrink-0 font-semibold">
                      {formatFileSize(store.bytesTransferred)} / {formatFileSize(store.totalBytesExpected)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* QR Code for Instant Phone Camera Scanning */}
            {store.shareUrl && (
              <div className="mb-6 flex flex-col items-center">
                <div className="p-4 bg-white rounded-2xl shadow-xl inline-block mb-2 border border-slate-200">
                  <QRCodeSVG value={store.shareUrl} size={160} level="M" />
                </div>
                <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 font-medium">
                  <QrCode className="w-3.5 h-3.5 theme-accent-text" />
                  <span>Scan to open on mobile</span>
                </p>
              </div>
            )}

            {/* Hosted File List Preview */}
            <div className="w-full text-left mb-6">
              <p className="text-xs font-semibold text-[var(--text-muted)] mb-2">
                Hosted Files ({store.files.length})
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {visibleFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--panel-border)] text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileIcon className="w-4 h-4 theme-accent-text shrink-0" />
                      <span className="truncate font-medium">{file.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleResetHome}
              className="px-4 py-2 rounded-xl bg-[var(--card-bg)] hover:opacity-80 text-xs font-medium cursor-pointer border border-[var(--panel-border)]"
            >
              Done & Return Home
            </button>
          </div>
        ) : (
          /* Receiver View: WebRTC P2P Direct Download Dashboard */
          <div className="w-full max-w-xl glass-panel rounded-3xl p-8 border border-indigo-500/30 shadow-2xl text-center relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500 mx-auto mb-4 shadow-lg shadow-indigo-500/20">
              <Download className="w-7 h-7 animate-bounce" />
            </div>

            <h3 className="text-lg font-bold mb-1">Shared Files</h3>
            <p className="text-xs text-[var(--text-muted)] mb-5 flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Direct browser-to-browser transfer
            </p>

            {/* Transfer Progress Bar for Receiver with Percentage & Live Speed */}
            {(store.isUploading || store.connectionState === 'transferring' || (store.uploadProgressPercent > 0 && store.uploadProgressPercent <= 100)) && (
              <div className="w-full mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md text-left">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>Receiving files...</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    {store.transferSpeed && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                        ⚡ {store.transferSpeed}
                      </span>
                    )}
                    <span className="text-cyan-400 font-bold text-sm">{store.uploadProgressPercent}%</span>
                  </div>
                </div>

                <div className="w-full h-3 bg-slate-900/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500 rounded-full transition-all duration-150 shadow-lg shadow-cyan-500/50"
                    style={{ width: `${store.uploadProgressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] mt-2">
                  {store.currentUploadingFileName ? (
                    <span className="truncate max-w-[200px] sm:max-w-[280px]">
                      Receiving: <span className="text-[var(--text-primary)] font-medium">{store.currentUploadingFileName}</span>
                    </span>
                  ) : (
                    <span />
                  )}
                  {store.totalBytesExpected > 0 && (
                    <span className="shrink-0 font-semibold">
                      {formatFileSize(store.bytesTransferred)} / {formatFileSize(store.totalBytesExpected)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Receiver File List & Download Buttons */}
            <div className="w-full text-left mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  Available Files ({store.files.length})
                </span>
                {store.files.length > 1 && (
                  <button
                    onClick={handleDownloadAllZip}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download All</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {visibleFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--panel-border)] text-xs gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                        <FileIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{file.name}</p>
                        <p className="text-[10px] font-mono text-[var(--text-muted)]">
                          {formatFileSize(file.size)} • {file.mimeType}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadSingleFile(idx, file.name)}
                      className="px-3 py-1.5 rounded-xl border theme-badge text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{file.receivedBlob ? 'Save File' : 'Download'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleResetHome}
              className="px-4 py-2 rounded-xl bg-[var(--card-bg)] hover:opacity-80 text-xs font-medium cursor-pointer border border-[var(--panel-border)]"
            >
              Done & Return Home
            </button>
          </div>
        )}
        </main>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-[var(--panel-border)] py-4 glass-panel flex flex-col sm:flex-row items-center justify-between px-6 gap-3 text-xs text-[var(--text-muted)] font-mono">
        <span>Relayo P2P Direct Share • Zero Server Storage</span>
        <button
          onClick={() => setShowHelpModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--card-bg)] hover:bg-[var(--panel-border)] border border-[var(--panel-border)] text-xs font-sans font-semibold text-[var(--text-primary)] shadow-sm transition-all cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Help & Tutorial</span>
        </button>
      </footer>

      {/* AMOLED Glassmorphism Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-black/95 border border-zinc-800/90 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl text-zinc-100">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">How P2P Share Works</h3>
                <p className="text-[11px] text-zinc-400">Direct Browser-to-Browser Transfer</p>
              </div>
            </div>

            <div className="space-y-3.5 my-6 text-xs">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                <div>
                  <p className="font-bold text-white mb-0.5">Share Link or QR Code</p>
                  <p className="text-zinc-400 leading-normal">Drop any file to instantly generate a secure share link or scan the QR code on your mobile device.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                <div>
                  <p className="font-bold text-white mb-0.5">Keep Browser Tabs Open</p>
                  <p className="text-zinc-400 leading-normal">Both sender and receiver tabs must remain open to maintain the direct WebRTC peer tunnel.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                <div>
                  <p className="font-bold text-white mb-0.5">Direct P2P Data Streaming</p>
                  <p className="text-zinc-400 leading-normal">Files transfer directly between browsers with live speed indicators and zero server storage.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-lg cursor-pointer"
            >
              Got It, Start Sharing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default App;
