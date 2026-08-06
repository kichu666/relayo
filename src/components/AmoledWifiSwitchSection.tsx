import React from 'react';
import { Wifi, Cloud } from 'lucide-react';

interface AmoledWifiSwitchProps {
  appMode: 'p2p' | 'cloud';
  setAppMode: (mode: 'p2p' | 'cloud') => void;
}

export const AmoledWifiSwitch: React.FC<AmoledWifiSwitchProps> = ({
  appMode,
  setAppMode,
}) => {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 flex items-center p-1 gap-1 rounded-full bg-zinc-950/90 border border-zinc-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] backdrop-blur-md">
      {/* Active Wi-Fi Button */}
      <button
        onClick={() => setAppMode('p2p')}
        className={`relative flex items-center justify-center transition-all duration-300 cursor-pointer ${
          appMode === 'p2p'
            ? 'w-8 h-8 rounded-full bg-black ring-2 ring-white shadow-[0_0_12px_rgba(255,255,255,0.95),0_0_20px_rgba(255,255,255,0.5)]'
            : 'w-8 h-8 rounded-full bg-transparent text-zinc-600 hover:text-zinc-400'
        }`}
        title="Wi-Fi P2P Mode"
      >
        <Wifi
          className={`w-4 h-4 shrink-0 transition-all duration-300 ${
            appMode === 'p2p'
              ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,1)] stroke-[2.5]'
              : 'text-zinc-600 stroke-[1.5]'
          }`}
        />
      </button>

      {/* Cloud Button */}
      <button
        onClick={() => setAppMode('cloud')}
        className={`relative flex items-center justify-center transition-all duration-300 cursor-pointer ${
          appMode === 'cloud'
            ? 'w-8 h-8 rounded-full bg-black ring-2 ring-white shadow-[0_0_12px_rgba(255,255,255,0.95),0_0_20px_rgba(255,255,255,0.5)]'
            : 'w-8 h-8 rounded-full bg-transparent text-zinc-600 hover:text-zinc-400'
        }`}
        title="Cloud Hub Mode"
      >
        <Cloud
          className={`w-4 h-4 shrink-0 transition-all duration-300 ${
            appMode === 'cloud'
              ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,1)] stroke-[2.5]'
              : 'text-zinc-600 stroke-[1.5]'
          }`}
        />
      </button>
    </div>
  );
};

// Also export as AmoledWifiSwitchSection for backward compatibility if imported elsewhere
export const AmoledWifiSwitchSection = AmoledWifiSwitch;
