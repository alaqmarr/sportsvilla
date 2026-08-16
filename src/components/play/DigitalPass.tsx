"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Calendar, Clock, MapPin, User, Activity } from "lucide-react";

interface DigitalPassProps {
  booking: {
    id: string;
    sport: string;
    sportIcon?: string;
    venue: string;
    turf?: string;
    turfIcon?: string;
    date: string;
    time: string;
    guestName: string;
  };
  qrData: string;
}

export const DigitalPass: React.FC<DigitalPassProps> = ({
  booking,
  qrData,
}) => {
  const [qrSrc, setQrSrc] = useState("");

  useEffect(() => {
    QRCode.toDataURL(qrData || booking.id, {
      width: 180,
      margin: 2,
      color: {
        dark: "#111827",
        light: "#FFFFFF",
      },
    })
      .then((url) => setQrSrc(url))
      .catch((err) => console.error(err));
  }, [qrData, booking.id]);
  return (
    <div className="max-w-sm mx-auto bg-[var(--play-surface)] rounded-2xl overflow-hidden shadow-xl border border-[var(--play-border)]">
      {/* Top Section */}
      <div className="bg-[var(--play-brand)] p-6 text-center relative overflow-hidden text-white">
        {/* Decorative circles */}
        <div className="absolute -left-4 -top-4 w-16 h-16 rounded-full bg-white/10" />
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10" />

        <h2 className="text-white text-xl font-bold tracking-tight mb-1 relative z-10">
          SPORTSVILLA
        </h2>
        <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold tracking-widest uppercase mt-2 relative z-10">
          Confirmed
        </div>
      </div>

      {/* Ticket Cutouts */}
      <div className="flex justify-between items-center -mt-3 relative z-20">
        <div className="w-6 h-6 bg-[var(--play-bg)] rounded-full -ml-3 shadow-inner" />
        <div className="border-t-2 border-dashed border-[var(--play-border)] w-full mx-2" />
        <div className="w-6 h-6 bg-[var(--play-bg)] rounded-full -mr-3 shadow-inner" />
      </div>

      {/* Middle Section - QR */}
      <div className="p-8 pb-6 flex flex-col items-center border-b border-[var(--play-border)]">
        <div className="text-xs text-[var(--play-text-muted)] uppercase tracking-widest font-semibold mb-4">
          Booking ID:{" "}
          <span className="text-[var(--play-text)]">{booking.id}</span>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm border border-[var(--play-border)] min-h-[180px] flex items-center justify-center">
          {qrSrc ? (
            <img src={qrSrc} alt="Booking QR Code" width={180} height={180} />
          ) : (
            <div className="w-[180px] h-[180px] bg-[var(--play-surface-alt)] animate-pulse rounded" />
          )}
        </div>
        <p className="text-xs text-center text-[var(--play-text-light)] mt-4 max-w-[200px]">
          Scan this code at the venue reception to check in
        </p>
      </div>

      {/* Bottom Section - Details */}
      <div className="p-6 bg-[var(--play-surface-alt)]">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            {booking.sportIcon ? (
              <img
                src={booking.sportIcon}
                alt={booking.sport}
                className="w-5 h-5 object-contain mt-0.5"
              />
            ) : (
              <Activity className="w-5 h-5 text-[var(--play-brand)] mt-0.5" />
            )}
            <div>
              <div className="text-xs text-[var(--play-text-muted)] font-medium">
                Sport
              </div>
              <div className="font-semibold text-[var(--play-text)]">
                {booking.sport}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {booking.turfIcon ? (
              <img
                src={booking.turfIcon}
                alt="Venue"
                className="w-5 h-5 object-contain mt-0.5 rounded-sm"
              />
            ) : (
              <MapPin className="w-5 h-5 text-[var(--play-brand)] mt-0.5" />
            )}
            <div>
              <div className="text-xs text-[var(--play-text-muted)] font-medium">
                Venue
              </div>
              <div className="font-semibold text-[var(--play-text)]">
                {booking.venue}
              </div>
              {booking.turf && (
                <div className="text-sm text-[var(--play-text-muted)] mt-0.5">
                  {booking.turf}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-[var(--play-brand)] mt-0.5" />
              <div>
                <div className="text-xs text-[var(--play-text-muted)] font-medium">
                  Date
                </div>
                <div className="text-sm font-semibold text-[var(--play-text)]">
                  {booking.date}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[var(--play-brand)] mt-0.5" />
              <div>
                <div className="text-xs text-[var(--play-text-muted)] font-medium">
                  Time
                </div>
                <div className="text-sm font-semibold text-[var(--play-text)]">
                  {booking.time}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <User className="w-5 h-5 text-[var(--play-brand)] mt-0.5" />
            <div>
              <div className="text-xs text-[var(--play-text-muted)] font-medium">
                Guest
              </div>
              <div className="font-semibold text-[var(--play-text)]">
                {booking.guestName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
