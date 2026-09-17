'use client';

import React from 'react';

export type PlayBadgeVariant =
  | 'brand'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

export type PlayBadgeSize = 'sm' | 'md';

export interface PlayBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: PlayBadgeVariant;
  size?: PlayBadgeSize;
  dot?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<PlayBadgeVariant, string> = {
  brand: 'bg-play-brand/10 text-play-brand-dark border-play-brand/20',
  accent: 'bg-play-accent/10 text-play-accent-hover border-play-accent/20',
  success: 'bg-play-success-subtle text-play-success-text border-play-success-border',
  warning: 'bg-play-warning-subtle text-play-warning-text border-play-warning-border',
  error: 'bg-play-error-subtle text-play-error-text border-play-error-border',
  info: 'bg-play-info-subtle text-play-info-text border-play-info-border',
  neutral: 'bg-play-surface-subtle text-play-text-secondary border-play-border',
};

const dotColors: Record<PlayBadgeVariant, string> = {
  brand: 'bg-play-brand',
  accent: 'bg-play-accent',
  success: 'bg-play-status-success',
  warning: 'bg-play-status-warning',
  error: 'bg-play-status-error',
  info: 'bg-play-status-info',
  neutral: 'bg-play-text-muted',
};

const sizeStyles: Record<PlayBadgeSize, string> = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
};

export const PlayBadge = React.forwardRef<HTMLSpanElement, PlayBadgeProps>(
  (
    {
      variant = 'neutral',
      size = 'md',
      dot = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={`inline-flex items-center font-play font-semibold uppercase tracking-wider rounded-play-pill border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {dot && (
          <span
            className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColors[variant]}`}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);
PlayBadge.displayName = 'PlayBadge';
