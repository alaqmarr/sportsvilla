import { prisma } from "../src/core/database/prisma";

async function run() {
  await prisma.setting.upsert({
    where: { key: "GDRIVE_BACKUP_FOLDER_ID" },
    update: { value: "10Ulnl1CQugl9Otfrau3hkNeR6Urb5PO-" },
    create: { key: "GDRIVE_BACKUP_FOLDER_ID", value: "10Ulnl1CQugl9Otfrau3hkNeR6Urb5PO-" },
  });
  console.log("Seeded GDRIVE_BACKUP_FOLDER_ID successfully.");
}

run().catch(console.error).finally(() => prisma.$disconnect());
