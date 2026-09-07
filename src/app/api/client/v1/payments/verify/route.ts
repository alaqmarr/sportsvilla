import { withApiHandler, ApiError } from '@/lib/api-handler';
import { authenticateClient } from '@/lib/auth-middleware';
import { PaymentService } from '@/services/PaymentService';
import { prisma } from '@/lib/prisma';

export const POST = withApiHandler(async (request: Request) => {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;

  const { bookingId, gateway = 'RAZORPAY', orderId, paymentId, signature, transactionId } = await request.json();
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

  if (gateway === 'PHONEPE') {
    if (!transactionId) {
      throw new ApiError('Transaction ID is required for PhonePe verification', 400);
    }
    const result = await PaymentService.checkPhonePeStatus(bookingId, transactionId);
    return result;
  }

  if (gateway === 'RAZORPAY') {
    if (!orderId || !paymentId || !signature) {
      throw new ApiError('Missing required Razorpay parameters', 400);
    }
    const result = await PaymentService.verifyRazorpayPayment(bookingId, orderId, paymentId, signature);
    return result;
  }

  throw new ApiError('Invalid gateway', 400);
});
