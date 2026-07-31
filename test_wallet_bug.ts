import { prisma } from './src/lib/prisma';
import dayjs from 'dayjs';

async function testBooking() {
  const member = await prisma.member.findFirst({ where: { walletBalance: { gt: 0 } } });
  if (!member) { console.log("No member with wallet"); return; }
  
  const turf = await prisma.turf.findFirst({ where: { bookingPrice: { gt: 0 } } });
  
  // mock request payload
  const payload = {
    turfId: turf?.id,
    sportId: "cmrx4mhy20000x8otj2l5r6x4", // a random sport id, hopefully we can find one 
    startTime: dayjs().add(2, 'hour').toISOString(),
    endTime: dayjs().add(3, 'hour').toISOString(),
    price: 400,
    participantCount: 1,
    guests: [{ name: "Test User" }],
    memberId: member.id,
    walletAmountToUse: 100
  };

  console.log("Testing with payload:", payload);
}

testBooking().catch(console.error).finally(() => prisma.$disconnect());
