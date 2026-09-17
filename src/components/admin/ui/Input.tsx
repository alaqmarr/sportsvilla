import React, { forwardRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      disabled,
      required,
      id,
      className = "",
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-sv-text-secondary select-none"
          >
            {label}
            {required && <span className="text-sv-error-text ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-sv-text-muted text-sm">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            className={`w-full bg-sv-bg border text-sv-text placeholder:text-sv-text-muted text-sm rounded-sv-sm transition-colors duration-sv-fast outline-none ${
              leftIcon ? "pl-9" : "pl-3.5"
            } ${rightIcon ? "pr-9" : "pr-3.5"} py-2 ${
              error
                ? "border-sv-error-border focus:border-sv-status-error focus:ring-1 focus:ring-sv-status-error"
                : "border-sv-border focus:border-sv-brand focus:ring-1 focus:ring-sv-brand"
            } ${
              disabled
                ? "opacity-50 cursor-not-allowed bg-sv-surface-raised"
                : "hover:border-sv-border-strong"
            } ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 flex items-center pointer-events-none text-sv-text-muted text-sm">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-sv-error-text font-medium leading-tight">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-xs text-sv-text-muted leading-tight">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
