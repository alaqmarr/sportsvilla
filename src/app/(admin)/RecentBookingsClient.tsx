"use client";

import React from "react";
import { formatIST } from "@/core/utils/dateUtils";
import { Avatar, Badge, DataTable, ColumnDef } from "@/components/admin/ui";

export interface RecentBookingRow {
  id: string;
  price: number;
  paymentStatus: string;
  status: string;
  startTime: Date;
  member: {
    id: string;
    name: string;
    mobile: string;
  } | null;
  sport: {
    name: string;
  } | null;
  turf: {
    name: string;
  } | null;
}

export function RecentBookingsClient({ data }: { data: RecentBookingRow[] }) {
  const bookingColumns: ColumnDef<RecentBookingRow>[] = [
    {
      key: "member",
      header: "Member",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.member?.name} size="sm" />
          <div className="truncate min-w-0">
            <p className="font-bold text-sv-text text-sm truncate">
              {row.member?.name || "Guest Member"}
            </p>
            <p className="text-xs text-sv-text-muted truncate">
              {row.member?.mobile || "No Mobile"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "court",
      header: "Court & Sport",
      render: (row) => (
        <div>
          <p className="font-semibold text-sv-text text-sm">{row.turf?.name}</p>
          <span className="text-xs text-sv-text-muted uppercase tracking-wider font-mono">
            {row.sport?.name}
          </span>
        </div>
      ),
    },
    {
      key: "time",
      header: "Schedule",
      render: (row) => (
        <span className="text-xs font-mono text-sv-text-secondary whitespace-nowrap">
          {formatIST(new Date(row.startTime), "dd MMM, hh:mm a")}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (row) => (
        <span className="font-mono font-bold text-sv-text">
          ₹{row.price.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      align: "center",
      render: (row) => {
        const variant =
          row.paymentStatus === "PAID"
            ? "success"
            : row.paymentStatus === "PARTIAL"
            ? "warning"
            : "error";
        return (
          <Badge variant={variant} size="sm" dot>
            {row.paymentStatus}
          </Badge>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (row) => (
        <Badge
          variant={row.status === "CONFIRMED" ? "success" : "error"}
          size="sm"
        >
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      columns={bookingColumns}
      data={data}
      keyExtractor={(b) => b.id}
      emptyTitle="No recent bookings"
      emptyMessage="No bookings have been made recently. Create a new booking to get started."
    />
  );
}
