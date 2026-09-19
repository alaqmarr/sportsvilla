import { withApiHandler, ApiError } from '@/core/http/api-handler';
import { authenticateClient } from '@/core/auth/auth-middleware';
import { prisma } from '@/core/database/prisma';

export const POST = withApiHandler(async (request: Request) => {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  const { member } = authRes;

  const body = await request.json();
  const { all, notificationIds } = body;

  if (!all && (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0)) {
    throw new ApiError('Must provide either all: true or a non-empty notificationIds array', 400);
  }

  let markedCount = 0;

  if (all) {
    const result = await prisma.notification.updateMany({
      where: {
        memberId: member.id,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
    markedCount = result.count;
  } else if (notificationIds && notificationIds.length > 0) {
    const result = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        memberId: member.id, // Strictly scoped to authenticated member to prevent IDOR
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
    markedCount = result.count;
  }

  return {
    success: true,
    markedCount
  };
});
