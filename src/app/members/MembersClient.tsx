"use client";

import { useState, useRef } from "react";
import { createMember, updateMember, deleteMember, assignPlan } from "./actions";
import { useAlert } from "@/components/AlertProvider";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCodeLib from "qrcode";
import { FiTrash2, FiEdit2, FiPlus, FiX, FiDownload, FiImage, FiMessageCircle, FiUserCheck } from "react-icons/fi";

export default function MembersClient({ initialMembers, plans }: { initialMembers: any[], plans: any[] }) {
  const { showAlert } = useAlert();
  const [members, setMembers] = useState(initialMembers);
  
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  
  const [editingId, setEditingId] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Assign Plan State
  const [assignMobile, setAssignMobile] = useState("");
  const [assignName, setAssignName] = useState("");
  const [assignEmail, setAssignEmail] = useState("");
  const [assignPlanId, setAssignPlanId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignLoading, setAssignLoading] = useState(false);

  // ID Card State
  const [idCardData, setIdCardData] = useState<any>(null);
  const [generatingIdCard, setGeneratingIdCard] = useState(false);
  const idCardRef = useRef<HTMLDivElement>(null);
  const [qrCodeData, setQrCodeData] = useState("");

  // Derived state for assignment
  const existingAssignMember = members.find(m => m.mobile === assignMobile);

  function openCreateModal() {
    setEditingId(""); setName(""); setMobile(""); setEmail("");
    setShowMemberModal(true);
  }

  function openEditModal(member: any) {
    setEditingId(member.id); setName(member.name); setMobile(member.mobile); setEmail(member.email || "");
    setShowMemberModal(true);
  }

  function openAssignModal() {
    setAssignMobile(""); setAssignName(""); setAssignEmail(""); setAssignPlanId("");
    setShowPlanModal(true);
  }

  async function handleMemberSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      if (editingId) {
        await updateMember(editingId, { name, mobile, email });
        showAlert("Member updated successfully!", "success");
      } else {
        await createMember({ name, mobile, email });
        showAlert("Member registered successfully!", "success");
      }
      setShowMemberModal(false); window.location.reload();
    } catch (err) {
      showAlert("Failed to save member details.", "error");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this member?")) return;
    try {
      await deleteMember(id);
      setMembers(members.filter(m => m.id !== id));
      showAlert("Member deleted permanently.", "success");
    } catch(err) {
      showAlert("Cannot delete member. They may have active plans.", "error");
    }
  }

  async function handleAssignPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!assignMobile || !assignPlanId) return showAlert("Mobile number and plan are required", "error");
    
    if (!existingAssignMember && !assignName) {
      return showAlert("Member doesn't exist. Please provide their Name to create them.", "error");
    }

    setAssignLoading(true);
    try {
      await assignPlan({ 
        mobile: assignMobile, 
        name: existingAssignMember ? undefined : assignName, 
        email: existingAssignMember ? undefined : assignEmail,
        planId: assignPlanId, 
        startDate 
      });
      showAlert("Membership Plan assigned successfully!", "success");
      setShowPlanModal(false); window.location.reload();
    } catch (err: any) {
      showAlert(err.message || "Failed to assign membership plan", "error");
    }
    setAssignLoading(false);
  }

  function openIdCardModal(member: any) {
    setIdCardData(member);
    setShowIdCardModal(true);
    QRCodeLib.toDataURL(member.mobile, { width: 300, margin: 0 }).then(setQrCodeData);
  }

  async function generateCanvas() {
    if (!idCardRef.current) return null;
    return await html2canvas(idCardRef.current, { scale: 3, useCORS: true, backgroundColor: null });
  }

  async function downloadPDF() {
    setGeneratingIdCard(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) throw new Error("No canvas");
      const doc = new jsPDF({ orientation: "landscape", unit: "px", format: [340, 215] });
      doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 340, 215);
      doc.save(`Sportsvilla_ID_${idCardData.name.replace(/\s+/g, '_')}.pdf`);
      showAlert("ID Card PDF Downloaded!", "success");
    } catch(e) { showAlert("Error generating PDF", "error"); }
    setGeneratingIdCard(false);
  }

  async function downloadPNG() {
    setGeneratingIdCard(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) throw new Error("No canvas");
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `Sportsvilla_ID_${idCardData.name.replace(/\s+/g, '_')}.png`;
      a.click();
      showAlert("ID Card Image Downloaded!", "success");
    } catch(e) { showAlert("Error generating PNG", "error"); }
    setGeneratingIdCard(false);
  }

  function fallbackWhatsApp(text: string) {
    const waUrl = `https://wa.me/91${idCardData.mobile.replace(/\D/g,'')}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  }

  async function shareWhatsApp() {
    setGeneratingIdCard(true);
    try {
      const portalUrl = window.location.origin + "/m/" + idCardData.mobile;
      const text = `🏆 *Welcome to Sportsvilla, ${idCardData.name}!* 🏆\n\nWe are thrilled to have you onboard. Your premium membership is now active!\n\n📲 *Access your Digital ID & Portal:*\n${portalUrl}\n\n_Use this link to view your Digital ID Card, track your check-ins, and manage your active memberships._\n\nSee you at the club! 🏃‍♂️💨`;
      
      const canvas = await generateCanvas();
      if (!canvas) throw new Error("No canvas");

      canvas.toBlob(async (blob) => {
        if (!blob) return fallbackWhatsApp(text);
        
        const file = new File([blob], `Sportsvilla_ID_${idCardData.name.replace(/\s+/g, '_')}.png`, { type: 'image/png' });
        
        // 1. Try Native Web Share API (Works on Mobile / macOS Safari)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'Sportsvilla ID Card',
              text: text,
              files: [file]
            });
            showAlert("Shared successfully!", "success");
            setGeneratingIdCard(false);
            return;
          } catch (err) {
            console.log("Share sheet cancelled or failed.");
          }
        }
        
        // 2. Fallback for Desktop (Copy to clipboard, then open WhatsApp Web)
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          showAlert("ID Card copied to clipboard! Just paste it in the WhatsApp chat.", "info");
          setTimeout(() => fallbackWhatsApp(text), 1500);
        } catch (err) {
          // 3. Ultimate Fallback: Just open text
          fallbackWhatsApp(text);
        }
        
        setGeneratingIdCard(false);
      }, 'image/png');
      
    } catch(e) {
      showAlert("Error preparing share", "error");
      setGeneratingIdCard(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <h1 className="text-2xl font-bold font-['Outfit'] text-white">Members Directory</h1>
        <div className="flex gap-3">
          <button onClick={openAssignModal} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer border-none">
            <FiPlus /> Assign Plan
          </button>
          <button onClick={openCreateModal} className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer border-none">
            <FiUserCheck /> Register Member
          </button>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-16 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center text-3xl mb-6">
            <FiUserCheck />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No Members Found</h3>
          <p className="text-gray-500 mb-8 max-w-md">Your directory is currently empty. Start by registering a member or assigning a plan to a new mobile number.</p>
          <button onClick={openCreateModal} className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer border-none">
            <FiPlus /> Register First Member
          </button>
        </div>
      ) : (
        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr>
                  <th className="bg-[#0f1117] text-gray-500 text-xs uppercase tracking-wider font-semibold px-6 py-4 text-left border-b border-[#2a2d3e] w-[30%]">Member Profile</th>
                  <th className="bg-[#0f1117] text-gray-500 text-xs uppercase tracking-wider font-semibold px-6 py-4 text-left border-b border-[#2a2d3e] w-[25%]">Contact details</th>
                  <th className="bg-[#0f1117] text-gray-500 text-xs uppercase tracking-wider font-semibold px-6 py-4 text-left border-b border-[#2a2d3e] w-[30%]">Active Plans</th>
                  <th className="bg-[#0f1117] text-gray-500 text-xs uppercase tracking-wider font-semibold px-6 py-4 text-right border-b border-[#2a2d3e] w-[15%]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr key={member.id} className="hover:bg-[#1c1f2e]/50 transition-colors">
                    <td className="px-6 py-5 text-sm border-b border-[#2a2d3e]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-400 font-semibold flex items-center justify-center font-['Outfit'] text-base">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{member.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">Joined {format(new Date(member.joinDate), 'MMM d, yyyy')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm border-b border-[#2a2d3e]">
                      <div className="text-sm text-gray-300">{member.mobile}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{member.email || 'No email provided'}</div>
                    </td>
                    <td className="px-6 py-5 text-sm border-b border-[#2a2d3e]">
                      <div className="flex flex-col gap-2">
                        {member.memberships?.length ? member.memberships.map((m: any) => {
                          const isActive = m.status === 'ACTIVE' && new Date(m.endDate) >= new Date();
                          return (
                            <div key={m.id} className={`text-xs py-1 px-3 rounded-md flex justify-between items-center ${isActive ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-[#1c1f2e] border border-[#2a2d3e] text-gray-500 opacity-60'}`}>
                              <span className="font-bold tracking-wide uppercase">{m.membershipPlan?.sport?.name}</span>
                              <span className="opacity-80 font-medium tracking-tight">
                                Expires: {format(new Date(m.endDate), 'MMM d')}
                              </span>
                            </div>
                          );
                        }) : <span className="text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-md inline-block">No Active Plans</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm border-b border-[#2a2d3e]">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openIdCardModal(member)} className="border border-[#2a2d3e] hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/30 text-gray-400 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer bg-transparent">
                          ID CARD
                        </button>
                        <button onClick={() => openEditModal(member)} className="border border-[#2a2d3e] hover:bg-[#1c1f2e] text-gray-400 rounded-lg p-1.5 transition-colors cursor-pointer bg-transparent">
                          <FiEdit2 />
                        </button>
                        <button onClick={() => handleDelete(member.id)} className="border border-[#2a2d3e] hover:bg-red-500/10 text-red-400 rounded-lg p-1.5 transition-colors cursor-pointer bg-transparent">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 sm:p-8 w-full max-w-md shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-['Outfit'] text-white">{editingId ? 'Edit Member' : 'Register Member'}</h2>
              <button className="text-gray-500 hover:text-white cursor-pointer bg-transparent border-none text-xl" onClick={() => setShowMemberModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleMemberSubmit}>
              <div className="mb-5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Full Name</label>
                <input type="text" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. John Doe" />
              </div>
              <div className="mb-5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Mobile Number</label>
                <input type="tel" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={mobile} onChange={e => setMobile(e.target.value)} required pattern="[0-9]{10}" placeholder="10-digit mobile" />
              </div>
              <div className="mb-5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Email (Optional)</label>
                <input type="email" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
              </div>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-3 text-sm font-semibold transition-colors cursor-pointer border-none disabled:opacity-50" disabled={loading}>
                {loading ? "Saving..." : "Save Member"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Assign Plan Modal (Refactored to Mobile Input) */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 sm:p-8 w-full max-w-md shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-['Outfit'] text-white">Assign Plan to Member</h2>
              <button className="text-gray-500 hover:text-white cursor-pointer bg-transparent border-none text-xl" onClick={() => setShowPlanModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleAssignPlan}>
              <div className="mb-5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Member's Mobile Number</label>
                <input 
                  type="tel" 
                  className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" 
                  value={assignMobile} 
                  onChange={e => setAssignMobile(e.target.value)} 
                  required 
                  pattern="[0-9]{10}" 
                  placeholder="Enter 10-digit mobile..." 
                />
                {assignMobile.length === 10 && (
                  <div className={`mt-3 p-3 rounded-lg text-sm font-semibold ${existingAssignMember ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-orange-500/10 border border-orange-500/20 text-orange-400'}`}>
                    {existingAssignMember 
                      ? `Found Member: ${existingAssignMember.name}` 
                      : `New Member! They will be created automatically upon assignment.`}
                  </div>
                )}
              </div>

              {!existingAssignMember && assignMobile.length === 10 && (
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Full Name <span className="text-red-400">*</span></label>
                    <input type="text" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={assignName} onChange={e => setAssignName(e.target.value)} required placeholder="Required" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Email</label>
                    <input type="email" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={assignEmail} onChange={e => setAssignEmail(e.target.value)} placeholder="Optional" />
                  </div>
                </div>
              )}

              <div className="mb-5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Select Membership Plan</label>
                <select className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={assignPlanId} onChange={e => setAssignPlanId(e.target.value)} required>
                  <option value="">-- Choose Plan --</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {p.sport?.name} ({p.slotsPerDay} slots/day)</option>
                  ))}
                </select>
              </div>
              <div className="mb-5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Start Date</label>
                <input type="date" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} required />
              </div>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-3 text-sm font-semibold transition-colors cursor-pointer border-none disabled:opacity-50" disabled={assignLoading}>
                {assignLoading ? "Assigning..." : "Confirm Assignment"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ID Card Display & Download Modal */}
      {showIdCardModal && idCardData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 sm:p-8 w-full max-w-[420px] shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-['Outfit'] text-white">Digital ID Card</h2>
              <button className="text-gray-500 hover:text-white cursor-pointer bg-transparent border-none text-xl" onClick={() => setShowIdCardModal(false)}><FiX /></button>
            </div>
            
            <div className="flex justify-center mb-6 sm:mb-8 transform scale-[0.75] sm:scale-[0.85] origin-top h-[165px] sm:h-[180px]">
              <div ref={idCardRef} className="id-card-wrapper" style={{ margin: '0 auto' }}>
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
                      <div className="id-card-name">{idCardData.name}</div>
                      <div className="id-card-details-grid">
                        <div className="id-card-detail-group">
                          <div className="id-card-label">Mobile</div>
                          <div className="id-card-value">{idCardData.mobile}</div>
                        </div>
                        <div className="id-card-detail-group">
                          <div className="id-card-label">Member Since</div>
                          <div className="id-card-value">{format(new Date(idCardData.joinDate), 'MMM d, yyyy')}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      {qrCodeData && (
                        <div className="id-card-qr-container">
                          <img src={qrCodeData} alt="QR" className="id-card-qr" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={shareWhatsApp} disabled={generatingIdCard} className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg px-5 py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer border-none">
                <FiMessageCircle /> Send via WhatsApp
              </button>
              <button onClick={downloadPNG} disabled={generatingIdCard} className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer border-none">
                <FiImage /> Download PNG
              </button>
              <button onClick={downloadPDF} disabled={generatingIdCard} className="w-full border border-[#2a2d3e] hover:bg-[#1c1f2e] text-gray-300 rounded-lg px-5 py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer bg-transparent">
                <FiDownload /> Download PDF
              </button>
            </div>
            
            <p className="text-center text-xs text-gray-500 mt-5">
              The WhatsApp link sends members directly to their own personalized online portal.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
