'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, LogOut, User, Users, Wallet } from 'lucide-react';
import { usePlayAuth } from './PlayAuthProvider';

export function Navbar() {
  const { member, familyMembers, switchMember, logout } = usePlayAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--play-surface)] shadow-sm border-b border-[var(--play-border)]">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight text-[var(--play-brand)]">
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
          <Link href="/wallet" className="hidden sm:flex items-center gap-2 play-badge bg-[var(--play-surface-alt)] border border-[var(--play-border)] py-1.5 px-3">
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
  );
}
