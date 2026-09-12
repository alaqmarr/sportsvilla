const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const turfs = await prisma.turf.findMany({ include: { sports: { include: { sport: true } } } });
  console.log("Turfs length:", turfs.length);
  if (turfs.length > 0) {
    console.log("Turf 0 sports length:", turfs[0].sports.length);
  }
}
main();
