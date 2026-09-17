import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FiX, FiGift, FiUserPlus, FiAward } from "react-icons/fi";
import { Card, Button, Input, Badge } from "@/components/admin/ui";

export function GenerateCouponModal({
  phone,
  onClose,
  onCouponGenerated,
}: {
  phone: string;
  onClose: () => void;
  onCouponGenerated: (code: string, amount: number) => void;
}) {
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/whatsapp-crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "GENERATE_COUPON", phone, discountAmount: amount }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Coupon generated successfully");
        onCouponGenerated(data.coupon.code, amount);
      } else {
        toast.error(data.error || "Failed to generate coupon");
      }
    } catch (err) {
      toast.error("Error generating coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card variant="default" className="w-full max-w-sm overflow-hidden flex flex-col shadow-sv-2xl">
        <div className="p-4 border-b border-sv-border flex items-center justify-between bg-sv-surface-raised">
          <h3 className="font-bold text-sv-text flex items-center gap-2">
            <FiGift className="text-sv-brand" /> Generate Coupon
          </h3>
          <button onClick={onClose} className="p-1 text-sv-text-muted hover:text-sv-text">
            <FiX />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 bg-sv-surface">
          <div>
            <label className="text-xs font-semibold text-sv-text-muted uppercase tracking-wider mb-1 block">
              Discount Amount (₹)
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={1}
              required
            />
          </div>
          <p className="text-xs text-sv-text-muted">
            This will create a one-time use discount code for +91 {phone}.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-sv-border mt-2">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={loading}>
              Generate
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export function RegisterUserModal({
  phone,
  onClose,
  onSuccess,
}: {
  phone: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/whatsapp-crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REGISTER", phone, name }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User registered successfully");
        onSuccess();
      } else {
        toast.error(data.error || "Failed to register user");
      }
    } catch (err) {
      toast.error("Error registering user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card variant="default" className="w-full max-w-sm overflow-hidden flex flex-col shadow-sv-2xl">
        <div className="p-4 border-b border-sv-border flex items-center justify-between bg-sv-surface-raised">
          <h3 className="font-bold text-sv-text flex items-center gap-2">
            <FiUserPlus className="text-sv-info" /> Register User
          </h3>
          <button onClick={onClose} className="p-1 text-sv-text-muted hover:text-sv-text">
            <FiX />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 bg-sv-surface">
          <div>
            <label className="text-xs font-semibold text-sv-text-muted uppercase tracking-wider mb-1 block">
              Phone Number
            </label>
            <Input type="text" value={phone} disabled />
          </div>
          <div>
            <label className="text-xs font-semibold text-sv-text-muted uppercase tracking-wider mb-1 block">
              Full Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-sv-border mt-2">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={loading}>
              Register
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export function AssignMembershipModal({
  phone,
  onClose,
  onSuccess,
}: {
  phone: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch("/api/admin/whatsapp-crm")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPlans(data.plans);
          if (data.plans.length > 0) setSelectedPlan(data.plans[0].id);
        }
        setFetching(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/whatsapp-crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ASSIGN_MEMBERSHIP", phone, planId: selectedPlan }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Membership assigned successfully");
        onSuccess();
      } else {
        toast.error(data.error || "Failed to assign membership");
      }
    } catch (err) {
      toast.error("Error assigning membership");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card variant="default" className="w-full max-w-sm overflow-hidden flex flex-col shadow-sv-2xl">
        <div className="p-4 border-b border-sv-border flex items-center justify-between bg-sv-surface-raised">
          <h3 className="font-bold text-sv-text flex items-center gap-2">
            <FiAward className="text-sv-status-success" /> Assign Membership
          </h3>
          <button onClick={onClose} className="p-1 text-sv-text-muted hover:text-sv-text">
            <FiX />
          </button>
        </div>
        {fetching ? (
          <div className="p-8 text-center text-sv-text-muted text-sm">Loading plans...</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 bg-sv-surface">
            <div>
              <label className="text-xs font-semibold text-sv-text-muted uppercase tracking-wider mb-1 block">
                Select Plan
              </label>
              <select
                className="w-full bg-sv-bg border border-sv-border rounded-sv-md px-3 py-2 text-sm text-sv-text focus:outline-none focus:border-sv-brand focus:ring-1 focus:ring-sv-brand transition-colors"
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                required
              >
                <option value="" disabled>Select a plan</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.durationMonths} months)
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-sv-text-muted">
              This will instantly activate the membership for +91 {phone} (Admin override).
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-sv-border mt-2">
              <Button variant="ghost" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={loading} disabled={!selectedPlan}>
                Assign
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
