'use client'

import React, { useState, useEffect } from 'react';
import { fetchCalendarData } from './actions';
import { addDays, subDays } from 'date-fns';
import { formatIST } from '@/lib/dateUtils';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const START_HOUR = 6;
const END_HOUR = 24; // midnight
const HOUR_WIDTH = 120; // px

export default function CalendarClient() {
  const [date, setDate] = useState<Date>(new Date());
  const [data, setData] = useState<{turfs: any[], bookings: any[]}>({ turfs: [], bookings: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchCalendarData(date.toISOString()).then(res => {
      setData(res);
      setLoading(false);
    });
  }, [date]);

  const hours: number[] = [];
  for (let i = START_HOUR; i < END_HOUR; i++) {
    hours.push(i);
  }

  const handlePrevDay = () => setDate(subDays(date, 1));
  const handleNextDay = () => setDate(addDays(date, 1));

  return (
    <div className="pb-20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-white tracking-tight">Booking Calendar</h1>
          <p className="text-gray-500 mt-2">Daily turf schedule and availability.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#161923] border border-[#2a2d3e] rounded-lg p-2">
          <button onClick={handlePrevDay} className="p-2 hover:bg-[#2a2d3e] rounded text-white">
            <FiChevronLeft />
          </button>
          <div className="text-white font-medium min-w-[120px] text-center">
            {formatIST(date, 'MMM dd, yyyy')}
          </div>
          <button onClick={handleNextDay} className="p-2 hover:bg-[#2a2d3e] rounded text-white">
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-white text-center">Loading schedule...</div>
        ) : (
          <div className="overflow-x-auto">
            <div style={{ minWidth: `${hours.length * HOUR_WIDTH + 150}px` }}>
              {/* Header Row */}
              <div className="flex border-b border-[#2a2d3e] bg-[#1a1d27]">
                <div className="w-[150px] flex-shrink-0 p-4 border-r border-[#2a2d3e] font-semibold text-gray-400">
                  Turf
                </div>
                <div className="flex flex-1 relative">
                  {hours.map(h => (
                    <div 
                      key={h} 
                      className="border-r border-[#2a2d3e] flex-shrink-0 p-2 text-center text-sm text-gray-400"
                      style={{ width: `${HOUR_WIDTH}px` }}
                    >
                      {h > 12 ? `${h-12} PM` : h === 12 ? '12 PM' : `${h} AM`}
                    </div>
                  ))}
                </div>
              </div>

              {/* Turf Rows */}
              {data.turfs.map(turf => (
                <div key={turf.id} className="flex border-b border-[#2a2d3e] group hover:bg-[#1a1d27]/50">
                  <div className="w-[150px] flex-shrink-0 p-4 border-r border-[#2a2d3e] font-bold text-white flex items-center">
                    {turf.name}
                  </div>
                  
                  <div className="flex-1 relative h-16 bg-[#0f1117]/30">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {hours.map(h => (
                        <div key={h} className="border-r border-[#2a2d3e]/30 h-full" style={{ width: `${HOUR_WIDTH}px` }} />
                      ))}
                    </div>

                    {/* Bookings */}
                    {data.bookings.filter(b => b.turfId === turf.id).map(booking => {
                      const start = new Date(booking.startTime);
                      const end = new Date(booking.endTime);
                      const startHourFloat = start.getHours() + (start.getMinutes() / 60);
                      const endHourFloat = end.getHours() + (end.getMinutes() / 60);
                      
                      const leftPos = (startHourFloat - START_HOUR) * HOUR_WIDTH;
                      const blockWidth = (endHourFloat - startHourFloat) * HOUR_WIDTH;

                      // Don't render if it starts before our timeline
                      if (startHourFloat < START_HOUR) return null;

                      return (
                        <div 
                          key={booking.id}
                          className="absolute top-2 bottom-2 bg-emerald-500/20 border border-emerald-500/50 rounded-md p-2 overflow-hidden flex flex-col justify-center"
                          style={{ left: `${leftPos}px`, width: `${blockWidth - 4}px` }}
                          title={`${booking.member.name} (${formatIST(start, 'hh:mm a')} - ${formatIST(end, 'hh:mm a')})`}
                        >
                          <div className="text-xs font-bold text-emerald-400 truncate">{booking.member.name}</div>
                          <div className="text-[10px] text-emerald-500/80 truncate">{booking.member.mobile}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
