import { withApiHandler } from '@/lib/api-handler';
import { authenticateClient } from '@/lib/auth-middleware';
import { PaymentService } from '@/services/PaymentService';

export const POST = withApiHandler(async (request: Request) => {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;

  const { bookingId, gateway } = await request.json();
  const result = await PaymentService.createOrder(bookingId, gateway);
  
  return { success: true, ...result };
});
