import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  Calendar,
  Users,
  Wallet,
  ClipboardList,
  Trophy,
  ChevronRight,
  Smartphone,
  Zap,
  Sparkles,
  ShieldCheck,
  Clock,
  Award,
} from 'lucide-react';
import {
  PlayCard,
  PlayCardHeader,
  PlayCardTitle,
  PlayCardDescription,
  PlayCardContent,
} from '@/components/play/ui/PlayCard';
import { PlayBadge } from '@/components/play/ui/PlayBadge';
import { PlayButton } from '@/components/play/ui/PlayButton';

export default async function LandingPage() {
  const features = [
    {
      icon: Calendar,
      title: 'Book Courts Instantly',
      description: 'Reserve your favourite turf in seconds with real-time slot availability and split pricing.',
      tag: 'Live Grid',
    },
    {
      icon: Users,
      title: 'Community Games',
      description: 'Find open matches in your area, join squads, and never play shorthanded again.',
      tag: 'Social',
    },
    {
      icon: Zap,
      title: 'Instant QR Check-in',
      description: 'Skip reception delays. Flash your digital pass at the arena and step straight onto the court.',
      tag: 'Fast Track',
    },
    {
      icon: Wallet,
      title: 'Smart Wallet & Rewards',
      description: 'Get instant cashback, top-up perks, and redeem loyalty points across all bookings.',
      tag: 'Cashback',
    },
    {
      icon: ClipboardList,
      title: 'Membership Passes',
      description: 'Track flexible monthly passes and monitor attendance history directly from your phone.',
      tag: 'Flex Passes',
    },
    {
      icon: Trophy,
      title: 'Arena Leaderboards',
      description: 'Compete with top local players, track win streaks, and earn your spot on the podium.',
      tag: 'Rankings',
    },
  ];

  const dbSports = await prisma.sport.findMany({
    select: { name: true, iconPath: true },
  });

  const sports = dbSports.length > 0
    ? dbSports.map((s) => ({ name: s.name, emoji: s.iconPath || '🏅' }))
    : [
        { name: 'Badminton', emoji: '🏸' },
        { name: 'Cricket', emoji: '🏏' },
        { name: 'Football', emoji: '⚽' },
        { name: 'Tennis', emoji: '🎾' },
        { name: 'Basketball', emoji: '🏀' },
        { name: 'Pickleball', emoji: '🏓' },
        { name: 'Swimming', emoji: '🏊‍♂️' },
        { name: 'Volleyball', emoji: '🏐' },
        { name: 'Table Tennis', emoji: '🏓' },
        { name: 'Gym', emoji: '🏋️‍♂️' },
      ];

  const courtHighlights = [
    { name: 'Arena FIFA Turf', sport: 'Football', surface: 'Imported Turf', lighting: 'LED Pro' },
    { name: 'Championship Badminton', sport: 'Badminton', surface: 'BWF Wooden Cushion', lighting: 'Anti-glare' },
    { name: 'Box Cricket Pitch', sport: 'Cricket', surface: 'High Bounce Mat', lighting: 'Floodlights' },
  ];

  return (
    <div className="w-full flex flex-col min-h-screen bg-play-bg text-play-text font-play selection:bg-play-brand/20 selection:text-play-brand-dark">
      {/* Top Navbar */}
      <nav className="w-full border-b border-play-border bg-play-surface/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/play" className="flex items-center gap-2.5">
            <img src="/long-logo.png" alt="Sportsvilla" className="h-7 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/play/login">
              <PlayButton variant="secondary" size="sm">
                Sign In
              </PlayButton>
            </Link>
            <Link href="/play/login">
              <PlayButton variant="athletic" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                Book Court
              </PlayButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center overflow-hidden">
        {/* Dynamic Sport Glow Accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-play-brand/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-play-accent/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto z-10 flex flex-col items-center">
          <PlayBadge variant="brand" size="md" dot className="mb-6 shadow-play-sm">
            Now Live at SportsVilla Arenas
          </PlayBadge>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-play-text mb-6 leading-[1.08] max-w-3xl">
            Stop waiting.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-play-brand to-play-brand-dark">
              Start playing.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-play-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            Reserve premium sports courts, join open community matches, track member passes, and experience contactless check-ins with SportsVilla Play.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md sm:max-w-none">
            <Link href="/play/login" className="w-full sm:w-auto">
              <PlayButton
                variant="athletic"
                size="xl"
                className="w-full sm:w-auto min-w-[200px]"
                rightIcon={<ChevronRight className="w-5 h-5" />}
              >
                Book a Court
              </PlayButton>
            </Link>
            <Link
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <PlayButton
                variant="secondary"
                size="xl"
                className="w-full sm:w-auto min-w-[200px]"
                leftIcon={<Smartphone className="w-5 h-5 text-play-brand" />}
              >
                Download App
              </PlayButton>
            </Link>
          </div>

          {/* Athletic Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold text-play-text-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-play-brand" />
              <span>Verified Courts</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-play-brand" />
              <span>Real-Time Availability</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-play-brand" />
              <span>Instant Digital Pass</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Showcase Marquee */}
      <section className="py-6 bg-play-surface border-y border-play-border overflow-hidden relative shadow-play-sm">
        <div className="max-w-7xl mx-auto px-4 mb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-play-text-muted">
            Explore Available Sports
          </span>
          <span className="text-xs font-semibold text-play-brand">
            {sports.length}+ Disciplines
          </span>
        </div>
        <div className="flex animate-marquee whitespace-nowrap gap-4 px-4 items-center">
          {[...sports, ...sports].map((sport, idx) => (
            <Link
              key={idx}
              href="/play/login"
              className="inline-flex items-center gap-2.5 px-4 py-2 bg-play-surface-subtle hover:bg-play-brand-light/40 border border-play-border hover:border-play-brand/40 rounded-play-full transition-all cursor-pointer group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{sport.emoji}</span>
              <span className="font-semibold text-sm text-play-text group-hover:text-play-brand-dark">
                {sport.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Court Highlights Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <PlayBadge variant="accent" size="sm" className="mb-2">
              Premium Venues
            </PlayBadge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-play-text">
              Pro-Grade Playing Grounds
            </h2>
          </div>
          <Link href="/play/login">
            <PlayButton variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
              View All Facilities
            </PlayButton>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courtHighlights.map((court, idx) => (
            <PlayCard key={idx} variant="interactive" padding="lg" className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <PlayBadge variant="brand" size="sm">
                    {court.sport}
                  </PlayBadge>
                  <span className="text-xs font-semibold text-play-brand flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Ready to Play
                  </span>
                </div>
                <h3 className="text-xl font-bold text-play-text mb-2">
                  {court.name}
                </h3>
                <p className="text-sm text-play-text-muted mb-4">
                  Built to international tournament standards with high performance shock absorption and optical clarity.
                </p>
              </div>

              <div className="pt-4 border-t border-play-border text-xs text-play-text-secondary flex justify-between">
                <span>Surface: <strong className="text-play-text">{court.surface}</strong></span>
                <span>Lights: <strong className="text-play-text">{court.lighting}</strong></span>
              </div>
            </PlayCard>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <PlayBadge variant="brand" size="sm" className="mb-3">
            The Sportsvilla Experience
          </PlayBadge>
          <h2 className="text-3xl sm:text-5xl font-black mb-4 text-play-text">
            Built for athletes. Designed for speed.
          </h2>
          <p className="text-base sm:text-lg text-play-text-secondary">
            Everything you need to fuel your game, book in seconds, and stay connected with your squad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <PlayCard key={idx} variant="elevated" padding="lg" className="group hover:-translate-y-1 transition-all duration-200">
                <PlayCardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-12 w-12 rounded-play-lg bg-play-surface-subtle border border-play-border flex items-center justify-center text-play-brand group-hover:bg-play-brand group-hover:text-white transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <PlayBadge variant="neutral" size="sm">
                      {feature.tag}
                    </PlayBadge>
                  </div>
                  <PlayCardTitle className="text-xl">{feature.title}</PlayCardTitle>
                </PlayCardHeader>
                <PlayCardContent>
                  <PlayCardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </PlayCardDescription>
                </PlayCardContent>
              </PlayCard>
            );
          })}
        </div>
      </section>

      {/* App Download CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-br from-play-surface-raised via-play-surface to-play-brand-light/30 rounded-play-xl p-8 sm:p-14 border border-play-border shadow-play-lg text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-play-brand/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-play-accent/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <PlayBadge variant="brand" size="md" className="mb-4">
              Play On The Go
            </PlayBadge>
            <h2 className="text-3xl sm:text-5xl font-black text-play-text mb-4 tracking-tight">
              Ready to claim your court?
            </h2>
            <p className="text-base sm:text-lg text-play-text-secondary mb-8 max-w-xl mx-auto">
              Join the SportsVilla community today. Book turfs, challenge local players, and manage your passes anywhere.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
              <Link href="/play/login" className="w-full sm:w-auto">
                <PlayButton variant="athletic" size="lg" className="w-full sm:w-auto min-w-[200px]">
                  Get Started Now
                </PlayButton>
              </Link>
              <Link
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <PlayButton
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto min-w-[200px]"
                  leftIcon={<Smartphone className="w-5 h-5 text-play-brand" />}
                >
                  Download App
                </PlayButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-play-surface border-t border-play-border pt-12 pb-8 px-4 sm:px-6 lg:px-8 w-full mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-play-md bg-play-brand flex items-center justify-center text-white font-bold">
              SV
            </div>
            <span className="font-extrabold text-xl text-play-text">Sportsvilla Play</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-play-text-muted">
            <Link href="/play/login" className="hover:text-play-brand transition-colors">
              Book Court
            </Link>
            <Link href="/play/login" className="hover:text-play-brand transition-colors">
              Open Games
            </Link>
            <Link href="/play/login" className="hover:text-play-brand transition-colors">
              Memberships
            </Link>
            <Link href="/play/login" className="hover:text-play-brand transition-colors">
              Support
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-play-border text-center text-xs text-play-text-light font-medium">
          &copy; {new Date().getFullYear()} SportsVilla Arena. All rights reserved. Built for champions.
        </div>
      </footer>
    </div>
  );
}

