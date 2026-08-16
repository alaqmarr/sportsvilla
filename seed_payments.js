const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function main() {
  const settings = [
    { key: 'PAYMENT_GATEWAY_ACTIVE', value: 'BOTH' },
    { key: 'RAZORPAY_KEY_ID', value: 'rzp_test_dummy_key_id' },
    { key: 'RAZORPAY_KEY_SECRET', value: 'dummy_secret' },
    { key: 'PHONEPE_MERCHANT_ID', value: 'PGTESTPAYUAT' },
    { key: 'PHONEPE_SALT_KEY', value: '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399' },
    { key: 'PHONEPE_SALT_INDEX', value: '1' },
    { key: 'PHONEPE_ENV', value: 'UAT' }
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value }
    });
  }
  console.log('Payment seeded.');
}

main().then(() => prisma.$disconnect());
