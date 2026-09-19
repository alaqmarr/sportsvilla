"use client";
import { formatIST } from "@/core/utils/dateUtils";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, startOfDay } from "date-fns";
import { useEffect, useState } from "react";
import QRCodeLib from "qrcode";
import { FiCheckCircle, FiClock, FiCalendar, FiActivity, FiAward, FiTag } from "react-icons/fi";

export default function PortalClient({ 
  member, 
  activePlans = [], 
  expiredPlans = [], 
  attendances = [], 
  upcomingBookings = [], 
  tournaments = [], 
  coupons = [] 
}: any) {
  const [qrCodeData, setQrCodeData] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (member?.mobile) {
      QRCodeLib.toDataURL(member.mobile, { width: 300, margin: 0 }).then(setQrCodeData).catch(console.error);
    }
  }, [member?.mobile]);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDateCalendar = startOfWeek(monthStart);
  const endDateCalendar = endOfWeek(monthEnd);
  
  const allowedDaysSet = activePlans.length > 0 ? (() => {
    const days = new Set<number>();
    let hasUnrestricted = false;
    for (const plan of activePlans) {
      if (!plan.allowedDays) {
        hasUnrestricted = true;
        break;
      }
      plan.allowedDays.split(',').map(Number).forEach((d: number) => days.add(d));
    }
    return hasUnrestricted ? null : Array.from(days);
  })() : null;
  
  const days = [];
  let day = startDateCalendar;
  
  while (day <= endDateCalendar) {
    for (let i = 0; i < 7; i++) {
      days.push(day);
      day = new Date(day.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  const today = startOfDay(new Date());
  const walletInRupees = ((member?.walletBalance || 0) / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center py-10 px-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-orange-500/10 blur-[80px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[40%] bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none z-0"></div>

      <div className="w-full max-w-md relative z-10">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black font-sans text-orange-500 tracking-wider uppercase drop-shadow-sm">
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
                    <div className="id-card-name">{member?.name}</div>
                    <div className="id-card-details-grid">
                      <div className="id-card-detail-group">
                        <div className="id-card-label">Mobile</div>
                        <div className="id-card-value">{member?.mobile}</div>
                      </div>
                      <div className="id-card-detail-group">
                        <div className="id-card-label">Member Since</div>
                        <div className="id-card-value">{member?.joinDate ? formatIST(new Date(member.joinDate), 'MMM d, yyyy') : 'N/A'}</div>
                      </div>
                      <div className="id-card-detail-group">
                        <div className="id-card-label">Loyalty</div>
                        <div className="id-card-value text-orange-400 font-bold">{member?.loyaltyPoints || 0} Pts</div>
                      </div>
                      <div className="id-card-detail-group">
                        <div className="id-card-label">Wallet</div>
                        <div className="id-card-value text-emerald-400 font-bold">₹{walletInRupees}</div>
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
                  <div className="font-semibold text-emerald-600 text-sm">{m.membershipPlan?.sport?.name}</div>
                  <div className="text-sm text-gray-700 font-medium">{m.membershipPlan?.name}</div>
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <FiCalendar /> Expires: {formatIST(new Date(m.endDate), 'PP')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">
                    {m.membershipPlan?.slotsPerDay} slots/day
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <>
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <FiClock className="text-orange-500" /> Upcoming Bookings
            </h3>
            <div className="flex flex-col gap-3 mb-10">
              {upcomingBookings.map((b: any) => (
                <div key={b.id} className="bg-white border border-gray-200 p-4 rounded-xl flex justify-between items-center shadow-sm">
                  <div>
                    <div className="font-semibold text-emerald-600 text-sm">{b.sport?.name || "Sport"} at {b.turf?.name || "Turf"}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium">
                      <FiCalendar /> {formatIST(new Date(b.startTime), 'MMM d, yyyy • h:mm a')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded-full uppercase">
                      {b.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* My Tournaments */}
        {tournaments.length > 0 && (
          <>
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <FiAward className="text-orange-500" /> My Tournaments
            </h3>
            <div className="flex flex-col gap-3 mb-10">
              {tournaments.map((reg: any) => (
                <div key={reg.id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-200 to-amber-500 opacity-20 rounded-bl-full z-0"></div>
                  <div className="relative z-10">
                    <div className="font-semibold text-gray-800 text-sm">{reg.tournament?.name}</div>
                    {reg.teamName && (
                      <div className="text-sm text-gray-600 mt-0.5">Team: <span className="font-medium text-amber-600">{reg.teamName}</span></div>
                    )}
                    <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <FiCalendar /> {formatIST(new Date(reg.tournament?.startDate), 'MMM d')} - {formatIST(new Date(reg.tournament?.endDate), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Coupons & Offers */}
        {coupons.length > 0 && (
          <>
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <FiTag className="text-emerald-500" /> My Coupons
            </h3>
            <div className="flex flex-col gap-3 mb-10">
              {coupons.map((c: any) => {
                const coupon = c.coupon || c;
                const discountText = (coupon.discountPercent || coupon.discountPercentage)
                  ? `${coupon.discountPercent || coupon.discountPercentage}% OFF`
                  : coupon.discountAmount 
                    ? `₹${coupon.discountAmount} OFF`
                    : 'Special Offer';
                return (
                  <div key={c.id || coupon.id} className="bg-gradient-to-r from-emerald-50 to-white border border-emerald-100 p-4 rounded-xl shadow-sm flex items-center justify-between border-dashed">
                    <div>
                      <div className="font-bold text-emerald-700 font-mono tracking-widest text-sm">{coupon.code}</div>
                      <div className="text-xs text-gray-600 mt-0.5 font-medium">
                        {discountText}
                        {coupon.maxDiscount ? ` (Up to ₹${coupon.maxDiscount})` : ''}
                        {coupon.minBookingAmount ? ` • Min ₹${coupon.minBookingAmount}` : ''}
                      </div>
                    </div>
                    {coupon.expiryDate && (
                      <div className="text-[10px] text-gray-400 font-medium">
                        Valid till {formatIST(new Date(coupon.expiryDate), 'MMM d')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

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
                    <div className="text-sm font-semibold text-gray-700">{formatIST(new Date(att.date), 'MMM d, yyyy')}</div>
                    <div className="text-xs text-emerald-500 font-medium flex items-center gap-1 justify-end mt-0.5">
                      <FiCheckCircle /> {formatIST(new Date(att.date), 'h:mm a')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calendar View */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-10">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-800 text-sm">
              {formatIST(currentMonth, 'MMMM yyyy')}
            </h4>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-600">&lt;</button>
              <button onClick={nextMonth} className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-600">&gt;</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400 mb-2">
            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {days.map((d, index) => {
              const inCurrentMonth = isSameMonth(d, currentMonth);
              const isToday = isSameDay(d, today);
              const dayNum = d.getDay();
              const isAllowed = allowedDaysSet ? allowedDaysSet.includes(dayNum) : true;
              return (
                <div 
                  key={index} 
                  className={`h-8 flex items-center justify-center rounded-lg transition-colors ${
                    !inCurrentMonth ? 'text-gray-300' :
                    isToday ? 'bg-orange-500 text-white font-bold' :
                    isAllowed ? 'text-gray-700 hover:bg-orange-50' : 'text-gray-300 line-through'
                  }`}
                >
                  {d.getDate()}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

