'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { usePlayAuth } from '@/components/play/PlayAuthProvider';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function LeaderboardPage() {
  const { member } = usePlayAuth();
  const [filter, setFilter] = useState('This Month');
  const { data, error } = useSWR(`/api/client/v1/leaderboard?filter=${encodeURIComponent(filter)}`, fetcher);

  const leaderboard = data?.leaderboard || [];
  const userRank = data?.userRank || null;

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'SV';

  const renderTrend = (trend: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-[var(--play-brand)]" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-[var(--play-text-muted)]" />;
  };

  return (
    <div className="min-h-screen bg-[var(--play-bg)] text-[var(--play-text)] flex flex-col relative">
      <div className="p-4 sm:p-6 flex-1">
        <h1 className="text-2xl font-bold font-outfit mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Leaderboard
        </h1>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {['This Month', 'All Time', 'All Members'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-[var(--play-radius-pill)] text-sm whitespace-nowrap transition-colors ${
                filter === f 
                  ? 'bg-[var(--play-brand)] text-white' 
                  : 'bg-[var(--play-surface)] text-[var(--play-text-muted)] border border-[var(--play-border)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Podium */}
        {top3.length > 0 && (
          <div className="flex items-end justify-center gap-4 mb-10 h-48">
            {/* Rank 2 */}
            {top3[1] && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold text-lg mb-2 border-2 border-slate-300">
                  {getInitials(top3[1].name)}
                </div>
                <div className="text-xs font-medium mb-1 truncate w-16 text-center">{top3[1].name}</div>
                <div className="w-16 h-24 bg-slate-300 rounded-t-lg flex flex-col items-center justify-start pt-2">
                  <span className="text-sm font-bold text-slate-600">2nd</span>
                  <span className="text-xs font-medium text-slate-500 mt-1">{top3[1].points}</span>
                </div>
              </div>
            )}
            {/* Rank 1 */}
            {top3[0] && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold text-xl mb-2 border-4 border-yellow-400 relative">
                  <Trophy className="w-4 h-4 absolute -top-3 text-yellow-500" />
                  {getInitials(top3[0].name)}
                </div>
                <div className="text-sm font-bold mb-1 truncate w-20 text-center">{top3[0].name}</div>
                <div className="w-20 h-32 bg-yellow-400 rounded-t-lg flex flex-col items-center justify-start pt-2 shadow-lg z-10">
                  <span className="text-base font-bold text-yellow-900">1st</span>
                  <span className="text-sm font-bold text-yellow-800 mt-1">{top3[0].points} pts</span>
                </div>
              </div>
            )}
            {/* Rank 3 */}
            {top3[2] && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-bold text-lg mb-2 border-2 border-orange-300">
                  {getInitials(top3[2].name)}
                </div>
                <div className="text-xs font-medium mb-1 truncate w-16 text-center">{top3[2].name}</div>
                <div className="w-16 h-20 bg-orange-300 rounded-t-lg flex flex-col items-center justify-start pt-2">
                  <span className="text-sm font-bold text-orange-800">3rd</span>
                  <span className="text-xs font-medium text-orange-700 mt-1">{top3[2].points}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ranked List */}
        <div className="space-y-3 pb-8">
          {rest.map((user: any, idx: number) => (
            <div key={user.id || idx} className="flex items-center bg-[var(--play-surface)] p-3 rounded-[var(--play-radius-md)] border border-[var(--play-border)] shadow-sm">
              <div className="w-8 text-center font-bold text-[var(--play-text-muted)] font-outfit">
                {idx + 4}
              </div>
              <div className="mx-3">
                {renderTrend(user.trend)}
              </div>
              <div className="w-10 h-10 bg-[var(--play-bg)] rounded-full flex items-center justify-center text-sm font-medium text-[var(--play-text-muted)] border border-[var(--play-border)]">
                {getInitials(user.name)}
              </div>
              <div className="ml-3 flex-1">
                <p className="font-medium text-sm text-[var(--play-text)]">{user.name}</p>
              </div>
              <div className="font-bold font-outfit text-[var(--play-brand-dark)]">
                {user.points} <span className="text-xs font-normal text-[var(--play-text-muted)]">pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky User Rank */}
      {userRank && (
        <div className="sticky bottom-0 left-0 right-0 bg-[var(--play-surface)] border-t border-[var(--play-border)] p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--play-brand-light)] text-[var(--play-brand-dark)] rounded-full flex items-center justify-center font-bold border border-[var(--play-brand)]">
                {getInitials(member?.name || '')}
              </div>
              <div>
                <p className="text-xs text-[var(--play-text-muted)]">Your Rank</p>
                <p className="font-bold font-outfit text-lg">#{userRank.position}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--play-text-muted)]">Your Points</p>
              <p className="font-bold font-outfit text-lg text-[var(--play-brand-dark)]">{userRank.points}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
