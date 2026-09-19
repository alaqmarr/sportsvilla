import { withApiHandler } from '@/core/http/api-handler';
import { authenticateClient } from '@/core/auth/auth-middleware';
import { CouponService } from '@/modules/coupons/coupons.services';

export const GET = withApiHandler(async (request: Request) => {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const data = await CouponService.getAvailableCoupons(authRes.member.id);
  return { success: true, ...data };
});
