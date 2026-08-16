'use client';

import React from "react";
import { Users, Clock, MapPin, Activity } from "lucide-react";

export interface Game {
  id: string;
  sport?: string | { name: string; [key: string]: any };
  venue?: string;
  turf?: { name: string; [key: string]: any };
  time?: string;
  startTime?: string;
  endTime?: string;
  joinedCount?: number;
  participantCount?: number;
  participants?: any[];
  maxPlayers?: number;
  inviteMaxCount?: number;
  hostName?: string;
  member?: { name: string; [key: string]: any };
  hostAvatar?: string;
  [key: string]: any;
}

interface GameCardProps {
  game: Game;
  onJoin?: (gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onJoin }) => {
  const sportName =
    typeof game.sport === "object" ? game.sport?.name : game.sport;
  const sportIcon =
    typeof game.sport === "object" ? game.sport?.iconPath : null;
  const turfIcon = typeof game.turf === "object" ? game.turf?.iconPath : null;
  const venueName = game.turf?.name || game.venue;

  const timeStr =
    game.startTime && game.endTime
      ? `${new Date(game.startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })} - ${new Date(game.endTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`
      : game.time;

  const currentPlayers =
    game.participantCount || game.participants?.length || game.joinedCount || 0;
  const totalPlayers = game.inviteMaxCount || game.maxPlayers || 10;
  const percentage = Math.min((currentPlayers / totalPlayers) * 100, 100);

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const hostNameStr = game.member?.name || game.hostName || "Unknown";

  return (
    <div className="bg-[var(--play-surface)] rounded-[var(--play-radius-md)] border border-[var(--play-border)] p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-[var(--play-text)] mb-1 flex items-center gap-2">
            {sportIcon ? (
              <img
                src={sportIcon}
                alt={sportName || "Sport"}
                className="w-4 h-4 object-contain"
              />
            ) : (
              <Activity className="w-4 h-4 text-[var(--play-brand)]" />
            )}
            {sportName}
          </h3>
          <p className="text-sm text-[var(--play-text-muted)] flex items-center gap-1.5">
            {turfIcon ? (
              <img
                src={turfIcon}
                alt={venueName}
                className="w-3.5 h-3.5 object-contain rounded-sm"
              />
            ) : (
              <MapPin className="w-3.5 h-3.5" />
            )}
            {venueName}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-[var(--play-surface-alt)] px-2.5 py-1 rounded-full text-xs font-medium text-[var(--play-text)]">
          <Clock className="w-3.5 h-3.5 text-[var(--play-brand)]" />
          {timeStr}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-end mb-1.5">
          <div className="text-sm font-medium text-[var(--play-text)] flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[var(--play-text-muted)]" />
            Squad
          </div>
          <div className="text-xs font-medium text-[var(--play-text-muted)]">
            <span className="text-[var(--play-text)]">{currentPlayers}</span> /{" "}
            {totalPlayers} joined
          </div>
        </div>
        <div className="h-2 w-full bg-[var(--play-border)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--play-brand)] rounded-full transition-all duration-500 ease-out text-white"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--play-border)]">
        <div className="flex items-center gap-2.5">
          {game.hostAvatar ? (
            <img
              src={game.hostAvatar}
              alt={hostNameStr}
              className="w-8 h-8 rounded-full object-cover bg-[var(--play-surface-alt)]"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[var(--play-brand-light)] text-[var(--play-brand-dark)] flex items-center justify-center text-xs font-bold">
              {getInitials(hostNameStr)}
            </div>
          )}
          <div>
            <div className="text-[10px] text-[var(--play-text-muted)] uppercase tracking-wide font-semibold">
              Hosted by
            </div>
            <div className="text-sm font-medium text-[var(--play-text)]">
              {hostNameStr}
            </div>
          </div>
        </div>
        <button
          onClick={() => onJoin?.(game.id)}
          disabled={currentPlayers >= totalPlayers}
          className="bg-[var(--play-brand)] hover:bg-[var(--play-brand-dark)] disabled:bg-[var(--play-border)] disabled:text-[var(--play-text-light)] disabled:cursor-not-allowed text-white px-5 py-2 rounded-[var(--play-radius-pill)] font-medium transition-colors text-sm shadow-sm"
        >
          {currentPlayers >= totalPlayers ? "Full" : "Join Squad"}
        </button>
      </div>
    </div>
  );
};
