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

    // 3. Fetch detailed profile data for the target member
    const targetMemberData = await prisma.member.findUnique({
      where: { id: targetMemberId },
      select: { name: true, mobile: true, email: true, dateOfBirth: true, loyaltyPoints: true }
    });

    // 4. Fetch Activity Summary
    const now = new Date();
    const allBookings = await prisma.booking.findMany({
      where: { memberId: targetMemberId },
      select: { status: true, startTime: true, endTime: true }
    });

    const totalBookings = allBookings.length;
    let completed = 0;
    let upcoming = 0;
    let cancelled = 0;

    allBookings.forEach(b => {
      if (b.status === 'CANCELLED') {
        cancelled++;
      } else if (b.status === 'CONFIRMED') {
        if (new Date(b.startTime) > now) {
          upcoming++;
        } else {
          completed++;
        }
      }
    });

    return NextResponse.json({
      success: true,
      familyMembers,
      targetMemberId,
      profile: targetMemberData,
      activity: {
        total: totalBookings,
        completed,
        upcoming,
        cancelled
      }
    });
  } catch (error: any) {
    console.error("Profile API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member: primaryMember } = authRes;
  
  try {
    const body = await request.json();
    const targetMemberId = body.memberId || primaryMember.id;
    const { name, email, dateOfBirth } = body;

    // Security Check: ensure requested memberId belongs to this family
    const familyMembers = await prisma.member.findMany({
      where: { mobile: primaryMember.mobile },
      select: { id: true }
    });

    if (!familyMembers.find(m => m.id === targetMemberId)) {
      return NextResponse.json({ error: 'Unauthorized access to member profile' }, { status: 403 });
    }

    // Update the profile (excluding mobile)
    const updatedMember = await prisma.member.update({
      where: { id: targetMemberId },
      data: {
        ...(name && { name }),
        ...(email !== undefined && { email }),
        ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null })
      }
    });

    return NextResponse.json({ success: true, profile: updatedMember });
  } catch (error: any) {
    console.error("Profile Update API error:", error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

