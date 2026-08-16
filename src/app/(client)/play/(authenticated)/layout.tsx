'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayAuth } from '@/components/play/PlayAuthProvider';
import { Navbar } from '@/components/play/Navbar';
import { Sidebar } from '@/components/play/Sidebar';
import { BottomNav } from '@/components/play/BottomNav';
import { Footer } from '@/components/play/Footer';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { member, isLoading } = usePlayAuth();

  useEffect(() => {
    if (!isLoading && !member) {
      router.push('/play/login'); // Changed to /play/login as it's the right path based on structure
    }
  }, [member, isLoading, router]);

  if (isLoading || !member) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--play-bg)]">
        <div className="h-16 w-full animate-pulse bg-[var(--play-surface-alt)] border-b border-[var(--play-border)]" />
        <div className="flex flex-1">
          <div className="hidden w-64 animate-pulse bg-[var(--play-surface-alt)] md:block border-r border-[var(--play-border)]" />
          <div className="flex-1 p-6">
            <div className="mb-4 h-8 w-1/4 animate-pulse rounded bg-[var(--play-surface-alt)]" />
            <div className="h-64 w-full animate-pulse rounded-lg bg-[var(--play-surface-alt)]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--play-bg)]">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-y-auto pb-16 md:pb-0">
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
          <Footer />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
