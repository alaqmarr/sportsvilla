'use client'

import React, { useState, useEffect } from 'react';
import { fetchRevenueData } from './actions';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiDollarSign, FiCreditCard, FiSmartphone } from 'react-icons/fi';
import { PageHeader, Stat, Card, CardHeader, CardTitle, CardContent, Skeleton, SkeletonCard } from '@/components/admin/ui';
import { rawAdminTokens } from '@/lib/tokens';

const CHART_COLORS = [
  rawAdminTokens.statusSuccess,
  rawAdminTokens.statusInfo,
  rawAdminTokens.statusWarning,
];

export default function RevenueClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 pb-20 font-sans">
        <div className="space-y-2 pb-6 border-b border-sv-border-subtle">
          <Skeleton className="h-8 w-64 rounded-sv-md" />
          <Skeleton className="h-4 w-96 rounded-sv-sm" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <SkeletonCard key={i} className="min-h-[120px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 font-sans">
      <PageHeader
        title="Revenue Dashboard"
        subtitle="Financial overview for the last 30 days."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Reports", href: "/reports/revenue" },
          { label: "Revenue" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Stat
          label="Total Revenue"
          value={`₹${data.totals.total.toLocaleString()}`}
          icon={<FiDollarSign />}
          variant="brand"
        />
        <Stat
          label="Cash Collections"
          value={`₹${data.totals.cash.toLocaleString()}`}
          icon={<FiDollarSign />}
          variant="success"
        />
        <Stat
          label="Online Payments"
          value={`₹${data.totals.online.toLocaleString()}`}
          icon={<FiCreditCard />}
          variant="info"
        />
        <Stat
          label="Wallet Recharges"
          value={`₹${data.totals.wallet.toLocaleString()}`}
          icon={<FiSmartphone />}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="default" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <Line type="monotone" dataKey="cash" stroke={rawAdminTokens.statusSuccess} strokeWidth={3} dot={false} name="Cash" />
                  <Line type="monotone" dataKey="online" stroke={rawAdminTokens.statusInfo} strokeWidth={3} dot={false} name="Online" />
                  <Line type="monotone" dataKey="wallet" stroke={rawAdminTokens.statusWarning} strokeWidth={3} dot={false} name="Wallet" />
                  <CartesianGrid stroke={rawAdminTokens.border} strokeDasharray="5 5" vertical={false} />
                  <XAxis dataKey="date" stroke={rawAdminTokens.textMuted} tick={{ fill: rawAdminTokens.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis stroke={rawAdminTokens.textMuted} tick={{ fill: rawAdminTokens.textMuted }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: rawAdminTokens.surfaceRaised, border: `1px solid ${rawAdminTokens.border}`, borderRadius: '8px' }}
                    itemStyle={{ color: rawAdminTokens.textPrimary }}
                  />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: rawAdminTokens.surfaceRaised, border: `1px solid ${rawAdminTokens.border}`, borderRadius: '8px' }}
                    itemStyle={{ color: rawAdminTokens.textPrimary }}
                    formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              {data.pieData.map((entry: any, index: number) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></div>
                    <span className="text-sv-text-secondary">{entry.name}</span>
                  </div>
                  <span className="text-sv-text font-semibold">
                    {Math.round((entry.value / (data.totals.total || 1)) * 100 || 0)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
