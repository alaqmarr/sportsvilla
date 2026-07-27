import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse } from '@/lib/api-logger';

export async function GET(request: Request) {
  console.log(`[API] GET /api/client/v1/profile called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member: primaryMember } = authRes;
  const { searchParams } = new URL(request.url);
  let targetMemberId = searchParams.get('memberId') || primaryMember.id;

  try {
    const familyMembers = await prisma.member.findMany({
      where: { mobile: primaryMember.mobile },
      select: { id: true, name: true, mobile: true, loyaltyPoints: true, walletBalance: true },
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
    let ongoing = 0;

    allBookings.forEach(b => {
      if (b.status === 'CANCELLED') {
        cancelled++;
      } else if (b.status === 'CONFIRMED') {
        if (new Date(b.startTime) > now) {
          upcoming++;
        } else if (new Date(b.endTime) > now) {
          ongoing++;
        } else {
          completed++;
        }
      }
    });

    return jsonResponse({
      success: true,
      familyMembers,
      targetMemberId,
      profile: targetMemberData,
      activity: {
        total: totalBookings,
        completed,
        upcoming,
        cancelled,
        ongoing
      }
    });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/client/v1/profile ->`, error);
    console.error("Profile API error:", error);
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  console.log(`[API] PUT /api/client/v1/profile called`);
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
      return jsonResponse({ error: 'Unauthorized access to member profile' }, { status: 403 });
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

    return jsonResponse({ success: true, profile: updatedMember });
  } catch (error: any) {
    console.error(`[API ERROR] PUT /api/client/v1/profile ->`, error);
    console.error("Profile Update API error:", error);
    return jsonResponse({ error: 'Failed to update profile' }, { status: 500 });
  }
}

