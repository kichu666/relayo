import { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { QRCodeSVG } from 'qrcode.react';
import {
  $shareStore,
  hostFilesOnSender,
  loadReceiverShareInfo,
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
} from 'lucide-react';

const ITEMS_PER_PAGE = 20;

export function App() {
  const store = useStore($shareStore);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [copied, setCopied] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_PAGE);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse URL hash for incoming share links on mount (#share?id=...)
  useEffect(() => {
    const handleHashCheck = async () => {
      const hash = window.location.hash;
      if (hash.includes('#share?id=')) {
        const urlParams = new URLSearchParams(hash.replace('#share?', ''));
        const shareId = urlParams.get('id');
        if (shareId) {
          await loadReceiverShareInfo(shareId);
        }
      }
    };

    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
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
      alert(err.message || 'Failed to start Web Share');
    }
  };

  const handleCopyLink = () => {
    if (!store.shareUrl) return;
    navigator.clipboard.writeText(store.shareUrl);
    setCopied(true);
    triggerToast('Local Web Share link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  /**
   * On-Demand Object URL Download with Instant Revocation
   */
  const handleDownloadSingleFile = (fileIndex: number, fileName: string) => {
    if (!store.shareId) return;

    const fileMeta = store.files[fileIndex];
    if (store.viewMode === 'sender_host' && fileMeta?.rawFile) {
      const objectUrl = URL.createObjectURL(fileMeta.rawFile);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      return;
    }

    const downloadUrl = `/api/share/download?id=${encodeURIComponent(
      store.shareId
    )}&index=${fileIndex}`;
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleDownloadAll = () => {
    store.files.forEach((f, idx) => {
      setTimeout(() => {
        handleDownloadSingleFile(idx, f.name);
      }, idx * 400);
    });
  };

  const handleResetHome = () => {
    window.location.hash = '';
    setSelectedFiles([]);
    setDisplayLimit(ITEMS_PER_PAGE);
    $shareStore.set({
      viewMode: 'home',
      shareId: null,
      shareUrl: null,
      files: [],
      isUploading: false,
      uploadProgressPercent: 0,
      currentUploadingFileName: '',
      isLoadingInfo: false,
      toastMessage: null,
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const visibleFiles = store.files.slice(0, displayLimit);

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
          <div className="flex items-center gap-4">
            {store.viewMode !== 'home' && (
              <button
                onClick={handleResetHome}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card-bg)] hover:opacity-80 transition-all text-xs font-medium border border-[var(--panel-border)] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 theme-accent-text" />
                <span>Home</span>
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-500 p-[1px] shadow-lg shadow-cyan-500/25">
                <div className="w-full h-full bg-[var(--bg-main)] rounded-[15px] flex items-center justify-center">
                  <Share2 className="w-5 h-5 theme-accent-text" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-[var(--text-primary)] via-slate-400 to-cyan-500 bg-clip-text text-transparent">
                  Relayo
                </span>
                <span className="text-[10px] font-mono sm:ml-1.5 mt-0.5 sm:mt-0 px-1.5 py-0.5 rounded border theme-badge font-semibold">
                  Local HTTP Direct Share
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                Hotspot Subnet Direct
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-4xl mx-auto px-6 py-10 w-full flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold mb-4 backdrop-blur-md theme-badge shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Relayo Zero-Memory HTTP Direct Streaming Architecture</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
            Instant Cross-Device <br />
            <span className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
              Local Web File Sharing
            </span>
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Host files on your phone or laptop over your local Wi-Fi / hotspot subnet. Receivers open the link in any browser
            for high-speed HTTP streaming downloads—100% zero cellular data used.
          </p>
        </div>

        {store.isLoadingInfo ? (
          <div className="w-full max-w-md glass-panel rounded-3xl p-8 text-center border border-[var(--panel-border)] flex flex-col items-center">
            <Loader2 className="w-10 h-10 theme-accent-text animate-spin mb-4" />
            <h3 className="text-base font-bold mb-1">Loading Shared Files...</h3>
            <p className="text-xs text-[var(--text-muted)]">Fetching local network share info</p>
          </div>
        ) : store.viewMode === 'home' ? (
          /* Home Screen: Select Files to Host */
          <div className="w-full max-w-xl glass-panel rounded-3xl p-8 border border-[var(--panel-border)] shadow-2xl text-center">
            <div
              onClick={handleDropzoneClick}
              className="w-full p-8 rounded-2xl border-2 border-dashed border-cyan-500/40 bg-[var(--card-bg)] hover:opacity-90 transition-colors cursor-pointer mb-6 flex flex-col items-center justify-center group"
            >
              <FileUp className="w-12 h-12 theme-accent-text mb-3 group-hover:scale-110 transition-transform animate-bounce" />
              <p className="text-base font-bold">Drop files here or click to select</p>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                Supports large files & multi-file batches • Zero-RAM Slicing
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
                  {store.isUploading ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Slicing & Hosting Chunks ({store.uploadProgressPercent}%)</span>
                      </div>
                      {store.currentUploadingFileName && (
                        <span className="text-[10px] font-mono font-normal opacity-80 truncate max-w-xs">
                          {store.currentUploadingFileName}
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>Host Web Share Link ({selectedFiles.length} files)</span>
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : store.viewMode === 'sender_host' ? (
          /* Sender View: Display Local Network Share Link & QR Code */
          <div className="w-full max-w-xl glass-panel rounded-3xl p-8 border border-[var(--panel-border)] shadow-2xl text-center relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center theme-accent-text mx-auto mb-4 shadow-lg shadow-cyan-500/20">
              <Globe className="w-7 h-7 animate-pulse" />
            </div>

            <h2 className="text-2xl font-black mb-1">Local Direct Share Active!</h2>
            <p className="text-xs text-[var(--text-muted)] mb-6">
              Open this link on any PC, laptop, or phone connected to the same Wi-Fi subnet to download files.
            </p>

            {/* Local Network Link Display Box */}
            <div className="w-full p-4 rounded-2xl bg-[var(--input-bg)] border border-cyan-500/40 mb-6 flex items-center justify-between gap-3">
              <div className="text-left min-w-0 flex-1">
                <p className="text-[10px] uppercase font-mono theme-accent-text font-bold mb-0.5">
                  Local Network Share Link
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

            {/* QR Code for Instant Phone Camera Scanning */}
            {store.shareUrl && (
              <div className="mb-6 flex flex-col items-center">
                <div className="p-4 bg-white rounded-2xl shadow-xl inline-block mb-2 border border-slate-200">
                  <QRCodeSVG value={store.shareUrl} size={160} level="M" />
                </div>
                <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 font-medium">
                  <QrCode className="w-3.5 h-3.5 theme-accent-text" />
                  <span>Scan with Phone Camera to Open Share Link</span>
                </p>
              </div>
            )}

            {/* Hosted File List Preview with Pagination */}
            <div className="w-full text-left mb-6">
              <p className="text-xs font-semibold text-[var(--text-muted)] mb-2">
                Currently Hosted Files ({store.files.length})
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
                      Download
                    </button>
                  </div>
                ))}
              </div>

              {store.files.length > displayLimit && (
                <button
                  onClick={() => setDisplayLimit((prev) => prev + ITEMS_PER_PAGE)}
                  className="w-full mt-2 py-1 text-center text-xs theme-accent-text hover:underline cursor-pointer flex items-center justify-center gap-1 font-semibold"
                >
                  <span>Show More Files ({store.files.length - displayLimit} remaining)</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={handleResetHome}
              className="px-4 py-2 rounded-xl bg-[var(--card-bg)] hover:opacity-80 text-xs font-medium cursor-pointer border border-[var(--panel-border)]"
            >
              Stop Sharing & Return Home
            </button>
          </div>
        ) : (
          /* Receiver View: Direct Browser HTTP Download Dashboard */
          <div className="w-full max-w-xl glass-panel rounded-3xl p-8 border border-indigo-500/30 shadow-2xl text-center relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500 mx-auto mb-4 shadow-lg shadow-indigo-500/20">
              <Download className="w-7 h-7 animate-bounce" />
            </div>

            <h2 className="text-2xl font-black mb-1">Shared Files Ready</h2>
            <p className="text-xs text-[var(--text-muted)] mb-6 flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Direct HTTP 206 Partial Content Stream • Zero-RAM Memory Overhead
            </p>

            {/* Primary Download All Button */}
            <button
              onClick={handleDownloadAll}
              className="w-full mb-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-xs shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download All Files ({store.files.length})</span>
            </button>

            {/* Shared File List with DOM Pagination */}
            <div className="w-full text-left mb-6">
              <p className="text-xs font-semibold text-[var(--text-muted)] mb-2">
                Available Shared Files ({store.files.length})
              </p>
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
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>

              {store.files.length > displayLimit && (
                <button
                  onClick={() => setDisplayLimit((prev) => prev + ITEMS_PER_PAGE)}
                  className="w-full mt-2 py-1 text-center text-xs theme-accent-text hover:underline cursor-pointer flex items-center justify-center gap-1 font-semibold"
                >
                  <span>Show More Files ({store.files.length - displayLimit} remaining)</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
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
        Relayo Local HTTP Direct Streaming Architecture • 100% Zero Cellular Data
      </footer>
    </div>
  );
}

export default App;
