import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[var(--play-surface-alt)] py-8 mt-auto border-t border-[var(--play-border)] pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="text-xl font-bold tracking-tight text-[var(--play-brand)]">Sportsvilla</span>
          <span className="text-xs text-[var(--play-text-muted)]">© {new Date().getFullYear()} Sportsvilla. All rights reserved.</span>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-medium text-[var(--play-text-muted)]">
          <Link href="/privacy-policy" className="hover:text-[var(--play-brand)] transition-colors">Privacy Policy</Link>
          <Link href="/terms-and-conditions" className="hover:text-[var(--play-brand)] transition-colors">Terms</Link>
          <Link href="/refund-policy" className="hover:text-[var(--play-brand)] transition-colors">Refund Policy</Link>
        </div>
        
        <div className="text-xs text-[var(--play-text-light)] text-center md:text-right">
          Made with <span className="text-red-500">❤️</span> by Sportsvilla<br />
          Designed and Developed by RAPID SHIFT LABS
        </div>
      </div>
    </footer>
  );
}
