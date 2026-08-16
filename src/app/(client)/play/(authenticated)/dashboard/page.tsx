import { prisma } from '@/lib/prisma';
import { requireServerMember } from '@/lib/serverAuth';
import Link from 'next/link';
import { Calendar, Users, Ticket, Wallet, Clock, ChevronRight } from 'lucide-react';
import { TournamentCard } from '@/components/play/TournamentCard';
import { CountdownTimerClient } from './CountdownTimerClient';

export default async function DashboardPage() {
  const member = await requireServerMember();
  
  const now = new Date();
  
  const [candidateBookings, upcomingTournaments, banners] = await Promise.all([
    prisma.booking.findMany({
      where: {
        OR: [
          { memberId: member.id },
          { participants: { some: { memberId: member.id, status: 'CONFIRMED' } } }
        ],
        startTime: { gt: now },
        status: 'CONFIRMED'
      },
      include: {
        turf: { select: { name: true, location: true } },
        sport: { select: { name: true } },
      },
      orderBy: { startTime: 'asc' },
      take: 5
    }),
    prisma.tournament.findMany({
      where: { status: 'UPCOMING' },
      include: { sport: true, _count: { select: { registrations: true } } },
      orderBy: { startDate: 'asc' },
      take: 5
    }),
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ]);

  const quickActions = [
    { label: 'Book Court', icon: Calendar, href: '/play/book', color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Join Squad', icon: Users, href: '/play/join-game', color: 'bg-blue-100 text-blue-600' },
    { label: 'My Passes', icon: Ticket, href: '/play/memberships', color: 'bg-purple-100 text-purple-600' },
    { label: 'Wallet', icon: Wallet, href: '/play/wallet', color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="flex-1 bg-[var(--play-bg)] text-[var(--play-text)] pb-24">
      <div className="max-w-7xl mx-auto w-full">
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
      {candidateBookings.length > 0 && (
        <div className="px-4 py-4">
          <h2 className="text-lg font-bold font-outfit mb-3">Next Game Spotlight</h2>
          <div className="bg-[var(--play-brand-dark)] text-white rounded-[var(--play-radius-lg)] p-5 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Calendar size={100} />
            </div>
            <div className="relative z-10 flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-xl">{candidateBookings[0].sport?.name}</h3>
                <p className="text-emerald-100 text-sm mt-1">{candidateBookings[0].turf?.name}</p>
              </div>
              <div className="bg-white rounded-[var(--play-radius-pill)] px-3 py-1 text-sm text-[var(--play-brand-dark)] font-bold flex items-center gap-1">
                <Clock size={14} />
                <CountdownTimerClient targetDate={candidateBookings[0].startTime.toISOString()} />
              </div>
            </div>
            <Link href={`/play/bookings/${candidateBookings[0].id}`} className="block w-full bg-white text-[var(--play-brand-dark)] text-center font-bold py-3 rounded-[var(--play-radius-md)] mt-2">
              View Pass
            </Link>
          </div>
        </div>
      )}

      {/* Community Squads */}
      {upcomingTournaments.length > 0 && (
        <div className="py-4">
          <div className="px-4 flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold font-outfit">Upcoming Tournaments</h2>
            <Link href="/play/tournaments" className="text-[var(--play-brand)] text-sm font-medium flex items-center hover:underline">
              See All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="flex overflow-x-auto px-4 gap-4 pb-4 snap-x hide-scrollbar">
            {upcomingTournaments.map((tournament) => (
              <div key={tournament.id} className="min-w-[280px] snap-center">
                <TournamentCard tournament={tournament as any} compact={true} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offers Carousel */}
      {banners.length > 0 && (
        <div className="py-2">
          <h2 className="px-4 text-lg font-bold font-outfit mb-3">Exclusive Offers</h2>
          <div className="flex overflow-x-auto px-4 gap-4 pb-4 snap-x hide-scrollbar">
            {banners.map((banner) => (
              <div key={banner.id} className="min-w-[300px] h-32 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-[var(--play-radius-lg)] p-4 text-white shadow-sm flex flex-col justify-center snap-center bg-cover bg-center" style={{ backgroundImage: banner.imageUrl ? `url(${banner.imageUrl})` : undefined }}>
                <div className="z-10 bg-black/30 p-2 rounded-lg backdrop-blur-sm inline-block">
                  <h3 className="font-bold text-lg">{banner.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
