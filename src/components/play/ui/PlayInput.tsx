'use client';

import React from 'react';

export interface PlayInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const PlayInput = React.forwardRef<HTMLInputElement, PlayInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      disabled,
      className = '',
      containerClassName = '',
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`w-full flex flex-col space-y-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-play-text-secondary select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-play-text-muted">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`w-full font-play text-sm text-play-text bg-play-surface border rounded-play-md h-11 transition-all outline-none
              placeholder:text-play-text-muted
              ${leftIcon ? 'pl-10' : 'pl-3.5'}
              ${rightIcon ? 'pr-10' : 'pr-3.5'}
              ${
                error
                  ? 'border-play-error focus:border-play-error focus:ring-1 focus:ring-play-error'
                  : 'border-play-border focus:border-play-brand focus:ring-1 focus:ring-play-brand'
              }
              ${disabled ? 'bg-play-surface-subtle text-play-text-muted cursor-not-allowed opacity-75' : ''}
              ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-play-text-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-play-error font-medium mt-1 flex items-center gap-1">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-play-text-muted mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
PlayInput.displayName = 'PlayInput';
