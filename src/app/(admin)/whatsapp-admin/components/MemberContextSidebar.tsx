import React from "react";
import { FiUser, FiAlertCircle, FiPlus, FiGift, FiAward } from "react-icons/fi";
import { Card, Badge, Button } from "@/components/admin/ui";

export function MemberContextSidebar({
  selectedPhone,
  loadingMemberContext,
  memberContext,
  setChatInput,
  onOpenGenerateCoupon,
  onOpenAssignMembership,
  onOpenRegisterUser,
}: {
  selectedPhone: string | null;
  loadingMemberContext: boolean;
  memberContext: any;
  setChatInput: (text: string) => void;
  onOpenGenerateCoupon: () => void;
  onOpenAssignMembership: () => void;
  onOpenRegisterUser: () => void;
}) {
  return (
    <aside className="w-80 border-l border-sv-border bg-sv-surface flex flex-col shrink-0 h-full overflow-y-auto styled-scrollbar">
      <div className="p-4 border-b border-sv-border sticky top-0 bg-sv-surface z-10 flex flex-col gap-3">
        <h2 className="text-sm font-extrabold text-sv-text flex items-center justify-between">
          <span className="flex items-center gap-2"><FiUser className="text-sv-text-muted" /> Customer CRM</span>
          {!memberContext?.found && selectedPhone && (
            <Button variant="outline" size="sm" onClick={onOpenRegisterUser} className="h-6 text-[10px] px-2 py-0">
              <FiPlus className="mr-1" /> Register
            </Button>
          )}
        </h2>
        {memberContext?.found && selectedPhone && (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-2 w-full">
              <button
                type="button"
                onClick={() => {
                  const text =
                    `🏆 *SportsVilla Family Account Summary*\n📱 *Linked Mobile*: +91 ${selectedPhone}\n*Total Accounts*: ${memberContext.count}\n\n` +
                    memberContext.members
                      .map((m: any, idx: number) => {
                        const plan = m.memberships?.find((mp: any) => mp.status === "ACTIVE");
                        return `${idx + 1}. *${m.name}* - Wallet: ₹${((m.walletBalance || 0) / 100).toFixed(0)} | Loyalty: ⭐ ${m.loyaltyPoints || 0} pts${
                          plan ? ` | Plan: ${plan.membershipPlan?.name || "Active"}` : ""
                        }`;
                      })
                      .join("\n") +
                    `\n\nReply to this message if you need to book a turf or manage your memberships! 🏅`;
                  setChatInput(text);
                }}
                className="flex-1 bg-sv-bg hover:bg-sv-brand/10 hover:text-sv-brand hover:border-sv-brand/30 border border-sv-border text-[10px] font-bold text-sv-text py-1.5 px-2 rounded-sv-md flex items-center justify-center gap-1 transition-all"
                title="Share full summary of all linked family accounts"
              >
                Share Family
              </button>
              <button
                type="button"
                onClick={() => {
                  const text = `🔗 *Add a Family Member to SportsVilla*\nHello! You can register a family member or friend under your phone number anytime using our official portal:\n\n🌐 *Register Online*: https://sportsvilla.co.in/register?mobile=${selectedPhone}\n\nWe look forward to seeing you all on the field! 🏆`;
                  setChatInput(text);
                }}
                className="flex-1 bg-sv-bg hover:bg-sv-brand/10 hover:text-sv-brand hover:border-sv-brand/30 border border-sv-border text-[10px] font-bold text-sv-text py-1.5 px-2 rounded-sv-md flex items-center justify-center gap-1 transition-all"
                title="Send sign-up/registration link to add another family member"
              >
                Add Member
              </button>
            </div>
            <div className="flex gap-2 w-full">
              <button
                type="button"
                onClick={onOpenGenerateCoupon}
                className="flex-1 bg-sv-bg hover:bg-sv-info/10 hover:text-sv-info hover:border-sv-info/30 border border-sv-border text-[10px] font-bold text-sv-text py-1.5 px-2 rounded-sv-md flex items-center justify-center gap-1 transition-all"
                title="Generate custom discount coupon"
              >
                <FiGift /> Coupon
              </button>
              <button
                type="button"
                onClick={onOpenAssignMembership}
                className="flex-1 bg-sv-bg hover:bg-sv-status-success/10 hover:text-sv-status-success hover:border-sv-status-success/30 border border-sv-border text-[10px] font-bold text-sv-text py-1.5 px-2 rounded-sv-md flex items-center justify-center gap-1 transition-all"
                title="Assign active membership"
              >
                <FiAward /> Membership
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-6">
        {!selectedPhone ? (
          <p className="text-xs text-sv-text-muted text-center py-8">Select a conversation</p>
        ) : loadingMemberContext ? (
          <div className="space-y-4 animate-pulse">
             <div className="h-24 bg-sv-bg rounded-sv-md"></div>
             <div className="h-24 bg-sv-bg rounded-sv-md"></div>
          </div>
        ) : memberContext?.found ? (
          memberContext.members.map((member: any, i: number) => {
            const activePlan = member.memberships?.find((m: any) => m.status === "ACTIVE");
            return (
              <Card key={i} variant="default" className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sv-text text-sm">{member.name}</h3>
                    <p className="text-xs text-sv-text-muted mt-0.5">+91 {member.mobile}</p>
                  </div>
                  <Badge variant="neutral" size="sm">
                    {new Date(member.joinDate || member.createdAt).getFullYear()}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-sv-bg rounded-sv-sm p-2 text-center border border-sv-border">
                    <p className="text-[10px] text-sv-text-muted font-semibold uppercase tracking-wider mb-0.5">Wallet</p>
                    <p className="text-sm font-bold text-sv-status-success">
                      ₹{((member.walletBalance || 0) / 100).toFixed(0)}
                    </p>
                  </div>
                  <div className="bg-sv-bg rounded-sv-sm p-2 text-center border border-sv-border">
                    <p className="text-[10px] text-sv-text-muted font-semibold uppercase tracking-wider mb-0.5">Loyalty</p>
                    <p className="text-sm font-bold text-sv-brand">
                      {member.loyaltyPoints || 0} pts
                    </p>
                  </div>
                </div>

                {activePlan && (
                  <div className="pt-2 border-t border-sv-border">
                    <p className="text-[10px] font-bold text-sv-text-muted uppercase tracking-wider mb-1">
                      Membership Status
                    </p>
                    <div className="bg-sv-bg border border-sv-brand/30 rounded-sv-md p-2 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-sv-text">
                          {activePlan.membershipPlan?.name || "Member Plan"}
                        </p>
                        <p className="text-[10px] text-sv-text-muted">
                          Valid until {new Date(activePlan.endDate).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <Badge variant="success" size="sm">ACTIVE</Badge>
                    </div>
                  </div>
                )}

                {member.activeBookings?.length > 0 && (
                  <div className="pt-2 border-t border-sv-border">
                    <p className="text-[10px] font-semibold text-sv-text-muted uppercase tracking-wider mb-2">Upcoming Bookings</p>
                    <div className="space-y-2">
                      {member.activeBookings.slice(0, 3).map((b: any, bIdx: number) => (
                        <div key={bIdx} className="text-[11px] bg-sv-bg border border-sv-border p-2 rounded-sv-sm flex justify-between items-center">
                          <span className="font-medium text-sv-text">{b.turf?.name || "Turf Booking"}</span>
                          <span className="text-sv-text-muted">{new Date(b.startTime).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <div className="text-center p-6 bg-sv-bg border border-sv-border border-dashed rounded-sv-md">
            <FiAlertCircle className="w-8 h-8 text-sv-text-muted mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-sv-text">Unregistered User</p>
            <p className="text-xs text-sv-text-muted mt-1 mb-4">This number is not registered in the app database.</p>
            <Button variant="outline" size="sm" onClick={onOpenRegisterUser}>
              Register Now
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
