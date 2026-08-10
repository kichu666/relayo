import { Zap, ShieldCheck, Server } from 'lucide-react';

export function WhyRelayoSection() {
  return (
    <section className="w-full max-w-6xl mx-auto mt-14 pt-12 pb-16 px-4 sm:px-6">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] bg-slate-900/60 [html[data-theme=light]_&]:bg-white backdrop-blur-xl shadow-xl [html[data-theme=light]_&]:shadow-sm space-y-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A] text-center sm:text-left">
          Why Choose Relayo Cloud Over Traditional Storage?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 [html[data-theme=light]_&]:bg-cyan-100 [html[data-theme=light]_&]:text-cyan-700 flex items-center justify-center font-extrabold text-sm shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A]">
              Lightning-Fast Realtime Sync
            </h3>
            <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
              Traditional architectures struggle with slow database queries and heavy server latency. Relayo leverages Firebase global infrastructure to sync your data instantly across devices in real time.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 [html[data-theme=light]_&]:bg-purple-100 [html[data-theme=light]_&]:text-purple-700 flex items-center justify-center font-extrabold text-sm shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A]">
              Enterprise-Grade Cloud Security
            </h3>
            <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
              Built on Google Cloud secure infrastructure with robust Firestore security rules, ensuring your data remains protected, isolated, and accessible only to authorized users.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 [html[data-theme=light]_&]:bg-emerald-100 [html[data-theme=light]_&]:text-emerald-700 flex items-center justify-center font-extrabold text-sm shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-white [html[data-theme=light]_&]:text-[#0F172A]">
              Seamless and Reliable Infrastructure
            </h3>
            <p className="text-xs text-slate-400 [html[data-theme=light]_&]:text-[#475569] leading-relaxed">
              No worrying about downtime, manual server maintenance, or scaling bottlenecks. Relayo runs on a fully managed, serverless cloud backend designed for high availability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

