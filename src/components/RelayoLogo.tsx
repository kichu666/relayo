import React from 'react';

interface RelayoLogoProps {
  className?: string;
  onClick?: () => void;
}

export function RelayoLogo({ className = '', onClick }: RelayoLogoProps) {
  return (
    <div
      className={`inline-flex items-baseline cursor-pointer shrink-0 z-20 select-none font-product-sans ${className}`}
      onClick={onClick}
    >
      {/* Lowercase white "relayo" in Product Sans / Google Sans font */}
      <span className="font-normal text-lg sm:text-xl text-white [html[data-theme=light]_&]:text-[#1D1D1F] leading-none tracking-tight">
        relayo
      </span>

      {/* Lowercase teal ".space" in a smaller font size */}
      <span className="font-medium text-xs sm:text-sm text-cyan-400 [html[data-theme=light]_&]:text-cyan-600 leading-none tracking-normal ml-0.5">
        .space
      </span>
    </div>
  );
}
