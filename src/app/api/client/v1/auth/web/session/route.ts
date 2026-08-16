import { prisma } from '@/lib/prisma';
import { jsonResponse, apiLog } from '@/lib/api-logger';
import { getSessionFromCookie } from '@/lib/web-auth';

export async function GET(request: Request) {
  apiLog(`[API] GET /api/client/v1/auth/web/session called`);
  try {
    const session = await getSessionFromCookie(request);

    if (!session) {
      return jsonResponse({ authenticated: false });
    }

    const { member } = session;

    // Fetch all family members for multi-profile support
    const familyMembers = await prisma.member.findMany({
      where: { mobile: member.mobile },
      select: {
        id: true,
        name: true,
        mobile: true,
        email: true,
        dateOfBirth: true,
        loyaltyPoints: true,
        walletBalance: true,
      },
    });

    return jsonResponse({
      authenticated: true,
      member: {
        id: member.id,
        name: member.name,
        mobile: member.mobile,
        email: member.email,
        dateOfBirth: member.dateOfBirth,
        loyaltyPoints: member.loyaltyPoints,
        walletBalance: member.walletBalance,
      },
      familyMembers,
    });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/client/v1/auth/web/session ->`, error);
    return jsonResponse({ authenticated: false });
  }
}
