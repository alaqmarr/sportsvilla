'use client';

import React from 'react';

interface CourtCardProps {
  id: string;
  name: string;
  price: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export const CourtCard: React.FC<CourtCardProps> = ({ id, name, price, isSelected, onSelect, icon, disabled }) => {
  return (
    <button
      onClick={() => onSelect(id)}
      disabled={disabled}
      className={`flex flex-col items-center justify-center p-6 bg-[var(--play-surface)] border rounded-[20px] transition-all min-w-[140px] shadow-sm ${
        disabled 
          ? 'opacity-50 cursor-not-allowed border-[var(--play-border)] bg-gray-50' 
          : isSelected 
            ? 'border-[var(--play-brand)] ring-1 ring-[var(--play-brand)]' 
            : 'border-[var(--play-border)] hover:border-[var(--play-brand-light)] hover:shadow-md'
      }`}
    >
      <div className="w-16 h-16 rounded-full border border-[var(--play-text)] flex items-center justify-center mb-4 text-[var(--play-text)]">
        {icon || (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {/* Fallback football pitch icon */}
            <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth="1.5" />
            <path d="M12 4v16M8 9h8v6H8z" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="1.5" strokeWidth="1.5" />
          </svg>
        )}
      </div>
      <h3 className="font-medium text-[var(--play-text)] mb-1">{name}</h3>
      <p className="text-sm text-[var(--play-text-muted)] uppercase">INR {price}</p>
    </button>
  );
};
