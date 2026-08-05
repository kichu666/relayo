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
  File,
  X,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Globe,
  Loader2,
  QrCode,
  ChevronDown,
  ShieldCheck,
  Zap,
  Wifi,
  Radio,
} from 'lucide-react';

const ITEMS_PER_PAGE = 20;

export function App() {
  const store = useStore($shareStore);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [copied, setCopied] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_PAGE);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Ref guard: prevents React Strict Mode double-invoke from spawning two PeerJS instances
  const hasInitializedReceiver = useRef(false);

  // Explicit Room ID extraction from URL Search Query (?id=...) and Hash (#share)
  const extractRoomIdFromUrl = (): string | null => {
    const search = window.location.search;
    if (search) {
      const urlParams = new URLSearchParams(search);
      const id = urlParams.get('id') || urlParams.get('room') || urlParams.get('share');
      if (id) return id.trim();
    }

    const hash = window.location.hash;
    if (hash) {
      if (hash.includes('id=')) {
        const match = hash.match(/id=([^&]+)/);
        if (match && match[1]) return decodeURIComponent(match[1]).trim();
      }
      if (hash.includes('room=')) {
        const match = hash.match(/room=([^&]+)/);
        if (match && match[1]) return decodeURIComponent(match[1]).trim();
      }
      if (hash.startsWith('#relayo-') || hash.startsWith('#share-')) {
        return hash.substring(1).trim();
      }
    }

    const href = window.location.href;
    if (href.includes('id=')) {
      const match = href.match(/id=([^&#]+)/);
      if (match && match[1]) return decodeURIComponent(match[1]).trim();
    }

    return null;
  };

  // Parse URL for incoming share links on mount & hash/popstate changes
  // Single useEffect handles all routing — useLayoutEffect removed to prevent Strict Mode double-init
  useEffect(() => {
    const handleUrlCheck = async () => {
      const roomId = extractRoomIdFromUrl();
      if (!roomId || store.viewMode === 'sender_host') return;

      // Ref-based guard: prevent React Strict Mode double-invoke from creating two PeerJS instances
      if (hasInitializedReceiver.current) {
        console.log(`[Relayo Router] Receiver already initialized for '${roomId}'. Skipping duplicate useEffect call.`);
        return;
      }
      hasInitializedReceiver.current = true;

      console.log(`[Relayo Router] Share link detected: id='${roomId}'. Switching to receiver mode...`);
      if (store.viewMode === 'home') {
        $shareStore.setKey('viewMode', 'receiver_download');
        $shareStore.setKey('shareId', roomId);
      }
      await loadReceiverShareInfo(roomId);
    };

    handleUrlCheck();
    window.addEventListener('hashchange', handleUrlCheck);
    window.addEventListener('popstate', handleUrlCheck);

    return () => {
      window.removeEventListener('hashchange', handleUrlCheck);
      window.removeEventListener('popstate', handleUrlCheck);
      // Cleanup: destroy PeerJS instance if component unmounts (React Strict Mode safe)
      const manager = getActiveRtcManager();
      if (manager) {
        console.log('[Relayo] Cleaning up PeerJS connection on unmount...');
        manager.destroy();
      }
    };
  }, []);

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartShareHost = async () => {
    if (selectedFiles.length === 0) return;
    try {
      await hostFilesOnSender(selectedFiles);
    } catch (err: any) {
      alert(err.message || 'Failed to start WebRTC P2P Share');
    }
  };

  const handleCopyLink = () => {
    if (!store.shareUrl) return;
    navigator.clipboard.writeText(store.shareUrl);
    setCopied(true);
    triggerToast('WebRTC P2P Direct Share link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  /**
   * Browser Direct Zero-Memory File Download from Received WebRTC Blob
   */
  const handleDownloadSingleFile = (fileIndex: number, fileName: string) => {
    const fileMeta = store.files[fileIndex];
    if (!fileMeta) return;

    let downloadBlob: Blob | undefined;

    if (store.viewMode === 'sender_host' && fileMeta.rawFile) {
      downloadBlob = fileMeta.rawFile;
    } else if (fileMeta.receivedBlob) {
      downloadBlob = fileMeta.receivedBlob;
    } else {
      const rtcManager = getActiveRtcManager();
      downloadBlob = rtcManager?.getReceivedBlob(fileIndex);
    }

    if (!downloadBlob) {
      triggerToast('File chunk data is currently streaming via WebRTC P2P...');
      return;
    }

    const objectUrl = URL.createObjectURL(downloadBlob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
  };

  const handleDownloadAll = () => {
    store.files.forEach((f, idx) => {
      setTimeout(() => {
        handleDownloadSingleFile(idx, f.name);
      }, idx * 400);
    });
  };

  const handleResetHome = () => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    window.location.hash = '';
    setSelectedFiles([]);
    setDisplayLimit(ITEMS_PER_PAGE);
    resetRtcSession();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const visibleFiles = store.files.slice(0, displayLimit);

  const getConnectionStateBadge = () => {
    switch (store.connectionState) {
      case 'error':
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold shadow-sm">
              <X className="w-3.5 h-3.5 text-rose-400" />
              <span>{store.statusMessage || 'Connection failed'}</span>
            </div>
          </div>
        );
      case 'transferring':
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold shadow-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Transferring file...</span>
            </div>
            {store.statusMessage && (
              <span className="text-[10px] text-[var(--text-muted)] font-mono">{store.statusMessage}</span>
            )}
          </div>
        );
      case 'connecting_peer':
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold shadow-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Handshaking...</span>
            </div>
            {store.statusMessage && (
              <span className="text-[10px] text-[var(--text-muted)] font-mono">{store.statusMessage}</span>
            )}
          </div>
        );
      case 'connected':
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>WebRTC P2P Connected</span>
            </div>
            {store.statusMessage && (
              <span className="text-[10px] text-[var(--text-muted)] font-mono">{store.statusMessage}</span>
            )}
          </div>
        );
      case 'completed':
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Transfer Complete</span>
            </div>
            {store.statusMessage && (
              <span className="text-[10px] text-[var(--text-muted)] font-mono">{store.statusMessage}</span>
            )}
          </div>
        );
      case 'waiting_for_peer':
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold shadow-sm">
              <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
              <span>Ready for peer connection</span>
            </div>
            {store.statusMessage && (
              <span className="text-[10px] text-[var(--text-muted)] font-mono">{store.statusMessage}</span>
            )}
          </div>
        );
      case 'connecting_signaling':
      default:
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold shadow-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Handshaking...</span>
            </div>
            {store.statusMessage && (
              <span className="text-[10px] text-[var(--text-muted)] font-mono">{store.statusMessage}</span>
            )}
          </div>
        );
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

      {/* Toast Notification */}
      {store.toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold backdrop-blur-xl shadow-2xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{store.toastMessage}</span>
        </div>
      )}

      {/* Top Navbar with Persistent Theme Switcher */}
      <header className="w-full border-b border-[var(--panel-border)] glass-panel sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleResetHome}>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-[var(--bg-main)] rounded-[15px] flex items-center justify-center">
                  <Share2 className="w-5 h-5 theme-accent-text" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-[var(--text-primary)] via-slate-400 to-cyan-500 bg-clip-text text-transparent">
                  Relayo
                </span>
                <span className="text-[10px] font-mono sm:ml-1.5 mt-0.5 sm:mt-0 px-1.5 py-0.5 rounded border theme-badge font-semibold">
                  WebRTC P2P Direct
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <div className="hidden sm:flex items-center gap-2">
              {getConnectionStateBadge()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-4xl mx-auto px-6 py-10 w-full flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold mb-4 backdrop-blur-md theme-badge shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Relayo Zero-Memory HTTPS Direct Streaming Architecture</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
            Instant Device-to-Device <br />
            <span className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
              WebRTC P2P Direct Share
            </span>
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Direct browser-to-browser peer file streaming over WebRTC. Zero server storage, zero cellular bandwidth wasted, 100% direct device transfer.
          </p>
        </div>

        {store.isLoadingInfo ? (
          <div className="w-full max-w-md glass-panel rounded-3xl p-8 text-center border border-[var(--panel-border)] flex flex-col items-center">
            <Loader2 className="w-10 h-10 theme-accent-text animate-spin mb-4" />
            <h3 className="text-base font-bold mb-1">Connecting WebRTC P2P Stream...</h3>
            <p className="text-xs text-[var(--text-muted)]">{store.statusMessage || 'Performing WebSocket signaling handshake...'}</p>
          </div>
        ) : activeViewMode === 'home' ? (
          /* Home Screen: Select Files to Host */
          <div className="w-full max-w-xl glass-panel rounded-3xl p-8 border border-[var(--panel-border)] shadow-2xl text-center">
            <div
              onClick={handleDropzoneClick}
              className="w-full p-8 rounded-2xl border-2 border-dashed border-cyan-500/40 bg-[var(--card-bg)] hover:opacity-90 transition-colors cursor-pointer mb-6 flex flex-col items-center justify-center group"
            >
              <FileUp className="w-12 h-12 theme-accent-text mb-3 group-hover:scale-110 transition-transform animate-bounce" />
              <p className="text-base font-bold">Drop files here or click to select</p>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                16KB Binary DataChannel Chunking • Zero-Server Storage
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
                        <File className="w-4 h-4 theme-accent-text shrink-0" />
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
                    <span>Create WebRTC Direct Share Link ({selectedFiles.length} files)</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        ) : store.viewMode === 'sender_host' ? (
          /* Sender View: Display WebRTC Network Share Link & QR Code */
          <div className="w-full max-w-xl glass-panel rounded-3xl p-8 border border-[var(--panel-border)] shadow-2xl text-center relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center theme-accent-text mx-auto mb-4 shadow-lg shadow-cyan-500/20">
              <Globe className="w-7 h-7 animate-pulse" />
            </div>

            <h2 className="text-2xl font-black mb-1">WebRTC P2P Share Active!</h2>
            <p className="text-xs text-[var(--text-muted)] mb-3">
              Open this link on any PC, phone, or tablet to stream files directly browser-to-browser.
            </p>

            {/* P2P Status Indicator Banner */}
            <div className="mb-6 flex justify-center">{getConnectionStateBadge()}</div>

            {/* Share Link Display Box */}
            <div className="w-full p-4 rounded-2xl bg-[var(--input-bg)] border border-cyan-500/40 mb-6 flex items-center justify-between gap-3">
              <div className="text-left min-w-0 flex-1">
                <p className="text-[10px] uppercase font-mono theme-accent-text font-bold mb-0.5">
                  WebRTC P2P Direct Share Link
                </p>
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
            {store.uploadProgressPercent > 0 && store.uploadProgressPercent <= 100 && (
              <div className="w-full mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md text-left">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>Streaming P2P DataChunks...</span>
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
                  <span>Scan with Phone Camera to Open WebRTC Share</span>
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
                      <File className="w-4 h-4 theme-accent-text shrink-0" />
                      <span className="truncate font-medium">{file.name}</span>
                      <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      onClick={() => handleDownloadSingleFile(idx, file.name)}
                      className="px-2.5 py-1 rounded-lg border theme-badge text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Save Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleResetHome}
              className="px-4 py-2 rounded-xl bg-[var(--card-bg)] hover:opacity-80 text-xs font-medium cursor-pointer border border-[var(--panel-border)]"
            >
              Stop Sharing & Return Home
            </button>
          </div>
        ) : (
          /* Receiver View: WebRTC P2P Direct Download Dashboard */
          <div className="w-full max-w-xl glass-panel rounded-3xl p-8 border border-indigo-500/30 shadow-2xl text-center relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500 mx-auto mb-4 shadow-lg shadow-indigo-500/20">
              <Download className="w-7 h-7 animate-bounce" />
            </div>

            <h2 className="text-2xl font-black mb-1">P2P File Transfer</h2>
            <p className="text-xs text-[var(--text-muted)] mb-3 flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              100% Browser-to-Browser Encrypted WebRTC DataChannel • Zero-Server Storage
            </p>

            <div className="mb-6 flex justify-center">{getConnectionStateBadge()}</div>

            {/* Transfer Progress Bar for Receiver with Percentage & Live Speed */}
            {store.uploadProgressPercent > 0 && store.uploadProgressPercent <= 100 && (
              <div className="w-full mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md text-left">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>Receiving P2P Binary Stream...</span>
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

            {/* Primary Download All Button */}
            {store.files.length > 0 && (
              <button
                onClick={handleDownloadAll}
                className="w-full mb-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-xs shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Save All Files ({store.files.length})</span>
              </button>
            )}

            {/* Shared File List */}
            <div className="w-full text-left mb-6">
              <p className="text-xs font-semibold text-[var(--text-muted)] mb-2">
                Available Shared Files ({store.files.length})
              </p>
              {store.files.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--panel-border)] text-center text-xs text-[var(--text-muted)] flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 theme-accent-text animate-spin" />
                  <p className="font-semibold text-[var(--text-primary)]">Fetching shared files from sender...</p>
                  <p className="text-[11px] font-mono text-[var(--text-muted)]">WebRTC P2P direct stream handshaking in progress</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {visibleFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--panel-border)] text-xs hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
                        <File className="w-4 h-4" />
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
              )}
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

      {/* Footer */}
      <footer className="w-full border-t border-[var(--panel-border)] py-4 glass-panel text-center text-xs text-[var(--text-muted)] font-mono">
        Relayo Zero-Memory HTTPS Direct Streaming Architecture (WebRTC P2P) • Zero Server Data Storage
      </footer>
    </div>
  );
}

export default App;
