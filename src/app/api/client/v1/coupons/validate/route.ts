import { withApiHandler, ApiError } from '@/core/http/api-handler';
import { authenticateClient } from '@/core/auth/auth-middleware';
import { CouponService } from '@/modules/coupons/coupons.services';
import { checkRateLimit } from '@/core/http/rate-limit';

export const POST = withApiHandler(async (request: Request) => {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  if (!checkRateLimit(`coupon_validate_${authRes.member.id}`, 10, 60000)) {
    throw new ApiError('Too many coupon validation requests. Please wait a minute.', 429);
  }

  const { code, bookingAmount, sportId } = await request.json();
  const data = await CouponService.validateCoupon(authRes.member.id, code, bookingAmount, sportId);
  
  return { success: true, ...data };
});

