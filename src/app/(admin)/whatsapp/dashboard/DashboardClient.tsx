"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
import {
  Card,
  Button,
  Badge,
  PageHeader,
  Stat,
} from "@/components/admin/ui";

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="WhatsApp Analytics & Compliance"
        subtitle={`Real-time monitoring of Meta Graph API v25.0 health, messaging funnel, and per-message pricing. (Last sync: ${lastSync})`}
        statusBadge={
          <Badge variant="success" size="sm" dot pulseDot>
            LIVE META API
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => fetchRealtimeAnalytics(false)}
              disabled={loading}
              isLoading={loading}
              variant="secondary"
              size="sm"
              leftIcon={<FiRefreshCw className={`text-sm text-sv-status-success ${loading ? "animate-spin" : ""}`} />}
            >
              Refresh Live
            </Button>
            <Link href="/whatsapp-admin">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<FaWhatsapp className="text-base" />}
              >
                Live WhatsApp CRM
              </Button>
            </Link>
          </div>
        }
      />

      {/* 1. Account Health (Kill Switch) */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-sv-text font-sans">
          Account Health & Compliance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card variant="default" padding="lg" className="flex flex-col justify-between">
            <div>
              <div className="flex flex-row items-center justify-between pb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-sv-text-muted">Number Quality</h3>
                {accountMetrics.qualityRating === "GREEN" ? (
                  <FiCheckCircle className="h-5 w-5 text-sv-status-success" />
                ) : (
                  <FiAlertTriangle className="h-5 w-5 text-sv-status-warning" />
                )}
              </div>
              <div
                className={`text-3xl font-extrabold font-sans ${
                  accountMetrics.qualityRating === "GREEN"
                    ? "text-sv-status-success"
                    : accountMetrics.qualityRating === "YELLOW"
                    ? "text-sv-status-warning"
                    : "text-sv-status-error"
                }`}
              >
                {accountMetrics.qualityRating}
              </div>
            </div>
            <p className="text-xs text-sv-text-muted mt-3">Drops to RED can throttle limits.</p>
          </Card>

          <Card variant="default" padding="lg" className="flex flex-col justify-between">
            <div>
              <div className="flex flex-row items-center justify-between pb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-sv-text-muted">Messaging Limit</h3>
                <FiActivity className="h-5 w-5 text-sv-status-info" />
              </div>
              <div className="text-3xl font-extrabold font-sans text-sv-text">
                {accountMetrics.messagingLimit}
              </div>
            </div>
            <p className="text-xs text-sv-text-muted mt-3">Business-initiated msgs / 24hrs.</p>
          </Card>

          <Card variant="default" padding="lg" className="flex flex-col justify-between">
            <div>
              <div className="flex flex-row items-center justify-between pb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-sv-text-muted">Template Warnings</h3>
                <FiAlertTriangle className="h-5 w-5 text-sv-status-warning" />
              </div>
              <div className="text-3xl font-extrabold font-sans text-sv-text">
                {templates.filter((t) => t.status === "PAUSED" || t.status === "REJECTED").length}
              </div>
            </div>
            <p className="text-xs text-sv-text-muted mt-3">Templates flagged by Meta.</p>
          </Card>

          <Card variant="default" padding="lg" className="flex flex-col justify-between">
            <div>
              <div className="flex flex-row items-center justify-between pb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-sv-text-muted">Opt-Out Rate</h3>
                <FiFilter className="h-5 w-5 text-purple-400" />
              </div>
              <div
                className={`text-3xl font-extrabold font-sans ${
                  Number(optOutRate) > 1.0 ? "text-sv-status-error" : "text-sv-text"
                }`}
              >
                {optOutRate}%
              </div>
            </div>
            <p className="text-xs text-sv-text-muted mt-3">Keep below 1.0% to avoid ban.</p>
          </Card>
        </div>
      </section>

      {/* 2. Messaging Funnel */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-sv-text font-sans">
            The Messaging Funnel
          </h2>
          <p className="text-xs text-sv-text-muted mt-1">
            Real-time data from Meta Graph API v25.0 WABA Analytics (30-day rolling window).
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card variant="default" padding="lg">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sv-text-muted pb-2">1. Sent</h3>
            <div className="text-3xl font-extrabold font-sans text-sv-text">{funnel.sent}</div>
          </Card>
          <Card variant="default" padding="lg">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sv-text-muted pb-2">2. Delivered</h3>
            <div className="text-3xl font-extrabold font-sans text-sv-text">{funnel.delivered}</div>
            <div className="text-xs text-sv-status-success font-semibold mt-2">{deliveryRate}% Delivery Rate</div>
          </Card>
          <Card variant="default" padding="lg">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sv-text-muted pb-2">3. Read</h3>
            <div className="text-3xl font-extrabold font-sans text-sv-text">{funnel.read}</div>
            <div className="text-xs text-sv-status-info font-semibold mt-2">{readRate}% Read Rate</div>
          </Card>
          <Card variant="default" padding="lg">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sv-text-muted pb-2">4. Replied</h3>
            <div className="text-3xl font-extrabold font-sans text-sv-text">{funnel.replied}</div>
            <div className="text-xs text-sv-brand font-semibold mt-2">{replyRate}% Reply Rate</div>
          </Card>
        </div>
      </section>

      {/* 3. Financial & Billing */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-sv-text font-sans">
            Financial & Billing Metrics
          </h2>
          <p className="text-xs text-sv-text-muted mt-1">
            Meta Graph API v25.0 Pricing Analytics — per-message billing. Breaks down volume and cost by category.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card variant="default" padding="lg" className="flex flex-col justify-between">
            <div>
              <div className="flex flex-row items-center justify-between pb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-sv-text-muted">Total Messages Billed</h3>
                <FiSmartphone className="h-5 w-5 text-sv-status-success" />
              </div>
              <div className="text-3xl font-extrabold font-sans text-sv-text">
                {financials.activeWindows}
              </div>
            </div>
            <p className="text-xs text-sv-text-muted mt-3">Messages processed by Meta in the last 30 days.</p>
          </Card>

          <Card variant="default" padding="lg" className="flex flex-col justify-between">
            <div>
              <div className="flex flex-row items-center justify-between pb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-sv-text-muted">Cost Per Message (CPM)</h3>
                <FiDollarSign className="h-5 w-5 text-sv-status-info" />
              </div>
              <div className="text-3xl font-extrabold font-sans text-sv-text">
                ₹{financials.cpc.toFixed(4)}
              </div>
            </div>
            <p className="text-xs text-sv-text-muted mt-3">Average Meta fee per message across all categories.</p>
          </Card>

          <Card variant="default" padding="lg" className="flex flex-col justify-between">
            <div>
              <div className="flex flex-row items-center justify-between pb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-sv-text-muted">Total Spend (Meta)</h3>
                <FiDollarSign className="h-5 w-5 text-sv-brand" />
              </div>
              <div className="text-3xl font-extrabold font-sans text-sv-text">
                ₹{financials.totalCost.toFixed(2)}
              </div>
            </div>
            <p className="text-xs text-sv-text-muted mt-3">Total billed by Meta (pricing_analytics) for 30 days.</p>
          </Card>
        </div>

        <Card variant="default" padding="none" className="overflow-hidden shadow-sv-md">
          <div className="overflow-x-auto styled-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="bg-sv-surface-raised text-sv-text-muted font-semibold border-b border-sv-border border-[#2a2d3e] text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Pricing Category</th>
                  <th className="px-6 py-4">Messages</th>
                  <th className="px-6 py-4 text-right">Cost (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sv-border-subtle bg-sv-surface">
                {financials.categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sv-text-muted">
                      No pricing data returned by Meta Graph API for this 30-day period.
                    </td>
                  </tr>
                ) : (
                  financials.categories.map((c, i) => (
                    <tr key={i} className="hover:bg-sv-surface-hover/50 transition-colors text-sv-text">
                      <td className="px-6 py-4 font-semibold capitalize">{c.category}</td>
                      <td className="px-6 py-4 text-sv-text-secondary">{c.count}</td>
                      <td className="px-6 py-4 text-right font-bold text-sv-brand">₹{c.cost.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
