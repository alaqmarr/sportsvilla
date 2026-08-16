'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { ChevronLeft, Copy, Share2, Send, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { usePlayAuth } from '@/components/play/PlayAuthProvider'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ManageGamePage() {
  const { id } = useParams()
  const router = useRouter()
  const { member } = usePlayAuth()
  
  const { data: booking, isLoading, mutate } = useSWR(`/api/client/v1/bookings/${id}`, fetcher)
  
  const [visibility, setVisibility] = useState('Private')
  const [capacity, setCapacity] = useState(10)
  const [mobile, setMobile] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isInviting, setIsInviting] = useState(false)

  useEffect(() => {
    if (booking) {
      setVisibility(booking.visibility || 'Private')
      setCapacity(booking.capacity || 10)
    }
  }, [booking])

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/client/v1/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility, capacity })
      })
      if (res.ok) {
        mutate()
        alert('Settings updated')
      } else {
        alert('Failed to update settings')
      }
    } catch (error) {
      alert('Error updating settings')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCopyInviteCode = () => {
    if (booking?.inviteCode) {
      navigator.clipboard.writeText(booking.inviteCode)
      alert('Invite code copied!')
    }
  }

  const handleShare = async () => {
    if (navigator.share && booking) {
      try {
        await navigator.share({
          title: 'Join my game!',
          text: `Use invite code: ${booking.inviteCode}`,
          url: `${window.location.origin}/play/join-game/${booking.inviteCode}`
        })
      } catch (err) {
        console.error('Error sharing', err)
      }
    } else {
      handleCopyInviteCode()
    }
  }

  const handleSendInvite = async () => {
    if (!mobile) return
    setIsInviting(true)
    try {
      const res = await fetch(`/api/client/v1/bookings/${id}/invite-wa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      })
      if (res.ok) {
        alert('Invite sent via WhatsApp')
        setMobile('')
      } else {
        alert('Failed to send invite')
      }
    } catch (error) {
      alert('Error sending invite')
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return
    try {
      const res = await fetch(`/api/client/v1/bookings/${id}/join`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId })
      })
      if (res.ok) {
        mutate()
      } else {
        alert('Failed to remove member')
      }
    } catch (error) {
      alert('Error removing member')
    }
  }

  if (isLoading) return <div className="p-4 text-center">Loading...</div>
  if (!booking) return <div className="p-4 text-center text-[var(--play-error)]">Booking not found</div>

  return (
    <div className="min-h-screen bg-[var(--play-bg)] text-[var(--play-text)] pb-24">
      <header className="sticky top-0 z-10 bg-[var(--play-surface)] border-b border-[var(--play-border)] px-4 py-3 flex items-center gap-3">
        <Link href={`/play/bookings/${id}`} className="text-[var(--play-text)] hover:text-[var(--play-text-muted)]">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-semibold font-outfit">Manage Game</h1>
      </header>

      <main className="px-4 py-6 space-y-8">
        {/* Settings Form */}
        <section className="bg-[var(--play-surface)] p-4 rounded-[var(--play-radius-md)] border border-[var(--play-border)] shadow-sm">
          <h2 className="text-base font-semibold mb-4 border-b border-[var(--play-border)] pb-2">Game Settings</h2>
          <form onSubmit={handleUpdateSettings} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--play-text-muted)] mb-1">Game Visibility</label>
              <select 
                value={visibility} 
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full border border-[var(--play-border)] rounded-[var(--play-radius-md)] p-2 bg-[var(--play-bg)]"
              >
                <option value="Private">Private</option>
                <option value="Invite Only">Invite Only</option>
                <option value="Open">Open</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--play-text-muted)] mb-1">Squad Capacity</label>
              <input 
                type="number" 
                value={capacity} 
                onChange={(e) => setCapacity(Number(e.target.value))}
                min={2}
                className="w-full border border-[var(--play-border)] rounded-[var(--play-radius-md)] p-2 bg-[var(--play-bg)]"
              />
            </div>
            <button 
              type="submit" 
              disabled={isUpdating}
              className="w-full bg-[var(--play-brand)] text-white py-2 rounded-[var(--play-radius-md)] font-medium hover:bg-[var(--play-brand-dark)] transition-colors disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </section>

        {/* Invite Code */}
        <section className="bg-[var(--play-surface)] p-4 rounded-[var(--play-radius-md)] border border-[var(--play-border)] shadow-sm">
          <h2 className="text-base font-semibold mb-4 border-b border-[var(--play-border)] pb-2">Invite Code</h2>
          <div className="flex items-center justify-between bg-[var(--play-bg)] p-3 rounded-[var(--play-radius-md)] border border-[var(--play-border)] mb-4">
            <span className="text-lg font-mono font-bold tracking-wider">{booking.inviteCode || 'N/A'}</span>
            <div className="flex gap-2">
              <button onClick={handleCopyInviteCode} className="p-2 bg-[var(--play-surface)] rounded-full shadow-sm hover:bg-gray-50 border border-[var(--play-border)]">
                <Copy className="w-4 h-4 text-[var(--play-text-muted)]" />
              </button>
              <button onClick={handleShare} className="p-2 bg-[var(--play-surface)] rounded-full shadow-sm hover:bg-gray-50 border border-[var(--play-border)]">
                <Share2 className="w-4 h-4 text-[var(--play-text-muted)]" />
              </button>
            </div>
          </div>
        </section>

        {/* WhatsApp Invite */}
        <section className="bg-[var(--play-surface)] p-4 rounded-[var(--play-radius-md)] border border-[var(--play-border)] shadow-sm">
          <h2 className="text-base font-semibold mb-4 border-b border-[var(--play-border)] pb-2">WhatsApp Invite</h2>
          <div className="flex gap-2">
            <input 
              type="tel" 
              placeholder="Enter mobile number" 
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="flex-1 border border-[var(--play-border)] rounded-[var(--play-radius-md)] p-2 bg-[var(--play-bg)]"
            />
            <button 
              onClick={handleSendInvite}
              disabled={isInviting || !mobile}
              className="bg-[var(--play-brand)] text-white px-4 py-2 rounded-[var(--play-radius-md)] font-medium hover:bg-[var(--play-brand-dark)] transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Squad Roster */}
        <section className="bg-[var(--play-surface)] p-4 rounded-[var(--play-radius-md)] border border-[var(--play-border)] shadow-sm">
          <div className="flex justify-between items-center border-b border-[var(--play-border)] mb-4 pb-2">
            <h2 className="text-base font-semibold">Squad Roster</h2>
            <span className="text-sm text-[var(--play-text-muted)]">{booking.squad?.length || 0} / {capacity}</span>
          </div>
          
          <ul className="space-y-3">
            {booking.squad?.map((squadMember: any) => (
              <li key={squadMember.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--play-brand-light)] text-[var(--play-brand-dark)] rounded-full flex items-center justify-center font-bold">
                    {squadMember.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{squadMember.name}</div>
                    {squadMember.id === booking.hostId && (
                      <span className="text-xs bg-[var(--play-brand-light)] text-[var(--play-brand-dark)] px-2 py-0.5 rounded-[var(--play-radius-pill)]">Host</span>
                    )}
                  </div>
                </div>
                {squadMember.id !== booking.hostId && (
                  <button 
                    onClick={() => handleRemoveMember(squadMember.id)}
                    className="p-2 text-[var(--play-error)] hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
            {(!booking.squad || booking.squad.length === 0) && (
              <li className="text-sm text-[var(--play-text-muted)] text-center py-2">No squad members yet</li>
            )}
          </ul>
        </section>
      </main>
    </div>
  )
}
