import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $cloudStore, updateDeviceName } from '../../logic/cloudStore';
import {
  Laptop,
  Smartphone,
  Monitor,
  Tablet,
  Edit2,
  Check,
  Globe,
  Activity,
  Cpu,
  Radio,
  ShieldCheck
} from 'lucide-react';

export function PresenceTracker() {
  const store = useStore($cloudStore);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(store.deviceName);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileViewport(window.innerWidth < 768 || /Mobile|Android|iP(hone|od)/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSaveName = () => {
    updateDeviceName(nameInput);
    setIsEditingName(false);
  };

  const stripEmojis = (str: string = '') =>
    str.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim();

  const getFormattedDeviceName = (name: string, type?: string) => {
    const clean = stripEmojis(name);
    const cleanType = String(type || '').toLowerCase();
    if (isMobileViewport && (clean === 'Device Desktop' || clean === 'Desktop' || cleanType === 'desktop')) {
      return 'Mobile Device';
    }
    return clean;
  };

  const getDeviceIcon = (type?: string, name?: string) => {
    const clean = String(type || '').toLowerCase();
    const cleanName = String(name || '').toLowerCase();
    if (clean.includes('phone') || clean.includes('mobile') || (isMobileViewport && cleanName.includes('desktop'))) {
      return <Smartphone className="w-5 h-5 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600" strokeWidth={2} />;
    }
    if (clean.includes('tablet') || clean.includes('ipad')) {
      return <Tablet className="w-5 h-5 text-purple-400 [html[data-theme=light]_&]:text-purple-600" strokeWidth={2} />;
    }
    if (clean.includes('laptop')) {
      return <Laptop className="w-5 h-5 text-emerald-400 [html[data-theme=light]_&]:text-emerald-600" strokeWidth={2} />;
    }
    return <Monitor className="w-5 h-5 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600" strokeWidth={2} />;
  };

  const formatLastSeen = (timestamp: number) => {
    if (!timestamp) return 'Just now';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 15) return 'Active just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const remoteDevices = store.devices.filter((d) => d.id !== store.deviceId);
  const onlineDevices = remoteDevices.filter((d) => d.status === 'online');
  const offlineDevices = remoteDevices.filter((d) => d.status === 'offline');

  const displayedCurrentDeviceName = getFormattedDeviceName(store.deviceName, store.devices.find(d => d.id === store.deviceId)?.type);

  return (
    <div className="space-y-8">
      {/* Device Info Header Card (Pure White Surface in Light Mode) */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl border border-white/10 dark:border-white/10 [html[data-theme=light]_&]:border-[#D5E9FF] bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-indigo-950/40 dark:from-slate-900/90 dark:via-slate-900/70 dark:to-indigo-950/40 [html[data-theme=light]_&]:bg-white [html[data-theme=light]_&]:bg-none shadow-xl [html[data-theme=light]_&]:shadow-sm backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="p-2.5 sm:p-3 rounded-xl bg-cyan-500/10 [html[data-theme=light]_&]:bg-cyan-50 border border-cyan-500/30 [html[data-theme=light]_&]:border-cyan-200 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600 shadow-inner [html[data-theme=light]_&]:shadow-none shrink-0">
              <Cpu className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider text-cyan-400 [html[data-theme=light]_&]:text-cyan-600">This Device</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 [html[data-theme=light]_&]:text-emerald-700 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ● Active
                </span>
              </div>

              {isEditingName ? (
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="h-11 min-h-[44px] bg-black/60 [html[data-theme=light]_&]:bg-white border border-cyan-500/50 [html[data-theme=light]_&]:border-[#D5E9FF] focus:[html[data-theme=light]_&]:border-[#22C7F2] rounded-xl px-4 py-1 text-sm text-white [html[data-theme=light]_&]:text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:[html[data-theme=light]_&]:ring-0 focus:[html[data-theme=light]_&]:shadow-[0_0_0_4px_rgba(34,199,242,0.15)] transition"
                    placeholder="Enter device name..."
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="h-11 min-h-[44px] px-4 rounded-xl bg-cyan-500/20 [html[data-theme=light]_&]:bg-gradient-to-r [html[data-theme=light]_&]:from-cyan-500 [html[data-theme=light]_&]:to-blue-600 hover:bg-cyan-500/30 text-cyan-300 [html[data-theme=light]_&]:text-white border border-cyan-500/40 [html[data-theme=light]_&]:border-transparent transition cursor-pointer font-bold"
                    title="Save Device Name"
                  >
                    <Check className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                  <h3 className="text-base sm:text-lg font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A] tracking-wide">
                    {displayedCurrentDeviceName}
                  </h3>
                  <button
                    onClick={() => {
                      setNameInput(displayedCurrentDeviceName);
                      setIsEditingName(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-cyan-300 [html[data-theme=light]_&]:hover:text-cyan-600 transition cursor-pointer"
                    title="Rename Device"
                  >
                    <Edit2 className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-2 bg-black/40 [html[data-theme=light]_&]:bg-[#F4F9FF] px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-xl border border-white/10 [html[data-theme=light]_&]:border-[#D5E9FF] text-xs font-mono text-slate-300 [html[data-theme=light]_&]:text-[#0F172A] font-medium w-full sm:w-auto shrink-0 mt-3 pt-3 sm:mt-0 sm:pt-0 border-t sm:border-t-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <Globe className="w-4 h-4 text-cyan-400 [html[data-theme=light]_&]:text-cyan-600 shrink-0" strokeWidth={2} />
              <span className="font-sans">Room Code:</span>
            </div>
            <span className="font-mono font-bold text-cyan-300 [html[data-theme=light]_&]:text-cyan-700 tracking-wider truncate max-w-[160px] sm:max-w-none">{store.roomId}</span>
          </div>
        </div>
      </div>

      {/* Online Devices Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 [html[data-theme=light]_&]:text-[#007AFF]" strokeWidth={2} />
            <h4 className="text-sm font-extrabold text-slate-200 [html[data-theme=light]_&]:text-[#1D1D1F] tracking-wide">
              Connected Devices ({onlineDevices.length})
            </h4>
          </div>
          <span className="text-xs font-medium text-slate-400 [html[data-theme=light]_&]:text-[#86868B]">Synced via Relayo Cloud</span>
        </div>

        {onlineDevices.length === 0 ? (
          <div className="glass-panel p-8 sm:p-10 pb-16 sm:pb-20 text-center rounded-2xl border border-white/5 [html[data-theme=light]_&]:border-[#E5E5EA] bg-black/40 [html[data-theme=light]_&]:bg-white [html[data-theme=light]_&]:shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <Radio className="w-8 h-8 text-cyan-400/40 [html[data-theme=light]_&]:text-[#007AFF]/50 mx-auto mb-3 animate-pulse" strokeWidth={2} />
            <p className="text-base font-extrabold text-slate-200 [html[data-theme=light]_&]:text-[#1D1D1F]">No other devices online in this Cloud Room.</p>
            <p className="text-xs font-medium text-slate-400 [html[data-theme=light]_&]:text-[#86868B] mt-2 leading-relaxed max-w-md mx-auto">Open Relayo on your mobile phone or laptop with Room Code <span className="font-mono font-bold text-cyan-400 [html[data-theme=light]_&]:text-[#007AFF] bg-cyan-500/10 [html[data-theme=light]_&]:bg-[#E5F1FF] px-2 py-0.5 rounded">{store.roomId}</span> to instantly pair!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {onlineDevices.map((dev) => {
              const isCurrent = dev.id === store.deviceId;
              const formattedName = getFormattedDeviceName(dev.name, dev.type);

              return (
                <div
                  key={dev.id}
                  className={`glass-panel p-4 rounded-2xl border transition-all duration-300 ${
                    isCurrent
                      ? 'border-cyan-500/40 bg-cyan-950/20 [html[data-theme=light]_&]:bg-[#E5F1FF] [html[data-theme=light]_&]:border-[#007AFF]/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] [html[data-theme=light]_&]:shadow-none'
                      : 'border-white/10 [html[data-theme=light]_&]:border-[#E5E5EA] bg-slate-900/40 [html[data-theme=light]_&]:bg-white [html[data-theme=light]_&]:shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white/5 [html[data-theme=light]_&]:bg-[#F5F5F7] border border-white/10 [html[data-theme=light]_&]:border-transparent">
                        {getDeviceIcon(dev.type, dev.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-white [html[data-theme=light]_&]:text-[#1D1D1F]">{formattedName}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 [html[data-theme=light]_&]:text-[#007AFF] [html[data-theme=light]_&]:bg-[#E5F1FF] border border-cyan-500/30 [html[data-theme=light]_&]:border-transparent">
                              This Device
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-slate-400 [html[data-theme=light]_&]:text-[#86868B] mt-0.5 capitalize">
                          {isMobileViewport && formattedName.includes('Mobile') ? 'Mobile Phone' : dev.type} • {dev.platform || 'Web'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 [html[data-theme=light]_&]:text-emerald-700 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Online</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5 [html[data-theme=light]_&]:border-[#E5E5EA] flex items-center justify-between text-[11px] font-medium text-slate-400 [html[data-theme=light]_&]:text-[#86868B]">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 [html[data-theme=light]_&]:text-[#007AFF]" strokeWidth={2} /> Cloud Sync Active
                    </span>
                    <span>{formatLastSeen(dev.lastActive)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Offline Devices (if any) */}
      {offlineDevices.length > 0 && (
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-500 tracking-wide mb-2.5 px-1 uppercase">
            Offline Devices ({offlineDevices.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {offlineDevices.map((dev) => (
              <div
                key={dev.id}
                className="glass-panel p-3.5 rounded-2xl border border-white/5 [html[data-theme=light]_&]:border-[#E5E5EA] bg-black/30 [html[data-theme=light]_&]:bg-[#F5F5F7] opacity-60"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-white/5 [html[data-theme=light]_&]:bg-slate-200/60 text-slate-400 [html[data-theme=light]_&]:text-[#86868B]">
                      {getDeviceIcon(dev.type, dev.name)}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-300 [html[data-theme=light]_&]:text-[#1D1D1F]">{stripEmojis(dev.name)}</span>
                      <p className="text-[11px] font-medium text-slate-500">Last active: {formatLastSeen(dev.lastActive)}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 [html[data-theme=light]_&]:bg-slate-200 text-slate-400 [html[data-theme=light]_&]:text-[#86868B] border border-slate-700 [html[data-theme=light]_&]:border-transparent">
                    Offline
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
