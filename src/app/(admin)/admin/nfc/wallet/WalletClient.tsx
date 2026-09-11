"use client";

import { useEffect, useState, useTransition } from "react";
import { useNfc } from "@/components/nfc/NfcProvider";
import { useAlert } from "@/components/AlertProvider";
import { lookupCardOwner, creditWallet, deductWallet } from "./actions";
import { FiCreditCard, FiPlus, FiMinus, FiRefreshCw, FiUser, FiPhone, FiDollarSign } from "react-icons/fi";

type MemberDetails = {
  id: string;
  name: string;
  mobile: string;
  walletBalance: number;
};

export default function WalletClient() {
  const { subscribe } = useNfc();
  const { showAlert } = useAlert();
  const [isPending, startTransition] = useTransition();

  const [member, setMember] = useState<MemberDetails | null>(null);
  const [cardId, setCardId] = useState<string | null>(null);
  const [cardUid, setCardUid] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"CREDIT" | "DEDUCT">("CREDIT");
  const [amount, setAmount] = useState<number | "">("");
  const [description, setDescription] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribe(async (uid) => {
      setIsScanning(true);
      startTransition(async () => {
        try {
          const res = await lookupCardOwner(uid);
          if (res.success && res.member && res.cardId && res.cardUid) {
            setMember(res.member);
            setCardId(res.cardId);
            setCardUid(res.cardUid);
            setAmount("");
            setDescription("");
          } else {
            showAlert("Scan Failed", res.error || "Unknown error", "error");
            resetState();
          }
        } finally {
          setIsScanning(false);
        }
      });
    });

    return () => unsubscribe();
  }, [subscribe, showAlert]);

  const resetState = () => {
    setMember(null);
    setCardId(null);
    setCardUid(null);
    setAmount("");
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !cardUid || !cardId) return;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showAlert("Invalid Amount", "Please enter a valid positive amount.", "error");
      return;
    }

    startTransition(async () => {
      if (activeTab === "CREDIT") {
        const res = await creditWallet(member.id, numAmount, description, cardUid, cardId);
        if (res.success) {
          showAlert("Success", "Wallet credited successfully.", "success");
          // Refresh member details
          const updated = await lookupCardOwner(cardUid);
          if (updated.success && updated.member) {
            setMember(updated.member);
          }
          setAmount("");
          setDescription("");
        } else {
          showAlert("Error", (res as any).error || "Failed to credit wallet.", "error");
        }
      } else {
        const res = await deductWallet(member.id, numAmount, description, cardUid, cardId);
        if (res.success) {
          showAlert("Success", "Wallet deducted successfully.", "success");
          // Refresh member details
          const updated = await lookupCardOwner(cardUid);
          if (updated.success && updated.member) {
            setMember(updated.member);
          }
          setAmount("");
          setDescription("");
        } else {
          showAlert("Error", (res as any).error || "Failed to deduct wallet.", "error");
        }
      }
    });
  };

  if (!member) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] bg-[#161923] rounded-2xl border border-[#2a2d3e] p-8 text-center m-6 shadow-2xl">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse" />
          <div className="relative bg-[#1e2230] p-6 rounded-full border border-orange-500/30">
            {isScanning ? (
              <FiRefreshCw size={48} className="text-orange-400 animate-spin" />
            ) : (
              <FiCreditCard size={48} className="text-orange-400 animate-bounce" />
            )}
          </div>
        </div>
        <h2 className="text-3xl font-bold font-['Outfit'] text-white mb-4">
          {isScanning ? "Looking up Card..." : "Tap Card to Manage Wallet"}
        </h2>
        <p className="text-gray-400 max-w-md">
          Place the member&apos;s NFC card on the reader to view their details, credit funds, or make a deduction.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-['Outfit'] text-white">Wallet Management</h1>
        <button
          onClick={resetState}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors bg-[#1e2230] px-4 py-2 rounded-lg border border-[#2a2d3e]"
        >
          <FiRefreshCw size={16} /> Scan Another Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Member Details */}
        <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-6 shadow-xl col-span-1 space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/20">
              <FiUser size={28} className="text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-1">Member</p>
              <h3 className="text-xl font-bold text-white truncate">{member.name}</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
              <FiPhone size={28} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-1">Phone</p>
              <h3 className="text-xl font-bold text-white">{member.mobile}</h3>
            </div>
          </div>

          <div className="pt-6 border-t border-[#2a2d3e]">
            <div className="bg-emerald-500/10 rounded-xl p-5 border border-emerald-500/20 text-center">
              <p className="text-sm text-emerald-400/80 uppercase tracking-wider font-semibold mb-2">Current Balance</p>
              <div className="text-4xl font-bold text-emerald-400 flex items-center justify-center gap-1">
                <FiDollarSign size={28} />
                {member.walletBalance.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions Form */}
        <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-6 shadow-xl col-span-1 md:col-span-2">
          {/* Tabs */}
          <div className="flex bg-[#1e2230] p-1 rounded-xl mb-8">
            <button
              onClick={() => setActiveTab("CREDIT")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "CREDIT"
                  ? "bg-orange-500 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-[#2a2d3e]"
              }`}
            >
              <FiPlus size={18} /> Credit Funds
            </button>
            <button
              onClick={() => setActiveTab("DEDUCT")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "DEDUCT"
                  ? "bg-red-500 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-[#2a2d3e]"
              }`}
            >
              <FiMinus size={18} /> Deduct Funds
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Amount</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiDollarSign className="text-gray-500" size={20} />
                </div>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || "")}
                  disabled={isPending}
                  className="w-full bg-[#1e2230] border border-[#2a2d3e] rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-lg font-semibold"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Description / Reason</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
                className="w-full bg-[#1e2230] border border-[#2a2d3e] rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                placeholder={activeTab === "CREDIT" ? "e.g., Cash top-up at desk" : "e.g., Canteen purchase"}
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !amount || !description}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                activeTab === "CREDIT"
                  ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20 disabled:bg-orange-500/50"
                  : "bg-red-500 hover:bg-red-600 shadow-red-500/20 disabled:bg-red-500/50"
              } disabled:cursor-not-allowed`}
            >
              {isPending ? (
                <FiRefreshCw className="animate-spin" size={24} />
              ) : activeTab === "CREDIT" ? (
                <>
                  <FiPlus size={24} /> Confirm Credit
                </>
              ) : (
                <>
                  <FiMinus size={24} /> Confirm Deduction
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
