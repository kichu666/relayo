import React, { useState } from 'react';
import { Star, X, CheckCircle2, Loader2, MessageSquareHeart, Send } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('https://formspree.io/f/mnpaqrwn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          rating,
          name: name.trim() || 'Anonymous User',
          email: email.trim() || 'N/A',
          message: message.trim()
        })
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const data = await response.json().catch(() => null);
        setErrorMessage(data?.error || 'Failed to send feedback. Please try again.');
      }
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setMessage('');
    setName('');
    setEmail('');
    setRating(5);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 pt-20 sm:pt-4 [html[data-theme=amoled]_&]:bg-black/80 [html[data-theme=dark]_&]:bg-slate-950/80 [html[data-theme=light]_&]:bg-[rgba(248,250,252,0.35)] backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md [html[data-theme=amoled]_&]:bg-black [html[data-theme=dark]_&]:bg-slate-950 [html[data-theme=light]_&]:bg-[linear-gradient(180deg,#F9FCFF_0%,#EEF7FF_100%)] border border-slate-200 dark:border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] rounded-3xl p-6 shadow-[0_20px_60px_rgba(14,165,233,0.12)] dark:shadow-2xl backdrop-blur-2xl text-slate-900 dark:text-slate-100">
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-100 dark:bg-white/5 [html[data-theme=light]_&]:bg-white hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] text-slate-500 dark:text-slate-400 [html[data-theme=light]_&]:text-[#475569] hover:text-slate-900 dark:hover:text-white hover:[html[data-theme=light]_&]:text-[#0F172A] [html[data-theme=light]_&]:shadow-sm transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="flex justify-center">
              <div className="p-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400">
                <CheckCircle2 className="w-12 h-12 animate-bounce" />
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white [html[data-theme=light]_&]:text-[#172033] tracking-tight">
              Thank You for Your Feedback!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 [html[data-theme=light]_&]:text-[#667085] max-w-xs mx-auto leading-relaxed">
              Your review has been successfully submitted and helps us continuously improve Relayo.
            </p>
            <button
              onClick={handleResetAndClose}
              className="w-full mt-4 py-2.5 rounded-2xl bg-[linear-gradient(90deg,#1FB6FF,#2D7FF9)] hover:brightness-105 text-white font-bold text-xs shadow-lg transition cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
                <MessageSquareHeart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white [html[data-theme=light]_&]:text-[#172033]">Share Your Feedback</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 [html[data-theme=light]_&]:text-[#667085]">We value your review and suggestions</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating Picker (Star wrapper forced to bg-transparent with drop-shadow SVG glow) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 [html[data-theme=light]_&]:text-[#172033] mb-1.5">
                  Rating
                </label>
                <div className="flex items-center gap-2 bg-transparent border border-slate-200 dark:border-white/10 [html[data-theme=light]_&]:border-[#D9EAF7] p-2.5 rounded-xl justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer bg-transparent"
                    >
                      <Star
                        className={`w-6 h-6 bg-transparent ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Email Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 [html[data-theme=light]_&]:text-[#0F172A] mb-1">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name..."
                    className="w-full bg-slate-50 dark:bg-black/60 [html[data-theme=light]_&]:bg-white border border-slate-200 dark:border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] hover:[html[data-theme=light]_&]:border-[#B8DCFF] focus:[html[data-theme=light]_&]:border-[#22C7F2] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white [html[data-theme=light]_&]:text-[#0F172A] placeholder-slate-400 dark:placeholder-slate-500 [html[data-theme=light]_&]:placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:[html[data-theme=light]_&]:ring-0 focus:[html[data-theme=light]_&]:shadow-[0_0_0_4px_rgba(34,199,242,0.15)] transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 [html[data-theme=light]_&]:text-[#0F172A] mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com..."
                    className="w-full bg-slate-50 dark:bg-black/60 [html[data-theme=light]_&]:bg-white border border-slate-200 dark:border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] hover:[html[data-theme=light]_&]:border-[#B8DCFF] focus:[html[data-theme=light]_&]:border-[#22C7F2] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white [html[data-theme=light]_&]:text-[#0F172A] placeholder-slate-400 dark:placeholder-slate-500 [html[data-theme=light]_&]:placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:[html[data-theme=light]_&]:ring-0 focus:[html[data-theme=light]_&]:shadow-[0_0_0_4px_rgba(34,199,242,0.15)] transition"
                  />
                </div>
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 [html[data-theme=light]_&]:text-[#0F172A] mb-1">
                  Your Review / Message <span className="text-cyan-600 dark:text-cyan-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you love or how we can improve Relayo..."
                  className="w-full bg-slate-50 dark:bg-black/60 [html[data-theme=light]_&]:bg-white border border-slate-200 dark:border-white/10 [html[data-theme=light]_&]:border-[#D7E8FF] hover:[html[data-theme=light]_&]:border-[#B8DCFF] focus:[html[data-theme=light]_&]:border-[#22C7F2] rounded-xl p-3 text-xs text-slate-900 dark:text-white [html[data-theme=light]_&]:text-[#0F172A] placeholder-slate-400 dark:placeholder-slate-500 [html[data-theme=light]_&]:placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:[html[data-theme=light]_&]:ring-0 focus:[html[data-theme=light]_&]:shadow-[0_0_0_4px_rgba(34,199,242,0.15)] transition resize-none"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-full py-2.5 rounded-2xl bg-[linear-gradient(90deg,#1FB6FF,#2D7FF9)] hover:brightness-105 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Review...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
