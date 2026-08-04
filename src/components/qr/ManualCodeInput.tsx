import React, { useState, useRef } from 'react';
import { ArrowRight, Key } from 'lucide-react';

interface ManualCodeInputProps {
  onSubmit: (pin: string) => void;
}

export const ManualCodeInput: React.FC<ManualCodeInputProps> = ({ onSubmit }) => {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every((d) => d !== '') && index === 5) {
      onSubmit(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = Array(6).fill('');
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);

    if (pasted.length === 6) {
      onSubmit(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const isComplete = digits.every((d) => d !== '');

  return (
    <div className="flex flex-col items-center w-full max-w-xs mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
        <Key className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-white mb-1">Enter 6-Digit Pair PIN</h3>
      <p className="text-xs text-slate-400 mb-5 text-center">
        Type the numeric PIN code shown under the sender's QR code.
      </p>

      <div className="flex gap-2 mb-6">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className="w-10 h-12 text-center text-lg font-mono font-bold bg-white/5 border border-white/15 focus:border-cyan-400 focus:bg-cyan-500/10 rounded-xl text-white outline-none transition-all"
          />
        ))}
      </div>

      <button
        disabled={!isComplete}
        onClick={() => onSubmit(digits.join(''))}
        className={`w-full py-2.5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
          isComplete
            ? 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white cursor-pointer'
            : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
        }`}
      >
        <span>Connect Device</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
