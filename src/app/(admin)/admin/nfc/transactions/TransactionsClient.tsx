"use client";

import React, { useState, useEffect } from "react";
import {
  FiFileText,
  FiSearch,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiCreditCard,
  FiDollarSign,
  FiActivity,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { getNfcTransactions } from "./actions";
import { formatIST, getISTDateBounds, getISTDateRange } from "@/lib/dateUtils";
import { NfcTransactionStats } from "@/types/nfc";
import {
  Card,
  Button,
  Badge,
  PageHeader,
  Stat,
  Modal,
} from "@/components/admin/ui";

interface TransactionsClientProps {
  initialData: {
    transactions: any[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    stats: NfcTransactionStats;
  };
}

export default function TransactionsClient({ initialData }: TransactionsClientProps) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateRangePreset, setDateRangePreset] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Detail Modal
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  // Fetch filtered data
  const fetchFilteredData = async (page: number = 1) => {
    setLoading(true);
    try {
      let startDate: string | undefined = undefined;
      let endDate: string | undefined = undefined;

      if (dateRangePreset === "TODAY") {
        const bounds = getISTDateBounds();
        startDate = bounds.start.toISOString();
        endDate = bounds.end.toISOString();
      } else if (dateRangePreset === "LAST_7_DAYS") {
        const range = getISTDateRange(7);
        startDate = range.start.toISOString();
        endDate = range.end.toISOString();
      } else if (dateRangePreset === "LAST_30_DAYS") {
        const range = getISTDateRange(30);
        startDate = range.start.toISOString();
        endDate = range.end.toISOString();
      }

      const result = await getNfcTransactions({
        startDate,
        endDate,
        type: typeFilter,
        status: statusFilter,
        query: searchQuery,
        page,
        pageSize: 50,
      });

      setData(result);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when preset or filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFilteredData(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [typeFilter, statusFilter, dateRangePreset, searchQuery]);

  const { transactions, totalCount, totalPages, stats } = data;
  const successRate =
    stats.totalTaps > 0 ? ((stats.successfulTaps / stats.totalTaps) * 100).toFixed(1) : "100.0";

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="NFC Transaction Ledger"
        subtitle="Audit log of all physical NFC card taps, check-ins, top-ups, and contactless payments."
        actions={
          <Button
            onClick={() => fetchFilteredData(currentPage)}
            disabled={loading}
            isLoading={loading}
            variant="secondary"
            leftIcon={<FiRefreshCw className={loading ? "animate-spin" : ""} />}
          >
            Refresh Ledger
          </Button>
        }
      />

      {/* Top Bento KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Total Card Taps"
          value={stats.totalTaps.toLocaleString()}
          icon={<FiCreditCard />}
        />
        <Stat
          label="Successful Taps"
          value={stats.successfulTaps.toLocaleString()}
          icon={<FiCheckCircle />}
        />
        <Stat
          label="Total Volume (INR)"
          value={`₹${stats.totalVolumeRupees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
          icon={<FiDollarSign />}
        />
        <Stat
          label="Today's Taps"
          value={stats.todayTaps.toLocaleString()}
          icon={<FiActivity />}
        />
      </div>

      {/* Filter & Controls Bar */}
      <Card variant="default" padding="sm" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sv-text-muted text-sm" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Member Name, Mobile, Card UID, or Location..."
            className="w-full pl-10 pr-4 py-2 bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-sm text-sm text-sv-text placeholder:text-sv-text-muted focus:outline-none focus:border-sv-brand"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter */}
          <select
            value={dateRangePreset}
            onChange={(e) => setDateRangePreset(e.target.value)}
            className="px-3 py-2 bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-sm text-xs font-medium text-sv-text focus:outline-none focus:border-sv-brand"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today (IST)</option>
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="LAST_30_DAYS">Last 30 Days</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-sm text-xs font-medium text-sv-text focus:outline-none focus:border-sv-brand"
          >
            <option value="ALL">All Types</option>
            <option value="CHECKIN">CHECKIN</option>
            <option value="PAYMENT">PAYMENT</option>
            <option value="TOPUP">TOPUP</option>
            <option value="DROPIN">DROPIN</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-sm text-xs font-medium text-sv-text focus:outline-none focus:border-sv-brand"
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </Card>

      {/* Ledger Table */}
      <Card variant="default" padding="none" className="overflow-hidden shadow-sv-lg">
        <div className="overflow-x-auto styled-scrollbar">
          <table className="w-full text-left text-xs text-sv-text-secondary">
            <thead className="bg-sv-surface-raised text-sv-text-muted uppercase tracking-wider font-semibold border-b border-sv-border border-[#2a2d3e]">
              <tr>
                <th className="py-3.5 px-4">Date & Time (IST)</th>
                <th className="py-3.5 px-4">Card UID</th>
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Device & Terminal</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sv-border-subtle bg-sv-surface">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sv-text-muted">
                    <FiRefreshCw className="animate-spin text-xl mx-auto mb-2 text-sv-brand" />
                    <span>Loading transactions...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sv-text-muted">
                    No NFC transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-sv-surface-hover/50 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-sv-text-muted">
                      {formatIST(tx.createdAt, "dd MMM yyyy, hh:mm:ss a")}
                    </td>

                    {/* Card UID */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-sv-text tracking-wider">
                      {tx.cardUid}
                    </td>

                    {/* Member */}
                    <td className="py-3.5 px-4">
                      {tx.member ? (
                        <div>
                          <div className="font-medium text-sv-text">{tx.member.name}</div>
                          <div className="text-[11px] text-sv-text-muted">{tx.member.mobile}</div>
                        </div>
                      ) : (
                        <span className="text-sv-text-muted italic">Unregistered Card</span>
                      )}
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge
                        variant={
                          tx.type === "CHECKIN"
                            ? "info"
                            : tx.type === "PAYMENT"
                            ? "success"
                            : tx.type === "TOPUP"
                            ? "brand"
                            : "warning"
                        }
                        size="sm"
                      >
                        {tx.type}
                      </Badge>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-sv-text">
                      {tx.amount > 0 ? `₹${tx.amount.toFixed(2)}` : "—"}
                    </td>

                    {/* Device & Terminal */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-sv-text-muted">
                      <div>{tx.deviceType}</div>
                      <div className="text-[11px] text-sv-text-muted/80">{tx.readerLocation || "Front Desk"}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {tx.status === "SUCCESS" ? (
                        <span className="inline-flex items-center gap-1 text-sv-status-success font-semibold text-[11px]">
                          <FiCheckCircle />
                          <span>SUCCESS</span>
                        </span>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1 text-sv-status-error font-semibold text-[11px]">
                            <FiXCircle />
                            <span>FAILED</span>
                          </span>
                          {tx.failureReason && (
                            <div className="text-[10px] text-sv-error-text truncate max-w-[140px]" title={tx.failureReason}>
                              {tx.failureReason}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTx(tx)}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-sv-surface-raised border-t border-sv-border-subtle flex items-center justify-between">
          <p className="text-xs text-sv-text-muted">
            Showing {transactions.length} of {totalCount} transactions
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchFilteredData(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="p-1.5 bg-sv-surface border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-sm text-sv-text-muted hover:text-sv-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronLeft />
            </button>
            <span className="text-xs text-sv-text font-medium px-2">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => fetchFilteredData(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="p-1.5 bg-sv-surface border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-sm text-sv-text-muted hover:text-sv-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </Card>

      {/* Transaction Detail Modal */}
      <Modal
        isOpen={Boolean(selectedTx)}
        onClose={() => setSelectedTx(null)}
        title="Transaction Details"
        description={selectedTx ? `ID: ${selectedTx.id}` : undefined}
        size="lg"
      >
        {selectedTx && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-sv-surface-raised border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-md">
                <span className="text-sv-text-muted block mb-1 uppercase font-semibold">Card UID</span>
                <span className="font-mono text-sm font-bold text-sv-text tracking-wider">
                  {selectedTx.cardUid}
                </span>
              </div>

              <div className="p-3.5 bg-sv-surface-raised border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-md">
                <span className="text-sv-text-muted block mb-1 uppercase font-semibold">
                  Timestamp (IST)
                </span>
                <span className="text-sv-text font-medium text-sm">
                  {formatIST(selectedTx.createdAt, "dd MMM yyyy, hh:mm:ss a")}
                </span>
              </div>

              <div className="p-3.5 bg-sv-surface-raised border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-md">
                <span className="text-sv-text-muted block mb-1 uppercase font-semibold">
                  Type & Status
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-sv-text">{selectedTx.type}</span>
                  <Badge
                    variant={selectedTx.status === "SUCCESS" ? "success" : "error"}
                    size="sm"
                  >
                    {selectedTx.status}
                  </Badge>
                </div>
              </div>

              <div className="p-3.5 bg-sv-surface-raised border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-md">
                <span className="text-sv-text-muted block mb-1 uppercase font-semibold">Amount</span>
                <span className="text-sm font-bold text-sv-brand">
                  {selectedTx.amount > 0 ? `₹${selectedTx.amount.toFixed(2)}` : "₹0.00"}
                </span>
              </div>

              <div className="p-3.5 bg-sv-surface-raised border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-md sm:col-span-2">
                <span className="text-sv-text-muted block mb-1 uppercase font-semibold">
                  Member Profile
                </span>
                {selectedTx.member ? (
                  <div className="flex items-center justify-between text-sv-text">
                    <div>
                      <p className="font-semibold">{selectedTx.member.name}</p>
                      <p className="text-sv-text-muted">{selectedTx.member.mobile}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sv-text-muted block text-[11px]">Wallet Balance</span>
                      <span className="font-bold text-sv-status-success text-sm">
                        ₹{(selectedTx.member.walletBalance / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-sv-text-muted italic">No member linked to this transaction</span>
                )}
              </div>

              {selectedTx.failureReason && (
                <div className="p-3.5 bg-sv-error-subtle border border-[#2a2d3e] border-sv-error-border border-[#2a2d3e] rounded-sv-md sm:col-span-2 text-sv-error-text">
                  <span className="block font-semibold uppercase text-[10px] mb-1">
                    Failure Reason
                  </span>
                  <p>{selectedTx.failureReason}</p>
                </div>
              )}

              {selectedTx.booking && (
                <div className="p-3.5 bg-sv-surface-raised border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-md sm:col-span-2">
                  <span className="text-sv-text-muted block mb-1 uppercase font-semibold">
                    Linked Booking
                  </span>
                  <p className="text-sv-text font-medium">
                    {selectedTx.booking.turf?.name || "Turf"} •{" "}
                    {selectedTx.booking.sport?.name || "Sport"}
                  </p>
                  <p className="text-sv-text-muted text-[11px]">
                    Slot: {formatIST(selectedTx.booking.startTime, "hh:mm a")} -{" "}
                    {formatIST(selectedTx.booking.endTime, "hh:mm a")} • ₹
                    {selectedTx.booking.price} ({selectedTx.booking.paymentStatus})
                  </p>
                </div>
              )}

              {selectedTx.metadata && (
                <div className="p-3.5 bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-md sm:col-span-2">
                  <span className="text-sv-text-muted block mb-1 uppercase font-semibold">
                    Execution Metadata (JSON)
                  </span>
                  <pre className="font-mono text-[11px] text-sv-text-muted overflow-x-auto whitespace-pre-wrap max-h-40 styled-scrollbar">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedTx.metadata), null, 2);
                      } catch {
                        return selectedTx.metadata;
                      }
                    })()}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
