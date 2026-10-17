import React, { useState } from 'react';

const PRIMARY_LOGO = '/logo.png';
const FALLBACK_LOGO =
  'https://res.cloudinary.com/icgawsqe/image/upload/v1791987344/IMG-20261008-WA0059.jpg';

export const DNALoader: React.FC = () => {
  const [logoSrc, setLogoSrc] = useState(PRIMARY_LOGO);
  const [loadError, setLoadError] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center space-y-2 select-none" id="dna-loader">
      <div className="relative w-14 h-14 flex items-center justify-center overflow-visible">
        {/* Animated Double Helix SVG */}
        <svg 
          width="56" 
          height="56" 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 animate-[dnaRotate_5s_linear_infinite]"
        >
          <style>{`
            @keyframes dnaRotate {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes dotPulse {
              0%, 100% { transform: scale(0.4); opacity: 0.3; }
              50% { transform: scale(1.15); opacity: 1; }
            }
            .dna-dot-1 {
              animation: dotPulse 1.6s ease-in-out infinite;
              fill: #C84B0E;
            }
            .dna-dot-2 {
              animation: dotPulse 1.6s ease-in-out infinite;
              animation-delay: -0.8s;
              fill: #FFFFFF;
            }
            .dna-rung {
              stroke: rgba(245, 166, 35, 0.35);
              stroke-width: 2.5;
            }
          `}</style>
          
          {[...Array(6)].map((_, i) => {
            const angle = (i * Math.PI) / 6;
            const r = 38; // strand radius
            const cx = 50;
            const cy = 50;
            const delay = (-(i * 0.26)).toFixed(2);
            
            return (
              <g key={i}>
                {/* Rung line */}
                <line 
                  x1={cx - Math.cos(angle) * r} 
                  y1={cy - Math.sin(angle) * r} 
                  x2={cx + Math.cos(angle) * r} 
                  y2={cy + Math.sin(angle) * r} 
                  className="dna-rung" 
                />
                {/* Dot 1 */}
                <circle 
                  cx={cx - Math.cos(angle) * r} 
                  cy={cy - Math.sin(angle) * r} 
                  r="5" 
                  className="dna-dot-1"
                  style={{ animationDelay: `${delay}s` }}
                />
                {/* Dot 2 */}
                <circle 
                  cx={cx + Math.cos(angle) * r} 
                  cy={cy + Math.sin(angle) * r} 
                  r="5" 
                  className="dna-dot-2"
                  style={{ animationDelay: `${(parseFloat(delay) - 0.8).toFixed(2)}s` }}
                />
              </g>
            );
          })}
        </svg>

        {/* Center Council Logo Emblem */}
        <div className="relative z-10 w-7 h-7 rounded-full overflow-hidden p-0.5 bg-[#050B18] border border-orange-burnt/40 shadow-md flex items-center justify-center">
          {!loadError ? (
            <img
              src={logoSrc}
              alt="TGPCOP Logo"
              width={28}
              height={28}
              className="w-full h-full object-cover rounded-full"
              loading="eager"
              onError={() => {
                if (logoSrc === '/logo.png') {
                  setLogoSrc('/logo.jpg');
                } else {
                  setLoadError(true);
                }
              }}
            />
          ) : (
            <span className="text-[7px] font-extrabold text-orange-burnt tracking-tighter">
              TGP
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DNALoader;
