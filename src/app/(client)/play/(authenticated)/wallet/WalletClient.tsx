'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Coins, ArrowUpRight, ArrowDownRight, History } from 'lucide-react';

export function WalletClient({ profile, transactions }: { profile: any, transactions: any[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  
  const inr = ((profile?.walletBalance || 0) / 100).toFixed(2);

  const filteredTransactions = transactions.filter((t: any) => {
    if (filter === 'All') return true;
    if (filter === 'Sportsvilla Credits') return t.isWallet === true; // placeholder logic
    if (filter === 'Gift Cards') return t.isGiftCard === true; // placeholder logic
    return true;
  });

  return (
    <div className="text-[var(--play-text)] pb-32 min-h-screen bg-[var(--play-bg)]">
      {/* Header */}
      <div className="bg-[var(--play-surface)] px-4 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-[var(--play-border)]">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-[var(--play-text)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="text-lg font-bold tracking-wide uppercase text-[var(--play-text)]">Wallet</h1>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 border border-[var(--play-border)] rounded-[var(--play-radius-sm)] bg-[var(--play-surface)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
          <span className="font-semibold text-sm">₹ {inr}</span>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Gift Card Promo Card */}
        <div className="bg-[var(--play-surface)] rounded-[var(--play-radius-lg)] p-5 shadow-sm border border-[var(--play-border)] flex justify-between relative overflow-hidden">
          <div className="z-10 w-3/5">
            <h3 className="text-[var(--play-text-muted)] font-medium leading-tight mb-4">
              The perfect gift for every...
            </h3>
            <button className="bg-[var(--play-brand)] hover:bg-[var(--play-brand-dark)] text-white px-4 py-2.5 rounded-[var(--play-radius-md)] font-bold text-sm flex items-center gap-2 shadow-sm transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="14" rx="2"/><path d="M12 5a3 3 0 1 0-3 3"/><path d="M15 8a3 3 0 1 0-3-3"/><path d="M12 8v14"/><path d="M3 15h18"/></svg>
              BUY GIFT CARD
            </button>
          </div>
          {/* Illustration placeholder */}
          <div className="absolute right-0 top-0 bottom-0 w-2/5 flex items-end justify-end pointer-events-none">
             <div className="w-32 h-32 bg-[var(--play-brand-light)] rounded-tl-full opacity-50 translate-x-1/4 translate-y-1/4" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Sportsvilla Credits', 'Gift Cards'].map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-4 py-2 rounded-[var(--play-radius-md)] whitespace-nowrap text-sm font-semibold transition-colors ${
                filter === opt 
                  ? 'bg-[var(--play-brand)] text-[var(--play-brand-dark)] border border-transparent' 
                  : 'bg-transparent text-[var(--play-text-muted)] border border-[var(--play-border)] hover:bg-[var(--play-surface-alt)]'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Transactions */}
        <div className="space-y-4">
          {filteredTransactions.map((t: any) => (
            <div key={t.id} className="bg-[var(--play-surface)] p-4 rounded-[var(--play-radius-md)] border border-[var(--play-border)] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {t.type === 'CREDIT' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[var(--play-text)]">{t.description}</h4>
                  <p className="text-xs text-[var(--play-text-muted)]">{new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className={`font-bold ${t.type === 'CREDIT' ? 'text-emerald-500' : 'text-red-500'}`}>
                {t.type === 'CREDIT' ? '+' : '-'}₹{(t.amount / 100).toFixed(2)}
              </div>
            </div>
          ))}
          {filteredTransactions.length === 0 && (
            <div className="text-center py-10 bg-[var(--play-surface)] rounded-[var(--play-radius-md)] border border-[var(--play-border)]">
              <History className="w-12 h-12 text-[var(--play-text-muted)] mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-semibold text-[var(--play-text)] mb-1">No Transactions</h3>
              <p className="text-[var(--play-text-muted)] text-sm">You haven't made any transactions yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
