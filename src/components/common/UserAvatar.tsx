import React, { useState, useEffect } from 'react';
import { getCustomBaseUrl } from '../../services/apiClient';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs rounded-lg',
    md: 'w-9 h-9 text-xs rounded-xl',
    lg: 'w-12 h-12 text-base rounded-2xl',
    xl: 'w-20 h-20 text-2xl rounded-2xl',
  };

  const initial = name && name.trim() ? name.trim().charAt(0).toUpperCase() : 'U';

  let fullSrc = src?.trim();
  if (fullSrc && !fullSrc.startsWith('http://') && !fullSrc.startsWith('https://') && !fullSrc.startsWith('data:')) {
    const baseUrl = getCustomBaseUrl();
    if (baseUrl && (baseUrl.startsWith('http://') || baseUrl.startsWith('https://'))) {
      try {
        const origin = new URL(baseUrl).origin;
        fullSrc = `${origin}${fullSrc.startsWith('/') ? '' : '/'}${fullSrc}`;
      } catch {
        // fallback
      }
    }
  }

  if (fullSrc && !hasError) {
    return (
      <img
        src={fullSrc}
        alt={name || 'User Avatar'}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={`${sizeClasses[size]} object-cover border border-zinc-800/80 shadow-2xs ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold flex items-center justify-center uppercase shadow-2xs border border-indigo-400/30 shrink-0 ${className}`}
    >
      {initial}
    </div>
  );
};
