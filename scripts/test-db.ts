import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./whatsapp.db"
    }
  }
});
async function run() {
  const templates = await prisma.whatsAppTemplate.findMany();
  console.log("Templates:", templates);
  process.exit(0);
}
run();
