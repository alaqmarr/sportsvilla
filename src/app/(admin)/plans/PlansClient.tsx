"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPlan, updatePlan, deletePlan } from "./actions";
import { useAlert } from "@/components/AlertProvider";
import { FiTrash2, FiEdit2, FiPlus, FiCheck, FiUsers } from "react-icons/fi";
import { PageHeader, Card, Badge, Button, Modal, Input, Select } from "@/components/admin/ui";

export default function PlansClient({ initialPlans, sports }: { initialPlans: any[], sports: any[] }) {
  const { showAlert, showConfirm } = useAlert();
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans);
  const [showModal, setShowModal] = useState(false);
  
  const [editingId, setEditingId] = useState("");
  const [name, setName] = useState("");
  const [sportId, setSportId] = useState("");
  const [durationInDays, setDurationInDays] = useState(30);
  const [price, setPrice] = useState(0);
  const [slotsPerDay, setSlotsPerDay] = useState(1);
  const [isFamilyPlan, setIsFamilyPlan] = useState(false);
  const [familySize, setFamilySize] = useState<number | "">("");
  const [rewardPointsOnPurchase, setRewardPointsOnPurchase] = useState<number>(0);
  const [rewardPointsPerCheckin, setRewardPointsPerCheckin] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  function openCreateModal() {
    setEditingId(""); setName(""); setSportId(sports[0]?.id || ""); setDurationInDays(30); setPrice(1000); setSlotsPerDay(1); setIsFamilyPlan(false); setFamilySize(""); setRewardPointsOnPurchase(0); setRewardPointsPerCheckin(0);
    setShowModal(true);
  }

  function openEditModal(plan: any) {
    setEditingId(plan.id); setName(plan.name); setSportId(plan.sportId); setDurationInDays(plan.durationInDays); setPrice(plan.price); setSlotsPerDay(plan.slotsPerDay || 1); setIsFamilyPlan(plan.isFamilyPlan || false); setFamilySize(plan.familySize || ""); setRewardPointsOnPurchase(plan.rewardPointsOnPurchase || 0); setRewardPointsPerCheckin(plan.rewardPointsPerCheckin || 0);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      const payload = {
        name,
        sportId,
        durationInDays: Number(durationInDays),
        price: Number(price),
        slotsPerDay: Number(slotsPerDay),
        isFamilyPlan,
        familySize: isFamilyPlan ? Number(familySize) : null,
        rewardPointsOnPurchase: Number(rewardPointsOnPurchase),
        rewardPointsPerCheckin: Number(rewardPointsPerCheckin)
      };

      if (editingId) {
        await updatePlan(editingId, payload);
        showAlert("Plan Updated", `The membership plan '${name}' has been successfully updated.`, "success");
      } else {
        await createPlan(payload);
        showAlert("Plan Created", `A new membership plan '${name}' has been added to the catalog.`, "success");
      }
      setShowModal(false); window.location.reload();
    } catch (err) {
      showAlert("Save Failed", "There was an error saving the membership plan. Please verify the details.", "error");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    showConfirm(
      "Confirm Deletion",
      "Are you sure you want to delete this membership plan?",
      async () => {
        try {
          await deletePlan(id);
          setPlans(plans.filter(p => p.id !== id));
          showAlert("Plan Deleted", "The membership plan has been permanently removed.", "success");
        } catch (err) {
          showAlert("Deletion Blocked", "Cannot delete this plan because there are active members currently enrolled in it.", "error");
        }
      },
      undefined,
      "Delete",
      "Cancel",
      "error"
    );
  }

  return (
    <div className="space-y-6 pb-20 font-sans">
      <PageHeader
        title="Membership Plans"
        subtitle="Create subscription tiers and packages for your sports."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Plans" },
        ]}
        actions={
          <Button
            onClick={openCreateModal}
            leftIcon={<FiPlus />}
            variant="primary"
          >
            Create New Plan
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <Card key={plan.id} variant="default" className="flex flex-col justify-between p-6">
            <div>
              <div className="flex justify-between items-start">
                <Badge variant="info" size="sm">
                  {plan.sport.name}
                </Badge>
                <div className="flex gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditModal(plan)}
                    title="Edit"
                  >
                    <FiEdit2 size={14} />
                  </Button>
                  <Button
                    variant="danger"
                    size="icon"
                    onClick={() => handleDelete(plan.id)}
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
                  </Button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-sv-text mt-4">{plan.name}</h3>
              <div className="text-3xl font-bold text-sv-text mt-1 mb-5">
                ₹{plan.price.toLocaleString()}
              </div>

              <ul className="space-y-3 text-sm text-sv-text-secondary">
                <li className="flex items-center gap-3">
                  <FiCheck className="text-sv-status-success text-lg flex-shrink-0" /> Valid for {plan.durationInDays} days
                </li>
                <li className="flex items-center gap-3">
                  <FiCheck className="text-sv-status-success text-lg flex-shrink-0" /> {plan.slotsPerDay} Check-In{plan.slotsPerDay > 1 ? 's' : ''} per day limit
                </li>
                <li className="flex items-center gap-3">
                  <FiCheck className="text-sv-status-success text-lg flex-shrink-0" /> Access to {plan.sport.name} facilities
                </li>
                {plan.isFamilyPlan && (
                  <li className="flex items-center gap-3">
                    <FiUsers className="text-sv-status-info text-lg flex-shrink-0" /> Family Plan (Up to {plan.familySize} members)
                  </li>
                )}
                {plan.rewardPointsOnPurchase > 0 && (
                  <li className="flex items-center gap-3 text-sv-brand font-medium">
                    <span className="text-lg flex-shrink-0 font-bold">★</span> Earn {plan.rewardPointsOnPurchase} pts on purchase
                  </li>
                )}
                {plan.rewardPointsPerCheckin > 0 && (
                  <li className="flex items-center gap-3 text-sv-brand font-medium">
                    <span className="text-lg flex-shrink-0 font-bold">★</span> Earn {plan.rewardPointsPerCheckin} pts per check-in
                  </li>
                )}
                <li className="flex items-center gap-3 text-sv-brand font-semibold mt-2 pt-2 border-t border-sv-border-subtle">
                  <FiUsers className="text-lg flex-shrink-0" /> {plan._count?.memberships || 0} Active Enrollments
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-sv-border-subtle">
              <Button
                variant="secondary"
                onClick={() => router.push(`/plans/${plan.id}`)}
                className="w-full"
              >
                View Plan Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Plan' : 'Create New Plan'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Plan Name"
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Monthly Pro"
          />

          <Select
            label="Target Sport"
            required
            value={sportId}
            onChange={e => setSportId(e.target.value)}
            options={[
              { label: "-- Select Sport --", value: "" },
              ...sports.map(s => ({ label: s.name, value: s.id }))
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (₹)"
              type="number"
              required
              min={0}
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
            />
            <Input
              label="Duration (Days)"
              type="number"
              required
              min={1}
              value={durationInDays}
              onChange={e => setDurationInDays(Number(e.target.value))}
            />
          </div>

          <div>
            <Input
              label="Daily Check-ins Allowed"
              type="number"
              required
              min={1}
              value={slotsPerDay}
              onChange={e => setSlotsPerDay(Number(e.target.value))}
              helperText="Maximum number of times a member can mark attendance per day with this plan."
            />
          </div>

          <div className="bg-sv-surface-raised border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-md p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-sv-border border-[#2a2d3e] bg-sv-bg text-sv-brand focus:ring-sv-brand"
                checked={isFamilyPlan}
                onChange={(e) => setIsFamilyPlan(e.target.checked)}
              />
              <div>
                <div className="text-sm font-medium text-sv-text">This is a Family Plan</div>
                <div className="text-xs text-sv-text-muted">Allows multiple family members under a single assignment</div>
              </div>
            </label>

            {isFamilyPlan && (
              <div className="pt-3 border-t border-sv-border-subtle">
                <Input
                  label="Maximum Family Members Allowed"
                  type="number"
                  required={isFamilyPlan}
                  min={2}
                  value={familySize}
                  onChange={e => setFamilySize(Number(e.target.value))}
                  placeholder="e.g. 4"
                />
              </div>
            )}
          </div>

          <div className="bg-sv-surface-raised border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-sv-md p-4 space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-sv-brand">
              Loyalty Rewards
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Points on Purchase"
                type="number"
                min={0}
                value={rewardPointsOnPurchase}
                onChange={e => setRewardPointsOnPurchase(Number(e.target.value))}
              />
              <Input
                label="Points per Check-in"
                type="number"
                min={0}
                value={rewardPointsPerCheckin}
                onChange={e => setRewardPointsPerCheckin(Number(e.target.value))}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className="w-full mt-4"
          >
            {loading ? "Saving..." : "Publish Plan"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
