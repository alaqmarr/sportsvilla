'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FilterChips } from '@/components/play/FilterChips'
import { GameCard } from '@/components/play/GameCard'
import { Modal } from '@/components/play/Modal'
import { ReviewPanel } from '@/components/play/ReviewPanel'
import { ProcessingDialog, ProcessStatus } from '@/components/play/ProcessingDialog'
import { Search, MapPin, Users, Calendar, Clock, X } from 'lucide-react'

export function JoinGameClient({ initialOpenGames, sportOptions, member }: { initialOpenGames: any[], sportOptions: any[], member: any }) {
  const router = useRouter()
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [selectedSport, setSelectedSport] = useState<string | null>(null)
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [isReviewing, setIsReviewing] = useState(false)
  const [processStatus, setProcessStatus] = useState<ProcessStatus>('idle')
  const [processMessage, setProcessMessage] = useState('')

  const [openGames, setOpenGames] = useState(initialOpenGames)

  const handleJoinViaCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (inviteCode.trim()) {
      router.push(`/play/join-game/${inviteCode.trim()}`)
    }
  }

  const handleConfirmJoin = async (couponCode: string, walletDeduction: number, pointsDeduction: number, walletOtp?: string) => {
    if (!selectedGameId) return
    setProcessStatus('processing')
    try {
      const res = await fetch(`/api/client/v1/bookings/${selectedGameId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAmountToUse: walletDeduction,
          walletOtp: walletOtp || undefined,
          pointsAmountToUse: pointsDeduction,
          couponCode: couponCode || undefined
        })
      })
      if (res.ok) {
        setIsReviewing(false)
        setSelectedGameId(null)
        setProcessStatus('success')
        setTimeout(() => {
          router.refresh()
          setProcessStatus('idle')
        }, 1500)
      } else {
        const result = await res.json()
        setProcessStatus('error')
        setProcessMessage(result.error || 'Failed to join squad')
      }
    } catch (error) {
      setProcessStatus('error')
      setProcessMessage('Error joining squad')
    }
  }

  const filteredGames = selectedSport && openGames.length > 0
    ? openGames.filter((game: any) => game.sportId === selectedSport || game.sport?.id === selectedSport)
    : openGames

  const selectedGame = openGames.find((g: any) => g.id === selectedGameId)

  return (
    <div className="min-h-screen bg-[var(--play-bg)] text-[var(--play-text)] pb-24">
      {/* Search Header */}
      <div className="p-4 sm:p-6 lg:p-8 bg-[var(--play-surface)] sticky top-0 z-10 border-b border-[var(--play-border)] shadow-sm">
        <h1 className="text-2xl font-bold font-outfit mb-4">Join a Game</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--play-text-muted)] w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by area or sport..." 
              className="w-full pl-10 pr-4 py-3 bg-[var(--play-bg)] border border-[var(--play-border)] rounded-xl focus:outline-none focus:border-[var(--play-brand)] transition-colors text-[var(--play-text)]"
            />
          </div>
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-3 bg-[var(--play-surface-alt)] hover:bg-[var(--play-border)] border border-[var(--play-border)] rounded-xl font-medium transition-colors whitespace-nowrap"
          >
            Use Code
          </button>
        </div>
      </div>

      {/* Sport Filters */}
      <div className="p-4 sm:px-6">
        <FilterChips 
          options={[{ id: 'all', label: 'All' }, ...sportOptions]}
          selectedId={selectedSport || 'all'}
          onSelect={(id) => setSelectedSport(id === 'all' ? null : id)}
        />
      </div>

      {/* Open Games List */}
      <div className="px-4 sm:px-6 lg:px-8">
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGames.map((game: any) => (
              <div 
                key={game.id} 
                onClick={() => setSelectedGameId(game.id)}
                className="cursor-pointer"
              >
                <GameCard 
                  game={{
                    id: game.id,
                    sport: game.sport?.name || 'Sport',
                    venue: game.turf?.name || 'Turf',
                    time: new Date(game.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    joinedCount: game.participants?.length || 1,
                    maxPlayers: (game.turf?.capacityPerSlot || 1) * 2,
                    hostName: game.member?.name || 'Player'
                  }} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-[var(--play-surface)] rounded-[var(--play-radius-lg)] border border-[var(--play-border)]">
            <div className="w-16 h-16 bg-[var(--play-surface-alt)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-[var(--play-text-muted)]" />
            </div>
            <h2 className="text-xl font-bold mb-2">No Open Games</h2>
            <p className="text-[var(--play-text-muted)] mb-6 max-w-md mx-auto">
              There are no open games for the selected sport right now. Why not create one yourself?
            </p>
            <button 
              onClick={() => router.push('/play/book')}
              className="px-6 py-3 bg-[var(--play-brand)] text-white font-bold rounded-[var(--play-radius-md)] hover:brightness-110 transition-all"
            >
              Host a Game
            </button>
          </div>
        )}
      </div>

      {/* Invite Code Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} size="sm">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold font-outfit mb-4 text-[var(--play-text)]">Join via Invite Code</h2>
          <form onSubmit={handleJoinViaCode}>
            <input 
              type="text" 
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g. SQUAD123" 
              className="w-full px-4 py-3 bg-[var(--play-bg)] border border-[var(--play-border)] rounded-xl mb-4 font-mono text-center text-lg tracking-wider focus:outline-none focus:border-[var(--play-brand)] text-[var(--play-text)]"
              autoFocus
            />
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="flex-1 py-3 bg-[var(--play-surface-alt)] text-[var(--play-text)] font-medium rounded-xl hover:bg-[var(--play-border)] transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={!inviteCode.trim()}
                className="flex-1 py-3 bg-[var(--play-brand)] text-white font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
              >
                Join
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Game Details Modal */}
      {selectedGame && !isReviewing && (
        <Modal isOpen={!!selectedGameId} onClose={() => setSelectedGameId(null)} size="md" noPadding>
          <div className="flex flex-col bg-[var(--play-surface)]">
            <div className="relative h-40 bg-gradient-to-br from-[var(--play-brand)] to-emerald-700">
              <div className="absolute bottom-4 left-4 text-white">
                <span className="px-3 py-1 bg-black/30 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm mb-2 inline-block">
                  {selectedGame.sport?.name}
                </span>
                <h2 className="text-2xl font-bold font-outfit">{selectedGame.turf?.name}</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="text-[var(--play-brand)] w-5 h-5" />
                  <div>
                    <p className="text-xs text-[var(--play-text-muted)]">Date</p>
                    <p className="font-bold">{new Date(selectedGame.startTime).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-[var(--play-brand)] w-5 h-5" />
                  <div>
                    <p className="text-xs text-[var(--play-text-muted)]">Time</p>
                    <p className="font-bold">{new Date(selectedGame.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 col-span-2">
                  <MapPin className="text-[var(--play-brand)] w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--play-text-muted)]">Location</p>
                    <p className="font-bold">{selectedGame.turf?.location || selectedGame.turf?.name}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--play-bg)] rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm text-[var(--play-text-muted)] uppercase tracking-wider">Players</h3>
                  <span className="text-sm font-bold bg-[var(--play-surface-alt)] px-2 py-1 rounded">
                    {selectedGame.participants?.length || 1} / {(selectedGame.turf?.capacityPerSlot || 1) * 2}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--play-brand)]/20 text-[var(--play-brand)] flex items-center justify-center font-bold text-sm text-white">
                      {selectedGame.member?.name?.[0] || 'O'}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{selectedGame.member?.name || 'Organizer'}</p>
                      <p className="text-xs text-[var(--play-brand)]">Host</p>
                    </div>
                  </div>
                  {selectedGame.participants?.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--play-surface-alt)] text-[var(--play-text)] flex items-center justify-center font-bold text-sm">
                        {p.member?.name?.[0] || 'P'}
                      </div>
                      <p className="font-bold text-sm">{p.member?.name || 'Player'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setIsReviewing(true)}
                disabled={processStatus === 'processing' || (selectedGame.participants?.length || 1) >= ((selectedGame.turf?.capacityPerSlot || 1) * 2)}
                className="w-full bg-[var(--play-brand)] text-white font-bold py-4 rounded-[var(--play-radius-md)] hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processStatus === 'processing' ? 'Joining...' : ((selectedGame.participants?.length || 1) >= ((selectedGame.turf?.capacityPerSlot || 1) * 2)) ? 'Squad Full' : 'Join Squad'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Review & Pay Modal */}
      {selectedGame && isReviewing && (
        <div className="fixed inset-0 z-50 bg-[var(--play-bg)] overflow-hidden flex flex-col">
          <ReviewPanel
            selectedSlots={[new Date(selectedGame.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })]}
            timeDisplayOverride={`${new Date(selectedGame.startTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} - ${new Date(selectedGame.endTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}`}
            selectedTurf={selectedGame.turf?.name || 'Unknown Turf'}
            price={selectedGame.price / ((selectedGame.turf?.capacityPerSlot || 1) * 2)} // Price per slot
            walletBalance={(member?.walletBalance || 0) / 100}
            pointsBalance={member?.loyaltyPoints || 0}
            onApplyCoupon={(c) => {}}
            onRedeemPoints={() => {}}
            onConfirm={handleConfirmJoin}
            onClose={() => setIsReviewing(false)}
          />
        </div>
      )}

      {/* Processing Dialog */}
      <ProcessingDialog 
        isOpen={processStatus !== 'idle'} 
        status={processStatus}
        errorMessage={processMessage}
        onClose={() => setProcessStatus('idle')}
      />
    </div>
  )
}
