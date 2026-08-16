'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { DatePicker } from '@/components/play/DatePicker'
import { SportChips } from '@/components/play/SportChips'
import { SlotGrid } from '@/components/play/SlotGrid'
import { ChevronLeft, Calendar } from 'lucide-react'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ReschedulePage() {
  const { id } = useParams()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: booking, isLoading: isLoadingBooking } = useSWR(`/api/client/v1/bookings/${id}`, fetcher)
  
  const dateStr = selectedDate.toISOString().split('T')[0]
  const { data: availability, isLoading: isLoadingSlots } = useSWR(
    booking ? `/api/client/v1/availability?sportId=${booking.sport.id}&venueId=${booking.venue.id}&date=${dateStr}` : null,
    fetcher
  )

  const handleConfirm = async () => {
    if (selectedSlots.length === 0) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/client/v1/bookings/${id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots: selectedSlots, date: dateStr })
      })
      if (res.ok) {
        router.push(`/play/bookings/${id}`)
      } else {
        alert('Failed to reschedule')
      }
    } catch (error) {
      alert('Error scheduling')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingBooking) return <div className="p-4 text-center">Loading...</div>
  if (!booking) return <div className="p-4 text-center text-[var(--play-error)]">Booking not found</div>

  return (
    <div className="min-h-screen bg-[var(--play-bg)] text-[var(--play-text)] pb-24">
      <header className="sticky top-0 z-10 bg-[var(--play-surface)] border-b border-[var(--play-border)] px-4 py-3 flex items-center gap-3">
        <Link href={`/play/bookings/${id}`} className="text-[var(--play-text)] hover:text-[var(--play-text-muted)]">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-semibold font-outfit">Reschedule Booking</h1>
      </header>

      <div className="p-4 bg-[var(--play-surface-alt)] border-b border-[var(--play-border)] mb-4">
        <h2 className="text-sm font-semibold text-[var(--play-text-muted)] mb-2 uppercase tracking-wider">Original Booking</h2>
        <div className="bg-[var(--play-surface)] p-3 rounded-[var(--play-radius-md)] border border-[var(--play-border)] shadow-sm">
          <div className="font-semibold">{booking.venue.name}</div>
          <div className="text-sm text-[var(--play-text-muted)]">{booking.sport.name}</div>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-[var(--play-brand)]" />
            <span>{new Date(booking.date).toLocaleDateString()} • {booking.slots.join(', ')}</span>
          </div>
        </div>
      </div>

      <main className="px-4 space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-[var(--play-text-muted)] mb-3">Select New Date</h2>
          <DatePicker selectedDate={selectedDate} onChange={setSelectedDate} />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-[var(--play-text-muted)] mb-3">Sport</h2>
          <SportChips sports={[booking.sport.name || booking.sport]} selectedSport={booking.sport.name || booking.sport} onChange={() => {}} />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-[var(--play-text-muted)] mb-3">Available Slots</h2>
          {isLoadingSlots ? (
            <div className="text-center py-4 text-sm text-[var(--play-text-muted)]">Loading slots...</div>
          ) : (
            <SlotGrid 
              slots={availability?.slots || []} 
              selectedSlots={selectedSlots} 
              onChange={setSelectedSlots} 
            />
          )}
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--play-surface)] border-t border-[var(--play-border)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={handleConfirm}
          disabled={selectedSlots.length === 0 || isSubmitting}
          className="w-full bg-[var(--play-brand)] text-white font-medium py-3 rounded-[var(--play-radius-md)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--play-brand-dark)] transition-colors"
        >
          {isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
        </button>
      </div>
    </div>
  )
}
