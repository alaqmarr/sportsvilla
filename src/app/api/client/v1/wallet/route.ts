import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse, apiLog } from '@/lib/api-logger';

export async function GET(request: Request) {
  apiLog(`[API] GET /api/client/v1/wallet called`);
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
    const loyaltyHistory = await prisma.loyaltyHistory.findMany({
      where: { memberId: targetMemberId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // Fetch Wallet Transactions
    const walletHistory = await prisma.walletTransaction.findMany({
      where: { memberId: targetMemberId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const combined = [
      ...loyaltyHistory.map(h => ({
        id: `loyalty_${h.id}`,
        isWallet: false,
        title: h.type === "REDEEMED" ? "Points Redeemed" : (h.source === "WELCOME" ? "Welcome Bonus" : "Points Earned"),
        subtitle: h.description || h.source,
        createdAt: h.createdAt,
        points: h.points,
        amount: 0,
        type: h.type // EARNED or REDEEMED
      })),
      ...walletHistory.map(w => ({
        id: `wallet_${w.id}`,
        isWallet: true,
        title: w.type === "CREDIT" ? "Wallet Credited" : "Wallet Debited",
        subtitle: w.description || 'Wallet Transaction',
        createdAt: w.createdAt,
        points: 0,
        amount: w.amount,
        type: w.type // CREDIT or DEBIT
      }))
    ];

    combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const transactions = combined.slice(0, 30).map(t => {
      const d = new Date(t.createdAt);
      const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      return {
        ...t,
        dateStr: `${dateStr}, ${timeStr}`
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
