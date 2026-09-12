"use client";
import { useState } from "react";
import { createSport, updateSport, deleteSport } from "./actions";
import { useAlert } from "@/components/AlertProvider";
import { FiTrash2, FiEdit2, FiPlus, FiX, FiActivity } from "react-icons/fi";

interface TurfState {
  id?: string;
  isNew: boolean;
  name?: string;
  bookingPrice: number;
  capacityPerSlot: number;
  iconPath?: string;
  selected: boolean;
}

export default function SportsClient({ 
  initialSports, 
  availableIcons,
  allTurfs
}: { 
  initialSports: any[], 
  availableIcons: {value: string, label: string}[],
  allTurfs: any[]
}) {
  const { showAlert, showConfirm } = useAlert();
  const [sports, setSports] = useState(initialSports);
  const [showModal, setShowModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [step, setStep] = useState(1);
  
  const [editingId, setEditingId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rewardPointsPerCheckin, setRewardPointsPerCheckin] = useState<number>(0);
  const [iconPath, setIconPath] = useState("");
  const [openTime, setOpenTime] = useState("06:00");
  const [closeTime, setCloseTime] = useState("23:00");
  const [slotDurationMinutes, setSlotDurationMinutes] = useState<number>(60);
  const [turfStates, setTurfStates] = useState<TurfState[]>([]);
  const [loading, setLoading] = useState(false);

  function openCreateModal() {
    setEditingId(""); 
    setName(""); 
    setDescription(""); 
    setRewardPointsPerCheckin(0); 
    setIconPath("");
    setOpenTime("06:00"); 
    setCloseTime("23:00"); 
    setSlotDurationMinutes(60);
    setStep(1);
    
    setTurfStates(allTurfs.map(t => ({
      id: t.id,
      isNew: false,
      name: t.name,
      bookingPrice: t.bookingPrice || 0,
      capacityPerSlot: t.capacityPerSlot || 1,
      iconPath: t.iconPath || "",
      selected: false
    })));

    setShowModal(true);
  }

  function openEditModal(sport: any) {
    setEditingId(sport.id); 
    setName(sport.name); 
    setDescription(sport.description || ""); 
    setRewardPointsPerCheckin(sport.rewardPointsPerCheckin || 0); 
    setIconPath(sport.iconPath || "");
    setOpenTime(sport.openTime || "06:00"); 
    setCloseTime(sport.closeTime || "23:00"); 
    setSlotDurationMinutes(sport.slotDurationMinutes || 60);
    setStep(1);
    
    setTurfStates(allTurfs.map(t => ({
      id: t.id,
      isNew: false,
      name: t.name,
      bookingPrice: t.bookingPrice || 0,
      capacityPerSlot: t.capacityPerSlot || 1,
      iconPath: t.iconPath || "",
      selected: sport.turfs?.some((st: any) => st.turf.id === t.id) || false
    })));

    setShowModal(true);
  }

  const handleNextStep = () => {
    if (step === 1 && !name.trim()) {
      showAlert("Required Field", "Please enter a sport name.", "error");
      return;
    }
    if (step === 2 && (!openTime || !closeTime)) {
      showAlert("Required Field", "Please enter valid open and close times.", "error");
      return;
    }
    setStep(step + 1);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); 
    if (step < 3) return;
    
    setLoading(true);
    try {
      const selectedTurfs = turfStates
        .filter(t => t.selected)
        .map(t => ({
          id: t.id,
          isNew: t.isNew,
          name: t.name,
          bookingPrice: t.bookingPrice,
          capacityPerSlot: t.capacityPerSlot,
          iconPath: t.iconPath
        }));

      const payload = { 
        name, 
        description, 
        rewardPointsPerCheckin: Number(rewardPointsPerCheckin), 
        iconPath: iconPath || undefined, 
        openTime, 
        closeTime, 
        slotDurationMinutes: Number(slotDurationMinutes) 
      };

      if (editingId) {
        await updateSport(editingId, payload, selectedTurfs);
        showAlert("Sport Updated", `The details for '${name}' have been successfully updated.`, "success");
      } else {
        await createSport(payload, selectedTurfs);
        showAlert("Sport Added", `The sport '${name}' has been successfully added to your catalog.`, "success");
      }
      setShowModal(false); 
      window.location.reload();
    } catch (err) {
      showAlert("Save Failed", "There was an unexpected error while trying to save this sport.", "error");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    showConfirm(
      "Confirm Deletion",
      "Are you sure?",
      async () => {
        try {
          await deleteSport(id);
          setSports(sports.filter(s => s.id !== id));
          showAlert("Sport Deleted", "The sport has been permanently removed.", "success");
        } catch (err) {
          showAlert("Deletion Blocked", "Cannot delete this sport because it is currently linked to active membership plans or turfs.", "error");
        }
      },
      undefined,
      "Delete",
      "Cancel",
      "error"
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-white">Sports Config</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage the different activities available at your facility.</p>
        </div>
        <button onClick={openCreateModal} className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer border-none">
          <FiPlus size={16} /> Add New Sport
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sports.map(sport => (
          <div key={sport.id} className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6">
            <div className="flex justify-between items-start">
              <div className="w-11 h-11 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center text-xl overflow-hidden">
                {sport.iconPath ? (
                  <img src={sport.iconPath} alt={sport.name} className="w-7 h-7 object-contain" />
                ) : (
                  <FiActivity />
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditModal(sport)} className="border border-[#2a2d3e] hover:bg-[#1c1f2e] text-gray-400 rounded-lg p-2 transition-colors cursor-pointer bg-transparent" title="Edit">
                  <FiEdit2 size={14} />
                </button>
                <button onClick={() => handleDelete(sport.id)} className="border border-[#2a2d3e] hover:bg-red-500/10 text-red-400 rounded-lg p-2 transition-colors cursor-pointer bg-transparent" title="Delete">
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mt-4">{sport.name}</h3>
              {sport.rewardPointsPerCheckin > 0 && (
                <div className="inline-block bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-0.5 rounded mt-2 uppercase tracking-wider">
                  {sport.rewardPointsPerCheckin} Pts / Check-in
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                {sport.description || "No description provided for this sport."}
              </p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-8 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-['Outfit'] text-white">{editingId ? 'Edit Sport Details' : 'Add New Sport'}</h2>
              <button className="text-gray-500 hover:text-white cursor-pointer bg-transparent border-none text-xl" onClick={() => setShowModal(false)}><FiX /></button>
            </div>

            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`flex-1 h-1.5 rounded-full ${step >= s ? 'bg-orange-500' : 'bg-[#2a2d3e]'}`} />
              ))}
            </div>
            <h3 className="text-lg font-semibold text-white mb-6">
              {step === 1 && "Step 1: Core Details"}
              {step === 2 && "Step 2: Time Settings"}
              {step === 3 && "Step 3: Turfs Setup"}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className={step === 1 ? 'block' : 'hidden'}>
                <div className="mb-5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Sport Name</label>
                  <input type="text" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Badminton" />
                </div>
                <div className="mb-5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Icon</label>
                  <div 
                    onClick={() => setShowIconModal(true)}
                    className="w-full bg-[#0f1117] border border-[#2a2d3e] hover:border-orange-500/50 rounded-lg px-4 py-3 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {iconPath ? (
                        <img src={iconPath} alt="Selected Icon" className="w-6 h-6 object-contain" />
                      ) : (
                        <FiActivity className="w-6 h-6 text-gray-500" />
                      )}
                      <span className={iconPath ? "text-white text-sm" : "text-gray-500 text-sm"}>
                        {iconPath ? availableIcons.find(i => i.value === iconPath)?.label : "Select an Icon"}
                      </span>
                    </div>
                    <span className="text-orange-500 text-xs font-semibold uppercase tracking-wider">Change</span>
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Description</label>
                  <textarea className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Optional details about this sport..." />
                </div>
              </div>

              <div className={step === 2 ? 'block' : 'hidden'}>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Open Time</label>
                    <input type="time" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={openTime} onChange={e => setOpenTime(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Close Time</label>
                    <input type="time" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={closeTime} onChange={e => setCloseTime(e.target.value)} />
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Slot Duration (Minutes)</label>
                  <input type="number" min="15" step="15" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={slotDurationMinutes} onChange={e => setSlotDurationMinutes(Number(e.target.value))} />
                </div>
                <div className="mb-5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Reward Points Per Check-in</label>
                  <input type="number" min="0" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={rewardPointsPerCheckin} onChange={e => setRewardPointsPerCheckin(Number(e.target.value))} placeholder="0" />
                </div>
              </div>

              <div className={step === 3 ? 'block' : 'hidden'}>
                <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
                  {turfStates.map((turf, index) => (
                    <div key={index} className={`border rounded-lg p-4 transition-colors ${turf.selected ? 'bg-orange-500/10 border-orange-500/50' : 'bg-[#0f1117] border-[#2a2d3e]'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={turf.selected} 
                            onChange={(e) => {
                              const newTurfs = [...turfStates];
                              newTurfs[index].selected = e.target.checked;
                              setTurfStates(newTurfs);
                            }}
                            className="w-5 h-5 accent-orange-500" 
                          />
                          {turf.isNew ? (
                            <input 
                              type="text" 
                              value={turf.name || ""} 
                              onChange={(e) => {
                                const newTurfs = [...turfStates];
                                newTurfs[index].name = e.target.value;
                                setTurfStates(newTurfs);
                              }}
                              placeholder="New Turf Name" 
                              className="bg-[#161923] border border-[#2a2d3e] rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-orange-500"
                            />
                          ) : (
                            <span className="text-white font-semibold">{turf.name}</span>
                          )}
                        </label>
                        {turf.isNew && (
                           <button type="button" onClick={() => {
                              const newTurfs = turfStates.filter((_, i) => i !== index);
                              setTurfStates(newTurfs);
                           }} className="text-red-400 hover:text-red-300">
                             <FiTrash2 size={16} />
                           </button>
                        )}
                      </div>
                      
                      {turf.selected && (
                        <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-[#2a2d3e]">
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Booking Price</label>
                            <input 
                              type="number" 
                              min="0"
                              value={turf.bookingPrice}
                              onChange={(e) => {
                                const newTurfs = [...turfStates];
                                newTurfs[index].bookingPrice = Number(e.target.value);
                                setTurfStates(newTurfs);
                              }}
                              className="w-full bg-[#161923] border border-[#2a2d3e] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Capacity/Slot</label>
                            <input 
                              type="number" 
                              min="1"
                              value={turf.capacityPerSlot}
                              onChange={(e) => {
                                const newTurfs = [...turfStates];
                                newTurfs[index].capacityPerSlot = Number(e.target.value);
                                setTurfStates(newTurfs);
                              }}
                              className="w-full bg-[#161923] border border-[#2a2d3e] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Icon</label>
                            <select 
                              value={turf.iconPath || ""}
                              onChange={(e) => {
                                const newTurfs = [...turfStates];
                                newTurfs[index].iconPath = e.target.value;
                                setTurfStates(newTurfs);
                              }}
                              className="w-full bg-[#161923] border border-[#2a2d3e] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                            >
                              <option value="">None</option>
                              {availableIcons.map(icon => (
                                <option key={icon.value} value={icon.value}>{icon.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    onClick={() => {
                      setTurfStates([...turfStates, {
                        isNew: true,
                        name: "New Turf",
                        bookingPrice: 0,
                        capacityPerSlot: 1,
                        iconPath: "",
                        selected: true
                      }]);
                    }}
                    className="w-full py-3 border border-dashed border-[#2a2d3e] text-gray-400 rounded-lg hover:text-orange-400 hover:border-orange-400/50 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiPlus size={16} /> Add New Turf
                  </button>
                </div>
              </div>

              <div className="flex justify-between mt-6 pt-4 border-t border-[#2a2d3e]">
                {step > 1 ? (
                  <button type="button" onClick={() => setStep(step - 1)} className="px-5 py-2.5 rounded-lg border border-[#2a2d3e] text-gray-400 hover:text-white hover:bg-[#1c1f2e] text-sm font-semibold transition-colors">
                    Back
                  </button>
                ) : (
                  <div />
                )}
                {step < 3 ? (
                  <button 
                    type="button" 
                    onClick={handleNextStep} 
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors border-none cursor-pointer"
                  >
                    Next Step
                  </button>
                ) : (
                  <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors border-none cursor-pointer" disabled={loading}>
                    {loading ? "Saving..." : "Save Sport"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

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
                    <FiActivity className="w-8 h-8" />
                  )}
                  <span className="text-[10px] uppercase tracking-wider text-center font-semibold leading-tight">{icon.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
