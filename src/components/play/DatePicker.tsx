'use client';

import React, { useRef, useEffect } from 'react';
import { Maximize2 } from 'lucide-react'; // Expand icon placeholder

interface DatePickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onChange }) => {
  const getDays = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
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

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  };

  const monthYear = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6 px-4">
        <h2 className="text-[var(--play-text)] font-bold text-lg">{monthYear}</h2>
        <button className="p-2 text-[var(--play-text-muted)] hover:text-[var(--play-text)]">
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex gap-4 min-w-max px-4">
          {days.map((date) => {
            const selected = isSameDay(date, selectedDate);
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => onChange(date)}
                className={`flex flex-col items-center justify-center min-w-[3.5rem]`}
              >
                <span className="text-[11px] font-medium text-[var(--play-text-light)] mb-3">
                  {getDayName(date)}
                </span>
                <div className={`w-12 h-12 flex items-center justify-center rounded-[14px] transition-all ${
                  selected 
                    ? 'bg-[var(--play-brand)] text-white shadow-sm' 
                    : 'bg-transparent text-[var(--play-text)] hover:bg-[var(--play-surface-alt)]'
                }`}>
                  <span className="text-xl font-bold">
                    {date.getDate()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

