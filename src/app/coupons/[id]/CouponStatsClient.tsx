"use client";

import { FiArrowLeft, FiTag, FiTrendingUp, FiUsers, FiDollarSign, FiCalendar } from "react-icons/fi";
import LinkComponent from "next/link";
import { format } from "date-fns";

export default function CouponStatsClient({ coupon }: { coupon: any }) {
  const totalUsages = coupon.usages.length;
  const totalDiscountGiven = coupon.usages.reduce((sum: number, u: any) => sum + (u.discountAmount || 0), 0);
  
  // Unique members who used it
  const uniqueMembers = new Set(coupon.usages.map((u: any) => u.memberId)).size;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <LinkComponent href="/coupons" className="bg-[#1c1f2e] border border-[#2a2d3e] p-2 rounded-lg text-gray-400 hover:text-white hover:border-orange-500 transition-colors">
          <FiArrowLeft size={20} />
        </LinkComponent>
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FiTrendingUp className="text-orange-500" />
            Coupon Performance
          </h1>
          <p className="text-gray-400 mt-1">Detailed statistics and usage ledger for <strong className="text-orange-400">{coupon.code}</strong></p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 flex flex-col justify-center">
          <div className="text-gray-400 text-sm flex items-center gap-2 mb-2"><FiTag /> Total Usages</div>
          <div className="text-3xl font-black text-white">{totalUsages}</div>
          <div className="text-xs text-gray-500 mt-1">{coupon.maxUses ? `${coupon.maxUses - totalUsages} uses remaining globally` : "No global limit"}</div>
        </div>

        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 flex flex-col justify-center">
          <div className="text-gray-400 text-sm flex items-center gap-2 mb-2"><FiDollarSign /> Total Discount Value</div>
          <div className="text-3xl font-black text-green-400">₹{totalDiscountGiven.toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">Amount saved by members</div>
        </div>

        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 flex flex-col justify-center">
          <div className="text-gray-400 text-sm flex items-center gap-2 mb-2"><FiUsers /> Unique Members</div>
          <div className="text-3xl font-black text-white">{uniqueMembers}</div>
          <div className="text-xs text-gray-500 mt-1">Different users who claimed this</div>
        </div>

        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 flex flex-col justify-center">
          <div className="text-gray-400 text-sm flex items-center gap-2 mb-2"><FiCalendar /> Expiry Status</div>
          <div className={`text-xl font-black ${coupon.isActive ? "text-green-400" : "text-red-400"}`}>
            {coupon.isActive ? "ACTIVE" : "INACTIVE"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {coupon.expiryDate ? `Expires ${format(new Date(coupon.expiryDate), 'PPP')}` : "Never expires"}
          </div>
        </div>
      </div>

      {/* Usage Ledger */}
      <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl overflow-hidden mt-4 shadow-lg">
        <div className="p-5 border-b border-[#2a2d3e] flex justify-between items-center bg-[#1c1f2e]">
          <h2 className="text-xl font-bold text-white">Usage Ledger</h2>
          <span className="text-sm text-gray-400">Showing {coupon.usages.length} transactions</span>
        </div>
        
        {coupon.usages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-[#0f1117] text-xs uppercase font-semibold text-gray-500 border-b border-[#2a2d3e]">
                <tr>
                  <th className="px-6 py-4">Date / Time</th>
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Booking Details</th>
                  <th className="px-6 py-4 text-right">Discount Saved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2d3e]">
                {coupon.usages.map((usage: any) => (
                  <tr key={usage.id} className="hover:bg-[#1c1f2e]/50 transition-colors">
                    <td className="px-6 py-4 text-white whitespace-nowrap">
                      {format(new Date(usage.createdAt), 'dd MMM yyyy, h:mm a')}
                    </td>
                    <td className="px-6 py-4 font-bold text-orange-400">
                      {usage.member?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {usage.member?.mobile || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {usage.booking ? (
                        <div>
                          <div className="text-white font-medium">{usage.booking.turf?.name} ({usage.booking.sport?.name})</div>
                          <div className="text-xs mt-0.5">Booking #{usage.booking.id.slice(-6).toUpperCase()}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {format(new Date(usage.booking.startTime), 'MMM dd, h:mm a')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-600 italic">Booking deleted</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-green-400 text-base">
                      ₹{usage.discountAmount?.toFixed(2) || '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500">
            <FiTrendingUp className="text-5xl mb-4 opacity-20" />
            <p className="text-lg font-medium">No Usages Yet</p>
            <p className="text-sm mt-1">This coupon hasn't been redeemed by anyone yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
