'use client';

import useSWR from 'swr';
import { usePlayAuth } from '@/components/play/PlayAuthProvider';
import { Calendar, CheckCircle2, XCircle, Activity, CreditCard, Clock } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function MembershipsPage() {
  const { member } = usePlayAuth();

  const { data, error } = useSWR(
    member?.id ? `/api/client/v1/profile?memberId=${member.id}` : null,
    fetcher
  );

  const memberships = data?.memberships || [];
  const attendance = data?.attendanceLog || [];

  if (!member) return null;

  return (
    <div className="min-h-screen bg-[var(--play-bg)] text-[var(--play-text)] p-4 sm:p-6 pb-24">
      <h1 className="text-2xl font-bold font-outfit mb-6 flex items-center gap-2">
        <CreditCard className="w-6 h-6 text-[var(--play-brand)]" />
        My Memberships
      </h1>

      {/* Active Passes */}
      <section className="mb-10">
        <h2 className="text-lg font-bold font-outfit mb-4">Active Passes</h2>
        <div className="space-y-4">
          {memberships.length > 0 ? memberships.map((pass: any, idx: number) => {
            const usagePercent = Math.min(100, (pass.usedSessions / pass.totalSessions) * 100);
            
            return (
              <div key={idx} className="relative bg-[var(--play-surface)] p-5 rounded-[var(--play-radius-lg)] border border-[var(--play-border)] shadow-sm overflow-hidden">
                {/* Watermark */}
                <div className="absolute -right-4 -bottom-4 opacity-5 text-[var(--play-brand)] pointer-events-none">
                  <Activity className="w-32 h-32" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg font-outfit">{pass.title}</h3>
                      <p className="text-sm text-[var(--play-text-muted)]">{pass.sport}</p>
                    </div>
                    <div className="bg-[var(--play-brand-light)] text-[var(--play-brand-dark)] px-3 py-1 rounded-[var(--play-radius-pill)] text-sm font-semibold flex items-center gap-1 border border-[var(--play-brand)]/20">
                      <Clock className="w-4 h-4" />
                      {pass.daysRemaining} days left
                    </div>
                  </div>

                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-[var(--play-text-muted)] font-medium">Sessions Used</span>
                    <span className="font-semibold">{pass.usedSessions} / {pass.totalSessions}</span>
                  </div>
                  
                  <div className="w-full bg-[var(--play-bg)] rounded-full h-2.5 border border-[var(--play-border)] overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full ${usagePercent >= 90 ? 'bg-red-500' : 'bg-[var(--play-brand)]'}`} 
                      style={{ width: `${usagePercent}%` }}
                    ></div>
                  </div>
                  {pass.expiresAt && (
                    <p className="text-xs text-[var(--play-text-muted)] mt-4">
                      Expires on {new Date(pass.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-8 text-[var(--play-text-muted)] bg-[var(--play-surface)] rounded-[var(--play-radius-lg)] border border-[var(--play-border)]">
              No active passes found.
            </div>
          )}
        </div>
      </section>

      {/* Attendance Log */}
      <section>
        <h2 className="text-lg font-bold font-outfit mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Recent Attendance
        </h2>
        <div className="bg-[var(--play-surface)] rounded-[var(--play-radius-lg)] border border-[var(--play-border)] shadow-sm overflow-hidden">
          {attendance.length > 0 ? (
            <div className="divide-y divide-[var(--play-border)]">
              {attendance.map((record: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-sm">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    <p className="text-xs text-[var(--play-text-muted)]">{record.sessionName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.status === 'Present' ? (
                      <span className="flex items-center gap-1 text-sm font-medium text-[var(--play-brand-dark)] bg-[var(--play-brand-light)] px-2 py-1 rounded-md">
                        <CheckCircle2 className="w-4 h-4" /> Present
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm font-medium text-red-700 bg-red-100 px-2 py-1 rounded-md">
                        <XCircle className="w-4 h-4" /> Absent
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-[var(--play-text-muted)] text-sm">
              No recent attendance records.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
