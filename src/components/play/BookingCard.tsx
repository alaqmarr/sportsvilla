import React from "react";
import { Calendar, Clock, MapPin, Activity } from "lucide-react";

export type BookingStatus =
  "CONFIRMED" | "UPCOMING" | "PENDING" | "CANCELLED" | "COMPLETED";

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
  let bg = "bg-gray-100";
  let text = "text-gray-800";

  switch (status) {
    case "CONFIRMED":
    case "COMPLETED":
      bg = "bg-[var(--play-brand-light)]";
      text = "text-[var(--play-brand-dark)]";
      break;
    case "UPCOMING":
    case "PENDING":
      bg = "bg-amber-100";
      text = "text-amber-800";
      break;
    case "CANCELLED":
      bg = "bg-red-100";
      text = "text-red-800";
      break;
  }

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}
    >
      {status}
    </span>
  );
};

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onActionClick,
}) => {
  // Safe mapping for sport
  const sportName =
    typeof booking.sport === "object" ? booking.sport?.name : booking.sport;
  // Safe mapping for venue
  const venueName = booking.turf?.name || booking.venue;

  // Safe mapping for date and time
  const dateStr = booking.startTime
    ? new Date(booking.startTime).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "2-digit",
      })
    : booking.date;

  const timeStr =
    booking.startTime && booking.endTime
      ? `${new Date(booking.startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })} - ${new Date(booking.endTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`
      : booking.time;

  // Derive logical status for active bookings (since DB only has CONFIRMED)
  let displayStatus = booking.status;
  if (booking.status === "CONFIRMED" && booking.endTime) {
    const now = new Date();
    const end = new Date(booking.endTime);
    if (end <= now) displayStatus = "COMPLETED";
    else displayStatus = "UPCOMING";
  }

  const isCancelled = displayStatus === "CANCELLED";
  const isPast = displayStatus === "COMPLETED";

  const sportIcon =
    typeof booking.sport === "object" ? booking.sport?.iconPath : null;
  const turfIcon =
    typeof booking.turf === "object" ? booking.turf?.iconPath : null;

  return (
    <div
      className={`bg-[var(--play-surface)] rounded-[var(--play-radius-lg)] p-5 shadow-sm border ${isPast || displayStatus === "UPCOMING" ? "border-[var(--play-brand)]" : "border-[var(--play-border)]"} mb-4 relative overflow-hidden cursor-pointer`}
      onClick={() => onActionClick?.("view_pass", booking.id)}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--play-text-muted)] uppercase tracking-wide">
          {sportIcon ? (
            <img
              src={sportIcon}
              alt={sportName || "Sport"}
              className="w-4 h-4 object-contain opacity-70"
            />
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 14l6-6M4 14a6 6 0 008.49 8.49l6-6M4 14l-2 2M18.49 8.49L10 10l-1.5 1.5M18.49 8.49a6 6 0 00-8.49-8.49l-6 6M18.49 8.49l2-2" />
            </svg>
          )}
          <span>• {sportName}</span>
        </div>
        <span className="text-xs font-semibold text-[var(--play-text-light)] tracking-wider">
          OFFLINE
        </span>
      </div>

      <h3 className="font-semibold text-[17px] text-[var(--play-text)] mb-1.5 flex items-center gap-2">
        {turfIcon && (
          <img
            src={turfIcon}
            alt={venueName}
            className="w-5 h-5 object-contain rounded-sm"
          />
        )}
        {venueName}
      </h3>

      <div className="text-[14px] text-[var(--play-text)] font-medium mb-5">
        {dateStr} | {timeStr}
      </div>

      <div className="flex justify-between items-center">
        <div
          className={`px-3 py-1.5 rounded-[var(--play-radius-sm)] text-xs font-bold tracking-wide ${
            isCancelled
              ? "bg-[var(--play-surface-alt)] text-[var(--play-text-muted)]"
              : "bg-[var(--play-brand)] text-white"
          }`}
        >
          Booking ID {booking.id.substring(0, 8).toUpperCase()}
        </div>

        <div className="font-bold text-[var(--play-text)]">
          INR {booking.tickets?.[0]?.price || booking.price || 400}
        </div>
      </div>

      {isCancelled && booking.updatedAt && (
        <div className="mt-4 text-[11px] font-bold text-[var(--play-error)] uppercase tracking-widest">
          CANCELLED ON{" "}
          {new Date(booking.updatedAt)
            .toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
            .toUpperCase()}
          ,{" "}
          {new Date(booking.updatedAt)
            .toLocaleTimeString("en-IN", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
            .toUpperCase()}
        </div>
      )}
    </div>
  );
};
