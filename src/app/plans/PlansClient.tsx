"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPlan, updatePlan, deletePlan } from "./actions";
import { useAlert } from "@/components/AlertProvider";
import { FiTrash2, FiEdit2, FiPlus, FiX, FiCheck, FiLayers, FiUsers } from "react-icons/fi";

export default function PlansClient({ initialPlans, sports }: { initialPlans: any[], sports: any[] }) {
  const { showAlert } = useAlert();
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans);
  const [showModal, setShowModal] = useState(false);
  
  const [editingId, setEditingId] = useState("");
  const [name, setName] = useState("");
  const [sportId, setSportId] = useState("");
  const [durationInDays, setDurationInDays] = useState(30);
  const [price, setPrice] = useState(0);
  const [slotsPerDay, setSlotsPerDay] = useState(1);
  const [loading, setLoading] = useState(false);

  function openCreateModal() {
    setEditingId(""); setName(""); setSportId(sports[0]?.id || ""); setDurationInDays(30); setPrice(0); setSlotsPerDay(1);
    setShowModal(true);
  }

  function openEditModal(plan: any) {
    setEditingId(plan.id); setName(plan.name); setSportId(plan.sportId); setDurationInDays(plan.durationInDays); setPrice(plan.price); setSlotsPerDay(plan.slotsPerDay || 1);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      if (editingId) {
        await updatePlan(editingId, { name, sportId, durationInDays, price, slotsPerDay });
        showAlert("Plan Updated", `The membership plan '${name}' has been successfully updated.`, "success");
      } else {
        await createPlan({ name, sportId, durationInDays: Number(durationInDays), price: Number(price), slotsPerDay: Number(slotsPerDay) });
        showAlert("Plan Created", `A new membership plan '${name}' has been added to the catalog.`, "success");
      }
      setShowModal(false); window.location.reload();
    } catch (err) {
      showAlert("Save Failed", "There was an error saving the membership plan. Please verify the details.", "error");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    try {
      await deletePlan(id);
      setPlans(plans.filter(p => p.id !== id));
      showAlert("Plan Deleted", "The membership plan has been permanently removed.", "success");
    } catch (err) {
      showAlert("Deletion Blocked", "Cannot delete this plan because there are active members currently enrolled in it.", "error");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-white">Membership Plans</h1>
          <p className="text-gray-500 mt-1 text-sm">Create subscription tiers and packages for your sports.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(""); setName(""); setSportId(sports[0]?.id || "");
            setDurationInDays(30); setPrice(1000); setSlotsPerDay(1); setShowModal(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer border-none"
        >
          <FiPlus size={16} /> Create New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6">
            <div className="flex justify-between items-start">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {plan.sport.name}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(plan.id); setName(plan.name); setSportId(plan.sportId);
                    setDurationInDays(plan.durationInDays); setPrice(plan.price); setSlotsPerDay(plan.slotsPerDay); setShowModal(true);
                  }}
                  className="border border-[#2a2d3e] hover:bg-[#1c1f2e] text-gray-300 rounded-lg p-2 transition-colors cursor-pointer bg-transparent"
                  title="Edit"
                >
                  <FiEdit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="border border-[#2a2d3e] text-red-400 hover:bg-red-500/10 hover:border-red-500/30 rounded-lg p-2 transition-colors cursor-pointer bg-transparent"
                  title="Delete"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-white mt-4">{plan.name}</h3>
            <div className="text-3xl font-bold font-['Outfit'] text-white mt-1 mb-5">
              ₹{plan.price.toLocaleString()}
            </div>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-3">
                <FiCheck className="text-emerald-400 text-lg flex-shrink-0" /> Valid for {plan.durationInDays} days
              </li>
              <li className="flex items-center gap-3">
                <FiCheck className="text-emerald-400 text-lg flex-shrink-0" /> {plan.slotsPerDay} Check-In{plan.slotsPerDay > 1 ? 's' : ''} per day limit
              </li>
              <li className="flex items-center gap-3">
                <FiCheck className="text-emerald-400 text-lg flex-shrink-0" /> Access to {plan.sport.name} facilities
              </li>
              <li className="flex items-center gap-3 text-orange-400 font-semibold mt-2 pt-2 border-t border-[#2a2d3e]">
                <FiUsers className="text-lg flex-shrink-0" /> {plan._count?.memberships || 0} Active Enrollments
              </li>
            </ul>
            <div className="mt-6 pt-4 border-t border-[#2a2d3e]">
              <button
                onClick={() => router.push(`/plans/${plan.id}`)}
                className="w-full bg-[#1c1f2e] hover:bg-[#2a2d3e] text-white border border-[#2a2d3e] rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
              >
                View Plan Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white font-['Outfit']">{editingId ? 'Edit Plan' : 'Create New Plan'}</h2>
              <button
                className="text-gray-500 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                onClick={() => setShowModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-400 mb-2">Plan Name</label>
                <input
                  type="text"
                  className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="e.g. Monthly Pro"
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-400 mb-2">Target Sport</label>
                <select
                  className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm appearance-none cursor-pointer"
                  value={sportId}
                  onChange={e => setSportId(e.target.value)}
                  required
                >
                  <option value="">-- Select Sport --</option>
                  {sports.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm"
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    required
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Duration (Days)</label>
                  <input
                    type="number"
                    className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm"
                    value={durationInDays}
                    onChange={e => setDurationInDays(Number(e.target.value))}
                    required
                    min={1}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">Daily Check-ins Allowed</label>
                <input
                  type="number"
                  className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm"
                  value={slotsPerDay}
                  onChange={e => setSlotsPerDay(Number(e.target.value))}
                  required
                  min={1}
                />
                <p className="text-xs text-gray-500 mt-2">Maximum number of times a member can mark attendance per day with this plan.</p>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer border-none"
                disabled={loading}
              >
                {loading ? "Saving..." : "Publish Plan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
