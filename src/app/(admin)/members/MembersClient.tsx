"use client";
import { formatIST, todayIST } from "@/lib/dateUtils";
import { useState, useRef, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createMember, updateMember, deleteMember, assignPlan, createFamily, updateMemberMembership, deleteMemberMembership, resetWallet } from "./actions";
import { useAlert } from "@/components/AlertProvider";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCodeLib from "qrcode";
import { FiTrash2, FiEdit2, FiPlus, FiX, FiDownload, FiImage, FiMessageCircle, FiUserCheck, FiUsers, FiFileText, FiRefreshCcw } from "react-icons/fi";

export default function MembersClient({ initialMembers, plans, turfs = [] }: { initialMembers: any[], plans: any[], turfs?: any[] }) {
  const { showAlert } = useAlert();
  const searchParams = useSearchParams();
  const [members, setMembers] = useState(initialMembers);
  
  const [activeTab, setActiveTab] = useState<'MEMBERS'|'FAMILIES'>('MEMBERS');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [idCardData, setIdCardData] = useState<any>(null);
  
  const [editingId, setEditingId] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const addMobile = searchParams.get("addMobile");
    if (addMobile) {
      setMobile(addMobile);
      setShowMemberModal(true);
    }
  }, [searchParams]);

  // Family State
  const [familyMobile, setFamilyMobile] = useState("");
  const [familyMembers, setFamilyMembers] = useState([{ name: "", email: "" }]);

  // Assign Plan State
  const [assignMobile, setAssignMobile] = useState("");
  const [assignName, setAssignName] = useState("");
  const [assignEmail, setAssignEmail] = useState("");
  const [assignMemberIds, setAssignMemberIds] = useState<string[]>([]);
  const [assignPlanId, setAssignPlanId] = useState("");
  const [startDate, setStartDate] = useState(todayIST());
  const [assignTurfId, setAssignTurfId] = useState("");
  const [assignStartTime, setAssignStartTime] = useState("");
  const [assignEndTime, setAssignEndTime] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  // Edit Membership State
  const [showEditMembershipModal, setShowEditMembershipModal] = useState(false);
  const [editingMembership, setEditingMembership] = useState<any>(null);
  const [editMembershipStart, setEditMembershipStart] = useState("");
  const [editMembershipEnd, setEditMembershipEnd] = useState("");
  const [editMembershipStatus, setEditMembershipStatus] = useState("ACTIVE");
  const [editMembershipTurfId, setEditMembershipTurfId] = useState("");
  const [editMembershipStartTime, setEditMembershipStartTime] = useState("");
  const [editMembershipEndTime, setEditMembershipEndTime] = useState("");
  const [membershipLoading, setMembershipLoading] = useState(false);

  // Derived state for assignment
  const existingAssignMembers = members.filter(m => m.mobile === assignMobile);
  const [generatingIdCard, setGeneratingIdCard] = useState(false);
  const idCardRef = useRef<HTMLDivElement>(null);

  const timeOptions = useMemo(() => {
    const times = [];
    for (let i = 5; i <= 23; i++) {
      for (const min of ['00', '30']) {
        const hour = i % 12 || 12;
        const ampm = i < 12 ? 'AM' : 'PM';
        times.push(`${hour.toString().padStart(2, '0')}:${min} ${ampm}`);
      }
    }
    return times;
  }, []);
  const [qrCodeData, setQrCodeData] = useState("");

  const selectedAssignPlan = useMemo(() => plans.find((p) => p.id === assignPlanId), [assignPlanId, plans]);

  const families = useMemo(() => {
    const map = new Map<string, any[]>();
    members.forEach(m => {
      if (!map.has(m.mobile)) map.set(m.mobile, []);
      map.get(m.mobile)?.push(m);
    });
    return Array.from(map.entries()).map(([mobile, mems]) => ({ mobile, members: mems }));
  }, [members]);

  const handleExportCSV = () => {
    let csv = "Name,Mobile,Email,Joined Date\n";
    members.forEach(m => {
      csv += `"${m.name}","${m.mobile}","${m.email || ''}","${formatIST(m.createdAt, 'MMM d, yyyy')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sportsvilla_members_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  async function handleResetWallet(id: string) {
    if (!confirm("Are you sure you want to reset this user's wallet balance to ₹0?")) return;
    try {
      await resetWallet(id);
      showAlert("Success", "Wallet balance reset to 0.", "success");
      const updatedMembers = members.map(m => m.id === id ? { ...m, walletBalance: 0 } : m);
      setMembers(updatedMembers);
    } catch (e: any) {
      showAlert("Error", e.message, "error");
    }
  }

  function openCreateModal() {
    setEditingId(""); setName(""); setMobile(""); setEmail("");
    setShowMemberModal(true);
  }

  function openEditModal(member: any) {
    setEditingId(member.id); setName(member.name); setMobile(member.mobile); setEmail(member.email || "");
    setShowMemberModal(true);
  }

  function openFamilyModal() {
    setFamilyMobile(""); setFamilyMembers([{name: "", email: ""}]);
    setShowFamilyModal(true);
  }

  function openAssignModal() {
    setAssignMobile(""); setAssignName(""); setAssignEmail(""); setAssignPlanId(""); setAssignMemberIds([]);
    setShowPlanModal(true);
  }

  async function handleMemberSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      if (editingId) {
        await updateMember(editingId, { name, mobile, email });
        showAlert("Update Successful", "The member's profile has been updated in the database.", "success");
      } else {
        await createMember({ name, mobile, email });
        showAlert("Registration Complete", `${name} has been successfully registered to Sportsvilla!`, "success");
      }
      setShowMemberModal(false); window.location.reload();
    } catch (err) {
      showAlert("Registration Failed", "We couldn't save the member details. Please check the information and try again.", "error");
    }
    setLoading(false);
  }

  async function handleFamilySubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      await createFamily({ mobile: familyMobile, members: familyMembers.filter(m => m.name.trim() !== "") });
      showAlert("Family Created", "The family account has been successfully set up!", "success");
      setShowFamilyModal(false); window.location.reload();
    } catch (err: any) {
      showAlert("Creation Failed", err.message || "Could not create family.", "error");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this member?")) return;
    try {
      await deleteMember(id);
      setMembers(members.filter(m => m.id !== id));
      showAlert("Member Deleted", "The member has been permanently removed from the system.", "success");
    } catch(err) {
      showAlert("Deletion Blocked", "Cannot delete this member because they have active or past memberships tied to their account.", "error");
    }
  }

  async function handleAssignPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!assignMobile || !assignPlanId) return showAlert("Missing Information", "Please provide both a mobile number and select a plan to continue.", "error");
    
    if (existingAssignMembers.length > 0 && assignMemberIds.length === 0) {
      return showAlert("Select Member", "Multiple family members found on this number. Please select at least one member to assign the plan to.", "error");
    }

    if (existingAssignMembers.length === 0 && !assignName) {
      return showAlert("Name Required", "This mobile number is new. Please provide a Full Name to register them automatically.", "error");
    }

    setAssignLoading(true);
    try {
      await assignPlan({ 
        memberIds: assignMemberIds.length > 0 ? assignMemberIds : undefined,
        mobile: assignMobile, 
        name: existingAssignMembers.length > 0 ? undefined : assignName, 
        email: existingAssignMembers.length > 0 ? undefined : assignEmail,
        planId: assignPlanId, 
        startDate,
        turfId: assignTurfId || undefined,
        timeSlot: (assignStartTime && assignEndTime) ? `${assignStartTime} - ${assignEndTime}` : undefined
      });
      showAlert("Plan Assigned", "The membership plan has been successfully activated.", "success");
      setShowPlanModal(false); window.location.reload();
    } catch (err: any) {
      showAlert("Assignment Failed", err.message || "There was an issue assigning the membership plan. Please try again.", "error");
    }
    setAssignLoading(false);
  }

  function openEditMembershipModal(membership: any) {
    setEditingMembership(membership);
    setEditMembershipStart(new Date(membership.startDate).toISOString().split('T')[0]);
    setEditMembershipEnd(new Date(membership.endDate).toISOString().split('T')[0]);
    setEditMembershipStatus(membership.status);
    setEditMembershipTurfId(membership.turfId || "");
    const parts = (membership.timeSlot || "").split(" - ");
    setEditMembershipStartTime(parts[0] || "");
    setEditMembershipEndTime(parts[1] || "");
    setShowEditMembershipModal(true);
  }

  async function handleUpdateMembership(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMembership) return;
    setMembershipLoading(true);
    try {
      const data = await updateMemberMembership(editingMembership.id, {
        startDate: editMembershipStart,
        endDate: editMembershipEnd,
        status: editMembershipStatus,
        turfId: editMembershipTurfId || undefined,
        timeSlot: (editMembershipStartTime && editMembershipEndTime) ? `${editMembershipStartTime} - ${editMembershipEndTime}` : undefined,
      });
      showAlert("Membership Updated", "The membership details have been updated.", "success");
      setShowEditMembershipModal(false);
      window.location.reload();
    } catch (err: any) {
      showAlert("Update Failed", err.message || "Failed to update membership.", "error");
    }
    setMembershipLoading(false);
  }

  async function handleDeleteMembership(id: string) {
    if (!confirm("Are you sure you want to permanently delete this membership record? This action cannot be undone.")) return;
    try {
      await deleteMemberMembership(id);
      showAlert("Membership Deleted", "The membership has been removed.", "success");
      window.location.reload();
    } catch (err: any) {
      showAlert("Deletion Failed", err.message || "Failed to delete membership.", "error");
    }
  }

  function openIdCardModal(member: any) {
    setIdCardData(member);
    setShowIdCardModal(true);
    QRCodeLib.toDataURL(member.id, { width: 300, margin: 0 }).then(setQrCodeData);
  }

  async function generateCanvas() {
    if (!idCardRef.current) return null;
    return await html2canvas(idCardRef.current, { scale: 4, useCORS: true, backgroundColor: null });
  }

  async function downloadPDF() {
    setGeneratingIdCard(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) throw new Error("No canvas");
      const doc = new jsPDF({ orientation: "landscape", unit: "px", format: [856, 540] });
      doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 856, 540);
      doc.save(`Sportsvilla_ID_${idCardData.name.replace(/\s+/g, '_')}.pdf`);
      showAlert("PDF Downloaded", "The high-resolution ID Card PDF has been downloaded to your device.", "success");
    } catch(e) { showAlert("Export Failed", "We encountered an error while generating the PDF.", "error"); }
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
      showAlert("Image Downloaded", "The high-resolution ID Card image has been downloaded to your device.", "success");
    } catch(e) { showAlert("Export Failed", "We encountered an error while generating the image.", "error"); }
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
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ title: 'Sportsvilla ID Card', text: text, files: [file] });
            showAlert("Share Successful", "The ID card has been shared directly via your device.", "success");
            setGeneratingIdCard(false);
            return;
          } catch (err) {
            console.log("Share sheet cancelled or failed.");
          }
        }
        
        try {
          await navigator.clipboard.write([ new ClipboardItem({ 'image/png': blob }) ]);
          showAlert("Image Copied", "The ID Card image has been copied to your clipboard. Just paste it into the WhatsApp chat that opens next!", "info");
          setTimeout(() => fallbackWhatsApp(text), 2000);
        } catch (err) {
          fallbackWhatsApp(text);
        }
        setGeneratingIdCard(false);
      }, 'image/png');
    } catch(e) {
      showAlert("Share Failed", "We encountered an unexpected error while preparing the ID Card for sharing.", "error");
      setGeneratingIdCard(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-white">Members Directory</h1>
          <div className="flex gap-4 mt-4 border-b border-[#2a2d3e]">
            <button onClick={() => setActiveTab('MEMBERS')} className={`pb-3 px-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'MEMBERS' ? 'border-orange-500 text-orange-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>All Members</button>
            <button onClick={() => setActiveTab('FAMILIES')} className={`pb-3 px-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'FAMILIES' ? 'border-orange-500 text-orange-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Families</button>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2.5 text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer">
            <FiFileText /> Export CSV
          </button>
          <button onClick={openAssignModal} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer border-none">
            <FiPlus /> Assign Plan
          </button>
          {activeTab === 'FAMILIES' ? (
            <button onClick={openFamilyModal} className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer border-none">
              <FiUsers /> Setup Family
            </button>
          ) : (
            <button onClick={openCreateModal} className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer border-none">
              <FiUserCheck /> Register Member
            </button>
          )}
        </div>
      </div>

      {activeTab === 'MEMBERS' && (
        members.length === 0 ? (
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center text-3xl mb-6"><FiUserCheck /></div>
            <h3 className="text-2xl font-bold text-white mb-2">No Members Found</h3>
            <button onClick={openCreateModal} className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer border-none mt-4">
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
                  {members.slice((page - 1) * itemsPerPage, page * itemsPerPage).map(member => (
                    <tr key={member.id} className="hover:bg-[#1c1f2e]/50 transition-colors">
                      <td className="px-6 py-5 text-sm border-b border-[#2a2d3e]">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-400 font-semibold flex items-center justify-center font-['Outfit'] text-base">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{member.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">ID: {member.id} • Joined {formatIST(new Date(member.joinDate), 'MMM d, yyyy')}</div>
                            <div className="text-xs text-orange-400 mt-0.5 font-bold">{member.loyaltyPoints} Loyalty Pts • Wallet: ₹{(member.walletBalance || 0) / 100}</div>
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
                                <div className="flex flex-col">
                                  <span className="font-bold tracking-wide uppercase">{m.membershipPlan?.name} ({m.membershipPlan?.sport?.name})</span>
                                  {(m.turf || m.timeSlot) && (
                                    <span className="text-[10px] mt-0.5 opacity-80 font-medium">
                                      {m.turf?.name || "Any Court"} {m.timeSlot && `• ${m.timeSlot}`}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="opacity-80 font-medium tracking-tight">Expires: {formatIST(new Date(m.endDate), 'MMM d')}</span>
                                  <div className="flex items-center gap-1 border-l border-gray-700/50 pl-3">
                                    <button onClick={() => openEditMembershipModal(m)} className="hover:text-white transition-colors p-1"><FiEdit2 size={12} /></button>
                                    <button onClick={() => handleDeleteMembership(m.id)} className="hover:text-red-400 transition-colors p-1"><FiTrash2 size={12} /></button>
                                  </div>
                                </div>
                              </div>
                            );
                          }) : <span className="text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-md inline-block">No Active Plans</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm border-b border-[#2a2d3e]">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => openIdCardModal(member)} className="border border-[#2a2d3e] hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/30 text-gray-400 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer bg-transparent">ID CARD</button>
                          <button onClick={() => handleResetWallet(member.id)} title="Reset Wallet" className="border border-[#2a2d3e] hover:bg-yellow-500/10 text-yellow-400 rounded-lg p-1.5 transition-colors cursor-pointer bg-transparent"><FiRefreshCcw /></button>
                          <button onClick={() => openEditModal(member)} title="Edit Member" className="border border-[#2a2d3e] hover:bg-[#1c1f2e] text-gray-400 rounded-lg p-1.5 transition-colors cursor-pointer bg-transparent"><FiEdit2 /></button>
                          <button onClick={() => handleDelete(member.id)} title="Delete Member" className="border border-[#2a2d3e] hover:bg-red-500/10 text-red-400 rounded-lg p-1.5 transition-colors cursor-pointer bg-transparent"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {members.length > itemsPerPage && (
              <div className="flex justify-between items-center p-4 border-t border-[#2a2d3e]">
                <div className="text-sm text-gray-500">
                  Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, members.length)} of {members.length}
                </div>
                <div className="flex gap-2">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1 bg-[#1a1d27] border border-[#2a2d3e] text-white rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button 
                    disabled={page * itemsPerPage >= members.length}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 bg-[#1a1d27] border border-[#2a2d3e] text-white rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      )}

      {activeTab === 'FAMILIES' && (
        families.length === 0 ? (
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center text-3xl mb-6"><FiUsers /></div>
            <h3 className="text-2xl font-bold text-white mb-2">No Families Setup</h3>
            <button onClick={openFamilyModal} className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer border-none mt-4">
              <FiPlus /> Setup First Family
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {families.map(family => (
              <div key={family.mobile} className="bg-[#161923] border border-[#2a2d3e] rounded-xl overflow-hidden">
                <div className="bg-[#1c1f2e] border-b border-[#2a2d3e] px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white font-['Outfit']">{family.mobile}</h3>
                  <p className="text-sm text-gray-500 mt-1">{family.members.length} Family Member(s)</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl"><FiUsers /></div>
              </div>
              <div className="space-y-4">
                {family.members.map(member => (
                  <div key={member.id} className="flex justify-between items-center bg-[#0f1117] border border-[#2a2d3e] p-3 rounded-lg">
                    <div>
                      <div className="font-semibold text-white text-sm">{member.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{member.id}</div>
                    </div>
                    <button onClick={() => openIdCardModal(member)} className="text-xs font-semibold text-orange-400 hover:text-orange-300">ID CARD</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        )
      )}

      {/* Edit/Create Member Modal */}
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

      {/* Family Registration Modal */}
      {showFamilyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 sm:p-8 w-full max-w-lg shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-['Outfit'] text-white">Setup Family Account</h2>
              <button className="text-gray-500 hover:text-white cursor-pointer bg-transparent border-none text-xl" onClick={() => setShowFamilyModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleFamilySubmit}>
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Primary Mobile Number</label>
                <input type="tel" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={familyMobile} onChange={e => setFamilyMobile(e.target.value)} required pattern="[0-9]{10}" placeholder="10-digit mobile" />
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500">Family Members</label>
                  <button type="button" onClick={() => setFamilyMembers([...familyMembers, {name: "", email: ""}])} className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 bg-orange-500/10 px-2 py-1 rounded">
                    <FiPlus /> Add Another
                  </button>
                </div>
                <div className="space-y-3">
                  {familyMembers.map((m, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input type="text" className="flex-1 bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none text-sm" value={m.name} onChange={e => { const nm = [...familyMembers]; nm[idx].name = e.target.value; setFamilyMembers(nm); }} required placeholder={`Member ${idx + 1} Name`} />
                      <button type="button" onClick={() => setFamilyMembers(familyMembers.filter((_, i) => i !== idx))} className="text-gray-500 hover:text-red-400 p-2"><FiTrash2 /></button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-3 text-sm font-semibold transition-colors cursor-pointer border-none disabled:opacity-50" disabled={loading}>
                {loading ? "Creating..." : "Create Family Account"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Assign Plan Modal & ID Card Modal omitted for brevity, keeping same logic */}
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
                  type="tel" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" 
                  value={assignMobile} onChange={e => setAssignMobile(e.target.value)} required pattern="[0-9]{10}" placeholder="Enter 10-digit mobile..." 
                />
                {assignMobile.length === 10 && (
                  <div className={`mt-3 p-3 rounded-lg text-sm font-semibold ${existingAssignMembers.length > 0 ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-orange-500/10 border border-orange-500/20 text-orange-400'}`}>
                    {existingAssignMembers.length > 0 ? `Found ${existingAssignMembers.length} Family Member(s)` : `New Member! They will be created automatically upon assignment.`}
                  </div>
                )}
                {existingAssignMembers.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500">Select Family Member</label>
                      {selectedAssignPlan?.isFamilyPlan && selectedAssignPlan.familySize && (
                        <span className="text-[10px] font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                          {assignMemberIds.length} / {selectedAssignPlan.familySize} selected
                        </span>
                      )}
                    </div>
                    {existingAssignMembers.map(m => {
                      const isChecked = assignMemberIds.includes(m.id);
                      return (
                      <label key={m.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isChecked ? 'bg-[#1c1f2e] border-emerald-500 text-white' : 'border-[#2a2d3e] text-gray-400 hover:bg-[#1c1f2e]'}`}>
                        <input 
                          type={selectedAssignPlan?.isFamilyPlan ? "checkbox" : "radio"} 
                          name="family_member" 
                          value={m.id} 
                          checked={isChecked} 
                          onChange={() => {
                            if (!selectedAssignPlan?.isFamilyPlan) {
                              setAssignMemberIds([m.id]);
                            } else {
                              if (isChecked) {
                                setAssignMemberIds(prev => prev.filter(id => id !== m.id));
                              } else {
                                if (selectedAssignPlan.familySize && assignMemberIds.length >= selectedAssignPlan.familySize) {
                                  showAlert("Limit Reached", `This family plan allows a maximum of ${selectedAssignPlan.familySize} members.`, "error");
                                  return;
                                }
                                setAssignMemberIds(prev => [...prev, m.id]);
                              }
                            }
                          }} 
                          className={`w-4 h-4 text-emerald-500 bg-[#0f1117] border-[#2a2d3e] focus:ring-emerald-500 ${selectedAssignPlan?.isFamilyPlan ? 'rounded' : ''}`} 
                        />
                        <span className="font-medium">{m.name}</span>
                      </label>
                    )})}
                  </div>
                )}
              </div>

              {existingAssignMembers.length === 0 && assignMobile.length === 10 && (
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
                <select className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={assignPlanId} onChange={e => { setAssignPlanId(e.target.value); setAssignMemberIds([]); }} required>
                  <option value="">-- Choose Plan --</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name} - {p.sport?.name} {p.isFamilyPlan && `(Family Size: ${p.familySize})`}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Start Date</label>
                  <input type="date" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Start Time</label>
                  <select 
                    className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm"
                    value={assignStartTime}
                    onChange={e => setAssignStartTime(e.target.value)}
                  >
                    <option value="">Any Time</option>
                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">End Time</label>
                  <select 
                    className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm"
                    value={assignEndTime}
                    onChange={e => setAssignEndTime(e.target.value)}
                  >
                    <option value="">Any Time</option>
                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Assigned Court/Turf</label>
                <select className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={assignTurfId} onChange={e => setAssignTurfId(e.target.value)}>
                  <option value="">-- No Specific Court --</option>
                  {turfs.filter(t => !selectedAssignPlan || t.sports?.some((ts: any) => ts.sportId === selectedAssignPlan.sportId)).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
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
            
            <div className="flex justify-center w-full mb-6 sm:mb-8">
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
                          <div className="id-card-value">{formatIST(new Date(idCardData.joinDate), 'MMM d, yyyy')}</div>
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

      {showEditMembershipModal && editingMembership && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-[#2a2d3e] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-[#2a2d3e] flex justify-between items-center bg-[#181b25]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FiEdit2 className="text-orange-500" /> Edit Membership
              </h3>
              <button onClick={() => setShowEditMembershipModal(false)} className="text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-1"><FiX size={20} /></button>
            </div>
            
            <form onSubmit={handleUpdateMembership} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Start Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm"
                    value={editMembershipStart}
                    onChange={e => setEditMembershipStart(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">End Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm"
                    value={editMembershipEnd}
                    onChange={e => setEditMembershipEnd(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Start Time</label>
                  <select 
                    className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm"
                    value={editMembershipStartTime}
                    onChange={e => setEditMembershipStartTime(e.target.value)}
                  >
                    <option value="">Any Time</option>
                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">End Time</label>
                  <select 
                    className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm"
                    value={editMembershipEndTime}
                    onChange={e => setEditMembershipEndTime(e.target.value)}
                  >
                    <option value="">Any Time</option>
                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Assigned Court/Turf</label>
                <select 
                  className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm"
                  value={editMembershipTurfId}
                  onChange={e => setEditMembershipTurfId(e.target.value)}
                >
                  <option value="">-- No Specific Court --</option>
                  {turfs.filter(t => !editingMembership.membershipPlan?.sportId || t.sports?.some((ts: any) => ts.sportId === editingMembership.membershipPlan.sportId)).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-8">
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Status</label>
                <select 
                  className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm"
                  value={editMembershipStatus}
                  onChange={e => setEditMembershipStatus(e.target.value)}
                  required
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={membershipLoading} 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-3.5 text-sm font-bold shadow-lg shadow-orange-500/20 transition-all cursor-pointer border-none disabled:opacity-50"
              >
                {membershipLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
