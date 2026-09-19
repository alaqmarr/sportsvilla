"use client";

import { useState } from "react";
import { formatIST } from "@/core/utils/dateUtils";
import { FiTag, FiPlus, FiX, FiSearch, FiBarChart2, FiEyeOff } from "react-icons/fi";
import { createCoupon, toggleCouponStatus } from "@/modules/coupons/coupons.action";
import Link from "next/link";
import toast from "react-hot-toast";
import { PageHeader, Card, Badge, Button, Modal, Input, Select, EmptyState } from "@/components/admin/ui";

export default function CouponsClient({ initialCoupons, members }: { initialCoupons: any[], members: any[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setError] = useState("");

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
  
  // Advanced Features
  const [type, setType] = useState<"DISCOUNT" | "CASHBACK">("DISCOUNT");
  const [validSportIds, setValidSportIds] = useState<string[]>([]);
  const [rewardCouponId, setRewardCouponId] = useState("");
  
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
    setType("DISCOUNT");
    setValidSportIds([]);
    setRewardCouponId("");
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
        type,
        discountAmount: type === "DISCOUNT" && discountType === "AMOUNT" ? Number(discountValue) : null,
        discountPercentage: type === "DISCOUNT" && discountType === "PERCENTAGE" ? Number(discountValue) : null,
        cashbackAmount: type === "CASHBACK" && discountType === "AMOUNT" ? Number(discountValue) : null,
        cashbackPercentage: type === "CASHBACK" && discountType === "PERCENTAGE" ? Number(discountValue) : null,
        validSportIds: validSportIds.length > 0 ? JSON.stringify(validSportIds) : null,
        rewardCouponId: rewardCouponId || null,
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
    <div className="space-y-6 pb-20 font-sans max-w-7xl mx-auto w-full">
      <PageHeader
        title="Coupons"
        subtitle="Manage promotional codes and targeted discounts."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Coupons" },
        ]}
        actions={
          <Button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            leftIcon={<FiPlus />}
            variant="primary"
          >
            Create Coupon
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <Card key={coupon.id} variant="default" className="p-5 flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="text-2xl font-black text-sv-text tracking-widest bg-sv-surface-raised px-3 py-1 rounded-sv-sm border border-[#2a2d3e] border-sv-border border-[#2a2d3e]">
                  {coupon.code}
                </div>
                <div className="flex items-center gap-1.5">
                  {!coupon.isPublic && (
                    <Badge variant="info" size="sm">
                      <FiEyeOff className="mr-1 inline" /> PRIVATE
                    </Badge>
                  )}
                  <Badge variant={coupon.isActive ? "success" : "error"} size="sm">
                    {coupon.isActive ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </div>
              </div>

              <div className="text-3xl font-black text-sv-brand mb-4">
                {coupon.type === 'CASHBACK' 
                  ? (coupon.cashbackAmount ? `₹${coupon.cashbackAmount} CASHBACK` : `${coupon.cashbackPercentage}% CASHBACK`)
                  : (coupon.discountAmount ? `₹${coupon.discountAmount} OFF` : `${coupon.discountPercentage}% OFF`)}
                {coupon.maxDiscount && (
                  <span className="text-xs text-sv-text-muted font-medium ml-2 block uppercase">
                    Up to ₹{coupon.maxDiscount}
                  </span>
                )}
                {coupon.rewardCouponId && (
                  <span className="text-xs text-sv-status-success font-medium ml-2 block uppercase mt-1">
                    🎁 Chains Reward Coupon
                  </span>
                )}
                {coupon.validSportIds && (
                  <span className="text-xs text-sv-status-info font-medium ml-2 block uppercase mt-1">
                    🎯 Sport Restricted
                  </span>
                )}
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-sv-text-muted">Target</span>
                  <span className="text-sv-text font-medium text-right">
                    {coupon.targetType === "EVERYONE" && "Everyone"}
                    {coupon.targetType === "SPECIFIC_MEMBERS" && `${coupon.assignments?.length || 0} Members`}
                    {coupon.targetType === "MILESTONE_ALL_TIME" && `Completed ${coupon.milestoneBookingsCount} bookings`}
                    {coupon.targetType === "MILESTONE_FROM_CREATION" && `Booked ${coupon.milestoneBookingsCount} times after creation`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sv-text-muted">App Only</span>
                  <span className={coupon.appOnly ? "text-sv-status-success font-medium" : "text-sv-text-muted"}>
                    {coupon.appOnly ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sv-text-muted">Usage limits</span>
                  <span className="text-sv-text font-medium text-right">
                    {coupon.maxUses ? `Max ${coupon.maxUses} total` : "No global limit"}
                    <br/>
                    {coupon.maxUsesPerUser ? `Max ${coupon.maxUsesPerUser} / member` : "No limit / member"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sv-text-muted">Times Used</span>
                  <span className="text-sv-text font-medium">{coupon.usages?.length || 0} times</span>
                </div>
                {coupon.expiryDate && (
                  <div className="flex justify-between">
                    <span className="text-sv-text-muted">Expires</span>
                    <span className="text-sv-status-error font-medium">{formatIST(new Date(coupon.expiryDate), 'dd MMM yyyy')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-sv-border-subtle flex gap-3">
              <Link 
                href={`/coupons/${coupon.id}`}
                className="flex-1"
              >
                <Button variant="secondary" leftIcon={<FiBarChart2 />} className="w-full">
                  View Stats
                </Button>
              </Link>
              <Button 
                variant={coupon.isActive ? "danger" : "primary"}
                onClick={() => handleToggle(coupon.id, coupon.isActive)}
                className="flex-1"
              >
                {coupon.isActive ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </Card>
        ))}

        {coupons.length === 0 && (
          <div className="col-span-full py-12">
            <EmptyState
              icon={<FiTag />}
              title="No coupons found"
              description="No promotional coupons have been created yet. Create one to get started!"
            />
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Coupon"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Coupon Code *"
              type="text"
              required
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SUMMER50"
              className="uppercase"
            />

            <Select
              label="Target Type *"
              value={targetType}
              onChange={e => setTargetType(e.target.value)}
              options={[
                { label: "Everyone", value: "EVERYONE" },
                { label: "Specific Members", value: "SPECIFIC_MEMBERS" },
                { label: "Milestone (All Time Bookings)", value: "MILESTONE_ALL_TIME" },
                { label: "Milestone (Bookings After Creation)", value: "MILESTONE_FROM_CREATION" },
              ]}
            />

            <div className="md:col-span-2 flex gap-2 p-1 bg-sv-surface-raised rounded-sv-md border border-[#2a2d3e] border-sv-border border-[#2a2d3e]">
              <button
                type="button"
                onClick={() => setDiscountType("AMOUNT")}
                className={`flex-1 py-2 text-sm font-semibold rounded-sv-sm transition-colors ${
                  discountType === "AMOUNT"
                    ? "bg-sv-brand text-sv-brand-foreground shadow-sv-sm"
                    : "text-sv-text-muted hover:text-sv-text"
                }`}
              >
                Flat Amount (₹)
              </button>
              <button
                type="button"
                onClick={() => setDiscountType("PERCENTAGE")}
                className={`flex-1 py-2 text-sm font-semibold rounded-sv-sm transition-colors ${
                  discountType === "PERCENTAGE"
                    ? "bg-sv-brand text-sv-brand-foreground shadow-sv-sm"
                    : "text-sv-text-muted hover:text-sv-text"
                }`}
              >
                Percentage (%)
              </button>
            </div>

            <Input
              label={discountType === "AMOUNT" ? "Discount Amount (₹) *" : "Discount Percentage (%) *"}
              type="number"
              required
              min={1}
              value={discountValue}
              onChange={e => setDiscountValue(e.target.value)}
            />

            {discountType === "PERCENTAGE" && (
              <Input
                label="Max Discount Amount (₹)"
                type="number"
                min={1}
                value={maxDiscount}
                onChange={e => setMaxDiscount(e.target.value)}
                placeholder="Leave blank for no limit"
              />
            )}

            <Input
              label="Max Global Uses"
              type="number"
              min={1}
              value={maxUses}
              onChange={e => setMaxUses(e.target.value)}
              placeholder="e.g. 100 for first 100 users"
            />

            <Input
              label="Max Uses per Phone Number"
              type="number"
              min={1}
              value={maxUsesPerUser}
              onChange={e => setMaxUsesPerUser(e.target.value)}
              placeholder="e.g. 1 for single-use"
            />

            <Input
              label="Expiry Date"
              type="date"
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
            />

            {targetType.startsWith("MILESTONE") && (
              <div className="md:col-span-2 bg-sv-surface-raised p-4 rounded-sv-lg border border-[#2a2d3e] border-sv-border border-[#2a2d3e]">
                <Input
                  label="Number of Bookings Required *"
                  type="number"
                  required
                  min={1}
                  value={milestoneCount}
                  onChange={e => setMilestoneCount(e.target.value)}
                  placeholder="e.g. 10"
                />
              </div>
            )}

            {targetType === "SPECIFIC_MEMBERS" && (
              <div className="md:col-span-2 bg-sv-surface-raised p-4 rounded-sv-lg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] space-y-3">
                <label className="block text-xs font-semibold text-sv-text-secondary select-none">
                  Assign to Members *
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map(m => (
                    <div key={m.id} className="bg-sv-brand/10 text-sv-brand border border-[#2a2d3e] border-sv-brand/30 px-3 py-1 rounded-sv-full text-xs font-medium flex items-center gap-1.5">
                      {m.name}
                      <button type="button" onClick={() => setSelectedMembers(prev => prev.filter(sm => sm.id !== m.id))} className="hover:text-sv-text">
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <Input
                  leftIcon={<FiSearch />}
                  placeholder="Search members to assign..."
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                />
                {memberSearch && filteredMembers.length > 0 && (
                  <div className="bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-md overflow-hidden divide-y divide-sv-border-subtle">
                    {filteredMembers.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => { setSelectedMembers(prev => [...prev, m]); setMemberSearch(""); }}
                        className="w-full text-left px-4 py-2.5 text-sv-text hover:bg-sv-surface-hover flex items-center justify-between text-sm"
                      >
                        <span>{m.name}</span>
                        <span className="text-sv-text-muted text-xs">{m.mobile}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-md bg-sv-surface-raised hover:bg-sv-surface-hover transition-colors">
                <input type="checkbox" checked={appOnly} onChange={e => setAppOnly(e.target.checked)} className="w-4 h-4 rounded border-sv-border border-[#2a2d3e] bg-sv-bg text-sv-brand focus:ring-sv-brand" />
                <div>
                  <div className="text-sv-text font-medium text-sm">App-Only Coupon</div>
                  <div className="text-xs text-sv-text-muted">Coupon can only be redeemed through the mobile app.</div>
                </div>
              </label>
            </div>
            
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-md bg-sv-surface-raised hover:bg-sv-surface-hover transition-colors">
                <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="w-4 h-4 rounded border-sv-border border-[#2a2d3e] bg-sv-bg text-sv-brand focus:ring-sv-brand" />
                <div>
                  <div className="text-sv-text font-medium text-sm">Public Visibility</div>
                  <div className="text-xs text-sv-text-muted">If checked, this coupon will be shown to everyone in the app. If unchecked, it remains private.</div>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-sv-border-subtle flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Coupon"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

