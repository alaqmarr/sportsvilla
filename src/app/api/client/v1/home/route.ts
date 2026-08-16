import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { logger } from '@/lib/logger';
import { jsonResponse, apiLog } from '@/lib/api-logger';
import { formatIST } from '@/lib/dateUtils';

export async function GET(request: Request) {
  apiLog(`[API] GET /api/client/v1/home called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member: primaryMember } = authRes;
  const { searchParams } = new URL(request.url);
  let targetMemberId = searchParams.get('memberId') || primaryMember.id;

  logger.info('Home Data Request Initiated', { primaryMemberId: primaryMember.id, targetMemberId });

  try {
    const familyMembers = await prisma.member.findMany({
      where: { mobile: primaryMember.mobile },
      select: { id: true, name: true, loyaltyPoints: true, walletBalance: true },
      orderBy: { joinDate: 'asc' }
    });

    // 2. Security Check: ensure requested memberId belongs to this family
    if (!familyMembers.find(m => m.id === targetMemberId)) {
      targetMemberId = primaryMember.id;
    }

    // 3. Fetch independent home screen data concurrently
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [
      candidateBookings,
      memberMemberships,
      attendances,
      registrations,
      topSportStat,
      globalSettings
    ] = await Promise.all([
      prisma.booking.findMany({
        where: {
          OR: [
            { memberId: targetMemberId },
            { participants: { some: { memberId: targetMemberId, status: 'CONFIRMED' } } }
          ],
          startTime: { gt: thirtyDaysAgo },
          status: 'CONFIRMED'
        },
        include: {
          turf: { select: { name: true, location: true, bookingValidityDays: true } },
          sport: { select: { name: true } },
          tickets: true,
          member: { select: { id: true, name: true } },
          participants: {
            include: {
              member: { select: { id: true, name: true } }
            }
          }
        },
        orderBy: { startTime: 'asc' },
        take: 50
      }),
      prisma.memberMembership.findMany({
        where: { memberId: targetMemberId },
        include: {
          membershipPlan: { include: { sport: { select: { name: true } } } },
          turf: { select: { name: true } }
        },
        orderBy: { endDate: 'desc' },
        take: 20
      }),
      prisma.attendance.findMany({
        where: { memberId: targetMemberId, date: { gte: sixtyDaysAgo } },
        include: { sport: { select: { name: true } } },
        orderBy: { date: 'desc' },
        take: 100
      }),
      prisma.tournamentRegistration.findMany({
        where: {
          registeredById: targetMemberId,
          status: { not: 'REJECTED' },
          tournament: { status: { in: ['UPCOMING', 'ONGOING'] } }
        },
        include: { tournament: { include: { sport: true } } },
        orderBy: { tournament: { startDate: 'asc' } },
        take: 20
      }),
      prisma.userSportStat.findFirst({
        where: { memberId: targetMemberId, bookingCount: { gt: 0 } },
        orderBy: { bookingCount: 'desc' }
      }),
      prisma.setting.findMany()
    ]);

    const now = new Date();
    
    const upcomingBookings = candidateBookings.filter(b => {
      const isExpired = now > new Date(b.endTime);
      return !isExpired;
    }).slice(0, 5); // limit to 5 upcoming for home screen

    // 4. (Optional) Fetch basic Wallet or Loyalty details for the target member
    const targetMemberData = familyMembers.find(m => m.id === targetMemberId);

    const activeMemberships = memberMemberships
      .filter(m => m.status === 'ACTIVE' && new Date(m.endDate) > now)
      .map(m => {
        const expiresInDays = Math.ceil((new Date(m.endDate).getTime() - now.getTime()) / (1000 * 3600 * 24));
        
        // Calculate checkins and missed for this specific membership
        const relatedAttendances = attendances.filter(a => a.membershipPlanId === m.membershipPlanId);
        const checkins = relatedAttendances.filter(a => a.status === 'PRESENT').length;
        const missedDays = relatedAttendances.filter(a => a.status === 'ABSENT').length;

        return {
          id: m.id,
          name: m.membershipPlan.name,
          sport: m.membershipPlan.sport,
          status: m.status,
          startDate: formatIST(m.startDate, 'yyyy-MM-dd'),
          expiryDate: formatIST(m.endDate, 'yyyy-MM-dd'),
          expiresInDays: expiresInDays > 0 ? expiresInDays : 0,
          totalDays: m.membershipPlan.durationInDays,
          slotsPerDay: m.membershipPlan.slotsPerDay,
          rewardPointsPerCheckin: m.membershipPlan.rewardPointsPerCheckin,
          turfName: m.turf?.name || null,
          timeSlot: m.timeSlot || null,
          checkins,
          missedDays
        };
      });

    const history = memberMemberships
      .filter(m => m.status !== 'ACTIVE' || new Date(m.endDate) <= now)
      .map(m => {
        const relatedAttendances = attendances.filter(a => a.membershipPlanId === m.membershipPlanId && new Date(a.date) >= m.startDate && new Date(a.date) <= m.endDate);
        const checkins = relatedAttendances.filter(a => a.status === 'PRESENT').length;

        return {
          id: m.id,
          plan: m.membershipPlan.name,
          status: m.status === 'ACTIVE' ? 'Expired' : 'Completed',
          startDate: m.startDate.toISOString().split('T')[0],
          expiryDate: m.endDate.toISOString().split('T')[0],
          duration: m.membershipPlan.durationInDays + ' Days',
          sport: m.membershipPlan.sport,
          checkins,
          type: m.membershipPlan.name.toLowerCase().includes('gold') ? 'gold' : 'silver'
        };
      });

    // 7. Calculate overall Attendance Overview
    const presentCount = attendances.filter(a => a.status === 'PRESENT').length;
    const absentCount = attendances.filter(a => a.status === 'ABSENT').length;
    const totalAttendances = presentCount + absentCount;
    
    let attendanceOverview = null;
    if (totalAttendances > 0) {
      attendanceOverview = {
        present: presentCount,
        absent: absentCount,
        presentPct: Math.round((presentCount / totalAttendances) * 100),
        absentPct: Math.round((absentCount / totalAttendances) * 100),
        attendanceRate: Math.round((presentCount / totalAttendances) * 100),
        requiredRate: 85 // arbitrary threshold for UI demo
      };
    }

    const recentAttendance = attendances.slice(0, 5).map(a => {
      const d = new Date(a.date);
      // format date as "20 May 2024, Mon"
      const dateStr = formatIST(d, 'dd MMM yyyy, EEE');
      // format time as "07:00 AM"
      const timeStr = formatIST(d, 'hh:mm a');

      return {
        id: a.id,
        dateStr,
        time: timeStr,
        facility: a.sport?.name || 'Facility',
        status: a.status === 'PRESENT' ? 'Present' : 'Absent'
      };
    });

    // 8. Format Registered Tournaments (Upcoming/Ongoing)
    const registeredTournaments = registrations.map(r => ({
      ...r.tournament,
      registrationStatus: r.status,
      teamName: r.teamName
    }));

    const registeredTournamentIds = registeredTournaments.map(t => t.id);

    // 9. Fetch Upcoming Tournaments and Banners concurrently
    const [upcomingTournaments, banners] = await Promise.all([
      prisma.tournament.findMany({
        where: {
          status: 'UPCOMING',
          id: { notIn: registeredTournamentIds },
          startDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        include: { sport: true, _count: { select: { registrations: true } } },
        orderBy: { startDate: 'asc' },
        take: 5
      }),
      prisma.banner.findMany({
        where: {
          isActive: true,
          OR: [
            { targetSportId: null },
            ...(topSportStat ? [{ targetSportId: topSportStat.sportId }] : [])
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Get global settings (already fetched in parallel above)
    const settingsMap = globalSettings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);
    const cancellationLimitHours = parseInt(settingsMap.CLIENT_CANCELLATION_LIMIT_HOURS || "3", 10);
    const allowRescheduling = settingsMap.ALLOW_RESCHEDULING !== "false";
    const allowCancellation = settingsMap.ALLOW_CANCELLATION !== "false";
    const allowOnlineBooking = settingsMap.ALLOW_ONLINE_BOOKING !== "false";
    const maintenanceMode = settingsMap.MAINTENANCE_MODE === "true";

    return jsonResponse({
      success: true,
      familyMembers,
      targetMemberId,
      profile: targetMemberData,
      upcomingBookings,
      memberships: activeMemberships,
      history,
      attendance: attendanceOverview,
      recentAttendance,
      registeredTournaments,
      upcomingTournaments,
      banners,
      cancellationLimitHours,
      allowRescheduling,
      allowCancellation,
      allowOnlineBooking,
      maintenanceMode
    });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/client/v1/home ->`, error);
    logger.error('Home API error', { error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message, stack: error.stack });
    return jsonResponse({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }, { status: 500 });
  }
}
