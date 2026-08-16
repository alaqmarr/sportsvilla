'use client';

import React from 'react';

interface SportChipsProps {
  sports: string[];
  selectedSport: string;
  onChange: (sport: string) => void;
}

export const SportChips: React.FC<SportChipsProps> = ({ sports, selectedSport, onChange }) => {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-2.5 min-w-max">
        {sports.map((sport) => {
          const isSelected = selectedSport === sport;
          
          return (
            <button
              key={sport}
              onClick={() => onChange(sport)}
              className={`px-5 py-2 rounded-[var(--play-radius-pill)] text-sm font-medium transition-all whitespace-nowrap border ${
                isSelected 
                  ? 'bg-[var(--play-brand)] border-[var(--play-brand)] text-white shadow-sm' 
                  : 'bg-[var(--play-surface)] border-[var(--play-border)] text-[var(--play-text)] hover:border-[var(--play-brand)] hover:text-[var(--play-brand)] hover:bg-[var(--play-brand-light)]/10'
              }`}
            >
              {sport}
            </button>
          );
        })}
      </div>
    </div>
  );
};
