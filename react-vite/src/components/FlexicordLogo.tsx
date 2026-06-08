import React from 'react';

interface FlexicordLogoProps {
  className?: string;
  size?: number;
}

export default function FlexicordLogo({ className = '', size = 32 }: FlexicordLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 ${className}`}
    >
      <defs>
        {/* Teal gradient matching the user's logo for Light Theme */}
        <linearGradient id="flexicord-grad-light" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#115e59" /> {/* dark teal */}
          <stop offset="35%" stopColor="#0d9488" /> {/* medium teal */}
          <stop offset="70%" stopColor="#0891b2" /> {/* bright cyan */}
          <stop offset="100%" stopColor="#2563eb" /> {/* deep brand blue */}
        </linearGradient>

        {/* Glowing gradient for Dark Theme */}
        <linearGradient id="flexicord-grad-dark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" /> {/* bright teal */}
          <stop offset="50%" stopColor="#22d3ee" /> {/* vibrant cyan */}
          <stop offset="100%" stopColor="#3b82f6" /> {/* sky blue */}
        </linearGradient>

        <filter id="flexicord-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
        
        <filter id="flexicord-shadow-dark" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#22d3ee" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Main vector representation of the interlinked graphic of Flexicord: f-ring-c shapes */}
      <g className="filter drop-shadow-sm dark:drop-shadow-[0_0_12px_rgba(34,211,238,0.2)]">
        {/* Main Ribbon path loop corresponding to flowy interlocked "f" and "c" */}
        <path
          d="M 50 115 
             C 40 115, 34 107, 34 96 
             C 34 78, 48 45, 68 45 
             C 78 45, 84 54, 76 68
             C 65 88, 54 110, 68 110
             C 80 110, 94 98, 108 85
             C 122 72, 126 58, 116 48
             C 106 38, 90 48, 80 60
             C 70 72, 60 90, 72 102
             C 80 110, 96 112, 112 103"
          stroke="url(#flexicord-grad-light)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300 dark:stroke-[url(#flexicord-grad-dark)]"
        />

        {/* Inner Ring (the loop in the center right) */}
        <path
          d="M 102 78 
             A 18 18 0 1 1 84 56"
          stroke="url(#flexicord-grad-light)"
          strokeWidth="10"
          strokeLinecap="round"
          className="transition-all duration-300 dark:stroke-[url(#flexicord-grad-dark)]"
        />

        {/* Right side opening curve ('c' element) */}
        <path
          d="M 125 58 
             C 130 65, 128 85, 116 100 
             C 106 112, 92 118, 78 116"
          stroke="url(#flexicord-grad-light)"
          strokeWidth="10"
          strokeLinecap="round"
          className="transition-all duration-300 dark:stroke-[url(#flexicord-grad-dark)]"
        />
      </g>
    </svg>
  );
}
