import Razorpay from 'razorpay';
import { PrismaClient } from './src/generated/client';

const prisma = new PrismaClient();
async function run() {
  const rzpKey = await prisma.setting.findUnique({ where: { key: 'RAZORPAY_KEY_ID' } });
  const rzpSecret = await prisma.setting.findUnique({ where: { key: 'RAZORPAY_KEY_SECRET' } });
  
  if (!rzpKey?.value || !rzpSecret?.value) {
    console.log("No razorpay keys");
    return;
  }
  const razorpay = new Razorpay({
    key_id: rzpKey.value,
    key_secret: rzpSecret.value
  });
  
  try {
    const pl = await razorpay.paymentLink.create({
      amount: 100, // 1 INR
      currency: "INR",
      description: "Test Booking",
      customer: {
        name: "Test User",
        contact: "+911234567890",
      },
      notify: {
        sms: false,
        email: false
      },
      reminder_enable: false
    });
    console.log("PL generated:", pl.short_url);
  } catch (err) {
    console.error(err);
  }
}
run();
