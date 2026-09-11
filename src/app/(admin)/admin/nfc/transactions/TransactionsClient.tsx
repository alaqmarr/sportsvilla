"use client";

import { useState, useEffect } from "react";
import {
  FiFileText,
  FiSearch,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiCreditCard,
  FiDollarSign,
  FiActivity,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiInfo,
  FiMapPin,
  FiCpu,
} from "react-icons/fi";
import { getNfcTransactions } from "./actions";
import { formatIST, todayIST, getISTDateBounds, getISTDateRange } from "@/lib/dateUtils";
import { NfcTransactionStats } from "@/types/nfc";

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-500">
            <FiFileText className="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit'] text-white">
              NFC Transaction Ledger
            </h1>
            <p className="text-sm text-gray-400">
              Audit log of all physical NFC card taps, check-ins, top-ups, and contactless payments.
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchFilteredData(currentPage)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#1c1f2e] hover:bg-[#25283a] border border-[#2a2d3e] text-gray-300 hover:text-white rounded-xl text-sm font-medium transition-colors"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Top Bento KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Taps */}
        <div className="p-5 bg-[#161923] border border-[#2a2d3e] rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Card Taps
            </span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <FiCreditCard />
            </div>
          </div>
          <p className="text-3xl font-bold font-['Outfit'] text-white mt-2">
            {stats.totalTaps.toLocaleString()}
          </p>
          <span className="text-[11px] text-gray-500 mt-1 block">Lifetime physical taps</span>
        </div>

        {/* Successful Taps */}
        <div className="p-5 bg-[#161923] border border-[#2a2d3e] rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Successful Taps
            </span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <FiCheckCircle />
            </div>
          </div>
          <p className="text-3xl font-bold font-['Outfit'] text-emerald-400 mt-2">
            {stats.successfulTaps.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-400/80 mt-1 block">
            {successRate}% Tap Success Rate
          </span>
        </div>

        {/* Total Volume */}
        <div className="p-5 bg-[#161923] border border-[#2a2d3e] rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
              Total Volume (INR)
            </span>
            <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg">
              <FiDollarSign />
            </div>
          </div>
          <p className="text-3xl font-bold font-['Outfit'] text-orange-400 mt-2">
            ₹{stats.totalVolumeRupees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-gray-500 mt-1 block">NFC transactions & drop-ins</span>
        </div>

        {/* Today's Taps */}
        <div className="p-5 bg-[#161923] border border-[#2a2d3e] rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Today's Taps
            </span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <FiActivity />
            </div>
          </div>
          <p className="text-3xl font-bold font-['Outfit'] text-purple-400 mt-2">
            {stats.todayTaps.toLocaleString()}
          </p>
          <span className="text-[11px] text-gray-500 mt-1 block">Activity since midnight IST</span>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="p-4 bg-[#161923] border border-[#2a2d3e] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Member Name, Mobile, Card UID, or Location..."
            className="w-full pl-10 pr-4 py-2 bg-[#1c1f2e] border border-[#2a2d3e] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter */}
          <select
            value={dateRangePreset}
            onChange={(e) => setDateRangePreset(e.target.value)}
            className="px-3 py-2 bg-[#1c1f2e] border border-[#2a2d3e] rounded-xl text-xs font-medium text-gray-300 focus:outline-none focus:border-orange-500"
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
            className="px-3 py-2 bg-[#1c1f2e] border border-[#2a2d3e] rounded-xl text-xs font-medium text-gray-300 focus:outline-none focus:border-orange-500"
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
            className="px-3 py-2 bg-[#1c1f2e] border border-[#2a2d3e] rounded-xl text-xs font-medium text-gray-300 focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#1c1f2e] text-gray-400 uppercase tracking-wider font-semibold border-b border-[#2a2d3e]">
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
            <tbody className="divide-y divide-[#2a2d3e]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <FiRefreshCw className="animate-spin text-xl mx-auto mb-2 text-orange-500" />
                    <span>Loading transactions...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    No NFC transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#1c1f2e]/60 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-gray-300">
                      {formatIST(tx.createdAt, "dd MMM yyyy, hh:mm:ss a")}
                    </td>

                    {/* Card UID */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-white tracking-wider">
                      {tx.cardUid}
                    </td>

                    {/* Member */}
                    <td className="py-3.5 px-4">
                      {tx.member ? (
                        <div>
                          <div className="font-medium text-white">{tx.member.name}</div>
                          <div className="text-[11px] text-gray-400">{tx.member.mobile}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">Unregistered Card</span>
                      )}
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          tx.type === "CHECKIN"
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                            : tx.type === "PAYMENT"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : tx.type === "TOPUP"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-white">
                      {tx.amount > 0 ? `₹${tx.amount.toFixed(2)}` : "—"}
                    </td>

                    {/* Device & Terminal */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-gray-400">
                      <div>{tx.deviceType}</div>
                      <div className="text-[11px] text-gray-500">{tx.readerLocation || "Front Desk"}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {tx.status === "SUCCESS" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                          <FiCheckCircle />
                          <span>SUCCESS</span>
                        </span>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1 text-rose-400 font-semibold text-[11px]">
                            <FiXCircle />
                            <span>FAILED</span>
                          </span>
                          {tx.failureReason && (
                            <div className="text-[10px] text-rose-300 truncate max-w-[140px]" title={tx.failureReason}>
                              {tx.failureReason}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="px-2.5 py-1 bg-[#1c1f2e] hover:bg-[#25283a] border border-[#2a2d3e] text-xs text-gray-300 hover:text-white rounded-lg transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-[#161923] border-t border-[#2a2d3e] flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Showing {transactions.length} of {totalCount} transactions
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchFilteredData(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="p-1.5 bg-[#1c1f2e] border border-[#2a2d3e] rounded-lg text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiChevronLeft />
            </button>
            <span className="text-xs text-gray-300 font-medium px-2">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => fetchFilteredData(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="p-1.5 bg-[#1c1f2e] border border-[#2a2d3e] rounded-lg text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-5 p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2d3e]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                  <FiInfo className="text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-['Outfit'] text-white">
                    Transaction Details
                  </h3>
                  <p className="text-xs font-mono text-gray-400">{selectedTx.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#1c1f2e]"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Modal Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#1c1f2e] border border-[#2a2d3e] rounded-xl">
                <span className="text-gray-400 block mb-1 uppercase font-semibold">Card UID</span>
                <span className="font-mono text-sm font-bold text-white tracking-wider">
                  {selectedTx.cardUid}
                </span>
              </div>

              <div className="p-3 bg-[#1c1f2e] border border-[#2a2d3e] rounded-xl">
                <span className="text-gray-400 block mb-1 uppercase font-semibold">
                  Timestamp (IST)
                </span>
                <span className="text-white font-medium">
                  {formatIST(selectedTx.createdAt, "dd MMM yyyy, hh:mm:ss a")}
                </span>
              </div>

              <div className="p-3 bg-[#1c1f2e] border border-[#2a2d3e] rounded-xl">
                <span className="text-gray-400 block mb-1 uppercase font-semibold">
                  Type & Status
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-white">{selectedTx.type}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      selectedTx.status === "SUCCESS"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {selectedTx.status}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#1c1f2e] border border-[#2a2d3e] rounded-xl">
                <span className="text-gray-400 block mb-1 uppercase font-semibold">Amount</span>
                <span className="text-sm font-bold text-orange-400">
                  {selectedTx.amount > 0 ? `₹${selectedTx.amount.toFixed(2)}` : "₹0.00"}
                </span>
              </div>

              <div className="p-3 bg-[#1c1f2e] border border-[#2a2d3e] rounded-xl col-span-2">
                <span className="text-gray-400 block mb-1 uppercase font-semibold">
                  Member Profile
                </span>
                {selectedTx.member ? (
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <p className="font-semibold">{selectedTx.member.name}</p>
                      <p className="text-gray-400">{selectedTx.member.mobile}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 block">Wallet Balance</span>
                      <span className="font-semibold text-emerald-400">
                        ₹{(selectedTx.member.walletBalance / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500 italic">No member linked to this transaction</span>
                )}
              </div>

              {selectedTx.failureReason && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl col-span-2 text-rose-300">
                  <span className="block font-semibold uppercase text-[10px] text-rose-400 mb-1">
                    Failure Reason
                  </span>
                  <p>{selectedTx.failureReason}</p>
                </div>
              )}

              {selectedTx.booking && (
                <div className="p-3 bg-[#1c1f2e] border border-[#2a2d3e] rounded-xl col-span-2">
                  <span className="text-gray-400 block mb-1 uppercase font-semibold">
                    Linked Booking
                  </span>
                  <p className="text-white font-medium">
                    {selectedTx.booking.turf?.name || "Turf"} •{" "}
                    {selectedTx.booking.sport?.name || "Sport"}
                  </p>
                  <p className="text-gray-400 text-[11px]">
                    Slot: {formatIST(selectedTx.booking.startTime, "hh:mm a")} -{" "}
                    {formatIST(selectedTx.booking.endTime, "hh:mm a")} • ₹
                    {selectedTx.booking.price} ({selectedTx.booking.paymentStatus})
                  </p>
                </div>
              )}

              {selectedTx.metadata && (
                <div className="p-3 bg-[#0f1117] border border-[#2a2d3e] rounded-xl col-span-2">
                  <span className="text-gray-400 block mb-1 uppercase font-semibold">
                    Execution Metadata (JSON)
                  </span>
                  <pre className="font-mono text-[11px] text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-40">
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

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-[#2a2d3e]">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-[#1c1f2e] hover:bg-[#25283a] text-white text-xs font-semibold rounded-xl border border-[#2a2d3e]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
