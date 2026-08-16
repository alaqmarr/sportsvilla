import { withApiHandler } from '@/lib/api-handler';
import { AuthService } from '@/services/AuthService';

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
