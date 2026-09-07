import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default async function BookingSuccessPage(props: {
  searchParams: Promise<{ bookingId?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const bookingId = searchParams?.bookingId;
  const isPending = searchParams?.status === 'pending';

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="bg-[var(--play-surface)] p-8 rounded-[20px] shadow-sm max-w-md w-full text-center border border-[var(--play-border)]">
        {isPending ? (
          <>
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-yellow-600 text-2xl">⏳</span>
            </div>
            <h1 className="text-2xl font-bold font-outfit mb-2 text-[var(--play-text)]">Payment Pending</h1>
            <p className="text-[var(--play-text-muted)] mb-6">Your payment is processing. We will notify you once confirmed.</p>
          </>
        ) : (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-outfit mb-2 text-[var(--play-text)]">Booking Confirmed!</h1>
            <p className="text-[var(--play-text-muted)] mb-6">Your booking has been successfully confirmed.</p>
          </>
        )}
        
        <div className="flex flex-col gap-3">
          {bookingId && (
            <Link 
              href={`/play/bookings/${bookingId}`}
              className="w-full py-3 bg-[var(--play-brand)] text-white font-medium rounded-xl hover:bg-[var(--play-brand-light)] transition-colors flex justify-center items-center"
            >
              View Booking Details
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
