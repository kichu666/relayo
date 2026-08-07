import { FileText, ArrowLeft } from 'lucide-react';
import { PageView } from './NavigationDrawer';

interface TermsPageProps {
  onNavigate: (page: PageView) => void;
}

export function TermsPage({ onNavigate }: TermsPageProps) {
  return (
    <div className="w-full max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8 animate-fade-in">
      {/* Top Back Button */}
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 [html[data-theme=light]_&]:bg-slate-100 hover:bg-white/10 [html[data-theme=light]_&]:hover:bg-slate-200 text-xs font-semibold text-slate-300 [html[data-theme=light]_&]:text-slate-700 transition-all cursor-pointer border border-white/10 [html[data-theme=light]_&]:border-slate-200"
      >
        <ArrowLeft className="w-4 h-4 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600" />
        <span>Back to Home</span>
      </button>

      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 [html[data-theme=light]_&]:bg-indigo-50 [html[data-theme=light]_&]:text-indigo-700 text-xs font-semibold">
          <FileText className="w-3.5 h-3.5" />
          <span>User Agreement</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A] tracking-tight">
          Terms & Conditions
        </h1>
        <p className="text-xs font-mono text-slate-400 [html[data-theme=light]_&]:text-slate-500">
          Last Updated: August 7, 2026
        </p>
      </div>

      {/* Content Body */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900/60 [html[data-theme=light]_&]:bg-white space-y-6 text-xs sm:text-sm text-slate-300 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using Relayo (relayo.world), you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our web application.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">
            2. Permitted Use & Conduct
          </h2>
          <p>
            Relayo is designed for lawful peer-to-peer file transfer and multi-device productivity. You agree not to use Relayo to transfer illicit, infringing, harmful, or malicious files, malware, or content that violates copyright or privacy laws.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">
            3. Disclaimer of Warranties
          </h2>
          <p>
            Relayo is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. Because transfers depend on local network conditions, hardware capabilities, and browser compatibility, we do not guarantee uninterrupted or error-free data transmission.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">
            4. Limitation of Liability
          </h2>
          <p>
            In no event shall Relayo or its developers be liable for any indirect, incidental, special, or consequential damages resulting from data transfer interruptions, network outages, or loss of information during P2P sessions.
          </p>
        </div>
      </div>
    </div>
  );
}
