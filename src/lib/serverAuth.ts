import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function getServerMember() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sv_session')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const decodedToken = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;
    
    // First try by memberId if set (for specific family member switching if implemented)
    if (decodedToken.memberId) {
      const member = await prisma.member.findUnique({
        where: { id: decodedToken.memberId }
      });
      if (member) return member;
    }
    
    // Fallback to primary account by phone
    const phoneNumber = decodedToken.uid;
    const email = decodedToken.email;
    
    if (phoneNumber) {
      const member = await prisma.member.findFirst({
        where: { mobile: phoneNumber }
      });
      if (member) return member;
    }
    
    if (email) {
      const member = await prisma.member.findFirst({
        where: { email: email }
      });
      if (member) return member;
    }
    
    return null;
  } catch (err) {
    console.error('getServerMember Error:', err);
    return null;
  }
}

export async function requireServerMember() {
  const member = await getServerMember();
  if (!member) {
    redirect('/play/login');
  }
  return member;
}
