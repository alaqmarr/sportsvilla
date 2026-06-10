"use client";
import { FiAward, FiStar, FiTrendingUp } from "react-icons/fi";
import { formatIST } from "../../lib/dateUtils";

export default function LoyaltyClient({ initialMembers }: { initialMembers: any[] }) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-['Outfit'] text-white flex items-center gap-3">
          <FiAward className="text-orange-500" /> Loyalty Leaderboard
        </h1>
        <p className="text-gray-500 mt-2">Top members ranked by loyalty points earned through check-ins and bookings.</p>
      </div>

      <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1c1f2e] border-b border-[#2a2d3e] text-xs uppercase tracking-widest text-gray-500 font-semibold">
                <th className="px-6 py-4 text-center w-16">Rank</th>
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Mobile</th>
                <th className="px-6 py-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2d3e]">
              {initialMembers.map((member, index) => {
                const rank = index + 1;
                let rankStyle = "text-gray-500";
                let rankBg = "bg-transparent";
                let icon = null;

                if (rank === 1) {
                  rankStyle = "text-yellow-400";
                  rankBg = "bg-yellow-400/10";
                  icon = <FiAward size={18} />;
                } else if (rank === 2) {
                  rankStyle = "text-gray-300";
                  rankBg = "bg-gray-300/10";
                  icon = <FiAward size={18} />;
                } else if (rank === 3) {
                  rankStyle = "text-amber-600";
                  rankBg = "bg-amber-600/10";
                  icon = <FiAward size={18} />;
                }

                return (
                  <tr key={member.id} className="hover:bg-[#1c1f2e] transition-colors group">
                    <td className="px-6 py-5 text-center">
                      <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center font-bold font-['Outfit'] text-sm ${rankBg} ${rankStyle}`}>
                        {icon || rank}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-['Outfit'] text-sm shrink-0 ${
                          rank <= 3 ? rankBg + " " + rankStyle : "bg-orange-500/10 text-orange-400"
                        }`}>
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className={`font-semibold text-base ${rank <= 3 ? 'text-white' : 'text-gray-300'}`}>{member.name}</div>
                          <div className="text-gray-500 text-xs mt-0.5">Joined {formatIST(new Date(member.joinDate), 'MMM yyyy')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-gray-400 text-sm font-mono bg-[#0f1117] px-2 py-1 rounded inline-block border border-[#2a2d3e]">
                        {member.mobile}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-xl font-bold font-['Outfit'] text-orange-400 tracking-tight">
                          {member.loyaltyPoints}
                        </div>
                        <FiStar className="text-orange-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {initialMembers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <FiTrendingUp className="mx-auto text-4xl mb-3 opacity-20" />
                    No members found. Members earn points by checking in.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
