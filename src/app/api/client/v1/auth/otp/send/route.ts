import { withApiHandler } from '@/lib/api-handler';
import { AuthService } from '@/services/AuthService';

export const POST = withApiHandler(async (request: Request) => {
  const { mobile } = await request.json();
  await AuthService.sendOtp(mobile);
  return { success: true, message: "OTP sent successfully" };
});
