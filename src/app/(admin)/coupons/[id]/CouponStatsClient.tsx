"use client";

import { FiTag, FiUsers, FiDollarSign, FiCalendar, FiTrendingUp } from "react-icons/fi";
import { formatIST } from "@/lib/dateUtils";
import { PageHeader, Stat, DataTable, ColumnDef, Badge } from "@/components/admin/ui";

interface CouponUsage {
  id: string;
  createdAt: string | Date;
  discountAmount?: number | null;
  memberId?: string | null;
  member?: {
    id: string;
    name?: string | null;
    mobile?: string | null;
  } | null;
  booking?: {
    id: string;
    startTime: string | Date;
    turf?: { name: string } | null;
    sport?: { name: string } | null;
  } | null;
}

interface CouponDetails {
  id: string;
  code: string;
  isActive: boolean;
  maxUses?: number | null;
  expiryDate?: string | Date | null;
  usages: CouponUsage[];
}

export default function CouponStatsClient({ coupon }: { coupon: CouponDetails }) {
  const totalUsages = coupon.usages.length;
  const totalDiscountGiven = coupon.usages.reduce((sum: number, u: any) => sum + (u.discountAmount || 0), 0);
  
  // Unique members who used it
  const uniqueMembers = new Set(coupon.usages.map((u: any) => u.memberId)).size;

  const columns: ColumnDef<CouponUsage>[] = [
    {
      key: "createdAt",
      header: "Date / Time (IST)",
      render: (usage) => (
        <span className="text-sv-text whitespace-nowrap text-sm">
          {formatIST(new Date(usage.createdAt), 'dd MMM yyyy, h:mm a')}
        </span>
      ),
    },
    {
      key: "member",
      header: "Member",
      render: (usage) => (
        <div>
          <div className="font-bold text-sv-brand text-sm">
            {usage.member?.name || "Unknown"}
          </div>
          <div className="text-sv-text-muted text-xs">
            {usage.member?.mobile || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "booking",
      header: "Booking Details",
      render: (usage) => {
        if (!usage.booking) {
          return <span className="text-sv-text-muted italic text-xs">Booking deleted</span>;
        }
        return (
          <div>
            <div className="text-sv-text font-medium text-sm">
              {usage.booking.turf?.name} ({usage.booking.sport?.name})
            </div>
            <div className="text-xs text-sv-text-muted mt-0.5">
              Booking #{usage.booking.id.slice(-6).toUpperCase()} • {formatIST(new Date(usage.booking.startTime), 'MMM dd, h:mm a')}
            </div>
          </div>
        );
      },
    },
    {
      key: "discount",
      header: "Discount Saved",
      align: "right",
      render: (usage) => (
        <span className="font-bold text-sv-status-success text-base">
          ₹{usage.discountAmount?.toFixed(2) || '0.00'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-20 font-sans max-w-7xl mx-auto w-full">
      <PageHeader
        title="Coupon Performance"
        subtitle={`Detailed statistics and usage ledger for ${coupon.code}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Coupons", href: "/coupons" },
          { label: coupon.code },
        ]}
        actions={
          <Badge variant={coupon.isActive ? "success" : "error"} size="md">
            {coupon.isActive ? "ACTIVE" : "INACTIVE"}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="Total Usages"
          value={totalUsages}
          icon={<FiTag />}
          subtext={coupon.maxUses ? `${coupon.maxUses - totalUsages} uses remaining globally` : "No global limit"}
        />
        <Stat
          label="Total Discount Value"
          value={`₹${totalDiscountGiven.toFixed(2)}`}
          icon={<FiDollarSign />}
          variant="success"
          subtext="Amount saved by members"
        />
        <Stat
          label="Unique Members"
          value={uniqueMembers}
          icon={<FiUsers />}
          subtext="Different users who claimed this"
        />
        <Stat
          label="Expiry Status"
          value={coupon.isActive ? "Active" : "Inactive"}
          icon={<FiCalendar />}
          variant={coupon.isActive ? "success" : "default"}
          subtext={coupon.expiryDate ? `Expires ${formatIST(new Date(coupon.expiryDate), 'dd MMM yyyy')}` : "Never expires"}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-sv-text">Usage Ledger</h2>
          <span className="text-sm text-sv-text-muted">Showing {coupon.usages.length} transactions</span>
        </div>

        <DataTable<CouponUsage>
          columns={columns}
          data={coupon.usages}
          keyExtractor={(u) => u.id}
          emptyTitle="No Usages Yet"
          emptyMessage="This coupon hasn't been redeemed by anyone yet."
          emptyIcon={<FiTrendingUp className="text-4xl text-sv-text-muted" />}
        />
      </div>
    </div>
  );
}
