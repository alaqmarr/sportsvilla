"use client";

import React, { useState, useEffect } from "react";
import { formatIST, todayIST } from "@/core/utils/dateUtils";
import { fetchAdvancedAttendance } from "@/modules/reports/reports.action";
import { FiDownload, FiSearch, FiClock } from "react-icons/fi";
import { useAlert } from "@/components/AlertProvider";
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  Input,
  Select,
  Badge,
  Avatar,
  DataTable,
  ColumnDef,
} from "@/components/admin/ui";

interface AttendanceRecord {
  id: string;
  date: string | Date;
  notes?: string | null;
  member?: {
    name?: string | null;
    mobile?: string | null;
  } | null;
  membershipPlan?: {
    name?: string | null;
    sport?: { name?: string | null } | null;
  } | null;
  sport?: {
    name?: string | null;
  } | null;
}

export default function AttendanceReportClient({ plans }: { plans: any[] }) {
  const { showAlert } = useAlert();

  const today = todayIST();
  const [startDate, setStartDate] = useState(today);
  const [startTime, setStartTime] = useState("00:00");
  const [endDate, setEndDate] = useState(today);
  const [endTime, setEndTime] = useState("23:59");
  const [selectedPlanId, setSelectedPlanId] = useState("all");

  const [loading, setLoading] = useState(false);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await fetchAdvancedAttendance(
        startDate,
        endDate,
        startTime,
        endTime,
        selectedPlanId
      );
      setAttendances(data);
      setHasSearched(true);
    } catch (err) {
      showAlert(
        "Data Error",
        "Failed to fetch attendance data from the server. Please try again later.",
        "error"
      );
    }
    setLoading(false);
  };

  const handleExportCSV = () => {
    if (attendances.length === 0) {
      showAlert(
        "Export Failed",
        "There is no attendance data available to export for the selected filters.",
        "info"
      );
      return;
    }

    const headers = [
      "Date",
      "Time",
      "Member Name",
      "Mobile",
      "Membership Plan",
      "Sport",
      "Notes",
    ];

    const rows = attendances.map((record) => {
      const date = formatIST(new Date(record.date), "yyyy-MM-dd");
      const time = formatIST(new Date(record.date), "HH:mm:ss");
      const name = record.member?.name || "";
      const mobile = record.member?.mobile || "";
      const plan = record.membershipPlan?.name || "";
      const sport =
        record.sport?.name || record.membershipPlan?.sport?.name || "";
      const notes = record.notes || "";

      return [
        date,
        time,
        `"${name}"`,
        mobile,
        `"${plan}"`,
        `"${sport}"`,
        `"${notes}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Master_Attendance_Report_${startDate}_to_${endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const planOptions = [
    { value: "all", label: "All Plans" },
    ...plans.map((p) => ({
      value: p.id,
      label: `${p.name} (${p.sport?.name || "General"})`,
    })),
  ];

  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      key: "date",
      header: "Date & Time",
      render: (record) => (
        <div>
          <div className="text-sv-text font-semibold whitespace-nowrap">
            {formatIST(new Date(record.date), "MMM d, yyyy")}
          </div>
          <div className="text-sv-text-muted text-xs mt-0.5 whitespace-nowrap">
            {formatIST(new Date(record.date), "h:mm a")}
          </div>
        </div>
      ),
    },
    {
      key: "member",
      header: "Member",
      render: (record) => (
        <div className="flex items-center gap-3">
          <Avatar
            name={record.member?.name || "Member"}
            size="sm"
          />
          <div>
            <div className="text-sv-text font-medium whitespace-nowrap">
              {record.member?.name || "Unknown"}
            </div>
            <div className="text-sv-text-muted text-xs mt-0.5 whitespace-nowrap font-mono">
              {record.member?.mobile || "-"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan / Sport",
      render: (record) => (
        <div className="space-y-1">
          <div className="text-sv-status-success font-medium text-sm whitespace-nowrap">
            {record.membershipPlan?.name || "No Plan"}
          </div>
          <Badge variant="neutral" size="sm">
            {record.sport?.name ||
              record.membershipPlan?.sport?.name ||
              "Unknown Sport"}
          </Badge>
        </div>
      ),
    },
    {
      key: "notes",
      header: "Notes",
      render: (record) => (
        <span className="text-sv-text-secondary text-sm">
          {record.notes || <span className="text-sv-text-muted italic">None</span>}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-20 font-sans">
      <PageHeader
        title="Attendance Reports"
        subtitle="Advanced filtering and master data export for member check-ins."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Reports", href: "/reports/revenue" },
          { label: "Attendance" },
        ]}
        actions={
          <Button
            onClick={handleExportCSV}
            disabled={attendances.length === 0}
            variant="primary"
            size="md"
            leftIcon={<FiDownload />}
          >
            Export Master CSV
          </Button>
        }
      />

      <Card variant="default">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-sv-text-muted">
                From Date & Time
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-sv-text-muted">
                To Date & Time
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-end pt-2">
            <div className="flex-1 w-full">
              <Select
                label="Filter by Membership Plan"
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                options={planOptions}
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
              <FiClock className="text-sv-brand" /> Attendance Results
            </h3>
            <Badge variant="brand" size="sm">
              {attendances.length} RECORDS FOUND
            </Badge>
          </div>

          <DataTable<AttendanceRecord>
            columns={columns}
            data={attendances}
            keyExtractor={(record) => record.id}
            isLoading={loading}
            emptyTitle="No attendance records found"
            emptyMessage="No attendance records matched the selected date and plan filters."
          />
        </div>
      )}
    </div>
  );
}
