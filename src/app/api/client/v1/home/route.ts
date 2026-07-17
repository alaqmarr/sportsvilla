import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';

export async function GET(request: Request) {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member: primaryMember } = authRes;
  const { searchParams } = new URL(request.url);
  let targetMemberId = searchParams.get('memberId') || primaryMember.id;

  try {
    // 1. Fetch all family members sharing the same mobile number
    const familyMembers = await prisma.member.findMany({
      where: { mobile: primaryMember.mobile },
      select: { id: true, name: true, loyaltyPoints: true },
      orderBy: { joinDate: 'asc' }
    });

    // 2. Security Check: ensure requested memberId belongs to this family
    if (!familyMembers.find(m => m.id === targetMemberId)) {
      targetMemberId = primaryMember.id;
    }

    // 3. Fetch upcoming bookings for the target member
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        memberId: targetMemberId,
        startTime: { gt: new Date() },
        status: 'CONFIRMED'
      },
      include: {
        turf: {
          select: { name: true, location: true }
        },
        sport: {
          select: { name: true }
        }
      },
      orderBy: { startTime: 'asc' },
      take: 5 // limit to 5 upcoming for home screen
    });

    // 4. (Optional) Fetch basic Wallet or Loyalty details for the target member
    const targetMemberData = familyMembers.find(m => m.id === targetMemberId);

    // 5. Fetch Memberships
    const memberMemberships = await prisma.memberMembership.findMany({
      where: { memberId: targetMemberId },
      include: {
        membershipPlan: {
          include: { sport: { select: { name: true } } }
        }
      },
      orderBy: { endDate: 'desc' }
    });

    const now = new Date();
    
    // 6. Fetch Attendances for calculations
    const attendances = await prisma.attendance.findMany({
      where: { memberId: targetMemberId },
      include: { sport: { select: { name: true } } },
      orderBy: { date: 'desc' }
    });

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
          startDate: m.startDate.toISOString().split('T')[0],
          expiryDate: m.endDate.toISOString().split('T')[0],
          expiresInDays: expiresInDays > 0 ? expiresInDays : 0,
          totalDays: m.membershipPlan.durationInDays,
          slotsPerDay: m.membershipPlan.slotsPerDay,
          rewardPointsPerCheckin: m.membershipPlan.rewardPointsPerCheckin,
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
      const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'short' });
      // format time as "07:00 AM"
      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      return {
        id: a.id,
        dateStr,
        time: timeStr,
        facility: a.sport?.name || 'Facility',
        status: a.status === 'PRESENT' ? 'Present' : 'Absent'
      };
    });

    return NextResponse.json({
      success: true,
      familyMembers,
      targetMemberId,
      profile: targetMemberData,
      upcomingBookings,
      memberships: activeMemberships,
      history,
      attendance: attendanceOverview,
      recentAttendance
    });
  } catch (error: any) {
    console.error("Home API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
