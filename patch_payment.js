const fs = require('fs');
const file = 'src/services/PaymentService.ts';
let code = fs.readFileSync(file, 'utf8');

const helperMethod = \`n  static async getPhonePeConfig() {
    const settings = await prisma.setting.findMany({
      where: {
        key: { in: ['PHONEPE_MERCHANT_ID', 'PHONEPE_SALT_KEY', 'PHONEPE_SALT_INDEX', 'PHONEPE_ENV'] }
      }
    });
    const map = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    return {
      merchantId: map['PHONEPE_MERCHANT_ID'] || process.env.PHONEPE_MERCHANT_ID,
      saltKey: map['PHONEPE_SALT_KEY'] || process.env.PHONEPE_SALT_KEY,
      saltIndex: map['PHONEPE_SALT_INDEX'] || process.env.PHONEPE_SALT_INDEX || '1',
      env: map['PHONEPE_ENV'] || process.env.PHONEPE_ENV || 'UAT'
    };
  }
\;

code = code.replace(/static async getPaymentConfig\\\(\\\) \\{/, helperMethod.trim() + '\\n\\n  static async getPaymentConfig() {');

code = code.replace(
  /config\\.phonepeEnv = process\\.env\\.PHONEPE_ENV \\|\\| 'UAT';\\s*config\\.phonepeMerchantId = process\\.env\\.PHONEPE_MERCHANT_ID \\|\\| null;/,
  \const ppConfig = await PaymentService.getPhonePeConfig();\\n      config.phonepeEnv = ppConfig.env;\\n      config.phonepeMerchantId = ppConfig.merchantId;\`n);

code = code.replace(
  /const merchantId = process\\.env\\.PHONEPE_MERCHANT_ID;\\s*const saltKey = process\\.env\\.PHONEPE_SALT_KEY;\\s*const saltIndex = process\\.env\\.PHONEPE_SALT_INDEX;\\s*const env = process\\.env\\.PHONEPE_ENV \\|\\| 'UAT';/g,
  \const { merchantId, saltKey, saltIndex, env } = await PaymentService.getPhonePeConfig();\`n);
code = code.replace(
  /throw new ApiError\\('PhonePe is not configured in environment variables', 500\\);/g,
  \	hrow new ApiError('PhonePe is not configured in database or environment variables', 500);\`n);

code = code.replace(
  /const saltKey = process\\.env\\.PHONEPE_SALT_KEY;\\s*const saltIndex = process\\.env\\.PHONEPE_SALT_INDEX;/g,
  \const { saltKey, saltIndex } = await PaymentService.getPhonePeConfig();\`n);

fs.writeFileSync(file, code);
