'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePlayAuth } from '@/components/play/PlayAuthProvider';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function UnauthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { member, isLoading } = usePlayAuth();

  useEffect(() => {
    if (!isLoading && member) {
      router.push('/play/dashboard');
    }
  }, [member, isLoading, router]);

  if (isLoading || member) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-play-bg">
        <Loader2 className="h-8 w-8 animate-spin text-play-brand" />
      </div>
    );
  }

  const isLandingPage = pathname === '/play';

  return (
    <div className="flex min-h-screen flex-col bg-play-bg text-play-text">
      {!isLandingPage && (
        <header className="flex h-16 items-center justify-between border-b border-play-border bg-play-surface/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 z-20">
          <Link href="/play" className="flex items-center gap-2">
            <img src="/long-logo.png" alt="Sportsvilla" className="h-7 w-auto object-contain" />
          </Link>
          <Link
            href="/play"
            className="text-xs sm:text-sm font-semibold text-play-text-muted hover:text-play-brand transition-colors font-play"
          >
            Back to Home
          </Link>
        </header>
      )}
      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>
    </div>
  );
}
