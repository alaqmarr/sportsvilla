"use client";
import React, { useState } from "react";
import { createTurf, updateTurf, deleteTurf } from "@/modules/turfs/turfs.action";
import { useAlert } from "@/components/AlertProvider";
import { FiTrash2, FiEdit2, FiPlus, FiMapPin, FiMap, FiActivity } from "react-icons/fi";
import {
  Card,
  Button,
  Badge,
  PageHeader,
  Modal,
  Input,
  Select,
} from "@/components/admin/ui";

export default function TurfsClient({ 
  initialTurfs, 
  sports, 
  availableIcons 
}: { 
  initialTurfs: any[]; 
  sports: any[]; 
  availableIcons: { value: string; label: string }[]; 
}) {
  const { showAlert, showConfirm } = useAlert();
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
    setEditingId("");
    setName("");
    setLocation("");
    setParentTurfId("");
    setIconPath("");
    setBookingPrice("");
    setBookingDurationMinutes(60);
    setCapacityPerSlot(1);
    setBookingValidityDays(0);
    setSelectedSportIds([]);
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
    setBookingPrice(turf.bookingPrice ?? "");
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
      setShowModal(false); 
      window.location.reload();
    } catch (err) {
      showAlert("Save Failed", "There was an unexpected error while trying to save this turf.", "error");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    showConfirm(
      "Confirm Deletion",
      "Are you sure?",
      async () => {
        try {
          await deleteTurf(id);
          setTurfs(turfs.filter(t => t.id !== id));
          showAlert("Turf Deleted", "The turf has been permanently removed.", "success");
        } catch (err) {
          showAlert("Deletion Blocked", "Cannot delete this turf because there are active sessions or children turfs linked to it.", "error");
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
        title="Grounds & Turfs"
        subtitle="Manage the physical spaces at your facility."
        actions={
          <Button onClick={openCreateModal} leftIcon={<FiPlus size={16} />}>
            Add New Turf
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {turfs.map(turf => (
          <Card
            key={turf.id}
            variant="default"
            padding="lg"
            hoverEffect
            className="flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-sv-sm bg-sv-brand-subtle border border-[#2a2d3e] border-sv-brand/20 text-sv-brand flex items-center justify-center text-lg overflow-hidden">
                  {turf.iconPath ? (
                    <img src={turf.iconPath} alt={turf.name} className="w-6 h-6 object-contain" />
                  ) : (
                    <FiMapPin />
                  )}
                </div>
                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEditModal(turf)}
                    title="Edit"
                  >
                    <FiEdit2 size={14} />
                  </Button>
                  <Button
                    variant="danger"
                    size="icon"
                    onClick={() => handleDelete(turf.id)}
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
                  </Button>
                </div>
              </div>

              <h3 className="text-base font-bold text-sv-text mt-4 leading-tight">{turf.name}</h3>
              <p className="text-sm text-sv-text-muted mt-1 mb-4 truncate">
                {turf.location || "No location provided"}
              </p>
            </div>

            <div className="mt-auto pt-3 border-t border-sv-border-subtle">
              {turf.bookingPrice !== null && turf.bookingPrice > 0 && (
                <div className="text-sm text-sv-text-secondary font-medium mb-3 flex items-center gap-2">
                  <span className="text-sv-brand font-bold">₹{turf.bookingPrice}</span> / {turf.bookingDurationMinutes}m
                </div>
              )}

              {turf.sports && turf.sports.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {turf.sports.map((ts: any) => (
                    <Badge key={ts.sportId} variant="neutral" size="sm">
                      <FiActivity size={10} className="mr-1" /> {ts.sport.name}
                    </Badge>
                  ))}
                </div>
              )}

              {turf.parentTurfId && (
                <Badge variant="default" size="sm">
                  <FiMap size={12} className="mr-1" /> Inside {turfs.find(t => t.id === turf.parentTurfId)?.name || 'Unknown'}
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Ground Details' : 'Add New Ground'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <Input
              label="Location / Turf Name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Main Badminton Hall"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-sv-text-secondary">Icon</label>
              <div 
                onClick={() => setShowIconModal(true)}
                className="w-full bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] hover:border-sv-brand/50 rounded-sv-sm px-4 py-2.5 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  {iconPath ? (
                    <img src={iconPath} alt="Selected Icon" className="w-6 h-6 object-contain" />
                  ) : (
                    <FiMapPin className="w-6 h-6 text-sv-text-muted" />
                  )}
                  <span className={iconPath ? "text-sv-text text-sm font-medium" : "text-sv-text-muted text-sm"}>
                    {iconPath ? availableIcons.find(i => i.value === iconPath)?.label : "Select an Icon"}
                  </span>
                </div>
                <span className="text-sv-brand text-xs font-semibold uppercase tracking-wider">Change</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-sv-text-secondary">Physical Address</label>
              <textarea
                className="w-full bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-sm px-4 py-2.5 text-sv-text placeholder:text-sv-text-muted focus:border-sv-brand focus:ring-1 focus:ring-sv-brand outline-none text-sm resize-none"
                value={location}
                onChange={e => setLocation(e.target.value)}
                rows={2}
                placeholder="Optional address or directions"
              />
            </div>

            <Select
              label="Inside another ground?"
              value={parentTurfId}
              onChange={e => setParentTurfId(e.target.value)}
            >
              <option value="">-- No, this is a main location --</option>
              {turfs.filter(t => t.id !== editingId).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-sv-text-secondary">Supported Sports *</label>
              <div className="bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-sm p-3 flex flex-col gap-2 max-h-40 overflow-y-auto styled-scrollbar">
                {sports.map(sport => (
                  <label key={sport.id} className="flex items-center gap-3 cursor-pointer text-sm text-sv-text-secondary hover:text-sv-text">
                    <input 
                      type="checkbox" 
                      checked={selectedSportIds.includes(sport.id)}
                      onChange={() => toggleSport(sport.id)}
                      className="w-4 h-4 accent-orange-500 rounded"
                    />
                    <span>{sport.name}</span>
                  </label>
                ))}
                {sports.length === 0 && <span className="text-sm text-sv-text-muted">No sports available.</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Slot Price (₹)"
                type="number"
                value={bookingPrice}
                onChange={e => setBookingPrice(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g. 500"
              />
              <Input
                label="Slot Dur. (Min)"
                type="number"
                value={bookingDurationMinutes}
                onChange={e => setBookingDurationMinutes(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g. 60"
              />
              <Input
                label="Capacity"
                type="number"
                value={capacityPerSlot}
                onChange={e => setCapacityPerSlot(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g. 1"
              />
              <Input
                label="Valid Days"
                type="number"
                value={bookingValidityDays}
                onChange={e => setBookingValidityDays(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g. 0"
              />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 pt-4 border-t border-sv-border border-[#2a2d3e] flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full sm:w-auto"
            >
              Save Location
            </Button>
          </div>
        </form>
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
                <FiMapPin className="w-8 h-8" />
              )}
              <span className="text-[10px] uppercase tracking-wider text-center font-semibold leading-tight">{icon.label}</span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
