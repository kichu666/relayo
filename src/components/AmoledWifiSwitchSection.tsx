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
    <div className="w-[196px] h-[38px] md:w-[248px] md:h-[42px] mx-auto p-1 flex items-center rounded-full bg-zinc-950/90 [html[data-theme=light]_&]:bg-slate-900 border border-zinc-800/80 [html[data-theme=light]_&]:border-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] backdrop-blur-md relative select-none">
      {/* Smooth Sliding Active State Indicator */}
      <div
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-black [html[data-theme=light]_&]:bg-slate-950 ring-1 ring-white/40 [html[data-theme=light]_&]:ring-slate-700 shadow-[0_0_6px_rgba(34,211,238,0.2),0_0_10px_rgba(255,255,255,0.15)] [html[data-theme=light]_&]:shadow-md transition-all duration-300 ease-in-out ${
          appMode === 'p2p' ? 'left-1' : 'left-[calc(50%+0px)]'
        }`}
      />

      {/* Local (Wi-Fi P2P) Mode Button */}
      <button
        onClick={() => setAppMode('p2p')}
        className={`relative z-10 w-1/2 h-full flex items-center justify-center gap-1.5 md:gap-2 rounded-full font-bold text-xs md:text-sm transition-colors duration-300 cursor-pointer ${
          appMode === 'p2p'
            ? 'text-cyan-400 [html[data-theme=light]_&]:text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.4)] [html[data-theme=light]_&]:drop-shadow-none'
            : 'text-zinc-500 [html[data-theme=light]_&]:text-slate-400 hover:text-zinc-300 [html[data-theme=light]_&]:hover:text-slate-200'
        }`}
        title="Local P2P Mode"
      >
        <Wifi
          className={`w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 transition-all duration-300 ${
            appMode === 'p2p' ? 'stroke-[2.5]' : 'stroke-[1.5]'
          }`}
        />
        <span>Local</span>
      </button>

      {/* Cloud Mode Button */}
      <button
        onClick={() => setAppMode('cloud')}
        className={`relative z-10 w-1/2 h-full flex items-center justify-center gap-1.5 md:gap-2 rounded-full font-bold text-xs md:text-sm transition-colors duration-300 cursor-pointer ${
          appMode === 'cloud'
            ? 'text-cyan-400 [html[data-theme=light]_&]:text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.4)] [html[data-theme=light]_&]:drop-shadow-none'
            : 'text-zinc-500 [html[data-theme=light]_&]:text-slate-400 hover:text-zinc-300 [html[data-theme=light]_&]:hover:text-slate-200'
        }`}
        title="Cloud Hub Mode"
      >
        <Cloud
          className={`w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 transition-all duration-300 ${
            appMode === 'cloud' ? 'stroke-[2.5]' : 'stroke-[1.5]'
          }`}
        />
        <span>Cloud</span>
      </button>
    </div>
  );
};

export const AmoledWifiSwitchSection = AmoledWifiSwitch;
