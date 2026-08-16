'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

type Member = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  walletBalance?: number;
  loyaltyPoints?: number;
};

type AuthContextType = {
  member: Member | null;
  familyMembers: Member[];
  activeMemberId: string | null;
  isLoading: boolean;
  switchMember: (memberId: string) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function PlayAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);

  const { data, error, isLoading } = useSWR('/api/client/v1/auth/web/session', fetcher, {
    shouldRetryOnError: false,
  });

  const member = data?.member || null;
  const familyMembers = data?.familyMembers || [];

  useEffect(() => {
    if (member && !activeMemberId) {
      setActiveMemberId(member.id);
    }
  }, [member, activeMemberId]);

  const switchMember = async (memberId: string) => {
    try {
      const res = await fetch('/api/client/v1/auth/web/switch-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId })
      });
      if (res.ok) {
        window.location.reload();
      } else {
        console.error('Failed to switch profile');
      }
    } catch (err) {
      console.error('Switch profile error', err);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/client/v1/auth/web/logout', { method: 'POST' });
      router.push('/play/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const currentMember = activeMemberId === member?.id ? member : familyMembers.find((m: Member) => m.id === activeMemberId) || member;

  return (
    <AuthContext.Provider
      value={{
        member: currentMember,
        familyMembers,
        activeMemberId,
        isLoading,
        switchMember,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function usePlayAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('usePlayAuth must be used within a PlayAuthProvider');
  }
  return context;
}
