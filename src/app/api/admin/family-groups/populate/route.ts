import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Populate family groups based on unique mobile numbers
    const members = await prisma.member.findMany({
      where: {
        familyId: null
      }
    });

    const mobileMap = new Map<string, typeof members>();

    for (const member of members) {
      if (!mobileMap.has(member.mobile)) {
        mobileMap.set(member.mobile, []);
      }
      mobileMap.get(member.mobile)!.push(member);
    }

    let familiesCreated = 0;
    let membersUpdated = 0;

    await prisma.$transaction(async (tx) => {
      for (const [mobile, groupedMembers] of mobileMap.entries()) {
        const family = await tx.familyGroup.create({
          data: {
            mobile
          }
        });
        familiesCreated++;

        for (const member of groupedMembers) {
          await tx.member.update({
            where: { id: member.id },
            data: { familyId: family.id }
          });
          membersUpdated++;
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      familiesCreated, 
      membersUpdated,
      message: `Successfully created ${familiesCreated} family groups for ${membersUpdated} members.`
    });
  } catch (error: any) {
    console.error('Error populating family groups:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
