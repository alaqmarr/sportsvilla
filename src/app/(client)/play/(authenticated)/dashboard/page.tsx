'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Calendar, Users, Ticket, Wallet, Clock, ChevronRight } from 'lucide-react';
import { GameCard } from '@/components/play/GameCard';
import { usePlayAuth } from '@/components/play/PlayAuthProvider';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft('Started');
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return <span className="font-semibold text-[var(--play-brand)]">{timeLeft}</span>;
}

export default function DashboardPage() {
  const { member } = usePlayAuth();
  
  const { data, error, isLoading } = useSWR(
    member?.id ? `/api/client/v1/home?memberId=${member.id}` : null,
    fetcher
  );

  const quickActions = [
    { label: 'Book Court', icon: Calendar, href: '/play/book', color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Join Squad', icon: Users, href: '/play/join-game', color: 'bg-blue-100 text-blue-600' },
    { label: 'My Passes', icon: Ticket, href: '/play/memberships', color: 'bg-purple-100 text-purple-600' },
    { label: 'Wallet', icon: Wallet, href: '/play/wallet', color: 'bg-orange-100 text-orange-600' },
  ];

  if (isLoading || !member) {
    return (
      <div className="p-4 space-y-6">
        <div className="h-8 bg-[var(--play-surface-alt)] animate-pulse rounded w-1/2"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-28 bg-[var(--play-surface)] border border-[var(--play-border)] animate-pulse rounded-[var(--play-radius-md)]"></div>
          <div className="h-28 bg-[var(--play-surface)] border border-[var(--play-border)] animate-pulse rounded-[var(--play-radius-md)]"></div>
          <div className="h-28 bg-[var(--play-surface)] border border-[var(--play-border)] animate-pulse rounded-[var(--play-radius-md)]"></div>
          <div className="h-28 bg-[var(--play-surface)] border border-[var(--play-border)] animate-pulse rounded-[var(--play-radius-md)]"></div>
        </div>
        <div className="h-48 bg-[var(--play-surface)] border border-[var(--play-border)] animate-pulse rounded-[var(--play-radius-lg)]"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Failed to load dashboard data</div>;
  }

  return (
    <main className="min-h-screen bg-[var(--play-bg)] text-[var(--play-text)] pb-24">
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-2xl font-bold font-outfit">Welcome back, {member.name || 'Player'}! 👋</h1>
      </div>

      {/* Quick Actions Grid */}
      <div className="px-4 py-4 grid grid-cols-2 gap-4">
        {quickActions.map((action, i) => {
          const Icon = action.icon;
          return (
            <Link key={i} href={action.href} className="bg-[var(--play-surface)] p-4 rounded-[var(--play-radius-md)] shadow-sm flex flex-col items-center justify-center gap-2 border border-[var(--play-border)] active:scale-95 transition-transform">
              <div className={`p-3 rounded-full ${action.color}`}>
                <Icon size={24} />
              </div>
              <span className="font-medium text-sm">{action.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Next Game Spotlight */}
      {data?.upcomingBookings && data.upcomingBookings.length > 0 && (
        <div className="px-4 py-4">
          <h2 className="text-lg font-bold font-outfit mb-3">Next Game Spotlight</h2>
          <div className="bg-[var(--play-brand-dark)] text-white rounded-[var(--play-radius-lg)] p-5 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Calendar size={100} />
            </div>
            <div className="relative z-10 flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-xl">{data.upcomingBookings[0].sport?.name}</h3>
                <p className="text-emerald-100 text-sm mt-1">{data.upcomingBookings[0].turf?.name}</p>
              </div>
              <div className="bg-white rounded-[var(--play-radius-pill)] px-3 py-1 text-sm text-[var(--play-brand-dark)] font-bold flex items-center gap-1">
                <Clock size={14} />
                <CountdownTimer targetDate={data.upcomingBookings[0].startTime} />
              </div>
            </div>
            <Link href={`/play/bookings/${data.upcomingBookings[0].id}`} className="block w-full bg-white text-[var(--play-brand-dark)] text-center font-bold py-3 rounded-[var(--play-radius-md)] mt-2">
              View Pass
            </Link>
          </div>
        </div>
      )}

      {/* Community Squads (Mapped to Upcoming Tournaments) */}
      {data?.upcomingTournaments && data.upcomingTournaments.length > 0 && (
        <div className="py-4">
          <div className="px-4 flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold font-outfit">Upcoming Tournaments</h2>
            <Link href="/play/tournaments" className="text-[var(--play-brand)] text-sm font-medium flex items-center hover:underline">
              See All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="flex overflow-x-auto px-4 gap-4 pb-4 snap-x hide-scrollbar">
            {data.upcomingTournaments.map((tournament: any) => (
              <div key={tournament.id} className="min-w-[280px] snap-center">
                <GameCard game={{
                  id: tournament.id,
                  sport: tournament.sport?.name || 'Tournament',
                  venue: tournament.location || 'Sportsvilla Arena',
                  time: tournament.startDate?.split('T')[0] || '',
                  joinedCount: tournament._count?.registrations || 0,
                  maxPlayers: tournament.maxTeams || 16,
                  hostName: 'Sportsvilla'
                }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offers Carousel */}
      {data?.banners && data.banners.length > 0 && (
        <div className="py-2">
          <h2 className="px-4 text-lg font-bold font-outfit mb-3">Exclusive Offers</h2>
          <div className="flex overflow-x-auto px-4 gap-4 pb-4 snap-x hide-scrollbar">
            {data.banners.map((banner: any) => (
              <div key={banner.id} className="min-w-[300px] h-32 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-[var(--play-radius-lg)] p-4 text-white shadow-sm flex flex-col justify-center snap-center bg-cover bg-center" style={{ backgroundImage: banner.imageUrl ? `url(${banner.imageUrl})` : undefined }}>
                <div className="z-10 bg-black/30 p-2 rounded-lg backdrop-blur-sm inline-block">
                  <h3 className="font-bold text-lg">{banner.title}</h3>
                  {banner.subtitle && <p className="text-emerald-50 text-sm mt-1">{banner.subtitle}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
