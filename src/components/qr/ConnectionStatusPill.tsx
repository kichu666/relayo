import React from 'react';
import type { SessionState } from '../../logic/qr/sessionStore';
import { ShieldCheck, ShieldAlert, RefreshCw, Zap, Wifi, Clock, Lock } from 'lucide-react';

interface ConnectionStatusPillProps {
  state: SessionState;
  transport?: 'direct-p2p' | 'turn-relay' | null;
  rttPingMs?: number | null;
  pairingMode?: 'ephemeral' | 'trusted';
  onRefresh?: () => void;
}

export const ConnectionStatusPill: React.FC<ConnectionStatusPillProps> = ({
  state,
  transport,
  rttPingMs,
  pairingMode = 'ephemeral',
  onRefresh,
}) => {
  const getStatusConfig = () => {
    switch (state) {
      case 'GENERATING':
        return {
          label: 'Generating Key Pair...',
          bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.25)]',
          dot: 'bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.8)]',
          icon: RefreshCw,
        };
      case 'WAITING_FOR_SCAN':
        return {
          label: 'Ready to Pair (Waiting for Scan)',
          bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.25)]',
          dot: 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]',
          icon: Lock,
        };
      case 'PEER_SCANNED':
        return {
          label: 'Peer Detected! Initializing...',
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.25)]',
          dot: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]',
          icon: Wifi,
        };
      case 'HANDSHAKING':
        return {
          label: 'ECDH Key Agreement Handshake...',
          bg: 'bg-violet-500/10 border-violet-500/30 text-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.25)]',
          dot: 'bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.8)]',
          icon: Zap,
        };
      case 'VERIFYING_SAS':
        return {
          label: 'Security SAS Emoji Verification',
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-500',
          icon: ShieldCheck,
        };
      case 'CONNECTED':
        return {
          label: transport === 'turn-relay' ? 'Connected (Relayed E2EE)' : 'Connected (Direct P2P E2EE)',
          bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
          dot: 'bg-emerald-500',
          icon: ShieldCheck,
        };
      case 'EXPIRED':
        return {
          label: 'QR Code Session Expired',
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-500',
          icon: Clock,
        };
      case 'ERROR':
        return {
          label: 'Pairing Connection Failed',
          bg: 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.25)]',
          dot: 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]',
          icon: ShieldAlert,
        };
      default:
        return {
          label: 'Idle',
          bg: 'bg-slate-800/50 border-slate-700 text-slate-400',
          dot: 'bg-slate-500',
          icon: Lock,
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <div
        className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-xs font-medium backdrop-blur-md transition-all duration-300 ${config.bg}`}
      >
        <span className="relative flex h-2 w-2">
          <span className={`inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
        </span>
        <IconComponent className={`w-3.5 h-3.5 ${state === 'GENERATING' ? 'animate-spin' : ''}`} />
        <span>{config.label}</span>

        {state === 'CONNECTED' && rttPingMs !== undefined && rttPingMs !== null && (
          <span className="ml-1.5 font-mono text-[10px] opacity-80 px-1.5 py-0.5 rounded bg-black/30">
            {rttPingMs}ms
          </span>
        )}
      </div>

      {pairingMode === 'trusted' && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[11px] font-medium">
          <ShieldCheck className="w-3 h-3 text-indigo-400" />
          Trusted Pair
        </span>
      )}

      {(state === 'EXPIRED' || state === 'ERROR') && onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          aria-label="Regenerate QR Code session"
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-lg cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          Regenerate QR
        </button>
      )}
    </div>
  );
};
