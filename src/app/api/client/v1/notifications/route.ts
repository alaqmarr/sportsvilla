import { withApiHandler } from '@/lib/api-handler';
import { authenticateClient } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export const GET = withApiHandler(async (request: Request) => {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  const { member } = authRes;

  const { searchParams } = new URL(request.url);

  // Parse take (limit, default 20, max 100) and skip (offset, default 0)
  const takeParam = searchParams.get('take') || searchParams.get('limit') || '20';
  const skipParam = searchParams.get('skip');
  const pageParam = searchParams.get('page');

  let take = parseInt(takeParam, 10);
  if (isNaN(take) || take <= 0) take = 20;
  if (take > 100) take = 100;

  let skip = 0;
  if (skipParam !== null) {
    skip = parseInt(skipParam, 10);
    if (isNaN(skip) || skip < 0) skip = 0;
  } else if (pageParam !== null) {
    const page = parseInt(pageParam, 10);
    if (!isNaN(page) && page > 1) {
      skip = (page - 1) * take;
    }
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' },
      take,
      skip
    }),
    prisma.notification.count({
      where: { memberId: member.id, isRead: false }
    })
  ]);

  return {
    success: true,
    notifications,
    unreadCount
  };
});
