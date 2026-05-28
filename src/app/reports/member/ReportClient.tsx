"use client";

import { useState } from "react";
import { useAlert } from "@/components/AlertProvider";
import { fetchAttendanceReport } from "./actions";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, isAfter, startOfDay } from "date-fns";
import { FiSearch, FiUser, FiCalendar, FiClock, FiActivity } from "react-icons/fi";

export default function ReportClient() {
  const { showAlert } = useAlert();
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDateCalendar = startOfWeek(monthStart);
  const endDateCalendar = endOfWeek(monthEnd);
  const dateFormat = "d";
  const rows = [];
  
  let days = [];
  let day = startDateCalendar;
  let formattedDate = "";
  
  while (day <= endDateCalendar) {
    for (let i = 0; i < 7; i++) {
      days.push(day);
      day = new Date(day.getTime() + 24 * 60 * 60 * 1000); // add 1 day
    }
  }

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
        <h1 className="text-2xl font-bold font-['Outfit'] text-white">Member Report</h1>
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

          {/* Calendar View */}
          <div className="lg:col-span-7">
            <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl overflow-hidden flex flex-col h-[calc(100vh-160px)]">
              <div className="px-6 py-4 border-b border-[#2a2d3e] flex justify-between items-center shrink-0">
                <h3 className="font-semibold font-['Outfit'] text-white flex items-center gap-2">
                  <FiCalendar className="text-orange-400" /> Attendance Calendar
                </h3>
                <div className="flex items-center gap-4">
                  <button onClick={prevMonth} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                  <span className="text-white font-bold font-['Outfit']">{format(currentMonth, 'MMMM yyyy')}</span>
                  <button onClick={nextMonth} className="text-gray-400 hover:text-white transition-colors">&rarr;</button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {days.map((d, idx) => {
                    const isCurrentMonth = isSameMonth(d, monthStart);
                    
                    // Check if member has attendance on this day
                    const dayAttendances = reportData?.attendances?.filter((a: any) => isSameDay(new Date(a.date), d)) || [];
                    const attended = dayAttendances.length > 0;
                    
                    // Check if day is expected (within active membership bounds and <= today)
                    let expected = false;
                    const today = startOfDay(new Date());
                    
                    if (reportData?.memberships) {
                      for (const m of reportData.memberships) {
                        const mStart = startOfDay(new Date(m.startDate));
                        const mEnd = startOfDay(new Date(m.endDate));
                        if (d >= mStart && d <= mEnd && d <= today) {
                          expected = true;
                          break;
                        }
                      }
                    }
                    
                    const missed = expected && !attended;

                    return (
                      <div 
                        key={idx} 
                        className={`min-h-[80px] rounded-lg p-2 flex flex-col border ${
                          !isCurrentMonth 
                            ? 'opacity-30 bg-[#0f1117] border-transparent' 
                            : attended
                              ? 'bg-emerald-500/10 border-emerald-500/30'
                              : missed
                                ? 'bg-red-500/10 border-red-500/20'
                                : 'bg-[#1c1f2e] border-[#2a2d3e]'
                        }`}
                      >
                        <div className={`text-right text-xs font-bold ${isCurrentMonth ? (attended ? 'text-emerald-400' : missed ? 'text-red-400' : 'text-gray-500') : 'text-gray-600'}`}>
                          {format(d, 'd')}
                        </div>
                        <div className="flex-1 mt-1 flex flex-col gap-1 overflow-hidden">
                          {attended ? (
                            dayAttendances.map((a: any) => (
                              <div key={a.id} className="text-[9px] leading-tight flex flex-col gap-0.5 mb-1">
                                <span className="font-bold text-white">{format(new Date(a.date), 'h:mm a')}</span>
                                <span className="text-emerald-400 font-semibold truncate uppercase tracking-wide">
                                  {a.sport?.name || a.membershipPlan?.sport?.name || 'SPORT'}
                                </span>
                              </div>
                            ))
                          ) : missed ? (
                            <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-auto text-center">Absent</div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
