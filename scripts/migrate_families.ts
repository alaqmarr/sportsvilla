import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Starting data migration for FamilyGroups...');

  const members = await prisma.member.findMany({
    select: { mobile: true },
  });
  
  const uniqueMobiles = Array.from(new Set(members.map(m => m.mobile)));

  console.log(`Found ${uniqueMobiles.length} unique mobile numbers.`);

  for (const mobile of uniqueMobiles) {
    if (!mobile) continue;

    let familyGroup = await prisma.familyGroup.findUnique({
      where: { mobile },
    });

    if (!familyGroup) {
      familyGroup = await prisma.familyGroup.create({
        data: { mobile },
      });
      console.log(`Created FamilyGroup for mobile: ${mobile}`);
    }

    const result = await prisma.member.updateMany({
      where: { mobile, familyId: null },
      data: { familyId: familyGroup.id },
    });

    if (result.count > 0) {
      console.log(`Assigned ${result.count} members to FamilyGroup for mobile: ${mobile}`);
    }
  }

  console.log('Data migration complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
