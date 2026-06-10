"use client";
import { useState } from "react";
import { updateSettings } from "./actions";
import { useAlert } from "@/components/AlertProvider";
import { FiSave, FiSettings, FiCreditCard } from "react-icons/fi";

export default function SettingsClient({ initialSettings }: { initialSettings: Record<string, string> }) {
  const { showAlert } = useAlert();
  const [upiId, setUpiId] = useState(initialSettings.upiId || "");
  const [businessName, setBusinessName] = useState(initialSettings.businessName || "SportsVilla");
  const [openTime, setOpenTime] = useState(initialSettings.openTime || "06:00");
  const [closeTime, setCloseTime] = useState(initialSettings.closeTime || "23:00");
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings({ upiId, businessName, openTime, closeTime });
      showAlert("Settings Saved", "Your configuration has been updated successfully.", "success");
    } catch (err) {
      showAlert("Error", "Failed to save settings. Please try again.", "error");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-['Outfit'] text-white flex items-center gap-3">
          <FiSettings /> Platform Settings
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Configure your payment details and global platform preferences.</p>
      </div>

      <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#2a2d3e] bg-[#1c1f2e] flex items-center gap-3">
          <FiSettings className="text-orange-500 text-xl" />
          <h2 className="text-lg font-bold font-['Outfit'] text-white">General Configuration</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Facility Open Time</label>
                <input 
                  type="time" 
                  className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" 
                  value={openTime} 
                  onChange={e => setOpenTime(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Facility Close Time</label>
                <input 
                  type="time" 
                  className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" 
                  value={closeTime} 
                  onChange={e => setCloseTime(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="pt-6 border-t border-[#2a2d3e]">
              <h3 className="text-sm font-bold font-['Outfit'] text-white flex items-center gap-2 mb-4">
                <FiCreditCard className="text-orange-500" /> Payment Details
              </h3>
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Business Name (for QR Code)</label>
              <input 
                type="text" 
                className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" 
                value={businessName} 
                onChange={e => setBusinessName(e.target.value)} 
                required 
                placeholder="e.g. SportsVilla Arena" 
              />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">UPI ID (VPA)</label>
              <input 
                type="text" 
                className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" 
                value={upiId} 
                onChange={e => setUpiId(e.target.value)} 
                placeholder="e.g. yourname@upi" 
              />
              <p className="text-xs text-gray-500 mt-2">
                This UPI ID will be used to automatically generate payment QR codes for bookings. Ensure this is a valid business or personal UPI ID.
              </p>
            </div>

            <div className="pt-4 border-t border-[#2a2d3e]">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-6 py-3 text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer border-none disabled:opacity-50"
              >
                <FiSave /> {loading ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
