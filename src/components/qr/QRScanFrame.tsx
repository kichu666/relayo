import React from 'react';
import { Flashlight, FlipHorizontal } from 'lucide-react';

interface QRScanFrameProps {
  isScanning: boolean;
  torchActive: boolean;
  onToggleTorch?: () => void;
  onSwitchCamera?: () => void;
}

export const QRScanFrame: React.FC<QRScanFrameProps> = ({
  isScanning,
  torchActive,
  onToggleTorch,
  onSwitchCamera,
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      {/* Centered Reticle Proportional Square Box */}
      <div className="relative w-[75%] aspect-square flex flex-col items-center justify-center">
        {/* Cyan Corner Brackets */}
        <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-cyan-400 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-cyan-400 rounded-br-xl" />

        {/* Animated Laser Sweep Line */}
        {isScanning && (
          <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06b6d4] animate-laser" />
        )}

        {/* Camera Torch & Switch Controls at bottom of reticle */}
        {(onToggleTorch || onSwitchCamera) && (
          <div className="absolute -bottom-14 flex items-center justify-center gap-3 px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-white/10 pointer-events-auto z-30 shadow-xl">
            {onToggleTorch && (
              <button
                type="button"
                onClick={onToggleTorch}
                aria-label="Toggle Flashlight"
                aria-pressed={torchActive}
                className={`p-2 rounded-full transition-all cursor-pointer ${
                  torchActive
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/50'
                    : 'bg-white/10 hover:bg-white/20 text-slate-300'
                }`}
                title="Toggle Flashlight"
              >
                <Flashlight className="w-4 h-4" />
              </button>
            )}

            {onSwitchCamera && (
              <button
                type="button"
                onClick={onSwitchCamera}
                aria-label="Switch Camera"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-all cursor-pointer"
                title="Switch Camera"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
