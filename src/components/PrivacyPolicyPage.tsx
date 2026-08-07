import { ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import { PageView } from './NavigationDrawer';

interface PrivacyPolicyPageProps {
  onNavigate: (page: PageView) => void;
}

export function PrivacyPolicyPage({ onNavigate }: PrivacyPolicyPageProps) {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 [html[data-theme=light]_&]:bg-emerald-50 [html[data-theme=light]_&]:text-emerald-700 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Zero Server Data Collection</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A] tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs font-mono text-slate-400 [html[data-theme=light]_&]:text-slate-500">
          Last Updated: August 7, 2026
        </p>
      </div>

      {/* Content Body */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900/60 [html[data-theme=light]_&]:bg-white space-y-6 text-xs sm:text-sm text-slate-300 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white [html[data-theme=light]_&]:text-[#0F172A] flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            1. Zero-Server Storage Architecture
          </h2>
          <p>
            Relayo operates on a 100% serverless, browser-to-browser peer-to-peer (P2P) WebRTC infrastructure. When you transfer files or sync clipboard items using Relayo, your binary file data streams directly between browser memory buffers. We do not store, copy, record, inspect, or retain any of your files, text, images, or shared URLs on centralized cloud servers.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">
            2. End-to-End DTLS/SRTP Encryption
          </h2>
          <p>
            All data channels instantiated via WebRTC rely on mandatory Datagram Transport Layer Security (DTLS) and Secure Real-time Transport Protocol (SRTP) encryption. Communication channels between paired devices are end-to-end encrypted by default, preventing third parties or network intermediaries from inspecting data packets in transit.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">
            3. Personal Information & Tracking
          </h2>
          <p>
            Relayo requires no user registration, email address, phone number, password, or account creation. We do not sell, rent, trade, or share user data with third-party data brokers or marketing advertisers.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">
            4. Temporary Signaling Session Data
          </h2>
          <p>
            To facilitate the initial WebRTC handshaking process (NAT traversal & SDP exchange), minimal temporary signaling parameters are used to pair room codes. This metadata is ephemeral, held strictly in transient memory, and purged immediately upon connection establishment or room termination.
          </p>
        </div>
      </div>
    </div>
  );
}
