'use client';

import React, { useState, useEffect } from 'react';
import { fetchCalendarData } from '@/modules/calendar/calendar.action';
import { addDays, subDays } from 'date-fns';
import { formatIST } from '@/core/utils/dateUtils';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
import { PageHeader, Button, Card, Skeleton } from '@/components/admin/ui';

const START_HOUR = 6;
const END_HOUR = 24; // midnight
const HOUR_WIDTH = 120; // px

export default function CalendarClient() {
  const [date, setDate] = useState<Date>(new Date());
  const [data, setData] = useState<{ turfs: any[]; bookings: any[] }>({ turfs: [], bookings: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchCalendarData(date.toISOString()).then((res) => {
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
    <div className="space-y-6 pb-20 font-sans text-sv-text">
      <PageHeader
        title="Booking Calendar"
        subtitle="Daily turf schedule and visual timeline availability across all courts"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Calendar" },
        ]}
        actions={
          <div className="flex items-center gap-2 bg-sv-surface border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-md p-1.5 shadow-sv-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevDay}
              aria-label="Previous Day"
              className="text-sv-text hover:bg-sv-surface-raised"
            >
              <FiChevronLeft />
            </Button>
            <div className="text-sv-text font-bold text-sm min-w-[130px] text-center font-mono flex items-center justify-center gap-1.5">
              <FiCalendar className="text-sv-brand text-xs" />
              {formatIST(date, 'MMM dd, yyyy')}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextDay}
              aria-label="Next Day"
              className="text-sv-text hover:bg-sv-surface-raised"
            >
              <FiChevronRight />
            </Button>
          </div>
        }
      />

      <Card variant="default" className="overflow-hidden">
        {loading ? (
          <div className="p-10 space-y-4">
            <div className="flex gap-4 border-b border-sv-border border-[#2a2d3e] pb-4">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-6 flex-1" />
            </div>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto styled-scrollbar">
            <div style={{ minWidth: `${hours.length * HOUR_WIDTH + 150}px` }}>
              {/* Header Row */}
              <div className="flex border-b border-sv-border border-[#2a2d3e] bg-sv-surface-raised">
                <div className="w-[150px] flex-shrink-0 p-4 border-r border-sv-border border-[#2a2d3e] font-semibold text-sv-text-muted text-xs uppercase tracking-wider">
                  Turf
                </div>
                <div className="flex flex-1 relative">
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="border-r border-sv-border border-[#2a2d3e] flex-shrink-0 p-2 text-center text-xs font-mono text-sv-text-muted"
                      style={{ width: `${HOUR_WIDTH}px` }}
                    >
                      {h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`}
                    </div>
                  ))}
                </div>
              </div>

              {/* Turf Rows */}
              {data.turfs.map((turf) => (
                <div
                  key={turf.id}
                  className="flex border-b border-sv-border border-[#2a2d3e] group hover:bg-sv-surface-hover/40 transition-colors"
                >
                  <div className="w-[150px] flex-shrink-0 p-4 border-r border-sv-border border-[#2a2d3e] font-bold text-sv-text flex items-center text-sm">
                    {turf.name}
                  </div>

                  <div className="flex-1 relative h-16 bg-sv-bg/40">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {hours.map((h) => (
                        <div
                          key={h}
                          className="border-r border-sv-border-subtle h-full"
                          style={{ width: `${HOUR_WIDTH}px` }}
                        />
                      ))}
                    </div>

                    {/* Bookings */}
                    {(() => {
                      const turfBookings = data.bookings.filter((b) => b.turfId === turf.id);
                      const groups: Record<string, any[]> = {};
                      turfBookings.forEach((b) => {
                        const key = `${new Date(b.startTime).getTime()}-${new Date(b.endTime).getTime()}`;
                        if (!groups[key]) groups[key] = [];
                        groups[key].push(b);
                      });

                      return Object.values(groups).map((groupBookings, index) => {
                        const booking = groupBookings[0];
                        const start = new Date(booking.startTime);
                        const end = new Date(booking.endTime);
                        const startHourFloat = start.getHours() + start.getMinutes() / 60;
                        const endHourFloat = end.getHours() + end.getMinutes() / 60;

                        const leftPos = (startHourFloat - START_HOUR) * HOUR_WIDTH;
                        const blockWidth = (endHourFloat - startHourFloat) * HOUR_WIDTH;

                        // Don't render if it starts before our timeline
                        if (startHourFloat < START_HOUR) return null;

                        const totalParticipants = groupBookings.reduce(
                          (sum, b) => sum + (b.participantCount || 1),
                          0
                        );
                        const names = groupBookings
                          .map((b) => b.member?.name || 'Guest')
                          .join(', ');

                        return (
                          <div
                            key={`group-${index}`}
                            className="absolute top-2 bottom-2 bg-sv-success-subtle border border-[#2a2d3e] border-sv-success-border border-[#2a2d3e] rounded-sv-sm p-2 overflow-hidden flex flex-col justify-center transition-all hover:brightness-110"
                            style={{ left: `${leftPos}px`, width: `${blockWidth - 4}px` }}
                            title={`${names} (${formatIST(start, 'hh:mm a')} - ${formatIST(end, 'hh:mm a')}) - Total: ${totalParticipants} Participants`}
                          >
                            <div className="text-xs font-bold text-sv-success-text truncate">
                              {groupBookings.length > 1
                                ? `${booking.member?.name || 'Guest'} +${groupBookings.length - 1}`
                                : booking.member?.name || 'Guest'}
                            </div>
                            <div className="text-[10px] text-sv-text-muted truncate font-mono">
                              {groupBookings.length > 1
                                ? `${totalParticipants} Participants`
                                : booking.member?.mobile || ''}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
