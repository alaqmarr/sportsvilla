'use client';

import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

export interface Slot {
  time: string;
  available: boolean;
  price: number;
}

interface TimePickerProps {
  slots: Slot[];
  selectedSlots: string[];
  onChange: (selected: string[]) => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({ slots, selectedSlots, onChange }) => {
  // Convert 12h time to minutes since midnight for easy math
  const timeToMins = (timeStr: string) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
    return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
  };

  const getBaseInterval = () => {
    if (!slots || slots.length < 2) return 60;
    let minGap = Infinity;
    for (let i = 1; i < slots.length; i++) {
      const gap = timeToMins(slots[i].time) - timeToMins(slots[i-1].time);
      if (gap > 0 && gap < minGap) minGap = gap;
    }
    return minGap === Infinity ? 60 : minGap;
  };

  const baseInterval = getBaseInterval();
  const [duration, setDuration] = useState(baseInterval);

  const handleSlotSelect = (time: string) => {
    const slotIndex = slots.findIndex(s => s.time === time);
    if (slotIndex === -1) return;

    const slotsNeeded = Math.ceil(duration / baseInterval);
    
    const newSelected = [];
    for (let i = 0; i < slotsNeeded; i++) {
      if (slots[slotIndex + i] && slots[slotIndex + i].available) {
        newSelected.push(slots[slotIndex + i].time);
      }
    }
    
    onChange(newSelected);
  };

  if (!slots || slots.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--play-text-muted)] text-sm">
        No slots available.
      </div>
    );
  }

  let timeDisplay = '-- : --';
  if (selectedSlots.length > 0) {
    const first = selectedSlots[0];
    const last = selectedSlots[selectedSlots.length - 1];
    const lastMins = timeToMins(last);
    const endMins = lastMins + baseInterval;
    const endHour = Math.floor(endMins / 60);
    const endMin = endMins % 60;
    const endModifier = endHour >= 12 ? 'PM' : 'AM';
    const endHour12 = endHour > 12 ? endHour - 12 : (endHour === 0 ? 12 : endHour);
    
    timeDisplay = `${first} - ${endHour12}:${endMin.toString().padStart(2, '0')} ${endModifier}`;
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 px-4 gap-4">
        <div className="bg-[var(--play-surface-alt)] p-4 -mx-4 sm:mx-0 sm:rounded-[20px] flex-1">
          <h3 className="text-[var(--play-text)] font-bold text-lg mb-1">Time</h3>
          <p className="text-[var(--play-text-muted)] text-sm">{timeDisplay}</p>
        </div>
        
        <div className="flex items-center justify-end gap-4">
          <button 
            onClick={() => setDuration(Math.max(baseInterval, duration - baseInterval))}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-[var(--play-border)] text-[var(--play-text)] hover:bg-[var(--play-surface-alt)] transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-medium min-w-[60px] text-center">{duration} Mins</span>
          <button 
            onClick={() => setDuration(duration + baseInterval)}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-[var(--play-border)] text-[var(--play-text)] hover:bg-[var(--play-surface-alt)] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-6 scrollbar-hide relative">
        <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[var(--play-border)]"></div>

        <div className="flex gap-4 min-w-max px-4 relative z-10">
          {slots.map((slot) => {
            const isSelected = selectedSlots.includes(slot.time);
            
            return (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => handleSlotSelect(slot.time)}
                className={`flex flex-col items-center justify-end min-w-[4rem] min-h-[3.5rem] transition-all relative ${
                  !slot.available ? 'cursor-not-allowed opacity-70' : ''
                }`}
              >
                <span className={`text-sm font-medium ${isSelected ? 'text-[var(--play-brand)] font-bold' : (!slot.available ? 'text-[var(--play-text-muted)] line-through decoration-red-500 decoration-[1.5px]' : 'text-[var(--play-text-muted)]')} ${!slot.available ? 'mb-1' : 'mb-4'}`}>
                  {slot.time}
                </span>
                
                {!slot.available && (
                  <span className="text-[9px] uppercase font-bold text-red-500 mb-1">Booked</span>
                )}
                
                <div className="w-px h-2 bg-[var(--play-border)] absolute bottom-0"></div>
                {isSelected && (
                  <div className="absolute -bottom-1 w-full h-1 bg-[var(--play-brand)] text-white"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
