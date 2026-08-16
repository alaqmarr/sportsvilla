'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Gift, Copy, CheckCircle, Megaphone, Star } from 'lucide-react';
import { usePlayAuth } from '@/components/play/PlayAuthProvider';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function OffersPage() {
  const { member } = usePlayAuth();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data, error } = useSWR(
    member?.id ? `/api/client/v1/offers?memberId=${member.id}` : null,
    fetcher
  );

  const announcements = data?.announcements || [];
  const loyalty = data?.loyalty || { currentRank: 'Bronze', nextRank: 'Silver', points: 0, nextRankPoints: 1000 };
  const coupons = data?.coupons || [];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!member) return null;

  const progressPercent = Math.min(100, (loyalty.points / loyalty.nextRankPoints) * 100);

  return (
    <div className="min-h-screen bg-[var(--play-bg)] text-[var(--play-text)] p-4 sm:p-6 pb-24">
      <h1 className="text-2xl font-bold font-outfit mb-6 flex items-center gap-2">
        <Gift className="w-6 h-6 text-[var(--play-brand)]" />
        Offers & Rewards
      </h1>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold font-outfit flex items-center gap-2 mb-4">
            <Megaphone className="w-5 h-5" />
            Announcements
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
            {announcements.map((ann: any, idx: number) => (
              <div key={idx} className="min-w-[280px] w-[80%] md:w-80 bg-gradient-to-r from-[var(--play-brand)] to-[var(--play-brand-dark)] text-white p-5 rounded-[var(--play-radius-lg)] snap-center shadow-md flex-shrink-0">
                <h3 className="font-bold text-lg mb-2">{ann.title}</h3>
                <p className="text-sm opacity-90">{ann.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Loyalty Milestones */}
      <section className="mb-8 bg-[var(--play-surface)] p-5 rounded-[var(--play-radius-lg)] border border-[var(--play-border)] shadow-sm">
        <h2 className="text-lg font-bold font-outfit flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-yellow-500" />
          Loyalty Status
        </h2>
        
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-xs text-[var(--play-text-muted)] uppercase tracking-wider font-semibold">Current Rank</p>
            <p className="text-xl font-bold font-outfit text-[var(--play-brand-dark)]">{loyalty.currentRank}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--play-text-muted)] uppercase tracking-wider font-semibold">Next Rank</p>
            <p className="text-lg font-bold font-outfit text-[var(--play-text)]">{loyalty.nextRank}</p>
          </div>
        </div>

        <div className="w-full bg-[var(--play-bg)] rounded-full h-3 mb-2 border border-[var(--play-border)] overflow-hidden">
          <div 
            className="bg-[var(--play-brand)] h-3 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-[var(--play-text-muted)] text-right">
          <span className="font-semibold text-[var(--play-text)]">{loyalty.points}</span> / {loyalty.nextRankPoints} pts
        </p>
      </section>

      {/* Coupons */}
      <section>
        <h2 className="text-lg font-bold font-outfit mb-4">Available Coupons</h2>
        <div className="space-y-4">
          {coupons.length > 0 ? coupons.map((coupon: any, idx: number) => (
            <div key={idx} className="bg-[var(--play-surface)] rounded-[var(--play-radius-lg)] border border-[var(--play-border)] shadow-sm overflow-hidden flex flex-col sm:flex-row">
              <div className="p-4 flex-1">
                <h3 className="font-bold text-lg mb-1">{coupon.title}</h3>
                <p className="text-sm text-[var(--play-text-muted)]">{coupon.description}</p>
                {coupon.validUntil && (
                  <p className="text-xs text-red-500 mt-2 font-medium">Valid until: {new Date(coupon.validUntil).toLocaleDateString()}</p>
                )}
              </div>
              <div className="bg-[var(--play-surface-alt)] p-4 border-t sm:border-t-0 sm:border-l border-dashed border-[var(--play-border)] flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-3 w-full sm:w-40 shrink-0">
                <div className="font-mono font-bold text-[var(--play-brand-dark)] bg-[var(--play-brand-light)] px-3 py-1 rounded border border-[var(--play-brand)]">
                  {coupon.code}
                </div>
                <button 
                  onClick={() => handleCopy(coupon.code)}
                  className="flex items-center justify-center gap-1 text-sm bg-white border border-[var(--play-border)] hover:bg-[var(--play-bg)] px-3 py-1.5 rounded-[var(--play-radius-md)] transition-colors w-full sm:w-auto"
                >
                  {copiedCode === coupon.code ? (
                    <><CheckCircle className="w-4 h-4 text-[var(--play-brand)]" /> Copied</>
                  ) : (
                    <><Copy className="w-4 h-4 text-[var(--play-text-muted)]" /> Copy</>
                  )}
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-[var(--play-text-muted)] bg-[var(--play-surface)] rounded-[var(--play-radius-lg)] border border-[var(--play-border)]">
              No coupons available right now. Check back later!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
