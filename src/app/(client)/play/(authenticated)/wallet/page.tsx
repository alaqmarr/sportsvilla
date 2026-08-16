'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { usePlayAuth } from '@/components/play/PlayAuthProvider';
import { Wallet, Coins, ArrowUpRight, ArrowDownRight, History } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function WalletPage() {
  const { member } = usePlayAuth();
  const [filter, setFilter] = useState('All');
  const [redeemPoints, setRedeemPoints] = useState<number | ''>('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const { data, error, mutate } = useSWR(
    member?.id ? `/api/client/v1/wallet?memberId=${member.id}` : null,
    fetcher
  );

  const handleRedeem = async () => {
    if (!redeemPoints || redeemPoints < 500) return;
    setIsRedeeming(true);
    try {
      const res = await fetch('/api/client/v1/wallet/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member?.id, points: redeemPoints }),
      });
      if (res.ok) {
        setRedeemPoints('');
        mutate();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsRedeeming(false);
    }
  };

  const points = data?.pointsBalance || 0;
  const inr = data?.inrBalance || 0;
  const transactions = data?.transactions || [];

  const filteredTransactions = transactions.filter((t: any) => {
    if (filter === 'All') return true;
    if (filter === 'Wallet') return t.type === 'inr';
    if (filter === 'Points') return t.type === 'points';
    return true;
  });

  if (!member) return null;

  return (
    <div className="min-h-screen bg-[var(--play-bg)] text-[var(--play-text)] p-4 sm:p-6 pb-24">
      <h1 className="text-2xl font-bold font-outfit mb-6">Wallet & Points</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[var(--play-surface)] p-4 rounded-[var(--play-radius-lg)] border border-[var(--play-border)] shadow-sm">
          <div className="flex items-center gap-2 text-[var(--play-text-muted)] mb-2">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium">SV Points</span>
          </div>
          <p className="text-2xl font-bold font-outfit">{points}</p>
        </div>
        <div className="bg-[var(--play-brand)] text-white p-4 rounded-[var(--play-radius-lg)] shadow-sm">
          <div className="flex items-center gap-2 text-[var(--play-brand-light)] mb-2">
            <Wallet className="w-4 h-4" />
            <span className="text-sm font-medium">INR Wallet</span>
          </div>
          <p className="text-2xl font-bold font-outfit">₹{inr}</p>
        </div>
      </div>

      <div className="bg-[var(--play-surface)] p-5 rounded-[var(--play-radius-lg)] border border-[var(--play-border)] mb-8 shadow-sm">
        <h2 className="text-lg font-bold font-outfit mb-4">Redeem Points</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--play-text-muted)] mb-1">Points to redeem (Min 500)</label>
            <input 
              type="number" 
              className="w-full bg-[var(--play-bg)] border border-[var(--play-border)] rounded-[var(--play-radius-md)] px-4 py-2 focus:outline-none focus:border-[var(--play-brand)]"
              value={redeemPoints}
              onChange={e => setRedeemPoints(e.target.value ? parseInt(e.target.value) : '')}
              placeholder="0"
              min="500"
            />
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--play-text-muted)]">Equivalent INR</span>
            <span className="font-semibold text-[var(--play-text)]">₹{redeemPoints ? Math.floor(redeemPoints / 10) : 0}</span>
          </div>
          <button 
            className="w-full bg-[var(--play-brand)] hover:bg-[var(--play-brand-dark)] text-white font-medium py-3 rounded-[var(--play-radius-md)] transition-colors disabled:opacity-50"
            disabled={!redeemPoints || redeemPoints < 500 || isRedeeming}
            onClick={handleRedeem}
          >
            {isRedeeming ? 'Redeeming...' : 'Redeem Points'}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-bold font-outfit flex items-center gap-2 mb-4">
          <History className="w-5 h-5" />
          Transaction History
        </h2>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Wallet', 'Points'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-[var(--play-radius-pill)] text-sm whitespace-nowrap transition-colors ${
                filter === f 
                  ? 'bg-[var(--play-brand)] text-white' 
                  : 'bg-[var(--play-surface)] text-[var(--play-text-muted)] border border-[var(--play-border)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredTransactions.length > 0 ? filteredTransactions.map((t: any, i: number) => (
          <div key={i} className="flex items-center justify-between bg-[var(--play-surface)] p-4 rounded-[var(--play-radius-md)] border border-[var(--play-border)]">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${t.amount > 0 ? 'bg-[var(--play-brand-light)] text-[var(--play-brand-dark)]' : 'bg-red-100 text-red-600'}`}>
                {t.amount > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
              <div>
                <p className="font-medium text-sm text-[var(--play-text)]">{t.title}</p>
                <p className="text-xs text-[var(--play-text-muted)]">{new Date(t.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className={`font-bold font-outfit ${t.amount > 0 ? 'text-[var(--play-brand-dark)]' : 'text-red-600'}`}>
              {t.amount > 0 ? '+' : ''}{t.amount} {t.type === 'inr' ? 'INR' : 'Pts'}
            </div>
          </div>
        )) : (
          <div className="text-center py-8 text-[var(--play-text-muted)] text-sm">
            No transactions found.
          </div>
        )}
      </div>
    </div>
  );
}
