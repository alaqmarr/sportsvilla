import { withApiHandler } from '@/lib/api-handler';
import { authenticateClient } from '@/lib/auth-middleware';
import { MemberService } from '@/services/MemberService';

export const POST = withApiHandler(async (request: Request) => {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const data = await MemberService.autoPopulateFamilyGroup(authRes.member.id);
  return { success: true, ...data };
});
