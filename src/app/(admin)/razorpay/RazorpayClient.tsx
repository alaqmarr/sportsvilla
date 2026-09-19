"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { formatIST } from "@/core/utils/dateUtils";
import { PageHeader, Stat, Badge, DataTable, ColumnDef } from "@/components/admin/ui";
import { FiDollarSign, FiActivity, FiCheckCircle } from "react-icons/fi";

interface TransactionRow {
  id: string;
  gatewayOrderId: string | null;
  gatewayPaymentId: string | null;
  amount: number;
  status: string;
  createdAt: string | Date;
  errorMessage: string | null;
  member: {
    id: string;
    name: string | null;
    mobile: string | null;
  } | null;
}

interface RazorpayClientProps {
  transactions: TransactionRow[];
  totalCount: number;
  totalSuccessValue: number;
  successRate: number;
  currentPage: number;
  totalPages: number;
}

export default function RazorpayClient({
  transactions,
  totalCount,
  totalSuccessValue,
  successRate,
  currentPage,
  totalPages,
}: RazorpayClientProps) {
  const router = useRouter();

  const columns: ColumnDef<TransactionRow>[] = [
    {
      key: "createdAt",
      header: "Date (IST)",
      render: (tx) => (
        <span className="text-sv-text-secondary whitespace-nowrap">
          {formatIST(tx.createdAt, "dd MMM yyyy, hh:mm a")}
        </span>
      ),
    },
    {
      key: "gatewayOrderId",
      header: "Order ID",
      render: (tx) => (
        <span className="font-mono text-sv-text font-medium whitespace-nowrap">
          {tx.gatewayOrderId || "-"}
        </span>
      ),
    },
    {
      key: "gatewayPaymentId",
      header: "Payment ID",
      render: (tx) => (
        <span className="font-mono text-sv-text-muted whitespace-nowrap">
          {tx.gatewayPaymentId || "-"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (tx) => (
        <span className="font-semibold text-sv-text whitespace-nowrap">
          ₹{tx.amount.toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (tx) => {
        const variant =
          tx.status === "SUCCESS"
            ? "success"
            : tx.status === "FAILED"
            ? "error"
            : "warning";
        return (
          <Badge variant={variant} size="sm">
            {tx.status}
          </Badge>
        );
      },
    },
    {
      key: "member",
      header: "User",
      render: (tx) => (
        <span className="text-sv-text-secondary whitespace-nowrap">
          {tx.member?.name || "Guest"}{" "}
          {tx.member?.mobile ? `(${tx.member.mobile})` : ""}
        </span>
      ),
    },
    {
      key: "errorMessage",
      header: "Error Details",
      render: (tx) => (
        <span
          className="text-sv-status-error text-xs max-w-xs truncate block"
          title={tx.errorMessage || ""}
        >
          {tx.errorMessage
            ? tx.errorMessage.length > 35
              ? `${tx.errorMessage.slice(0, 35)}...`
              : tx.errorMessage
            : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-20 font-sans">
      <PageHeader
        title="Razorpay Transactions"
        subtitle="Monitor Razorpay payment logs, verification status, and gateway identifiers."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Razorpay" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Stat
          label="Total Transactions"
          value={totalCount}
          icon={<FiActivity />}
          variant="default"
        />
        <Stat
          label="Total Value (Success)"
          value={`₹${totalSuccessValue.toFixed(2)}`}
          icon={<FiDollarSign />}
          variant="success"
        />
        <Stat
          label="Success Rate"
          value={`${successRate}%`}
          icon={<FiCheckCircle />}
          variant="brand"
        />
      </div>

      <DataTable<TransactionRow>
        columns={columns}
        data={transactions}
        keyExtractor={(tx) => tx.id}
        emptyTitle="No transactions found"
        emptyMessage="No Razorpay transactions have been recorded yet."
        pagination={{
          page: currentPage,
          totalPages,
          totalItems: totalCount,
          onPageChange: (newPage) => {
            router.push(`/razorpay?page=${newPage}`);
          },
        }}
      />
    </div>
  );
}
