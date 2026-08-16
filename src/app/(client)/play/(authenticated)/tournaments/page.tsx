'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Search, MapPin, Calendar, Users, Trophy, ChevronRight } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Tournament {
  id: string;
  name: string;
  format: string;
  entryFee: number;
  venue: string;
  startDate: string;
  registrationDeadline: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  thumbnailUrl?: string;
}

export default function TournamentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, error, isLoading } = useSWR<{ data: Tournament[] }>('/api/client/v1/tournaments', fetcher);

  const tournaments = data?.data || [];

  const filteredTournaments = tournaments.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--play-bg)] pb-20">
      <div className="bg-[var(--play-surface)] sticky top-0 z-10 border-b border-[var(--play-border)]">
        <div className="px-4 py-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold font-outfit text-[var(--play-text)]">Tournaments</h1>
            <Link 
              href="/play/tournaments/my-registrations"
              className="text-sm font-medium text-[var(--play-brand)] bg-[var(--play-brand-light)] px-3 py-1.5 rounded-full hover:bg-[var(--play-brand)] hover:text-white transition-colors"
            >
              My Registrations
            </Link>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[var(--play-text-muted)]" />
            </div>
            <input
              type="text"
              placeholder="Search tournaments by name or venue..."
              className="w-full pl-10 pr-4 py-3 bg-[var(--play-bg)] border border-[var(--play-border)] rounded-[var(--play-radius-md)] focus:outline-none focus:border-[var(--play-brand)] text-[var(--play-text)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto space-y-4">
        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--play-brand)]"></div>
          </div>
        )}
        
        {error && (
          <div className="text-center py-10 text-[var(--play-error)]">
            Failed to load tournaments. Please try again.
          </div>
        )}

        {!isLoading && !error && filteredTournaments.length === 0 && (
          <div className="text-center py-10 text-[var(--play-text-muted)]">
            No tournaments found.
          </div>
        )}

        {filteredTournaments.map((tournament) => (
          <Link key={tournament.id} href={`/play/tournaments/${tournament.id}`}>
            <div className="bg-[var(--play-surface)] border border-[var(--play-border)] rounded-[var(--play-radius-lg)] overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 bg-[var(--play-surface-alt)] relative">
                {tournament.thumbnailUrl ? (
                  <img src={tournament.thumbnailUrl} alt={tournament.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--play-brand)]">
                    <Trophy size={48} className="opacity-20" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    tournament.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold font-outfit text-[var(--play-text)] line-clamp-1">{tournament.name}</h3>
                  <span className="text-lg font-bold text-[var(--play-brand)]">₹{tournament.entryFee}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 text-sm text-[var(--play-text-muted)] mb-4">
                  <div className="flex items-center gap-1.5">
                    <Users size={16} />
                    <span>{tournament.format}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} />
                    <span className="truncate">{tournament.venue}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={16} />
                    <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-[var(--play-border)]">
                  <span className="text-xs text-[var(--play-warning)] font-medium">
                    Deadline: {new Date(tournament.registrationDeadline).toLocaleDateString()}
                  </span>
                  <div className="flex items-center text-[var(--play-brand)] text-sm font-medium">
                    View Details
                    <ChevronRight size={16} className="ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
