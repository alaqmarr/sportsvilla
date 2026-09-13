'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { ChevronLeft, MapPin, Calendar, Clock, Users, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useAlert } from '@/components/AlertProvider';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function JoinViaCodePage() {
  const params = useParams();
  const rawCode = params?.code;
  const code = typeof rawCode === 'string' ? rawCode : Array.isArray(rawCode) ? rawCode[0] : '';
  const router = useRouter();
  const { showAlert } = useAlert();
  const [isJoining, setIsJoining] = useState(false);

  const { data: res, isLoading, error } = useSWR(code ? `/api/client/v1/bookings/invite/${code}` : null, fetcher);

  const booking = res?.booking ?? (res?.id ? res : null);

  const handleJoin = async () => {
    if (!booking?.id) return;
    setIsJoining(true);
    try {
      const joinRes = await fetch(`/api/client/v1/bookings/${booking.id}/join`, {
        method: 'POST'
      });
      if (joinRes.ok) {
        showAlert('Success', 'Joined successfully!', 'success');
        router.push(`/play/bookings/${booking.id}`);
      } else {
        const errorData = await joinRes.json().catch(() => ({}));
        showAlert('Error', errorData.error || 'Failed to join game', 'error');
      }
    } catch (err) {
      showAlert('Error', 'Error joining game', 'error');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-[var(--play-text-muted)] min-h-screen bg-[var(--play-bg)] pt-20">
        Looking up invite...
      </div>
    );
  }

  if (!booking || error || res?.error) {
    return (
      <div className="p-4 text-center min-h-screen bg-[var(--play-bg)] pt-20">
        <div className="bg-[var(--play-surface)] p-6 rounded-[var(--play-radius-lg)] shadow-sm max-w-sm mx-auto border border-[var(--play-error)]">
          <h2 className="text-xl font-semibold text-[var(--play-error)] mb-2">Invalid Invite Link</h2>
          <p className="text-[var(--play-text-muted)] mb-6">
            {res?.error || "This invite code doesn't exist or has expired."}
          </p>
          <Link href="/play" className="bg-[var(--play-surface-alt)] border border-[var(--play-border)] px-4 py-2 rounded-[var(--play-radius-md)] font-medium hover:bg-gray-50 block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const squad = booking.participants || booking.squad || [];
  const capacity = booking.inviteMaxCount || (booking.turf?.capacityPerSlot ? booking.turf.capacityPerSlot * 2 : 10);
  const isFull = squad.length >= capacity;

  const formatSlotTime = () => {
    if (Array.isArray(booking.slots) && booking.slots.length > 0) {
      return booking.slots.join(', ');
    }
    if (booking.startTime && booking.endTime) {
      const s = new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const e = new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${s} - ${e}`;
    }
    if (booking.startTime) {
      return new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return 'Time slot not specified';
  };

  return (
    <div className="min-h-screen bg-[var(--play-bg)] text-[var(--play-text)]">
      <header className="bg-[var(--play-surface)] border-b border-[var(--play-border)] px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-[var(--play-text)] hover:text-[var(--play-text-muted)]">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold font-outfit">Join Game</h1>
      </header>

      <main className="px-4 py-8 max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--play-brand-light)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-[var(--play-brand)]" />
          </div>
          <h2 className="text-2xl font-bold font-outfit mb-1">You&apos;re Invited!</h2>
          <p className="text-[var(--play-text-muted)]">Join the squad and get ready to play.</p>
        </div>

        <div className="bg-[var(--play-surface)] rounded-[var(--play-radius-lg)] border border-[var(--play-border)] overflow-hidden shadow-sm mb-8">
          <div className="bg-[var(--play-brand)] text-white p-4">
            <h3 className="font-semibold text-lg">{booking.sport?.name || 'Sports Match'}</h3>
            <p className="text-sm opacity-90">Hosted by {booking.member?.name || booking.host?.name || 'a member'}</p>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[var(--play-brand)] mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">{booking.turf?.name || booking.venue?.name || 'SportsVilla Court'}</div>
                <div className="text-sm text-[var(--play-text-muted)]">
                  {booking.turf?.location || booking.turf?.address || booking.venue?.address || 'Main Campus'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[var(--play-brand)] shrink-0" />
              <div className="font-medium">
                {booking.startTime 
                  ? new Date(booking.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
                  : (booking.date ? new Date(booking.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date not specified')}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[var(--play-brand)] shrink-0" />
              <div className="font-medium">{formatSlotTime()}</div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-[var(--play-brand)] shrink-0" />
              <div className="font-medium">
                {squad.length} / {capacity} joined
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleJoin}
          disabled={isJoining || isFull}
          className="w-full bg-[var(--play-brand)] text-white font-semibold py-4 rounded-[var(--play-radius-lg)] text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--play-brand-dark)] transition-colors shadow-md"
        >
          {isJoining ? 'Joining...' : (isFull ? 'Squad is Full' : 'Join Squad')}
        </button>
      </main>
    </div>
  );
}
