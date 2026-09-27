import React from 'react';

/**
 * Geometric pattern inspired by African Adire & Kente textile motifs.
 * Rendered with low opacity as background visual texture.
 */
export default function AfricanPattern({ className = "opacity-10" }) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      <defs>
        <pattern
          id="kente-adire-pattern"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          {/* Outer Diamond */}
          <path
            d="M 30 0 L 60 30 L 30 60 L 0 30 Z"
            fill="none"
            stroke="#E8632C"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          {/* Inner Diamond */}
          <path
            d="M 30 12 L 48 30 L 30 48 L 12 30 Z"
            fill="none"
            stroke="#F2A03D"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
          {/* Cross lines */}
          <line x1="30" y1="0" x2="30" y2="60" stroke="#E8632C" strokeWidth="0.75" strokeOpacity="0.25" />
          <line x1="0" y1="30" x2="60" y2="30" stroke="#E8632C" strokeWidth="0.75" strokeOpacity="0.25" />
          {/* Diagonal Corner Hatching */}
          <line x1="0" y1="0" x2="15" y2="15" stroke="#F5F0E8" strokeWidth="0.75" strokeOpacity="0.3" />
          <line x1="60" y1="0" x2="45" y2="15" stroke="#F5F0E8" strokeWidth="0.75" strokeOpacity="0.3" />
          <line x1="0" y1="60" x2="15" y2="45" stroke="#F5F0E8" strokeWidth="0.75" strokeOpacity="0.3" />
          <line x1="60" y1="60" x2="45" y2="45" stroke="#F5F0E8" strokeWidth="0.75" strokeOpacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#kente-adire-pattern)" />
    </svg>
  );
}
