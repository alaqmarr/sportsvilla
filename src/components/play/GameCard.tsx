import React from 'react';
import { Users, Clock, MapPin, Activity } from 'lucide-react';

export interface Game {
  id: string;
  sport: string;
  venue: string;
  time: string;
  joinedCount: number;
  maxPlayers: number;
  hostName: string;
  hostAvatar?: string;
}

interface GameCardProps {
  game: Game;
  onJoin?: (gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onJoin }) => {
  const percentage = Math.min((game.joinedCount / game.maxPlayers) * 100, 100);
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-[var(--play-surface)] rounded-[var(--play-radius-md)] border border-[var(--play-border)] p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-[var(--play-text)] mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--play-brand)]" />
            {game.sport}
          </h3>
          <p className="text-sm text-[var(--play-text-muted)] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {game.venue}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-[var(--play-surface-alt)] px-2.5 py-1 rounded-full text-xs font-medium text-[var(--play-text)]">
          <Clock className="w-3.5 h-3.5 text-[var(--play-brand)]" />
          {game.time}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-end mb-1.5">
          <div className="text-sm font-medium text-[var(--play-text)] flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[var(--play-text-muted)]" />
            Squad
          </div>
          <div className="text-xs font-medium text-[var(--play-text-muted)]">
            <span className="text-[var(--play-text)]">{game.joinedCount}</span> / {game.maxPlayers} joined
          </div>
        </div>
        <div className="h-2 w-full bg-[var(--play-border)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--play-brand)] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--play-border)]">
        <div className="flex items-center gap-2.5">
          {game.hostAvatar ? (
            <img src={game.hostAvatar} alt={game.hostName} className="w-8 h-8 rounded-full object-cover bg-[var(--play-surface-alt)]" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[var(--play-brand-light)] text-[var(--play-brand-dark)] flex items-center justify-center text-xs font-bold">
              {getInitials(game.hostName)}
            </div>
          )}
          <div>
            <div className="text-[10px] text-[var(--play-text-muted)] uppercase tracking-wide font-semibold">Hosted by</div>
            <div className="text-sm font-medium text-[var(--play-text)]">{game.hostName}</div>
          </div>
        </div>
        <button
          onClick={() => onJoin?.(game.id)}
          disabled={game.joinedCount >= game.maxPlayers}
          className="bg-[var(--play-brand)] hover:bg-[var(--play-brand-dark)] disabled:bg-[var(--play-border)] disabled:text-[var(--play-text-light)] disabled:cursor-not-allowed text-white px-5 py-2 rounded-[var(--play-radius-pill)] font-medium transition-colors text-sm shadow-sm"
        >
          {game.joinedCount >= game.maxPlayers ? 'Full' : 'Join Squad'}
        </button>
      </div>
    </div>
  );
};
