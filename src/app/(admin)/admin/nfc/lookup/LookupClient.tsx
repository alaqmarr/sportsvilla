"use client";

import React, { useEffect, useState } from "react";
import { useNfc } from "@/components/nfc/NfcProvider";
import { getMemberDetailsByCard } from "./actions";
import { Loader2, User, Calendar, CreditCard, Activity, Wifi } from "lucide-react";
import { format } from "date-fns";
import { Prisma } from "@/generated/client";
import {
  Card,
  Badge,
} from "@/components/admin/ui";

type MemberDetails = Prisma.NfcCardGetPayload<{
  include: {
    member: {
      include: {
        bookings: true;
        walletTransactions: true;
        memberships: {
          include: { membershipPlan: true; turf: true };
        };
      };
    };
  };
}>;

export default function LookupClient() {
  const { subscribe } = useNfc();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MemberDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribe(async (uid) => {
      setLoading(true);
      setError(null);
      try {
        const res = await getMemberDetailsByCard(uid);
        if (!res) {
          setError("Card not registered.");
          setData(null);
        } else if (!res.member) {
          setError("Card is registered but unassigned.");
          setData(res);
        } else {
          setData(res);
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching member details.");
        setData(null);
      } finally {
        setLoading(false);
      }
    });
  }, [subscribe]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-sv-text-muted">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-sv-brand" />
        <p className="text-lg text-sv-text font-medium">Fetching details...</p>
      </div>
    );
  }

  if (!data && !error) {
    return (
      <Card variant="ghost" padding="lg" className="flex flex-col items-center justify-center py-20 text-center">
        <Wifi className="w-16 h-16 text-sv-status-info mb-6 animate-pulse" />
        <h2 className="text-xl font-bold text-sv-text mb-2">Ready to Scan</h2>
        <p className="text-sv-text-muted text-center max-w-md text-sm">
          Tap Card to Lookup Member. As soon as the card is tapped, the member&apos;s details will appear here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-sv-error-subtle text-sv-error-text rounded-sv-md border border-[#2a2d3e] border-sv-error-border border-[#2a2d3e] text-sm font-medium">
          {error}
        </div>
      )}

      {data && !data.member && (
        <div className="p-6 bg-sv-warning-subtle text-sv-warning-text rounded-sv-md border border-[#2a2d3e] border-sv-warning-border border-[#2a2d3e]">
          <p className="font-semibold">Unassigned Card</p>
          <p className="text-sm mt-1 text-sv-text-muted">UID: {data.cardUid}</p>
        </div>
      )}

      {data && data.member && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Member Info */}
          <Card variant="default" padding="lg" className="col-span-1 md:col-span-3 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-20 h-20 bg-sv-brand-subtle text-sv-brand border border-[#2a2d3e] border-sv-brand/30 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={40} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-sv-text">
                {data.member.name}
              </h2>
              <p className="text-sv-text-muted text-sm mt-1">
                {data.member.mobile} {data.member.email && `• ${data.member.email}`}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant="success" size="md">
                  Card UID: {data.cardUid}
                </Badge>
                <Badge variant="brand" size="md">
                  Wallet: ₹{((data.member.walletBalance || 0) / 100).toFixed(2)}
                </Badge>
                <Badge variant="warning" size="md">
                  Points: {data.member.loyaltyPoints}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Active Memberships */}
          <Card variant="default" padding="lg">
            <h3 className="text-base font-bold text-sv-text mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-sv-status-info" />
              Active Memberships
            </h3>
            {data.member.memberships.length === 0 ? (
              <p className="text-sv-text-muted text-sm">No active memberships.</p>
            ) : (
              <div className="space-y-3">
                {data.member.memberships.map((m) => (
                  <div key={m.id} className="border border-[#2a2d3e] border-sv-border border-[#2a2d3e] bg-sv-bg rounded-sv-sm p-3">
                    <p className="font-semibold text-sv-text text-sm">{m.membershipPlan?.name}</p>
                    <p className="text-xs text-sv-text-muted mt-1">
                      {m.turf?.name} • Ends {format(new Date(m.endDate), 'PP')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Upcoming Bookings */}
          <Card variant="default" padding="lg">
            <h3 className="text-base font-bold text-sv-text mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sv-brand" />
              Upcoming Bookings
            </h3>
            {data.member.bookings.length === 0 ? (
              <p className="text-sv-text-muted text-sm">No upcoming bookings.</p>
            ) : (
              <div className="space-y-3">
                {data.member.bookings.map((b) => (
                  <div key={b.id} className="border border-[#2a2d3e] border-sv-border border-[#2a2d3e] bg-sv-bg rounded-sv-sm p-3">
                    <p className="font-semibold text-sv-text text-sm">
                      {format(new Date(b.startTime), 'PPp')}
                    </p>
                    <p className="text-xs text-sv-text-muted mt-1">
                      Status: {b.status} • Payment: {b.paymentStatus}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Transactions */}
          <Card variant="default" padding="lg">
            <h3 className="text-base font-bold text-sv-text mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-sv-status-success" />
              Recent Wallet Tx
            </h3>
            {data.member.walletTransactions.length === 0 ? (
              <p className="text-sv-text-muted text-sm">No recent transactions.</p>
            ) : (
              <div className="space-y-3">
                {data.member.walletTransactions.map((t) => (
                  <div key={t.id} className="flex justify-between items-center border-b border-sv-border-subtle pb-2.5 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-sm text-sv-text">
                        {t.type} {t.description && `• ${t.description}`}
                      </p>
                      <p className="text-xs text-sv-text-muted mt-0.5">
                        {format(new Date(t.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className={`font-bold text-sm ${t.type === 'CREDIT' ? 'text-sv-status-success' : 'text-sv-status-error'}`}>
                      {t.type === 'CREDIT' ? '+' : '-'}₹{t.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>
      )}
    </div>
  );
}
