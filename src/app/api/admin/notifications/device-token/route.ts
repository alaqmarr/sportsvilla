import { NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';
import { getToken } from 'next-auth/jwt';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { deviceToken, platform } = body;

    if (!deviceToken || typeof deviceToken !== 'string' || !deviceToken.trim()) {
      return NextResponse.json({ error: 'deviceToken is required' }, { status: 400 });
    }

    const trimmedToken = deviceToken.trim();
    let validAdminId: string | null = null;

    // 1. Attempt standard Next-Auth token verification
    try {
      const reqWithNextAuthHack = request as any;
      const token = await getToken({ req: reqWithNextAuthHack });
      if (token && token.email) {
        const admin = await prisma.admin.findUnique({ where: { email: token.email } });
        if (admin && admin.isActive) {
          validAdminId = admin.id;
        }
      }
    } catch {
      // Non-fatal if session token parsing fails in mobile bridge context
    }

    // 2. Validate client-supplied adminId against database to ensure foreign key validity
    if (!validAdminId && body.adminId && typeof body.adminId === 'string') {
      const admin = await prisma.admin.findUnique({ where: { id: body.adminId } });
      if (admin && admin.isActive) {
        validAdminId = admin.id;
      }
    }

    // 3. Fallback to client-supplied adminEmail if adminId was a local synthetic placeholder
    const candidateEmail = body.adminEmail || body.email;
    if (!validAdminId && candidateEmail && typeof candidateEmail === 'string') {
      const admin = await prisma.admin.findUnique({ where: { email: candidateEmail } });
      if (admin && admin.isActive) {
        validAdminId = admin.id;
      }
    }

    // 4. Default active admin fallback for companion mobile client
    if (!validAdminId) {
      const defaultAdmin =
        (await prisma.admin.findFirst({ where: { isActive: true } })) ||
        (await prisma.admin.findFirst());
      if (defaultAdmin) {
        validAdminId = defaultAdmin.id;
      }
    }

    if (!validAdminId) {
      return NextResponse.json({ error: 'Unauthorized: No active admin found' }, { status: 401 });
    }

    // Upsert the token for this admin safely without foreign key violations
    await prisma.adminDeviceToken.upsert({
      where: { token: trimmedToken },
      update: {
        adminId: validAdminId,
        platform: platform || 'unknown',
      },
      create: {
        adminId: validAdminId,
        token: trimmedToken,
        platform: platform || 'unknown',
      },
    });

    return NextResponse.json({ success: true, adminId: validAdminId });
  } catch (error: any) {
    console.error('[Admin Notification API] POST /api/admin/notifications/device-token -> error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawToken = searchParams.get('token') || searchParams.get('deviceToken');
    const token = rawToken?.trim();

    if (!token) {
      return NextResponse.json({ error: 'deviceToken is required' }, { status: 400 });
    }

    const deviceRecord = await prisma.adminDeviceToken.findUnique({
      where: { token },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!deviceRecord) {
      return NextResponse.json({
        registered: false,
        valid: false,
        deviceToken: token,
      }, { status: 200 });
    }

    const isValid = deviceRecord.admin ? deviceRecord.admin.isActive : true;

    return NextResponse.json({
      registered: true,
      valid: isValid,
      deviceToken: deviceRecord.token,
      platform: deviceRecord.platform,
      adminId: deviceRecord.adminId,
      adminEmail: deviceRecord.admin?.email || null,
      adminName: deviceRecord.admin?.name || null,
      updatedAt: deviceRecord.updatedAt,
    }, { status: 200 });
  } catch (error: any) {
    console.error('[Admin Notification API] GET /api/admin/notifications/device-token -> error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
