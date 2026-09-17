"use client";
import { formatIST } from "@/lib/dateUtils";
import { useState, useEffect } from "react";
import { fetchPlanDetail } from "./actions";
import { startOfDay } from "date-fns";
import { FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/AlertProvider";
import {
  PageHeader,
  Badge,
  Avatar,
  DataTable,
  ColumnDef,
  TableSkeleton,
} from "@/components/admin/ui";

export default function PlanDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { showAlert } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'EXPIRED'>('ACTIVE');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchPlanDetail(id);
        setPlan(data);
      } catch (err) {
        showAlert("Data Error", "Failed to load the detailed information for this plan.", "error");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 pb-20 font-sans">
        <TableSkeleton rows={6} columns={4} />
      </div>
    );
  }

  if (!plan) return null;

  const today = startOfDay(new Date());

  const activeMemberships = plan.memberships.filter((m: any) => m.status === 'ACTIVE' && new Date(m.endDate) >= today);
  const expiredMemberships = plan.memberships.filter((m: any) => m.status === 'EXPIRED' || new Date(m.endDate) < today);

  const displayedMemberships = activeTab === 'ACTIVE' ? activeMemberships : expiredMemberships;

  const columns: ColumnDef<any>[] = [
    {
      key: "member",
      header: "Member Details",
      render: (m: any) => (
        <div className="flex items-center gap-3">
          <Avatar name={m.member.name || "Member"} size="sm" />
          <div>
            <div className="text-sv-text font-medium">{m.member.name}</div>
            <div className="text-sv-text-muted text-xs mt-0.5">{m.member.mobile}</div>
          </div>
        </div>
      ),
    },
    {
      key: "period",
      header: "Enrollment Period",
      render: (m: any) => (
        <span className="text-sv-text-secondary text-sm">
          {formatIST(new Date(m.startDate), 'MMM d, yy')} - {formatIST(new Date(m.endDate), 'MMM d, yy')}
        </span>
      ),
    },
    {
      key: "status",
      header: activeTab === 'ACTIVE' ? "Days Left" : "Status",
      render: (m: any) => {
        if (activeTab === 'ACTIVE') {
          const endDate = startOfDay(new Date(m.endDate));
          const msLeft = endDate.getTime() - today.getTime();
          const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
          return (
            <Badge variant={daysLeft <= 5 ? "error" : "success"} size="sm">
              {daysLeft} Days Left
            </Badge>
          );
        }
        return (
          <Badge variant="default" size="sm">
            Expired
          </Badge>
        );
      },
    },
    {
      key: "attendance",
      header: "Current Month Visited",
      render: (m: any) => (
        <div className="flex items-center gap-2">
          <FiClock className="text-sv-brand" />
          <span className="text-sv-text font-semibold">{m.member.attendances.length} visits</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-20 font-sans">
      <PageHeader
        title={plan.name}
        subtitle={`₹${plan.price.toLocaleString()} • Valid for ${plan.durationInDays} days • ${plan.slotsPerDay} Check-in${plan.slotsPerDay > 1 ? 's' : ''}/day`}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Plans", href: "/plans" },
          { label: plan.name },
        ]}
        actions={
          <div className="flex gap-3">
            <div className="bg-sv-surface border border-sv-border px-4 py-2.5 rounded-sv-md flex flex-col items-center shadow-sv-sm">
              <span className="text-sv-status-success text-xl font-bold">{activeMemberships.length}</span>
              <span className="text-sv-text-muted text-[10px] uppercase font-bold tracking-wider">Active</span>
            </div>
            <div className="bg-sv-surface border border-sv-border px-4 py-2.5 rounded-sv-md flex flex-col items-center shadow-sv-sm">
              <span className="text-sv-status-error text-xl font-bold">{expiredMemberships.length}</span>
              <span className="text-sv-text-muted text-[10px] uppercase font-bold tracking-wider">Expired</span>
            </div>
          </div>
        }
      />

      <div className="space-y-0">
        <div className="flex border-b border-sv-border bg-sv-surface rounded-t-sv-lg overflow-hidden">
          <button 
            onClick={() => setActiveTab('ACTIVE')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'ACTIVE'
                ? 'bg-sv-brand/10 text-sv-brand border-sv-brand'
                : 'bg-transparent text-sv-text-muted hover:text-sv-text border-transparent'
            }`}
          >
            <FiCheckCircle /> Active Enrollees
          </button>
          <button 
            onClick={() => setActiveTab('EXPIRED')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'EXPIRED'
                ? 'bg-sv-brand/10 text-sv-brand border-sv-brand'
                : 'bg-transparent text-sv-text-muted hover:text-sv-text border-transparent'
            }`}
          >
            <FiXCircle /> Expired / Past Enrollees
          </button>
        </div>

        <DataTable<any>
          columns={columns}
          data={displayedMemberships}
          keyExtractor={(m) => m.id}
          onRowClick={(m) => router.push(`/reports/memberships/${m.id}`)}
          emptyTitle={`No ${activeTab.toLowerCase()} members found`}
          emptyMessage={`There are currently no ${activeTab.toLowerCase()} members enrolled in this plan.`}
          className="rounded-t-none border-t-0"
        />
      </div>
    </div>
  );
}
