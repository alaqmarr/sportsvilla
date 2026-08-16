'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { FilterChips } from '@/components/play/FilterChips'
import { GameCard } from '@/components/play/GameCard'
import { Modal } from '@/components/play/Modal'
import { Search, MapPin, Users, Calendar, Clock, X } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function JoinGamePage() {
  const router = useRouter()
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [selectedSport, setSelectedSport] = useState<string | null>(null)
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)

  const { data, isLoading, mutate } = useSWR('/api/client/v1/bookings/open', fetcher)
  const { data: sportsData } = useSWR('/api/client/v1/sports', fetcher)
  const openGames = data?.openGames || []
  const sportOptions = sportsData?.sports?.map((s: any) => ({ id: s.id, label: s.name })) || []

  const handleJoinViaCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (inviteCode.trim()) {
      router.push(`/play/join-game/${inviteCode.trim()}`)
    }
  }

  const handleJoinSquad = async (id: string) => {
    setIsJoining(true)
    try {
      const res = await fetch(`/api/client/v1/bookings/${id}/join`, {
        method: 'POST'
      })
      if (res.ok) {
        alert('Successfully joined the squad!')
        setSelectedGameId(null)
        mutate() // Refresh open games
      } else {
        alert('Failed to join squad')
      }
    } catch (error) {
      alert('Error joining squad')
    } finally {
      setIsJoining(false)
    }
  }

  const filteredGames = selectedSport && openGames.length > 0
    ? openGames.filter((game: any) => game.sportId === selectedSport || game.sport?.id === selectedSport)
    : openGames

  const selectedGame = openGames.find((g: any) => g.id === selectedGameId)

  return (
    <div className="min-h-screen bg-[var(--play-bg)] text-[var(--play-text)] pb-24">
      <header className="sticky top-0 z-10 bg-[var(--play-surface)] border-b border-[var(--play-border)] px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold font-outfit">Join a Game</h1>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="text-sm font-medium text-[var(--play-brand)] bg-[var(--play-brand-light)] px-3 py-1.5 rounded-[var(--play-radius-pill)]"
        >
          Join via Code
        </button>
      </header>

      <div className="px-4 py-4">
        {sportOptions.length > 0 && (
          <FilterChips 
            options={sportOptions} 
            selectedId={selectedSport || ''} 
            onSelect={setSelectedSport} 
          />
        )}
      </div>

      <main className="px-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-[var(--play-text-muted)]">Loading open games...</div>
        ) : filteredGames?.length > 0 ? (
          filteredGames.map((game: any) => (
            <div key={game.id} onClick={() => setSelectedGameId(game.id)} className="cursor-pointer">
              <GameCard game={game} />
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-[var(--play-border)] mx-auto mb-3" />
            <h3 className="text-lg font-medium text-[var(--play-text)]">No games found</h3>
            <p className="text-[var(--play-text-muted)]">Check back later or start your own game!</p>
          </div>
        )}
      </main>

      {/* Invite Code Modal */}
      {isInviteModalOpen && (
        <Modal isOpen={true} onClose={() => setIsInviteModalOpen(false)}>
          <div className="p-6 bg-[var(--play-surface)] rounded-t-[var(--play-radius-lg)] shadow-xl relative mt-auto">
            <button 
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-[var(--play-text-muted)] hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold mb-2 font-outfit">Join via Invite Code</h2>
            <p className="text-sm text-[var(--play-text-muted)] mb-4">Enter the code shared by the host</p>
            <form onSubmit={handleJoinViaCode}>
              <input 
                type="text" 
                placeholder="e.g. AB12CD" 
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full text-center text-xl tracking-widest font-mono border border-[var(--play-border)] rounded-[var(--play-radius-md)] p-3 bg-[var(--play-bg)] mb-4 uppercase"
                maxLength={6}
              />
              <button 
                type="submit"
                disabled={!inviteCode.trim()}
                className="w-full bg-[var(--play-brand)] text-white font-medium py-3 rounded-[var(--play-radius-md)] disabled:opacity-50"
              >
                Find Game
              </button>
            </form>
          </div>
        </Modal>
      )}

      {/* Game Details Drawer/Modal */}
      {selectedGameId && selectedGame && (
        <Modal isOpen={true} onClose={() => setSelectedGameId(null)}>
          <div className="bg-[var(--play-surface)] w-full max-w-md mt-auto rounded-t-[var(--play-radius-lg)] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[var(--play-border)] flex justify-between items-center sticky top-0 bg-[var(--play-surface)] rounded-t-[var(--play-radius-lg)] z-10">
              <h2 className="font-semibold text-lg font-outfit">Game Details</h2>
              <button onClick={() => setSelectedGameId(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">{selectedGame.sport?.name}</h3>
                <div className="flex items-center text-[var(--play-text-muted)] mb-3 gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{selectedGame.turf?.name}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-[var(--play-bg)] p-3 rounded-[var(--play-radius-md)] border border-[var(--play-border)]">
                    <div className="flex items-center gap-2 text-[var(--play-text-muted)] mb-1 text-xs uppercase tracking-wider font-semibold">
                      <Calendar className="w-3.5 h-3.5" /> Date
                    </div>
                    <div className="font-medium">
                      {selectedGame.startTime ? new Date(selectedGame.startTime).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-[var(--play-bg)] p-3 rounded-[var(--play-radius-md)] border border-[var(--play-border)]">
                    <div className="flex items-center gap-2 text-[var(--play-text-muted)] mb-1 text-xs uppercase tracking-wider font-semibold">
                      <Clock className="w-3.5 h-3.5" /> Time
                    </div>
                    <div className="font-medium text-sm">
                      {selectedGame.startTime && selectedGame.endTime 
                        ? `${new Date(selectedGame.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })} - ${new Date(selectedGame.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}` 
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-[var(--play-text-muted)]">Squad Roster</h4>
                  <div className="flex items-center gap-1 text-sm bg-[var(--play-brand-light)] text-[var(--play-brand-dark)] px-2 py-0.5 rounded-[var(--play-radius-pill)] font-medium">
                    <Users className="w-3.5 h-3.5" />
                    <span>{selectedGame.participantCount || selectedGame.participants?.length || 0} / {selectedGame.inviteMaxCount || 10}</span>
                  </div>
                </div>
                
                <ul className="space-y-3 bg-[var(--play-surface-alt)] p-3 rounded-[var(--play-radius-md)] border border-[var(--play-border)]">
                  {selectedGame.participants?.map((p: any) => (
                    <li key={p.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white border border-[var(--play-border)] text-[var(--play-text-muted)] rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                        {p.member?.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm font-medium">{p.member?.name || 'Unknown'}</span>
                      {p.member?.id === selectedGame.memberId && (
                        <span className="ml-auto text-[10px] uppercase font-bold tracking-wider text-[var(--play-brand)]">Host</span>
                      )}
                    </li>
                  ))}
                  {(!selectedGame.participants || selectedGame.participants.length === 0) && (
                    <li className="text-sm text-[var(--play-text-muted)] text-center py-2">Be the first to join!</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--play-border)] bg-[var(--play-surface)] mt-auto">
              <button 
                onClick={() => handleJoinSquad(selectedGame.id)}
                disabled={isJoining || ((selectedGame.participantCount || selectedGame.participants?.length || 0) >= (selectedGame.inviteMaxCount || 10))}
                className="w-full bg-[var(--play-brand)] text-white font-medium py-3 rounded-[var(--play-radius-md)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--play-brand-dark)] transition-colors shadow-sm"
              >
                {isJoining ? 'Joining...' : ((selectedGame.participantCount || selectedGame.participants?.length || 0) >= (selectedGame.inviteMaxCount || 10) ? 'Squad Full' : 'Join Squad')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
