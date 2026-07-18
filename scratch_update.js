const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function test() {
  const t = await prisma.tournament.findFirst();
  if (!t) return console.log("No tournament found");
  
  console.log("Updating", t.id);
  
  try {
    const updated = await prisma.tournament.update({
      where: { id: t.id },
      data: {
        name: t.name + " (Updated)",
        startDate: new Date(),
        paymentUpiId: null
      }
    });
    console.log("Success!", updated.name);
  } catch (e) {
    console.error("Error updating:", e);
  }
}
test();
