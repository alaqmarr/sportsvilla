'use client';

import React from 'react';
import Link from 'next/link';
import { PlayButton } from './PlayButton';

export interface PlayEmptyStateProps {
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  secondaryActionHref?: string;
  onSecondaryAction?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function PlayEmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  secondaryActionText,
  secondaryActionHref,
  onSecondaryAction,
  className = '',
  children,
}: PlayEmptyStateProps) {
  return (
    <div
      className={`w-full bg-play-surface border border-dashed border-play-border rounded-play-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center ${className}`}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-play-surface-subtle flex items-center justify-center text-play-brand mb-4 ring-8 ring-play-surface-subtle/50 shrink-0">
          <Icon className="w-8 h-8" />
        </div>
      )}

      <h3 className="font-play text-lg sm:text-xl font-bold tracking-tight text-play-text mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-play-text-muted max-w-sm mx-auto mb-6">
          {description}
        </p>
      )}

      {children}

      {(actionText || secondaryActionText) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          {actionText && (
            actionHref ? (
              <Link href={actionHref}>
                <PlayButton variant="brand" size="md">
                  {actionText}
                </PlayButton>
              </Link>
            ) : (
              <PlayButton variant="brand" size="md" onClick={onAction}>
                {actionText}
              </PlayButton>
            )
          )}

          {secondaryActionText && (
            secondaryActionHref ? (
              <Link href={secondaryActionHref}>
                <PlayButton variant="secondary" size="md">
                  {secondaryActionText}
                </PlayButton>
              </Link>
            ) : (
              <PlayButton variant="secondary" size="md" onClick={onSecondaryAction}>
                {secondaryActionText}
              </PlayButton>
            )
          )}
        </div>
      )}
    </div>
  );
}
