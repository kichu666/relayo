import { Mail, MessageSquareHeart, ShieldCheck, ArrowLeft, Send } from 'lucide-react';
import { PageView } from './NavigationDrawer';

interface ContactPageProps {
  onNavigate: (page: PageView) => void;
}

export function ContactPage({ onNavigate }: ContactPageProps) {
  return (
    <div className="w-full max-w-4xl mx-auto pt-20 pb-8 sm:py-12 px-4 sm:px-6 space-y-8 animate-fade-in">
      {/* Top Back Button */}
      <button
        type="button"
        onClick={() => onNavigate('home')}
        aria-label="Back to Home"
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 [html[data-theme=light]_&]:bg-slate-100 hover:bg-white/10 [html[data-theme=light]_&]:hover:bg-slate-200 text-xs font-semibold text-slate-300 [html[data-theme=light]_&]:text-slate-700 transition-all cursor-pointer border border-white/10 [html[data-theme=light]_&]:border-slate-200"
      >
        <ArrowLeft className="w-4 h-4 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600" />
        <span>Back to Home</span>
      </button>

      {/* Header */}
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 [html[data-theme=light]_&]:bg-cyan-50 [html[data-theme=light]_&]:text-cyan-700 text-xs font-semibold">
          <Mail className="w-3.5 h-3.5" />
          <span>Official Technical & Support Contact</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A] tracking-tight">
          Contact Relayo Support
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 [html[data-theme=light]_&]:text-[#475569]">
          Have questions about WebRTC peer-to-peer file transfer, Cloud Hub synchronization, or operational privacy? We are here to assist.
        </p>
      </div>

      {/* Contact Card Body */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900/60 [html[data-theme=light]_&]:bg-white space-y-6 text-xs sm:text-sm text-slate-300 [html[data-theme=light]_&]:text-[#475569] leading-relaxed max-w-2xl mx-auto">
        
        {/* Email Pill Highlight */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-cyan-500/30 [html[data-theme=light]_&]:bg-cyan-50/50 [html[data-theme=light]_&]:border-cyan-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">Direct Email Channel</h2>
            <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-slate-600 mt-0.5">
              For bug reports, technical inquiries, partnership opportunities, or privacy requests.
            </p>
          </div>
          <a
            href="mailto:team@relayo.space"
            aria-label="Send email to team@relayo.space"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white font-mono font-bold text-xs sm:text-sm transition-all shadow-lg hover:scale-105 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>team@relayo.space</span>
          </a>
        </div>

        {/* E-E-A-T Transparency & Operational Info */}
        <div className="space-y-3 pt-2 border-t border-white/10 [html[data-theme=light]_&]:border-slate-200">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">Operational Transparency & Independence</h3>
              <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-slate-600 italic mt-0.5">
                "Independently engineered to ensure user privacy, complete operational transparency, and uncompromising software performance without third-party data tracking."
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MessageSquareHeart className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">User Feedback & Suggestions</h3>
              <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-slate-600 mt-0.5">
                We review user feedback continuously to optimize WebRTC connection reliability and cross-platform AirDrop performance across all modern browsers.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
