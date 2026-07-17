import { prisma } from './src/lib/prisma';
async function main() {
  const settings = await prisma.setting.findMany();
  console.log(settings);
}
main().finally(() => prisma.$disconnect());
