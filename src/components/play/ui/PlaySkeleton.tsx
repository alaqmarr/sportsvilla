'use client';

import React from 'react';

export interface PlaySkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text' | 'card';
  width?: string | number;
  height?: string | number;
}

const variantStyles: Record<NonNullable<PlaySkeletonProps['variant']>, string> = {
  rectangular: 'rounded-play-md',
  circular: 'rounded-full',
  text: 'rounded-play-sm h-4 w-full',
  card: 'rounded-play-xl border border-play-border p-6',
};

export function PlaySkeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
  style,
  ...props
}: PlaySkeletonProps) {
  const dynamicStyle: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  };

  return (
    <div
      className={`bg-play-surface-subtle animate-pulse ${variantStyles[variant]} ${className}`}
      style={dynamicStyle}
      aria-hidden="true"
      {...props}
    />
  );
}
