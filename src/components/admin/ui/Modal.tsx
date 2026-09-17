"use client";
import React, { useEffect, useCallback, useRef } from "react";
import { FiX } from "react-icons/fi";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  className?: string;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[95vw] sm:max-w-6xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className = "",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === "Escape") {
        onClose();
      }
    },
    [closeOnEsc, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-sv-fast"
      onClick={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
          onClose();
        }
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        className={`w-full bg-sv-surface border border-sv-border rounded-sv-lg shadow-sv-xl flex flex-col max-h-[90vh] overflow-hidden my-auto animate-in zoom-in-95 duration-sv-fast ${sizeStyles[size]} ${className}`}
      >
        {(title || description) && (
          <div className="p-5 sm:p-6 pb-4 border-b border-sv-border-subtle flex items-start justify-between gap-4 flex-shrink-0">
            <div className="space-y-1 min-w-0 flex-1">
              {title && (
                <h3 className="text-lg font-bold text-sv-text font-sans tracking-tight truncate">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-sv-text-muted leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-sv-sm flex items-center justify-center text-sv-text-muted hover:text-sv-text hover:bg-sv-surface-hover transition-colors flex-shrink-0 cursor-pointer"
              aria-label="Close dialog"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        )}

        <div className="p-5 sm:p-6 overflow-y-auto styled-scrollbar flex-1">
          {children}
        </div>

        {footer && (
          <div className="p-4 sm:p-6 pt-3 sm:pt-4 border-t border-sv-border-subtle bg-sv-surface-raised flex items-center justify-end gap-3 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
