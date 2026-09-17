'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wallet,
  LogOut,
  User,
  Users,
  PlusCircle,
  ChevronDown,
} from 'lucide-react';
import { usePlayAuth } from './PlayAuthProvider';
import { PlayAvatar } from './ui/PlayAvatar';
import { BottomNav } from './BottomNav';

interface NavItem {
  label: string;
  href: string;
}

const desktopNavItems: NavItem[] = [
  { label: 'Home', href: '/play/dashboard' },
  { label: 'Book Court', href: '/play/book' },
  { label: 'Bookings', href: '/play/bookings' },
  { label: 'Games', href: '/play/join-game' },
  { label: 'Passes', href: '/play/memberships' },
  { label: 'Tournaments', href: '/play/tournaments' },
  { label: 'Leaderboard', href: '/play/leaderboard' },
  { label: 'Offers', href: '/play/offers' },
];

export function Navbar() {
  const { member, familyMembers, switchMember, logout } = usePlayAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full h-16 bg-play-surface/90 backdrop-blur-md border-b border-play-border">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Brand Logo */}
          <div className="flex items-center shrink-0">
            <Link
              href="/play/dashboard"
              className="flex items-center gap-2 group focus:outline-none"
              aria-label="SportsVilla Home"
            >
              <img
                src="/long-logo.png"
                alt="SportsVilla"
                className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Center: Desktop Navigation Links (>=768px) */}
          <nav
            className="hidden md:flex items-center space-x-1 lg:space-x-2"
            aria-label="Desktop Navigation"
          >
            {desktopNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/play/dashboard' &&
                  pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-1.5 rounded-play-md font-play text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'text-play-brand font-semibold bg-play-surface-subtle shadow-sm'
                      : 'text-play-text-secondary hover:text-play-text hover:bg-play-surface-hover'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-play-brand rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Wallet Balance Pill + Profile Dropdown */}
          <div className="flex items-center space-x-3">
            {/* Wallet Pill */}
            <Link
              href="/play/wallet"
              className="flex items-center gap-2 bg-play-surface-subtle hover:bg-play-surface-hover border border-play-border px-3 py-1.5 rounded-play-pill text-xs font-semibold text-play-text transition-colors shadow-play-sm group"
              title="View wallet & add funds"
            >
              <Wallet className="w-4 h-4 text-play-brand group-hover:scale-110 transition-transform" />
              <span>₹{member?.walletBalance ?? 0}</span>
              <PlusCircle className="w-3.5 h-3.5 text-play-brand/70 hover:text-play-brand" />
            </Link>

            {/* Profile Avatar & Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center gap-1 p-0.5 rounded-full hover:ring-2 hover:ring-play-brand/30 transition-all focus:outline-none"
                aria-expanded={isProfileOpen}
                aria-label="User Profile Menu"
              >
                <PlayAvatar
                  name={member?.name}
                  src={member?.avatarUrl}
                  size="sm"
                  status="online"
                />
                <ChevronDown className="w-3.5 h-3.5 text-play-text-muted hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 top-12 z-50 w-64 rounded-play-xl bg-play-surface p-2 shadow-play-xl border border-play-border animate-in fade-in-50 zoom-in-95 duration-100">
                  <div className="px-3 py-2.5 border-b border-play-border">
                    <p className="font-play text-sm font-bold text-play-text truncate">
                      {member?.name || 'Player'}
                    </p>
                    <p className="text-xs text-play-text-muted truncate">
                      {member?.email || member?.phone || ''}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/play/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-play-md px-3 py-2 text-sm text-play-text hover:bg-play-surface-subtle transition-colors"
                    >
                      <User className="w-4 h-4 text-play-brand" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/play/wallet"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-play-md px-3 py-2 text-sm text-play-text hover:bg-play-surface-subtle transition-colors"
                    >
                      <Wallet className="w-4 h-4 text-play-brand" />
                      <span>Wallet & Transactions</span>
                    </Link>
                  </div>

                  {/* Family Profile Switcher */}
                  {familyMembers && familyMembers.length > 0 && (
                    <div className="py-1.5 border-t border-play-border">
                      <p className="px-3 py-1 text-[10px] font-semibold text-play-text-muted uppercase tracking-wider">
                        Switch Member
                      </p>
                      {familyMembers.map((famMember) => (
                        <button
                          key={famMember.id}
                          type="button"
                          onClick={() => {
                            switchMember(famMember.id);
                            setIsProfileOpen(false);
                          }}
                          className={`flex w-full items-center gap-2.5 rounded-play-md px-3 py-2 text-sm transition-colors text-left ${
                            famMember.id === member?.id
                              ? 'bg-play-surface-subtle font-semibold text-play-brand'
                              : 'text-play-text hover:bg-play-surface-subtle'
                          }`}
                        >
                          <Users className="w-4 h-4 text-play-text-muted shrink-0" />
                          <span className="truncate">{famMember.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Logout Action */}
                  <div className="pt-1.5 border-t border-play-border">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-play-md px-3 py-2 text-sm text-play-error hover:bg-play-error-subtle transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (<768px) */}
      <BottomNav />
    </>
  );
}
