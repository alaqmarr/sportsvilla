import React, { forwardRef } from "react";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "brand"
  | "neutral";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulseDot?: boolean;
}

const variantStyles: Record<
  BadgeVariant,
  {
    container: string;
    dot: string;
  }
> = {
  default: {
    container: "bg-sv-surface-raised text-sv-text-secondary border-sv-border",
    dot: "bg-sv-text-muted",
  },
  neutral: {
    container: "bg-sv-surface-raised text-sv-text-secondary border-sv-border",
    dot: "bg-sv-text-muted",
  },
  success: {
    container: "bg-sv-success-subtle text-sv-success-text border-sv-success-border",
    dot: "bg-sv-status-success",
  },
  warning: {
    container: "bg-sv-warning-subtle text-sv-warning-text border-sv-warning-border",
    dot: "bg-sv-status-warning",
  },
  error: {
    container: "bg-sv-error-subtle text-sv-error-text border-sv-error-border",
    dot: "bg-sv-status-error",
  },
  info: {
    container: "bg-sv-info-subtle text-sv-info-text border-sv-info-border",
    dot: "bg-sv-status-info",
  },
  brand: {
    container: "bg-sv-brand-subtle text-sv-brand border-sv-brand/30",
    dot: "bg-sv-brand",
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px] font-medium leading-none",
  md: "px-2.5 py-1 text-xs font-semibold leading-tight",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = "default",
      size = "sm",
      dot = false,
      pulseDot = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const config = variantStyles[variant] || variantStyles.default;

    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-1.5 rounded-sv-full border transition-colors ${
          config.container
        } ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {dot && (
          <span
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot} ${
              pulseDot ? "animate-pulse" : ""
            }`}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
