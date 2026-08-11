import React from 'react';
import { ShieldCheck, Check, X, Lock } from 'lucide-react';
import type { DeviceMetadata } from '../../logic/qr/sessionStore';

interface SASVerificationModalProps {
  isOpen: boolean;
  sasEmojis: string[];
  peerMetadata: DeviceMetadata | null;
  onConfirm: () => void;
  onReject: () => void;
}

export const SASVerificationModal: React.FC<SASVerificationModalProps> = ({
  isOpen,
  sasEmojis,
  peerMetadata,
  onConfirm,
  onReject,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-sm glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden text-center flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <h3 className="text-base font-bold text-white tracking-wide">Security Verification</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Confirm that the 4 safety icons below match the icons displayed on{' '}
          <span className="text-cyan-300 font-semibold">{peerMetadata?.name || 'the peer device'}</span>.
        </p>

        <div className="w-full my-5 p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-around shadow-inner">
          {sasEmojis.map((emoji, idx) => (
            <div
              key={idx}
              className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-md transform hover:scale-110 transition-transform"
            >
              {emoji}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-6 font-mono">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>ECDH-P256 End-to-End Cryptographic Match</span>
        </div>

        <div className="w-full flex gap-3">
          <button
            type="button"
            onClick={onReject}
            aria-label="Mismatch, cancel pairing"
            className="flex-1 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Mismatch (Cancel)</span>
          </button>

          <button
            type="button"
            onClick={onConfirm}
            aria-label="Confirm security verification and pair"
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Confirm & Pair</span>
          </button>
        </div>
      </div>
    </div>
  );
};
