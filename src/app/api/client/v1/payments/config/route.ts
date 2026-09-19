import { withApiHandler } from '@/core/http/api-handler';
import { getPaymentConfig } from '@/modules/payments/payment-config.lib';

export const GET = withApiHandler(async (request: Request) => {
  const config = await getPaymentConfig();
  return { success: true, config };
});
