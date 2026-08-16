'use client';

import React from 'react';

export type FilterOption = {
  id: string;
  label: string;
  count?: number;
};

interface FilterChipsProps {
  options: FilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function FilterChips({ options, selectedId, onSelect }: FilterChipsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {options.map((option) => {
        const isSelected = selectedId === option.id;
        
        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-[var(--play-radius-pill)] text-sm font-medium transition-all ${
              isSelected
                ? 'bg-[var(--play-brand)] text-white shadow-sm border border-[var(--play-brand)]'
                : 'bg-[var(--play-surface)] text-[var(--play-text-muted)] border border-[var(--play-border)] hover:border-[var(--play-text-light)]'
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={`inline-flex items-center justify-center text-xs px-1.5 py-0.5 rounded-full ${
                isSelected ? 'bg-white/20 text-white' : 'bg-[var(--play-surface-alt)] text-[var(--play-text-muted)]'
              }`}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
