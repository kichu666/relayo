import React, { useEffect } from 'react';
import { X, Heart, Sparkles, Zap, ShieldCheck, Laptop, Smartphone, Tablet } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 [html[data-theme=amoled]_&]:bg-black/80 [html[data-theme=dark]_&]:bg-slate-950/80 [html[data-theme=light]_&]:bg-[rgba(248,250,252,0.35)] backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg [html[data-theme=amoled]_&]:bg-black [html[data-theme=dark]_&]:bg-slate-950 [html[data-theme=light]_&]:bg-[linear-gradient(180deg,#F9FCFF_0%,#EEF7FF_100%)] border border-slate-200 dark:border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] rounded-3xl p-6 sm:p-8 shadow-2xl dark:shadow-2xl [html[data-theme=light]_&]:shadow-[0_20px_60px_rgba(14,165,233,0.12)] backdrop-blur-2xl text-slate-100 dark:text-slate-100 [html[data-theme=light]_&]:text-[#0F172A] space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 dark:bg-white/5 [html[data-theme=light]_&]:bg-white hover:bg-white/10 dark:hover:bg-white/10 hover:[html[data-theme=light]_&]:bg-slate-50 border border-white/10 dark:border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] text-slate-400 dark:text-slate-400 [html[data-theme=light]_&]:text-[#475569] hover:text-white dark:hover:text-white hover:[html[data-theme=light]_&]:text-[#0F172A] [html[data-theme=light]_&]:shadow-sm transition-colors cursor-pointer"
          title="Close Modal (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 [html[data-theme=light]_&]:text-[#0EA5E9] [html[data-theme=light]_&]:bg-cyan-50 [html[data-theme=light]_&]:border-[#D7E8FF] shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white dark:text-white [html[data-theme=light]_&]:text-[#0F172A]">
              The Story Behind Relayo
            </h2>
            <p className="text-xs text-cyan-400 [html[data-theme=light]_&]:text-cyan-700 font-semibold tracking-wide uppercase">
              About the Creator & Vision
            </p>
          </div>
        </div>

        {/* Author Section Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 dark:from-indigo-500/15 dark:via-purple-500/15 dark:to-cyan-500/15 [html[data-theme=light]_&]:bg-white border border-indigo-500/20 dark:border-indigo-500/30 [html[data-theme=light]_&]:border-[#D7E8FF] [html[data-theme=light]_&]:shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 [html[data-theme=light]_&]:text-cyan-700 [html[data-theme=light]_&]:bg-cyan-100 shrink-0 mt-0.5">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-white dark:text-white [html[data-theme=light]_&]:text-[#0F172A]">
                Author Note
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-300 dark:text-slate-300 [html[data-theme=light]_&]:text-[#334155] leading-relaxed mt-0.5">
                Built by a frustrated user tired of everyday workflow friction.
              </p>
            </div>
          </div>
        </div>

        {/* Multi-device graphic icons bar */}
        <div className="flex items-center justify-center gap-6 py-2 px-4 rounded-xl bg-white/5 dark:bg-white/5 [html[data-theme=light]_&]:bg-slate-100/70 border border-white/5 dark:border-white/5 [html[data-theme=light]_&]:border-slate-200/60 text-slate-400 dark:text-slate-400 [html[data-theme=light]_&]:text-slate-600 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>Phone</span>
          </div>
          <span className="opacity-30">•</span>
          <div className="flex items-center gap-1.5">
            <Tablet className="w-4 h-4 text-indigo-400" />
            <span>Tablet</span>
          </div>
          <span className="opacity-30">•</span>
          <div className="flex items-center gap-1.5">
            <Laptop className="w-4 h-4 text-purple-400" />
            <span>PC</span>
          </div>
        </div>

        {/* Detailed Story Description */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 dark:text-slate-300 [html[data-theme=light]_&]:text-[#334155] leading-relaxed">
          <p>
            Relayo was born out of pure daily frustration when trying to move text, links, code snippets, or files across multiple devices, whether it's a phone, PC, tablet, or any device.
          </p>
          <p>
            Instead of installing bloated third-party applications, emailing links to yourself, navigating unwanted redirect links, or wasting precious minutes on time-consuming setups, Relayo offers a seamless, zero-install experience.
          </p>
          <p>
            Solving this constant multi-device headache turned into <strong className="text-cyan-300 dark:text-cyan-300 [html[data-theme=light]_&]:text-cyan-800 font-extrabold">Relayo</strong>, an instant browser-to-browser P2P sharing & real-time cloud workspace created for anyone who values speed, privacy, and simplicity.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <div className="p-3 rounded-xl bg-white/5 dark:bg-white/5 [html[data-theme=light]_&]:bg-white border border-white/10 dark:border-white/10 [html[data-theme=light]_&]:border-[#E2E8F0] flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-200 dark:text-slate-200 [html[data-theme=light]_&]:text-[#1E293B]">Zero Redirects & App Setup</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 dark:bg-white/5 [html[data-theme=light]_&]:bg-white border border-white/10 dark:border-white/10 [html[data-theme=light]_&]:border-[#E2E8F0] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-200 dark:text-slate-200 [html[data-theme=light]_&]:text-[#1E293B]">Zero Server File Storage</span>
          </div>
        </div>

        {/* Modal Action Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            Got It, Back to Relayo
          </button>
        </div>

      </div>
    </div>
  );
};
