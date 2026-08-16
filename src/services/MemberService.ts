import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api-handler';
import { generateMemberId } from '@/lib/memberUtils';
import { logger } from '@/lib/logger';

export class MemberService {
  /**
   * Retrieves profile, family members, and activity summary.
   */
  static async getProfile(primaryMember: any, targetMemberIdStr?: string | null) {
    let targetMemberId = targetMemberIdStr || primaryMember.id;

    const familyMembers = await prisma.member.findMany({
      where: { mobile: primaryMember.mobile },
      select: { id: true, name: true, mobile: true, loyaltyPoints: true, walletBalance: true },
      orderBy: { joinDate: 'asc' }
    });

    if (!familyMembers.find(m => m.id === targetMemberId)) {
      targetMemberId = primaryMember.id;
    }

    const targetMemberData = await prisma.member.findUnique({
      where: { id: targetMemberId },
      select: { name: true, mobile: true, email: true, dateOfBirth: true, loyaltyPoints: true }
    });

    const now = new Date();
    const allBookings = await prisma.booking.findMany({
      where: {
        OR: [
          { memberId: targetMemberId },
          { participants: { some: { memberId: targetMemberId, status: 'CONFIRMED' } } }
        ]
      },
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

    return {
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
    };
  }

  /**
   * Updates member profile.
   */
  static async updateProfile(primaryMember: any, targetMemberIdStr: string | null, data: { name?: string, email?: string, dateOfBirth?: string }) {
    const targetMemberId = targetMemberIdStr || primaryMember.id;

    const familyMembers = await prisma.member.findMany({
      where: { mobile: primaryMember.mobile },
      select: { id: true }
    });

    if (!familyMembers.find(m => m.id === targetMemberId)) {
      throw new ApiError('Unauthorized access to member profile', 403);
    }

    const updatedMember = await prisma.member.update({
      where: { id: targetMemberId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.dateOfBirth !== undefined && { dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null })
      }
    });

    return { profile: updatedMember };
  }

  /**
   * Auto-populates a family group for the given member's mobile number.
   * If a family group does not exist, it creates one and associates all members with the same mobile.
   */
  static async autoPopulateFamilyGroup(primaryMemberId: string) {
    const member = await prisma.member.findUnique({
      where: { id: primaryMemberId },
      include: { family: true }
    });

    if (!member) {
      throw new ApiError('Member not found', 404);
    }

    let familyId = member.familyId;

    if (!familyId) {
      // Create new family group
      const group = await prisma.familyGroup.create({
        data: {
          mobile: member.mobile
        }
      });
      familyId = group.id;
    }

    // Attach all members with same mobile to this family ID
    const result = await prisma.member.updateMany({
      where: {
        mobile: member.mobile,
        familyId: null
      },
      data: {
        familyId
      }
    });

    logger.info('Auto populated family group', { primaryMemberId, familyId, updatedCount: result.count });
    
    return { familyId, syncedCount: result.count };
  }
}
