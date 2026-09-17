import React from "react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  statusBadge?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  statusBadge,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`space-y-3 pb-6 border-b border-sv-border-subtle ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-sv-text-muted overflow-x-auto styled-scrollbar pb-0.5"
        >
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;

            return (
              <React.Fragment key={`${crumb.label}-${idx}`}>
                {idx > 0 && (
                  <FiChevronRight className="text-sv-text-muted/60 text-[10px] flex-shrink-0" />
                )}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-sv-brand transition-colors truncate max-w-[150px] font-medium"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={`truncate max-w-[200px] ${
                      isLast ? "text-sv-text font-semibold" : ""
                    }`}
                  >
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-sv-text font-sans tracking-tight truncate">
              {title}
            </h1>
            {statusBadge && <div className="flex-shrink-0">{statusBadge}</div>}
          </div>

          {subtitle && (
            <p className="text-xs sm:text-sm text-sv-text-muted max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
