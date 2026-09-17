import React from "react";
import { FiInbox } from "react-icons/fi";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`border border-dashed border-sv-border bg-sv-surface/40 rounded-sv-lg p-8 sm:p-12 text-center flex flex-col items-center justify-center transition-all ${className}`}
    >
      <div className="w-14 h-14 rounded-sv-md bg-sv-surface-raised border border-sv-border text-sv-text-muted flex items-center justify-center text-2xl mb-4 shadow-sv-sm">
        {icon || <FiInbox />}
      </div>

      <h4 className="text-base sm:text-lg font-bold text-sv-text font-sans tracking-tight mb-1">
        {title}
      </h4>

      {description && (
        <p className="text-xs sm:text-sm text-sv-text-muted max-w-md mx-auto mb-5 leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-1 flex items-center gap-3">{action}</div>}
    </div>
  );
}
