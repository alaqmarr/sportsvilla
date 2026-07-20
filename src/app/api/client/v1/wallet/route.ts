import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse } from '@/lib/api-logger';

export async function GET(request: Request) {
  console.log(`[API] GET /api/client/v1/wallet called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member: primaryMember } = authRes;
  const { searchParams } = new URL(request.url);
  let targetMemberId = searchParams.get('memberId') || primaryMember.id;

  try {
    // 1. Fetch family members
    const familyMembers = await prisma.member.findMany({
      where: { mobile: primaryMember.mobile },
      select: { id: true, name: true, loyaltyPoints: true, walletBalance: true },
      orderBy: { joinDate: 'asc' }
    });

    if (!familyMembers.find(m => m.id === targetMemberId)) {
      targetMemberId = primaryMember.id;
    }
    const targetMemberData = familyMembers.find(m => m.id === targetMemberId);

    // 2. Fetch Loyalty History
    const history = await prisma.loyaltyHistory.findMany({
      where: { memberId: targetMemberId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const transactions = history.map(h => {
      const d = new Date(h.createdAt);
      const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      
      // Calculate INR amount equivalent if it was a redemption or earn
      // For now we'll send it as is and let the client multiply by conversion rate, 
      // but if we want the actual snapshot amount, we might need a separate field.
      // We will provide the points to frontend.
      
      let title = "Points Earned";
      if (h.type === "REDEEMED") title = "Points Redeemed";
      if (h.source === "WELCOME") title = "Welcome Bonus";

      return {
        id: h.id,
        title,
        subtitle: h.description || h.source,
        dateStr: `${dateStr}, ${timeStr}`,
        points: h.points,
        type: h.type, // EARNED or REDEEMED
      };
    });

    // 3. Fetch Conversion Rate
    const conversionSetting = await prisma.setting.findUnique({
      where: { key: 'sv_points_conversion_rate' }
    });
    const conversionRate = conversionSetting ? parseFloat(conversionSetting.value) : 1;

    return jsonResponse({
      success: true,
      familyMembers,
      targetMemberId,
      profile: targetMemberData,
      transactions,
      conversionRate
    });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/client/v1/wallet ->`, error);
    console.error("Wallet GET error:", error);
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}
