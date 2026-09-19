import { withApiHandler } from '@/core/http/api-handler';
import { AuthService } from '@/modules/members/members-auth.services';

export const POST = withApiHandler(async (request: Request) => {
  const { mobile, code } = await request.json();
  const result = await AuthService.verifyOtp(mobile, code);
  return { 
    success: true, 
    customToken: result.customToken,
    memberId: result.memberId
  };
});
