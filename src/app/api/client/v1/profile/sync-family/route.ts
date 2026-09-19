import { withApiHandler } from '@/core/http/api-handler';
import { authenticateClient } from '@/core/auth/auth-middleware';
import { MemberService } from '@/modules/members/members.services';

export const POST = withApiHandler(async (request: Request) => {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const data = await MemberService.autoPopulateFamilyGroup(authRes.member.id);
  return { success: true, ...data };
});
