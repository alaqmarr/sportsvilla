'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface PlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  noPadding?: boolean;
  className?: string;
  showCloseButton?: boolean;
}

const sizeClasses: Record<NonNullable<PlayModalProps['size']>, string> = {
  sm: 'md:max-w-sm',
  md: 'md:max-w-md',
  lg: 'md:max-w-lg',
  xl: 'md:max-w-2xl',
  full: 'md:max-w-4xl',
};

export function PlayModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  noPadding = false,
  className = '',
  showCloseButton = true,
}: PlayModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal / Bottom Sheet Window */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full bg-play-surface text-play-text flex flex-col shadow-play-xl
          max-h-[90vh] rounded-t-play-xl border-t border-play-border
          md:rounded-play-xl md:border md:border-play-border md:my-8 md:max-h-[85vh]
          ${sizeClasses[size]}
          ${className}`}
      >
        {/* Mobile Pull Handle */}
        <div className="md:hidden pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-play-border-strong rounded-full" />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between px-5 pt-3 pb-3 sm:px-6 border-b border-play-border shrink-0">
            <div>
              {title && (
                <h3 className="font-play text-lg sm:text-xl font-bold tracking-tight text-play-text">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs sm:text-sm text-play-text-muted mt-0.5">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 -mr-1.5 text-play-text-muted hover:text-play-text hover:bg-play-surface-hover rounded-play-md transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body Content */}
        <div
          className={`flex-1 overflow-y-auto ${
            noPadding ? '' : 'p-5 sm:p-6'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
