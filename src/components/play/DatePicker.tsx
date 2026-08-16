'use client';

import React from 'react';

interface DatePickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onChange }) => {
  const getDays = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const days = getDays();

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const getDayName = (date: Date, index: number) => {
    if (index === 0) return 'Today';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-3 min-w-max">
        {days.map((date, i) => {
          const selected = isSameDay(date, selectedDate);
          
          return (
            <button
              key={date.toISOString()}
              onClick={() => onChange(date)}
              className={`flex flex-col items-center justify-center min-w-[4.5rem] py-3 rounded-[var(--play-radius-md)] border transition-all ${
                selected 
                  ? 'bg-[var(--play-brand)] border-[var(--play-brand)] text-white shadow-sm' 
                  : 'bg-[var(--play-surface)] border-[var(--play-border)] text-[var(--play-text)] hover:border-[var(--play-brand)] hover:bg-[var(--play-brand-light)]/20'
              }`}
            >
              <span className={`text-xs font-medium mb-1 ${selected ? 'text-white/90' : 'text-[var(--play-text-muted)]'}`}>
                {getDayName(date, i)}
              </span>
              <span className="text-xl font-bold">
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
