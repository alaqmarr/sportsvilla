'use client'

import React, { useState, useEffect } from 'react';
import { fetchRevenueData } from './actions';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiDollarSign, FiCreditCard, FiSmartphone } from 'react-icons/fi';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b']; // Green (Cash), Blue (Online), Orange (Wallet)

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
    return <div className="text-white p-10">Loading revenue data...</div>;
  }

  return (
    <div className="pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-bold font-['Outfit'] text-white tracking-tight">Revenue Dashboard</h1>
        <p className="text-gray-500 mt-2">Financial overview for the last 30 days.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FiDollarSign />
            </div>
            <div className="text-sm text-gray-400">Total Revenue</div>
          </div>
          <div className="text-3xl font-bold font-['Outfit'] text-white">₹{data.totals.total.toLocaleString()}</div>
        </div>
        
        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center">
              <FiDollarSign />
            </div>
            <div className="text-sm text-gray-400">Cash Collections</div>
          </div>
          <div className="text-3xl font-bold font-['Outfit'] text-white">₹{data.totals.cash.toLocaleString()}</div>
        </div>

        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <FiCreditCard />
            </div>
            <div className="text-sm text-gray-400">Online Payments</div>
          </div>
          <div className="text-3xl font-bold font-['Outfit'] text-white">₹{data.totals.online.toLocaleString()}</div>
        </div>

        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <FiSmartphone />
            </div>
            <div className="text-sm text-gray-400">Wallet Recharges</div>
          </div>
          <div className="text-3xl font-bold font-['Outfit'] text-white">₹{data.totals.wallet.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#161923] border border-[#2a2d3e] rounded-xl p-6">
          <h2 className="text-xl font-bold font-['Outfit'] text-white mb-6">Revenue Trend (30 Days)</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="cash" stroke="#22c55e" strokeWidth={3} dot={false} name="Cash" />
                <Line type="monotone" dataKey="online" stroke="#3b82f6" strokeWidth={3} dot={false} name="Online" />
                <Line type="monotone" dataKey="wallet" stroke="#f59e0b" strokeWidth={3} dot={false} name="Wallet" />
                <CartesianGrid stroke="#2a2d3e" strokeDasharray="5 5" vertical={false} />
                <XAxis dataKey="date" stroke="#6b7280" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6">
          <h2 className="text-xl font-bold font-['Outfit'] text-white mb-6">Revenue Breakdown</h2>
          <div className="h-[300px] flex items-center justify-center">
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => `₹${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            {data.pieData.map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-gray-300">{entry.name}</span>
                </div>
                <span className="text-white font-semibold">
                  {Math.round((entry.value / data.totals.total) * 100 || 0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
