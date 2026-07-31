import { prisma } from './src/lib/prisma';

async function check() {
  const member = await prisma.member.findFirst({ where: { walletBalance: { gt: 0 } } });
  console.log("Member walletBalance:", member?.walletBalance);

  const turf = await prisma.turf.findFirst({ where: { bookingPrice: { gt: 0 } } });
  console.log("Turf bookingPrice:", turf?.bookingPrice);

  const booking = await prisma.booking.findFirst({ orderBy: { createdAt: 'desc' }, where: { advancePaid: { gt: 0 } } });
  console.log("Booking price:", booking?.price, "advancePaid:", booking?.advancePaid, "amountDue:", booking?.amountDue);
  
  const payment = booking ? await prisma.payment.findFirst({ where: { bookingId: booking.id } }) : null;
  console.log("Payment amount:", payment?.amount);
}

check().catch(console.error).finally(() => prisma.$disconnect());
