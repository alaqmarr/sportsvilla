const Database = require('better-sqlite3');
const db = new Database('dev.db');

const settings = [
  { key: 'PAYMENT_GATEWAY_ACTIVE', value: 'BOTH' },
  { key: 'RAZORPAY_KEY_ID', value: 'rzp_test_dummy_key_id' },
  { key: 'RAZORPAY_KEY_SECRET', value: 'dummy_secret' },
  { key: 'PHONEPE_MERCHANT_ID', value: 'PGTESTPAYUAT' },
  { key: 'PHONEPE_SALT_KEY', value: '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399' },
  { key: 'PHONEPE_SALT_INDEX', value: '1' },
  { key: 'PHONEPE_ENV', value: 'UAT' }
];

const insert = db.prepare(`INSERT INTO Setting ("key", "value", "updatedAt") VALUES (?, ?, ?) ON CONFLICT("key") DO UPDATE SET "value" = excluded."value", "updatedAt" = excluded."updatedAt"`);

db.transaction(() => {
  const now = new Date().toISOString();
  for (const s of settings) {
    insert.run(s.key, s.value, now);
  }
})();

console.log('Seeded successfully using better-sqlite3');
db.close();
