'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${sizeClasses[size]} max-h-[90vh] bg-[var(--play-surface)] sm:rounded-[var(--play-radius-xl)] rounded-t-[var(--play-radius-xl)] shadow-2xl flex flex-col overflow-hidden z-[101]`}
            role="dialog"
            aria-modal="true"
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--play-border)]">
                <h2 className="text-lg font-bold text-[var(--play-text)]">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-[var(--play-text-muted)] hover:bg-[var(--play-surface-alt)] hover:text-[var(--play-text)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--play-brand)]"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            
            {!title && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-2 z-10 bg-white/50 backdrop-blur-md text-[var(--play-text-muted)] hover:bg-[var(--play-surface-alt)] hover:text-[var(--play-text)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--play-brand)]"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
