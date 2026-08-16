import React from 'react';
import Link from 'next/link';
import { Trophy, Calendar, Users, MapPin, ChevronRight } from 'lucide-react';

interface TournamentCardProps {
  tournament: {
    id: string;
    name: string;
    teamSize: number;
    participationFee: number;
    venue: string | null;
    startDate: string;
    registrationDeadline?: string | null;
    status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
    thumbnail?: string | null;
    sport?: { name: string; iconPath?: string | null };
  };
  compact?: boolean;
}

export function TournamentCard({ tournament, compact = false }: TournamentCardProps) {
  return (
    <Link href={`/play/tournaments/${tournament.id}`} className="block h-full">
      <div className="bg-[var(--play-surface)] border border-[var(--play-border)] rounded-[var(--play-radius-lg)] overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
        <div className={`${compact ? 'h-24' : 'h-32'} bg-[var(--play-surface-alt)] relative flex-shrink-0`}>
          {tournament.thumbnail ? (
            <img src={tournament.thumbnail} alt={tournament.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--play-brand)]">
              <Trophy size={compact ? 32 : 48} className="opacity-20" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              tournament.status === 'UPCOMING' ? 'bg-blue-100 text-blue-800' :
              tournament.status === 'ONGOING' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {tournament.status.charAt(0) + tournament.status.slice(1).toLowerCase()}
            </span>
          </div>
          {tournament.sport && (
            <div className="absolute bottom-2 left-2">
              <span className="px-2 py-1 bg-black/60 text-white backdrop-blur-sm text-xs font-bold uppercase rounded-md flex items-center gap-1">
                {tournament.sport.iconPath && <img src={tournament.sport.iconPath} alt="" className="w-3 h-3 object-contain" />}
                {tournament.sport.name}
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className={`${compact ? 'text-base' : 'text-lg'} font-bold font-outfit text-[var(--play-text)] line-clamp-1 flex-1`}>
              {tournament.name}
            </h3>
            <span className={`${compact ? 'text-base' : 'text-lg'} font-bold text-[var(--play-brand)] shrink-0`}>
              ₹{(tournament.participationFee / 100).toFixed(0)}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-y-2 text-xs sm:text-sm text-[var(--play-text-muted)] mb-4 flex-1">
            <div className="flex items-center gap-1.5">
              <Users size={14} className="shrink-0" />
              <span className="truncate">{tournament.teamSize}v{tournament.teamSize}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="shrink-0" />
              <span className="truncate">{tournament.venue || 'TBA'}</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2">
              <Calendar size={14} className="shrink-0" />
              <span className="truncate">{new Date(tournament.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-[var(--play-border)] mt-auto">
            {tournament.registrationDeadline && !compact ? (
              <span className="text-xs text-[var(--play-warning)] font-medium truncate pr-2">
                Deadline: {new Date(tournament.registrationDeadline).toLocaleDateString()}
              </span>
            ) : (
              <span className="text-xs text-[var(--play-brand)] font-medium">Register Now</span>
            )}
            <div className="flex items-center text-[var(--play-brand)] text-xs font-bold uppercase tracking-wider shrink-0">
              Details
              <ChevronRight size={14} className="ml-0.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
