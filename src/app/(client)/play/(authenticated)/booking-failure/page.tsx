import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default async function BookingFailurePage(props: {
  searchParams: Promise<{ bookingId?: string; error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const bookingId = searchParams?.bookingId;
  const error = searchParams?.error || 'Payment failed or was cancelled.';

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="bg-[var(--play-surface)] p-8 rounded-[20px] shadow-sm max-w-md w-full text-center border border-[var(--play-border)]">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold font-outfit mb-2 text-[var(--play-text)]">Booking Failed</h1>
        <p className="text-[var(--play-text-muted)] mb-6">{error}</p>
        
        <div className="flex flex-col gap-3">
          {bookingId && (
            <Link 
              href={`/play/bookings/${bookingId}`}
              className="w-full py-3 bg-[var(--play-brand)] text-white font-medium rounded-xl hover:bg-[var(--play-brand-light)] transition-colors flex justify-center items-center"
            >
              View Booking
            </Link>
          )}
          <Link 
            href="/play/dashboard"
            className="w-full py-3 bg-[var(--play-surface-alt)] text-[var(--play-text)] font-medium rounded-xl hover:bg-[var(--play-border)] transition-colors flex justify-center items-center"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
