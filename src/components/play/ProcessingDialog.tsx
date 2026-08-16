'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Modal } from '@/components/play/Modal';

export type ProcessStatus = 'idle' | 'processing' | 'success' | 'error';

interface ProcessingDialogProps {
  isOpen: boolean;
  status: ProcessStatus;
  errorMessage?: string;
  onClose?: () => void;
  onSuccessClose?: () => void;
}

export function ProcessingDialog({ isOpen, status, errorMessage, onClose, onSuccessClose }: ProcessingDialogProps) {
  const [step, setStep] = useState(0);

  const steps = [
    "Checking court availability...",
    "Processing payment...",
    "Confirming booking..."
  ];

  useEffect(() => {
    if (isOpen && status === 'processing') {
      setStep(0);
      const interval = setInterval(() => {
        setStep(prev => {
          if (prev < steps.length - 1) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 1000); // changes step every 1000ms
      return () => clearInterval(interval);
    }
  }, [isOpen, status]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={status === 'processing' ? () => {} : (onClose || (() => {}))} size="sm">
      <div className="flex flex-col items-center justify-center text-center">
        
        {status === 'processing' && (
          <div className="animate-in fade-in zoom-in-95 duration-300 w-full flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-[var(--play-surface-alt)]"></div>
              <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-t-[var(--play-brand)] animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold font-outfit mb-2 text-[var(--play-text)] animate-pulse">
              Please Wait
            </h3>
            <div className="h-6 overflow-hidden relative w-full flex justify-center">
              <p 
                className="text-sm text-[var(--play-text-muted)] transition-all duration-300 absolute"
                key={step}
              >
                {steps[step]}
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-in fade-in zoom-in-95 duration-300 w-full flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6 text-emerald-600">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-xl font-bold font-outfit mb-2 text-[var(--play-text)] text-center">
              Booking Confirmed!
            </h3>
            <p className="text-sm text-[var(--play-text-muted)] text-center mb-6">
              Redirecting to your ticket...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-in fade-in zoom-in-95 duration-300 w-full flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6 text-red-600">
              <XCircle size={40} />
            </div>
            <h3 className="text-xl font-bold font-outfit mb-2 text-[var(--play-text)] text-center">
              Booking Failed
            </h3>
            <p className="text-sm text-[var(--play-text-muted)] text-center mb-6">
              {errorMessage || "Something went wrong."}
            </p>
            <button 
              onClick={onClose}
              className="w-full bg-[var(--play-surface-alt)] border border-[var(--play-border)] hover:bg-[var(--play-bg)] font-semibold py-3 rounded-xl transition-colors text-[var(--play-text)]"
            >
              Close
            </button>
          </div>
        )}

      </div>
    </Modal>
  );
}
