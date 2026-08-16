'use client';

import React from 'react';

export interface Slot {
  time: string;
  available: boolean;
  price: number;
}

interface SlotGridProps {
  slots: Slot[];
  selectedSlots: string[];
  onChange: (selected: string[]) => void;
}

export const SlotGrid: React.FC<SlotGridProps> = ({ slots, selectedSlots, onChange }) => {
  const toggleSlot = (time: string) => {
    let newSelected = [...selectedSlots];
    
    if (newSelected.includes(time)) {
      newSelected = newSelected.filter(t => t !== time);
    } else {
      newSelected.push(time);
    }
    
    // Sort selected slots by their index in the original slots array
    newSelected.sort((a, b) => {
      return slots.findIndex(s => s.time === a) - slots.findIndex(s => s.time === b);
    });

    onChange(newSelected);
  };

  if (!slots || slots.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--play-text-muted)] text-sm border border-dashed border-[var(--play-border)] rounded-[var(--play-radius-md)]">
        No slots available for the selected date.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {slots.map((slot) => {
        const isSelected = selectedSlots.includes(slot.time);
        
        let baseClasses = "flex flex-col items-center justify-center p-3 rounded-[var(--play-radius-sm)] border text-sm transition-all";
        
        if (!slot.available) {
          baseClasses += " bg-gray-50 border-[var(--play-border)] text-[var(--play-text-light)] cursor-not-allowed opacity-60";
        } else if (isSelected) {
          baseClasses += " bg-[var(--play-brand)] border-[var(--play-brand)] text-white shadow-sm";
        } else {
          baseClasses += " bg-[var(--play-surface)] border-[var(--play-border)] text-[var(--play-text)] hover:border-[var(--play-brand)] hover:text-[var(--play-brand)] cursor-pointer hover:shadow-sm";
        }

        return (
          <button
            key={slot.time}
            disabled={!slot.available}
            onClick={() => toggleSlot(slot.time)}
            className={baseClasses}
          >
            <span className={`font-semibold ${!slot.available ? 'line-through' : ''}`}>
              {slot.time}
            </span>
            {slot.available && (
              <span className={`text-[10px] mt-1 ${isSelected ? 'text-white/90' : 'text-[var(--play-text-muted)]'}`}>
                ₹{slot.price}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
