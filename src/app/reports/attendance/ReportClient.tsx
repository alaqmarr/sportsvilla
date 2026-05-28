"use client";

import { useState } from "react";
import { useAlert } from "@/components/AlertProvider";
import { fetchAttendanceReport } from "./actions";
import { format } from "date-fns";
import { FiSearch, FiUser, FiCalendar, FiClock, FiActivity } from "react-icons/fi";

export default function ReportClient() {
  const { showAlert } = useAlert();
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  async function handleSearch(searchMobile: string) {
    if (searchMobile.length !== 10) return;
    
    setLoading(true);
    try {
      const data = await fetchAttendanceReport(searchMobile);
      if (!data) {
        showAlert("No member found with this number.", "error");
        setReportData(null);
      } else {
        setReportData(data);
      }
    } catch (err) {
      showAlert("Error fetching report", "error");
    }
    setLoading(false);
  }

  function getMembershipStats(m: any, allAttendances: any[]) {
    // Filter attendances that fall within this membership's date range and plan
    const mAttendances = allAttendances.filter(a => 
      a.membershipPlanId === m.membershipPlanId &&
      new Date(a.date) >= new Date(m.startDate) &&
      new Date(a.date) <= new Date(m.endDate)
    );

    const attendedCount = mAttendances.length;
    
    const now = new Date();
    const end = new Date(m.endDate);
    const start = new Date(m.startDate);
    
    // Only count elapsed days up to the end date or today
    const effectiveEnd = now > end ? end : now;
    const msElapsed = effectiveEnd.getTime() - start.getTime();
    const daysElapsed = Math.max(0, Math.floor(msElapsed / (1000 * 60 * 60 * 24)));
    
    const missedCount = Math.max(0, daysElapsed - attendedCount);
    
    return { attended: attendedCount, missed: missedCount, totalDays: m.membershipPlan.durationInDays };
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-['Outfit'] text-white">Attendance Report</h1>
        <p className="text-gray-500 mt-1 text-sm">View detailed check-in history and plan statistics for any member.</p>
      </div>

      <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6 mb-8 max-w-xl">
        <div className="flex gap-3 relative">
          <div className="relative flex-1">
            <input 
              type="tel" 
              className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-5 py-3.5 text-white font-['Outfit'] font-semibold text-lg focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 placeholder-gray-600"
              placeholder="Enter 10-digit mobile..." 
              value={mobile}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 10) {
                  setMobile(val);
                  if (val.length === 10) {
                    handleSearch(val);
                  } else {
                    setReportData(null);
                  }
                }
              }}
              autoFocus
              style={{ letterSpacing: '2px' }}
            />
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {reportData && (
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Member Profile & Plans */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#2a2d3e]">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center text-2xl font-bold font-['Outfit']">
                  {reportData.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-['Outfit'] text-white">{reportData.name}</h2>
                  <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                    <FiUser className="text-emerald-400" /> {reportData.mobile}
                  </p>
                </div>
              </div>

              <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-4 flex items-center gap-2">
                <FiActivity className="text-orange-400" /> Membership History
              </h3>

              <div className="flex flex-col gap-4">
                {reportData.memberships.length === 0 ? (
                  <div className="text-sm text-gray-500">No memberships found.</div>
                ) : (
                  reportData.memberships.map((m: any) => {
                    const isActive = m.status === 'ACTIVE' && new Date(m.endDate) >= new Date();
                    const stats = getMembershipStats(m, reportData.attendances);
                    return (
                      <div key={m.id} className={`p-4 rounded-xl border ${isActive ? 'bg-[#1c1f2e] border-emerald-500/30' : 'bg-[#0f1117] border-[#2a2d3e] opacity-70'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">{m.membershipPlan?.sport?.name}</div>
                            <div className="text-white font-semibold">{m.membershipPlan?.name}</div>
                          </div>
                          <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {isActive ? 'Active' : 'Expired'}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                          <FiCalendar /> {format(new Date(m.startDate), 'MMM d, yy')} - {format(new Date(m.endDate), 'MMM d, yy')}
                        </div>

                        <div className="grid grid-cols-3 gap-2 bg-black/20 rounded-lg p-3 border border-[#2a2d3e]">
                          <div className="text-center">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Attended</div>
                            <div className="text-emerald-400 font-bold">{stats.attended}</div>
                          </div>
                          <div className="text-center border-x border-[#2a2d3e]">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Missed</div>
                            <div className="text-red-400 font-bold">{stats.missed}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Total Days</div>
                            <div className="text-white font-bold">{stats.totalDays}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Detailed Attendance Timeline */}
          <div className="lg:col-span-7">
            <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl overflow-hidden flex flex-col h-[calc(100vh-160px)]">
              <div className="px-6 py-4 border-b border-[#2a2d3e] flex justify-between items-center shrink-0">
                <h3 className="font-semibold font-['Outfit'] text-white flex items-center gap-2">
                  <FiClock className="text-orange-400" /> Check-in Log
                </h3>
                <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                  {reportData.attendances.length} TOTAL VISITS
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {reportData.attendances.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <FiClock size={28} className="text-gray-700" />
                    <p className="text-gray-600 text-sm">No attendance records found.</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-[#2a2d3e] ml-3 pl-6 flex flex-col gap-6">
                    {reportData.attendances.map((record: any) => (
                      <div key={record.id} className="relative">
                        <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-[#161923]"></div>
                        <div className="bg-[#1c1f2e] border border-[#2a2d3e] rounded-xl p-4 flex justify-between items-center">
                          <div>
                            <div className="text-white font-semibold flex items-center gap-2 mb-1">
                              {format(new Date(record.date), 'EEEE, MMMM d, yyyy')}
                            </div>
                            <div className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full mt-1">
                              {record.sport?.name || record.membershipPlan?.sport?.name || 'Sport'}
                            </div>
                            {record.notes && (
                              <div className="text-sm text-gray-400 mt-2 italic">Note: {record.notes}</div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xl font-bold font-['Outfit'] text-white leading-none">
                              {format(new Date(record.date), 'h:mm a')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
