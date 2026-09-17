import React, { forwardRef } from "react";
import { FiLoader } from "react-icons/fi";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-sv-brand hover:bg-sv-brand-hover text-sv-brand-foreground shadow-sv-sm font-semibold border border-transparent focus:ring-2 focus:ring-sv-brand/40",
  secondary:
    "bg-sv-surface-raised hover:bg-sv-surface-hover text-sv-text border border-sv-border shadow-sv-sm font-medium focus:ring-2 focus:ring-sv-border-focus",
  outline:
    "bg-transparent hover:bg-sv-surface-raised text-sv-text border border-sv-border font-medium focus:ring-2 focus:ring-sv-border-focus",
  ghost:
    "bg-transparent hover:bg-sv-surface-hover text-sv-text-secondary hover:text-sv-text font-medium border border-transparent focus:ring-2 focus:ring-sv-border-focus",
  danger:
    "bg-sv-error-subtle hover:bg-sv-status-error/20 text-sv-error-text border border-sv-error-border font-medium focus:ring-2 focus:ring-sv-status-error/40",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1.5 text-xs rounded-sv-sm gap-1.5",
  md: "px-3.5 py-2 text-sm rounded-sv-sm gap-2",
  lg: "px-5 py-2.5 text-base rounded-sv-md gap-2.5",
  icon: "p-2 text-base rounded-sv-sm justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = "",
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
        aria-busy={isLoading}
        className={`inline-flex items-center justify-center font-sans transition-all duration-sv-fast select-none cursor-pointer outline-none active:scale-[0.98] ${
          variantStyles[variant]
        } ${sizeStyles[size]} ${
          isDisabled
            ? "opacity-50 cursor-not-allowed pointer-events-none active:scale-100 shadow-none"
            : ""
        } ${className}`}
        {...props}
      >
        {isLoading ? (
          <FiLoader className="animate-spin text-current" />
        ) : (
          leftIcon && <span className="flex-shrink-0 text-current">{leftIcon}</span>
        )}

        {children && <span>{children}</span>}

        {!isLoading && rightIcon && (
          <span className="flex-shrink-0 text-current">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
