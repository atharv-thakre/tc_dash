import React from 'react';
import { KeyRound } from 'lucide-react';

interface TcAuthLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  version?: string;
  className?: string;
  onClick?: () => void;
}

export const TcAuthLogo: React.FC<TcAuthLogoProps> = ({
  size = 'md',
  showBadge = true,
  version = 'v1.5.0',
  className = '',
  onClick,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-11 h-11 rounded-2xl',
  }[size];

  const keyIconDimensions = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  const textDimensions = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  }[size];

  const badgeDimensions = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Purple Gradient Squircle Icon with Key */}
      <div
        className={`relative shrink-0 flex items-center justify-center bg-gradient-to-br from-[#8d54ff] via-[#7537f5] to-[#5c1de6] shadow-md shadow-indigo-900/30 border border-violet-400/25 group-hover:scale-105 transition-transform text-white ${iconDimensions}`}
      >
        <KeyRound className={`${keyIconDimensions} text-white stroke-[2.2]`} />
      </div>

      {/* Brand Name Text: "tc" + "-" + "auth" */}
      <div className="flex items-center gap-2.5">
        <span className={`font-black tracking-tight text-white leading-none ${textDimensions}`}>
          tc<span className="text-[#3b82f6] dark:text-[#4f75ff] px-[1px]">-</span>auth
        </span>

        {/* Version Badge Box */}
        {showBadge && (
          <span
            className={`font-mono font-semibold tracking-wide text-[#8fa0f8] bg-[#141834] border border-[#2a356b] rounded-lg shadow-2xs leading-none whitespace-nowrap ${badgeDimensions}`}
          >
            {version}
          </span>
        )}
      </div>
    </div>
  );
};
