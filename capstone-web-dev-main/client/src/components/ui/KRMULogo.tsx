import React from 'react';

interface KRMULogoProps {
  variant?: 'light' | 'dark' | 'card';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const KRMULogo: React.FC<KRMULogoProps> = ({
  variant = 'dark',
  size = 'md',
  showTagline = true,
  className = '',
}) => {
  const isDark = variant === 'dark'; // for light backgrounds
  const isCard = variant === 'card';

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Emblem / Crest */}
      <div className="relative flex-shrink-0">
        <img
          src="/assets/krmu-crest.png"
          alt="KRMU Crest"
          className={`${iconSizes[size]} object-contain filter drop-shadow-sm`}
          onError={(e) => {
            // Fallback SVG if image not loaded
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Typography */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-tight ${
              isDark ? 'text-[#082B5C]' : isCard ? 'text-[#082B5C]' : 'text-white'
            } ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'}`}
          >
            K.R. MANGALAM
          </span>
        </div>
        <span
          className={`font-bold tracking-widest leading-tight ${
            isDark ? 'text-[#D32F2F]' : isCard ? 'text-[#D32F2F]' : 'text-red-400'
          } ${size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-xs' : 'text-[11px]'}`}
        >
          UNIVERSITY
        </span>
        {showTagline && (
          <span
            className={`text-[9px] font-semibold tracking-wider uppercase mt-0.5 ${
              isDark ? 'text-slate-500' : 'text-blue-200/80'
            }`}
          >
            THE COMPLETE WORLD
          </span>
        )}
      </div>
    </div>
  );
};

export default KRMULogo;
