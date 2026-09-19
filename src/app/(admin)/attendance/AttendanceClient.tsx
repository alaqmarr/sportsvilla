"use client";
import { formatIST } from "@/core/utils/dateUtils";
import { useState, useEffect } from "react";
import { fetchMembers, markAttendance } from "@/modules/attendance/attendance.action";
import { useAlert } from "@/components/AlertProvider";

import { FiCheckCircle, FiUser, FiCamera, FiX, FiClock, FiActivity, FiLink } from "react-icons/fi";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNfc } from "@/components/nfc/NfcProvider";
import { PageHeader, Button, Badge, Avatar } from "@/components/admin/ui";

export default function AttendanceClient({ initialRecords }: { initialRecords: any[] }) {
  const { showAlert } = useAlert();
  const [mobile, setMobile] = useState("");
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [records, setRecords] = useState(initialRecords);

  const [membersList, setMembersList] = useState<any[]>([]);
  const [familySelections, setFamilySelections] = useState<Record<string, string>>({});

  const nfc = useNfc();

  useEffect(() => {
    return nfc.subscribe(async (uid, deviceType) => {
      try {
        const res = await fetch("/api/nfc/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardUid: uid, deviceType, location: "ADMIN_DESK" })
        });
        const data = await res.json();
        if (data.success) {
          playSound('success');
          showAlert("Check-in Successful", data.message, "success");
          
          // Add to local UI feed if it's an attendance action
          if (data.action === "MEMBERSHIP_ATTENDANCE" && data.details?.attendanceId) {
            setRecords(prev => [{
              id: data.details.attendanceId,
              member: { name: data.member.name, mobile: "NFC Tap" },
              membershipPlan: { name: data.details.membershipPlanName },
              sport: { name: data.details.sportName },
              createdAt: new Date().toISOString()
            }, ...prev]);
          }
        } else {
          playSound('error');
          showAlert("Scan Rejected", data.message, "error");
        }
      } catch (e) {
        playSound('error');
        showAlert("Error", "Failed to connect to check-in server.", "error");
      }
    });
  }, [nfc, showAlert]);

  const playSound = (type: 'beep' | 'success' | 'error') => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gainNode = context.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(context.destination);
      
      if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, context.currentTime);
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
        osc.start(context.currentTime);
        osc.stop(context.currentTime + 0.1);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, context.currentTime); // A5
        osc.frequency.setValueAtTime(1108.73, context.currentTime + 0.1); // C#6
        osc.frequency.setValueAtTime(1318.51, context.currentTime + 0.2); // E6
        
        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
        osc.start(context.currentTime);
        osc.stop(context.currentTime + 0.4);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, context.currentTime);
        osc.frequency.linearRampToValueAtTime(150, context.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
        osc.start(context.currentTime);
        osc.stop(context.currentTime + 0.3);
      }
    } catch (e) {
      // Audio context might be blocked if no user interaction yet
    }
  };

  async function handleSearch(searchQuery: string) {
    if (!searchQuery) return;
    
    // Only fetch if it's a 10 digit number OR a cuid (length > 15)
    if (searchQuery.length !== 10 && searchQuery.length < 15) return;
    
    setLoading(true);
    try {
      const data = await fetchMembers(searchQuery);
      if (!data || data.length === 0) {
        playSound('error');
        showAlert("Member Not Found", "We couldn't find a member matching this.", "error");
        setMember(null);
        setMembersList([]);
      } else if (data.length === 1) {
        playSound('beep');
        setMember(data[0]);
        setMembersList([]);
      } else {
        playSound('beep');
        setMembersList(data);
        setMember(null);
        
        // Auto-select first active plan for each member
        const initialSelections: Record<string, string> = {};
        data.forEach((m: any) => {
          const activePlans = m.memberships.filter((mem: any) => mem.status === 'ACTIVE' && new Date(mem.endDate) >= new Date());
          if (activePlans.length > 0) {
            initialSelections[m.id] = activePlans[0].membershipPlanId;
          }
        });
        setFamilySelections(initialSelections);
      }
    } catch (err) { 
      playSound('error');
      showAlert("Error", "An error occurred while searching.", "error"); 
    }
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
      playSound('success');
      showAlert("Check-in Successful", "Member has been successfully checked in.", "success");
      
      // Update local timeline
      setRecords([newRecord, ...records]);
      
      // Reset for next person
      setMember(null);
      setMobile("");
    } catch (err: any) {
      playSound('error');
      showAlert("Check-in Failed", err.message || "There was an issue marking the attendance.", "error");
    }
    setProcessingId("");
  }

  async function handleMarkFamilyAttendance() {
    setLoading(true);
    let successCount = 0;
    let failCount = 0;
    const newRecords: any[] = [];

    for (const m of membersList) {
      const selectedPlanId = familySelections[m.id];
      if (selectedPlanId) {
        const activePlan = m.memberships.find((mem: any) => mem.membershipPlanId === selectedPlanId);
        if (activePlan) {
          try {
            const newRecord = await markAttendance({
              memberId: m.id,
              membershipPlanId: activePlan.membershipPlanId,
              sportId: activePlan.membershipPlan.sportId
            });
            newRecords.push(newRecord);
            successCount++;
          } catch (err) {
            failCount++;
          }
        } else {
          failCount++;
        }
      }
    }

    if (successCount > 0) {
      playSound('success');
      showAlert("Family Checked In", `Successfully checked in ${successCount} members.` + (failCount > 0 ? ` (${failCount} skipped/failed)` : ""), "success");
      setRecords((prev) => [...newRecords.reverse(), ...prev]);
    } else {
      playSound('error');
      showAlert("Check-in Failed", "Could not check in any family members. Check if they have active plans.", "error");
    }
    
    setMembersList([]);
    setFamilySelections({});
    setMobile("");
    setLoading(false);
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
    <div className="space-y-6 pb-20 font-sans">
      <PageHeader
        title="Attendance Kiosk"
        subtitle="Scan ID cards or enter mobile numbers to check members in."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Attendance" },
        ]}
        actions={
          <div className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1 bg-sv-info-subtle text-sv-info-text border border-[#2a2d3e] border-sv-info-border border-[#2a2d3e] rounded-sv-full font-medium">
            <FiLink /> USB/Bluetooth Scanner Supported
          </div>
        }
      />

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Hero Scanner & Member Profile */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-sv-surface border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-xl p-6 relative overflow-hidden shadow-sv-sm">
            <div className="absolute top-0 right-0 w-48 h-48 bg-sv-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            
            <h3 className="text-lg font-semibold text-sv-text mb-5 relative z-10">Member Check-In</h3>
            
            <div className="flex gap-3 mb-5 relative z-10">
              <div className="relative flex-1">
                <input 
                  type="tel" 
                  className="w-full bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-lg px-5 py-3.5 text-sv-text font-semibold text-lg focus:outline-none focus:border-sv-brand focus:ring-2 focus:ring-sv-brand/20 placeholder:text-sv-text-muted"
                  placeholder="Enter 10-digit mobile..." 
                  value={mobile}
                  onChange={e => {
                    const val = e.target.value.replace(/\s/g, '');
                    setMobile(val);
                    if (val.length === 10 || val.length > 15) {
                      handleSearch(val);
                    } else {
                      setMember(null);
                      setMembersList([]);
                    }
                  }}
                  style={{ letterSpacing: '2px' }}
                />
                {loading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-sv-brand/30 border-t-sv-brand rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-5 relative z-10">
              <div className="flex-1 h-px bg-sv-border border-[#2a2d3e]"></div>
              <span className="text-xs font-semibold text-sv-text-muted uppercase tracking-widest">OR</span>
              <div className="flex-1 h-px bg-sv-border border-[#2a2d3e]"></div>
            </div>

            <button 
              onClick={startScanner} 
              className="w-full py-3.5 bg-transparent border-2 border-dashed border-sv-border border-[#2a2d3e] hover:border-sv-brand/40 hover:text-sv-brand text-sv-text-muted rounded-sv-lg text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer relative z-10 uppercase tracking-wider"
            >
              <FiCamera size={18} /> Launch QR Scanner
            </button>
          </div>

          {member && (
            <div className="bg-sv-surface border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-xl p-6 border-t-[3px] border-t-sv-status-success shadow-sv-sm">
              <div className="flex items-center gap-5 mb-6">
                <Avatar name={member.name || "Member"} size="lg" />
                <div>
                  <h2 className="text-2xl font-bold text-sv-text">{member.name}</h2>
                  <p className="text-sv-text-muted text-sm flex items-center gap-2 mt-1">
                    <FiUser className="text-sv-status-success" /> {member.mobile} <span className="opacity-50">•</span> Joined {formatIST(new Date(member.joinDate), 'yyyy')}
                  </p>
                </div>
              </div>

              <h4 className="text-xs uppercase tracking-wider font-semibold text-sv-text-secondary flex items-center gap-2 mb-4 mt-6">
                <FiActivity className="text-sv-brand" /> Active Subscriptions
              </h4>
              
              {member.memberships.length === 0 ? (
                <div className="bg-sv-error-subtle text-sv-error-text p-4 rounded-sv-lg border border-[#2a2d3e] border-sv-error-border border-[#2a2d3e] font-semibold flex items-center gap-3 text-sm">
                  <FiX size={20} /> This member has no active plans.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {member.memberships.map((m: any) => {
                    const isActive = m.status === 'ACTIVE' && new Date(m.endDate) >= new Date();
                    return (
                      <div 
                        key={m.id} 
                        className={
                          isActive 
                            ? 'p-5 rounded-sv-lg bg-sv-surface-raised border border-[#2a2d3e] border-sv-success-border border-[#2a2d3e]/40 hover:border-sv-status-success transition-colors' 
                            : 'p-5 rounded-sv-lg bg-sv-surface-raised border border-[#2a2d3e] border-sv-border border-[#2a2d3e] opacity-50'
                        }
                      >
                        <div className="text-sv-status-success text-xs uppercase tracking-wider font-semibold mb-1">{m.membershipPlan?.sport?.name}</div>
                        <div className="text-sv-text font-semibold mb-3">{m.membershipPlan?.name}</div>
                        
                        {m.stats && (
                          <div className="grid grid-cols-3 gap-2 mb-4 bg-sv-bg rounded-sv-md p-2.5 border border-[#2a2d3e] border-sv-border border-[#2a2d3e]">
                            <div className="text-center">
                              <div className="text-[10px] text-sv-text-muted uppercase tracking-wider font-semibold">Left</div>
                              <div className="text-sv-text font-bold">{m.stats.daysLeft}d</div>
                            </div>
                            <div className="text-center border-x border-sv-border border-[#2a2d3e]">
                              <div className="text-[10px] text-sv-text-muted uppercase tracking-wider font-semibold">Attended</div>
                              <div className="text-sv-status-success font-bold">{m.stats.attended}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-[10px] text-sv-text-muted uppercase tracking-wider font-semibold">Missed</div>
                              <div className="text-sv-status-error font-bold">{m.stats.missed}</div>
                            </div>
                          </div>
                        )}

                        {isActive ? (
                          <Button 
                            variant="primary"
                            onClick={() => handleMarkAttendance(m.membershipPlanId, m.membershipPlan.sportId)}
                            isLoading={processingId === m.membershipPlanId}
                            disabled={processingId === m.membershipPlanId}
                            className="w-full"
                          >
                            <FiCheckCircle size={16} /> 
                            {processingId === m.membershipPlanId ? "CHECKING IN..." : "CHECK IN"}
                          </Button>
                        ) : (
                          <div className="text-xs text-sv-error-text font-semibold tracking-wider text-center py-2.5 bg-sv-error-subtle rounded-sv-md border border-[#2a2d3e] border-sv-error-border border-[#2a2d3e]">
                            EXPIRED
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {membersList.length > 1 && (
            <div className="bg-sv-surface border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-xl p-6 shadow-sv-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-sv-text">Select Family Member</h3>
                <Button 
                  variant="primary"
                  onClick={handleMarkFamilyAttendance}
                  leftIcon={<FiCheckCircle />}
                >
                  Mark Entire Family Present
                </Button>
              </div>
              <div className="flex flex-col gap-3">
                {membersList.map(m => {
                  const activePlans = m.memberships.filter((mem: any) => mem.status === 'ACTIVE' && new Date(mem.endDate) >= new Date());
                  
                  return (
                    <div 
                      key={m.id} 
                      className="flex flex-col sm:flex-row sm:items-center gap-4 bg-sv-surface-raised border border-[#2a2d3e] border-sv-border border-[#2a2d3e] p-4 rounded-sv-lg"
                    >
                      <div 
                        className="flex items-center gap-4 cursor-pointer flex-1 hover:opacity-80 transition-opacity"
                        onClick={() => {
                          setMember(m);
                          setMembersList([]);
                          setFamilySelections({});
                        }}
                      >
                        <Avatar name={m.name || "Member"} size="md" />
                        <div className="min-w-0">
                          <div className="text-sv-text font-semibold truncate">{m.name}</div>
                          <div className="text-sv-text-muted text-sm">Joined {formatIST(new Date(m.joinDate), 'yyyy')}</div>
                        </div>
                      </div>
                      
                      <div className="shrink-0 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-sv-border border-[#2a2d3e] sm:border-none">
                        {activePlans.length > 1 ? (
                          <select 
                            className="w-full sm:w-56 bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-md px-3 py-2 text-sm text-sv-text focus:outline-none focus:border-sv-brand"
                            value={familySelections[m.id] || ""}
                            onChange={(e) => setFamilySelections(prev => ({ ...prev, [m.id]: e.target.value }))}
                          >
                            {activePlans.map((ap: any) => (
                              <option key={ap.membershipPlanId} value={ap.membershipPlanId}>
                                {ap.membershipPlan?.sport?.name} - {ap.membershipPlan?.name}
                              </option>
                            ))}
                          </select>
                        ) : activePlans.length === 1 ? (
                          <Badge variant="success" size="sm">
                            {activePlans[0].membershipPlan?.sport?.name} ({activePlans[0].membershipPlan?.name})
                          </Badge>
                        ) : (
                          <Badge variant="error" size="sm">
                            No Active Plans
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Check-in Feed */}
        <div className="lg:col-span-5">
          <div className="bg-sv-surface border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-xl overflow-hidden flex flex-col h-[calc(100vh-160px)] shadow-sv-sm">
            <div className="px-6 py-4 border-b border-sv-border border-[#2a2d3e] flex justify-between items-center shrink-0">
              <h3 className="font-semibold text-sv-text flex items-center gap-2">
                <FiClock className="text-sv-brand" /> Today's Scans
              </h3>
              <Badge variant="info" size="sm">
                {records.length} SCANS
              </Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {records.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-sv-surface-raised flex items-center justify-center border border-[#2a2d3e] border-sv-border border-[#2a2d3e]">
                    <FiClock size={28} className="text-sv-text-muted" />
                  </div>
                  <p className="text-sv-text-muted text-sm">No check-ins yet today.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {records.map((record: any) => (
                    <div key={record.id} className="bg-sv-surface-raised rounded-sv-lg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] p-4 flex items-center gap-4 hover:bg-sv-surface-hover transition-colors">
                      <Avatar name={record.member?.name || "Member"} size="md" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-sv-text truncate">{record.member?.name}</div>
                        <div className="text-xs text-sv-text-muted mt-0.5">{record.member?.mobile}</div>
                        <div className="mt-1.5">
                          <Badge variant="success" size="sm">
                            <FiActivity size={9} className="mr-1 inline" /> {record.sport?.name || record.membershipPlan?.sport?.name || 'Sport'}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-2">
                        <div className="text-xl font-bold text-sv-text leading-none">{formatIST(new Date(record.date), 'h:mm')}</div>
                        <div className="text-[10px] font-semibold tracking-wider text-sv-text-muted uppercase mt-0.5">{formatIST(new Date(record.date), 'a')}</div>
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
          <div className="bg-sv-surface border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-xl p-8 w-full max-w-md shadow-sv-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-sv-text">Scan QR Code</h2>
              <button 
                className="text-sv-text-muted hover:text-sv-text bg-sv-surface-raised hover:bg-sv-surface-hover rounded-sv-sm p-2 transition-colors cursor-pointer border-none" 
                onClick={closeScanner}
              >
                <FiX />
              </button>
            </div>
            <div id="reader" className="w-full bg-black rounded-sv-lg overflow-hidden border border-[#2a2d3e] border-sv-border border-[#2a2d3e] html5-qrcode-custom"></div>
            <p className="text-center text-sv-text-muted mt-6 text-sm">Point camera at the member's Digital ID card</p>
          </div>
        </div>
      )}
    </div>
  );
}
