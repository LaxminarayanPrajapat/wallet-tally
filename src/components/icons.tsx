import { type LucideProps } from 'lucide-react';

export const Icons = {
  Logo: (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      {...props}
    >
      <defs>
        <linearGradient id="wallet-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>
      </defs>
      
      {/* Main Wallet Body with prominent white outline */}
      <rect 
        x="32" 
        y="96" 
        width="448" 
        height="320" 
        rx="48" 
        fill="url(#wallet-logo-gradient)" 
        stroke="white"
        strokeWidth="12"
      />

      {/* Top Slot/Stitch Line */}
      <path 
        d="M32 180H480" 
        stroke="white" 
        strokeWidth="4" 
        strokeOpacity="0.4" 
        strokeDasharray="12 8"
      />

      {/* Wrap-around Flap with prominent white outline */}
      <rect 
        x="280" 
        y="186" 
        width="232" 
        height="108" 
        rx="36" 
        fill="url(#wallet-logo-gradient)" 
        stroke="white"
        strokeWidth="12"
      />

      {/* Clasp Button (White Outer) */}
      <circle 
        cx="430" 
        cy="240" 
        r="34" 
        fill="white" 
      />

      {/* Clasp Button (Inner Inset) with subtle white outline */}
      <circle 
        cx="430" 
        cy="240" 
        r="14" 
        fill="url(#wallet-logo-gradient)" 
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  ),
};
