import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { $cloudStore, updateDeviceName, CloudDevice } from '../../logic/cloudStore';
import {
  Laptop,
  Smartphone,
  Monitor,
  Tablet,
  Edit2,
  Check,
  Wifi,
  ShieldCheck,
  Globe,
  Activity,
  Cpu,
  Radio
} from 'lucide-react';

export function PresenceTracker() {
  const store = useStore($cloudStore);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(store.deviceName);

  const handleSaveName = () => {
    updateDeviceName(nameInput);
    setIsEditingName(false);
  };

  const stripEmojis = (str: string = '') =>
    str.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim();

  const getDeviceIcon = (type?: string) => {
    const clean = String(type || '').toLowerCase();
    if (clean.includes('phone') || clean.includes('mobile')) {
      return <Smartphone className="w-5 h-5 text-cyan-400" />;
    }
    if (clean.includes('tablet') || clean.includes('ipad')) {
      return <Tablet className="w-5 h-5 text-purple-400" />;
    }
    if (clean.includes('laptop')) {
      return <Laptop className="w-5 h-5 text-emerald-400" />;
    }
    return <Monitor className="w-5 h-5 text-cyan-400" />;
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

  return (
    <div className="space-y-6">
      {/* Device Info Header Card */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-indigo-950/40 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-inner">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider text-cyan-400">This Device</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ● Active
                </span>
              </div>

              {isEditingName ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="bg-black/60 border border-cyan-500/50 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    placeholder="Enter device name..."
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition"
                    title="Save Device Name"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <h3 className="text-lg font-bold text-white tracking-wide">{store.deviceName}</h3>
                  <button
                    onClick={() => {
                      setNameInput(store.deviceName);
                      setIsEditingName(true);
                    }}
                    className="p-1 text-slate-400 hover:text-cyan-300 transition"
                    title="Rename Device"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-slate-300">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Room Code:</span>
            <span className="font-mono font-bold text-cyan-300 tracking-wider">{store.roomId}</span>
          </div>
        </div>
      </div>

      {/* Online Devices Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-slate-200 tracking-wide">
              Connected Devices ({onlineDevices.length})
            </h4>
          </div>
          <span className="text-xs text-slate-400">Synced via Relayo Cloud</span>
        </div>

        {onlineDevices.length === 0 ? (
          <div className="glass-panel p-6 text-center rounded-2xl border border-white/5 bg-black/40">
            <Radio className="w-8 h-8 text-cyan-400/40 mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-slate-400">No other devices online in this Cloud Room.</p>
            <p className="text-xs text-slate-500 mt-1">Open Relayo on your mobile phone or laptop with Room Code <span className="font-mono text-cyan-400">{store.roomId}</span> to instantly pair!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {onlineDevices.map((dev) => {
              const isCurrent = dev.id === store.deviceId;
              return (
                <div
                  key={dev.id}
                  className={`glass-panel p-4 rounded-2xl border transition-all duration-300 ${
                    isCurrent
                      ? 'border-cyan-500/40 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'border-white/10 bg-slate-900/40 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        {getDeviceIcon(dev.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm text-white">{stripEmojis(dev.name)}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              This Device
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 capitalize">
                          {dev.type} • {dev.platform || 'Web'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Online</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-cyan-400" /> Cloud Sync Active
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
          <h4 className="text-xs font-semibold text-slate-500 tracking-wide mb-2 px-1">
            Offline Devices ({offlineDevices.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {offlineDevices.map((dev) => (
              <div
                key={dev.id}
                className="glass-panel p-3.5 rounded-2xl border border-white/5 bg-black/30 opacity-60"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-white/5 text-slate-400">
                      {getDeviceIcon(dev.type)}
                    </div>
                    <div>
                      <span className="font-medium text-xs text-slate-300">{stripEmojis(dev.name)}</span>
                      <p className="text-[11px] text-slate-500">Last active: {formatLastSeen(dev.lastActive)}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
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
