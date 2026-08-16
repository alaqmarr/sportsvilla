"use client";
import { useState } from "react";
import { createTurf, updateTurf, deleteTurf } from "./actions";
import { useAlert } from "@/components/AlertProvider";
import { FiTrash2, FiEdit2, FiPlus, FiX, FiMapPin, FiMap, FiActivity } from "react-icons/fi";

export default function TurfsClient({ initialTurfs, sports, availableIcons }: { initialTurfs: any[], sports: any[], availableIcons: {value: string, label: string}[] }) {
  const { showAlert } = useAlert();
  const [turfs, setTurfs] = useState(initialTurfs);
  const [showModal, setShowModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  
  const [editingId, setEditingId] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [parentTurfId, setParentTurfId] = useState("");
  const [iconPath, setIconPath] = useState("");
  const [bookingPrice, setBookingPrice] = useState<number | "">("");
  const [bookingDurationMinutes, setBookingDurationMinutes] = useState<number | "">(60);
  const [capacityPerSlot, setCapacityPerSlot] = useState<number | "">(1);
  const [bookingValidityDays, setBookingValidityDays] = useState<number | "">(0);
  const [selectedSportIds, setSelectedSportIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setEditingId(""); setName(""); setLocation(""); setParentTurfId(""); setIconPath("");
    setBookingPrice(""); setBookingDurationMinutes(60); setCapacityPerSlot(1); setBookingValidityDays(0); setSelectedSportIds([]);
  }

  function openCreateModal() {
    resetForm();
    setShowModal(true);
  }

  function openEditModal(turf: any) {
    setEditingId(turf.id); 
    setName(turf.name); 
    setLocation(turf.location || ""); 
    setParentTurfId(turf.parentTurfId || "");
    setIconPath(turf.iconPath || "");
    setBookingPrice(turf.bookingPrice || "");
    setBookingDurationMinutes(turf.bookingDurationMinutes || 60);
    setCapacityPerSlot(turf.capacityPerSlot || 1);
    setBookingValidityDays(turf.bookingValidityDays || 0);
    setSelectedSportIds(turf.sports?.map((ts: any) => ts.sportId) || []);
    setShowModal(true);
  }

  function toggleSport(sportId: string) {
    if (selectedSportIds.includes(sportId)) {
      setSelectedSportIds(selectedSportIds.filter(id => id !== sportId));
    } else {
      setSelectedSportIds([...selectedSportIds, sportId]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); 
    if (selectedSportIds.length === 0) {
      return showAlert("Sport Required", "Please select at least one sport to associate with this ground.", "error");
    }
    setLoading(true);
    try {
      const data = { 
        name, 
        location, 
        parentTurfId: parentTurfId || null,
        iconPath: iconPath || undefined,
        bookingPrice: bookingPrice === "" ? null : Number(bookingPrice),
        bookingDurationMinutes: bookingDurationMinutes === "" ? null : Number(bookingDurationMinutes),
        capacityPerSlot: capacityPerSlot === "" ? 1 : Number(capacityPerSlot),
        bookingValidityDays: bookingValidityDays === "" ? 0 : Number(bookingValidityDays),
        sportIds: selectedSportIds
      };

      if (editingId) {
        await updateTurf(editingId, data);
        showAlert("Turf Updated", `The details for '${name}' have been successfully updated.`, "success");
      } else {
        await createTurf(data);
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
          onClick={openCreateModal}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer border-none"
        >
          <FiPlus size={16} /> Add New Turf
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {turfs.map(turf => (
          <div key={turf.id} className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6">
            <div className="flex justify-between items-start">
              <div className="w-11 h-11 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl overflow-hidden">
                {turf.iconPath ? (
                  <img src={turf.iconPath} alt={turf.name} className="w-7 h-7 object-contain" />
                ) : (
                  <FiMapPin />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(turf)}
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
            <p className="text-sm text-gray-500 mt-1 mb-3">
              {turf.location || "No location provided"}
            </p>

            {turf.bookingPrice !== null && turf.bookingPrice > 0 && (
              <div className="text-sm text-orange-400 font-semibold mb-3">
                ₹{turf.bookingPrice} / {turf.bookingDurationMinutes}m slot
              </div>
            )}

            {turf.sports && turf.sports.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {turf.sports.map((ts: any) => (
                  <span key={ts.sportId} className="px-2 py-1 bg-[#1c1f2e] border border-[#2a2d3e] rounded-md text-xs font-semibold text-gray-400 flex items-center gap-1">
                    <FiActivity size={10} /> {ts.sport.name}
                  </span>
                ))}
              </div>
            )}

            {turf.parentTurfId && (
              <div className="mt-3 px-3 py-1.5 bg-[#1c1f2e] rounded-lg text-xs text-gray-400 border border-[#2a2d3e] inline-flex items-center gap-2">
                <FiMap /> Inside: {turfs.find(t => t.id === turf.parentTurfId)?.name || 'Unknown'}
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white font-['Outfit']">{editingId ? 'Edit Ground Details' : 'Add New Ground'}</h2>
              <button
                className="text-gray-500 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                onClick={() => setShowModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Location / Turf Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="e.g. Main Badminton Hall"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Icon</label>
                  
                  <div 
                    onClick={() => setShowIconModal(true)}
                    className="w-full bg-[#0f1117] border border-[#2a2d3e] hover:border-orange-500/50 rounded-lg px-4 py-3 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {iconPath ? (
                        <img src={iconPath} alt="Selected Icon" className="w-6 h-6 object-contain" />
                      ) : (
                        <FiMapPin className="w-6 h-6 text-gray-500" />
                      )}
                      <span className={iconPath ? "text-white text-sm" : "text-gray-500 text-sm"}>
                        {iconPath ? availableIcons.find(i => i.value === iconPath)?.label : "Select an Icon"}
                      </span>
                    </div>
                    <span className="text-orange-500 text-xs font-semibold uppercase tracking-wider">Change</span>
                  </div>

                  {showIconModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[110]" onClick={() => setShowIconModal(false)}>
                      <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-bold text-white">Select Icon</h3>
                          <button type="button" className="text-gray-500 hover:text-white cursor-pointer bg-transparent border-none text-xl" onClick={() => setShowIconModal(false)}><FiX /></button>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                          {availableIcons.map(icon => (
                            <div 
                              key={icon.value}
                              onClick={() => { setIconPath(icon.value); setShowIconModal(false); }}
                              className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl cursor-pointer border transition-all ${iconPath === icon.value ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 'bg-[#0f1117] border-[#2a2d3e] hover:border-orange-500/50 text-gray-400 hover:text-white'}`}
                            >
                              {icon.value ? (
                                <img src={icon.value} alt={icon.label} className="w-8 h-8 object-contain" />
                              ) : (
                                <FiMapPin className="w-8 h-8" />
                              )}
                              <span className="text-[10px] uppercase tracking-wider text-center font-semibold leading-tight">{icon.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Physical Address</label>
                  <textarea
                    className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm resize-none"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    rows={2}
                    placeholder="Optional address or directions"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Inside another ground?</label>
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
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Supported Sports</label>
                  <div className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg p-3 flex flex-col gap-2 max-h-40 overflow-y-auto">
                    {sports.map(sport => (
                      <label key={sport.id} className="flex items-center gap-3 cursor-pointer text-sm text-gray-300 hover:text-white">
                        <input 
                          type="checkbox" 
                          checked={selectedSportIds.includes(sport.id)}
                          onChange={() => toggleSport(sport.id)}
                          className="w-4 h-4 text-orange-500 bg-[#161923] border-[#2a2d3e] rounded focus:ring-orange-500 focus:ring-2"
                        />
                        {sport.name}
                      </label>
                    ))}
                    {sports.length === 0 && <span className="text-sm text-gray-500">No sports available.</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Slot Price (₹)</label>
                    <input
                      type="number"
                      className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm"
                      value={bookingPrice}
                      onChange={e => setBookingPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Slot Dur. (Min)</label>
                    <input
                      type="number"
                      className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm"
                      value={bookingDurationMinutes}
                      onChange={e => setBookingDurationMinutes(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 60"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Capacity</label>
                    <input
                      type="number"
                      className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm"
                      value={capacityPerSlot}
                      onChange={e => setCapacityPerSlot(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Valid Days</label>
                    <input
                      type="number"
                      className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm"
                      value={bookingValidityDays}
                      onChange={e => setBookingValidityDays(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 0"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 pt-4 border-t border-[#2a2d3e]">
                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-5 py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer border-none"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
