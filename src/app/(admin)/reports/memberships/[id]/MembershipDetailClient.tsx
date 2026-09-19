"use client";

import React, { useState, useEffect } from "react";
import { formatIST } from "@/core/utils/dateUtils";
import { fetchMembershipDetail } from "@/modules/reports/reports.action";
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
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiLayers,
  FiCheck,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/AlertProvider";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Stat,
  Badge,
  Button,
  Skeleton,
} from "@/components/admin/ui";

export default function MembershipDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    async function loadData() {
      try {
        const membership = await fetchMembershipDetail(id);
        setData(membership);
        setCurrentMonth(new Date(membership.startDate));
      } catch (err) {
        showAlert(
          "Data Error",
          "Failed to load the membership details from the server.",
          "error"
        );
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
        <div className="space-y-2 pb-6 border-b border-sv-border-subtle">
          <Skeleton className="h-8 w-64 rounded-sv-md" />
          <Skeleton className="h-4 w-96 rounded-sv-sm" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-sv-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const mStart = startOfDay(new Date(data.startDate));
  const mEnd = startOfDay(new Date(data.endDate));
  const today = startOfDay(new Date());

  const effectiveEnd = new Date(Math.min(mEnd.getTime(), today.getTime()));
  const msElapsed = effectiveEnd.getTime() - mStart.getTime();
  const expectedDays = Math.max(
    0,
    Math.floor(msElapsed / (1000 * 60 * 60 * 24)) + 1
  );
  const attended = data.member.attendances.length;
  const missed = Math.max(0, expectedDays - attended);

  const isActive = data.status === "ACTIVE" && mEnd >= today;

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

  return (
    <div className="space-y-6 pb-20 font-sans">
      <PageHeader
        title={data.member.name}
        subtitle={`Membership Lifecycle: ${data.membershipPlan.name} (${data.membershipPlan.sport.name})`}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Reports", href: "/reports/revenue" },
          { label: "Memberships", href: "/reports/memberships" },
          { label: data.member.name },
        ]}
        statusBadge={
          <Badge variant={isActive ? "success" : "error"} size="md" dot>
            {isActive ? "Active Plan" : "Expired Plan"}
          </Badge>
        }
        actions={
          <Button
            onClick={() => router.push("/reports/memberships")}
            variant="outline"
            size="sm"
            leftIcon={<FiArrowLeft />}
          >
            Back to Reports
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Stat
          label="Plan & Sport"
          value={data.membershipPlan.name}
          subtext={data.membershipPlan.sport.name}
          icon={<FiLayers />}
          variant="info"
        />
        <Stat
          label="Duration"
          value={`${data.membershipPlan.durationInDays} Days`}
          subtext={`${formatIST(new Date(data.startDate), "MMM d")} - ${formatIST(
            new Date(data.endDate),
            "MMM d, yyyy"
          )}`}
          icon={<FiCalendar />}
          variant="default"
        />
        <Stat
          label="Days Attended"
          value={attended}
          icon={<FiCheck />}
          variant="success"
        />
        <Stat
          label="Days Missed"
          value={missed}
          icon={<FiX />}
          variant="warning"
        />
      </div>

      <Card variant="default">
        <CardHeader className="flex flex-row justify-between items-center py-4 px-6 border-b border-sv-border-subtle">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <FiCalendar className="text-sv-brand" /> Attendance Calendar
            </CardTitle>
            <p className="text-xs text-sv-text-muted mt-1">
              Detailed view of check-ins during this membership period.
            </p>
          </div>
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

        <CardContent className="p-6 overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-7 gap-3 mb-3">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-bold text-sv-text-muted uppercase tracking-wider"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-3">
              {days.map((d, idx) => {
                const isCurrMonth = isSameMonth(d, monthStart);
                const dayAttendances = data.member.attendances.filter(
                  (a: any) => isSameDay(new Date(a.date), d)
                );
                const attendedDay = dayAttendances.length > 0;

                let expected = false;
                if (d >= mStart && d <= mEnd && d <= today) {
                  expected = true;
                }

                const missedDay = expected && !attendedDay;
                const isFuture = d > today;

                return (
                  <div
                    key={idx}
                    className={`min-h-[90px] rounded-sv-sm p-2.5 flex flex-col border border-[#2a2d3e] transition-all duration-200 ${
                      !isCurrMonth
                        ? "opacity-20 bg-sv-bg border-transparent"
                        : attendedDay
                        ? "bg-sv-success-subtle border-sv-success-border border-[#2a2d3e] text-sv-success-text shadow-sv-sm"
                        : missedDay
                        ? "bg-sv-error-subtle border-sv-error-border border-[#2a2d3e] text-sv-error-text"
                        : isFuture
                        ? "bg-sv-surface border-sv-border border-[#2a2d3e] opacity-50"
                        : "bg-sv-surface-raised border-sv-border border-[#2a2d3e]"
                    }`}
                  >
                    <div
                      className={`text-right text-xs font-bold ${
                        isCurrMonth
                          ? attendedDay
                            ? "text-sv-status-success"
                            : missedDay
                            ? "text-sv-status-error"
                            : "text-sv-text-muted"
                          : "text-sv-text-disabled"
                      }`}
                    >
                      {formatIST(d, "d")}
                    </div>
                    <div className="flex-1 mt-1.5 flex flex-col gap-1 overflow-hidden">
                      {attendedDay ? (
                        dayAttendances.map((a: any) => (
                          <div
                            key={a.id}
                            className="text-[10px] leading-tight flex flex-col gap-0.5 mb-1 bg-sv-status-success/15 px-2 py-1.5 rounded-sv-xs border border-[#2a2d3e] border-sv-status-success/30"
                            title={formatIST(new Date(a.date), "h:mm a")}
                          >
                            <span className="font-bold text-sv-text flex items-center gap-1">
                              <FiClock size={10} className="text-sv-status-success" />{" "}
                              {formatIST(new Date(a.date), "h:mm a")}
                            </span>
                          </div>
                        ))
                      ) : missedDay ? (
                        <div className="text-[10px] text-sv-status-error font-bold uppercase tracking-wider mt-auto text-center pb-1">
                          Absent
                        </div>
                      ) : expected && !isFuture ? (
                        <div className="text-[10px] text-sv-text-muted font-bold uppercase tracking-wider mt-auto text-center pb-1">
                          Expected
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
