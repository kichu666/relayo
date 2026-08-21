import { ShieldCheck, Lock, ArrowLeft, Mail } from 'lucide-react';
import { PageView } from './NavigationDrawer';

interface PrivacyPolicyPageProps {
  onNavigate: (page: PageView) => void;
}

export function PrivacyPolicyPage({ onNavigate }: PrivacyPolicyPageProps) {
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
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 [html[data-theme=light]_&]:bg-emerald-50 [html[data-theme=light]_&]:text-emerald-700 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Zero Server Storage & E-E-A-T AdSense Compliant</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A] tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs font-mono text-slate-400 [html[data-theme=light]_&]:text-slate-500">
          Last Updated: August 21, 2026 • Official Support Contact: team@relayo.space
        </p>
      </div>

      {/* Content Body */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900/60 [html[data-theme=light]_&]:bg-white space-y-6 text-xs sm:text-sm text-slate-300 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white [html[data-theme=light]_&]:text-[#0F172A] flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            1. Dual Architecture: WebRTC vs. Local Hotspot Transfer
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
            <li>
              <strong className="text-white [html[data-theme=light]_&]:text-slate-900">Web Platform (Relayo.space):</strong> Relayo’s web interface operates on a 100% serverless, browser-to-browser WebRTC peer-to-peer infrastructure. Your file payloads stream memory-to-memory via encrypted WebRTC data channels. Files are never uploaded, saved, or indexed on cloud server disks.
            </li>
            <li>
              <strong className="text-white [html[data-theme=light]_&]:text-slate-900">Android Application:</strong> The Relayo Android app utilizes local Wi-Fi Hotspot and Wi-Fi Direct technology to facilitate direct, device-to-device file transfers. When using this mode, the sender’s device acts as a local host, and the receiver connects directly to this host via Wi-Fi. Files are transferred exclusively between the sender and receiver devices over this local connection. Data is never uploaded to, stored, or routed through any external servers or third-party cloud services.
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">
            2. End-to-End DTLS/SRTP Encryption & SHA-256 Verification
          </h2>
          <p>
            All direct WebRTC connections utilize mandatory Datagram Transport Layer Security (DTLS) and Secure Real-time Transport Protocol (SRTP) encryption standards. Data transfers between paired browsers are protected from unauthorized interception, while SHA-256 cryptographic checksums verify 100% chunk integrity without file corruption.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">
            3. Google AdSense & Third-Party Advertising Cookies Clause
          </h2>
          <p>
            Relayo may display advertisements served by third-party vendor networks, including Google AdSense. 
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li>Third-party vendors, including Google, use cookies (such as the DoubleClick DART cookie) to serve ads based on a user's prior visits to <code className="font-mono text-cyan-300">relayo.space</code> or other internet websites.</li>
            <li>Google's use of advertising cookies enables it and its partners to serve personalized or non-personalized advertisements to users based on their browsing history.</li>
            <li>
              Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">Google Ad Settings</a> or by visiting <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">aboutads.info</a>.
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">
            4. User Privacy Rights (GDPR & CCPA Compliance)
          </h2>
          <p>
            Relayo requires no user registration, account creation, or password management. Under GDPR and CCPA guidelines, you retain the right to inquire about data practices, request information, or submit privacy requests.
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-white/10 [html[data-theme=light]_&]:border-slate-200">
          <h2 className="text-base font-bold text-white [html[data-theme=light]_&]:text-[#0F172A] flex items-center gap-2">
            <Mail className="w-4 h-4 text-cyan-400" />
            Official Support & Data Privacy Contact
          </h2>
          <p>
            If you have any questions or inquiries regarding this Privacy Policy or data handling, please contact our team directly at:
          </p>
          <a
            href="mailto:team@relayo.space"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 [html[data-theme=light]_&]:bg-slate-100 [html[data-theme=light]_&]:hover:bg-slate-200 border border-white/10 [html[data-theme=light]_&]:border-slate-200 text-cyan-300 [html[data-theme=light]_&]:text-cyan-700 text-xs font-mono font-semibold transition-all cursor-pointer mt-1"
          >
            <Mail className="w-4 h-4" />
            <span>team@relayo.space</span>
          </a>
        </div>
      </div>
    </div>
  );
}
