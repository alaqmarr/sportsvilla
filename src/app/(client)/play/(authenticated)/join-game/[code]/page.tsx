'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { ChevronLeft, MapPin, Calendar, Clock, Users, Trophy } from 'lucide-react'
import Link from 'next/link'
import { GameCard } from '@/components/play/GameCard'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function JoinViaCodePage() {
  const { code } = useParams()
  const router = useRouter()
  const [isJoining, setIsJoining] = useState(false)

  const { data: inviteDetails, isLoading } = useSWR(`/api/client/v1/bookings/invite/${code}`, fetcher)

  const handleJoin = async () => {
    if (!inviteDetails?.id) return
    setIsJoining(true)
    try {
      const res = await fetch(`/api/client/v1/bookings/${inviteDetails.id}/join`, {
        method: 'POST'
      })
      if (res.ok) {
        alert('Joined successfully!')
        router.push(`/play/bookings/${inviteDetails.id}`)
      } else {
        alert('Failed to join game')
      }
    } catch (error) {
      alert('Error joining game')
    } finally {
      setIsJoining(false)
    }
  }

  if (isLoading) return <div className="p-4 text-center text-[var(--play-text-muted)] min-h-screen bg-[var(--play-bg)] pt-20">Looking up invite...</div>
  if (!inviteDetails) return (
    <div className="p-4 text-center min-h-screen bg-[var(--play-bg)] pt-20">
      <div className="bg-[var(--play-surface)] p-6 rounded-[var(--play-radius-lg)] shadow-sm max-w-sm mx-auto border border-[var(--play-error)]">
        <h2 className="text-xl font-semibold text-[var(--play-error)] mb-2">Invalid Invite Link</h2>
        <p className="text-[var(--play-text-muted)] mb-6">This invite code doesn't exist or has expired.</p>
        <Link href="/play/join-game" className="bg-[var(--play-surface-alt)] border border-[var(--play-border)] px-4 py-2 rounded-[var(--play-radius-md)] font-medium hover:bg-gray-50 block">
          Back to Games
        </Link>
      </div>
    </div>
  )

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
          <h2 className="text-2xl font-bold font-outfit mb-1">You're Invited!</h2>
          <p className="text-[var(--play-text-muted)]">Join the squad and get ready to play.</p>
        </div>

        <div className="bg-[var(--play-surface)] rounded-[var(--play-radius-lg)] border border-[var(--play-border)] overflow-hidden shadow-sm mb-8">
          <div className="bg-[var(--play-brand)] text-white p-4">
            <h3 className="font-semibold text-lg">{inviteDetails.sport.name}</h3>
            <p className="text-sm opacity-90">Hosted by {inviteDetails.host?.name || 'a member'}</p>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[var(--play-brand)] mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">{inviteDetails.venue.name}</div>
                <div className="text-sm text-[var(--play-text-muted)]">{inviteDetails.venue.address || 'Venue details'}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[var(--play-brand)] shrink-0" />
              <div className="font-medium">{new Date(inviteDetails.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[var(--play-brand)] shrink-0" />
              <div className="font-medium">{inviteDetails.slots.join(', ')}</div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-[var(--play-brand)] shrink-0" />
              <div className="font-medium">
                {inviteDetails.squad?.length || 0} / {inviteDetails.capacity || 10} joined
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleJoin}
          disabled={isJoining || (inviteDetails.squad?.length >= (inviteDetails.capacity || 10))}
          className="w-full bg-[var(--play-brand)] text-white font-semibold py-4 rounded-[var(--play-radius-lg)] text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--play-brand-dark)] transition-colors shadow-md"
        >
          {isJoining ? 'Joining...' : (inviteDetails.squad?.length >= (inviteDetails.capacity || 10) ? 'Squad is Full' : 'Join Squad')}
        </button>
      </main>
    </div>
  )
}
