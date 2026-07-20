"use client";

import { useState } from "react";
import { FiSearch, FiCreditCard, FiArrowUpCircle, FiArrowDownCircle, FiPlus, FiX } from "react-icons/fi";
import { addWalletTransaction } from "./actions";

export default function WalletsClient({ initialMembers }: { initialMembers: any[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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

    setIsSubmitting(true);
    try {
      await addWalletTransaction({
        memberId: selectedMember.id,
        amount: Number(amount),
        type,
        description
      });
      
      // Update local state for immediate feedback
      const numAmount = Number(amount);
      const newTransaction = {
        id: Math.random().toString(),
        amount: numAmount,
        type,
        description,
        createdAt: new Date().toISOString()
      };
      
      setMembers(prev => prev.map(m => {
        if (m.id === selectedMember.id) {
          const newBalance = type === "CREDIT" ? m.walletBalance + numAmount : m.walletBalance - numAmount;
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
        walletBalance: type === "CREDIT" ? prev.walletBalance + numAmount : prev.walletBalance - numAmount,
        walletTransactions: [newTransaction, ...prev.walletTransactions]
      }));

      setAmount("");
      setDescription("");
      setType("CREDIT");
    } catch (err: any) {
      setError(err.message || "Failed to process transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FiCreditCard className="text-orange-500" />
            Member Wallets
          </h1>
          <p className="text-gray-400 mt-1">Manage wallet balances and add credits.</p>
        </div>
      </div>

      <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl overflow-hidden flex flex-col md:flex-row shadow-lg">
        {/* Left Side: Member List */}
        <div className="w-full md:w-1/3 border-r border-[#2a2d3e] flex flex-col h-[700px]">
          <div className="p-4 border-b border-[#2a2d3e]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search member by name or mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0f1117] border border-[#2a2d3e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {filteredMembers.map(member => (
              <button
                key={member.id}
                onClick={() => {
                  setSelectedMember(member);
                  setError("");
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${selectedMember?.id === member.id ? 'bg-orange-500/10 border border-orange-500/20' : 'hover:bg-[#1c1f2e] border border-transparent'}`}
              >
                <div>
                  <div className={`font-semibold ${selectedMember?.id === member.id ? 'text-orange-400' : 'text-white'}`}>{member.name}</div>
                  <div className="text-xs text-gray-400">{member.mobile}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">₹{member.walletBalance.toFixed(2)}</div>
                </div>
              </button>
            ))}
            {filteredMembers.length === 0 && (
              <div className="text-center p-8 text-gray-500 text-sm">
                No members found.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Wallet Details & Actions */}
        <div className="w-full md:w-2/3 flex flex-col h-[700px] bg-[#0f1117]/30">
          {selectedMember ? (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-6 border-b border-[#2a2d3e] bg-[#161923] flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedMember.name}</h2>
                  <p className="text-sm text-gray-400">{selectedMember.mobile}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Current Balance</div>
                  <div className="text-3xl font-black text-green-400">₹{selectedMember.walletBalance.toFixed(2)}</div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
                
                {/* Transaction Form */}
                <div className="w-full lg:w-1/2 flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-white mb-2">New Transaction</h3>
                  <form onSubmit={handleTransaction} className="bg-[#1c1f2e] p-5 rounded-xl border border-[#2a2d3e] flex flex-col gap-4">
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}
                    
                    <div className="flex gap-2 p-1 bg-[#0f1117] rounded-lg border border-[#2a2d3e]">
                      <button 
                        type="button" 
                        onClick={() => setType("CREDIT")}
                        className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-colors ${type === "CREDIT" ? "bg-green-500/20 text-green-400" : "text-gray-400 hover:text-white"}`}
                      >
                        <FiArrowUpCircle /> Add Credit
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setType("DEBIT")}
                        className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-colors ${type === "DEBIT" ? "bg-red-500/20 text-red-400" : "text-gray-400 hover:text-white"}`}
                      >
                        <FiArrowDownCircle /> Deduct Balance
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Amount (₹)</label>
                      <input 
                        type="number"
                        required
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                        placeholder="Enter amount"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Description / Reason</label>
                      <input 
                        type="text"
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                        placeholder="e.g. Cash deposit, Refund, etc."
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className={`w-full py-3 rounded-lg font-bold text-white flex justify-center items-center gap-2 mt-2 transition-colors ${type === "CREDIT" ? "bg-green-600 hover:bg-green-500" : "bg-red-600 hover:bg-red-500"} ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {isSubmitting ? "Processing..." : type === "CREDIT" ? "Confirm Add Credit" : "Confirm Deduction"}
                    </button>
                  </form>
                </div>

                {/* History */}
                <div className="w-full lg:w-1/2 flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-white mb-2">Recent Transactions</h3>
                  <div className="bg-[#1c1f2e] rounded-xl border border-[#2a2d3e] overflow-hidden flex-1">
                    {selectedMember.walletTransactions?.length > 0 ? (
                      <div className="divide-y divide-[#2a2d3e]">
                        {selectedMember.walletTransactions.map((tx: any) => (
                          <div key={tx.id} className="p-4 flex justify-between items-center">
                            <div>
                              <div className="text-white text-sm font-medium">{tx.description || "No description"}</div>
                              <div className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString('en-IN')}</div>
                            </div>
                            <div className={`font-bold ${tx.type === "CREDIT" ? "text-green-400" : "text-red-400"}`}>
                              {tx.type === "CREDIT" ? "+" : "-"}₹{tx.amount.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500 text-sm">
                        No transactions found for this member.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
              <FiCreditCard className="text-6xl mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a member</p>
              <p className="text-sm">Choose a member from the list to view their wallet details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
