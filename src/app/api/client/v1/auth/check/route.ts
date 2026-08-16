import { withApiHandler } from '@/lib/api-handler';
import { AuthService } from '@/services/AuthService';

export const POST = withApiHandler(async (request: Request) => {
  const { mobile } = await request.json();
  const result = await AuthService.checkUserExists(mobile);
  return { 
    success: true, 
    exists: result.exists,
    memberId: result.memberId
  };
});
