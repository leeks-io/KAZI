import React from 'react';

/**
 * Custom Kazi Logo Component
 * Combines Location Pin + Speech Bubble icon (32px) in Terracotta & Ochre
 * with Space Grotesk wordmark featuring a geometric terracotta triangle for "A".
 */
export default function KaziLogo({ size = 32, onClick, className = "" }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 cursor-pointer group select-none ${className}`}
    >
      {/* Location Pin + Speech Bubble Custom SVG Icon (32px) */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transform group-hover:scale-105 transition-transform duration-200"
        >
          {/* Speech Bubble Base */}
          <path
            d="M20 4C11.163 4 4 10.716 4 19C4 22.84 5.66 26.335 8.44 28.92L6 36L13.8 33.72C15.68 34.54 17.78 35 20 35C28.837 35 36 28.284 36 20C36 11.716 28.837 4 20 4Z"
            fill="#E8632C"
          />
          {/* Location Pin Cutout Overlay */}
          <path
            d="M20 9C15.03 9 11 13.03 11 18C11 24.25 20 31 20 31C20 31 29 24.25 29 18C29 13.03 24.97 9 20 9ZM20 21.5C18.07 21.5 16.5 19.93 16.5 18C16.5 16.07 18.07 14.5 20 14.5C21.93 14.5 23.5 16.07 23.5 18C23.5 19.93 21.93 21.5 20 21.5Z"
            fill="#12102A"
          />
          {/* Ochre Soundwave Dot inside Pin */}
          <circle cx="20" cy="18" r="3.5" fill="#F2A03D" />
        </svg>
      </div>

      {/* KAZI Wordmark in Space Grotesk with Geometric Terracotta 'A' */}
      <div className="font-heading font-bold text-2xl md:text-3xl tracking-wider text-[#F5F0E8] flex items-center leading-none">
        <span>K</span>
        {/* Geometric Terracotta Triangle 'A' */}
        <span className="relative inline-flex items-center justify-center px-0.5 text-[#E8632C]">
          <svg width="22" height="24" viewBox="0 0 24 24" fill="none" className="inline-block">
            <path d="M12 2L22 22H2L12 2Z" fill="#E8632C" />
            <polygon points="12,10 7,19 17,19" fill="#12102A" />
          </svg>
        </span>
        <span>ZI</span>
      </div>
    </div>
  );
}
