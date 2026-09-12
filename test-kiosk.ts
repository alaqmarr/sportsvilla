import { PrismaClient } from './src/generated/client';
const prisma = new PrismaClient();

async function run() {
  const turf = await prisma.turf.findFirst();
  const sport = await prisma.sport.findFirst();
  const member = await prisma.member.findFirst();

  if (!turf || !sport || !member) {
    console.log("Missing data");
    return;
  }

  try {
    const b = await prisma.booking.create({
      data: {
        memberId: member.id,
        turfId: turf.id,
        sportId: sport.id,
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        price: 500,
        status: "CONFIRMED",
        paymentStatus: "PENDING",
        amountDue: 500,
        participants: {
          create: {
            memberId: member.id,
            status: "CONFIRMED"
          }
        }
      }
    });
    console.log("Booking created successfully:", b.id);
  } catch (err) {
    console.error(err);
  }
}
run();
