"use client";

import React, { useState, useEffect } from "react";
import { formatIST, todayIST } from "@/core/utils/dateUtils";
import { useRouter } from "next/navigation";
import { fetchMembershipReports } from "@/modules/reports/reports.action";
import { startOfDay } from "date-fns";
import { FiSearch, FiLayers, FiAward } from "react-icons/fi";
import { useAlert } from "@/components/AlertProvider";
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  Input,
  Badge,
  Avatar,
  DataTable,
  ColumnDef,
} from "@/components/admin/ui";

interface MembershipRecord {
  id: string;
  startDate: string | Date;
  endDate: string | Date;
  status: string;
  member: {
    name: string;
    mobile: string;
    attendances: any[];
    memberships: any[];
  };
  membershipPlan: {
    name: string;
  };
}

export default function MembershipReportClient() {
  const { showAlert } = useAlert();
  const router = useRouter();

  const today = todayIST();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [loading, setLoading] = useState(false);
  const [memberships, setMemberships] = useState<MembershipRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await fetchMembershipReports(startDate, endDate);
      setMemberships(data);
      setHasSearched(true);
    } catch (err) {
      showAlert(
        "Data Error",
        "Failed to fetch membership data from the server. Please try again.",
        "error"
      );
    }
    setLoading(false);
  };

  const calculateStats = (m: MembershipRecord) => {
    const periodStart = startOfDay(new Date(startDate));
    const periodEnd = startOfDay(new Date(endDate));
    const mStart = startOfDay(new Date(m.startDate));
    const mEnd = startOfDay(new Date(m.endDate));
    const now = startOfDay(new Date());

    const effectiveEnd = new Date(
      Math.min(periodEnd.getTime(), mEnd.getTime(), now.getTime())
    );
    const effectiveStart = new Date(
      Math.max(periodStart.getTime(), mStart.getTime())
    );

    const attended = m.member.attendances?.length || 0;
    let expectedDays = 0;

    if (effectiveStart <= effectiveEnd) {
      const msElapsed = effectiveEnd.getTime() - effectiveStart.getTime();
      expectedDays = Math.floor(msElapsed / (1000 * 60 * 60 * 24)) + 1;
    }

    const missed = Math.max(0, expectedDays - attended);

    return { attended, missed };
  };

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnDef<MembershipRecord>[] = [
    {
      key: "member",
      header: "Member & Badges",
      render: (m) => {
        const isRenewed = m.member.memberships?.length > 1;
        return (
          <div className="flex items-center gap-3">
            <Avatar name={m.member.name} size="sm" />
            <div>
              <div className="text-sv-text font-medium flex items-center gap-2">
                <span>{m.member.name}</span>
                {isRenewed && (
                  <Badge variant="warning" size="sm">
                    <FiAward className="mr-1" /> Renewed
                  </Badge>
                )}
              </div>
              <div className="text-sv-text-muted text-xs mt-0.5 font-mono">
                {m.member.mobile}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "membershipPlan",
      header: "Membership Plan",
      render: (m) => (
        <div>
          <div className="text-sv-text font-medium text-sm">
            {m.membershipPlan.name}
          </div>
          <div className="text-sv-text-muted text-xs mt-0.5 font-mono">
            {formatIST(new Date(m.startDate), "MMM d, yy")} -{" "}
            {formatIST(new Date(m.endDate), "MMM d, yy")}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (m) => {
        const isActive =
          m.status === "ACTIVE" && new Date(m.endDate) >= new Date();
        return (
          <Badge variant={isActive ? "success" : "error"} size="sm">
            {isActive ? "Active" : "Expired"}
          </Badge>
        );
      },
    },
    {
      key: "stats",
      header: "Check-ins (In Period)",
      render: (m) => {
        const stats = calculateStats(m);
        return (
          <div className="flex items-center gap-4 text-xs">
            <div className="flex flex-col items-center">
              <span className="text-sv-text-muted text-[10px] uppercase font-bold tracking-wider">
                Attended
              </span>
              <span className="text-sv-status-success font-bold text-sm">
                {stats.attended}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sv-text-muted text-[10px] uppercase font-bold tracking-wider">
                Skipped
              </span>
              <span className="text-sv-status-error font-bold text-sm">
                {stats.missed}
              </span>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 pb-20 font-sans">
      <PageHeader
        title="Membership Reports"
        subtitle="View enrolled users, attendance metrics, and renewed statuses."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Reports", href: "/reports/revenue" },
          { label: "Memberships" },
        ]}
      />

      <Card variant="default">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1 w-full">
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSearch}
              isLoading={loading}
              variant="primary"
              size="md"
              leftIcon={<FiSearch />}
              className="w-full md:w-auto h-10 px-8"
            >
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-semibold text-sv-text flex items-center gap-2 text-sm">
              <FiLayers className="text-sv-brand" /> Membership Results
            </h3>
            <Badge variant="brand" size="sm">
              {memberships.length} RECORDS FOUND
            </Badge>
          </div>

          <DataTable<MembershipRecord>
            columns={columns}
            data={memberships}
            keyExtractor={(m) => m.id}
            onRowClick={(m) => router.push(`/reports/memberships/${m.id}`)}
            emptyTitle="No memberships found"
            emptyMessage="No memberships were active during this date range."
          />
        </div>
      )}
    </div>
  );
}
