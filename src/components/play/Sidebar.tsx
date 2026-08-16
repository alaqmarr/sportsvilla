'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  CalendarDays, 
  Ticket, 
  Users, 
  Trophy, 
  Wallet, 
  Award, 
  Tag, 
  CreditCard, 
  UserCircle 
} from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Book Court', href: '/book', icon: CalendarDays },
  { label: 'My Bookings', href: '/bookings', icon: Ticket },
  { label: 'Join Game', href: '/join-game', icon: Users },
  { label: 'Tournaments', href: '/tournaments', icon: Trophy },
  { label: 'Wallet', href: '/wallet', icon: Wallet },
  { label: 'Leaderboard', href: '/leaderboard', icon: Award },
  { label: 'Offers', href: '/offers', icon: Tag },
  { label: 'Passes', href: '/memberships', icon: CreditCard },
  { label: 'Profile', href: '/profile', icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 flex-col bg-[var(--play-surface)] border-r border-[var(--play-border)] h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--play-radius-md)] text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-[var(--play-brand-light)] text-[var(--play-brand-dark)]' 
                  : 'text-[var(--play-text-muted)] hover:bg-[var(--play-surface-alt)] hover:text-[var(--play-text)]'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-[var(--play-brand)]' : 'text-[var(--play-text-light)]'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
