"use client";

import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, startOfDay } from "date-fns";

import { useEffect, useState } from "react";
import QRCodeLib from "qrcode";
import { FiCheckCircle, FiClock, FiCalendar, FiActivity } from "react-icons/fi";

export default function PortalClient({ member, activePlans, expiredPlans, attendances }: any) {
  const [qrCodeData, setQrCodeData] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    QRCodeLib.toDataURL(member.mobile, { width: 300, margin: 0 }).then(setQrCodeData);
  }, [member.mobile]);

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

  const today = startOfDay(new Date());

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center py-10 px-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-orange-500/10 blur-[80px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[40%] bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none z-0"></div>

      <div className="w-full max-w-md relative z-10">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black font-['Outfit'] text-orange-500 tracking-wider uppercase drop-shadow-sm">
            SPORTSVILLA
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Member Portal</p>
        </div>

        {/* The ID Card */}
        <div className="flex justify-center w-full mb-10">
          <div className="id-card-wrapper" style={{ margin: '0 auto' }}>
              <div className="id-card-texture"></div>
              <div className="id-card-inner">
                <div className="id-card-header">
                  <div className="id-card-brand-group">
                    <div className="id-card-logo-icon">
                      <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    </div>
                    <div className="id-card-brand">SPORTSVILLA</div>
                  </div>
                  <div className="id-card-badge">Pro Member</div>
                </div>
                <div className="id-card-body">
                  <div style={{ flex: 1, paddingRight: '16px' }}>
                    <div className="id-card-name">{member.name}</div>
                    <div className="id-card-details-grid">
                      <div className="id-card-detail-group">
                        <div className="id-card-label">Mobile</div>
                        <div className="id-card-value">{member.mobile}</div>
                      </div>
                      <div className="id-card-detail-group">
                        <div className="id-card-label">Member Since</div>
                        <div className="id-card-value">{format(new Date(member.joinDate), 'MMM d, yyyy')}</div>
                      </div>
                    </div>
                  </div>
                <div>
                  {qrCodeData && (
                    <div className="id-card-qr-container">
                      <img src={qrCodeData} alt="QR Code" className="id-card-qr" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Plans */}
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <FiActivity className="text-orange-500" /> My Active Plans
        </h3>
        <div className="flex flex-col gap-3 mb-10">
          {activePlans.length === 0 ? (
            <div className="bg-white border border-gray-200 p-6 rounded-xl text-center text-gray-400 text-sm">
              You currently have no active memberships.
            </div>
          ) : (
            activePlans.map((m: any) => (
              <div key={m.id} className="bg-white border border-gray-200 p-4 rounded-xl flex justify-between items-center shadow-sm">
                <div>
                  <div className="font-semibold text-emerald-600 text-sm">{m.membershipPlan.sport.name}</div>
                  <div className="text-sm text-gray-700 font-medium">{m.membershipPlan.name}</div>
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <FiCalendar /> Expires: {format(new Date(m.endDate), 'PP')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">
                    {m.membershipPlan.slotsPerDay} slots/day
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent Attendance */}
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <FiClock className="text-orange-500" /> Recent Visits
        </h3>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-10">
          {attendances.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No recent visits recorded.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {attendances.map((att: any) => (
                <div key={att.id} className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm text-gray-800">{att.sport?.name || 'General Visit'}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{att.membershipPlan?.name || 'N/A'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-700">{format(new Date(att.date), 'MMM d, yyyy')}</div>
                    <div className="text-xs text-emerald-500 font-medium flex items-center gap-1 justify-end mt-0.5">
                      <FiCheckCircle /> {format(new Date(att.date), 'h:mm a')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calendar View */}
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-4 mt-8">
          <FiCalendar className="text-orange-500" /> Attendance Calendar
        </h3>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-10">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <button onClick={prevMonth} className="text-gray-500 hover:text-orange-500 transition-colors bg-transparent border-none font-bold text-lg cursor-pointer">&larr;</button>
            <span className="font-bold font-['Outfit'] text-gray-800 tracking-wide text-sm">{format(currentMonth, 'MMMM yyyy')}</span>
            <button onClick={nextMonth} className="text-gray-500 hover:text-orange-500 transition-colors bg-transparent border-none font-bold text-lg cursor-pointer">&rarr;</button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {days.map((d, idx) => {
                const isCurrentMonth = isSameMonth(d, monthStart);
                const dayAttendances = attendances.filter((a: any) => isSameDay(new Date(a.date), d));
                const attendedDay = dayAttendances.length > 0;
                const isFuture = d > today;

                return (
                  <div 
                    key={idx} 
                    className={`min-h-[50px] sm:min-h-[60px] rounded-lg p-1 sm:p-1.5 flex flex-col transition-all duration-200 border ${
                      !isCurrentMonth 
                        ? 'opacity-30 bg-gray-50 border-transparent' 
                        : attendedDay
                          ? 'bg-emerald-50 border-emerald-200 shadow-[inset_0_0_10px_rgba(52,211,153,0.1)]'
                          : isFuture
                            ? 'bg-white border-gray-100'
                            : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`text-right text-[10px] sm:text-xs font-bold ${isCurrentMonth ? (attendedDay ? 'text-emerald-600' : 'text-gray-500') : 'text-gray-400'}`}>
                      {format(d, 'd')}
                    </div>
                    <div className="flex-1 flex flex-col gap-0.5 mt-1 overflow-hidden">
                      {attendedDay && dayAttendances.map((a: any) => (
                        <div key={a.id} className="text-[8px] sm:text-[9px] text-emerald-700 bg-emerald-100/50 rounded px-1 py-0.5 font-bold flex items-center justify-center truncate" title={format(new Date(a.date), 'h:mm a')}>
                          <FiCheckCircle size={8} className="mr-0.5 shrink-0" /> {format(new Date(a.date), 'h:mm a')}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-300 mt-6">
          © {new Date().getFullYear()} Sportsvilla. All rights reserved.
        </p>
      </div>
    </div>
  );
}
