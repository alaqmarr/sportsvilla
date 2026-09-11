"use client";

import { useState, useEffect, useRef } from "react";
import {
  FiCreditCard,
  FiSearch,
  FiUser,
  FiCheckCircle,
  FiAlertTriangle,
  FiLock,
  FiUnlock,
  FiSlash,
  FiRefreshCw,
  FiTag,
  FiFileText,
  FiSmartphone,
  FiZap,
  FiRadio,
} from "react-icons/fi";
import {
  searchMembers,
  assignCard,
  blockCard,
  unblockCard,
  revokeCard,
  getCardInventory,
} from "./actions";
import { playNfcSound } from "@/lib/soundUtils";
import { useAlert } from "@/components/AlertProvider";
import { useNfc } from "@/components/nfc/NfcProvider";
import { formatIST } from "@/lib/dateUtils";

interface MemberResult {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  walletBalance: number;
  nfcCards?: Array<{
    id: string;
    cardUid: string;
    cardId?: string | null;
    status: string;
    issuedAt: Date | string;
  }>;
}

export default function AssignClient({ initialCards }: { initialCards: any[] }) {
  const { showAlert, showConfirm } = useAlert();

  // Inventory state
  const [cards, setCards] = useState<any[]>(initialCards);
  const [inventorySearch, setInventorySearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Form state
  const [memberQuery, setMemberQuery] = useState("");
  const [memberResults, setMemberResults] = useState<MemberResult[]>([]);
  const [isSearchingMembers, setIsSearchingMembers] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberResult | null>(null);

  const [cardUid, setCardUid] = useState("");
  const [cardLabel, setCardLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardUidInputRef = useRef<HTMLInputElement>(null);

  // Member search effect with debounce
  useEffect(() => {
    if (selectedMember) return;
    if (!memberQuery || memberQuery.trim().length < 2) {
      setMemberResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingMembers(true);
      try {
        const results = await searchMembers(memberQuery);
        setMemberResults(results as MemberResult[]);
      } catch (err) {
        console.error("Member search error:", err);
      } finally {
        setIsSearchingMembers(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [memberQuery, selectedMember]);

  // Normalize card UID on change
  const handleCardUidChange = (val: string) => {
    const cleaned = val.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
    setCardUid(cleaned);
  };

  const { subscribe } = useNfc();

  useEffect(() => {
    const unsubscribe = subscribe((scannedUid) => {
      setCardUid(scannedUid);
    });
    return () => unsubscribe();
  }, [subscribe]);

  // Refresh inventory
  const refreshInventory = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = await getCardInventory({
        query: inventorySearch,
        status: statusFilter,
      });
      setCards(refreshed);
    } catch (err: any) {
      showAlert("Refresh Failed", err.message || "Failed to reload cards", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle Card Assignment
  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMember) {
      playNfcSound("error");
      showAlert("Missing Member", "Please search and select a member first.", "error");
      return;
    }

    if (!cardUid || cardUid.length < 4) {
      playNfcSound("error");
      showAlert(
        "Invalid Card UID",
        "Please tap a card or enter a valid alphanumeric hex UID (min 4 chars).",
        "error"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await assignCard({
        memberId: selectedMember.id,
        cardUid,
        cardId: cardLabel.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        playNfcSound("success");
        showAlert(
          "Card Assigned",
          `Card ${cardUid} has been successfully assigned to ${selectedMember.name}.`,
          "success"
        );

        // Reset inputs
        setCardUid("");
        setCardLabel("");
        setNotes("");
        setSelectedMember(null);
        setMemberQuery("");

        // Refresh card inventory
        await refreshInventory();
      }
    } catch (err: any) {
      playNfcSound("error");
      showAlert("Assignment Failed", err.message || "Could not assign card", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Card status management actions
  const handleBlock = async (card: any) => {
    setActionLoadingId(card.id);
    try {
      await blockCard(card.id, "Blocked from Admin Inventory");
      playNfcSound("beep");
      showAlert("Card Blocked", `Card ${card.cardUid} is now BLOCKED.`, "info");
      await refreshInventory();
    } catch (err: any) {
      playNfcSound("error");
      showAlert("Error", err.message || "Failed to block card", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnblock = async (card: any) => {
    setActionLoadingId(card.id);
    try {
      await unblockCard(card.id);
      playNfcSound("success");
      showAlert("Card Unblocked", `Card ${card.cardUid} is now ACTIVE.`, "success");
      await refreshInventory();
    } catch (err: any) {
      playNfcSound("error");
      showAlert("Error", err.message || "Failed to unblock card", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRevoke = async (card: any) => {
    showConfirm(
      "Confirm Revoke",
      `Are you sure you want to unassign/revoke card ${card.cardUid}?`,
      async () => {
        setActionLoadingId(card.id);
        try {
          await revokeCard(card.id, "Revoked by admin");
          playNfcSound("beep");
          showAlert("Card Revoked", `Card ${card.cardUid} unlinked from member.`, "info");
          await refreshInventory();
        } catch (err: any) {
          playNfcSound("error");
          showAlert("Error", err.message || "Failed to revoke card", "error");
        } finally {
          setActionLoadingId(null);
        }
      },
      undefined,
      "Revoke",
      "Cancel",
      "error"
    );
  };

  // Filter inventory cards locally
  const filteredCards = cards.filter((c) => {
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const q = inventorySearch.toLowerCase().trim();
    if (!q) return matchesStatus;

    const matchesQuery =
      c.cardUid.toLowerCase().includes(q) ||
      (c.cardId && c.cardId.toLowerCase().includes(q)) ||
      (c.member?.name && c.member.name.toLowerCase().includes(q)) ||
      (c.member?.mobile && c.member.mobile.includes(q));

    return matchesStatus && matchesQuery;
  });

  // Inventory stats
  const activeCount = cards.filter((c) => c.status === "ACTIVE").length;
  const blockedCount = cards.filter((c) => c.status === "BLOCKED").length;
  const unassignedCount = cards.filter((c) => !c.memberId).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-500">
              <FiCreditCard className="text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit'] text-white">
                NFC Card Assignment
              </h1>
              <p className="text-sm text-gray-400">
                Register, scan, map, and manage SportsVilla physical NFC membership cards.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshInventory}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#1c1f2e] hover:bg-[#25283a] border border-[#2a2d3e] text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-colors"
          >
            <FiRefreshCw className={isRefreshing ? "animate-spin" : ""} />
            <span>Sync Cards</span>
          </button>
        </div>
      </div>

      {/* KPI Bento Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#161923] border border-[#2a2d3e] rounded-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Total Cards
          </span>
          <p className="text-2xl font-bold font-['Outfit'] text-white mt-1">{cards.length}</p>
        </div>
        <div className="p-4 bg-[#161923] border border-[#2a2d3e] rounded-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Active Issued
          </span>
          <p className="text-2xl font-bold font-['Outfit'] text-emerald-400 mt-1">{activeCount}</p>
        </div>
        <div className="p-4 bg-[#161923] border border-[#2a2d3e] rounded-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
            Blocked Cards
          </span>
          <p className="text-2xl font-bold font-['Outfit'] text-rose-400 mt-1">{blockedCount}</p>
        </div>
        <div className="p-4 bg-[#161923] border border-[#2a2d3e] rounded-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Unassigned / Pool
          </span>
          <p className="text-2xl font-bold font-['Outfit'] text-amber-400 mt-1">
            {unassignedCount}
          </p>
        </div>
      </div>

      {/* Two Column Grid: Assignment Form + Inventory Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Card Assignment Terminal */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-[#161923] border border-[#2a2d3e] rounded-2xl shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2d3e]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                <h2 className="text-lg font-bold font-['Outfit'] text-white">Issue / Assign Card</h2>
              </div>
              <span className="text-xs text-gray-400 bg-[#1c1f2e] px-2 py-1 rounded border border-[#2a2d3e]">
                Hardware Ready
              </span>
            </div>

            <form onSubmit={handleAssign} className="mt-5 space-y-5">
              {/* Step 1: Member Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  1. Select Member *
                </label>

                {selectedMember ? (
                  <div className="p-3.5 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg">
                        <FiUser className="text-xl" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{selectedMember.name}</p>
                        <p className="text-xs text-gray-400">
                          {selectedMember.mobile} • Balance: ₹
                          {(selectedMember.walletBalance / 100).toFixed(2)}
                        </p>
                        {selectedMember.nfcCards && selectedMember.nfcCards.length > 0 && (
                          <p className="text-[11px] text-amber-400 mt-0.5">
                            Already has card: {selectedMember.nfcCards[0].cardUid}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMember(null);
                        setMemberQuery("");
                      }}
                      className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-[#1c1f2e] hover:bg-[#25283a] border border-[#2a2d3e]"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={memberQuery}
                        onChange={(e) => setMemberQuery(e.target.value)}
                        placeholder="Search member by name or mobile..."
                        className="w-full pl-10 pr-4 py-2.5 bg-[#1c1f2e] border border-[#2a2d3e] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm"
                      />
                      {isSearchingMembers && (
                        <FiRefreshCw className="absolute right-3.5 top-1/2 -translate-y-1/2 text-orange-500 animate-spin text-sm" />
                      )}
                    </div>

                    {/* Search Results Dropdown */}
                    {memberResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto bg-[#1c1f2e] border border-[#2a2d3e] rounded-xl shadow-2xl z-30 divide-y divide-[#2a2d3e]">
                        {memberResults.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setSelectedMember(m);
                              setMemberResults([]);
                              playNfcSound("beep");
                            }}
                            className="p-3 hover:bg-[#25283a] cursor-pointer transition-colors flex items-center justify-between"
                          >
                            <div>
                              <p className="text-sm font-semibold text-white">{m.name}</p>
                              <p className="text-xs text-gray-400">{m.mobile}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold text-emerald-400">
                                ₹{(m.walletBalance / 100).toFixed(2)}
                              </span>
                              {m.nfcCards && m.nfcCards.length > 0 && (
                                <span className="block text-[10px] text-amber-400">Card Active</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2: Card UID Scan / Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    2. Card UID (Tap or Scan) *
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const mockUid = Array.from({ length: 8 }, () =>
                          Math.floor(Math.random() * 16).toString(16)
                        )
                          .join("")
                          .toUpperCase();
                        setCardUid(mockUid);
                        playNfcSound("beep");
                      }}
                      className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1"
                    >
                      <FiZap /> Quick Gen
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <FiCreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input
                    ref={cardUidInputRef}
                    type="text"
                    value={cardUid}
                    onChange={(e) => handleCardUidChange(e.target.value)}
                    placeholder="e.g. 04A1B2C3 (Hardware scan auto-populates)"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1c1f2e] border border-[#2a2d3e] rounded-xl text-white font-mono tracking-wider placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm uppercase"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5">
                  Tap card on USB Wedge reader or type hex UID. Automatically formatted to uppercase.
                </p>
              </div>

              {/* Step 3: Optional Printed Label */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Card Printed Serial / Label (Optional)
                </label>
                <div className="relative">
                  <FiTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={cardLabel}
                    onChange={(e) => setCardLabel(e.target.value)}
                    placeholder="e.g. SV-1001"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1c1f2e] border border-[#2a2d3e] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Assignment Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. VIP Club Member replacement card"
                  className="w-full p-3 bg-[#1c1f2e] border border-[#2a2d3e] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !selectedMember || !cardUid}
                className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all font-['Outfit']"
              >
                {isSubmitting ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    <span>Writing Card Assignment...</span>
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="text-lg" />
                    <span>Assign Card to Member</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Card Inventory Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl overflow-hidden shadow-xl">
            {/* Table Header Controls */}
            <div className="p-4 sm:p-5 border-b border-[#2a2d3e] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-['Outfit'] font-bold text-lg text-white">Card Inventory</h3>
                <p className="text-xs text-gray-400">
                  Showing {filteredCards.length} registered cards
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Filter cards or members..."
                    className="pl-8 pr-3 py-1.5 bg-[#1c1f2e] border border-[#2a2d3e] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 w-44 sm:w-52"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#1c1f2e] border border-[#2a2d3e] rounded-lg text-xs text-gray-300 focus:outline-none focus:border-orange-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="BLOCKED">Blocked</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#1c1f2e] text-gray-400 uppercase tracking-wider font-semibold border-b border-[#2a2d3e]">
                  <tr>
                    <th className="py-3 px-4">Card UID / Label</th>
                    <th className="py-3 px-4">Assigned Member</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2d3e]">
                  {filteredCards.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        No NFC cards found matching current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredCards.map((c) => (
                      <tr key={c.id} className="hover:bg-[#1c1f2e]/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-white tracking-wider">
                            {c.cardUid}
                          </div>
                          {c.cardId && <div className="text-[11px] text-gray-400">{c.cardId}</div>}
                        </td>
                        <td className="py-3 px-4">
                          {c.member ? (
                            <div>
                              <div className="font-medium text-white">{c.member.name}</div>
                              <div className="text-[11px] text-gray-400">{c.member.mobile}</div>
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              c.status === "ACTIVE"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : c.status === "BLOCKED"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          <div>
                            {c.lastUsedAt
                              ? formatIST(c.lastUsedAt, "dd MMM yyyy, hh:mm a")
                              : formatIST(c.updatedAt, "dd MMM yyyy, hh:mm a")}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {c._count?.transactions || 0} taps logged
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {c.status === "ACTIVE" ? (
                              <button
                                onClick={() => handleBlock(c)}
                                disabled={actionLoadingId === c.id}
                                title="Block Card"
                                className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded border border-rose-500/20 transition-colors"
                              >
                                <FiLock />
                              </button>
                            ) : c.status === "BLOCKED" ? (
                              <button
                                onClick={() => handleUnblock(c)}
                                disabled={actionLoadingId === c.id}
                                title="Unblock Card"
                                className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded border border-emerald-500/20 transition-colors"
                              >
                                <FiUnlock />
                              </button>
                            ) : null}

                            {c.memberId && (
                              <button
                                onClick={() => handleRevoke(c)}
                                disabled={actionLoadingId === c.id}
                                title="Unassign / Revoke Card"
                                className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded border border-amber-500/20 transition-colors"
                              >
                                <FiSlash />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
