import React from 'react';

interface LeadNoriaLogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

export const LeadNoriaLogo: React.FC<LeadNoriaLogoProps> = ({
  size = 24,
  className = '',
  showWordmark = false,
  wordmarkClassName = ''
}) => {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`} aria-label="LeadNoria">
      {/* LeadNoria Geometric Icon Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Background rounded container */}
        <rect width="100" height="100" rx="22" fill="#0F172A" />
        
        {/* Outer continuous circular research loop (orbit of public signals) */}
        <circle cx="50" cy="50" r="38" stroke="#334155" strokeWidth="2.5" strokeDasharray="4 4" opacity="0.7" />
        
        {/* Abstract "N" Continuous Layered Signal Flow */}
        <path
          d="M 30 72 L 30 28 C 30 25 34 24 36 27 L 64 73 C 66 76 70 75 70 72 L 70 28"
          stroke="url(#leadnoria-flow-icon)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Signal nodes: Discovery, Layered Evidence, Verified Lead */}
        <circle cx="30" cy="72" r="5" fill="#A78BFA" />
        <circle cx="50" cy="50" r="4" fill="#F8FAFC" />
        <circle cx="70" cy="28" r="5" fill="#8B5CF6" />

        {/* Muted purple accent flow arcs */}
        <path d="M 24 38 A 38 38 0 0 1 76 38" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
        <path d="M 76 62 A 38 38 0 0 1 24 62" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />

        <defs>
          <linearGradient id="leadnoria-flow-icon" x1="28" y1="72" x2="72" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="50%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#F8FAFC" />
          </linearGradient>
        </defs>
      </svg>

      {showWordmark && (
        <span className={`font-bold tracking-tight text-white ${wordmarkClassName}`}>
          Lead<span className="text-purple-400">Noria</span>
        </span>
      )}
    </div>
  );
};
