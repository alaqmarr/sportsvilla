const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const msgs = await prisma.booking.findMany({ 
      orderBy: { createdAt: 'desc' }, 
      take: 1
    });
    console.log(JSON.stringify(msgs, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
run();
