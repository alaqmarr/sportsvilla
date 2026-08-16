import React from 'react';
import { Calendar, Clock, MapPin, Activity } from 'lucide-react';

export type BookingStatus = 'CONFIRMED' | 'UPCOMING' | 'PENDING' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  id: string;
  status: BookingStatus;
  date?: string;
  time?: string;
  venue?: string;
  sport?: string | { name: string; [key: string]: any };
  turf?: { name: string; [key: string]: any };
  startTime?: string;
  endTime?: string;
  [key: string]: any;
}

interface BookingCardProps {
  booking: Booking;
  onActionClick?: (action: string, bookingId: string) => void;
}

const StatusBadge = ({ status }: { status: BookingStatus }) => {
  let bg = 'bg-gray-100';
  let text = 'text-gray-800';

  switch (status) {
    case 'CONFIRMED':
    case 'COMPLETED':
      bg = 'bg-[var(--play-brand-light)]';
      text = 'text-[var(--play-brand-dark)]';
      break;
    case 'UPCOMING':
    case 'PENDING':
      bg = 'bg-amber-100';
      text = 'text-amber-800';
      break;
    case 'CANCELLED':
      bg = 'bg-red-100';
      text = 'text-red-800';
      break;
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      {status}
    </span>
  );
};

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onActionClick }) => {
  // Safe mapping for sport
  const sportName = typeof booking.sport === 'object' ? booking.sport?.name : booking.sport;
  // Safe mapping for venue
  const venueName = booking.turf?.name || booking.venue;
  
  // Safe mapping for date and time
  const dateStr = booking.startTime 
    ? new Date(booking.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : booking.date;
    
  const timeStr = booking.startTime && booking.endTime
    ? `${new Date(booking.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })} - ${new Date(booking.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`
    : booking.time;

  // Derive logical status for active bookings (since DB only has CONFIRMED)
  let displayStatus = booking.status;
  if (booking.status === 'CONFIRMED' && booking.endTime) {
    const now = new Date();
    const end = new Date(booking.endTime);
    if (end <= now) displayStatus = 'COMPLETED';
    else displayStatus = 'UPCOMING';
  }

  return (
    <div className="bg-[var(--play-surface)] rounded-[var(--play-radius-md)] border border-[var(--play-border)] p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-[var(--play-text)] mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--play-brand)]" />
            {sportName}
          </h3>
          <p className="text-sm text-[var(--play-text-muted)] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {venueName}
          </p>
        </div>
        <StatusBadge status={displayStatus as BookingStatus} />
      </div>

      <div className="flex gap-4 text-sm text-[var(--play-text-muted)] mb-5">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          {dateStr}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          {timeStr}
        </div>
      </div>

      <div className="flex gap-3">
        {displayStatus === 'UPCOMING' || displayStatus === 'CONFIRMED' || displayStatus === 'PENDING' ? (
          <>
            <button 
              onClick={() => onActionClick?.('view_pass', booking.id)}
              className="flex-1 bg-[var(--play-brand)] hover:bg-[var(--play-brand-dark)] text-white px-4 py-2 rounded-[var(--play-radius-sm)] font-medium transition-colors text-sm"
            >
              View Pass
            </button>
            <button 
              onClick={() => onActionClick?.('reschedule', booking.id)}
              className="flex-1 bg-[var(--play-surface)] border border-[var(--play-border)] hover:bg-[var(--play-surface-alt)] text-[var(--play-text)] px-4 py-2 rounded-[var(--play-radius-sm)] font-medium transition-colors text-sm"
            >
              Reschedule
            </button>
            <button 
              onClick={() => onActionClick?.('cancel', booking.id)}
              className="flex-1 bg-[var(--play-surface)] border border-[var(--play-error)] text-[var(--play-error)] hover:bg-red-50 px-4 py-2 rounded-[var(--play-radius-sm)] font-medium transition-colors text-sm"
            >
              Cancel
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};
