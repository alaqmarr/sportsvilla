"use client";
import { useState } from "react";
import { createTurf, updateTurf, deleteTurf } from "./actions";
import { useAlert } from "@/components/AlertProvider";
import { FiTrash2, FiEdit2, FiPlus, FiX, FiMapPin, FiMap } from "react-icons/fi";

export default function TurfsClient({ initialTurfs }: { initialTurfs: any[] }) {
  const { showAlert } = useAlert();
  const [turfs, setTurfs] = useState(initialTurfs);
  const [showModal, setShowModal] = useState(false);
  
  const [editingId, setEditingId] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [parentTurfId, setParentTurfId] = useState("");
  const [loading, setLoading] = useState(false);

  function openCreateModal() {
    setEditingId(""); setName(""); setLocation(""); setParentTurfId("");
    setShowModal(true);
  }

  function openEditModal(turf: any) {
    setEditingId(turf.id); setName(turf.name); setLocation(turf.location || ""); setParentTurfId(turf.parentTurfId || "");
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      if (editingId) {
        await updateTurf(editingId, { name, location, parentTurfId: parentTurfId || null });
        showAlert("Turf Updated", `The details for '${name}' have been successfully updated.`, "success");
      } else {
        await createTurf({ name, location, parentTurfId: parentTurfId || null });
        showAlert("Turf Created", `The new turf '${name}' has been successfully created.`, "success");
      }
      setShowModal(false); window.location.reload();
    } catch (err) {
      showAlert("Save Failed", "There was an unexpected error while trying to save this turf.", "error");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteTurf(id);
      setTurfs(turfs.filter(t => t.id !== id));
      showAlert("Turf Deleted", "The turf has been permanently removed.", "success");
    } catch (err) {
      showAlert("Deletion Blocked", "Cannot delete this turf because there are active sessions or children turfs linked to it.", "error");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-white">Grounds & Turfs</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage the physical spaces at your facility.</p>
        </div>
        <button
          onClick={() => { setEditingId(""); setName(""); setLocation(""); setParentTurfId(""); setShowModal(true); }}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer border-none"
        >
          <FiPlus size={16} /> Add New Turf
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {turfs.map(turf => (
          <div key={turf.id} className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6">
            <div className="flex justify-between items-start">
              <div className="w-11 h-11 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl">
                <FiMapPin />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(turf.id);
                    setName(turf.name);
                    setLocation(turf.location || "");
                    setParentTurfId(turf.parentTurfId || "");
                    setShowModal(true);
                  }}
                  className="border border-[#2a2d3e] hover:bg-[#1c1f2e] text-gray-300 rounded-lg p-2 transition-colors cursor-pointer bg-transparent"
                  title="Edit"
                >
                  <FiEdit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(turf.id)}
                  className="border border-[#2a2d3e] text-red-400 hover:bg-red-500/10 hover:border-red-500/30 rounded-lg p-2 transition-colors cursor-pointer bg-transparent"
                  title="Delete"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-white mt-4">{turf.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {turf.location || "No location provided"}
            </p>
            {turf.parentTurfId && (
              <div className="mt-3 px-3 py-1.5 bg-[#1c1f2e] rounded-lg text-xs text-gray-400 border border-[#2a2d3e] inline-flex items-center gap-2">
                <FiMap /> Inside: {turfs.find(t => t.id === turf.parentTurfId)?.name || 'Unknown'}
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white font-['Outfit']">{editingId ? 'Edit Ground Details' : 'Add New Ground'}</h2>
              <button
                className="text-gray-500 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                onClick={() => setShowModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-400 mb-2">Location / Turf Name</label>
                <input
                  type="text"
                  className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="e.g. Main Badminton Hall"
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-400 mb-2">Physical Address</label>
                <textarea
                  className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm resize-none"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  rows={2}
                  placeholder="Optional address or directions"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">Inside another ground?</label>
                <select
                  className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm appearance-none cursor-pointer"
                  value={parentTurfId}
                  onChange={e => setParentTurfId(e.target.value)}
                >
                  <option value="">-- No, this is a main location --</option>
                  {turfs.filter(t => t.id !== editingId).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">Useful for courts located inside a larger complex.</p>
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer border-none"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Location"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
