import React from 'react';
import Link from 'next/link';
import { Calendar, Users, Trophy, Wallet, ClipboardList, Medal, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: <Calendar className="h-6 w-6 text-[var(--play-brand)]" />,
      title: 'Book Courts',
      description: 'Reserve your favourite turf in seconds',
    },
    {
      icon: <Users className="h-6 w-6 text-[var(--play-brand)]" />,
      title: 'Join Games',
      description: 'Find open matches and join the squad',
    },
    {
      icon: <Trophy className="h-6 w-6 text-[var(--play-brand)]" />,
      title: 'Earn Rewards',
      description: 'Collect SV Points with every booking',
    },
    {
      icon: <Wallet className="h-6 w-6 text-[var(--play-brand)]" />,
      title: 'Wallet System',
      description: 'Seamless payments with digital wallet',
    },
    {
      icon: <ClipboardList className="h-6 w-6 text-[var(--play-brand)]" />,
      title: 'Track Passes',
      description: 'Manage memberships and attendance',
    },
    {
      icon: <Medal className="h-6 w-6 text-[var(--play-brand)]" />,
      title: 'Leaderboard',
      description: 'Compete and climb the rankings',
    },
  ];

  const sports = [
    'Badminton', 'Cricket', 'Football', 'Swimming', 
    'Tennis', 'Pickleball', 'Basketball', 'Volleyball', 
    'Table Tennis', 'Gym', 'Golf'
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-16 md:gap-24 py-8">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center max-w-4xl mx-auto pt-8 md:pt-16 px-4">
        <h1 className="font-heading text-4xl md:text-6xl font-extrabold tracking-tight text-[var(--play-text)] mb-6">
          Book Your Game. <span className="text-[var(--play-brand)]">Join the Community.</span>
        </h1>
        <p className="text-lg md:text-xl text-[var(--play-text-muted)] mb-10 max-w-2xl">
          Discover the best sports facilities near you. Book turfs, join open games, meet new players, and earn rewards every time you play.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/play/login"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-[var(--play-brand)] text-white font-medium text-lg hover:bg-[var(--play-brand-dark)] transition-colors shadow-lg shadow-emerald-500/20"
          >
            Book Now
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="/play/login"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-[var(--play-text)] font-medium text-lg border border-[var(--play-border)] hover:bg-[var(--play-surface-alt)] transition-colors"
          >
            Explore Games
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-4 w-full">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold mb-4">Everything you need to play</h2>
          <p className="text-[var(--play-text-muted)]">A complete ecosystem for sports enthusiasts.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="bg-white p-6 rounded-2xl border border-[var(--play-border)] shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
              <div className="h-14 w-14 rounded-full bg-[var(--play-brand-light)] flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">{feature.title}</h3>
              <p className="text-[var(--play-text-muted)]">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sports Showcase */}
      <section className="px-4 w-full bg-white rounded-3xl p-8 md:p-12 border border-[var(--play-border)] shadow-sm">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl font-bold mb-4">Choose your sport</h2>
          <p className="text-[var(--play-text-muted)]">Over 10+ sports available for booking</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {sports.map((sport, idx) => (
            <span 
              key={idx}
              className="px-6 py-3 rounded-full bg-[var(--play-surface-alt)] border border-[var(--play-border)] text-sm md:text-base font-medium text-[var(--play-text)] hover:border-[var(--play-brand)] hover:text-[var(--play-brand-dark)] transition-colors cursor-pointer"
            >
              {sport}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center border-t border-[var(--play-border)] pt-8 mt-8 flex flex-col md:flex-row items-center justify-between px-4 text-sm text-[var(--play-text-muted)]">
        <p>&copy; {new Date().getFullYear()} Sportsvilla. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link href="#" className="hover:text-[var(--play-brand)]">Privacy Policy</Link>
          <Link href="#" className="hover:text-[var(--play-brand)]">Terms of Service</Link>
          <Link href="#" className="hover:text-[var(--play-brand)]">Contact Us</Link>
        </div>
      </footer>
    </div>
  );
}
