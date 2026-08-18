import { prisma } from './src/lib/prisma';
async function main() {
  const sports = await prisma.sport.findMany();
  console.log(sports);
}
main();
