"use client";
import { formatIST } from "../../../../lib/dateUtils";
import { useState, useEffect } from "react";
import { fetchMembershipDetail } from "./actions";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, startOfDay, isBefore, isAfter } from "date-fns";
import { FiArrowLeft, FiUser, FiCalendar, FiClock, FiActivity, FiLayers } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/AlertProvider";

export default function MembershipDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { showAlert } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    async function loadData() {
      try {
        const membership = await fetchMembershipDetail(id);
        setData(membership);
        setCurrentMonth(new Date(membership.startDate)); // Start calendar at membership start date
      } catch (err) {
        showAlert("Data Error", "Failed to load the membership details from the server.", "error");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  const mStart = startOfDay(new Date(data.startDate));
  const mEnd = startOfDay(new Date(data.endDate));
  const today = startOfDay(new Date());
  
  const effectiveEnd = new Date(Math.min(mEnd.getTime(), today.getTime()));
  const msElapsed = effectiveEnd.getTime() - mStart.getTime();
  const expectedDays = Math.max(0, Math.floor(msElapsed / (1000 * 60 * 60 * 24)) + 1);
  const attended = data.member.attendances.length;
  const missed = Math.max(0, expectedDays - attended);

  const isActive = data.status === 'ACTIVE' && mEnd >= today;

  // Calendar logic
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDateCalendar = startOfWeek(monthStart);
  const endDateCalendar = endOfWeek(monthEnd);
  
  let days = [];
  let day = startDateCalendar;
  
  while (day <= endDateCalendar) {
    for (let i = 0; i < 7; i++) {
      days.push(day);
      day = new Date(day.getTime() + 24 * 60 * 60 * 1000); // add 1 day
    }
  }

  return (
    <div>
      <button 
        onClick={() => router.back()}
        className="text-gray-400 hover:text-white flex items-center gap-2 font-semibold mb-6 transition-colors bg-transparent border-none cursor-pointer"
      >
        <FiArrowLeft /> Back to Membership Reports
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-3xl font-bold font-['Outfit'] shadow-[0_0_20px_rgba(249,115,22,0.1)]">
            {data.member.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold font-['Outfit'] text-white tracking-tight">{data.member.name}</h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1c1f2e] border border-[#2a2d3e] text-xs font-semibold uppercase tracking-wider text-gray-300">
                {data.member.mobile}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
           <span className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider border shadow-lg flex items-center gap-2 ${
            isActive 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10' 
              : 'bg-red-500/10 text-red-400 border-red-500/30 shadow-red-500/10'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-red-400'}`}></div>
            {isActive ? 'Active Plan' : 'Expired Plan'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <FiLayers />
            </div>
            <h3 className="text-gray-400 font-semibold text-sm uppercase tracking-wider">Plan Name</h3>
          </div>
          <div className="text-xl font-bold text-white font-['Outfit']">{data.membershipPlan.name}</div>
          <div className="text-xs text-blue-400 mt-1 font-semibold uppercase tracking-wider">{data.membershipPlan.sport.name}</div>
        </div>
        
        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
              <FiCalendar />
            </div>
            <h3 className="text-gray-400 font-semibold text-sm uppercase tracking-wider">Duration</h3>
          </div>
          <div className="text-xl font-bold text-white font-['Outfit']">{data.membershipPlan.durationInDays} Days</div>
          <div className="text-xs text-gray-500 mt-1 font-medium">{formatIST(new Date(data.startDate), 'MMM d')} - {formatIST(new Date(data.endDate), 'MMM d, yyyy')}</div>
        </div>

        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl"></div>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <FiCheck />
            </div>
            <h3 className="text-gray-400 font-semibold text-sm uppercase tracking-wider">Days Attended</h3>
          </div>
          <div className="text-3xl font-bold text-white font-['Outfit'] relative z-10">{attended}</div>
        </div>

        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-500/10 rounded-full blur-xl"></div>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              <FiX />
            </div>
            <h3 className="text-gray-400 font-semibold text-sm uppercase tracking-wider">Days Missed</h3>
          </div>
          <div className="text-3xl font-bold text-white font-['Outfit'] relative z-10">{missed}</div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl overflow-hidden shadow-lg mb-8">
        <div className="px-6 py-5 border-b border-[#2a2d3e] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0f1117]/50">
          <div>
            <h3 className="font-bold text-lg font-['Outfit'] text-white flex items-center gap-2">
              <FiCalendar className="text-orange-400" /> Attendance Calendar
            </h3>
            <p className="text-gray-500 text-sm mt-1">Detailed view of check-ins during this membership period.</p>
          </div>
          <div className="flex items-center gap-4 bg-[#1c1f2e] px-4 py-2 rounded-lg border border-[#2a2d3e]">
            <button onClick={prevMonth} className="text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none">&larr;</button>
            <span className="text-white font-bold font-['Outfit'] w-32 text-center tracking-wider">{formatIST(currentMonth, 'MMMM yyyy')}</span>
            <button onClick={nextMonth} className="text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none">&rarr;</button>
          </div>
        </div>
        
        <div className="p-6 overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-7 gap-3 mb-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-3">
              {days.map((d, idx) => {
                const isCurrentMonth = isSameMonth(d, monthStart);
                
                // Check if member has attendance on this day
                const dayAttendances = data.member.attendances.filter((a: any) => isSameDay(new Date(a.date), d));
                const attendedDay = dayAttendances.length > 0;
                
                // Check if day is expected (within active membership bounds and <= today)
                let expected = false;
                if (d >= mStart && d <= mEnd && d <= today) {
                  expected = true;
                }
                
                const missedDay = expected && !attendedDay;
                const isFuture = d > today;

                return (
                  <div 
                    key={idx} 
                    className={`min-h-[90px] rounded-xl p-2.5 flex flex-col border transition-all duration-200 ${
                      !isCurrentMonth 
                        ? 'opacity-20 bg-[#0f1117] border-transparent' 
                        : attendedDay
                          ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[inset_0_0_20px_rgba(52,211,153,0.05)]'
                          : missedDay
                            ? 'bg-red-500/10 border-red-500/30'
                            : isFuture
                              ? 'bg-[#161923] border-[#2a2d3e] opacity-50'
                              : 'bg-[#1c1f2e] border-[#2a2d3e]'
                    }`}
                  >
                    <div className={`text-right text-xs font-bold ${isCurrentMonth ? (attendedDay ? 'text-emerald-400' : missedDay ? 'text-red-400' : 'text-gray-500') : 'text-gray-600'}`}>
                      {formatIST(d, 'd')}
                    </div>
                    <div className="flex-1 mt-1.5 flex flex-col gap-1 overflow-hidden">
                      {attendedDay ? (
                        dayAttendances.map((a: any) => (
                          <div key={a.id} className="text-[10px] leading-tight flex flex-col gap-0.5 mb-1.5 bg-emerald-500/20 px-2 py-1.5 rounded border border-emerald-500/30">
                            <span className="font-bold text-white flex items-center gap-1">
                              <FiClock size={10} className="text-emerald-400"/> {formatIST(new Date(a.date), 'h:mm a')}
                            </span>
                          </div>
                        ))
                      ) : missedDay ? (
                        <div className="text-[10px] text-red-500/80 font-bold uppercase tracking-wider mt-auto text-center pb-1">Absent</div>
                      ) : expected && !isFuture ? (
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-auto text-center pb-1">Expected</div>
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
  );
}

const FiCheck = (props: any) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}><polyline points="20 6 9 17 4 12"></polyline></svg>;
const FiX = (props: any) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
