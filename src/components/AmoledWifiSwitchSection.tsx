import React from 'react';
import { Wifi, Cloud } from 'lucide-react';

interface AmoledWifiSwitchSectionProps {
  appMode: 'p2p' | 'cloud';
  setAppMode: (mode: 'p2p' | 'cloud') => void;
  onToggleTheme?: () => void;
}

export const AmoledWifiSwitchSection: React.FC<AmoledWifiSwitchSectionProps> = ({
  appMode,
  setAppMode,
}) => {
  return (
    <section className="w-full relative overflow-hidden bg-[#090a0f] border-b border-zinc-800/80 shadow-2xl">
      {/* Brushed Metal Background Texture (Horizontal Striations) */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 1px,
            rgba(255, 255, 255, 0.04) 1px,
            rgba(255, 255, 255, 0.04) 2px
          )`
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-center">
        {/* WI-FI / CLOUD TOGGLE TRACK — Sleek, thinner Y-axis (h-9/p-1), wider X-axis (w-36) */}
        <div className="w-36 h-9 p-1 flex items-center justify-between rounded-full bg-zinc-950/90 border border-zinc-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] backdrop-blur-md">
          
          {/* Active Wi-Fi Button */}
          <button
            onClick={() => setAppMode('p2p')}
            className={`relative flex items-center justify-center transition-all duration-300 cursor-pointer ${
              appMode === 'p2p'
                ? 'w-7 h-7 rounded-full bg-black ring-2 ring-white shadow-[0_0_12px_rgba(255,255,255,0.95),0_0_20px_rgba(255,255,255,0.5)]'
                : 'w-7 h-7 rounded-full bg-transparent text-zinc-600 hover:text-zinc-400'
            }`}
            title="Wi-Fi P2P Mode"
          >
            <Wifi
              className={`w-3.5 h-3.5 shrink-0 transition-all duration-300 ${
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
                ? 'w-7 h-7 rounded-full bg-black ring-2 ring-white shadow-[0_0_12px_rgba(255,255,255,0.95),0_0_20px_rgba(255,255,255,0.5)]'
                : 'w-7 h-7 rounded-full bg-transparent text-zinc-600 hover:text-zinc-400'
            }`}
            title="Cloud Hub Mode"
          >
            <Cloud
              className={`w-3.5 h-3.5 shrink-0 transition-all duration-300 ${
                appMode === 'cloud'
                  ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,1)] stroke-[2.5]'
                  : 'text-zinc-600 stroke-[1.5]'
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  );
};
