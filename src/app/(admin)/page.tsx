export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import {
  FiUsers,
  FiActivity,
  FiCheckCircle,
  FiPlus,
  FiCalendar,
  FiCreditCard,
  FiArrowRight,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { prisma } from "@/lib/prisma";
import { formatIST } from "@/lib/dateUtils";
import CheckinScanner from "@/components/CheckinScanner";
import {
  PageHeader,
  Stat,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Avatar,
  EmptyState,
} from "@/components/admin/ui";
import { RecentBookingsClient } from "./RecentBookingsClient";

export default async function Dashboard() {
  const nowUtc = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(nowUtc.getTime() + istOffsetMs);
  const todayStart = new Date(
    Date.UTC(
      istNow.getUTCFullYear(),
      istNow.getUTCMonth(),
      istNow.getUTCDate()
    ) - istOffsetMs
  );

  const nextWeek = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    totalMembers,
    activePlans,
    todaysAttendance,
    expiringMemberships,
    sports,
    todayBookings,
    todayRevenueAgg,
    totalTurfs,
    recentBookingsData,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.memberMembership.count({
      where: { status: "ACTIVE", endDate: { gte: new Date() } },
    }),
    prisma.attendance.count({
      where: { date: { gte: todayStart } },
    }),
    prisma.memberMembership.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          gte: new Date(),
          lte: nextWeek,
        },
      },
      include: {
        member: true,
        membershipPlan: { include: { sport: true } },
      },
      orderBy: { endDate: "asc" },
      take: 10,
    }),
    prisma.sport.findMany({ orderBy: { name: "asc" } }),
    prisma.booking.count({
      where: {
        startTime: { gte: todayStart },
        status: "CONFIRMED",
      },
    }),
    prisma.payment.aggregate({
      where: {
        createdAt: { gte: todayStart },
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.turf.count(),
    prisma.booking.findMany({
      take: 7,
      orderBy: { createdAt: "desc" },
      include: {
        member: { select: { id: true, name: true, mobile: true } },
        sport: { select: { name: true } },
        turf: { select: { name: true } },
      },
    }),
  ]);

  const todayRevenue = todayRevenueAgg._sum.amount || 0;
  // Estimated utilization: (today bookings / (totalTurfs * 12 peak slots)) * 100
  const utilizationRate =
    totalTurfs > 0
      ? Math.min(100, Math.round((todayBookings / (totalTurfs * 12)) * 100))
      : 0;

  return (
    <div className="space-y-8 pb-12 font-sans text-sv-text">
      {/* Standardized Page Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Overview of facility operations, revenue collection, and court activity"
        actions={
          <>
            <Link href="/bookings?new=true">
              <Button variant="primary" leftIcon={<FiPlus />}>
                New Booking
              </Button>
            </Link>
            <Link href="/members">
              <Button variant="secondary" leftIcon={<FiUsers />}>
                Directory
              </Button>
            </Link>
            <Link href="/calendar">
              <Button variant="outline" leftIcon={<FiCalendar />}>
                Calendar
              </Button>
            </Link>
          </>
        }
      />

      {/* KPI Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        <Stat
          label="Today's Bookings"
          value={todayBookings}
          icon={<FiCalendar />}
          variant="brand"
          trend={{
            value: "Live",
            direction: "up",
            label: "Active today",
          }}
        />

        <Stat
          label="Today's Revenue"
          value={`₹${todayRevenue.toLocaleString("en-IN")}`}
          icon={<FiCreditCard />}
          variant="success"
          trend={{
            value: "Gross",
            direction: "neutral",
            label: "Recorded",
          }}
        />

        <Stat
          label="Check-ins Today"
          value={todaysAttendance}
          icon={<FiCheckCircle />}
          variant="info"
          subtext="Gate & Kiosk visits"
        />

        <Stat
          label="Total Members"
          value={totalMembers}
          icon={<FiUsers />}
          variant="purple"
          subtext={`${activePlans} active plans`}
        />

        <Stat
          label="Court Utilization"
          value={`${utilizationRate}%`}
          icon={<FiActivity />}
          variant="warning"
          subtext={`${totalTurfs} active turfs`}
        />
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Recent Bookings & Quick Check-in Kiosk */}
        <div className="xl:col-span-2 space-y-8">
          {/* Recent Bookings Table */}
          <Card variant="default">
            <CardHeader
              action={
                <Link href="/bookings">
                  <Button
                    variant="ghost"
                    size="sm"
                    rightIcon={<FiArrowRight />}
                  >
                    View All
                  </Button>
                </Link>
              }
            >
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>
                Latest court reservations and payment statuses
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <RecentBookingsClient data={recentBookingsData} />
            </CardContent>
          </Card>

          {/* Quick Check-in Terminal Card */}
          <Card variant="default">
            <CardHeader
              action={
                <Badge variant="success" size="md" dot pulseDot>
                  Scanner Active
                </Badge>
              }
            >
              <CardTitle>Quick Check-in Kiosk</CardTitle>
              <CardDescription>
                Search member or scan QR ticket / tap NFC card for instant court check-in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CheckinScanner sports={sports} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Expiring Memberships */}
        <div className="space-y-8">
          <Card variant="default">
            <CardHeader
              action={
                <Badge variant="error" size="sm">
                  Next 7 Days
                </Badge>
              }
            >
              <CardTitle>Expiring Plans</CardTitle>
              <CardDescription>
                Memberships requiring renewal within a week
              </CardDescription>
            </CardHeader>

            <CardContent>
              {expiringMemberships.length === 0 ? (
                <EmptyState
                  title="No plans expiring"
                  description="All active memberships are healthy and valid beyond the next 7 days."
                />
              ) : (
                <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1 styled-scrollbar">
                  {expiringMemberships.map((m) => {
                    const phone = m.member?.mobile.replace(/\D/g, "");
                    const waLink = `https://wa.me/${
                      phone?.length === 10 ? "91" + phone : phone
                    }?text=${encodeURIComponent(
                      `Hi ${m.member?.name}, your ${m.membershipPlan?.sport?.name} plan at Sportsvilla is expiring on ${formatIST(
                        new Date(m.endDate),
                        "MMM d"
                      )}. Please renew to continue playing!`
                    )}`;

                    return (
                      <div
                        key={m.id}
                        className="p-4 rounded-sv-md bg-sv-surface-raised border border-sv-border transition-colors hover:border-sv-border-strong space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar name={m.member?.name} size="sm" />
                            <div className="truncate min-w-0">
                              <p className="font-bold text-sv-text text-sm truncate">
                                {m.member?.name}
                              </p>
                              <p className="text-xs text-sv-text-muted truncate">
                                {m.member?.mobile}
                              </p>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="text-xs font-bold text-sv-error-text block">
                              {formatIST(new Date(m.endDate), "MMM d")}
                            </span>
                            <span className="text-[10px] text-sv-text-muted uppercase tracking-wider font-mono">
                              {m.membershipPlan?.sport?.name}
                            </span>
                          </div>
                        </div>

                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full justify-center text-xs"
                            leftIcon={
                              <FaWhatsapp className="text-sv-success-text" />
                            }
                          >
                            Send Reminder
                          </Button>
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
