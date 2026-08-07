import { FileText, ArrowLeft, Mail } from 'lucide-react';
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
          <span>User Agreement & E-E-A-T Terms</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A] tracking-tight">
          Terms & Conditions
        </h1>
        <p className="text-xs font-mono text-slate-400 [html[data-theme=light]_&]:text-slate-500">
          Last Updated: August 7, 2026 • Official Support Contact: rrajr0503@gmail.com
        </p>
      </div>

      {/* Content Body */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900/60 [html[data-theme=light]_&]:bg-white space-y-6 text-xs sm:text-sm text-slate-300 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">
            1. Acceptance of Terms & Service Overview
          </h2>
          <p>
            By accessing or using Relayo (<a href="https://relayo.space" className="text-cyan-400 underline">relayo.space</a>), you agree to comply with these Terms & Conditions. Relayo provides a browser-based WebRTC peer-to-peer (P2P) file sharing application and multi-device Cloud Hub workspace across Windows, macOS, Linux, Android, and iOS platforms.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">
            2. Permitted Use & Conduct
          </h2>
          <p>
            Relayo is designed for lawful device-to-device file transfer, clipboard synchronization, and link sharing. You agree not to use Relayo to transmit, stream, or distribute illicit, infringing, copyright-violating, or malicious software (malware, viruses, spyware).
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">
            3. Disclaimer of Warranties & Zero Server Storage Liability
          </h2>
          <p>
            Relayo is provided on an "AS IS" and "AS AVAILABLE" basis. Because Local P2P Mode transfers stream memory-to-memory directly between paired browser data channels with zero server storage, Relayo does not backup, index, or recover transferred files. File transfer speeds depend on your local area network (LAN) bandwidth, Wi-Fi quality, and WebRTC browser compatibility.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">
            4. Intellectual Property Rights & Curation
          </h2>
          <p>
            The software, branding, UI design system, WebRTC data pipeline architecture, and documentation of Relayo are engineered and curated by Damien Kaul (pseudonym). All trademarks and brand assets belong to their respective owners.
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-white/10 [html[data-theme=light]_&]:border-slate-200">
          <h2 className="text-base font-bold text-white [html[data-theme=light]_&]:text-[#0F172A] flex items-center gap-2">
            <Mail className="w-4 h-4 text-cyan-400" />
            Contact & Operational Inquiries
          </h2>
          <p>
            For questions regarding these Terms & Conditions or technical inquiries, contact our team at:
          </p>
          <a
            href="mailto:rrajr0503@gmail.com"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 [html[data-theme=light]_&]:bg-slate-100 [html[data-theme=light]_&]:hover:bg-slate-200 border border-white/10 [html[data-theme=light]_&]:border-slate-200 text-cyan-300 [html[data-theme=light]_&]:text-cyan-700 text-xs font-mono font-semibold transition-all cursor-pointer mt-1"
          >
            <Mail className="w-4 h-4" />
            <span>rrajr0503@gmail.com</span>
          </a>
        </div>
      </div>
    </div>
  );
}
