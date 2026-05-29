import { formatIST } from "../../lib/dateUtils";
"use client";

import { useState } from "react";
import { fetchMemberByMobile, markAttendance } from "./actions";
import { useAlert } from "@/components/AlertProvider";

import { FiCheckCircle, FiSearch, FiUser, FiCamera, FiX, FiClock, FiActivity } from "react-icons/fi";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function AttendanceClient({ initialRecords }: { initialRecords: any[] }) {
  const { showAlert } = useAlert();
  const [mobile, setMobile] = useState("");
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [records, setRecords] = useState(initialRecords);

  async function handleSearch(searchMobile: string) {
    if (searchMobile.length !== 10) return;
    setLoading(true);
    try {
      const data = await fetchMemberByMobile(searchMobile);
      if (!data) {
        showAlert("Member Not Found", "We couldn't find a member matching this mobile number.", "error");
        setMember(null);
      } else {
        setMember(data);
      }
    } catch (err) { showAlert("Error", "An error occurred while searching for the member.", "error"); }
    setLoading(false);
  }

  async function handleMarkAttendance(planId: string, sportId: string) {
    if (!member) return;
    setProcessingId(planId);
    try {
      const newRecord = await markAttendance({
        memberId: member.id,
        membershipPlanId: planId,
        sportId: sportId
      });
      showAlert("Check-in Successful", "Member has been successfully checked in.", "success");
      
      // Update local timeline
      setRecords([newRecord, ...records]);
      
      // Reset for next person
      setMember(null);
      setMobile("");
    } catch (err: any) {
      showAlert("Check-in Failed", err.message || "There was an issue marking the attendance.", "error");
    }
    setProcessingId("");
  }

  function startScanner() {
    setShowScanner(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: {width: 250, height: 250} },
        false
      );
      scanner.render(
        (decodedText) => {
          setMobile(decodedText);
          scanner.clear();
          setShowScanner(false);
          // Auto search
          handleSearch(decodedText);
        },
        (err) => {}
      );
    }, 100);
  }

  function closeScanner() {
    setShowScanner(false);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-['Outfit'] text-white">Attendance Kiosk</h1>
        <p className="text-gray-500 mt-1 text-sm">Scan ID cards or enter mobile numbers to check members in.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Hero Scanner & Member Profile */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            
            <h3 className="text-lg font-semibold font-['Outfit'] text-white mb-5 relative z-10">Member Check-In</h3>
            
            <div className="flex gap-3 mb-5 relative z-10">
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
                        setMember(null);
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
            
            <div className="flex items-center gap-4 mb-5 relative z-10">
              <div className="flex-1 h-px bg-[#2a2d3e]"></div>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-widest">OR</span>
              <div className="flex-1 h-px bg-[#2a2d3e]"></div>
            </div>

            <button onClick={startScanner} className="w-full py-4 bg-transparent border-2 border-dashed border-[#2a2d3e] hover:border-orange-500/40 hover:text-orange-400 text-gray-500 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer relative z-10 uppercase tracking-wider">
              <FiCamera size={18} /> Launch QR Scanner
            </button>
          </div>

          {member && (
            <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6 border-t-[3px] border-t-emerald-500">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl font-bold font-['Outfit']">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-['Outfit'] text-white">{member.name}</h2>
                  <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                    <FiUser className="text-emerald-400" /> {member.mobile} <span className="opacity-50">•</span> Joined {formatIST(new Date(member.joinDate), 'yyyy')}
                  </p>
                </div>
              </div>

              <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 flex items-center gap-2 mb-4 mt-6">
                <FiActivity className="text-orange-400" /> Active Subscriptions
              </h4>
              
              {member.memberships.length === 0 ? (
                <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/20 font-semibold flex items-center gap-3 text-sm">
                  <FiX size={20} /> This member has no active plans.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {member.memberships.map((m: any) => {
                    const isActive = m.status === 'ACTIVE' && new Date(m.endDate) >= new Date();
                    return (
                      <div key={m.id} className={isActive ? 'p-5 rounded-xl bg-[#1c1f2e] border border-emerald-500/20 hover:border-emerald-500/40 transition-colors' : 'p-5 rounded-xl bg-[#1c1f2e] border border-[#2a2d3e] opacity-50'}>
                        <div className="text-emerald-400 text-xs uppercase tracking-wider font-semibold mb-1">{m.membershipPlan?.sport?.name}</div>
                        <div className="text-white font-semibold mb-3">{m.membershipPlan?.name}</div>
                        
                        {m.stats && (
                          <div className="grid grid-cols-3 gap-2 mb-4 bg-black/20 rounded-lg p-2.5 border border-[#2a2d3e]">
                            <div className="text-center">
                              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Left</div>
                              <div className="text-white font-bold">{m.stats.daysLeft}d</div>
                            </div>
                            <div className="text-center border-x border-[#2a2d3e]">
                              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Attended</div>
                              <div className="text-emerald-400 font-bold">{m.stats.attended}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Missed</div>
                              <div className="text-red-400 font-bold">{m.stats.missed}</div>
                            </div>
                          </div>
                        )}

                        {isActive ? (
                          <button 
                            onClick={() => handleMarkAttendance(m.membershipPlanId, m.membershipPlan.sportId)}
                            disabled={processingId === m.membershipPlanId}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer border-none"
                          >
                            <FiCheckCircle size={16} /> 
                            {processingId === m.membershipPlanId ? "CHECKING IN..." : "CHECK IN"}
                          </button>
                        ) : (
                          <div className="text-xs text-red-400 font-semibold tracking-wider text-center py-2.5 bg-red-500/10 rounded-lg border border-red-500/20">EXPIRED</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Check-in Feed */}
        <div className="lg:col-span-5">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl overflow-hidden flex flex-col h-[calc(100vh-160px)]">
            <div className="px-6 py-4 border-b border-[#2a2d3e] flex justify-between items-center shrink-0">
              <h3 className="font-semibold font-['Outfit'] text-white flex items-center gap-2">
                <FiClock className="text-orange-400" /> Today's Scans
              </h3>
              <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold">{records.length} SCANS</div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {records.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[#1c1f2e] flex items-center justify-center">
                    <FiClock size={28} className="text-gray-700" />
                  </div>
                  <p className="text-gray-600 text-sm">No check-ins yet today.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {records.map((record: any) => (
                    <div key={record.id} className="bg-[#1c1f2e] rounded-xl border border-[#2a2d3e] p-4 flex items-center gap-4 hover:bg-[#232738] transition-colors">
                      {/* Avatar */}
                      <div className="w-10 h-10 shrink-0 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center text-sm font-semibold font-['Outfit']">
                        {record.member?.name?.charAt(0) || '?'}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{record.member?.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{record.member?.mobile}</div>
                        <div className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-1.5">
                          <FiActivity size={9} /> {record.sport?.name || record.membershipPlan?.sport?.name || 'Sport'}
                        </div>
                      </div>

                      {/* Time */}
                      <div className="text-right shrink-0 pl-2">
                        <div className="text-xl font-bold font-['Outfit'] text-white leading-none">{formatIST(new Date(record.date), 'h:mm')}</div>
                        <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase mt-0.5">{formatIST(new Date(record.date), 'a')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showScanner && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold font-['Outfit'] text-white">Scan QR Code</h2>
              <button className="text-gray-400 hover:text-white bg-[#1c1f2e] hover:bg-[#2a2d3e] rounded-lg p-2 transition-colors cursor-pointer border-none" onClick={closeScanner}><FiX /></button>
            </div>
            <div id="reader" className="w-full bg-black rounded-xl overflow-hidden border border-[#2a2d3e]"></div>
            <p className="text-center text-gray-500 mt-6 text-sm">Point camera at the member's Digital ID card</p>
          </div>
        </div>
      )}

    </div>
  );
}
