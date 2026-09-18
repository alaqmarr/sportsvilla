import { withApiHandler, ApiError } from '@/lib/api-handler';
import { authenticateClient } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export const PATCH = withApiHandler(async (
  request: Request,
  context: { params?: Promise<{ id: string }> | { id: string } }
) => {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  const { member } = authRes;

  const rawParams = context?.params ? await context.params : null;
  const id = rawParams?.id;

  if (!id) {
    throw new ApiError('Notification ID is required', 400);
  }

  const notification = await prisma.notification.findUnique({
    where: { id }
  });

  if (!notification) {
    throw new ApiError('Notification not found', 404);
  }

  // IDOR Guard: Verify ownership
  if (notification.memberId !== member.id) {
    throw new ApiError('Forbidden: You cannot modify this notification', 403);
  }

  await prisma.notification.update({
    where: { id },
    data: {
      isRead: true,
      readAt: new Date()
    }
  });

  return {
    success: true,
    message: 'Notification marked as read'
  };
});
