"use client";
import { useState } from "react";
import { updatePhonePeSettings } from "./actions";
import { useAlert } from "@/components/AlertProvider";
import { FiSave, FiCreditCard } from "react-icons/fi";

export default function PhonePeClient({ initialSettings }: { initialSettings: Record<string, string> }) {
  const { showAlert } = useAlert();
  
  const [env, setEnv] = useState(initialSettings.PHONEPE_ENV || "UAT");
  const [merchantId, setMerchantId] = useState(initialSettings.PHONEPE_MERCHANT_ID || "");
  const [saltKey, setSaltKey] = useState(initialSettings.PHONEPE_SALT_KEY || "");
  const [saltIndex, setSaltIndex] = useState(initialSettings.PHONEPE_SALT_INDEX || "1");
  const [gateway, setGateway] = useState(initialSettings.PAYMENT_GATEWAY_ACTIVE || "NONE");
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updatePhonePeSettings({ 
        PHONEPE_ENV: env, 
        PHONEPE_MERCHANT_ID: merchantId, 
        PHONEPE_SALT_KEY: saltKey, 
        PHONEPE_SALT_INDEX: saltIndex,
        PAYMENT_GATEWAY_ACTIVE: gateway
      });
      showAlert("success", "PhonePe configurations saved successfully!");
    } catch (err: any) {
      showAlert("error", err.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <FiCreditCard className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">PhonePe Configuration</h2>
          <p className="text-sm text-gray-500">Manage your payment gateway secrets and environment</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Active Payment Gateway</label>
            <select
              value={gateway}
              onChange={(e) => setGateway(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            >
              <option value="NONE">None (Disabled)</option>
              <option value="PHONEPE">PhonePe</option>
              <option value="RAZORPAY">Razorpay</option>
              <option value="BOTH">Both (PhonePe & Razorpay)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PhonePe Environment</label>
            <select
              value={env}
              onChange={(e) => setEnv(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            >
              <option value="UAT">UAT (Sandbox / Testing)</option>
              <option value="PROD">PRODUCTION (Live)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Merchant ID (Client ID)</label>
            <input
              type="text"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. M22FEYQH8C3J3..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Salt Key (Client Secret)</label>
            <input
              type="password"
              value={saltKey}
              onChange={(e) => setSaltKey(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. NDczNDAwNzItMT..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Salt Index</label>
            <input
              type="text"
              value={saltIndex}
              onChange={(e) => setSaltIndex(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="1"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            <span>{loading ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
