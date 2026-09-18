"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useNfc } from "@/components/nfc/NfcProvider";
import { useAlert } from "@/components/AlertProvider";
import { lookupCardOwner, creditWallet, deductWallet } from "./actions";
import { FiCreditCard, FiPlus, FiMinus, FiRefreshCw, FiUser, FiPhone, FiDollarSign } from "react-icons/fi";
import {
  Card,
  Button,
  PageHeader,
  Input,
} from "@/components/admin/ui";

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

  // Hardware NFC Listener (Preserved intact)
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
      <Card variant="default" padding="lg" className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center p-8 shadow-sv-xl m-6">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-sv-brand-subtle blur-xl rounded-full animate-pulse" />
          <div className="relative bg-sv-surface-raised p-6 rounded-full border border-[#2a2d3e] border-sv-brand/30">
            {isScanning ? (
              <FiRefreshCw size={48} className="text-sv-brand animate-spin" />
            ) : (
              <FiCreditCard size={48} className="text-sv-brand animate-bounce" />
            )}
          </div>
        </div>
        <h2 className="text-3xl font-bold font-sans text-sv-text mb-4">
          {isScanning ? "Looking up Card..." : "Tap Card to Manage Wallet"}
        </h2>
        <p className="text-sv-text-muted max-w-md text-sm leading-relaxed">
          Place the member&apos;s NFC card on the reader to view their details, credit funds, or make a deduction.
        </p>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Wallet Management"
        subtitle="Manage contactless balance, credit funds, and make counter deductions."
        actions={
          <Button
            onClick={resetState}
            variant="secondary"
            leftIcon={<FiRefreshCw size={16} />}
          >
            Scan Another Card
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Member Details */}
        <Card variant="default" padding="lg" className="col-span-1 space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-sv-brand-subtle p-3.5 rounded-sv-md border border-[#2a2d3e] border-sv-brand/20">
              <FiUser size={24} className="text-sv-brand" />
            </div>
            <div className="truncate">
              <p className="text-xs text-sv-text-muted uppercase tracking-wider font-semibold">Member</p>
              <h3 className="text-lg font-bold text-sv-text truncate">{member.name}</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-sv-info-subtle p-3.5 rounded-sv-md border border-[#2a2d3e] border-sv-info-border border-[#2a2d3e]">
              <FiPhone size={24} className="text-sv-status-info" />
            </div>
            <div className="truncate">
              <p className="text-xs text-sv-text-muted uppercase tracking-wider font-semibold">Phone</p>
              <h3 className="text-lg font-bold text-sv-text">{member.mobile}</h3>
            </div>
          </div>

          <div className="pt-6 border-t border-sv-border-subtle">
            <div className="bg-sv-success-subtle rounded-sv-md p-5 border border-[#2a2d3e] border-sv-success-border border-[#2a2d3e] text-center">
              <p className="text-xs text-sv-success-text uppercase tracking-wider font-semibold mb-2">Current Balance</p>
              <div className="text-3xl font-extrabold text-sv-status-success flex items-center justify-center gap-1">
                <FiDollarSign size={24} />
                {member.walletBalance.toFixed(2)}
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column: Actions Form */}
        <Card variant="default" padding="lg" className="col-span-1 md:col-span-2">
          {/* Tabs */}
          <div className="flex bg-sv-surface-raised p-1 rounded-sv-md mb-8">
            <button
              onClick={() => setActiveTab("CREDIT")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sv-sm text-sm font-semibold transition-all ${
                activeTab === "CREDIT"
                  ? "bg-sv-brand text-sv-brand-foreground shadow-sv-sm"
                  : "text-sv-text-muted hover:text-sv-text hover:bg-sv-surface-hover"
              }`}
            >
              <FiPlus size={16} /> Credit Funds
            </button>
            <button
              onClick={() => setActiveTab("DEDUCT")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sv-sm text-sm font-semibold transition-all ${
                activeTab === "DEDUCT"
                  ? "bg-sv-status-error text-white shadow-sv-sm"
                  : "text-sv-text-muted hover:text-sv-text hover:bg-sv-surface-hover"
              }`}
            >
              <FiMinus size={16} /> Deduct Funds
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Amount (₹)"
              type="number"
              min="1"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || "")}
              disabled={isPending}
              placeholder="0.00"
            />

            <Input
              label="Description / Reason"
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              placeholder={activeTab === "CREDIT" ? "e.g., Cash top-up at desk" : "e.g., Canteen purchase"}
            />

            <Button
              type="submit"
              disabled={isPending || !amount || !description}
              isLoading={isPending}
              variant={activeTab === "CREDIT" ? "primary" : "danger"}
              className="w-full py-3 text-base"
              leftIcon={activeTab === "CREDIT" ? <FiPlus size={18} /> : <FiMinus size={18} />}
            >
              {activeTab === "CREDIT" ? "Confirm Credit" : "Confirm Deduction"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
