export function WhyRelayoSection() {
  return (
    <section className="w-full max-w-6xl mx-auto mt-14 pt-12 pb-16 px-4 sm:px-6">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900/60 [html[data-theme=light]_&]:bg-white backdrop-blur-xl shadow-xl [html[data-theme=light]_&]:shadow-sm space-y-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A] text-center sm:text-left">
          Why Choose Relayo Over Traditional Cloud Storage?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 [html[data-theme=light]_&]:bg-cyan-100 [html[data-theme=light]_&]:text-cyan-700 flex items-center justify-center font-extrabold text-sm">1</div>
            <h3 className="text-base font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A]">Maximum Privacy</h3>
            <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
              Traditional cloud storage providers store your files on external hard drives. Relayo streams binary data directly from memory-to-memory via peer-to-peer WebRTC channels.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 [html[data-theme=light]_&]:bg-purple-100 [html[data-theme=light]_&]:text-purple-700 flex items-center justify-center font-extrabold text-sm">2</div>
            <h3 className="text-base font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A]">Blazing Fast Speeds</h3>
            <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
              Bypassing cloud upload/download queues means your transfers run at maximum local network bandwidth—up to 10x faster than cloud uploads.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 [html[data-theme=light]_&]:bg-emerald-100 [html[data-theme=light]_&]:text-emerald-700 flex items-center justify-center font-extrabold text-sm">3</div>
            <h3 className="text-base font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A]">Free & Unlimited</h3>
            <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
              No subscription fees, no account registration, and no daily transfer quotas. Share files and sync data freely without limits.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
