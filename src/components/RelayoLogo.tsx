import React from 'react';

interface RelayoLogoProps {
  className?: string;
  onClick?: () => void;
}

export function RelayoLogo({ className = '', onClick }: RelayoLogoProps) {
  return (
    <div
      className={`inline-flex items-baseline cursor-pointer shrink-0 z-20 select-none ${className}`}
      onClick={onClick}
    >
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
  );
}
