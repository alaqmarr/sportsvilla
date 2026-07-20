import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse } from '@/lib/api-logger';

export async function POST(request: Request) {
  console.log(`[API] POST /api/client/v1/wallet/redeem called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member: primaryMember } = authRes;
  
  try {
    const body = await request.json();
    const { points, memberId } = body;
    
    if (!points || points < 500) {
      return jsonResponse({ error: 'Minimum 500 SV Points required to redeem.' }, { status: 400 });
    }

    const targetMemberId = memberId || primaryMember.id;

    // Verify family membership
    const familyMembers = await prisma.member.findMany({
      where: { mobile: primaryMember.mobile },
      select: { id: true }
    });

    if (!familyMembers.find(m => m.id === targetMemberId)) {
      return jsonResponse({ error: 'Unauthorized member.' }, { status: 403 });
    }

    // Run transaction
    const result = await prisma.$transaction(async (tx) => {
      const member = await tx.member.findUnique({
        where: { id: targetMemberId }
      });

      if (!member) throw new Error('Member not found');
      if (member.loyaltyPoints < points) throw new Error('Insufficient SV Points');

      // Get conversion rate
      const conversionSetting = await tx.setting.findUnique({
        where: { key: 'sv_points_conversion_rate' }
      });
      const conversionRate = conversionSetting ? parseFloat(conversionSetting.value) : 1;
      const amountToAdd = points * conversionRate;

      // Update member
      const updatedMember = await tx.member.update({
        where: { id: targetMemberId },
        data: {
          loyaltyPoints: member.loyaltyPoints - points,
          walletBalance: member.walletBalance + amountToAdd
        }
      });

      // Create history
      await tx.loyaltyHistory.create({
        data: {
          memberId: targetMemberId,
          points: points,
          type: 'REDEEMED',
          source: 'MANUAL',
          description: 'Redeemed to Wallet'
        }
      });

      // Create wallet transaction
      await tx.walletTransaction.create({
        data: {
          memberId: targetMemberId,
          amount: amountToAdd,
          type: 'CREDIT',
          description: `Redeemed ${points} SV Points`
        }
      });

      return updatedMember;
    });

    return jsonResponse({ success: true, profile: result });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/wallet/redeem ->`, error);
    console.error("Wallet Redeem error:", error);
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}
