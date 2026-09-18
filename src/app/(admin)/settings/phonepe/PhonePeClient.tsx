"use client";
import React, { useState } from "react";
import { updatePhonePeSettings } from "./actions";
import { useAlert } from "@/components/AlertProvider";
import { FiSave, FiCreditCard } from "react-icons/fi";
import {
  Card,
  Button,
  PageHeader,
  Input,
  Select,
} from "@/components/admin/ui";

export default function PhonePeClient({ initialSettings }: { initialSettings: Record<string, string> }) {
  const { showAlert } = useAlert();
  
  const [env, setEnv] = useState(initialSettings.PHONEPE_ENV || "UAT");
  const [merchantId, setMerchantId] = useState(initialSettings.PHONEPE_MERCHANT_ID || "");
  const [saltKey, setSaltKey] = useState(initialSettings.PHONEPE_SALT_KEY || "");
  const [saltIndex, setSaltIndex] = useState(initialSettings.PHONEPE_SALT_INDEX || "1");
  const [gateway, setGateway] = useState(initialSettings.PAYMENT_GATEWAY_ACTIVE || "NONE");
  
  const [razorpayKeyId, setRazorpayKeyId] = useState(initialSettings.RAZORPAY_KEY_ID || "");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState(initialSettings.RAZORPAY_KEY_SECRET || "");

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
        PAYMENT_GATEWAY_ACTIVE: gateway,
        RAZORPAY_KEY_ID: razorpayKeyId,
        RAZORPAY_KEY_SECRET: razorpayKeySecret
      });
      showAlert("Success", "Payment configurations saved successfully!", "success");
    } catch (err: any) {
      showAlert("Error", err.message || "Failed to save settings", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Payment Gateways"
        subtitle="Manage your PhonePe and Razorpay configurations and API credentials."
      />

      <Card variant="default" padding="none" className="overflow-hidden">
        <div className="p-6 border-b border-sv-border-subtle bg-sv-surface-raised flex items-center gap-3">
          <div className="p-2 bg-sv-brand-subtle text-sv-brand rounded-sv-sm">
            <FiCreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-sans text-sv-text">Payment Gateways Configuration</h2>
            <p className="text-xs text-sv-text-muted">Manage active gateways and environment credentials</p>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2">
                <Select
                  label="Active Payment Gateway"
                  value={gateway}
                  onChange={(e) => setGateway(e.target.value)}
                >
                  <option value="NONE">None (Disabled)</option>
                  <option value="PHONEPE">PhonePe</option>
                  <option value="RAZORPAY">Razorpay</option>
                  <option value="BOTH">Both (PhonePe & Razorpay)</option>
                </Select>
              </div>

              <div className="md:col-span-2 pt-4 border-t border-sv-border-subtle">
                <h3 className="text-sm font-bold font-sans text-sv-brand uppercase tracking-wider">PhonePe Settings</h3>
              </div>

              <div>
                <Select
                  label="PhonePe Environment"
                  value={env}
                  onChange={(e) => setEnv(e.target.value)}
                >
                  <option value="UAT">UAT (Sandbox / Testing)</option>
                  <option value="PROD">PRODUCTION (Live)</option>
                </Select>
              </div>

              <div>
                <Input
                  label="Merchant ID (Client ID)"
                  type="text"
                  value={merchantId}
                  onChange={(e) => setMerchantId(e.target.value)}
                  placeholder="e.g. M22FEYQH8C3J3..."
                />
              </div>

              <div>
                <Input
                  label="Salt Key (Client Secret)"
                  type="password"
                  value={saltKey}
                  onChange={(e) => setSaltKey(e.target.value)}
                  placeholder="e.g. NDczNDAwNzItMT..."
                />
              </div>

              <div>
                <Input
                  label="Salt Index"
                  type="text"
                  value={saltIndex}
                  onChange={(e) => setSaltIndex(e.target.value)}
                  placeholder="1"
                />
              </div>

              <div className="md:col-span-2 pt-4 border-t border-sv-border-subtle">
                <h3 className="text-sm font-bold font-sans text-sv-brand uppercase tracking-wider">Razorpay Settings</h3>
              </div>

              <div>
                <Input
                  label="Razorpay Key ID"
                  type="text"
                  value={razorpayKeyId}
                  onChange={(e) => setRazorpayKeyId(e.target.value)}
                  placeholder="e.g. rzp_test_..."
                />
              </div>

              <div>
                <Input
                  label="Razorpay Key Secret"
                  type="password"
                  value={razorpayKeySecret}
                  onChange={(e) => setRazorpayKeySecret(e.target.value)}
                  placeholder="e.g. A23B..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-sv-border border-[#2a2d3e]">
              <Button
                type="submit"
                disabled={loading}
                isLoading={loading}
                variant="primary"
                leftIcon={<FiSave className="w-4 h-4" />}
              >
                Save Settings
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
