'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Search, MapPin, Calendar, Users, Trophy, ChevronRight } from 'lucide-react';
import { TournamentCard } from '@/components/play/TournamentCard';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Tournament {
  id: string;
  name: string;
  teamSize: number;
  participationFee: number;
  venue: string | null;
  startDate: string;
  registrationDeadline: string | null;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  thumbnail?: string;
}

export default function TournamentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, error, isLoading } = useSWR<{ tournaments: Tournament[] }>('/api/client/v1/tournaments?status=all', fetcher);

  const tournaments = data?.tournaments || [];

  const filteredTournaments = tournaments.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.venue && t.venue.toLowerCase().includes(searchQuery.toLowerCase()))
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
          <TournamentCard key={tournament.id} tournament={tournament as any} />
        ))}
      </div>
    </div>
  );
}
