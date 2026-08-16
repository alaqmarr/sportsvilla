import { withApiHandler, ApiError } from '@/lib/api-handler';
import { authenticateClient } from '@/lib/auth-middleware';
import { CouponService } from '@/services/CouponService';
import { checkRateLimit } from '@/lib/rate-limit';

export const POST = withApiHandler(async (request: Request) => {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  if (!checkRateLimit(`coupon_validate_${authRes.member.id}`, 10, 60000)) {
    throw new ApiError('Too many coupon validation requests. Please wait a minute.', 429);
  }

  const { code, bookingAmount } = await request.json();
  const data = await CouponService.validateCoupon(authRes.member.id, code, bookingAmount);
  
  return { success: true, ...data };
});
