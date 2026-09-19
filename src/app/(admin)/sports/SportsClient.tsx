"use client";
import React, { useState } from "react";
import { createSport, updateSport, deleteSport } from "@/modules/sports/sports.action";
import { useAlert } from "@/components/AlertProvider";
import { FiTrash2, FiEdit2, FiPlus, FiActivity } from "react-icons/fi";
import {
  Card,
  Button,
  Badge,
  PageHeader,
  Modal,
} from "@/components/admin/ui";

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
    <div className="space-y-6">
      <PageHeader
        title="Sports Config"
        subtitle="Manage the different activities available at your facility."
        actions={
          <Button onClick={openCreateModal} leftIcon={<FiPlus size={16} />}>
            Add New Sport
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sports.map(sport => (
          <Card key={sport.id} variant="default" padding="lg" className="flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div className="w-11 h-11 rounded-sv-md bg-sv-brand-subtle text-sv-brand flex items-center justify-center text-xl overflow-hidden border border-[#2a2d3e] border-sv-brand/20">
                  {sport.iconPath ? (
                    <img src={sport.iconPath} alt={sport.name} className="w-7 h-7 object-contain" />
                  ) : (
                    <FiActivity />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => openEditModal(sport)} title="Edit">
                    <FiEdit2 size={14} />
                  </Button>
                  <Button variant="danger" size="icon" onClick={() => handleDelete(sport.id)} title="Delete">
                    <FiTrash2 size={14} />
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-sv-text mt-4">{sport.name}</h3>
                {sport.rewardPointsPerCheckin > 0 && (
                  <div className="mt-2">
                    <Badge variant="brand" size="sm">
                      {sport.rewardPointsPerCheckin} Pts / Check-in
                    </Badge>
                  </div>
                )}
                <p className="text-sm text-sv-text-muted mt-2 line-clamp-2">
                  {sport.description || "No description provided for this sport."}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Sport Details' : 'Add New Sport'}
        size="lg"
      >
        <div>
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full ${
                  step >= s ? 'bg-sv-brand' : 'bg-sv-border border-[#2a2d3e]'
                }`}
              />
            ))}
          </div>
          <h3 className="text-base font-semibold text-sv-text mb-6">
            {step === 1 && "Step 1: Core Details"}
            {step === 2 && "Step 2: Time Settings"}
            {step === 3 && "Step 3: Turfs Setup"}
          </h3>

          <form 
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (step < 3) handleNextStep();
              }
            }}
          >
            <div className={step === 1 ? 'block' : 'hidden'}>
              <div className="mb-5 space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-sv-text-secondary">Sport Name *</label>
                <input
                  type="text"
                  className="w-full bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-sm px-4 py-2.5 text-sv-text placeholder:text-sv-text-muted focus:border-sv-brand focus:ring-1 focus:ring-sv-brand outline-none text-sm"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Badminton"
                />
              </div>
              <div className="mb-5 space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-sv-text-secondary">Icon</label>
                <div 
                  onClick={() => setShowIconModal(true)}
                  className="w-full bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] hover:border-sv-brand/50 rounded-sv-sm px-4 py-2.5 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {iconPath ? (
                      <img src={iconPath} alt="Selected Icon" className="w-6 h-6 object-contain" />
                    ) : (
                      <FiActivity className="w-6 h-6 text-sv-text-muted" />
                    )}
                    <span className={iconPath ? "text-sv-text text-sm font-medium" : "text-sv-text-muted text-sm"}>
                      {iconPath ? availableIcons.find(i => i.value === iconPath)?.label : "Select an Icon"}
                    </span>
                  </div>
                  <span className="text-sv-brand text-xs font-semibold uppercase tracking-wider">Change</span>
                </div>
              </div>
              <div className="mb-5 space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-sv-text-secondary">Description</label>
                <textarea
                  className="w-full bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-sm px-4 py-2.5 text-sv-text placeholder:text-sv-text-muted focus:border-sv-brand focus:ring-1 focus:ring-sv-brand outline-none text-sm"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Optional details about this sport..."
                />
              </div>
            </div>

            <div className={step === 2 ? 'block' : 'hidden'}>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-sv-text-secondary">Open Time</label>
                  <input
                    type="time"
                    className="w-full bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-sm px-4 py-2.5 text-sv-text focus:border-sv-brand focus:ring-1 focus:ring-sv-brand outline-none text-sm [color-scheme:dark]"
                    value={openTime}
                    onChange={e => setOpenTime(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-sv-text-secondary">Close Time</label>
                  <input
                    type="time"
                    className="w-full bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-sm px-4 py-2.5 text-sv-text focus:border-sv-brand focus:ring-1 focus:ring-sv-brand outline-none text-sm [color-scheme:dark]"
                    value={closeTime}
                    onChange={e => setCloseTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-5 space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-sv-text-secondary">Slot Duration (Minutes)</label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  className="w-full bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-sm px-4 py-2.5 text-sv-text focus:border-sv-brand focus:ring-1 focus:ring-sv-brand outline-none text-sm"
                  value={slotDurationMinutes}
                  onChange={e => setSlotDurationMinutes(Number(e.target.value))}
                />
              </div>
              <div className="mb-5 space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-sv-text-secondary">Reward Points Per Check-in</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-sm px-4 py-2.5 text-sv-text focus:border-sv-brand focus:ring-1 focus:ring-sv-brand outline-none text-sm"
                  value={rewardPointsPerCheckin}
                  onChange={e => setRewardPointsPerCheckin(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className={step === 3 ? 'block' : 'hidden'}>
              <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2 styled-scrollbar">
                {turfStates.map((turf, index) => (
                  <div
                    key={index}
                    className={`border border-[#2a2d3e] rounded-sv-sm p-4 transition-colors ${
                      turf.selected
                        ? 'bg-sv-brand-subtle border-sv-brand/50'
                        : 'bg-sv-bg border-sv-border border-[#2a2d3e]'
                    }`}
                  >
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
                            className="bg-sv-surface border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-xs px-3 py-1 text-sm text-sv-text focus:outline-none focus:border-sv-brand"
                          />
                        ) : (
                          <span className="text-sv-text font-semibold">{turf.name}</span>
                        )}
                      </label>
                      {turf.isNew && (
                         <button
                           type="button"
                           onClick={() => {
                             const newTurfs = turfStates.filter((_, i) => i !== index);
                             setTurfStates(newTurfs);
                           }}
                           className="text-sv-error-text hover:opacity-80"
                         >
                           <FiTrash2 size={16} />
                         </button>
                      )}
                    </div>
                    
                    {turf.selected && (
                      <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-sv-border border-[#2a2d3e]">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-sv-text-muted mb-1">Booking Price</label>
                          <input 
                            type="number" 
                            min="0"
                            value={turf.bookingPrice}
                            onChange={(e) => {
                              const newTurfs = [...turfStates];
                              newTurfs[index].bookingPrice = Number(e.target.value);
                              setTurfStates(newTurfs);
                            }}
                            className="w-full bg-sv-surface border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-xs px-3 py-2 text-sm text-sv-text focus:outline-none focus:border-sv-brand"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-sv-text-muted mb-1">Capacity/Slot</label>
                          <input 
                            type="number" 
                            min="1"
                            value={turf.capacityPerSlot}
                            onChange={(e) => {
                              const newTurfs = [...turfStates];
                              newTurfs[index].capacityPerSlot = Number(e.target.value);
                              setTurfStates(newTurfs);
                            }}
                            className="w-full bg-sv-surface border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-xs px-3 py-2 text-sm text-sv-text focus:outline-none focus:border-sv-brand"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-sv-text-muted mb-1">Icon</label>
                          <select 
                            value={turf.iconPath || ""}
                            onChange={(e) => {
                              const newTurfs = [...turfStates];
                              newTurfs[index].iconPath = e.target.value;
                              setTurfStates(newTurfs);
                            }}
                            className="w-full bg-sv-surface border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-xs px-3 py-2 text-sm text-sv-text focus:outline-none focus:border-sv-brand"
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
                  className="w-full py-3 border border-[#2a2d3e] border-dashed border-sv-border border-[#2a2d3e] text-sv-text-muted rounded-sv-sm hover:text-sv-brand hover:border-sv-brand/50 transition-colors flex items-center justify-center gap-2"
                >
                  <FiPlus size={16} /> Add New Turf
                </button>
              </div>
            </div>

            <div className="flex justify-between mt-6 pt-4 border-t border-sv-border border-[#2a2d3e]">
              {step > 1 ? (
                <Button type="button" variant="secondary" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              ) : (
                <div />
              )}
              {step < 3 ? (
                <Button type="button" variant="primary" onClick={handleNextStep}>
                  Next Step
                </Button>
              ) : (
                <Button type="submit" variant="primary" isLoading={loading}>
                  Save Sport
                </Button>
              )}
            </div>
          </form>
        </div>
      </Modal>

      <Modal
        isOpen={showIconModal}
        onClose={() => setShowIconModal(false)}
        title="Select Icon"
        size="md"
      >
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-2 styled-scrollbar">
          {availableIcons.map(icon => (
            <div 
              key={icon.value}
              onClick={() => { setIconPath(icon.value); setShowIconModal(false); }}
              className={`flex flex-col items-center justify-center gap-3 p-4 rounded-sv-md cursor-pointer border border-[#2a2d3e] transition-all ${
                iconPath === icon.value
                  ? 'bg-sv-brand-subtle border-sv-brand text-sv-brand'
                  : 'bg-sv-bg border-sv-border border-[#2a2d3e] hover:border-sv-brand/50 text-sv-text-muted hover:text-sv-text'
              }`}
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
      </Modal>
    </div>
  );
}
