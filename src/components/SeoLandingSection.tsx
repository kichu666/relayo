import { useState, useEffect, useRef, ReactNode } from 'react';
import {
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  ChevronDown,
  ChevronUp,
  Cpu,
  Share2,
  Copy,
  Link,
  FileText,
  Camera,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

function RevealOnScroll({ children, className = '', delay = 0 }: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
        isVisible
          ? 'opacity-100 translate-y-0 filter-none'
          : 'opacity-0 translate-y-10 filter blur-[1px]'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function SeoLandingSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How can I send large files online for free without limits?",
      answer: "To send large files online for free without size limits, use a browser-based peer-to-peer (P2P) WebRTC tool like Relayo. It transfers binary data directly between devices over your local Wi-Fi network, bypassing cloud server upload limits, file caps, and slow registration queues."
    },
    {
      question: "What is the safest way to send large files over the internet?",
      answer: "The safest way to send large files is using zero-server P2P WebRTC transfers with mandatory DTLS/SRTP end-to-end encryption. Because data streams directly from memory-to-memory between paired browsers, your sensitive files are never uploaded, stored, or indexed on third-party cloud server storage."
    },
    {
      question: "What is the best AirDrop alternative for Windows and Android?",
      answer: "Relayo is the best free, browser-based AirDrop alternative for Windows, Android, Mac, and Linux. Requiring no software installation or app store downloads, Relayo connects nearby or remote devices instantly via WebRTC QR code scanning for high-speed file transfers and clipboard synchronization."
    },
    {
      question: "Can I AirDrop files from PC to iPhone without installing an app?",
      answer: "Yes, you can transfer files between a Windows PC and iPhone without installing software by using Relayo in any web browser. Simply open relayo.world on both devices, scan the generated QR code, and send unlimited photos, videos, and documents directly across browsers."
    },
    {
      question: "What is P2P file sharing and is it secure?",
      answer: "P2P (peer-to-peer) file sharing connects two devices directly to transfer data without relying on a central host server. WebRTC P2P file sharing is highly secure because transfers use encrypted data channels with DTLS/SRTP encryption and SHA-256 cryptographic checksums for automated data verification."
    },
    {
      question: "Does WebRTC file sharing store files on a central server?",
      answer: "No, WebRTC file sharing does not store files on a central server. Data chunks are streamed directly between browser memory buffers via encrypted peer-to-peer data channels. Once the transfer completes or the browser tab closes, no copy remains on any server."
    },
    {
      question: "How do I sync my clipboard across devices without Phone Link or Apple ID?",
      answer: "You can sync your clipboard across Windows, Mac, Android, and iOS without Phone Link or Apple Universal Clipboard using Relayo Cloud Hub. Simply open relayo.world in your browser, join a private room code, and copy-paste text or links live across all connected screens."
    },
    {
      question: "How can I push links instantly from my phone to my laptop?",
      answer: "To push links instantly from mobile to desktop without emailing yourself, use Relayo’s Link Pusher tool. Enter your shared Cloud Room code on both browsers to automatically broadcast URLs across devices and open web pages with a single click in real time."
    }
  ];

  return (
    <section id="seo-content" className="w-full max-w-6xl mx-auto mt-20 pt-16 pb-32 sm:pb-40 border-t border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] space-y-20 px-4 sm:px-6">
      {/* Primary Header Section */}
      <RevealOnScroll>
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
      </RevealOnScroll>

      {/* Feature Section 1: P2P File Sharing */}
      <RevealOnScroll delay={100}>
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
      </RevealOnScroll>

      {/* Feature Section 2: Relayo Cloud Hub */}
      <RevealOnScroll delay={150}>
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
            <div className="glass-panel p-5 rounded-2xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900/40 [html[data-theme=light]_&]:bg-white space-y-2.5 hover:translate-y-[-2px] transition-transform duration-200">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 [html[data-theme=light]_&]:bg-cyan-50 [html[data-theme=light]_&]:text-cyan-600 w-fit">
                <Copy className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">Real-Time Clipboard Sync</h3>
              <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
                Copy text, code snippets, or API keys on your PC and instantly access them on your phone with real-time clipboard sync.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900/40 [html[data-theme=light]_&]:bg-white space-y-2.5 hover:translate-y-[-2px] transition-transform duration-200">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 [html[data-theme=light]_&]:bg-purple-50 [html[data-theme=light]_&]:text-purple-600 w-fit">
                <Link className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">Instant Link Pusher</h3>
              <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
                Push URLs instantly from your laptop to your mobile browser or secondary monitor with a single click—no emailing required.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900/40 [html[data-theme=light]_&]:bg-white space-y-2.5 hover:translate-y-[-2px] transition-transform duration-200">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 [html[data-theme=light]_&]:bg-emerald-50 [html[data-theme=light]_&]:text-emerald-600 w-fit">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white [html[data-theme=light]_&]:text-[#0F172A]">Live Notes Scratchpad</h3>
              <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
                Brainstorm ideas, write task lists, or draft documentation on a real-time collaborative scratchpad that broadcasts live.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900/40 [html[data-theme=light]_&]:bg-white space-y-2.5 hover:translate-y-[-2px] transition-transform duration-200">
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
      </RevealOnScroll>

      {/* Feature Section 3: Why Choose Relayo */}
      <RevealOnScroll delay={200}>
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900/60 [html[data-theme=light]_&]:bg-white backdrop-blur-xl shadow-xl [html[data-theme=light]_&]:shadow-sm space-y-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A] text-center sm:text-left">
            Why Choose Relayo Over Traditional Cloud Storage?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 [html[data-theme=light]_&]:bg-cyan-100 [html[data-theme=light]_&]:text-cyan-700 flex items-center justify-center font-extrabold text-sm">1</div>
              <h3 className="text-base font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A]">Maximum Privacy</h3>
              <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
                Traditional cloud storage providers store your files on external hard drives. Relayo streams binary data directly from memory-to-memory via peer-to-peer WebRTC channels.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 [html[data-theme=light]_&]:bg-purple-100 [html[data-theme=light]_&]:text-purple-700 flex items-center justify-center font-extrabold text-sm">2</div>
              <h3 className="text-base font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A]">Blazing Fast Speeds</h3>
              <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
                Bypassing cloud upload/download queues means your transfers run at maximum local network bandwidth—up to 10x faster than cloud uploads.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 [html[data-theme=light]_&]:bg-emerald-100 [html[data-theme=light]_&]:text-emerald-700 flex items-center justify-center font-extrabold text-sm">3</div>
              <h3 className="text-base font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A]">Free & Unlimited</h3>
              <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
                No subscription fees, no account registration, and no daily transfer quotas. Share files and sync data freely without limits.
              </p>
            </div>
          </div>
        </div>
      </RevealOnScroll>

      {/* FAQ Accordion Section with Liquid Transitions */}
      <RevealOnScroll delay={250}>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 [html[data-theme=light]_&]:bg-cyan-50 [html[data-theme=light]_&]:text-cyan-700 [html[data-theme=light]_&]:border-cyan-200 text-xs font-semibold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A]">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 [html[data-theme=light]_&]:text-[#475569]">
              Everything you need to know about Relayo peer-to-peer file sharing and cloud hub.
            </p>
          </div>

          <div className="space-y-3.5 max-w-4xl mx-auto">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="glass-panel rounded-2xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900/40 [html[data-theme=light]_&]:bg-white overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer focus:outline-none group"
                  >
                    <span className="text-sm font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A] pr-4 group-hover:text-cyan-400 [html[data-theme=light]_&]:group-hover:text-cyan-600 transition-colors">
                      {faq.question}
                    </span>
                    <div className="p-1 rounded-full bg-white/5 [html[data-theme=light]_&]:bg-slate-100 group-hover:bg-cyan-500/20 [html[data-theme=light]_&]:group-hover:bg-cyan-100 transition-colors shrink-0">
                      <ChevronDown
                        className={`w-4 h-4 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isOpen ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </div>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-300 [html[data-theme=light]_&]:text-[#475569] leading-relaxed border-t border-white/5 [html[data-theme=light]_&]:border-slate-100">
                        <p className="pt-3.5">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
