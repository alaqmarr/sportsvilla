'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarDays, Ticket, Users, UserCircle } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Book', href: '/book', icon: CalendarDays },
  { label: 'Bookings', href: '/bookings', icon: Ticket },
  { label: 'Join', href: '/join-game', icon: Users },
  { label: 'Profile', href: '/profile', icon: UserCircle },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--play-surface)]/80 backdrop-blur-md border-t border-[var(--play-border)] pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full space-y-1"
            >
              <div className={`p-1 rounded-full ${isActive ? 'bg-[var(--play-brand-light)]' : ''}`}>
                <Icon className={`h-5 w-5 ${isActive ? 'text-[var(--play-brand-dark)]' : 'text-[var(--play-text-muted)]'}`} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-[var(--play-brand-dark)]' : 'text-[var(--play-text-muted)]'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
