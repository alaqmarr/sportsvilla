import { withApiHandler } from '@/core/http/api-handler';
import { AuthService } from '@/modules/members/members-auth.services';

export const POST = withApiHandler(async (request: Request) => {
  const data = await request.json();
  const result = await AuthService.register(data);
  return { 
    success: true, 
    customToken: result.customToken, 
    memberId: result.memberId,
    member: result.member 
  };
});
