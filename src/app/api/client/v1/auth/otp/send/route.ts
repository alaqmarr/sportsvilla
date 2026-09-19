import { withApiHandler } from '@/core/http/api-handler';
import { AuthService } from '@/modules/members/members-auth.services';

export const POST = withApiHandler(async (request: Request) => {
  const { mobile } = await request.json();
  await AuthService.sendOtp(mobile);
  return { success: true, message: "OTP sent successfully" };
});
