import { useState } from 'react';
import { HelpCircle, ChevronDown, ArrowLeft } from 'lucide-react';
import { PageView } from './NavigationDrawer';

interface FaqPageProps {
  onNavigate: (page: PageView) => void;
}

export function FaqPage({ onNavigate }: FaqPageProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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
      answer: "Yes, you can transfer files between a Windows PC and iPhone without installing software by using Relayo in any web browser. Simply open relayo.space on both devices, scan the generated QR code, and send unlimited photos, videos, and documents directly across browsers."
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
      answer: "You can sync your clipboard across Windows, Mac, Android, and iOS without Phone Link or Apple Universal Clipboard using Relayo Cloud Hub. Simply open relayo.space in your browser, join a private room code, and copy-paste text or links live across all connected screens."
    },
    {
      question: "How can I push links instantly from my phone to my laptop?",
      answer: "To push links instantly from mobile to desktop without emailing yourself, use Relayo’s Link Pusher tool. Enter your shared Cloud Room code on both browsers to automatically broadcast URLs across devices and open web pages with a single click in real time."
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-10 animate-fade-in">
      {/* Top Back Button */}
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 [html[data-theme=light]_&]:bg-slate-100 hover:bg-white/10 [html[data-theme=light]_&]:hover:bg-slate-200 text-xs font-semibold text-slate-300 [html[data-theme=light]_&]:text-slate-700 transition-all cursor-pointer border border-white/10 [html[data-theme=light]_&]:border-slate-200"
      >
        <ArrowLeft className="w-4 h-4 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600" />
        <span>Back to Home</span>
      </button>

      {/* Header Section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 [html[data-theme=light]_&]:bg-cyan-50 [html[data-theme=light]_&]:text-cyan-700 [html[data-theme=light]_&]:border-cyan-200 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Got Questions?</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A] tracking-tight">
          Frequently Asked Questions (FAQ)
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 [html[data-theme=light]_&]:text-[#475569] max-w-xl mx-auto">
          Everything you need to know about Relayo peer-to-peer file sharing and cloud hub.
        </p>
      </div>

      {/* Accordion FAQ Items */}
      <div className="space-y-4 pt-4">
        {faqs.map((faq, idx) => {
          const isOpen = openFaqIndex === idx;
          return (
            <div
              key={idx}
              className="glass-panel rounded-2xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900/60 [html[data-theme=light]_&]:bg-white overflow-hidden transition-all duration-300 shadow-md"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer focus:outline-none group"
              >
                <span className="text-sm sm:text-base font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A] pr-4 group-hover:text-cyan-400 [html[data-theme=light]_&]:group-hover:text-cyan-600 transition-colors">
                  {faq.question}
                </span>
                <div className="p-1.5 rounded-full bg-white/5 [html[data-theme=light]_&]:bg-slate-100 group-hover:bg-cyan-500/20 [html[data-theme=light]_&]:group-hover:bg-cyan-100 transition-colors shrink-0">
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
                  <div className="px-5 pb-6 pt-0 text-xs sm:text-sm text-slate-300 [html[data-theme=light]_&]:text-[#475569] leading-relaxed border-t border-white/5 [html[data-theme=light]_&]:border-slate-100">
                    <p className="pt-4">{faq.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
