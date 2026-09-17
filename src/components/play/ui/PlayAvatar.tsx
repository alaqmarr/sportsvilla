'use client';

import React, { useState } from 'react';

export type PlayAvatarSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type PlayAvatarStatus = 'online' | 'offline' | 'busy';

export interface PlayAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: PlayAvatarSize;
  status?: PlayAvatarStatus;
  className?: string;
}

const sizeStyles: Record<PlayAvatarSize, { container: string; text: string; dot: string }> = {
  sm: {
    container: 'w-8 h-8',
    text: 'text-xs',
    dot: 'w-2 h-2 bottom-0 right-0 ring-1',
  },
  md: {
    container: 'w-10 h-10',
    text: 'text-sm',
    dot: 'w-2.5 h-2.5 bottom-0 right-0 ring-2',
  },
  lg: {
    container: 'w-12 h-12',
    text: 'text-base',
    dot: 'w-3 h-3 bottom-0.5 right-0.5 ring-2',
  },
  xl: {
    container: 'w-16 h-16',
    text: 'text-xl',
    dot: 'w-3.5 h-3.5 bottom-1 right-1 ring-2',
  },
  '2xl': {
    container: 'w-20 h-20',
    text: 'text-2xl',
    dot: 'w-4 h-4 bottom-1 right-1 ring-2',
  },
};

const statusStyles: Record<PlayAvatarStatus, string> = {
  online: 'bg-play-status-success',
  offline: 'bg-play-text-muted',
  busy: 'bg-play-status-error',
};

function getInitials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function PlayAvatar({
  src,
  name,
  size = 'md',
  status,
  className = '',
}: PlayAvatarProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const sizeConfig = sizeStyles[size];
  const initials = getInitials(name);

  const showImage = src && !hasImageError;

  return (
    <div className={`relative inline-flex shrink-0 ${sizeConfig.container} ${className}`}>
      <div
        className={`w-full h-full rounded-full ring-2 ring-play-border overflow-hidden bg-play-surface-subtle flex items-center justify-center font-play font-bold text-play-text-secondary select-none ${sizeConfig.text}`}
      >
        {showImage ? (
          <img
            src={src}
            alt={name || 'Avatar'}
            onError={() => setHasImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {status && (
        <span
          className={`absolute rounded-full ring-play-surface ${sizeConfig.dot} ${statusStyles[status]}`}
          aria-label={status}
        />
      )}
    </div>
  );
}
