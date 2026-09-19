"use client";
import React, { useState } from "react";
import { updateSettings } from "@/modules/settings/settings.action";
import { useAlert } from "@/components/AlertProvider";
import { FiSave, FiSettings, FiCreditCard } from "react-icons/fi";
import {
  Card,
  Button,
  PageHeader,
  Input,
} from "@/components/admin/ui";

export default function SettingsClient({ initialSettings }: { initialSettings: Record<string, string> }) {
  const { showAlert, showConfirm } = useAlert();
  const [upiId, setUpiId] = useState(initialSettings.upiId || "");
  const [businessName, setBusinessName] = useState(initialSettings.businessName || "SportsVilla");
  const [openTime, setOpenTime] = useState(initialSettings.openTime || "06:00");
  const [closeTime, setCloseTime] = useState(initialSettings.closeTime || "23:00");
  const [pointsPerRupee, setPointsPerRupee] = useState(initialSettings.pointsPerRupee || "100");
  const [clientCancellationLimitHours, setClientCancellationLimitHours] = useState(initialSettings.CLIENT_CANCELLATION_LIMIT_HOURS || "3");
  const [allowRescheduling, setAllowRescheduling] = useState(initialSettings.ALLOW_RESCHEDULING !== "false");
  const [allowCancellation, setAllowCancellation] = useState(initialSettings.ALLOW_CANCELLATION !== "false");
  const [allowOnlineBooking, setAllowOnlineBooking] = useState(initialSettings.ALLOW_ONLINE_BOOKING !== "false");
  const [maintenanceMode, setMaintenanceMode] = useState(initialSettings.MAINTENANCE_MODE === "true");
  const [gdriveFolderId, setGdriveFolderId] = useState(initialSettings.GDRIVE_BACKUP_FOLDER_ID || "");
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings({ 
        upiId, 
        businessName, 
        openTime, 
        closeTime, 
        pointsPerRupee, 
        CLIENT_CANCELLATION_LIMIT_HOURS: clientCancellationLimitHours,
        ALLOW_RESCHEDULING: allowRescheduling ? "true" : "false",
        ALLOW_CANCELLATION: allowCancellation ? "true" : "false",
        ALLOW_ONLINE_BOOKING: allowOnlineBooking ? "true" : "false",
        MAINTENANCE_MODE: maintenanceMode ? "true" : "false",
        GDRIVE_BACKUP_FOLDER_ID: gdriveFolderId
      });
      showAlert("Settings Saved", "Your configuration has been updated successfully.", "success");
    } catch (err) {
      showAlert("Error", "Failed to save settings. Please try again.", "error");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Platform Settings"
        subtitle="Configure your payment details, operational hours, and global platform preferences."
      />

      <Card variant="default" padding="none" className="overflow-hidden">
        <div className="p-6 border-b border-sv-border-subtle bg-sv-surface-raised flex items-center gap-3">
          <FiSettings className="text-sv-brand text-xl" />
          <h2 className="text-lg font-bold font-sans text-sv-text">General Configuration</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Facility Open Time"
                type="time"
                value={openTime}
                onChange={e => setOpenTime(e.target.value)}
                required
                className="[color-scheme:dark]"
              />
              <Input
                label="Facility Close Time"
                type="time"
                value={closeTime}
                onChange={e => setCloseTime(e.target.value)}
                required
                className="[color-scheme:dark]"
              />
            </div>

            <div className="pt-6 border-t border-sv-border-subtle">
              <h3 className="text-sm font-bold font-sans text-sv-text flex items-center gap-2 mb-4">
                <FiCreditCard className="text-sv-brand" /> Payment Details
              </h3>
            </div>
            
            <Input
              label="Business Name (for QR Code)"
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              required
              placeholder="e.g. SportsVilla Arena"
            />
            
            <div>
              <Input
                label="UPI ID (VPA)"
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="e.g. yourname@upi"
                helperText="This UPI ID will be used to automatically generate payment QR codes for bookings. Ensure this is a valid business or personal UPI ID."
              />
            </div>

            <div className="pt-6 border-t border-sv-border-subtle">
              <h3 className="text-sm font-bold font-sans text-sv-text flex items-center gap-2 mb-4">
                <FiSettings className="text-sv-brand" /> Loyalty Program
              </h3>
            </div>

            <div>
              <Input
                label="Points to Rupee Ratio (Points per ₹1)"
                type="number"
                min="1"
                value={pointsPerRupee}
                onChange={e => setPointsPerRupee(e.target.value)}
                required
                placeholder="e.g. 100"
                helperText="Enter how many reward points equal 1 Rupee discount. (e.g. 100 points = ₹1 means 1000 points gives a ₹10 discount)."
              />
            </div>

            <div className="pt-6 border-t border-sv-border-subtle">
              <h3 className="text-sm font-bold font-sans text-sv-text flex items-center gap-2 mb-4">
                <FiSettings className="text-sv-brand" /> Booking Policies
              </h3>
            </div>

            <div>
              <Input
                label="Client Cancellation / Reschedule Time Limit (Hours)"
                type="number"
                min="0"
                value={clientCancellationLimitHours}
                onChange={e => setClientCancellationLimitHours(e.target.value)}
                required
                placeholder="e.g. 3"
                helperText="The number of hours before the booking start time where the client can no longer cancel or reschedule from the app. Set to 0 to disable restrictions."
              />
            </div>

            <div className="pt-6 border-t border-sv-border-subtle">
              <h3 className="text-sm font-bold font-sans text-sv-text flex items-center gap-2 mb-4">
                <FiSettings className="text-sv-brand" /> App Controls & Maintenance
              </h3>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={allowOnlineBooking} 
                  onChange={e => setAllowOnlineBooking(e.target.checked)} 
                  className="w-5 h-5 rounded accent-orange-500 bg-sv-bg" 
                />
                <div>
                  <span className="block text-sm font-semibold text-sv-text">Allow Online Booking</span>
                  <span className="block text-xs text-sv-text-muted">Enable or disable new bookings from the mobile app.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={allowRescheduling} 
                  onChange={e => setAllowRescheduling(e.target.checked)} 
                  className="w-5 h-5 rounded accent-orange-500 bg-sv-bg" 
                />
                <div>
                  <span className="block text-sm font-semibold text-sv-text">Allow Client Rescheduling</span>
                  <span className="block text-xs text-sv-text-muted">Allow users to reschedule their bookings from the app.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={allowCancellation} 
                  onChange={e => setAllowCancellation(e.target.checked)} 
                  className="w-5 h-5 rounded accent-orange-500 bg-sv-bg" 
                />
                <div>
                  <span className="block text-sm font-semibold text-sv-text">Allow Client Cancellation</span>
                  <span className="block text-xs text-sv-text-muted">Allow users to cancel their bookings from the app.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <input 
                  type="checkbox" 
                  checked={maintenanceMode} 
                  onChange={e => setMaintenanceMode(e.target.checked)} 
                  className="w-5 h-5 rounded accent-red-500 bg-sv-bg" 
                />
                <div>
                  <span className="block text-sm font-bold text-sv-error-text">Maintenance Mode</span>
                  <span className="block text-xs text-sv-text-muted">Block all users from accessing the mobile app. Show a maintenance screen instead.</span>
                </div>
              </label>
            </div>

            <div className="pt-6 border-t border-sv-border-subtle">
              <h3 className="text-sm font-bold font-sans text-sv-text flex items-center gap-2 mb-4">
                <FiSettings className="text-sv-brand" /> Automated Backups
              </h3>
            </div>

            <div>
              <Input
                label="Google Drive Backup Folder ID"
                type="text"
                value={gdriveFolderId}
                onChange={e => setGdriveFolderId(e.target.value)}
                placeholder="e.g. 10Ulnl1CQugl9Otfrau3hkNeR6Urb5PO-"
                helperText="Folder ID where automated nightly database and log backups will be stored."
              />
            </div>

            <div className="pt-4 border-t border-sv-border border-[#2a2d3e] flex justify-end">
              <Button 
                type="submit" 
                disabled={loading}
                isLoading={loading}
                variant="primary"
                leftIcon={<FiSave />}
              >
                Save Configuration
              </Button>
            </div>
          </form>
        </div>
      </Card>

      <Card variant="default" padding="none" className="overflow-hidden">
        <div className="p-6 border-b border-sv-border-subtle bg-sv-surface-raised flex items-center gap-3">
          <FiSettings className="text-sv-error-text text-xl" />
          <h2 className="text-lg font-bold font-sans text-sv-text">Database Maintenance</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-sv-text">Populate Family Groups</h3>
              <p className="text-xs text-sv-text-muted mt-1 mb-3">
                Creates `FamilyGroup` records and assigns `familyId` to existing members based on their mobile numbers (no data loss).
              </p>
              <Button 
                type="button" 
                variant="danger"
                size="sm"
                disabled={loading}
                isLoading={loading}
                onClick={() => {
                  showConfirm(
                    "Confirm Migration",
                    "Are you sure you want to run this data migration?",
                    async () => {
                      setLoading(true);
                      try {
                        const res = await fetch('/api/admin/family-groups/populate', { method: 'POST' });
                        const data = await res.json();
                        if (data.success) {
                          showAlert("Success", data.message, "success");
                        } else {
                          showAlert("Error", data.error || "Failed to populate", "error");
                        }
                      } catch (err) {
                        showAlert("Error", "Failed to run migration", "error");
                      }
                      setLoading(false);
                    },
                    undefined,
                    "Run Migration",
                    "Cancel",
                    "error"
                  );
                }}
              >
                Run Migration
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
