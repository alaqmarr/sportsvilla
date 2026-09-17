'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  History,
  ArrowLeft,
  Gift,
  Plus,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  PlayCard,
  PlayCardHeader,
  PlayCardTitle,
  PlayCardContent,
} from '@/components/play/ui/PlayCard';
import { PlayBadge } from '@/components/play/ui/PlayBadge';
import { PlayButton } from '@/components/play/ui/PlayButton';
import { PlayEmptyState } from '@/components/play/ui/PlayEmptyState';
import { PlayModal } from '@/components/play/ui/PlayModal';

export function WalletClient({ profile, transactions }: { profile: any; transactions: any[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const rawBalance = profile?.walletBalance || 0;
  // If stored in paise (>1000) or rupees, support both cleanly
  const inr = rawBalance > 1000 ? (rawBalance / 100).toFixed(2) : Number(rawBalance).toFixed(2);

  const filteredTransactions = transactions.filter((t: any) => {
    if (filter === 'All') return true;
    if (filter === 'Credits') return t.type === 'CREDIT';
    if (filter === 'Debits') return t.type === 'DEBIT';
    return true;
  });

  const filterOptions = ['All', 'Credits', 'Debits'];

  return (
    <div className="text-play-text font-play pb-32 min-h-screen bg-play-bg space-y-6 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-4">
      {/* Header */}
      <div className="bg-play-surface px-5 py-4 rounded-play-xl border border-play-border shadow-play-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/play/dashboard"
            className="text-play-text-muted hover:text-play-text p-1 -ml-1 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-black tracking-tight text-play-text uppercase">
              Player Wallet
            </h1>
            <p className="text-xs text-play-text-muted">Direct credits, cashback & refund history</p>
          </div>
        </div>

        <PlayBadge variant="brand" size="md" dot>
          Active Balance: ₹{inr}
        </PlayBadge>
      </div>

      {/* Main Balance Hero Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7">
          <div className="bg-gradient-to-br from-play-brand to-play-brand-dark rounded-play-xl p-6 sm:p-8 text-white shadow-play-md relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <Wallet size={130} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-play-pill bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white">
                  Available Credits
                </span>
                <span className="text-xs text-emerald-100 font-semibold">1 Credit = ₹1.00</span>
              </div>

              <div className="text-4xl sm:text-5xl font-black tracking-tight mb-2">
                ₹{inr}
              </div>
              <p className="text-xs sm:text-sm text-emerald-100">
                Usable for 1-click slot bookings and tournament entry fees
              </p>
            </div>

            <div className="relative z-10 pt-6 flex gap-3">
              <button
                onClick={() => setIsTopUpOpen(true)}
                className="bg-white hover:bg-emerald-50 text-play-brand-dark font-black py-2.5 px-5 rounded-play-md text-sm shadow-play-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={16} /> Top Up Balance
              </button>
              <Link href="/play/book">
                <button className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2.5 px-4 rounded-play-md text-sm transition-all">
                  Book Court
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Gift Card Banner */}
        <div className="md:col-span-5">
          <PlayCard variant="elevated" padding="lg" className="flex flex-col justify-between h-full">
            <div>
              <div className="w-10 h-10 rounded-play-md bg-play-accent-subtle flex items-center justify-center text-play-accent mb-3">
                <Gift size={20} />
              </div>
              <h3 className="font-black text-lg text-play-text mb-1">Gift Cards & Passes</h3>
              <p className="text-xs text-play-text-muted leading-relaxed mb-4">
                Gift hours of play to your squad or purchase multi-session passes with up to 20% bonus credits.
              </p>
            </div>

            <div>
              <Link href="/play/memberships">
                <PlayButton variant="secondary" size="md" fullWidth>
                  Explore Player Passes
                </PlayButton>
              </Link>
            </div>
          </PlayCard>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-play-text">Transaction Ledger</h2>
            <p className="text-xs text-play-text-muted">Comprehensive history of top-ups, refunds, and deductions</p>
          </div>

          <div className="flex gap-2">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-3.5 py-1.5 rounded-play-pill text-xs font-bold transition-all cursor-pointer ${
                  filter === opt
                    ? 'bg-play-brand text-white shadow-play-sm'
                    : 'bg-play-surface border border-play-border text-play-text-secondary hover:bg-play-surface-hover'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((t: any) => {
              const isCredit = t.type === 'CREDIT';
              const amt = t.amount > 1000 ? (t.amount / 100).toFixed(2) : Number(t.amount).toFixed(2);
              return (
                <div
                  key={t.id}
                  className="bg-play-surface p-4 rounded-play-xl border border-play-border shadow-play-sm flex items-center justify-between hover:border-play-brand/30 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-play-md flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-play-brand-light text-play-brand-dark'
                          : 'bg-play-surface-subtle text-play-text-muted'
                      }`}
                    >
                      {isCredit ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-play-text">
                        {t.description || (isCredit ? 'Wallet Top-up / Refund' : 'Court Booking Payment')}
                      </h4>
                      <p className="text-xs text-play-text-muted mt-0.5">
                        {new Date(t.createdAt).toLocaleDateString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`font-black text-base sm:text-lg ${
                      isCredit ? 'text-play-brand-dark' : 'text-play-text'
                    }`}
                  >
                    {isCredit ? '+' : '-'}₹{amt}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <PlayEmptyState
            icon={History}
            title="No transactions yet"
            description="Your wallet activity and transaction history will appear here once you book or add funds."
            actionText="Book a Court"
            actionHref="/play/book"
          />
        )}
      </div>

      {/* Top-up Modal */}
      {isTopUpOpen && (
        <PlayModal
          isOpen={isTopUpOpen}
          onClose={() => setIsTopUpOpen(false)}
          title="Top Up Wallet"
          description="Instant wallet credits for seamless checkout and cashback perks."
          size="md"
        >
          <div className="space-y-4 py-2">
            <p className="text-xs text-play-text-muted">
              Select an amount to recharge your SportsVilla player account:
            </p>

            <div className="grid grid-cols-3 gap-3">
              {['500', '1000', '2000', '3000', '5000', '10000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setIsTopUpOpen(false);
                    router.push('/play/book');
                  }}
                  className="p-3 border border-play-border rounded-play-md text-center hover:border-play-brand hover:bg-play-brand-light/30 transition-all font-black text-sm text-play-text cursor-pointer"
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-play-border flex items-center justify-between text-xs text-play-text-muted">
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-play-brand" /> 100% Secure UPI / Cards
              </span>
              <span>Instant Credit</span>
            </div>
          </div>
        </PlayModal>
      )}
    </div>
  );
}

