const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/(admin)/bookings/actions.ts');
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(
  /export async function fetchBookableTurfs\(\) \{/,
  `export async function fetchBookableTurfs() {\n  const session = await getServerSession(authOptions);\n  if (!session?.user?.email) throw new Error("Unauthorized");`
);

content = content.replace(
  /export async function fetchBookingsByDate\(date: string\) \{/,
  `export async function fetchBookingsByDate(date: string) {\n  const session = await getServerSession(authOptions);\n  if (!session?.user?.email) throw new Error("Unauthorized");`
);

content = content.replace(
  /export async function searchMember\(mobile: string\) \{/,
  `export async function searchMember(mobile: string) {\n  const session = await getServerSession(authOptions);\n  if (!session?.user?.email) throw new Error("Unauthorized");`
);

content = content.replace(
  /export async function searchMemberByNfc\(cardUid: string\) \{/,
  `export async function searchMemberByNfc(cardUid: string) {\n  const session = await getServerSession(authOptions);\n  if (!session?.user?.email) throw new Error("Unauthorized");`
);

content = content.replace(
  /type: "EARNED",\s*source: "MANUAL",\s*description: "Refund for cancelled booking"/,
  `type: "REFUND",\n            source: "MANUAL",\n            description: "Refund for cancelled booking"`
);
content = content.replace(
  /type: 'REDEEMED',\s*source: 'MANUAL',\s*description: \`Reversed for cancelled booking \$\{booking.id\}\`/,
  `type: 'REVERSED',\n            source: 'MANUAL',\n            description: \`Reversed for cancelled booking \$\{booking.id\}\``
);

content = content.replace(
  /export async function updateBookingPayment\(id: string, paymentStatus: "PAID" \| "UNPAID"\) \{[\s\S]*?await tx\.booking\.update\(\{[\s\S]*?where: \{ id \},[\s\S]*?data: \{ paymentStatus \}[\s\S]*?\}\);/,
  `export async function updateBookingPayment(id: string, paymentStatus: "PAID" | "UNPAID") {
  const session = await getServerSession(authOptions);
  let adminId = undefined;
  let adminName = "System";
  if (session?.user?.email) {
    const admin = await prisma.admin.findFirst({ where: { email: session.user.email } });
    if (admin) {
      adminId = admin.id;
      adminName = admin.name || admin.email;
    }
  }

  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id }, include: { payments: true } });
    if (!booking) throw new Error("Booking not found");

    let newAmountDue = booking.amountDue;
    if (paymentStatus === "PAID") {
      newAmountDue = 0;
    } else if (paymentStatus === "UNPAID") {
      const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0);
      const netPrice = Math.max(0, booking.price - (booking.discountAmount || 0) - (booking.pointsRedeemed || 0));
      newAmountDue = Math.max(0, netPrice - totalPaid);
    }

    await tx.booking.update({
      where: { id },
      data: { paymentStatus, amountDue: newAmountDue }
    });`
);

content = content.replace(
  /const netPayable = newPrice - \(booking\.discountAmount \|\| 0\);/,
  `const netPayable = newPrice - (booking.discountAmount || 0) - (booking.pointsRedeemed || 0);`
);

content = content.replace(
  /gateway: method === "CASH" \? "MANUAL" : "MANUAL"/,
  `gateway: method === "CASH" ? "MANUAL" : method === "ONLINE" ? "ONLINE" : "WALLET"`
);

content = content.replace(
  /const netPrice = booking\.price - booking\.discountAmount;/,
  `const netPrice = booking.price - (booking.discountAmount || 0) - (booking.pointsRedeemed || 0);`
);

content = content.replace(
  /bookings\.map\(b => b\.id\)\.join\(\',\ '\)\.substring\(0, 40\)/g,
  `bookings.length === 1 ? bookings[0].id : "BATCH_" + require('crypto').createHash('md5').update(bookings.map(b=>b.id).join(',')).digest('hex').substring(0,34)`
);
content = content.replace(
  /bookings\.map\(b => b\.id\)\.join\(\',\'\)\.substring\(0, 40\)/g,
  `bookings.length === 1 ? bookings[0].id : "BATCH_" + require('crypto').createHash('md5').update(bookings.map(b=>b.id).join(',')).digest('hex').substring(0,34)`
);

content = content.replace(
  /gatewayOrderId: transactionId,[\s\S]*?amount: totalDue,[\s\S]*?currency: "INR",[\s\S]*?gateway: "PHONEPE",[\s\S]*?status: "PENDING",[\s\S]*?metadata: JSON\.stringify\(\{ bookingIds, platform: "WEB", initiatedAt: new Date\(\)\.toISOString\(\) \}\)/,
  `gatewayOrderId: transactionId,
      bookingId: bookings[0].id,
      memberId: bookings[0].memberId,
      amount: totalDue,
      currency: "INR",
      gateway: "PHONEPE",
      status: "PENDING",
      metadata: JSON.stringify({ bookingIds, platform: "WEB", initiatedAt: new Date().toISOString() })`
);

const replacementBlock = `
  let remainingAmount = tx.amount;
  for (const bid of bookingIds) {
    const booking = await prisma.booking.findUnique({ where: { id: bid } });
    if (booking && booking.paymentStatus !== 'PAID') {
      const due = booking.amountDue || booking.price;
      const amountToApply = Math.min(due, remainingAmount);
      
      const settleResult = await PaymentService.settleSuccessfulPayment({
        bookingId: bid,
        gateway: 'RAZORPAY',
        gatewayOrderId: orderId,
        gatewayPaymentId: paymentId,
        paidAmountRupees: amountToApply,
        metadata: { adminDirect: true }
      });
      if (settleResult.success && settleResult.status === 'PAID') {
        await PaymentService.sendConfirmationAndTickets(settleResult.booking);
      }
      remainingAmount -= amountToApply;
      if (remainingAmount <= 0) break;
    }
  }
`;

content = content.replace(
  /for \(const bid of bookingIds\) \{[\s\S]*?const booking = await prisma\.booking\.findUnique\(\{ where: \{ id: bid \} \}\);[\s\S]*?if \(booking && booking\.paymentStatus !== \'PAID\'\) \{[\s\S]*?const settleResult = await PaymentService\.settleSuccessfulPayment\(\{[\s\S]*?bookingId: bid,[\s\S]*?gateway: \'RAZORPAY\',[\s\S]*?gatewayOrderId: orderId,[\s\S]*?gatewayPaymentId: paymentId,[\s\S]*?paidAmountRupees: booking\.amountDue \|\| booking\.price,[\s\S]*?metadata: \{ adminDirect: true \}[\s\S]*?\}\);[\s\S]*?if \(settleResult\.success && settleResult\.status === \'PAID\'\) \{[\s\S]*?await PaymentService\.sendConfirmationAndTickets\(settleResult\.booking\);[\s\S]*?\}[\s\S]*?\}[\s\S]*?\}/,
  replacementBlock
);

fs.writeFileSync(filePath, content);
console.log('Bookings actions patched successfully');
