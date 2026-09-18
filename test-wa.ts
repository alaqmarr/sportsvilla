import { sendWhatsAppBookingConfirmedTemplate } from './src/lib/whatsapp';

async function run() {
  console.log("Testing WhatsApp");
  const res = await sendWhatsAppBookingConfirmedTemplate('b123', 'John Doe', 'Turf A', 'Football', 'Sep 18, 5:00 PM', 'PAID', '9999999999');
  console.log(res);
}
run().catch(console.error);
