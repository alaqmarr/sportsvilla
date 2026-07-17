const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();
prisma.setting.findMany().then(res => {
  console.log("Settings:");
  console.log(res);
}).catch(console.error).finally(() => prisma.$disconnect());
