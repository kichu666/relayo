import { useState, useRef } from 'react';
import { useStore } from '@nanostores/react';
import {
  $cloudStore,
  captureAndSendScreenshot,
  uploadScreenshotFile,
  deleteScreenshotItem,
  ScreenshotItem
} from '../../logic/cloudStore';
import {
  Camera,
  Upload,
  Download,
  Trash2,
  Maximize2,
  X,
  Laptop,
  Smartphone,
  Clock,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

export function CloudScreenshot() {
  const store = useStore($cloudStore);
  const [selectedItem, setSelectedItem] = useState<ScreenshotItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async () => {
    await captureAndSendScreenshot();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadScreenshotFile(e.target.files[0]);
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
      {/* Upload / Capture Control Card */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900/60 [html[data-theme=light]_&]:bg-white backdrop-blur-xl shadow-lg [html[data-theme=light]_&]:shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 [html[data-theme=light]_&]:bg-amber-50 border border-amber-500/30 [html[data-theme=light]_&]:border-amber-200 text-amber-400 [html[data-theme=light]_&]:text-amber-600">
              <Camera className="w-5 h-5" strokeWidth={2} />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A]">Stream & Upload Screenshots</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <button
            onClick={handleCapture}
            className="flex items-center justify-center gap-2 py-2.5 px-4 sm:py-3.5 sm:px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs sm:text-sm transition shadow-md active:scale-95 cursor-pointer min-h-[44px]"
          >
            <Camera className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
            <span>Capture Display Screen</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-2.5 px-4 sm:py-3.5 sm:px-5 rounded-xl bg-white/5 [html[data-theme=light]_&]:bg-white hover:bg-white/10 hover:[html[data-theme=light]_&]:bg-slate-50 border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] text-slate-200 [html[data-theme=light]_&]:text-[#0F172A] font-bold text-xs sm:text-sm transition shadow-sm active:scale-95 cursor-pointer min-h-[44px]"
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 [html[data-theme=light]_&]:text-amber-600" strokeWidth={2} />
            <span>Upload Image File</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {/* Streamed Screenshots Stream */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-xs font-semibold text-slate-400 [html[data-theme=light]_&]:text-[#475569] uppercase tracking-wider">
            Cloud Screenshot Stream ({store.screenshots.length})
          </h4>
          <span className="text-xs text-slate-500 [html[data-theme=light]_&]:text-slate-400">Instant cross-device viewing</span>
        </div>

        {store.screenshots.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-white/5 [html[data-theme=light]_&]:border-[#D7E8FF] bg-black/30 [html[data-theme=light]_&]:bg-white [html[data-theme=light]_&]:shadow-sm">
            <ImageIcon className="w-8 h-8 text-slate-600 [html[data-theme=light]_&]:text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400 [html[data-theme=light]_&]:text-[#0F172A]">No screenshots shared yet.</p>
            <p className="text-xs text-slate-500 [html[data-theme=light]_&]:text-[#475569] mt-1">Capture your screen or upload an image to stream it to all paired devices!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {store.screenshots.map((item) => {
              const isSender = item.senderId === store.deviceId;

              return (
                <div
                  key={item.id}
                  className="glass-panel rounded-2xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900/40 [html[data-theme=light]_&]:bg-white [html[data-theme=light]_&]:shadow-sm overflow-hidden hover:border-amber-500/40 transition group flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-black/80 overflow-hidden cursor-pointer" onClick={() => setSelectedItem(item)}>
                    <img
                      src={item.imageUrl}
                      alt={item.title || 'Screenshot'}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <span className="p-2 rounded-full bg-black/60 text-white backdrop-blur-md">
                        <Maximize2 className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded bg-white/5 [html[data-theme=light]_&]:bg-amber-50 text-amber-400 [html[data-theme=light]_&]:text-amber-600 text-xs">
                          {isSender ? <Laptop className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                        </span>
                        <span className="text-xs font-semibold text-slate-200 [html[data-theme=light]_&]:text-[#0F172A]">
                          {item.senderName}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 [html[data-theme=light]_&]:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatTime(item.timestamp)}
                      </span>
                    </div>

                    {item.title && (
                      <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-[#475569] truncate mb-2">{item.title}</p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 [html[data-theme=light]_&]:border-slate-100">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="text-xs text-amber-400 [html[data-theme=light]_&]:text-amber-600 hover:text-amber-300 font-semibold"
                      >
                        View HD 4K
                      </button>

                      <div className="flex items-center gap-1">
                        <a
                          href={item.imageUrl}
                          download={`Screenshot_${item.timestamp}.webp`}
                          className="p-1 text-slate-400 hover:text-white transition"
                          title="Download Image"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => deleteScreenshotItem(item.id)}
                          className="p-1 text-slate-500 hover:text-red-400 transition"
                          title="Delete Screenshot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4K Lightbox Viewer Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fade-in">
          <div className="relative max-w-5xl w-full bg-slate-900/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedItem.title || 'Screenshot Preview'}</h3>
                  <p className="text-xs text-slate-400">Captured by {selectedItem.senderName} • {formatTime(selectedItem.timestamp)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedItem.imageUrl}
                  download={`Screenshot_${selectedItem.timestamp}.webp`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download 4K</span>
                </a>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-black">
              <img
                src={selectedItem.imageUrl}
                alt="Full Preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
