"use client";

import { useState } from "react";
import { FiSearch, FiCreditCard, FiArrowUpCircle, FiArrowDownCircle } from "react-icons/fi";
import { addWalletTransaction } from "./actions";
import { formatIST } from "@/lib/dateUtils";
import { PageHeader, Button, Input, EmptyState } from "@/components/admin/ui";

export default function WalletsClient({ initialMembers }: { initialMembers: any[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.mobile.includes(search)
  );

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!isOtpMode) {
      setIsSendingOtp(true);
      try {
        const res = await fetch(`/api/admin/members/${selectedMember.id}/wallet/send-otp`, {
          method: 'POST'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
        setIsOtpMode(true);
      } catch (err: any) {
        setError(err.message || 'Failed to send OTP');
      } finally {
        setIsSendingOtp(false);
      }
      return;
    }

    if (otp.length < 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addWalletTransaction({
        memberId: selectedMember.id,
        amount: Number(amount),
        type,
        description,
        otp
      });
      
      const numAmount = Number(amount);
      const amountInPaise = numAmount * 100;
      const newTransaction = {
        id: Math.random().toString(),
        amount: amountInPaise,
        type,
        description,
        createdAt: new Date().toISOString()
      };
      
      setMembers(prev => prev.map(m => {
        if (m.id === selectedMember.id) {
          const newBalance = type === "CREDIT" ? m.walletBalance + amountInPaise : m.walletBalance - amountInPaise;
          return { 
            ...m, 
            walletBalance: newBalance,
            walletTransactions: [newTransaction, ...m.walletTransactions]
          };
        }
        return m;
      }));
      
      setSelectedMember((prev: any) => ({
        ...prev,
        walletBalance: type === "CREDIT" ? prev.walletBalance + amountInPaise : prev.walletBalance - amountInPaise,
        walletTransactions: [newTransaction, ...prev.walletTransactions]
      }));

      setAmount("");
      setDescription("");
      setType("CREDIT");
      setIsOtpMode(false);
      setOtp("");
    } catch (err: any) {
      setError(err.message || "Failed to process transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 font-sans max-w-7xl mx-auto w-full">
      <PageHeader
        title="Member Wallets"
        subtitle="Manage wallet balances and record credits or deductions."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Wallets" },
        ]}
      />

      <div className="bg-sv-surface border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-xl overflow-hidden flex flex-col md:flex-row shadow-sv-sm">
        {/* Left Side: Member List */}
        <div className="w-full md:w-1/3 border-r border-sv-border border-[#2a2d3e] flex flex-col h-[700px] bg-sv-surface">
          <div className="p-4 border-b border-sv-border border-[#2a2d3e]">
            <Input
              leftIcon={<FiSearch />}
              placeholder="Search member by name or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto flex-1 py-2 divide-y divide-sv-border-subtle">
            {filteredMembers.map(member => (
              <button
                key={member.id}
                onClick={() => {
                  setSelectedMember(member);
                  setError("");
                }}
                className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors text-left border-l-2 ${
                  selectedMember?.id === member.id
                    ? 'bg-sv-brand/10 border-sv-brand'
                    : 'border-transparent hover:bg-sv-surface-hover'
                }`}
              >
                <div>
                  <div className={`font-medium ${selectedMember?.id === member.id ? 'text-sv-brand' : 'text-sv-text'}`}>
                    {member.name}
                  </div>
                  <div className="text-xs text-sv-text-muted mt-0.5">{member.mobile}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-sv-text">₹{(member.walletBalance / 100).toFixed(2)}</div>
                </div>
              </button>
            ))}
            {filteredMembers.length === 0 && (
              <div className="text-center p-8 text-sv-text-muted text-sm">
                No members found.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Wallet Details & Actions */}
        <div className="w-full md:w-2/3 flex flex-col h-[700px] bg-sv-surface">
          {selectedMember ? (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="px-8 py-6 border-b border-sv-border border-[#2a2d3e] flex justify-between items-center bg-sv-surface">
                <div>
                  <h2 className="text-xl font-bold text-sv-text">{selectedMember.name}</h2>
                  <p className="text-sm text-sv-text-secondary mt-1">{selectedMember.mobile}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-sv-text-muted uppercase tracking-wider mb-1 font-semibold">Current Balance</div>
                  <div className="text-3xl font-black text-sv-status-success">₹{(selectedMember.walletBalance / 100).toFixed(2)}</div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 flex flex-col lg:flex-row gap-8">
                {/* Transaction Form */}
                <div className="w-full lg:w-1/2 flex flex-col">
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-sv-text-secondary mb-4">
                    {isOtpMode ? "Verification Required" : "New Transaction"}
                  </h3>
                  <form onSubmit={handleTransaction} className="flex flex-col gap-4">
                    {error && (
                      <div className="bg-sv-error-subtle border border-[#2a2d3e] border-sv-error-border border-[#2a2d3e] text-sv-error-text p-3 rounded-sv-md text-sm">
                        {error}
                      </div>
                    )}
                    
                    {!isOtpMode ? (
                      <>
                        <div className="flex gap-2 p-1 bg-sv-surface-raised rounded-sv-md border border-[#2a2d3e] border-sv-border border-[#2a2d3e]">
                          <button 
                            type="button" 
                            onClick={() => setType("CREDIT")}
                            className={`flex-1 py-2 text-sm font-semibold rounded-sv-sm flex items-center justify-center gap-2 transition-colors ${
                              type === "CREDIT"
                                ? "bg-sv-success-subtle text-sv-success-text border border-[#2a2d3e] border-sv-success-border border-[#2a2d3e]"
                                : "text-sv-text-muted hover:text-sv-text"
                            }`}
                          >
                            <FiArrowUpCircle /> Add Credit
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setType("DEBIT")}
                            className={`flex-1 py-2 text-sm font-semibold rounded-sv-sm flex items-center justify-center gap-2 transition-colors ${
                              type === "DEBIT"
                                ? "bg-sv-error-subtle text-sv-error-text border border-[#2a2d3e] border-sv-error-border border-[#2a2d3e]"
                                : "text-sv-text-muted hover:text-sv-text"
                            }`}
                          >
                            <FiArrowDownCircle /> Deduct
                          </button>
                        </div>

                        <Input
                          label="Amount (₹)"
                          type="number"
                          required
                          min="1"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="Enter amount"
                        />

                        <Input
                          label="Description / Reason"
                          type="text"
                          required
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="e.g. Cash deposit, Refund, etc."
                        />

                        <Button
                          type="submit"
                          variant={type === "CREDIT" ? "primary" : "danger"}
                          isLoading={isSendingOtp}
                          className="w-full mt-2"
                        >
                          {isSendingOtp ? "Sending OTP..." : type === "CREDIT" ? "Confirm Add Credit" : "Confirm Deduction"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-sv-text-secondary bg-sv-surface-raised p-4 rounded-sv-md border border-[#2a2d3e] border-sv-border border-[#2a2d3e] leading-relaxed">
                          We've sent a 6-digit OTP to the user's WhatsApp number <strong className="text-sv-text">{selectedMember.mobile}</strong>. Please ask them for the code to authorize this transaction of <strong className="text-sv-text">₹{amount}</strong> ({type}).
                        </div>
                        
                        <Input
                          label="Enter OTP"
                          type="text"
                          required
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="------"
                          className="text-center text-2xl tracking-[0.5em] font-bold"
                        />

                        <div className="flex gap-3 mt-2">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => { setIsOtpMode(false); setOtp(""); }}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="primary"
                            isLoading={isSubmitting}
                            disabled={isSubmitting || otp.length < 6}
                            className="flex-1"
                          >
                            {isSubmitting ? "Verifying..." : "Verify & Submit"}
                          </Button>
                        </div>
                      </>
                    )}
                  </form>
                </div>

                {/* History */}
                <div className="w-full lg:w-1/2 flex flex-col">
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-sv-text-secondary mb-4">
                    Recent Transactions
                  </h3>
                  <div className="bg-sv-surface-raised rounded-sv-lg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] flex-1 overflow-y-auto">
                    {selectedMember.walletTransactions?.length > 0 ? (
                      <div className="divide-y divide-sv-border-subtle">
                        {selectedMember.walletTransactions.map((tx: any) => (
                          <div key={tx.id} className="p-3.5 flex justify-between items-center hover:bg-sv-surface-hover transition-colors">
                            <div>
                              <div className="text-sv-text text-sm font-medium">{tx.description || "No description"}</div>
                              <div className="text-xs text-sv-text-muted mt-0.5">{formatIST(tx.createdAt, "dd MMM yyyy, hh:mm a")}</div>
                            </div>
                            <div className={`font-bold ${tx.type === "CREDIT" ? "text-sv-status-success" : "text-sv-status-error"}`}>
                              {tx.type === "CREDIT" ? "+" : "-"}₹{(tx.amount / 100).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={<FiCreditCard />}
                        title="No transactions found"
                        description="No wallet transactions recorded for this member."
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-sv-surface">
              <EmptyState
                icon={<FiCreditCard />}
                title="Select a member"
                description="Choose a member from the list to view their wallet details and add transactions."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
