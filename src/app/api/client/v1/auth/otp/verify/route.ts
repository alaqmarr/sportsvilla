import { withApiHandler } from '@/lib/api-handler';
import { AuthService } from '@/services/AuthService';

export const POST = withApiHandler(async (request: Request) => {
  const { mobile, code } = await request.json();
  const result = await AuthService.verifyOtp(mobile, code);
  return { 
    success: true, 
    customToken: result.customToken,
    memberId: result.memberId
  };
});
