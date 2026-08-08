import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Mail } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Relayo] System exception captured:', error, info);
  }

  render() {
    if (this.state.hasError) {
      const errorName = this.state.error?.name || 'ERR_RENDER_CRASH';
      const rawMsg = this.state.error?.message || 'An unhandled rendering exception occurred.';
      // Truncate long error messages cleanly without raw stack dumps
      const truncatedMessage = rawMsg.length > 80 ? `${rawMsg.substring(0, 80)}...` : rawMsg;

      return (
        <div className="min-h-screen bg-[#070A12] text-slate-100 flex items-center justify-center p-4 font-sans relative z-50 selection:bg-cyan-500 selection:text-white">
          <div className="max-w-md w-full glass-panel bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-center space-y-5 animate-fade-in">
            
            {/* Warning Shield Icon */}
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            {/* Professional Title & Description */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Application Error
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                Relayo encountered an unexpected rendering issue. Our system has logged the exception. Please refresh the session to continue.
              </p>
            </div>

            {/* Formatted Monospaced Error Code Block */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-slate-800 text-left font-mono text-[11px] text-rose-400 space-y-1">
              <div className="font-bold uppercase tracking-wider text-rose-300 text-[10px]">
                Error Code: {errorName}
              </div>
              <div className="truncate text-slate-300">
                {truncatedMessage}
              </div>
            </div>

            {/* Recovery Action Buttons */}
            <div className="space-y-2.5 pt-2">
              {/* Primary Gradient Refresh Button */}
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Page</span>
              </button>

              {/* Secondary Ghost Contact Support Button */}
              <a
                href="mailto:team@relayo.space"
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 group"
              >
                <Mail className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>Contact Support</span>
              </a>
            </div>

          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
