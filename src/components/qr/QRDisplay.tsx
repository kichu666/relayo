import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { PairingMode } from '../../logic/qr/sessionStore';
import { Copy, Check, RefreshCw, Shield, Zap, Lock } from 'lucide-react';

interface QRDisplayProps {
  payloadUrl: string;
  sessionId: string;
  pin: string;
  pairingMode: PairingMode;
  expiresInSeconds?: number;
  onModeChange: (mode: PairingMode) => void;
  onRefreshKey: () => void;
}

export const QRDisplay: React.FC<QRDisplayProps> = ({
  payloadUrl,
  pin,
  pairingMode,
  expiresInSeconds = 180,
  onModeChange,
  onRefreshKey,
}) => {
  const [timeLeft, setTimeLeft] = useState(expiresInSeconds);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTimeLeft(expiresInSeconds);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [payloadUrl, expiresInSeconds]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(payloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy link', e);
    }
  };

  const progressPercent = Math.max(0, (timeLeft / expiresInSeconds) * 100);
  const isExpired = timeLeft === 0;

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto glass-panel rounded-3xl p-6 relative border border-white/10 shadow-2xl overflow-hidden">
      <div className="absolute -top-16 -left-16 w-36 h-36 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">Pair Device</h3>
            <p className="text-[11px] text-slate-400">Scan code with Relayo or Camera</p>
          </div>
        </div>

        <button
          onClick={onRefreshKey}
          title="Regenerate QR Code"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/5"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="relative group p-4 bg-white rounded-2xl shadow-2xl border border-slate-200/20 my-2 transition-all duration-300">
        {!isExpired ? (
          <div className="relative flex items-center justify-center">
            <QRCodeSVG
              value={payloadUrl}
              size={200}
              bgColor="#ffffff"
              fgColor="#090d16"
              level="H"
              includeMargin={false}
              imageSettings={{
                src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236366f1"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
                x: undefined,
                y: undefined,
                height: 36,
                width: 36,
                excavate: true,
              }}
            />
          </div>
        ) : (
          <div className="w-[200px] h-[200px] flex flex-col items-center justify-center text-slate-800 bg-slate-100 rounded-xl p-4 text-center">
            <Lock className="w-10 h-10 text-rose-500 mb-2 animate-bounce" />
            <p className="text-xs font-semibold text-slate-900">QR Code Expired</p>
            <p className="text-[10px] text-slate-500 mb-3">Key payload destroyed for security</p>
            <button
              onClick={onRefreshKey}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium shadow-md hover:bg-indigo-500 transition-all"
            >
              Refresh QR
            </button>
          </div>
        )}
      </div>

      <div className="w-full mt-4 p-1.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-1">
        <button
          type="button"
          onClick={() => onModeChange('ephemeral')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
            pairingMode === 'ephemeral'
              ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>One-Off (Ephemeral)</span>
        </button>

        <button
          type="button"
          onClick={() => onModeChange('trusted')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
            pairingMode === 'trusted'
              ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Trust Device</span>
        </button>
      </div>

      <div className="w-full mt-4">
        <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1.5 font-mono">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-cyan-400" />
            E2EE Session Token
          </span>
          <span className={timeLeft < 30 ? 'text-amber-400 font-bold' : ''}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              timeLeft < 30
                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                : 'bg-gradient-to-r from-cyan-400 to-indigo-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="w-full mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
        <div className="text-left">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Manual PIN Code</p>
          <p className="text-sm font-mono font-bold text-cyan-300 tracking-widest">{pin}</p>
        </div>

        <button
          onClick={copyToClipboard}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 hover:text-white transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
