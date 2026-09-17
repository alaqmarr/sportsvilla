import { prisma } from '@/lib/prisma';
import { requireServerMember } from '@/lib/serverAuth';
import Link from 'next/link';
import {
  Calendar,
  Users,
  Ticket,
  Wallet,
  Clock,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Sparkles,
  Trophy,
  MapPin,
  Flame,
} from 'lucide-react';
import { TournamentCard } from '@/components/play/TournamentCard';
import { CountdownTimerClient } from './CountdownTimerClient';
import {
  PlayCard,
  PlayCardHeader,
  PlayCardTitle,
  PlayCardContent,
} from '@/components/play/ui/PlayCard';
import { PlayAvatar } from '@/components/play/ui/PlayAvatar';
import { PlayBadge } from '@/components/play/ui/PlayBadge';
import { PlayButton } from '@/components/play/ui/PlayButton';
import { formatIST } from '@/lib/dateUtils';

export default async function DashboardPage() {
  const member = await requireServerMember();
  const now = new Date();

  const [
    candidateBookings,
    upcomingTournaments,
    banners,
    availableTurfs,
    openGames,
  ] = await Promise.all([
    prisma.booking.findMany({
      where: {
        OR: [
          { memberId: member.id },
          { participants: { some: { memberId: member.id, status: 'CONFIRMED' } } },
        ],
        startTime: { gt: now },
        status: 'CONFIRMED',
      },
      include: {
        turf: { select: { name: true, location: true } },
        sport: { select: { name: true } },
      },
      orderBy: { startTime: 'asc' },
      take: 5,
    }),
    prisma.tournament.findMany({
      where: { status: 'UPCOMING' },
      include: { sport: true, _count: { select: { registrations: true } } },
      orderBy: { startDate: 'asc' },
      take: 4,
    }),
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
    prisma.turf.findMany({
      take: 4,
      orderBy: { name: 'asc' },
      include: {
        sports: { include: { sport: true } },
      },
    }),
    prisma.booking.findMany({
      where: {
        visibility: 'OPEN',
        startTime: { gt: now },
        status: 'CONFIRMED',
      },
      include: {
        turf: { select: { name: true, location: true } },
        sport: { select: { name: true } },
        member: { select: { name: true } },
        participants: { select: { id: true } },
      },
      orderBy: { startTime: 'asc' },
      take: 4,
    }),
  ]);

  const quickActions = [
    {
      label: 'Book Court',
      desc: 'Reserve turf',
      icon: Calendar,
      href: '/play/book',
      color: 'bg-play-brand/10 text-play-brand-dark',
    },
    {
      label: 'Join Squad',
      desc: 'Open games',
      icon: Users,
      href: '/play/join-game',
      color: 'bg-play-info/10 text-play-info',
    },
    {
      label: 'My Passes',
      desc: 'Monthly tiers',
      icon: Ticket,
      href: '/play/memberships',
      color: 'bg-play-accent/10 text-play-accent',
    },
    {
      label: 'Tournaments',
      desc: 'Competitions',
      icon: Trophy,
      href: '/play/tournaments',
      color: 'bg-play-warning/10 text-play-warning',
    },
  ];

  return (
    <div className="flex-1 bg-play-bg text-play-text font-play space-y-8 pb-16">
      {/* Top Greeting & Loyalty Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-play-surface border border-play-border rounded-play-xl p-5 sm:p-6 shadow-play-sm">
        <div className="flex items-center gap-4">
          <PlayAvatar name={member.name || 'Player'} size="xl" status="online" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-play-text tracking-tight">
                Welcome back, {member.name || 'Player'}! 👋
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-play-text-muted mt-0.5">
              Ready for your next game? Check out today’s open slots and squads.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PlayBadge variant="brand" size="md" dot>
            {member.loyaltyPoints || 0} Loyalty Pts
          </PlayBadge>
          <Link href="/play/profile">
            <PlayButton variant="secondary" size="sm">
              My Profile
            </PlayButton>
          </Link>
        </div>
      </div>

      {/* Hero Grid: Next Game Spotlight & Wallet Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Next Game Spotlight Banner (Col 1-7) */}
        <div className="lg:col-span-7 flex flex-col">
          {candidateBookings.length > 0 ? (
            <div className="relative overflow-hidden rounded-play-xl bg-gradient-to-br from-play-brand to-play-brand-dark text-white p-6 sm:p-8 shadow-play-md flex flex-col justify-between flex-1">
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <Calendar size={140} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-play-pill bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white">
                    <Sparkles className="w-3.5 h-3.5" /> Next Match Spotlight
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-play-pill bg-white text-play-brand-dark text-xs font-black shadow-play-sm">
                    <Clock size={13} />
                    <CountdownTimerClient targetDate={candidateBookings[0].startTime.toISOString()} />
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black mb-1">
                  {candidateBookings[0].sport?.name} Match
                </h2>
                <div className="flex items-center gap-2 text-emerald-100 text-sm mb-6">
                  <MapPin size={14} className="shrink-0" />
                  <span>
                    {candidateBookings[0].turf?.name} • {candidateBookings[0].turf?.location || 'Main Arena'}
                  </span>
                </div>

                <div className="bg-black/15 backdrop-blur-sm rounded-play-lg p-3.5 inline-block text-xs font-semibold mb-6">
                  Scheduled for {formatIST(candidateBookings[0].startTime, 'EEEE, MMM d • h:mm a')}
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-3">
                <Link href={`/play/bookings/${candidateBookings[0].id}`} className="flex-1">
                  <button className="w-full bg-white text-play-brand-dark hover:bg-emerald-50 font-bold py-3 px-5 rounded-play-md text-sm shadow-play-sm transition-all text-center">
                    View Digital Pass
                  </button>
                </Link>
                <Link href={`/play/bookings/${candidateBookings[0].id}/manage`}>
                  <button className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-play-md text-sm transition-all flex items-center gap-1.5">
                    <Users size={16} /> Squad
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <PlayCard variant="default" padding="lg" className="flex-1 flex flex-col justify-between">
              <div>
                <PlayBadge variant="neutral" size="sm" className="mb-3">
                  No Upcoming Bookings
                </PlayBadge>
                <h3 className="text-xl sm:text-2xl font-black text-play-text mb-2">
                  The arena is calling.
                </h3>
                <p className="text-sm text-play-text-muted mb-6">
                  You don’t have any active court reservations right now. Pick a sport and lock in your slot.
                </p>
              </div>
              <div>
                <Link href="/play/book">
                  <PlayButton variant="athletic" size="md" rightIcon={<ArrowUpRight size={16} />}>
                    Reserve Court Now
                  </PlayButton>
                </Link>
              </div>
            </PlayCard>
          )}
        </div>

        {/* Wallet Quick Action Card (Col 8-12) */}
        <div className="lg:col-span-5 flex flex-col">
          <PlayCard variant="elevated" padding="lg" className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-play-md bg-play-surface-subtle flex items-center justify-center text-play-brand">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-play-text-muted">
                      Sportsvilla Wallet
                    </span>
                    <h3 className="text-sm font-bold text-play-text">Instant Payment Balance</h3>
                  </div>
                </div>
                <Link
                  href="/play/wallet"
                  className="text-xs font-bold text-play-brand hover:text-play-brand-dark transition-colors"
                >
                  History
                </Link>
              </div>

              <div className="bg-play-surface-subtle border border-play-border rounded-play-lg p-4 mb-4">
                <span className="text-xs text-play-text-muted font-medium">Available Balance</span>
                <div className="text-3xl font-black text-play-text tracking-tight mt-1">
                  ₹{(member.walletBalance || 0).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <Link href="/play/wallet" className="block w-full">
                <PlayButton
                  variant="athletic"
                  size="md"
                  fullWidth
                  leftIcon={<Plus size={16} />}
                >
                  Top Up Funds
                </PlayButton>
              </Link>
              <div className="flex gap-2">
                <Link href="/play/offers" className="flex-1">
                  <PlayButton variant="secondary" size="sm" fullWidth>
                    Coupons
                  </PlayButton>
                </Link>
                <Link href="/play/memberships" className="flex-1">
                  <PlayButton variant="secondary" size="sm" fullWidth>
                    Passes
                  </PlayButton>
                </Link>
              </div>
            </div>
          </PlayCard>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-play-text-muted mb-3">
          Quick Services
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link key={i} href={action.href}>
                <PlayCard
                  variant="interactive"
                  padding="md"
                  className="flex items-center gap-3.5 group"
                >
                  <div className={`p-3 rounded-play-md ${action.color} shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon size={22} />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-bold text-sm text-play-text truncate">
                      {action.label}
                    </span>
                    <span className="block text-xs text-play-text-muted truncate">
                      {action.desc}
                    </span>
                  </div>
                </PlayCard>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Available Courts Quick-Book Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-play-text">Featured Courts</h2>
            <p className="text-xs text-play-text-muted">Top recommended facilities ready for reservation</p>
          </div>
          <Link href="/play/book">
            <PlayButton variant="ghost" size="sm" rightIcon={<ChevronRight size={16} />}>
              View All Courts
            </PlayButton>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableTurfs.map((turf) => {
            const primarySport = turf.sports?.[0]?.sport;
            return (
              <PlayCard key={turf.id} variant="elevated" padding="md" className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <PlayBadge variant="brand" size="sm">
                      {primarySport?.name || 'Multi-Sport'}
                    </PlayBadge>
                    <span className="text-xs font-bold text-play-text">
                      ₹{turf.bookingPrice || 0}<span className="text-play-text-muted font-normal">/slot</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-play-text line-clamp-1 mb-1">
                    {turf.name}
                  </h3>
                  <p className="text-xs text-play-text-muted flex items-center gap-1 mb-4">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{turf.location || 'Arena Main Wing'}</span>
                  </p>
                </div>

                <Link href={`/play/book?sportId=${primarySport?.id || ''}`}>
                  <PlayButton variant="secondary" size="sm" fullWidth rightIcon={<ArrowUpRight size={14} />}>
                    Check Slots
                  </PlayButton>
                </Link>
              </PlayCard>
            );
          })}
        </div>
      </div>

      {/* Community Open Games Feed */}
      {openGames.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-play-brand animate-pulse" />
              <h2 className="text-xl font-extrabold text-play-text">Open Squad Matches</h2>
            </div>
            <Link href="/play/join-game">
              <PlayButton variant="ghost" size="sm" rightIcon={<ChevronRight size={16} />}>
                Join Games ({openGames.length})
              </PlayButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {openGames.map((game) => (
              <PlayCard key={game.id} variant="interactive" padding="md" className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <PlayBadge variant="brand" size="sm">
                      {game.sport?.name}
                    </PlayBadge>
                    <span className="text-xs font-semibold text-play-brand flex items-center gap-1">
                      <Flame size={12} /> {(game.participants?.length || 0) + 1} Joined
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-play-text line-clamp-1">
                    Hosted by {game.member?.name || 'Player'}
                  </h3>
                  <p className="text-xs text-play-text-muted mt-1">
                    {game.turf?.name} • {formatIST(game.startTime, 'h:mm a')}
                  </p>
                </div>

                <div className="pt-4 border-t border-play-border mt-3">
                  <Link href={`/play/join-game`}>
                    <PlayButton variant="athletic" size="sm" fullWidth>
                      Join Squad
                    </PlayButton>
                  </Link>
                </div>
              </PlayCard>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Tournaments Carousel */}
      {upcomingTournaments.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-play-text">Tournaments & Leagues</h2>
              <p className="text-xs text-play-text-muted">Compete for cash prizes and trophies</p>
            </div>
            <Link href="/play/tournaments">
              <PlayButton variant="ghost" size="sm" rightIcon={<ChevronRight size={16} />}>
                See All Tournaments
              </PlayButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament as any} compact={true} />
            ))}
          </div>
        </div>
      )}

      {/* Exclusive Offers */}
      {banners.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-play-text">Exclusive Arena Perks</h2>
            <Link href="/play/offers">
              <PlayButton variant="ghost" size="sm" rightIcon={<ChevronRight size={16} />}>
                View Coupons
              </PlayButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="h-36 rounded-play-xl p-5 text-white shadow-play-md flex flex-col justify-end bg-gradient-to-br from-play-brand to-play-brand-dark bg-cover bg-center relative overflow-hidden border border-play-border"
                style={{ backgroundImage: banner.imageUrl ? `url(${banner.imageUrl})` : undefined }}
              >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                <div className="relative z-10">
                  <PlayBadge variant="brand" size="sm" className="mb-2 bg-white/20 text-white border-white/30">
                    Featured
                  </PlayBadge>
                  <h3 className="font-bold text-base text-white line-clamp-1">{banner.title || 'Special Promotion'}</h3>
                  <p className="text-xs text-emerald-100 line-clamp-1 mt-0.5">Limited time offer for members</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

