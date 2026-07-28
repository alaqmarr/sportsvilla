"use client";

import { useState, useEffect } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiSmartphone,
  FiActivity,
  FiFilter,
  FiDollarSign,
  FiRefreshCw,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "react-hot-toast";

type AccountMetrics = {
  qualityRating: string;
  messagingLimit: string;
};

type Template = {
  id: string;
  name: string;
  category: string;
  status: string;
};

type Funnel = {
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  optOuts: number;
};

type Financials = {
  activeWindows: number;
  categories: { category: string; count: number; cost: number }[];
  totalCost: number;
  totalConversations: number;
  cpc: number;
};

export default function DashboardClient({
  accountMetrics: initialMetrics,
  templates: initialTemplates,
  funnel: initialFunnel,
  financials: initialFinancials,
  initialError,
}: {
  accountMetrics: AccountMetrics;
  templates: Template[];
  funnel: Funnel;
  financials: Financials;
  initialError?: string | null;
}) {
  const [accountMetrics, setAccountMetrics] = useState<AccountMetrics>(initialMetrics);
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [funnel, setFunnel] = useState<Funnel>(initialFunnel);
  const [financials, setFinancials] = useState<Financials>(initialFinancials);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string>("Server-side fetch");

  useEffect(() => {
    if (initialError) {
      toast.error(initialError);
    }
  }, [initialError]);

  const fetchRealtimeAnalytics = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/client/v1/whatsapp/analytics");
      const data = await res.json();
      if (data.success) {
        setAccountMetrics(data.accountMetrics);
        setTemplates(data.templates || []);
        setFunnel(data.funnel);
        setFinancials(data.financials);
        const timeStr = new Date().toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
        setLastSync(`${timeStr} IST`);
      } else {
        toast.error(data.error || "Failed to fetch live analytics from Meta API");
      }
    } catch (err) {
      console.error("Error fetching live analytics:", err);
      toast.error("Failed to connect to Analytics API");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    // We already have the server-side data, no need to fetch on mount!
    // Auto-poll every 15 seconds for real-time live metrics
    const interval = setInterval(() => {
      fetchRealtimeAnalytics(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const deliveryRate =
    funnel.sent > 0 ? ((funnel.delivered / funnel.sent) * 100).toFixed(1) : "0.0";
  const readRate =
    funnel.delivered > 0 ? ((funnel.read / funnel.delivered) * 100).toFixed(1) : "0.0";
  const replyRate =
    funnel.sent > 0 ? ((funnel.replied / funnel.sent) * 100).toFixed(1) : "0.0";
  const optOutRate =
    funnel.sent > 0 ? ((funnel.optOuts / funnel.sent) * 100).toFixed(1) : "0.0";

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#2a2d3e]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-white font-['Outfit']">
              WhatsApp Analytics & Compliance
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              LIVE META API
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Real-time monitoring of Meta Graph API health, messaging funnel performance, and conversation billing.
            <span className="text-gray-500 ml-2">Last sync: {lastSync}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchRealtimeAnalytics(false)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] border border-[#2a3942] text-gray-200 font-semibold text-xs transition-all disabled:opacity-50"
          >
            <FiRefreshCw className={`text-sm text-emerald-400 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Syncing Meta..." : "Refresh Live"}</span>
          </button>
          <a
            href="/whatsapp-admin"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white font-bold text-sm shadow-lg transition-all"
          >
            <FaWhatsapp className="text-lg" />
            <span>Live WhatsApp CRM</span>
          </a>
        </div>
      </div>

      {/* 1. Account Health (Kill Switch) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-white font-['Outfit']">
          Account Health & Compliance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex flex-row items-center justify-between pb-3">
                <h3 className="text-sm font-medium text-gray-400">Number Quality</h3>
                {accountMetrics.qualityRating === "GREEN" ? (
                  <FiCheckCircle className="h-5 w-5 text-emerald-400" />
                ) : (
                  <FiAlertTriangle className="h-5 w-5 text-yellow-400" />
                )}
              </div>
              <div
                className={`text-3xl font-bold font-['Outfit'] ${
                  accountMetrics.qualityRating === "GREEN"
                    ? "text-emerald-400"
                    : accountMetrics.qualityRating === "YELLOW"
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {accountMetrics.qualityRating}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Drops to RED can throttle limits.</p>
          </div>

          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex flex-row items-center justify-between pb-3">
                <h3 className="text-sm font-medium text-gray-400">Messaging Limit</h3>
                <FiActivity className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold font-['Outfit'] text-white">
                {accountMetrics.messagingLimit}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Business-initiated msgs / 24hrs.</p>
          </div>

          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex flex-row items-center justify-between pb-3">
                <h3 className="text-sm font-medium text-gray-400">Template Warnings</h3>
                <FiAlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <div className="text-3xl font-bold font-['Outfit'] text-white">
                {templates.filter((t) => t.status === "PAUSED" || t.status === "REJECTED").length}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Templates flagged by Meta.</p>
          </div>

          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex flex-row items-center justify-between pb-3">
                <h3 className="text-sm font-medium text-gray-400">Opt-Out Rate</h3>
                <FiFilter className="h-5 w-5 text-purple-400" />
              </div>
              <div
                className={`text-3xl font-bold font-['Outfit'] ${
                  Number(optOutRate) > 1.0 ? "text-red-400" : "text-white"
                }`}
              >
                {optOutRate}%
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Keep below 1.0% to avoid ban.</p>
          </div>
        </div>
      </section>

      {/* 2. Messaging Funnel */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-white font-['Outfit']">
          The Messaging Funnel
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-medium text-gray-400 pb-2">1. Sent</h3>
            <div className="text-3xl font-bold font-['Outfit'] text-white">{funnel.sent}</div>
          </div>
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-medium text-gray-400 pb-2">2. Delivered</h3>
            <div className="text-3xl font-bold font-['Outfit'] text-white">{funnel.delivered}</div>
            <div className="text-sm text-emerald-400 font-medium mt-2">{deliveryRate}% Delivery Rate</div>
          </div>
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-medium text-gray-400 pb-2">3. Read</h3>
            <div className="text-3xl font-bold font-['Outfit'] text-white">{funnel.read}</div>
            <div className="text-sm text-blue-400 font-medium mt-2">{readRate}% Read Rate</div>
          </div>
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-medium text-gray-400 pb-2">4. Replied</h3>
            <div className="text-3xl font-bold font-['Outfit'] text-white">{funnel.replied}</div>
            <div className="text-sm text-purple-400 font-medium mt-2">{replyRate}% Reply Rate</div>
          </div>
        </div>
      </section>

      {/* 3. Financial & Billing */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-white font-['Outfit']">
          Financial & Billing Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex flex-row items-center justify-between pb-3">
                <h3 className="text-sm font-medium text-gray-400">Active 24-Hour Windows</h3>
                <FiSmartphone className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold font-['Outfit'] text-white">
                {financials.activeWindows}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Users currently eligible for free-form replies.</p>
          </div>

          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex flex-row items-center justify-between pb-3">
                <h3 className="text-sm font-medium text-gray-400">Cost Per Conversation (CPC)</h3>
                <FiDollarSign className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold font-['Outfit'] text-white">
                ₹{financials.cpc.toFixed(2)}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Average meta fee across all categories.</p>
          </div>

          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex flex-row items-center justify-between pb-3">
                <h3 className="text-sm font-medium text-gray-400">Total Spend (Meta)</h3>
                <FiDollarSign className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-3xl font-bold font-['Outfit'] text-white">
                ₹{financials.totalCost.toFixed(2)}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Based on webhook pricing events.</p>
          </div>
        </div>

        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1f2330] text-gray-400 font-semibold border-b border-[#2a2d3e] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Conversations</th>
                <th className="px-6 py-4 text-right">Cost (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2d3e]/50">
              {financials.categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                    No billing data available yet.
                  </td>
                </tr>
              ) : (
                financials.categories.map((c, i) => (
                  <tr key={i} className="hover:bg-[#1f2330]/50 transition-colors text-white">
                    <td className="px-6 py-4 font-medium capitalize">{c.category}</td>
                    <td className="px-6 py-4">{c.count}</td>
                    <td className="px-6 py-4 text-right font-medium">₹{c.cost.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
