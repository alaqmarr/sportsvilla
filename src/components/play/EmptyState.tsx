import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyState({ icon: Icon, title, description, actionText, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] w-full border border-dashed border-[var(--play-border)] rounded-[var(--play-radius-lg)] bg-[var(--play-surface)]/50">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--play-surface-alt)] mb-4 text-[var(--play-text-light)]">
        <Icon className="h-8 w-8" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-[var(--play-text)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--play-text-muted)] max-w-sm mb-6">{description}</p>
      
      {actionText && actionHref && (
        <Link href={actionHref} className="play-btn">
          {actionText}
        </Link>
      )}
    </div>
  );
}
