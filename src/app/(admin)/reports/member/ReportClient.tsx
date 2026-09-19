"use client";

import React, { useState } from "react";
import { formatIST } from "@/core/utils/dateUtils";
import { useAlert } from "@/components/AlertProvider";
import { fetchAttendanceReport } from "@/modules/reports/reports.action";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfDay,
} from "date-fns";
import { FiUser, FiCalendar, FiClock, FiActivity, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Button,
  Badge,
  Avatar,
} from "@/components/admin/ui";

export default function ReportClient() {
  const { showAlert } = useAlert();
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDateCalendar = startOfWeek(monthStart);
  const endDateCalendar = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = startDateCalendar;

  while (day <= endDateCalendar) {
    for (let i = 0; i < 7; i++) {
      days.push(day);
      day = new Date(day.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  async function handleSearch(searchMobile: string) {
    if (searchMobile.length !== 10) return;

    setLoading(true);
    try {
      const data = await fetchAttendanceReport(searchMobile);
      if (!data || data.length === 0) {
        showAlert(
          "Not Found",
          "We couldn't find any member registered with this mobile number.",
          "error"
        );
        setMembersList([]);
        setReportData(null);
      } else {
        setMembersList(data);
        if (data.length === 1) {
          setReportData(data[0]);
        } else {
          setReportData(null);
        }
      }
    } catch (err) {
      showAlert(
        "Search Failed",
        "An unexpected error occurred while fetching the member's report.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  function getMembershipStats(m: any, allAttendances: any[]) {
    const mAttendances = allAttendances.filter(
      (a) =>
        a.membershipPlanId === m.membershipPlanId &&
        new Date(a.date) >= new Date(m.startDate) &&
        new Date(a.date) <= new Date(m.endDate)
    );

    const attendedCount = mAttendances.length;
    const now = new Date();
    const end = new Date(m.endDate);
    const start = new Date(m.startDate);

    const effectiveEnd = now > end ? end : now;
    const msElapsed = effectiveEnd.getTime() - start.getTime();
    const daysElapsed = Math.max(
      0,
      Math.floor(msElapsed / (1000 * 60 * 60 * 24))
    );

    const missedCount = Math.max(0, daysElapsed - attendedCount);

    return {
      attended: attendedCount,
      missed: missedCount,
      totalDays: m.membershipPlan.durationInDays,
    };
  }

  return (
    <div className="space-y-6 pb-20 font-sans">
      <PageHeader
        title="Member Report"
        subtitle="View detailed check-in history and plan statistics for any member."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Reports", href: "/reports/revenue" },
          { label: "Member Report" },
        ]}
      />

      <Card variant="default" className="max-w-xl">
        <CardContent className="p-6 space-y-4">
          <div className="relative">
            <Input
              type="tel"
              label="Member Mobile Number"
              placeholder="Enter 10-digit mobile..."
              value={mobile}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= 10) {
                  setMobile(val);
                  if (val.length === 10) {
                    handleSearch(val);
                  } else {
                    setMembersList([]);
                    setReportData(null);
                  }
                }
              }}
              autoFocus
              className="font-mono text-base tracking-wider"
              helperText="Enter 10 digits to automatically trigger attendance lookup."
            />
            {loading && (
              <div className="absolute right-4 top-9">
                <div className="w-5 h-5 border-2 border-sv-brand/30 border-t-sv-brand rounded-full animate-spin" />
              </div>
            )}
          </div>

          {membersList.length > 1 && !reportData && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-sv-text-muted">
                Select Family Member
              </span>
              <div className="flex flex-col gap-2">
                {membersList.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setReportData(m)}
                    className="bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] hover:border-sv-brand hover:bg-sv-surface-hover text-left px-4 py-3 rounded-sv-md text-sv-text font-semibold transition-colors flex justify-between items-center"
                  >
                    <span>{m.name}</span>
                    <Badge variant="brand" size="sm">
                      View Report
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {reportData && (
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Member Profile & Plans */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card variant="default">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-sv-border-subtle">
                  <Avatar name={reportData.name} size="lg" />
                  <div>
                    <h2 className="text-xl font-bold text-sv-text">
                      {reportData.name}
                    </h2>
                    <p className="text-sv-text-muted text-sm flex items-center gap-2 mt-1 font-mono">
                      <FiUser className="text-sv-status-success" />{" "}
                      {reportData.mobile}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-sv-text-muted flex items-center gap-2">
                    <FiActivity className="text-sv-brand" /> Membership History
                  </h3>

                  <div className="flex flex-col gap-4">
                    {reportData.memberships.length === 0 ? (
                      <div className="text-sm text-sv-text-muted">
                        No memberships found.
                      </div>
                    ) : (
                      reportData.memberships.map((m: any) => {
                        const isActive =
                          m.status === "ACTIVE" &&
                          new Date(m.endDate) >= new Date();
                        const stats = getMembershipStats(
                          m,
                          reportData.attendances
                        );
                        return (
                          <div
                            key={m.id}
                            className={`p-4 rounded-sv-md border border-[#2a2d3e] ${
                              isActive
                                ? "bg-sv-surface-raised border-sv-status-success/30"
                                : "bg-sv-bg border-sv-border border-[#2a2d3e] opacity-70"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-sv-status-success mb-1">
                                  {m.membershipPlan?.sport?.name}
                                </div>
                                <div className="text-sv-text font-semibold">
                                  {m.membershipPlan?.name}
                                </div>
                              </div>
                              <Badge
                                variant={isActive ? "success" : "error"}
                                size="sm"
                              >
                                {isActive ? "Active" : "Expired"}
                              </Badge>
                            </div>
                            <div className="text-xs text-sv-text-muted flex items-center gap-1 mb-4">
                              <FiCalendar />{" "}
                              {formatIST(new Date(m.startDate), "MMM d, yy")} -{" "}
                              {formatIST(new Date(m.endDate), "MMM d, yy")}
                            </div>

                            <div className="grid grid-cols-3 gap-2 bg-sv-bg-subtle rounded-sv-sm p-3 border border-[#2a2d3e] border-sv-border border-[#2a2d3e]">
                              <div className="text-center">
                                <div className="text-[10px] text-sv-text-muted uppercase tracking-wider font-semibold">
                                  Attended
                                </div>
                                <div className="text-sv-status-success font-bold text-base">
                                  {stats.attended}
                                </div>
                              </div>
                              <div className="text-center border-x border-sv-border border-[#2a2d3e]">
                                <div className="text-[10px] text-sv-text-muted uppercase tracking-wider font-semibold">
                                  Missed
                                </div>
                                <div className="text-sv-status-error font-bold text-base">
                                  {stats.missed}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-[10px] text-sv-text-muted uppercase tracking-wider font-semibold">
                                  Total Days
                                </div>
                                <div className="text-sv-text font-bold text-base">
                                  {stats.totalDays}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar View */}
          <div className="lg:col-span-7">
            <Card variant="default" className="flex flex-col h-[calc(100vh-160px)]">
              <CardHeader className="flex flex-row justify-between items-center shrink-0 border-b border-sv-border-subtle py-4 px-6">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FiCalendar className="text-sv-brand" /> Attendance Calendar
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={prevMonth}
                    variant="ghost"
                    size="icon"
                    aria-label="Previous Month"
                  >
                    <FiChevronLeft />
                  </Button>
                  <span className="text-sv-text font-bold text-sm min-w-[120px] text-center">
                    {formatIST(currentMonth, "MMMM yyyy")}
                  </span>
                  <Button
                    onClick={nextMonth}
                    variant="ghost"
                    size="icon"
                    aria-label="Next Month"
                  >
                    <FiChevronRight />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 styled-scrollbar">
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (d) => (
                      <div
                        key={d}
                        className="text-center text-xs font-semibold text-sv-text-muted uppercase tracking-wider"
                      >
                        {d}
                      </div>
                    )
                  )}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {days.map((d, idx) => {
                    const isCurrMonth = isSameMonth(d, monthStart);
                    const dayAttendances =
                      reportData?.attendances?.filter((a: any) =>
                        isSameDay(new Date(a.date), d)
                      ) || [];
                    const attended = dayAttendances.length > 0;

                    let expected = false;
                    const today = startOfDay(new Date());

                    if (reportData?.memberships) {
                      for (const m of reportData.memberships) {
                        const mStart = startOfDay(new Date(m.startDate));
                        const mEnd = startOfDay(new Date(m.endDate));
                        if (d >= mStart && d <= mEnd && d <= today) {
                          expected = true;
                          break;
                        }
                      }
                    }

                    const missed = expected && !attended;

                    return (
                      <div
                        key={idx}
                        className={`min-h-[80px] rounded-sv-sm p-2 flex flex-col border border-[#2a2d3e] transition-colors ${
                          !isCurrMonth
                            ? "opacity-25 bg-sv-bg border-transparent"
                            : attended
                            ? "bg-sv-success-subtle border-sv-success-border border-[#2a2d3e] text-sv-success-text"
                            : missed
                            ? "bg-sv-error-subtle border-sv-error-border border-[#2a2d3e] text-sv-error-text"
                            : "bg-sv-surface-raised border-sv-border border-[#2a2d3e]"
                        }`}
                      >
                        <div
                          className={`text-right text-xs font-bold ${
                            isCurrMonth
                              ? attended
                                ? "text-sv-status-success"
                                : missed
                                ? "text-sv-status-error"
                                : "text-sv-text-muted"
                              : "text-sv-text-disabled"
                          }`}
                        >
                          {formatIST(d, "d")}
                        </div>
                        <div className="flex-1 mt-1.5 flex flex-col gap-1 overflow-hidden">
                          {attended ? (
                            dayAttendances.map((a: any) => (
                              <div
                                key={a.id}
                                className="text-[10px] leading-tight flex flex-col gap-0.5 mb-1 bg-sv-status-success/15 px-2 py-1.5 rounded-sv-xs border border-[#2a2d3e] border-sv-status-success/30"
                                title={`${formatIST(
                                  new Date(a.date),
                                  "h:mm a"
                                )} - ${
                                  a.sport?.name ||
                                  a.membershipPlan?.sport?.name ||
                                  "SPORT"
                                }`}
                              >
                                <span className="font-bold text-sv-text flex items-center gap-1">
                                  <FiClock
                                    size={10}
                                    className="text-sv-status-success"
                                  />{" "}
                                  {formatIST(new Date(a.date), "h:mm a")}
                                </span>
                                <span className="text-sv-status-success font-semibold uppercase tracking-wide truncate">
                                  {a.sport?.name ||
                                    a.membershipPlan?.sport?.name ||
                                    "SPORT"}
                                </span>
                              </div>
                            ))
                          ) : missed ? (
                            <div className="text-[10px] text-sv-status-error font-bold uppercase tracking-wider mt-auto text-center">
                              Absent
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
