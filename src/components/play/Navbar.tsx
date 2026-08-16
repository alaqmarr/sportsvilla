'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, LogOut, User, Users, Wallet, Menu, X, Home, CalendarDays, Ticket, Trophy, Award, Tag, CreditCard, UserCircle } from 'lucide-react';
import { usePlayAuth } from './PlayAuthProvider';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Home', href: '/play/dashboard', icon: Home },
  { label: 'Book Court', href: '/play/book', icon: CalendarDays },
  { label: 'My Bookings', href: '/play/bookings', icon: Ticket },
  { label: 'Join Game', href: '/play/join-game', icon: Users },
  { label: 'Tournaments', href: '/play/tournaments', icon: Trophy },
  { label: 'Wallet', href: '/play/wallet', icon: Wallet },
  { label: 'Leaderboard', href: '/play/leaderboard', icon: Award },
  { label: 'Offers', href: '/play/offers', icon: Tag },
  { label: 'Passes', href: '/play/memberships', icon: CreditCard },
  { label: 'Profile', href: '/play/profile', icon: UserCircle },
];

export function Navbar() {
  const { member, familyMembers, switchMember, logout } = usePlayAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[var(--play-surface)] shadow-sm border-b border-[var(--play-border)]">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4 md:gap-6">
          <button 
            className="md:hidden p-2 -ml-2 text-[var(--play-text)] hover:bg-[var(--play-surface-alt)] rounded-md"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/play/dashboard" className="text-xl font-bold tracking-tight text-[var(--play-brand)]">
            Sportsvilla
          </Link>
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--play-text-muted)]" />
            <input
              type="text"
              placeholder="Search courts, tournaments..."
              className="play-input pl-10 w-64 lg:w-96 bg-[var(--play-bg)] border-transparent focus:border-[var(--play-brand)]"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/play/wallet" className="hidden sm:flex items-center gap-2 play-badge bg-[var(--play-surface-alt)] border border-[var(--play-border)] py-1.5 px-3">
            <Wallet className="h-4 w-4 text-[var(--play-brand)]" />
            <span className="font-semibold text-[var(--play-text)]">₹{member?.walletBalance || 0}</span>
          </Link>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--play-surface-alt)] border border-[var(--play-border)] hover:border-[var(--play-brand)] transition-colors overflow-hidden"
            >
              {member?.avatarUrl ? (
                <img src={member.avatarUrl} alt={member?.name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-[var(--play-text-muted)]" />
              )}
            </button>

            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 top-12 z-50 w-64 rounded-[var(--play-radius-md)] bg-[var(--play-surface)] p-2 shadow-lg border border-[var(--play-border)]">
                  <div className="px-3 py-2 pb-3 border-b border-[var(--play-border)]">
                    <p className="text-sm font-medium text-[var(--play-text)]">{member?.name || 'Guest'}</p>
                    <p className="text-xs text-[var(--play-text-muted)]">{member?.email || member?.phone}</p>
                  </div>
                  
                  {familyMembers.length > 0 && (
                    <div className="py-2 border-b border-[var(--play-border)]">
                      <p className="px-3 py-1 text-xs font-semibold text-[var(--play-text-light)] uppercase tracking-wider">Switch Profile</p>
                      {familyMembers.map((famMember) => (
                        <button
                          key={famMember.id}
                          onClick={() => {
                            switchMember(famMember.id);
                            setIsProfileOpen(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--play-text)] hover:bg-[var(--play-surface-alt)]"
                        >
                          <Users className="h-4 w-4 text-[var(--play-text-muted)]" />
                          <span className="truncate">{famMember.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--play-error)] hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm">
          <div className="absolute top-0 left-0 bottom-0 w-3/4 max-w-sm bg-[var(--play-surface)] shadow-2xl flex flex-col transform transition-transform duration-300">
            <div className="p-4 border-b border-[var(--play-border)] flex justify-between items-center">
              <span className="text-xl font-bold text-[var(--play-brand)]">Sportsvilla</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-[var(--play-text-muted)] hover:bg-[var(--play-surface-alt)] rounded-md"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[var(--play-radius-md)] text-base font-medium transition-colors ${
                      isActive 
                        ? 'bg-[var(--play-brand-light)] text-[var(--play-brand-dark)]' 
                        : 'text-[var(--play-text)] hover:bg-[var(--play-surface-alt)]'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-[var(--play-brand)]' : 'text-[var(--play-text-light)]'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            
            <div className="p-4 border-t border-[var(--play-border)]">
              <Link
                href="/play/wallet"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 bg-[var(--play-surface-alt)] rounded-[var(--play-radius-md)] text-[var(--play-text)] font-medium mb-4"
              >
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-[var(--play-brand)]" />
                  Wallet Balance
                </div>
                <span className="font-bold">₹{member?.walletBalance || 0}</span>
              </Link>
              
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-[var(--play-radius-md)] text-base font-medium text-[var(--play-error)] hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
