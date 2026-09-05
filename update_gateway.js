const { prisma } = require('./src/lib/prisma');
async function main() {
  const settings = [
    { key: 'PHONEPE_ENV', value: 'PROD' },
    { key: 'PHONEPE_MERCHANT_ID', value: 'M22FEYQH8C3J3_2609051038' },
    { key: 'PHONEPE_SALT_KEY', value: 'NDczNDAwNzItMTQ4OS00MWJiLWI4MWMtODEwMDlhMTA1ZTgx' },
    { key: 'PHONEPE_SALT_INDEX', value: '1' }
  ];
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value, updatedAt: new Date() }
    });
  }
  console.log('Inserted PhonePe credentials to DB');
}
main().catch(console.error).finally(() => prisma.$disconnect());
