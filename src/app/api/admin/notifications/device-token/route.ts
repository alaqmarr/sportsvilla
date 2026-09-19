import { NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';
import { getToken } from 'next-auth/jwt';

export async function POST(request: Request) {
  try {
    // We allow either NextAuth token or a direct adminId body payload 
    // since the mobile app is currently transitioning from a mock state
    let adminId: string | null = null;
    
    // Attempt standard Next-Auth token verification
    const reqWithNextAuthHack = request as any;
    const token = await getToken({ req: reqWithNextAuthHack });
    if (token && token.email) {
      const admin = await prisma.admin.findUnique({ where: { email: token.email } });
      if (admin) {
        adminId = admin.id;
      }
    }

    const body = await request.json();
    const { deviceToken, platform } = body;

    // Fallback for mobile app using generic staff account during transition
    if (!adminId && body.adminId) {
      adminId = body.adminId;
    }

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized: No admin session' }, { status: 401 });
    }

    if (!deviceToken) {
      return NextResponse.json({ error: 'deviceToken is required' }, { status: 400 });
    }

    // Upsert the token for this admin
    await prisma.adminDeviceToken.upsert({
      where: { token: deviceToken },
      update: {
        adminId: adminId,
        platform: platform || 'unknown',
      },
      create: {
        adminId: adminId,
        token: deviceToken,
        platform: platform || 'unknown',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Admin Notification API] POST /api/admin/notifications/device-token -> error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
