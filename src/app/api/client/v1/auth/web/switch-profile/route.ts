import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member, decodedToken } = authRes;
  
  try {
    const { memberId } = await request.json();
    
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'memberId is required' }, { status: 400 });
    }

    // Verify the requested member belongs to the same family (same mobile number)
    const targetMember = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!targetMember || targetMember.mobile !== member.mobile) {
      return NextResponse.json({ success: false, error: 'Unauthorized to switch to this profile' }, { status: 403 });
    }

    // Issue a new token with the requested memberId
    // We explicitly extract the fields we want to avoid carrying over standard jwt claims like iat/exp that sign() handles automatically if passed.
    const newToken = jwt.sign(
      {
        uid: decodedToken.uid,
        email: decodedToken.email,
        memberId: targetMember.id, // Override with new memberId
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "30d" }
    );

    const response = NextResponse.json({ success: true });
    
    response.cookies.set("sv_session", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error("Switch profile error:", error);
    return NextResponse.json({ success: false, error: 'Failed to switch profile' }, { status: 500 });
  }
}
