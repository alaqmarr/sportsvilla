import { prisma } from '@/core/database/prisma';

export async function getPhonePeConfig() {
  const settings = await prisma.setting.findMany({
    where: {
      key: { in: ['PHONEPE_MERCHANT_ID', 'PHONEPE_SALT_KEY', 'PHONEPE_SALT_INDEX', 'PHONEPE_ENV'] }
    }
  });
  const map = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
  return {
    merchantId: map['PHONEPE_MERCHANT_ID'],
    saltKey: map['PHONEPE_SALT_KEY'],
    saltIndex: map['PHONEPE_SALT_INDEX'] || '1',
    env: map['PHONEPE_ENV'] || 'UAT'
  };
}

/**
 * Retrieves the active payment gateways and their public configuration.
 */
export async function getPaymentConfig() {
  const activeSetting = await prisma.setting.findUnique({ where: { key: 'PAYMENT_GATEWAY_ACTIVE' } });
  const activeGateway = activeSetting?.value || 'NONE'; // "RAZORPAY", "PHONEPE", "BOTH", "NONE"

  const config: Record<string, unknown> = { activeGateway };

  if (['RAZORPAY', 'BOTH'].includes(activeGateway)) {
    const rzpKey = await prisma.setting.findUnique({ where: { key: 'RAZORPAY_KEY_ID' } });
    config.razorpayKeyId = rzpKey?.value || null;
  }

  if (['PHONEPE', 'BOTH'].includes(activeGateway)) {
    const ppConfig = await getPhonePeConfig();
    config.phonepeEnv = ppConfig.env;
    config.phonepeMerchantId = ppConfig.merchantId;
  }

  return config;
}
