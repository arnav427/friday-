import React from 'react';

interface FridayLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  className?: string;
  animate?: boolean;
}

export const FridayLogo: React.FC<FridayLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
  animate = false,
}) => {
  // Determine pixel sizes
  let dimension = 40;
  if (typeof size === 'number') {
    dimension = size;
  } else {
    switch (size) {
      case 'xs':
        dimension = 24;
        break;
      case 'sm':
        dimension = 32;
        break;
      case 'md':
        dimension = 42;
        break;
      case 'lg':
        dimension = 64;
        break;
      case 'xl':
        dimension = 110;
        break;
    }
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* SVG Emblem: Stylized neon geometric 'F' wearing a graduation cap */}
      <div
        style={{ width: dimension, height: dimension }}
        className={`relative shrink-0 flex items-center justify-center ${
          animate ? 'hover:scale-105 transition-transform duration-300' : ''
        }`}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_16px_rgba(139,92,246,0.6)]"
        >
          <defs>
            {/* Primary Neon Violet to Cyan Linear Gradient */}
            <linearGradient id="fridayFGrad" x1="20" y1="30" x2="180" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="30%" stopColor="#9333EA" />
              <stop offset="65%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>

            {/* Mortarboard Cap Gradient */}
            <linearGradient id="fridayCapGrad" x1="40" y1="10" x2="160" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="45%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>

            {/* Glowing Accent Highlights */}
            <linearGradient id="fridayGlowEdge" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E0E7FF" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#C084FC" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.8" />
            </linearGradient>

            {/* Cap Headband / Underside gradient */}
            <linearGradient id="capBandGrad" x1="70" y1="55" x2="130" y2="75" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4C1D95" />
              <stop offset="100%" stopColor="#1E1B4B" />
            </linearGradient>

            {/* Filter for subtle neon bloom */}
            <filter id="neonBloom" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* BACKGROUND FAINT GLOW CIRCLING EMBLEM */}
          <circle cx="100" cy="100" r="85" fill="#6366F1" opacity="0.06" filter="url(#neonBloom)" />

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 1. STYLIZED GEOMETRIC "F" BODY                                  */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* Top horizontal beam of F */}
          <path
            d="M 52 74 L 146 74 C 152 74 156 78 153 84 L 140 102 C 138 105 134 107 130 107 L 85 107 L 76 122 L 126 122 C 132 122 136 126 133 132 L 122 148 C 120 151 116 153 112 153 L 73 153 L 56 182 C 54 186 50 188 46 187 L 34 183 C 30 182 28 178 30 174 L 62 82 C 64 77 68 74 73 74 Z"
            fill="url(#fridayFGrad)"
          />

          {/* Left Wing / Angular hook of the top bar matching artwork */}
          <path
            d="M 52 74 L 38 98 C 34 105 34 114 38 120 L 46 132 L 57 114 L 52 104 C 50 100 50 95 53 90 L 63 74 Z"
            fill="url(#fridayFGrad)"
            opacity="0.95"
          />

          {/* Inner Sharp Highlight Line along the top of F */}
          <path
            d="M 54 77 L 145 77 L 133 94 L 84 94 L 71 116"
            stroke="url(#fridayGlowEdge)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* Middle bar bottom highlight */}
          <path
            d="M 76 124 L 125 124 L 115 139 L 75 139"
            stroke="url(#fridayGlowEdge)"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 2. GRADUATION CAP (MORTARBOARD) SITTING ON TOP OF "F"           */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* Cap Skull Base (under the diamond board) */}
          <path
            d="M 78 48 C 78 48 86 64 100 64 C 114 64 122 48 122 48 L 130 54 C 130 68 116 75 100 75 C 84 75 70 68 70 54 Z"
            fill="url(#capBandGrad)"
            stroke="#8B5CF6"
            strokeWidth="1.5"
          />

          {/* Diamond Mortarboard Top */}
          <polygon
            points="100,18 165,48 100,68 35,48"
            fill="url(#fridayCapGrad)"
            stroke="url(#fridayGlowEdge)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Mortarboard Central Button */}
          <circle cx="100" cy="45" r="4" fill="#E0E7FF" />
          <circle cx="100" cy="45" r="2.5" fill="#38BDF8" />

          {/* Hanging Tassel Ribbon */}
          <path
            d="M 100 45 Q 130 45 138 58 Q 142 66 142 84"
            stroke="#67E8F9"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Tassel Head & Brush */}
          <ellipse cx="142" cy="85" rx="3" ry="4" fill="#A855F7" />
          <path
            d="M 139 88 L 138 108 L 146 108 L 145 88 Z"
            fill="#38BDF8"
            stroke="#22D3EE"
            strokeWidth="0.8"
          />

          {/* Subtle Cyber Grid Accent Marks in background */}
          <line x1="168" y1="88" x2="190" y2="88" stroke="#8B5CF6" strokeWidth="1" opacity="0.3" />
          <line x1="178" y1="84" x2="178" y2="92" stroke="#8B5CF6" strokeWidth="1" opacity="0.3" />
          <line x1="10" y1="140" x2="28" y2="140" stroke="#22D3EE" strokeWidth="1" opacity="0.3" />
        </svg>
      </div>

      {/* Typography: "FRIDAY" and "AI STUDY COMPANION" */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-cyan-200 tracking-wider text-lg leading-tight">
            FRIDAY
          </div>
          <div className="text-[9px] font-bold tracking-[0.22em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-300 to-violet-300 font-sans mt-0.5">
            AI STUDY COMPANION
          </div>
        </div>
      )}
    </div>
  );
};
