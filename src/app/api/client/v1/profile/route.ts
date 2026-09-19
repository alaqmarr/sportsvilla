import { withApiHandler } from '@/core/http/api-handler';
import { authenticateClient } from '@/core/auth/auth-middleware';
import { MemberService } from '@/modules/members/members.services';

export const GET = withApiHandler(async (request: Request) => {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { searchParams } = new URL(request.url);
  const targetMemberId = searchParams.get('memberId');

  const data = await MemberService.getProfile(authRes.member, targetMemberId);
  return { success: true, ...data };
});

export const PUT = withApiHandler(async (request: Request) => {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const body = await request.json();
  const targetMemberId = body.memberId || null;

  const data = await MemberService.updateProfile(authRes.member, targetMemberId, body);
  return { success: true, ...data };
});
