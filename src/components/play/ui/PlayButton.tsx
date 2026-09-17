'use client';

import React from 'react';

export type PlayButtonVariant =
  | 'brand'
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'athletic';

export type PlayButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon';

export interface PlayButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PlayButtonVariant;
  size?: PlayButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<PlayButtonVariant, string> = {
  brand: 'bg-play-brand hover:bg-play-brand-dark text-white font-semibold shadow-sm focus-visible:ring-2 focus-visible:ring-play-brand focus-visible:ring-offset-2',
  primary: 'bg-play-brand hover:bg-play-brand-dark text-white font-semibold shadow-sm focus-visible:ring-2 focus-visible:ring-play-brand focus-visible:ring-offset-2',
  accent: 'bg-play-accent hover:bg-play-accent-hover text-white font-semibold shadow-sm focus-visible:ring-2 focus-visible:ring-play-accent focus-visible:ring-offset-2',
  secondary: 'bg-play-surface border border-play-border hover:bg-play-surface-hover text-play-text font-medium shadow-sm focus-visible:ring-2 focus-visible:ring-play-border',
  outline: 'bg-transparent border border-play-brand text-play-brand hover:bg-play-brand/10 font-semibold focus-visible:ring-2 focus-visible:ring-play-brand',
  ghost: 'bg-transparent hover:bg-play-surface-hover text-play-text font-medium focus-visible:ring-2 focus-visible:ring-play-border',
  danger: 'bg-play-error hover:bg-play-error/90 text-white font-semibold shadow-sm focus-visible:ring-2 focus-visible:ring-play-error focus-visible:ring-offset-2',
  athletic: 'bg-gradient-to-r from-play-brand to-play-brand-dark hover:brightness-105 text-white font-bold shadow-play-md active:scale-[0.98]',
};

const sizeStyles: Record<PlayButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-play-md gap-1.5 h-8',
  md: 'text-sm px-4 py-2 rounded-play-md gap-2 h-10',
  lg: 'text-base px-5 py-2.5 rounded-play-lg gap-2.5 font-semibold h-12',
  xl: 'text-lg px-6 py-3.5 rounded-play-xl gap-3 font-bold h-14',
  icon: 'p-2 rounded-play-md h-10 w-10 justify-center',
};

export const PlayButton = React.forwardRef<HTMLButtonElement, PlayButtonProps>(
  (
    {
      variant = 'brand',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center font-play transition-all duration-100 select-none outline-none
          active:scale-[0.98]
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
          ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);
PlayButton.displayName = 'PlayButton';
