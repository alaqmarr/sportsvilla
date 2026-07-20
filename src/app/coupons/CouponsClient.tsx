"use client";

import { useState } from "react";
import { FiTag, FiPlus, FiX, FiCheck, FiSearch, FiBarChart2, FiEyeOff } from "react-icons/fi";
import { createCoupon, toggleCouponStatus } from "./actions";
import LinkComponent from "next/link";
import toast from "react-hot-toast";

export default function CouponsClient({ initialCoupons, members }: { initialCoupons: any[], members: any[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"AMOUNT" | "PERCENTAGE">("AMOUNT");
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [maxUsesPerUser, setMaxUsesPerUser] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [appOnly, setAppOnly] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [targetType, setTargetType] = useState("EVERYONE");
  const [milestoneCount, setMilestoneCount] = useState("");
  
  // Specific Member Selection
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);

  const filteredMembers = members.filter(m => 
    !selectedMembers.find(sm => sm.id === m.id) &&
    (m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.mobile.includes(memberSearch))
  ).slice(0, 5);

  const resetForm = () => {
    setCode("");
    setDiscountType("AMOUNT");
    setDiscountValue("");
    setMaxDiscount("");
    setMaxUses("");
    setMaxUsesPerUser("");
    setExpiryDate("");
    setAppOnly(false);
    setIsPublic(true);
    setTargetType("EVERYONE");
    setMilestoneCount("");
    setSelectedMembers([]);
    setMemberSearch("");
    setError("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code) return toast.error("Code is required");
    if (!discountValue) return toast.error("Discount value is required");
    if (targetType === "SPECIFIC_MEMBERS" && selectedMembers.length === 0) return toast.error("Select at least one member");
    if (targetType.startsWith("MILESTONE") && !milestoneCount) return toast.error("Milestone count is required");

    setIsSubmitting(true);
    try {
      const data = {
        code,
        discountAmount: discountType === "AMOUNT" ? Number(discountValue) : null,
        discountPercentage: discountType === "PERCENTAGE" ? Number(discountValue) : null,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        maxUsesPerUser: maxUsesPerUser ? Number(maxUsesPerUser) : null,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
        appOnly,
        isPublic,
        targetType,
        milestoneBookingsCount: milestoneCount ? Number(milestoneCount) : null,
        assignedMemberIds: selectedMembers.map(m => m.id)
      };

      const newCoupon = await createCoupon(data);
      // Optimistic update
      setCoupons(prev => [{
        ...newCoupon, 
        usages: [], 
        assignments: selectedMembers.map(m => ({ member: m })) 
      }, ...prev]);
      
      setIsModalOpen(false);
      resetForm();
      toast.success("Coupon created successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create coupon");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
      await toggleCouponStatus(id, !currentStatus);
      toast.success(`Coupon ${currentStatus ? 'deactivated' : 'activated'}`);
    } catch (err) {
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: currentStatus } : c));
      toast.error("Failed to toggle coupon status");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FiTag className="text-orange-500" />
            Coupons
          </h1>
          <p className="text-gray-400 mt-1">Manage promotional codes and targeted discounts.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors"
        >
          <FiPlus /> Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 flex gap-2">
              {!coupon.isPublic && (
                <div className="px-3 py-1 rounded-bl-lg text-xs font-bold bg-purple-500/20 text-purple-400 flex items-center gap-1">
                  <FiEyeOff /> PRIVATE
                </div>
              )}
              <div className={`px-3 py-1 rounded-bl-lg text-xs font-bold ${coupon.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                {coupon.isActive ? "ACTIVE" : "INACTIVE"}
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4 mt-2">
              <div className="text-2xl font-black text-white tracking-widest bg-[#1c1f2e] px-3 py-1 rounded border border-[#2a2d3e]">
                {coupon.code}
              </div>
            </div>

            <div className="text-3xl font-black text-orange-500 mb-4">
              {coupon.discountAmount ? `₹${coupon.discountAmount} OFF` : `${coupon.discountPercentage}% OFF`}
              {coupon.maxDiscount && <span className="text-xs text-gray-400 font-medium ml-2 block uppercase">Up to ₹{coupon.maxDiscount}</span>}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Target</span>
                <span className="text-white font-medium text-right">
                  {coupon.targetType === "EVERYONE" && "Everyone"}
                  {coupon.targetType === "SPECIFIC_MEMBERS" && `${coupon.assignments?.length || 0} Members`}
                  {coupon.targetType === "MILESTONE_ALL_TIME" && `Completed ${coupon.milestoneBookingsCount} bookings`}
                  {coupon.targetType === "MILESTONE_FROM_CREATION" && `Booked ${coupon.milestoneBookingsCount} times after creation`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">App Only</span>
                <span className={coupon.appOnly ? "text-green-400 font-medium" : "text-gray-400"}>{coupon.appOnly ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Usage limits</span>
                <span className="text-white font-medium text-right">
                  {coupon.maxUses ? `Max ${coupon.maxUses} total` : "No global limit"}
                  <br/>
                  {coupon.maxUsesPerUser ? `Max ${coupon.maxUsesPerUser} / member` : "No limit / member"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Times Used</span>
                <span className="text-white font-medium">{coupon.usages?.length || 0} times</span>
              </div>
              {coupon.expiryDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Expires</span>
                  <span className="text-red-400 font-medium">{new Date(coupon.expiryDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#2a2d3e] flex gap-3">
              <LinkComponent 
                href={`/coupons/${coupon.id}`}
                className="flex-1 py-2 rounded-lg text-sm font-bold text-center transition-colors bg-[#1c1f2e] text-white border border-[#2a2d3e] hover:bg-[#232738] flex items-center justify-center gap-2"
              >
                <FiBarChart2 /> View Stats
              </LinkComponent>
              <button 
                onClick={() => handleToggle(coupon.id, coupon.isActive)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${coupon.isActive ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-green-500/10 text-green-500 hover:bg-green-500/20"}`}
              >
                {coupon.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}

        {coupons.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            <FiTag className="text-4xl mx-auto mb-3 opacity-20" />
            <p>No coupons found. Create one to get started!</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-[#2a2d3e] flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Create New Coupon</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 overflow-y-auto flex flex-col gap-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Coupon Code *</label>
                  <input 
                    type="text" required value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER50"
                    className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-2 text-white uppercase placeholder-gray-600 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Target Type *</label>
                  <select 
                    value={targetType} onChange={e => setTargetType(e.target.value)}
                    className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="EVERYONE">Everyone</option>
                    <option value="SPECIFIC_MEMBERS">Specific Members</option>
                    <option value="MILESTONE_ALL_TIME">Milestone (All Time Bookings)</option>
                    <option value="MILESTONE_FROM_CREATION">Milestone (Bookings After Creation)</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex gap-2 p-1 bg-[#0f1117] rounded-lg border border-[#2a2d3e]">
                  <button type="button" onClick={() => setDiscountType("AMOUNT")} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${discountType === "AMOUNT" ? "bg-orange-500/20 text-orange-400" : "text-gray-400 hover:text-white"}`}>Flat Amount (₹)</button>
                  <button type="button" onClick={() => setDiscountType("PERCENTAGE")} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${discountType === "PERCENTAGE" ? "bg-orange-500/20 text-orange-400" : "text-gray-400 hover:text-white"}`}>Percentage (%)</button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">{discountType === "AMOUNT" ? "Discount Amount (₹) *" : "Discount Percentage (%) *"}</label>
                  <input type="number" required min="1" value={discountValue} onChange={e => setDiscountValue(e.target.value)} className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none" />
                </div>

                {discountType === "PERCENTAGE" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Max Discount Amount (₹)</label>
                    <input type="number" min="1" value={maxDiscount} onChange={e => setMaxDiscount(e.target.value)} placeholder="Leave blank for no limit" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Max Global Uses</label>
                  <input type="number" min="1" value={maxUses} onChange={e => setMaxUses(e.target.value)} placeholder="e.g. 100 for first 100 users" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Max Uses per Phone Number</label>
                  <input type="number" min="1" value={maxUsesPerUser} onChange={e => setMaxUsesPerUser(e.target.value)} placeholder="e.g. 1 for single-use" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Expiry Date</label>
                  <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none" />
                </div>

                {targetType.startsWith("MILESTONE") && (
                  <div className="md:col-span-2 bg-[#1c1f2e] p-4 rounded-xl border border-[#2a2d3e]">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Number of Bookings Required *</label>
                    <input type="number" required min="1" value={milestoneCount} onChange={e => setMilestoneCount(e.target.value)} placeholder="e.g. 10" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none" />
                  </div>
                )}

                {targetType === "SPECIFIC_MEMBERS" && (
                  <div className="md:col-span-2 bg-[#1c1f2e] p-4 rounded-xl border border-[#2a2d3e]">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Assign to Members *</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedMembers.map(m => (
                        <div key={m.id} className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          {m.name} <button type="button" onClick={() => setSelectedMembers(prev => prev.filter(sm => sm.id !== m.id))}><FiX /></button>
                        </div>
                      ))}
                    </div>
                    <div className="relative mb-2">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type="text" placeholder="Search members to assign..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg pl-10 pr-4 py-2 text-white focus:border-orange-500 focus:outline-none" />
                    </div>
                    {memberSearch && filteredMembers.length > 0 && (
                      <div className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg overflow-hidden">
                        {filteredMembers.map(m => (
                          <button key={m.id} type="button" onClick={() => { setSelectedMembers(prev => [...prev, m]); setMemberSearch(""); }} className="w-full text-left px-4 py-2 text-white hover:bg-[#1c1f2e] border-b border-[#2a2d3e] last:border-0">
                            {m.name} <span className="text-gray-500 text-xs ml-2">{m.mobile}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-[#2a2d3e] rounded-lg bg-[#1c1f2e] hover:bg-[#232738] transition-colors">
                    <input type="checkbox" checked={appOnly} onChange={e => setAppOnly(e.target.checked)} className="w-5 h-5 accent-orange-500 rounded focus:ring-orange-500" />
                    <div>
                      <div className="text-white font-medium">App-Only Coupon</div>
                      <div className="text-xs text-gray-400">Coupon can only be redeemed through the mobile app.</div>
                    </div>
                  </label>
                </div>
                
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-[#2a2d3e] rounded-lg bg-[#1c1f2e] hover:bg-[#232738] transition-colors">
                    <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="w-5 h-5 accent-orange-500 rounded focus:ring-orange-500" />
                    <div>
                      <div className="text-white font-medium">Public Visibility</div>
                      <div className="text-xs text-gray-400">If checked, this coupon will be shown to everyone in the app. If unchecked, it remains private.</div>
                    </div>
                  </label>
                </div>

              </div>

              <div className="mt-4 border-t border-[#2a2d3e] pt-6 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-lg font-bold transition-colors disabled:opacity-50">
                  {isSubmitting ? "Creating..." : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
