"use client";

import { useState } from "react";
import { createSport, updateSport, deleteSport } from "./actions";
import { useAlert } from "@/components/AlertProvider";
import { FiTrash2, FiEdit2, FiPlus, FiX, FiActivity } from "react-icons/fi";

export default function SportsClient({ initialSports }: { initialSports: any[] }) {
  const { showAlert } = useAlert();
  const [sports, setSports] = useState(initialSports);
  const [showModal, setShowModal] = useState(false);
  
  const [editingId, setEditingId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  function openCreateModal() {
    setEditingId(""); setName(""); setDescription("");
    setShowModal(true);
  }

  function openEditModal(sport: any) {
    setEditingId(sport.id); setName(sport.name); setDescription(sport.description || "");
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      if (editingId) {
        await updateSport(editingId, { name, description });
        showAlert("Sport Updated", `The details for '${name}' have been successfully updated.`, "success");
      } else {
        await createSport({ name, description });
        showAlert("Sport Added", `The sport '${name}' has been successfully added to your catalog.`, "success");
      }
      setShowModal(false); window.location.reload();
    } catch (err) {
      showAlert("Save Failed", "There was an unexpected error while trying to save this sport.", "error");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteSport(id);
      setSports(sports.filter(s => s.id !== id));
      showAlert("Sport Deleted", "The sport has been permanently removed.", "success");
    } catch (err) {
      showAlert("Deletion Blocked", "Cannot delete this sport because it is currently linked to active membership plans or turfs.", "error");
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-white">Sports Config</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage the different activities available at your facility.</p>
        </div>
        <button onClick={() => { setEditingId(""); setName(""); setDescription(""); setShowModal(true); }} className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer border-none">
          <FiPlus size={16} /> Add New Sport
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sports.map(sport => (
          <div key={sport.id} className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6">
            <div className="flex justify-between items-start">
              <div className="w-11 h-11 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center text-xl">
                <FiActivity />
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  setEditingId(sport.id);
                  setName(sport.name);
                  setDescription(sport.description || "");
                  setShowModal(true);
                }} className="border border-[#2a2d3e] hover:bg-[#1c1f2e] text-gray-400 rounded-lg p-2 transition-colors cursor-pointer bg-transparent" title="Edit">
                  <FiEdit2 size={14} />
                </button>
                <button onClick={() => handleDelete(sport.id)} className="border border-[#2a2d3e] hover:bg-red-500/10 text-red-400 rounded-lg p-2 transition-colors cursor-pointer bg-transparent" title="Delete">
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mt-4">{sport.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {sport.description || "No description provided for this sport."}
              </p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-['Outfit'] text-white">{editingId ? 'Edit Sport Details' : 'Add New Sport'}</h2>
              <button className="text-gray-500 hover:text-white cursor-pointer bg-transparent border-none text-xl" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Sport Name</label>
                <input type="text" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Badminton" />
              </div>
              <div className="mb-5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Description</label>
                <textarea className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Optional details about this sport..." />
              </div>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-3 text-sm font-semibold transition-colors cursor-pointer border-none" disabled={loading}>
                {loading ? "Saving..." : "Save Sport Configuration"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
