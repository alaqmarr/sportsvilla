import React, { forwardRef } from "react";
import { FiChevronDown } from "react-icons/fi";

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      disabled,
      required,
      id,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const selectId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-sv-text-secondary select-none"
          >
            {label}
            {required && <span className="text-sv-error-text ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            className={`w-full appearance-none bg-sv-bg border text-sv-text text-sm rounded-sv-sm pl-3.5 pr-10 py-2 transition-colors duration-sv-fast outline-none cursor-pointer ${
              error
                ? "border-sv-error-border focus:border-sv-status-error focus:ring-1 focus:ring-sv-status-error"
                : "border-sv-border focus:border-sv-brand focus:ring-1 focus:ring-sv-brand"
            } ${
              disabled
                ? "opacity-50 cursor-not-allowed bg-sv-surface-raised"
                : "hover:border-sv-border-strong"
            } ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option
                    key={String(opt.value)}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="bg-sv-surface text-sv-text"
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="absolute right-3 flex items-center pointer-events-none text-sv-text-muted text-sm">
            <FiChevronDown />
          </div>
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

Select.displayName = "Select";
