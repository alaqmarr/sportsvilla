'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Ticket, CalendarDays, Users, User } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/play/dashboard', icon: Home },
    { label: 'Bookings', href: '/play/bookings', icon: Ticket },
    { label: 'Book', href: '/play/book', icon: CalendarDays, isPrimary: true },
    { label: 'Games', href: '/play/join-game', icon: Users },
    { label: 'Profile', href: '/play/profile', icon: User },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-play-surface/95 backdrop-blur-md border-t border-play-border shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/play/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -mt-6 group flex flex-col items-center focus:outline-none"
                aria-label="Book Court"
              >
                <div
                  className={`w-14 h-14 rounded-full bg-play-brand hover:bg-play-brand-dark text-white shadow-play-lg flex items-center justify-center ring-4 ring-play-surface active:scale-95 transition-all duration-150 ${
                    isActive ? 'ring-play-brand/20 bg-play-brand-dark' : ''
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className={`text-[10px] font-play font-bold tracking-tight mt-1 transition-colors ${
                    isActive ? 'text-play-brand' : 'text-play-text-secondary'
                  }`}
                >
                  Book
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-1 group transition-colors ${
                isActive ? 'text-play-brand' : 'text-play-text-muted hover:text-play-text'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 group-active:scale-90 ${
                    isActive ? 'text-play-brand stroke-[2.5]' : ''
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-play-brand rounded-full" />
                )}
              </div>
              <span
                className={`text-[10px] font-play font-medium mt-1 transition-colors ${
                  isActive ? 'font-bold text-play-brand' : 'text-play-text-muted'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
