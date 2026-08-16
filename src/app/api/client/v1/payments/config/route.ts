import { withApiHandler } from '@/lib/api-handler';
import { PaymentService } from '@/services/PaymentService';

export const GET = withApiHandler(async (request: Request) => {
  const config = await PaymentService.getPaymentConfig();
  return { success: true, config };
});
