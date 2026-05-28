"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchMembershipReports } from "./actions";
import { format, startOfDay } from "date-fns";
import { FiDownload, FiSearch, FiLayers, FiAward } from "react-icons/fi";
import { useAlert } from "@/components/AlertProvider";

export default function MembershipReportClient() {
  const { showAlert } = useAlert();
  const router = useRouter();
  
  // Default to today
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  
  const [loading, setLoading] = useState(false);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await fetchMembershipReports(startDate, endDate);
      setMemberships(data);
      setHasSearched(true);
    } catch (err) {
      showAlert("Data Error", "Failed to fetch membership data from the server. Please try again.", "error");
    }
    setLoading(false);
  };

  const calculateStats = (m: any) => {
    const periodStart = startOfDay(new Date(startDate));
    const periodEnd = startOfDay(new Date(endDate));
    const mStart = startOfDay(new Date(m.startDate));
    const mEnd = startOfDay(new Date(m.endDate));
    const now = startOfDay(new Date());

    // Effective bounds for attendance calculation
    const effectiveEnd = new Date(Math.min(periodEnd.getTime(), mEnd.getTime(), now.getTime()));
    const effectiveStart = new Date(Math.max(periodStart.getTime(), mStart.getTime()));

    const attended = m.member.attendances.length;
    let expectedDays = 0;

    if (effectiveStart <= effectiveEnd) {
      const msElapsed = effectiveEnd.getTime() - effectiveStart.getTime();
      expectedDays = Math.floor(msElapsed / (1000 * 60 * 60 * 24)) + 1;
    }

    const missed = Math.max(0, expectedDays - attended);

    return { attended, missed };
  };

  useEffect(() => {
    handleSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-white">Membership Reports</h1>
          <p className="text-gray-500 mt-1 text-sm">View enrolled users, attendance metrics, and renewed statuses.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6 mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Start Date</label>
          <input 
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 [color-scheme:dark]"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">End Date</label>
          <input 
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 [color-scheme:dark]"
          />
        </div>
        <button 
          onClick={handleSearch}
          disabled={loading}
          className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-8 py-3 font-semibold transition-colors flex justify-center items-center gap-2 cursor-pointer border-none shrink-0"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <><FiSearch /> Generate</>
          )}
        </button>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-[#2a2d3e] flex justify-between items-center bg-[#0f1117]">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <FiLayers className="text-orange-400" /> Membership Results
            </h3>
            <div className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-semibold">
              {memberships.length} RECORDS FOUND
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-[#0f1117]/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-[#2a2d3e]">Member & Badges</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-[#2a2d3e]">Membership Plan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-[#2a2d3e]">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-[#2a2d3e]">Check-ins (In Period)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2d3e]">
                {memberships.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No memberships found active during this date range.
                    </td>
                  </tr>
                ) : (
                  memberships.map(m => {
                    const stats = calculateStats(m);
                    const isActive = m.status === 'ACTIVE' && new Date(m.endDate) >= new Date();
                    const isRenewed = m.member.memberships.length > 1;

                    return (
                      <tr 
                        key={m.id} 
                        onClick={() => router.push(`/reports/memberships/${m.id}`)}
                        className="hover:bg-[#1c1f2e] transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-sm font-['Outfit']">
                              {m.member.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-white font-medium flex items-center gap-2">
                                {m.member.name}
                                {isRenewed && (
                                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
                                    <FiAward /> Renewed
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-500 text-xs mt-0.5">{m.member.mobile}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white font-medium text-sm">{m.membershipPlan.name}</div>
                          <div className="text-gray-500 text-xs mt-0.5 inline-flex items-center px-1.5 py-0.5 bg-[#0f1117] border border-[#2a2d3e] rounded">
                            {format(new Date(m.startDate), 'MMM d, yy')} - {format(new Date(m.endDate), 'MMM d, yy')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {isActive ? 'Active' : 'Expired'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-4 text-sm">
                            <div className="flex flex-col items-center">
                              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Attended</span>
                              <span className="text-emerald-400 font-bold">{stats.attended}</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Skipped</span>
                              <span className="text-red-400 font-bold">{stats.missed}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
