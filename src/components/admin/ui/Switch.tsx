import React from "react";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  id?: string;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = "md",
  id,
  className = "",
}: SwitchProps) {
  const switchId =
    id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const isSmall = size === "sm";

  return (
    <div
      className={`flex items-start justify-between gap-3 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
      onClick={handleToggle}
    >
      {(label || description) && (
        <div className="space-y-0.5 select-none">
          {label && (
            <label
              htmlFor={switchId}
              className="text-sm font-semibold text-sv-text cursor-pointer block"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-sv-text-muted leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        className={`relative inline-flex flex-shrink-0 cursor-pointer rounded-full transition-colors duration-sv-fast ease-sv-default focus:outline-none focus:ring-2 focus:ring-sv-brand/40 ${
          isSmall ? "h-5 w-9" : "h-6 w-11"
        } ${
          checked
            ? "bg-sv-brand"
            : "bg-sv-surface-raised border border-sv-border"
        } ${disabled ? "cursor-not-allowed" : ""}`}
      >
        <span
          className={`inline-block transform rounded-full bg-white shadow-sv-sm transition-transform duration-sv-fast ease-sv-default pointer-events-none ${
            isSmall ? "h-3.5 w-3.5 mt-[2px] ml-[2px]" : "h-4 w-4 mt-[3px] ml-[3px]"
          } ${
            checked
              ? isSmall
                ? "translate-x-4"
                : "translate-x-5"
              : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
