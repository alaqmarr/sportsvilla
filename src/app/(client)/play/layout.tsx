import type { Metadata } from 'next';
import './globals.play.css';
import { PlayAuthProvider } from '@/components/play/PlayAuthProvider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Sportsvilla — Book Your Game',
  description: 'Book sports facilities, join open games, and earn rewards with Sportsvilla.',
};

export default function PlayRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-play antialiased bg-play-bg text-play-text min-h-screen">
      <PlayAuthProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'var(--play-surface)',
              color: 'var(--play-text)',
              borderRadius: 'var(--play-radius-md)',
              border: '1px solid var(--play-border)',
              fontFamily: 'var(--font-plus-jakarta), ui-sans-serif, system-ui, sans-serif',
            },
          }}
        />
      </PlayAuthProvider>
    </div>
  );
}
