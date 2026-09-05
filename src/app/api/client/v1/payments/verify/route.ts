import { withApiHandler, ApiError } from '@/lib/api-handler';
import { authenticateClient } from '@/lib/auth-middleware';
import { PaymentService } from '@/services/PaymentService';

export const POST = withApiHandler(async (request: Request) => {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;

  const { bookingId, gateway = 'RAZORPAY', orderId, paymentId, signature, transactionId } = await request.json();

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
