"use client";

import { useEffect, useState } from "react";
import { useNfc } from "@/components/nfc/NfcProvider";
import { getMemberDetailsByCard } from "./actions";
import { Loader2, User, Calendar, CreditCard, Activity, Wifi } from "lucide-react";
import { format } from "date-fns";
import { Prisma } from "@/generated/client";

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
          setData(res); // Just showing card info
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
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-lg">Fetching details...</p>
      </div>
    );
  }

  if (!data && !error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <Wifi className="w-16 h-16 text-blue-500 mb-6 animate-pulse" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Ready to Scan</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          Tap Card to Lookup Member. As soon as the card is tapped, the member&apos;s details will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {data && !data.member && (
        <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 rounded-xl border border-yellow-200 dark:border-yellow-900/50">
          <p className="font-semibold">Unassigned Card</p>
          <p className="text-sm mt-1">UID: {data.cardUid}</p>
        </div>
      )}

      {data && data.member && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Member Info */}
          <div className="col-span-1 md:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={48} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.member.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {data.member.mobile} {data.member.email && `• ${data.member.email}`}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium">
                  Card UID: {data.cardUid}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-sm font-medium">
                  Wallet: ₹{data.member.walletBalance.toFixed(2)}
                </span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-sm font-medium">
                  Points: {data.member.loyaltyPoints}
                </span>
              </div>
            </div>
          </div>

          {/* Active Memberships */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Active Memberships
            </h3>
            {data.member.memberships.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No active memberships.</p>
            ) : (
              <div className="space-y-4">
                {data.member.memberships.map((m) => (
                  <div key={m.id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
                    <p className="font-medium text-gray-900 dark:text-white">{m.membershipPlan?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {m.turf?.name} • Ends {format(new Date(m.endDate), 'PP')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Upcoming Bookings
            </h3>
            {data.member.bookings.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No upcoming bookings.</p>
            ) : (
              <div className="space-y-4">
                {data.member.bookings.map((b) => (
                  <div key={b.id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {format(new Date(b.startTime), 'PPp')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Status: {b.status} • Payment: {b.paymentStatus}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500" />
              Recent Wallet Tx
            </h3>
            {data.member.walletTransactions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No recent transactions.</p>
            ) : (
              <div className="space-y-4">
                {data.member.walletTransactions.map((t) => (
                  <div key={t.id} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {t.type} {t.description && `• ${t.description}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {format(new Date(t.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className={`font-semibold text-sm ${t.type === 'CREDIT' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {t.type === 'CREDIT' ? '+' : '-'}₹{t.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
