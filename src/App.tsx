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
import {
  Download,
  Copy,
  Check,
  FileUp,
  File as FileIcon,
  X,
  Globe,
  Loader2,
  QrCode,
  ChevronDown,
  Zap,
  Wifi,
  Laptop,
  Smartphone,
  CloudOff,
  ArrowLeftRight,
  Package,
  Menu,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { CloudHub } from './components/cloud/CloudHub';
import { FeedbackModal } from './components/FeedbackModal';
import { AboutModal } from './components/AboutModal';
import { initCloudSession } from './logic/cloudStore';
import { AmoledWifiSwitchSection } from './components/AmoledWifiSwitchSection';
import { NavigationDrawer, PageView } from './components/NavigationDrawer';
import { ResourcesPage } from './components/ResourcesPage';
import { FaqPage } from './components/FaqPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsPage } from './components/TermsPage';
import { ContactPage } from './components/ContactPage';
import { WhyRelayoSection } from './components/WhyRelayoSection';
import { RelayoLogo } from './components/RelayoLogo';

const ITEMS_PER_PAGE = 20;

export function App() {
  const store = useStore($shareStore);
  const [selectedFiles, setSelectedFiles] = useState<FileIcon[]>([]);
  const [copied, setCopied] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_PAGE);
  const [isP2PTutorialOpen, setIsP2PTutorialOpen] = useState(false);
  const [isCloudTutorialOpen, setIsCloudTutorialOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasInitializedReceiver = useRef(false);
  const [appMode, setAppMode] = useState<'p2p' | 'cloud'>('p2p');
  const [pageView, setPageView] = useState<PageView>('home');
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);

  useEffect(() => {
    const handleRouteSync = () => {
      const hash = window.location.hash.replace('#', '').trim().toLowerCase();
      const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '').trim().toLowerCase();
      const routeToken = hash || pathname;

      if (routeToken === 'resources' || routeToken === 'learn') {
        setPageView('resources');
      } else if (routeToken === 'faq' || routeToken === 'faqs') {
        setPageView('faq');
      } else if (routeToken === 'contact' || routeToken === 'support') {
        setPageView('contact');
      } else if (routeToken === 'privacy' || routeToken === 'privacy-policy') {
        setPageView('privacy');
      } else if (
        routeToken === 'terms' ||
        routeToken === 'terms-and-conditions' ||
        routeToken === 'terms-of-service'
      ) {
        setPageView('terms');
      } else if (routeToken === 'about') {
        setPageView('home');
        setIsAboutOpen(true);
      } else if (!routeToken) {
        setPageView('home');
      }
    };

    handleRouteSync();
    window.addEventListener('hashchange', handleRouteSync);
    window.addEventListener('popstate', handleRouteSync);
    return () => {
      window.removeEventListener('hashchange', handleRouteSync);
      window.removeEventListener('popstate', handleRouteSync);
    };
  }, []);

  const handleNavigate = (page: PageView) => {
    setPageView(page);
    if (page === 'home') {
      if (window.location.hash) {
        window.history.pushState(null, '', window.location.pathname);
      }
    } else {
      window.location.hash = page;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    handleNavigate('home');
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
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)] text-[10px] sm:text-[11px] font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
            <span>Transferring...</span>
          </div>
        );
      case 'connecting_peer':
      case 'connecting_signaling':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)] text-[10px] sm:text-[11px] font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
            <span>Connecting via P2P</span>
          </div>
        );
      case 'connected':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 text-[10px] sm:text-[11px] font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>P2P Connected</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 text-[10px] sm:text-[11px] font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Complete</span>
          </div>
        );
      case 'waiting_for_peer':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/40 text-[10px] sm:text-[11px] font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
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
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-x-clip transition-colors duration-300">
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
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>{store.toastMessage}</span>
        </div>
      )}

      {/* Sticky Apple Frosted Glass Header */}
      <header className={`sticky top-0 z-[1000] w-full apple-header shadow-sm ${isNavDrawerOpen ? 'opacity-0 pointer-events-none' : ''}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">

          {/* Left side — Inline HTML/CSS + SVG RelayoLogo */}
          <RelayoLogo onClick={handleResetHome} />
          {/* Right side — connection badge + Hamburger Menu button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 z-20">
            {getConnectionStateBadge()}
            <button
              onClick={() => setIsNavDrawerOpen(true)}
              aria-label="Open Navigation Menu"
              className="p-2 sm:p-2.5 rounded-xl bg-white/5 [html[data-theme=light]_&]:bg-slate-100 hover:bg-white/10 [html[data-theme=light]_&]:hover:bg-slate-200 text-slate-200 [html[data-theme=light]_&]:text-slate-800 border border-white/10 [html[data-theme=light]_&]:border-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Drawer Component */}
      <NavigationDrawer
        isOpen={isNavDrawerOpen}
        onClose={() => setIsNavDrawerOpen(false)}
        currentPage={pageView}
        onNavigate={handleNavigate}
      />

      {/* Main Content Body */}
      {pageView === 'resources' ? (
        <main className="w-full flex-1 relative z-10 min-h-[75vh]">
          <ResourcesPage onNavigate={handleNavigate} />
        </main>
      ) : pageView === 'faq' ? (
        <main className="w-full flex-1 relative z-10 min-h-[75vh]">
          <FaqPage onNavigate={handleNavigate} />
        </main>
      ) : pageView === 'contact' ? (
        <main className="w-full flex-1 relative z-10 min-h-[75vh]">
          <ContactPage onNavigate={handleNavigate} />
        </main>
      ) : pageView === 'privacy' ? (
        <main className="w-full flex-1 relative z-10 min-h-[75vh]">
          <PrivacyPolicyPage onNavigate={handleNavigate} />
        </main>
      ) : pageView === 'terms' ? (
        <main className="w-full flex-1 relative z-10 min-h-[75vh]">
          <TermsPage onNavigate={handleNavigate} />
        </main>
      ) : appMode === 'cloud' ? (
        <main className="max-w-6xl mx-auto px-2.5 sm:px-6 pt-5 pb-3 sm:pt-8 sm:pb-8 w-full flex-1 relative z-10 min-h-[82vh]">
          <CloudHub
            isOpenCloudHelp={isCloudTutorialOpen}
            onCloseCloudHelp={() => setIsCloudTutorialOpen(false)}
            onOpenCloudHelp={() => setIsCloudTutorialOpen(true)}
            onBackToLocal={() => setAppMode('p2p')}
          />
          <WhyRelayoSection />
        </main>
      ) : (
        <main className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-10 w-full flex-1 flex flex-col items-center justify-center relative z-10 min-h-[82vh]">
          {/* Ambient Depth Glows (Light Mode) */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-400/5 rounded-full blur-[100px] pointer-events-none hidden [html[data-theme=light]_&]:block" />
          <div className="absolute top-40 right-10 w-[400px] h-[300px] bg-purple-400/5 rounded-full blur-[100px] pointer-events-none hidden [html[data-theme=light]_&]:block" />

          {/* Original Hero Section */}
          <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-snug sm:leading-tight mb-2.5 sm:mb-4">
              Instant Device-to-Device Sharing
            </h1>
            <p className="text-xs sm:text-base text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto mb-5 sm:mb-6">
              Direct browser-to-browser transfer. No uploads. No server storage.
            </p>

            {/* Transfer Mode Toggle Switch — Centered below heading and above dropzone */}
            <div className="mt-4 sm:mt-6">
              <AmoledWifiSwitchSection appMode={appMode} setAppMode={setAppMode} />
            </div>
          </div>

          {store.isLoadingInfo ? (
            <div className="w-full max-w-md glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-center border border-[var(--panel-border)] flex flex-col items-center">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 theme-accent-text animate-spin mb-3 sm:mb-4" />
              <h3 className="text-sm sm:text-base font-bold mb-1">Connecting P2P Stream...</h3>
              <p className="text-xs text-[var(--text-muted)]">{store.statusMessage || 'Connecting to peer...'}</p>
            </div>
          ) : activeViewMode === 'home' ? (
            /* Home Screen: Select Files to Host */
            <>
              <div className="w-full max-w-xl glass-panel rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 border border-[var(--panel-border)] shadow-2xl [html[data-theme=light]_&]:shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Drop files here or click to select files for sharing"
                  onClick={handleDropzoneClick}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleDropzoneClick();
                    }
                  }}
                  className="w-full p-4 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-dashed border-cyan-500/40 bg-[var(--card-bg)] hover:opacity-90 transition-colors cursor-pointer mb-4 sm:mb-6 flex flex-col items-center justify-center group focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <FileUp className="w-10 h-10 sm:w-12 sm:h-12 theme-accent-text mb-3 group-hover:scale-110 transition-transform animate-bounce" />
                  <p className="text-sm sm:text-base font-bold">Drop files here or click to select</p>
                  <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-1 font-mono">
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
                        type="button"
                        onClick={() => setSelectedFiles([])}
                        aria-label="Clear all selected files"
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
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(idx);
                            }}
                            aria-label={`Remove file ${file.name}`}
                            className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {selectedFiles.length > displayLimit && (
                      <button
                        type="button"
                        onClick={() => setDisplayLimit((prev) => prev + ITEMS_PER_PAGE)}
                        aria-label="Show remaining files"
                        className="w-full mt-2 py-1 text-center text-xs theme-accent-text hover:underline cursor-pointer flex items-center justify-center gap-1 font-semibold"
                      >
                        <span>Show More Files ({selectedFiles.length - displayLimit} remaining)</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleStartShareHost}
                      disabled={store.isUploading}
                      aria-label={`Share ${selectedFiles.length} selected files`}
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

              {/* Why Relayo? Unified Card */}
              <div className="w-full max-w-xl mt-8 p-6 sm:p-7 rounded-3xl [html[data-theme=amoled]_&]:bg-black/90 [html[data-theme=dark]_&]:bg-slate-900/90 [html[data-theme=light]_&]:bg-white border border-zinc-800/90 [html[data-theme=light]_&]:border-gray-200 shadow-2xl [html[data-theme=light]_&]:shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

                <h3 className="text-lg font-bold tracking-wide text-zinc-100 [html[data-theme=light]_&]:text-slate-900 mb-6">
                  Why Relayo?
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0 shadow-lg shadow-cyan-500/10">
                      <CloudOff className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-100 [html[data-theme=light]_&]:text-slate-900">No cloud uploads</p>
                      <p className="text-[10px] text-zinc-400 [html[data-theme=light]_&]:text-slate-500 font-medium">100% Zero server data storage</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shrink-0 shadow-lg shadow-indigo-500/10">
                      <ArrowLeftRight className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-100 [html[data-theme=light]_&]:text-slate-900">Direct P2P transfer</p>
                      <p className="text-[10px] text-zinc-400 [html[data-theme=light]_&]:text-slate-500 font-medium">Browser-to-browser streaming</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-100 [html[data-theme=light]_&]:text-slate-900">Scan QR & download</p>
                      <p className="text-[10px] text-zinc-400 [html[data-theme=light]_&]:text-slate-500 font-medium">Instant pairing for mobile</p>
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
                      <p className="text-xs font-bold text-zinc-100 [html[data-theme=light]_&]:text-slate-900">Phone & desktop</p>
                      <p className="text-[10px] text-zinc-400 [html[data-theme=light]_&]:text-slate-500 font-medium">Cross-platform compatibility</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-100 [html[data-theme=light]_&]:text-slate-900">Large file support</p>
                      <p className="text-[10px] text-zinc-400 [html[data-theme=light]_&]:text-slate-500 font-medium">Zero file size limitations</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 shrink-0 shadow-lg shadow-blue-500/10">
                      <Wifi className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-100 [html[data-theme=light]_&]:text-slate-900">Same local network</p>
                      <p className="text-[10px] text-zinc-400 [html[data-theme=light]_&]:text-slate-500 font-medium">Ultra-fast Wi-Fi speed</p>
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
                  type="button"
                  onClick={handleCopyLink}
                  aria-label="Copy WebRTC share link to clipboard"
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
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
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
                type="button"
                onClick={handleResetHome}
                aria-label="Done and return to home page"
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
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
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
                      type="button"
                      onClick={handleDownloadAllZip}
                      aria-label="Download all shared files"
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
                        type="button"
                        onClick={() => handleDownloadSingleFile(idx, file.name)}
                        aria-label={`Download file ${file.name}`}
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
                type="button"
                onClick={handleResetHome}
                aria-label="Done and return to home page"
                className="px-4 py-2 rounded-xl bg-[var(--card-bg)] hover:opacity-80 text-xs font-medium cursor-pointer border border-[var(--panel-border)]"
              >
                Done & Return Home
              </button>
            </div>
          )}
          <WhyRelayoSection />
        </main>
      )}

      {/* Footer */}
      <footer className="relative w-full overflow-hidden border-t border-[var(--panel-border)] bg-[var(--bg-dark)]/90 backdrop-blur-md pt-12 pb-6 px-4 sm:px-8 text-xs text-[var(--text-muted)] font-sans z-30 min-h-[160px] sm:min-h-[200px] flex flex-col justify-between">
        {/* Background Watermark Layer - Absolute position behind content (z-0, pointer-events-none) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
          <span className="text-[14vw] sm:text-[16vw] leading-none font-black tracking-wider text-slate-500/5 [html[data-theme=light]_&]:text-slate-400/10 uppercase font-sans whitespace-nowrap -translate-y-4">
            RELAYO
          </span>
        </div>

        {/* Spacer for vertical balance */}
        <div className="flex-1 min-h-[40px] sm:min-h-[60px] pointer-events-none" />

        {/* Foreground Content Layer - Higher z-index (z-10) sitting cleanly on top */}
        <div className="w-full max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--text-muted)]">

          {/* Left: Copyright */}
          <div className="flex items-center gap-2 whitespace-nowrap relative z-10">
            <span>© 2026 Relayo.space</span>
          </div>

          {/* Right: Small clickable inline text links */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[var(--text-muted)] relative z-10">
            <a
              href="mailto:team@relayo.space"
              aria-label="Send email to team@relayo.space"
              className="hover:text-cyan-400 [html[data-theme=light]_&]:hover:text-cyan-600 transition-colors"
            >
              Contact
            </a>
            <button
              type="button"
              onClick={() => {
                if (appMode === 'cloud') {
                  setIsCloudTutorialOpen(true);
                } else {
                  setIsP2PTutorialOpen(true);
                }
              }}
              aria-label="Open usage tutorial"
              className="hover:text-cyan-400 [html[data-theme=light]_&]:hover:text-cyan-600 transition-colors cursor-pointer"
            >
              Tutorial
            </button>
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              aria-label="Open feedback form modal"
              className="hover:text-cyan-400 [html[data-theme=light]_&]:hover:text-cyan-600 transition-colors cursor-pointer"
            >
              Feedback
            </button>
            <button
              type="button"
              onClick={() => setIsAboutOpen(true)}
              aria-label="Open About Us modal"
              className="hover:text-cyan-400 [html[data-theme=light]_&]:hover:text-cyan-600 transition-colors cursor-pointer"
            >
              About Us
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('privacy')}
              aria-label="Navigate to Privacy Policy page"
              className="hover:text-cyan-400 [html[data-theme=light]_&]:hover:text-cyan-600 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('terms')}
              aria-label="Navigate to Terms and Conditions page"
              className="hover:text-cyan-400 [html[data-theme=light]_&]:hover:text-cyan-600 transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
          </div>

        </div>
      </footer>

      {/* About Us Author Story Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {/* Formspree User Feedback Modal */}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

      {/* Glassmorphism P2P Help Modal */}
      {appMode === 'p2p' && isP2PTutorialOpen && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 pt-20 sm:pt-4 [html[data-theme=amoled]_&]:bg-black/80 [html[data-theme=dark]_&]:bg-slate-950/80 [html[data-theme=light]_&]:bg-[rgba(248,250,252,0.35)] backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md [html[data-theme=amoled]_&]:bg-black/95 [html[data-theme=dark]_&]:bg-slate-900/95 [html[data-theme=light]_&]:bg-[linear-gradient(180deg,#F9FCFF_0%,#EEF7FF_100%)] border border-zinc-800/90 [html[data-theme=light]_&]:border-[#D7E8FF] rounded-3xl p-6 shadow-2xl [html[data-theme=light]_&]:shadow-[0_20px_60px_rgba(14,165,233,0.12)] backdrop-blur-2xl text-zinc-100 [html[data-theme=light]_&]:text-[#0F172A]">
            <button
              type="button"
              onClick={() => setIsP2PTutorialOpen(false)}
              aria-label="Close tutorial modal"
              className="absolute top-5 right-5 p-1.5 rounded-full bg-zinc-900 dark:bg-zinc-900 [html[data-theme=light]_&]:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-800 hover:[html[data-theme=light]_&]:bg-slate-50 border border-zinc-800 dark:border-zinc-800 [html[data-theme=light]_&]:border-[#D7E8FF] text-zinc-400 dark:text-zinc-400 [html[data-theme=light]_&]:text-[#475569] hover:text-white dark:hover:text-white hover:[html[data-theme=light]_&]:text-[#0F172A] [html[data-theme=light]_&]:shadow-sm transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 [html[data-theme=light]_&]:text-[#0EA5E9] [html[data-theme=light]_&]:bg-cyan-50 [html[data-theme=light]_&]:border-[#D7E8FF]">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white dark:text-white [html[data-theme=light]_&]:text-[#0F172A]">How P2P Share Works</h3>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-400 [html[data-theme=light]_&]:text-[#475569]">Direct Browser-to-Browser Transfer</p>
              </div>
            </div>

            <div className="space-y-3.5 my-6 text-xs">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-900/90 dark:bg-zinc-900/90 [html[data-theme=light]_&]:bg-white border border-zinc-800/80 dark:border-zinc-800/80 [html[data-theme=light]_&]:border-[#E2E8F0] [html[data-theme=light]_&]:shadow-sm">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 [html[data-theme=light]_&]:text-cyan-700 [html[data-theme=light]_&]:bg-cyan-100 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                <div>
                  <p className="font-bold text-white dark:text-white [html[data-theme=light]_&]:text-[#0F172A] mb-0.5">Share Link or QR Code</p>
                  <p className="text-zinc-400 dark:text-zinc-400 [html[data-theme=light]_&]:text-[#475569] leading-normal">Drop any file to instantly generate a secure share link or scan the QR code on your mobile device.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-900/90 dark:bg-zinc-900/90 [html[data-theme=light]_&]:bg-white border border-zinc-800/80 dark:border-zinc-800/80 [html[data-theme=light]_&]:border-[#E2E8F0] [html[data-theme=light]_&]:shadow-sm">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 [html[data-theme=light]_&]:text-indigo-700 [html[data-theme=light]_&]:bg-indigo-100 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                <div>
                  <p className="font-bold text-white dark:text-white [html[data-theme=light]_&]:text-[#0F172A] mb-0.5">Keep Browser Tabs Open</p>
                  <p className="text-zinc-400 dark:text-zinc-400 [html[data-theme=light]_&]:text-[#475569] leading-normal">Both sender and receiver tabs must remain open to maintain the direct WebRTC peer tunnel.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-900/90 dark:bg-zinc-900/90 [html[data-theme=light]_&]:bg-white border border-zinc-800/80 dark:border-zinc-800/80 [html[data-theme=light]_&]:border-[#E2E8F0] [html[data-theme=light]_&]:shadow-sm">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 [html[data-theme=light]_&]:text-emerald-700 [html[data-theme=light]_&]:bg-emerald-100 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                <div>
                  <p className="font-bold text-white dark:text-white [html[data-theme=light]_&]:text-[#0F172A] mb-0.5">Direct P2P Data Streaming</p>
                  <p className="text-zinc-400 dark:text-zinc-400 [html[data-theme=light]_&]:text-[#475569] leading-normal">Files transfer directly between browsers with live speed indicators and zero server storage.</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsP2PTutorialOpen(false)}
              aria-label="Got it, start sharing"
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
