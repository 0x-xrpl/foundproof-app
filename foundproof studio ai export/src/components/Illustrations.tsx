import React from 'react';

const TealBlob1 = () => <path d="M30 100 C 30 30, 170 10, 180 90 C 190 170, 100 190, 30 100 Z" fill="#A0E8DF" />;
const TealBlob2 = () => <path d="M100 20 C 180 20, 190 100, 150 170 C 110 240, 20 180, 20 100 C 20 20, 100 20, 100 20 Z" fill="#A0E8DF" />;

export const IllLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none">
    <TealBlob1 />
    <circle cx="90" cy="90" r="40" stroke="#172B2A" strokeWidth="8" />
    <path d="M120 120 L 160 160" stroke="#172B2A" strokeWidth="12" strokeLinecap="round" />
    <path d="M70 90 L 85 105 L 110 75" stroke="#172B2A" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IllFind = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none">
    <TealBlob2 />
    <rect x="50" y="40" width="100" height="120" rx="16" stroke="#172B2A" strokeWidth="6" />
    <path d="M70 70 L 130 70 M 70 100 L 110 100 M 70 130 L 90 130" stroke="#172B2A" strokeWidth="6" strokeLinecap="round" />
    <circle cx="130" cy="130" r="24" fill="white" stroke="#64CCC5" strokeWidth="6" />
    <path d="M120 130 L 140 130 M 130 120 L 130 140" stroke="#64CCC5" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

export const IllHandoff = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none">
    <TealBlob1 />
    <path d="M50 120 C 50 120, 70 140, 100 140 C 130 140, 150 120, 150 120" stroke="#172B2A" strokeWidth="6" strokeLinecap="round" />
    <path d="M70 100 L 100 130 L 130 100" stroke="#172B2A" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="75" y="50" width="50" height="60" rx="8" fill="white" stroke="#64CCC5" strokeWidth="6" />
    <path d="M90 70 L 110 70 M 90 90 L 100 90" stroke="#64CCC5" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

export const IllWallet = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none">
    <TealBlob2 />
    <rect x="50" y="80" width="100" height="70" rx="12" stroke="#172B2A" strokeWidth="6" />
    <path d="M50 110 L 150 110" stroke="#172B2A" strokeWidth="6" />
    <rect x="85" y="115" width="30" height="24" rx="6" fill="white" stroke="#64CCC5" strokeWidth="6" />
    <path d="M95 115 L 95 95 C 95 85, 115 85, 115 95" stroke="#64CCC5" strokeWidth="6" strokeLinecap="round" />
    <circle cx="100" cy="127" r="3" fill="#64CCC5" />
  </svg>
);

export const IllCamera = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none">
    <TealBlob1 />
    <rect x="40" y="55" width="120" height="90" rx="14" stroke="#172B2A" strokeWidth="6" />
    <circle cx="100" cy="100" r="22" stroke="#172B2A" strokeWidth="6" />
    <path d="M70 55 L 80 35 L 120 35 L 130 55" stroke="#172B2A" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="140" cy="75" r="4" fill="#172B2A" />
  </svg>
);

export const IllScan = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" shapeRendering="geometricPrecision">
    <TealBlob2 />
    <circle cx="100" cy="100" r="18" stroke="#172B2A" strokeWidth="6" />
    <path d="M118 118 L 136 136" stroke="#172B2A" strokeWidth="8" strokeLinecap="round" />
    <path d="M50 70 L 50 50 L 70 50 M 130 50 L 150 50 L 150 70 M 150 130 L 150 150 L 130 150 M 70 150 L 50 150 L 50 130" stroke="#172B2A" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

export const IllProof = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none">
    <TealBlob1 />
    <rect x="60" y="40" width="80" height="120" rx="8" stroke="#172B2A" strokeWidth="6" />
    <path d="M75 65 L 125 65 M 75 90 L 125 90 M 75 115 L 100 115" stroke="#172B2A" strokeWidth="6" strokeLinecap="round" />
    <circle cx="135" cy="135" r="20" stroke="#64CCC5" strokeWidth="6" fill="white" />
    <path d="M127 135 L 133 141 L 143 129" stroke="#64CCC5" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IllBlockchain = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none">
    <TealBlob2 />
    <rect x="30" y="80" width="40" height="40" rx="4" stroke="#172B2A" strokeWidth="6" />
    <rect x="130" y="80" width="40" height="40" rx="4" stroke="#172B2A" strokeWidth="6" />
    <path d="M70 100 L 130 100" stroke="#172B2A" strokeWidth="6" strokeLinecap="round" strokeDasharray="8 8" />
    <circle cx="100" cy="100" r="10" fill="#64CCC5" stroke="#172B2A" strokeWidth="4" />
  </svg>
);

export const IllMap = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none">
    <TealBlob1 />
    <path d="M40 40 L 160 40 L 160 160 L 40 160 Z" stroke="#172B2A" strokeWidth="6" strokeLinejoin="round" />
    <path d="M80 40 L 80 160 M 120 40 L 120 160" stroke="#172B2A" strokeWidth="4" strokeDasharray="6 6" />
    <path d="M100 120 C 100 120, 130 90, 130 70 C 130 50, 115 35, 100 35 C 85 35, 70 50, 70 70 C 70 90, 100 120, 100 120 Z" stroke="#172B2A" strokeWidth="6" strokeLinejoin="round" fill="white" />
    <circle cx="100" cy="70" r="10" fill="#64CCC5" />
  </svg>
);
