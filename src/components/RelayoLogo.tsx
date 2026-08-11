import React from 'react';

interface RelayoLogoProps {
  className?: string;
  onClick?: () => void;
  showIcon?: boolean;
}

export function RelayoLogo({ className = '', onClick, showIcon = false }: RelayoLogoProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Relayo home"
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`inline-flex items-center gap-1.5 cursor-pointer shrink-0 z-20 select-none ${className}`}
      onClick={onClick}
    >
      {showIcon && (
        <picture className="shrink-0 flex items-center">
          <source srcSet="/icon.avif" type="image/avif" />
          <source srcSet="/icon.webp" type="image/webp" />
          <img
            src="/icon.png"
            alt="Relayo logo icon"
            width="28"
            height="28"
            decoding="async"
            loading="eager"
            className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
          />
        </picture>
      )}
      <div className="inline-flex items-baseline">
        {/* "Relayo" with capital R in white using Product Sans / Google Sans font */}
        <span className="font-product-sans font-bold text-lg sm:text-xl md:text-2xl text-white [html[data-theme=light]_&]:text-[#1D1D1F] leading-none tracking-tight">
          Relayo
        </span>
        {/* ".space" in small font size using Martian Mono Google font in teal */}
        <span
          className="font-martian-mono font-semibold text-cyan-400 [html[data-theme=light]_&]:text-cyan-600 leading-none tracking-tight ml-0"
          style={{ fontSize: '0.45em' }}
        >
          .space
        </span>
      </div>
    </div>
  );
}
