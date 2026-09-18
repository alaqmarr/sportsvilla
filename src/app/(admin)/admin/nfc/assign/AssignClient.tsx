"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FiCreditCard,
  FiSearch,
  FiUser,
  FiCheckCircle,
  FiLock,
  FiUnlock,
  FiSlash,
  FiRefreshCw,
  FiTag,
  FiZap,
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
import {
  Card,
  Button,
  Badge,
  PageHeader,
  Stat,
  Input,
  Select,
} from "@/components/admin/ui";

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

  // Hardware NFC Listener (Preserved intact)
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
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="NFC Card Assignment"
        subtitle="Register, scan, map, and manage SportsVilla physical NFC membership cards."
        actions={
          <Button
            onClick={refreshInventory}
            disabled={isRefreshing}
            isLoading={isRefreshing}
            variant="secondary"
            leftIcon={<FiRefreshCw className={isRefreshing ? "animate-spin" : ""} />}
          >
            Sync Cards
          </Button>
        }
      />

      {/* KPI Bento Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Total Cards"
          value={cards.length}
          icon={<FiCreditCard />}
        />
        <Stat
          label="Active Issued"
          value={activeCount}
          icon={<FiCheckCircle />}
        />
        <Stat
          label="Blocked Cards"
          value={blockedCount}
          icon={<FiLock />}
        />
        <Stat
          label="Unassigned / Pool"
          value={unassignedCount}
          icon={<FiTag />}
        />
      </div>

      {/* Two Column Grid: Assignment Form + Inventory Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Card Assignment Terminal */}
        <div className="lg:col-span-5 space-y-6">
          <Card variant="default" padding="lg" className="shadow-sv-lg">
            <div className="flex items-center justify-between pb-4 border-b border-sv-border-subtle">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sv-brand animate-pulse" />
                <h2 className="text-lg font-bold font-sans text-sv-text">Issue / Assign Card</h2>
              </div>
              <Badge variant="neutral" size="sm">
                Hardware Ready
              </Badge>
            </div>

            <form onSubmit={handleAssign} className="mt-5 space-y-5">
              {/* Step 1: Member Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sv-text-secondary mb-2">
                  1. Select Member *
                </label>

                {selectedMember ? (
                  <div className="p-3.5 bg-sv-brand-subtle border border-[#2a2d3e] border-sv-brand/30 rounded-sv-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-sv-brand-subtle text-sv-brand rounded-sv-sm">
                        <FiUser className="text-xl" />
                      </div>
                      <div>
                        <p className="font-semibold text-sv-text">{selectedMember.name}</p>
                        <p className="text-xs text-sv-text-muted">
                          {selectedMember.mobile} • Balance: ₹
                          {(selectedMember.walletBalance / 100).toFixed(2)}
                        </p>
                        {selectedMember.nfcCards && selectedMember.nfcCards.length > 0 && (
                          <p className="text-[11px] text-sv-status-warning mt-0.5">
                            Already has card: {selectedMember.nfcCards[0].cardUid}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedMember(null);
                        setMemberQuery("");
                      }}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sv-text-muted" />
                      <input
                        type="text"
                        value={memberQuery}
                        onChange={(e) => setMemberQuery(e.target.value)}
                        placeholder="Search member by name or mobile..."
                        className="w-full pl-10 pr-4 py-2.5 bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-sm text-sv-text placeholder:text-sv-text-muted focus:outline-none focus:border-sv-brand text-sm"
                      />
                      {isSearchingMembers && (
                        <FiRefreshCw className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sv-brand animate-spin text-sm" />
                      )}
                    </div>

                    {/* Search Results Dropdown */}
                    {memberResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto bg-sv-surface-raised border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-md shadow-sv-xl z-30 divide-y divide-sv-border-subtle styled-scrollbar">
                        {memberResults.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setSelectedMember(m);
                              setMemberResults([]);
                              playNfcSound("beep");
                            }}
                            className="p-3 hover:bg-sv-surface-hover cursor-pointer transition-colors flex items-center justify-between"
                          >
                            <div>
                              <p className="text-sm font-semibold text-sv-text">{m.name}</p>
                              <p className="text-xs text-sv-text-muted">{m.mobile}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold text-sv-status-success">
                                ₹{(m.walletBalance / 100).toFixed(2)}
                              </span>
                              {m.nfcCards && m.nfcCards.length > 0 && (
                                <span className="block text-[10px] text-sv-status-warning">Card Active</span>
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-sv-text-secondary">
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
                      className="text-[11px] text-sv-brand hover:underline flex items-center gap-1"
                    >
                      <FiZap /> Quick Gen
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <FiCreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sv-text-muted text-base" />
                  <input
                    ref={cardUidInputRef}
                    type="text"
                    value={cardUid}
                    onChange={(e) => handleCardUidChange(e.target.value)}
                    placeholder="e.g. 04A1B2C3 (Hardware scan auto-populates)"
                    className="w-full pl-10 pr-4 py-2.5 bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-sm text-sv-text font-mono tracking-wider placeholder:text-sv-text-muted focus:outline-none focus:border-sv-brand text-sm uppercase"
                  />
                </div>
                <p className="text-[11px] text-sv-text-muted mt-1.5">
                  Tap card on USB Wedge reader or type hex UID. Automatically formatted to uppercase.
                </p>
              </div>

              {/* Step 3: Optional Printed Label */}
              <div>
                <Input
                  label="Card Printed Serial / Label (Optional)"
                  value={cardLabel}
                  onChange={(e) => setCardLabel(e.target.value)}
                  placeholder="e.g. SV-1001"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-sv-text-secondary">
                  Assignment Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. VIP Club Member replacement card"
                  className="w-full p-3 bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-sm text-sv-text placeholder:text-sv-text-muted focus:outline-none focus:border-sv-brand text-sm resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !selectedMember || !cardUid}
                isLoading={isSubmitting}
                className="w-full"
                leftIcon={<FiCheckCircle className="text-lg" />}
              >
                Assign Card to Member
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Card Inventory Table */}
        <div className="lg:col-span-7 space-y-4">
          <Card variant="default" padding="none" className="overflow-hidden shadow-sv-lg">
            {/* Table Header Controls */}
            <div className="p-4 sm:p-5 border-b border-sv-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-sv-surface-raised">
              <div>
                <h3 className="font-sans font-bold text-lg text-sv-text">Card Inventory</h3>
                <p className="text-xs text-sv-text-muted">
                  Showing {filteredCards.length} registered cards
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sv-text-muted text-xs" />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Filter cards or members..."
                    className="pl-8 pr-3 py-1.5 bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-sm text-xs text-sv-text placeholder:text-sv-text-muted focus:outline-none focus:border-sv-brand w-44 sm:w-52"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-sm text-xs text-sv-text focus:outline-none focus:border-sv-brand"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="BLOCKED">Blocked</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto styled-scrollbar">
              <table className="w-full text-left text-xs text-sv-text-secondary">
                <thead className="bg-sv-surface-raised text-sv-text-muted uppercase tracking-wider font-semibold border-b border-sv-border border-[#2a2d3e]">
                  <tr>
                    <th className="py-3 px-4">Card UID / Label</th>
                    <th className="py-3 px-4">Assigned Member</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sv-border-subtle bg-sv-surface">
                  {filteredCards.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sv-text-muted">
                        No NFC cards found matching current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredCards.map((c) => (
                      <tr key={c.id} className="hover:bg-sv-surface-hover/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-sv-text tracking-wider">
                            {c.cardUid}
                          </div>
                          {c.cardId && <div className="text-[11px] text-sv-text-muted">{c.cardId}</div>}
                        </td>
                        <td className="py-3 px-4">
                          {c.member ? (
                            <div>
                              <div className="font-medium text-sv-text">{c.member.name}</div>
                              <div className="text-[11px] text-sv-text-muted">{c.member.mobile}</div>
                            </div>
                          ) : (
                            <span className="text-sv-text-muted italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              c.status === "ACTIVE"
                                ? "success"
                                : c.status === "BLOCKED"
                                ? "error"
                                : "neutral"
                            }
                            size="sm"
                          >
                            {c.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sv-text-muted">
                          <div>
                            {c.lastUsedAt
                              ? formatIST(c.lastUsedAt, "dd MMM yyyy, hh:mm a")
                              : formatIST(c.updatedAt, "dd MMM yyyy, hh:mm a")}
                          </div>
                          <div className="text-[10px] text-sv-text-muted">
                            {c._count?.transactions || 0} taps logged
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {c.status === "ACTIVE" ? (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleBlock(c)}
                                disabled={actionLoadingId === c.id}
                                title="Block Card"
                                className="p-1.5"
                              >
                                <FiLock />
                              </Button>
                            ) : c.status === "BLOCKED" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnblock(c)}
                                disabled={actionLoadingId === c.id}
                                title="Unblock Card"
                                className="p-1.5"
                              >
                                <FiUnlock />
                              </Button>
                            ) : null}

                            {c.memberId && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleRevoke(c)}
                                disabled={actionLoadingId === c.id}
                                title="Unassign / Revoke Card"
                                className="p-1.5 text-sv-status-warning"
                              >
                                <FiSlash />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
