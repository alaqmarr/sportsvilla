import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.play.css';
import { PlayAuthProvider } from '@/components/play/PlayAuthProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

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
    <div className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-[var(--play-bg)] text-[var(--play-text)] min-h-screen`}>
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
            },
          }}
        />
      </PlayAuthProvider>
    </div>
  );
}
