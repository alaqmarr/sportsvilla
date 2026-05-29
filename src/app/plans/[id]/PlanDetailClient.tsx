"use client";
import { formatIST } from "../../../lib/dateUtils";
import { useState, useEffect } from "react";
import { fetchPlanDetail } from "./actions";
import { startOfDay } from "date-fns";
import { FiArrowLeft, FiUser, FiCalendar, FiClock, FiActivity, FiLayers, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/AlertProvider";

export default function PlanDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { showAlert } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'EXPIRED'>('ACTIVE');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchPlanDetail(id);
        setPlan(data);
      } catch (err) {
        showAlert("Data Error", "Failed to load the detailed information for this plan.", "error");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!plan) return null;

  const today = startOfDay(new Date());

  const activeMemberships = plan.memberships.filter((m: any) => m.status === 'ACTIVE' && new Date(m.endDate) >= today);
  const expiredMemberships = plan.memberships.filter((m: any) => m.status === 'EXPIRED' || new Date(m.endDate) < today);

  const displayedMemberships = activeTab === 'ACTIVE' ? activeMemberships : expiredMemberships;

  return (
    <div>
      <button 
        onClick={() => router.push('/plans')}
        className="text-gray-400 hover:text-white flex items-center gap-2 font-semibold mb-6 transition-colors bg-transparent border-none cursor-pointer"
      >
        <FiArrowLeft /> Back to Plans
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
            {plan.sport.name}
          </div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-white tracking-tight">{plan.name}</h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2 font-medium">
            ₹{plan.price.toLocaleString()} • Valid for {plan.durationInDays} days • {plan.slotsPerDay} Check-in{plan.slotsPerDay > 1 ? 's' : ''}/day
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-[#161923] border border-emerald-500/20 px-5 py-3 rounded-xl flex flex-col items-center shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <span className="text-emerald-400 text-2xl font-bold font-['Outfit']">{activeMemberships.length}</span>
            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Active</span>
          </div>
          <div className="bg-[#161923] border border-red-500/20 px-5 py-3 rounded-xl flex flex-col items-center shadow-[0_0_15px_rgba(239,68,68,0.05)]">
            <span className="text-red-400 text-2xl font-bold font-['Outfit']">{expiredMemberships.length}</span>
            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Expired</span>
          </div>
        </div>
      </div>

      <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl overflow-hidden flex flex-col shadow-lg">
        <div className="flex border-b border-[#2a2d3e]">
          <button 
            onClick={() => setActiveTab('ACTIVE')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 border-none cursor-pointer ${activeTab === 'ACTIVE' ? 'bg-orange-500/10 text-orange-400 border-b-2 border-orange-500' : 'bg-transparent text-gray-500 hover:text-gray-300'}`}
          >
            <FiCheckCircle /> Active Enrollees
          </button>
          <button 
            onClick={() => setActiveTab('EXPIRED')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 border-none cursor-pointer ${activeTab === 'EXPIRED' ? 'bg-orange-500/10 text-orange-400 border-b-2 border-orange-500' : 'bg-transparent text-gray-500 hover:text-gray-300'}`}
          >
            <FiXCircle /> Expired / Past Enrollees
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-[#0f1117]/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-[#2a2d3e]">Member Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-[#2a2d3e]">Enrollment Period</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-[#2a2d3e]">{activeTab === 'ACTIVE' ? 'Days Left' : 'Days Elapsed'}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-[#2a2d3e]">Current Month Visited</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2d3e]">
              {displayedMemberships.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No {activeTab.toLowerCase()} members found for this plan.
                  </td>
                </tr>
              ) : (
                displayedMemberships.map((m: any) => {
                  const endDate = startOfDay(new Date(m.endDate));
                  const msLeft = endDate.getTime() - today.getTime();
                  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
                  
                  return (
                    <tr 
                      key={m.id} 
                      onClick={() => router.push(`/reports/memberships/${m.id}`)}
                      className="hover:bg-[#1c1f2e] transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-sm font-['Outfit']">
                            {m.member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-white font-medium">{m.member.name}</div>
                            <div className="text-gray-500 text-xs mt-0.5">{m.member.mobile}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {formatIST(new Date(m.startDate), 'MMM d, yy')} - {formatIST(new Date(m.endDate), 'MMM d, yy')}
                      </td>
                      <td className="px-6 py-4">
                        {activeTab === 'ACTIVE' ? (
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${daysLeft <= 5 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {daysLeft} Days
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm font-medium">Expired</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FiClock className="text-orange-400" />
                          <span className="text-white font-bold">{m.member.attendances.length} visits</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
