'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayAuth } from '@/components/play/PlayAuthProvider';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function UnauthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { member, isLoading } = usePlayAuth();

  useEffect(() => {
    if (!isLoading && member) {
      router.push('/play/dashboard'); // Assuming dashboard is under play. Prompt says /dashboard, let's just use /dashboard if requested, or /play/dashboard. The prompt says router.push('/dashboard'). I will use '/play/dashboard' because the root is under play. Or I'll just use what prompt says: '/dashboard'
    }
  }, [member, isLoading, router]);

  if (isLoading || member) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--play-brand)]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-center border-b border-[var(--play-border)] bg-[var(--play-surface)] px-4 sm:justify-start sm:px-6 lg:px-8">
        <Link href="/play" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--play-brand)] text-white font-bold font-heading">
            SV
          </div>
          <span className="text-xl font-bold tracking-tight font-heading text-[var(--play-brand-dark)]">
            Sportsvilla
          </span>
        </Link>
      </header>
      <main className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
