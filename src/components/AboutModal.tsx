import React, { useEffect } from 'react';
import { X, Sparkles, Zap, ShieldCheck, Mail, Lock } from 'lucide-react';

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
      <div className="relative w-full max-w-lg [html[data-theme=amoled]_&]:bg-black [html[data-theme=dark]_&]:bg-slate-950 [html[data-theme=light]_&]:bg-[linear-gradient(180deg,#F9FCFF_0%,#EEF7FF_100%)] border border-slate-200 dark:border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-slate-100 dark:text-slate-100 [html[data-theme=light]_&]:text-[#0F172A] space-y-6 max-h-[90vh] overflow-y-auto">
        
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
              About Relayo
            </h2>
            <p className="text-xs text-cyan-400 [html[data-theme=light]_&]:text-cyan-700 font-semibold tracking-wide uppercase">
              WebRTC P2P Transfer & Real-Time Sync
            </p>
          </div>
        </div>

        {/* High-Trust Body Copy (E-E-A-T Compliant) */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 dark:text-slate-300 [html[data-theme=light]_&]:text-[#334155] leading-relaxed">
          <p>
            Welcome to Relayo, the seamless standard for instant device-to-device file sharing. Built on the principles of speed, privacy, and frictionless connectivity, our platform leverages advanced WebRTC technology to ensure your data moves directly between browsers—with zero server storage and zero cloud uploads.
          </p>
          <p>
            Our mission is to empower remote teams, developers, and power users with a secure, real-time synchronization hub that just works. Relayo was engineered and is curated by Damien Kaul (pseudonym) to solve the complexities of multi-device workflows, delivering a seamless ecosystem experience across any platform. We prioritize your privacy and data integrity above all else, ensuring every transfer is authenticated and entirely decentralized.
          </p>
        </div>

        {/* Profile / Transparency Disclosure Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 dark:from-indigo-500/15 dark:via-purple-500/15 dark:to-cyan-500/15 [html[data-theme=light]_&]:bg-white border border-indigo-500/20 dark:border-indigo-500/30 [html[data-theme=light]_&]:border-[#D7E8FF] [html[data-theme=light]_&]:shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 [html[data-theme=light]_&]:text-cyan-700 [html[data-theme=light]_&]:bg-cyan-100 shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-white dark:text-white [html[data-theme=light]_&]:text-[#0F172A]">
                Operational Transparency
              </p>
              <p className="text-xs italic text-slate-300 dark:text-slate-300 [html[data-theme=light]_&]:text-[#334155] leading-relaxed mt-0.5">
                "Operated by Damien Kaul (pseudonym) to maintain personal privacy while delivering uncompromising software quality and complete operational transparency."
              </p>
            </div>
          </div>
        </div>

        {/* Contact Email Interactive Glass Pill Element */}
        <div className="flex flex-col items-center sm:items-start gap-2 pt-1">
          <span className="text-[11px] font-mono text-slate-400 [html[data-theme=light]_&]:text-slate-500 font-semibold uppercase tracking-wider">
            Official Contact Channel
          </span>
          <a
            href="mailto:rrajr0503@gmail.com"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10 [html[data-theme=light]_&]:bg-white [html[data-theme=light]_&]:hover:bg-slate-100 border border-white/10 dark:border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] text-slate-200 dark:text-slate-200 [html[data-theme=light]_&]:text-[#0F172A] text-xs font-mono transition-all shadow-sm group cursor-pointer"
          >
            <Mail className="w-4 h-4 text-cyan-400 [html[data-theme=light]_&]:text-[#0EA5E9] group-hover:scale-110 transition-transform" />
            <span className="font-semibold">rrajr0503@gmail.com</span>
          </a>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-white/5 dark:bg-white/5 [html[data-theme=light]_&]:bg-white border border-white/10 dark:border-white/10 [html[data-theme=light]_&]:border-[#E2E8F0] flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-200 dark:text-slate-200 [html[data-theme=light]_&]:text-[#1E293B]">Zero Server Storage</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 dark:bg-white/5 [html[data-theme=light]_&]:bg-white border border-white/10 dark:border-white/10 [html[data-theme=light]_&]:border-[#E2E8F0] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-200 dark:text-slate-200 [html[data-theme=light]_&]:text-[#1E293B]">Decentralized WebRTC</span>
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
