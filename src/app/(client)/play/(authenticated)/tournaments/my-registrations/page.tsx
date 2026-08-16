'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { ChevronLeft, Calendar, MapPin, Users, CheckCircle2, Clock, XCircle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Registration {
  id: string;
  tournamentName: string;
  tournamentId: string;
  teamName: string;
  date: string;
  venue: string;
  format: string;
  status: 'pending' | 'verified' | 'rejected';
}

export default function MyRegistrationsPage() {
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
  const { data, error, isLoading } = useSWR<{ data: Registration[] }>('/api/client/v1/tournaments/my-registrations', fetcher);

  const registrations = data?.data || [];

  const filteredRegistrations = registrations.filter(reg => {
    const regDate = new Date(reg.date);
    const now = new Date();
    if (filter === 'upcoming') return regDate >= now;
    return regDate < now;
  });

  return (
    <div className="min-h-screen bg-[var(--play-bg)]">
      <div className="bg-[var(--play-surface)] sticky top-0 z-10 border-b border-[var(--play-border)]">
        <div className="px-4 py-4 max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/play/tournaments" className="p-1 hover:bg-[var(--play-surface-alt)] rounded-full transition-colors">
            <ChevronLeft className="text-[var(--play-text)]" />
          </Link>
          <h1 className="text-xl font-bold font-outfit text-[var(--play-text)]">My Registrations</h1>
        </div>

        <div className="px-4 pb-0 max-w-3xl mx-auto flex gap-4">
          <button
            onClick={() => setFilter('upcoming')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              filter === 'upcoming' 
                ? 'border-[var(--play-brand)] text-[var(--play-brand)]' 
                : 'border-transparent text-[var(--play-text-muted)] hover:text-[var(--play-text)]'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              filter === 'past' 
                ? 'border-[var(--play-brand)] text-[var(--play-brand)]' 
                : 'border-transparent text-[var(--play-text-muted)] hover:text-[var(--play-text)]'
            }`}
          >
            Past Events
          </button>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto space-y-4 mt-2">
        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--play-brand)]"></div>
          </div>
        )}
        
        {error && (
          <div className="text-center py-10 text-[var(--play-error)] bg-red-50 rounded-[var(--play-radius-md)] border border-red-100">
            Failed to load registrations.
          </div>
        )}

        {!isLoading && !error && filteredRegistrations.length === 0 && (
          <div className="text-center py-12 px-4 bg-[var(--play-surface)] rounded-[var(--play-radius-lg)] border border-[var(--play-border)]">
            <div className="w-16 h-16 bg-[var(--play-surface-alt)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-[var(--play-text-muted)]" size={24} />
            </div>
            <h3 className="text-lg font-bold text-[var(--play-text)] mb-2">No registrations found</h3>
            <p className="text-[var(--play-text-muted)] text-sm mb-6">
              You haven't registered for any {filter} tournaments yet.
            </p>
            <Link 
              href="/play/tournaments"
              className="inline-block bg-[var(--play-brand)] text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-[var(--play-brand-dark)] transition-colors"
            >
              Browse Tournaments
            </Link>
          </div>
        )}

        {filteredRegistrations.map((reg) => (
          <div key={reg.id} className="bg-[var(--play-surface)] border border-[var(--play-border)] rounded-[var(--play-radius-lg)] overflow-hidden">
            <div className="p-4 border-b border-[var(--play-border)] bg-[var(--play-surface-alt)] flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-[var(--play-text-muted)] uppercase tracking-wider mb-1 block">Team Name</span>
                <h3 className="text-lg font-bold text-[var(--play-text)]">{reg.teamName}</h3>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                reg.status === 'verified' ? 'bg-green-100 text-green-700' :
                reg.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {reg.status === 'verified' && <CheckCircle2 size={14} />}
                {reg.status === 'pending' && <Clock size={14} />}
                {reg.status === 'rejected' && <XCircle size={14} />}
                <span className="capitalize">{reg.status}</span>
              </div>
            </div>
            
            <div className="p-4">
              <Link href={`/play/tournaments/${reg.tournamentId}`} className="block group">
                <h4 className="font-bold font-outfit text-[var(--play-text)] group-hover:text-[var(--play-brand)] transition-colors mb-3">
                  {reg.tournamentName}
                </h4>
              </Link>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-[var(--play-text-muted)]">
                <div className="flex items-center gap-1.5">
                  <Calendar size={16} className="text-[var(--play-brand)]" />
                  <span>{new Date(reg.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-[var(--play-brand)]" />
                  <span className="truncate">{reg.venue}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <Users size={16} className="text-[var(--play-brand)]" />
                  <span>{reg.format} Format</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
