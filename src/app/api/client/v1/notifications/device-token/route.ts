import { withApiHandler, ApiError } from '@/core/http/api-handler';
import { authenticateClient } from '@/core/auth/auth-middleware';
import { prisma } from '@/core/database/prisma';
import { Expo } from 'expo-server-sdk';

export const POST = withApiHandler(async (request: Request) => {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  const { member } = authRes;

  const body = await request.json();
  const { token, platform } = body;

  if (!token || typeof token !== 'string') {
    throw new ApiError('Token is required', 400);
  }

  if (!Expo.isExpoPushToken(token)) {
    throw new ApiError('Invalid Expo push token format', 400);
  }

  await prisma.deviceToken.upsert({
    where: { token },
    update: {
      memberId: member.id,
      platform: platform ?? undefined,
      updatedAt: new Date()
    },
    create: {
      memberId: member.id,
      token,
      platform: platform ?? undefined
    }
  });

  return {
    success: true,
    message: 'Device token registered successfully',
    token
  };
});

export const DELETE = withApiHandler(async (request: Request) => {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  const { member } = authRes;

  const body = await request.json();
  const { token } = body;

  if (!token || typeof token !== 'string') {
    throw new ApiError('Token is required', 400);
  }

  await prisma.deviceToken.deleteMany({
    where: {
      token,
      memberId: member.id
    }
  });

  return {
    success: true,
    message: 'Device token deregistered successfully'
  };
});
