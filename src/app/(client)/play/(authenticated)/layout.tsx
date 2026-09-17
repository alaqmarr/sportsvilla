'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayAuth } from '@/components/play/PlayAuthProvider';
import { Navbar } from '@/components/play/Navbar';
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
      router.push('/play/login');
    }
  }, [member, isLoading, router]);

  if (isLoading || !member) {
    return (
      <div className="flex min-h-screen flex-col bg-play-bg text-play-text">
        <div className="h-16 w-full animate-pulse bg-play-surface border-b border-play-border" />
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
          <div className="mb-6 h-8 w-64 animate-pulse rounded-play-md bg-play-surface-subtle" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="h-32 animate-pulse rounded-play-xl bg-play-surface border border-play-border" />
            <div className="h-32 animate-pulse rounded-play-xl bg-play-surface border border-play-border" />
            <div className="h-32 animate-pulse rounded-play-xl bg-play-surface border border-play-border" />
          </div>
          <div className="h-64 w-full animate-pulse rounded-play-xl bg-play-surface border border-play-border" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-play-bg text-play-text">
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
