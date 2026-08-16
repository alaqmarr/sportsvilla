import React from 'react';
import { Calendar, Clock, MapPin, Activity } from 'lucide-react';

export type BookingStatus = 'CONFIRMED' | 'UPCOMING' | 'PENDING' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  id: string;
  status: BookingStatus;
  date: string;
  time: string;
  venue: string;
  sport: string;
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
  return (
    <div className="bg-[var(--play-surface)] rounded-[var(--play-radius-md)] border border-[var(--play-border)] p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-[var(--play-text)] mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--play-brand)]" />
            {booking.sport}
          </h3>
          <p className="text-sm text-[var(--play-text-muted)] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {booking.venue}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="flex gap-4 text-sm text-[var(--play-text-muted)] mb-5">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          {booking.date}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          {booking.time}
        </div>
      </div>

      <div className="flex gap-3">
        {booking.status === 'CONFIRMED' ? (
          <>
            <button 
              onClick={() => onActionClick?.('view_pass', booking.id)}
              className="flex-1 bg-[var(--play-brand)] hover:bg-[var(--play-brand-dark)] text-white px-4 py-2 rounded-[var(--play-radius-sm)] font-medium transition-colors text-sm"
            >
              View Pass
            </button>
            <button 
              onClick={() => onActionClick?.('manage', booking.id)}
              className="flex-1 bg-[var(--play-surface)] border border-[var(--play-border)] hover:bg-[var(--play-surface-alt)] text-[var(--play-text)] px-4 py-2 rounded-[var(--play-radius-sm)] font-medium transition-colors text-sm"
            >
              Manage
            </button>
          </>
        ) : booking.status === 'UPCOMING' || booking.status === 'PENDING' ? (
          <>
             <button 
              onClick={() => onActionClick?.('reschedule', booking.id)}
              className="flex-1 bg-[var(--play-brand)] hover:bg-[var(--play-brand-dark)] text-white px-4 py-2 rounded-[var(--play-radius-sm)] font-medium transition-colors text-sm"
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
