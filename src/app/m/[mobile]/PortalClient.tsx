"use client";

import { format } from "date-fns";

import { useEffect, useState } from "react";
import QRCodeLib from "qrcode";
import { FiCheckCircle, FiClock, FiCalendar, FiActivity } from "react-icons/fi";

export default function PortalClient({ member, activePlans, expiredPlans, attendances }: any) {
  const [qrCodeData, setQrCodeData] = useState("");

  useEffect(() => {
    QRCodeLib.toDataURL(member.mobile, { width: 300, margin: 0 }).then(setQrCodeData);
  }, [member.mobile]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black font-['Outfit'] text-orange-500 tracking-wider uppercase">
            SPORTSVILLA
          </h1>
          <p className="text-gray-400 text-sm mt-1">Member Portal</p>
        </div>

        {/* The ID Card */}
        <div className="flex justify-center mb-10">
          <div className="id-card-wrapper" style={{ margin: '0 auto', transform: 'scale(0.9)', transformOrigin: 'top center' }}>
            <div className="id-card-inner">
              <div className="id-card-header">
                <div className="id-card-brand text-white">SPORTSVILLA</div>
                <div className="id-card-badge">Premium</div>
              </div>
              <div className="id-card-body">
                <div style={{ flex: 1 }}>
                  <div className="id-card-name">{member.name}</div>
                  <div className="id-card-label">Mobile Number</div>
                  <div className="id-card-value">{member.mobile}</div>
                  <div className="id-card-label">Member Since</div>
                  <div className="id-card-value">{format(new Date(member.joinDate), 'MMM d, yyyy')}</div>
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

        {/* Footer */}
        <p className="text-center text-xs text-gray-300 mt-6">
          © {new Date().getFullYear()} Sportsvilla. All rights reserved.
        </p>
      </div>
    </div>
  );
}
