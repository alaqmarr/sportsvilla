import React, { forwardRef } from "react";
import { FiTrendingUp, FiTrendingDown, FiMinus } from "react-icons/fi";

export type StatVariant = "default" | "brand" | "success" | "warning" | "info" | "purple";

export interface StatTrend {
  value: string | number;
  direction?: "up" | "down" | "neutral";
  label?: string;
}

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: StatTrend;
  variant?: StatVariant;
  subtext?: string;
}

const variantStyles: Record<
  StatVariant,
  {
    iconBg: string;
    glowBg: string;
  }
> = {
  default: {
    iconBg: "bg-sv-surface-raised text-sv-text-secondary border-sv-border",
    glowBg: "bg-sv-surface-hover/30",
  },
  brand: {
    iconBg: "bg-sv-brand-subtle text-sv-brand border-sv-brand/30",
    glowBg: "bg-sv-brand/10",
  },
  success: {
    iconBg: "bg-sv-success-subtle text-sv-success-text border-sv-success-border",
    glowBg: "bg-sv-success/10",
  },
  warning: {
    iconBg: "bg-sv-warning-subtle text-sv-warning-text border-sv-warning-border",
    glowBg: "bg-sv-warning/10",
  },
  info: {
    iconBg: "bg-sv-info-subtle text-sv-info-text border-sv-info-border",
    glowBg: "bg-sv-info/10",
  },
  purple: {
    iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    glowBg: "bg-purple-500/10",
  },
};

export const Stat = forwardRef<HTMLDivElement, StatProps>(
  (
    {
      label,
      value,
      icon,
      trend,
      variant = "default",
      subtext,
      className = "",
      ...props
    },
    ref
  ) => {
    const config = variantStyles[variant] || variantStyles.default;

    return (
      <div
        ref={ref}
        className={`bg-sv-surface border border-sv-border rounded-sv-lg p-5 sm:p-6 relative overflow-hidden shadow-sv-sm transition-all duration-sv-normal hover:shadow-sv-md hover:border-sv-border-focus group ${className}`}
        {...props}
      >
        {/* Ambient background glow */}
        <div
          className={`absolute -right-6 -top-6 w-28 h-28 rounded-full blur-2xl transition-all duration-sv-slow group-hover:scale-125 ${config.glowBg}`}
          aria-hidden="true"
        />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-sv-text-muted truncate block">
              {label}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-sv-text font-sans tracking-tight truncate">
              {value}
            </div>
          </div>

          {icon && (
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-sv-md flex items-center justify-center text-lg sm:text-xl border flex-shrink-0 transition-transform duration-sv-normal group-hover:scale-105 ${config.iconBg}`}
            >
              {icon}
            </div>
          )}
        </div>

        {(trend || subtext) && (
          <div className="relative z-10 mt-3 pt-3 border-t border-sv-border-subtle flex items-center justify-between text-xs text-sv-text-muted gap-2">
            {trend && (
              <div className="flex items-center gap-1.5 font-medium">
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sv-xs font-semibold text-[11px] ${
                    trend.direction === "up"
                      ? "bg-sv-success-subtle text-sv-success-text border border-sv-success-border"
                      : trend.direction === "down"
                      ? "bg-sv-error-subtle text-sv-error-text border border-sv-error-border"
                      : "bg-sv-surface-raised text-sv-text-muted border border-sv-border"
                  }`}
                >
                  {trend.direction === "up" && <FiTrendingUp className="text-xs" />}
                  {trend.direction === "down" && <FiTrendingDown className="text-xs" />}
                  {trend.direction === "neutral" && <FiMinus className="text-xs" />}
                  {trend.value}
                </span>
                {trend.label && (
                  <span className="text-sv-text-muted truncate">{trend.label}</span>
                )}
              </div>
            )}

            {subtext && !trend && (
              <span className="text-sv-text-muted truncate">{subtext}</span>
            )}
            {subtext && trend && (
              <span className="text-sv-text-muted truncate ml-auto">{subtext}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Stat.displayName = "Stat";
