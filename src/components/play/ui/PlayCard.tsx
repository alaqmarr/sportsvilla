'use client';

import React from 'react';

export interface PlayCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'accent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantStyles: Record<NonNullable<PlayCardProps['variant']>, string> = {
  default: 'bg-play-surface border border-play-border rounded-play-xl shadow-play-sm',
  elevated: 'bg-play-surface border border-play-border rounded-play-xl shadow-play-md',
  interactive: 'bg-play-surface border border-play-border rounded-play-xl shadow-play-sm hover:shadow-play-md hover:border-play-brand/40 transition-all cursor-pointer',
  accent: 'bg-play-surface border-2 border-play-brand/30 rounded-play-xl shadow-play-sm hover:border-play-brand transition-all',
};

const paddingStyles: Record<NonNullable<PlayCardProps['padding']>, string> = {
  none: 'p-0',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export const PlayCard = React.forwardRef<HTMLDivElement, PlayCardProps>(
  ({ variant = 'default', padding = 'md', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${variantStyles[variant]} ${paddingStyles[padding]} text-play-text ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PlayCard.displayName = 'PlayCard';

export function PlayCardHeader({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-col space-y-1.5 pb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function PlayCardTitle({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`font-play text-lg sm:text-xl font-bold tracking-tight text-play-text ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function PlayCardDescription({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-play-text-muted ${className}`} {...props}>
      {children}
    </p>
  );
}

export function PlayCardContent({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`text-play-text ${className}`} {...props}>
      {children}
    </div>
  );
}

export function PlayCardFooter({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center pt-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
