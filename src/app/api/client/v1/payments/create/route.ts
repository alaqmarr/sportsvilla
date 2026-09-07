import { withApiHandler, ApiError } from '@/lib/api-handler';
import { authenticateClient } from '@/lib/auth-middleware';
import { PaymentService } from '@/services/PaymentService';
import { prisma } from '@/lib/prisma';

export const POST = withApiHandler(async (request: Request) => {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;

  const { bookingId, gateway, platform = 'WEB' } = await request.json();
  if (!bookingId) {
    throw new ApiError('Booking ID is required', 400);
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { member: true }
  });

  if (!booking) {
    throw new ApiError('Booking not found', 404);
  }

  const memberFamilyId = (authRes.member as any).familyId || (authRes.member as any).familyGroupId;
  const bookingFamilyId = (booking.member as any)?.familyId || (booking.member as any)?.familyGroupId;
  const isOwner = booking.memberId === authRes.member.id;
  const isFamilyMember = Boolean(memberFamilyId && bookingFamilyId && memberFamilyId === bookingFamilyId);

  if (!isOwner && !isFamilyMember) {
    throw new ApiError('Forbidden: You do not have permission to pay for this booking', 403);
  }

  const host = request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  const origin = host ? `${proto}://${host}` : undefined;

  const result = await PaymentService.createOrder(bookingId, gateway, platform, origin);
  
  return { success: true, ...result };
});
