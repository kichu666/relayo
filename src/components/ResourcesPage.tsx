import {
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  Cpu,
  Copy,
  Link,
  FileText,
  Camera,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { PageView } from './NavigationDrawer';

interface ResourcesPageProps {
  onNavigate: (page: PageView) => void;
}

export function ResourcesPage({ onNavigate }: ResourcesPageProps) {
  return (
    <div className="w-full max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-12 animate-fade-in">
      {/* Top Back Button */}
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 [html[data-theme=light]_&]:bg-slate-100 hover:bg-white/10 [html[data-theme=light]_&]:hover:bg-slate-200 text-xs font-semibold text-slate-300 [html[data-theme=light]_&]:text-slate-700 transition-all cursor-pointer border border-white/10 [html[data-theme=light]_&]:border-slate-200"
      >
        <ArrowLeft className="w-4 h-4 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600" />
        <span>Back to Home</span>
      </button>

      {/* Primary Header Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 [html[data-theme=light]_&]:bg-cyan-50 [html[data-theme=light]_&]:text-cyan-700 [html[data-theme=light]_&]:border-cyan-200 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>Serverless WebRTC Infrastructure</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white [html[data-theme=light]_&]:text-[#0F172A] leading-tight">
          Lightning-Fast P2P File Transfer & Real-Time Cloud Hub
        </h1>
        <p className="text-sm sm:text-base text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
          Transfer unlimited files directly between devices with zero server storage. Relayo is the ultimate high-speed WebRTC peer-to-peer (P2P) file sharing tool and real-time cloud clipboard designed for seamless cross-platform productivity across PC, Mac, Android, and iOS.
        </p>
      </div>

      {/* Feature Section 1: P2P File Sharing */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900/60 [html[data-theme=light]_&]:bg-white backdrop-blur-xl shadow-xl [html[data-theme=light]_&]:shadow-sm space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600 font-bold text-xs uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>End-to-End Direct Streaming</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A]">
            Direct Browser-to-Browser P2P File Sharing (Zero Server Storage)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
            Why upload sensitive documents to slow cloud servers when you can send them directly between browsers? Relayo utilizes cutting-edge WebRTC data channels (<code className="font-mono text-cyan-300 [html[data-theme=light]_&]:text-cyan-700">rtcDataChannel</code>) to create a secure, encrypted peer-to-peer connection between your devices. Whether you need to send gigabytes of 4K video clips, high-resolution photo archives, or massive dataset folders, Relayo transfers data directly across your local Wi-Fi or local area network (LAN) at full hardware speed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/40 [html[data-theme=light]_&]:bg-[#F8FCFF] border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] hover:border-cyan-500/30 transition-colors">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">Zero File Size Limits</h3>
              <p className="text-[11px] text-slate-400 [html[data-theme=light]_&]:text-[#475569] mt-0.5">Send files of any size without registration, storage caps, or artificial bandwidth throttling.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/40 [html[data-theme=light]_&]:bg-[#F8FCFF] border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] hover:border-emerald-500/30 transition-colors">
            <ShieldCheck className="w-5 h-5 text-emerald-400 [html[data-theme=light]_&]:text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">End-to-End Encryption</h3>
              <p className="text-[11px] text-slate-400 [html[data-theme=light]_&]:text-[#475569] mt-0.5">Data moves straight from sender to receiver using WebRTC DTLS/SRTP encryption. Your files never touch a centralized cloud disk.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/40 [html[data-theme=light]_&]:bg-[#F8FCFF] border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] hover:border-purple-500/30 transition-colors">
            <Cpu className="w-5 h-5 text-purple-400 [html[data-theme=light]_&]:text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">Instant Hash Verification</h3>
              <p className="text-[11px] text-slate-400 [html[data-theme=light]_&]:text-[#475569] mt-0.5">Every 64KB file chunk is validated using SHA-256 cryptographic checksums to guarantee 100% data integrity without corruption.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/40 [html[data-theme=light]_&]:bg-[#F8FCFF] border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] hover:border-indigo-500/30 transition-colors">
            <Globe className="w-5 h-5 text-indigo-400 [html[data-theme=light]_&]:text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">No App Installation Required</h3>
              <p className="text-[11px] text-slate-400 [html[data-theme=light]_&]:text-[#475569] mt-0.5">Pair devices instantly by scanning a QR code or sharing a simple room link—works on Chrome, Safari, Edge, and Firefox.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section 2: Relayo Cloud Hub */}
      <div className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A]">
            Relayo Cloud Hub: Seamless Multi-Device Productivity
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 [html[data-theme=light]_&]:text-[#475569]">
            Switching between your desktop workstation and mobile phone should be frictionless. Relayo Cloud Hub unifies your workflow with real-time multi-device synchronization built for remote teams, developers, and power users.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900/40 [html[data-theme=light]_&]:bg-white space-y-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 [html[data-theme=light]_&]:bg-cyan-50 [html[data-theme=light]_&]:text-cyan-600 w-fit">
              <Copy className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">Real-Time Clipboard Sync</h3>
            <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
              Copy text, code snippets, or API keys on your PC and instantly access them on your phone with real-time clipboard sync.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900/40 [html[data-theme=light]_&]:bg-white space-y-2.5">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 [html[data-theme=light]_&]:bg-purple-50 [html[data-theme=light]_&]:text-purple-600 w-fit">
              <Link className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">Instant Link Pusher</h3>
            <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
              Push URLs instantly from your laptop to your mobile browser or secondary monitor with a single click—no emailing required.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900/40 [html[data-theme=light]_&]:bg-white space-y-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 [html[data-theme=light]_&]:bg-emerald-50 [html[data-theme=light]_&]:text-emerald-600 w-fit">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">Live Notes Scratchpad</h3>
            <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
              Brainstorm ideas, write task lists, or draft documentation on a real-time collaborative scratchpad that broadcasts live.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900/40 [html[data-theme=light]_&]:bg-white space-y-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 [html[data-theme=light]_&]:bg-amber-50 [html[data-theme=light]_&]:text-amber-600 w-fit">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">HD Screenshot Stream</h3>
            <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
              Capture your display screen or upload high-resolution images to stream instant screen captures across paired room devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
