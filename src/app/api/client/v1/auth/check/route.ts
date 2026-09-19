import { withApiHandler } from '@/core/http/api-handler';
import { AuthService } from '@/modules/members/members-auth.services';

export const POST = withApiHandler(async (request: Request) => {
  const { mobile } = await request.json();
  const result = await AuthService.checkUserExists(mobile);
  return { 
    success: true, 
    exists: result.exists,
    memberId: result.memberId
  };
});
