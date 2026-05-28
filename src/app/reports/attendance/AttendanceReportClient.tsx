"use client";

import { useState, useEffect } from "react";
import { fetchAdvancedAttendance } from "./actions";
import { format } from "date-fns";
import { FiDownload, FiSearch, FiCalendar, FiClock, FiUser, FiActivity } from "react-icons/fi";
import { useAlert } from "@/components/AlertProvider";

export default function AttendanceReportClient({ plans }: { plans: any[] }) {
  const { showAlert } = useAlert();
  
  // Default to today
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [startTime, setStartTime] = useState("00:00");
  const [endDate, setEndDate] = useState(today);
  const [endTime, setEndTime] = useState("23:59");
  const [selectedPlanId, setSelectedPlanId] = useState("all");
  
  const [loading, setLoading] = useState(false);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await fetchAdvancedAttendance(startDate, endDate, startTime, endTime, selectedPlanId);
      setAttendances(data);
      setHasSearched(true);
    } catch (error) {
      showAlert("Failed to fetch attendance data", "error");
    }
    setLoading(false);
  };

  const handleExportCSV = () => {
    if (attendances.length === 0) {
      showAlert("No data to export", "info");
      return;
    }

    const headers = ["Date", "Time", "Member Name", "Mobile", "Membership Plan", "Sport", "Notes"];
    
    const rows = attendances.map(record => {
      const date = format(new Date(record.date), 'yyyy-MM-dd');
      const time = format(new Date(record.date), 'HH:mm:ss');
      const name = record.member?.name || "";
      const mobile = record.member?.mobile || "";
      const plan = record.membershipPlan?.name || "";
      const sport = record.sport?.name || record.membershipPlan?.sport?.name || "";
      const notes = record.notes || "";
      
      // Escape commas by wrapping in quotes
      return [date, time, `"${name}"`, mobile, `"${plan}"`, `"${sport}"`, `"${notes}"`].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Master_Attendance_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Initially fetch data on mount for "today"
  useEffect(() => {
    handleSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-white">Attendance Reports</h1>
          <p className="text-gray-500 mt-1 text-sm">Advanced filtering and master data export for member check-ins.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          disabled={attendances.length === 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
            attendances.length > 0 
              ? "bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer border-none" 
              : "bg-[#1c1f2e] text-gray-500 cursor-not-allowed border border-[#2a2d3e]"
          }`}
        >
          <FiDownload /> Export Master CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6 mb-8 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-[1.5] w-full">
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">From Date & Time</label>
            <div className="flex gap-2">
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 [color-scheme:dark]"
              />
              <input 
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-[120px] bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-3 text-white focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="flex-[1.5] w-full">
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">To Date & Time</label>
            <div className="flex gap-2">
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 [color-scheme:dark]"
              />
              <input 
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-[120px] bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-3 text-white focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 [color-scheme:dark]"
              />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-end mt-2">
          <div className="flex-[2] w-full">
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Filter by Membership Plan</label>
            <select 
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
            >
              <option value="all">All Plans</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sport?.name})</option>
              ))}
            </select>
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
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-[#2a2d3e] flex justify-between items-center bg-[#0f1117]">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <FiClock className="text-orange-400" /> Attendance Results
            </h3>
            <div className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-semibold">
              {attendances.length} RECORDS FOUND
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-[#0f1117]/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-[#2a2d3e]">Date & Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-[#2a2d3e]">Member</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-[#2a2d3e]">Plan / Sport</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-[#2a2d3e]">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2d3e]">
                {attendances.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No attendance records found for this criteria.
                    </td>
                  </tr>
                ) : (
                  attendances.map(record => (
                    <tr key={record.id} className="hover:bg-[#1c1f2e] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-white font-semibold">{format(new Date(record.date), 'MMM d, yyyy')}</div>
                        <div className="text-gray-500 text-xs mt-0.5">{format(new Date(record.date), 'h:mm a')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm font-['Outfit']">
                            {record.member?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="text-white font-medium">{record.member?.name || 'Unknown'}</div>
                            <div className="text-gray-500 text-xs mt-0.5">{record.member?.mobile || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-emerald-400 font-medium text-sm">{record.membershipPlan?.name || 'No Plan'}</div>
                        <div className="text-gray-500 text-xs mt-0.5 inline-flex items-center px-1.5 py-0.5 bg-[#0f1117] border border-[#2a2d3e] rounded">
                          {record.sport?.name || record.membershipPlan?.sport?.name || 'Unknown Sport'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {record.notes || <span className="text-gray-600 italic">None</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
