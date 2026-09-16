const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/services/NfcPaymentService.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Remove the bookingRecord fetch from outside the transaction
content = content.replace(
  /\/\/ 3\. Lookup Booking if bookingId is provided[\s\S]*?let bookingRecord: any = null;[\s\S]*?if \(params\.bookingId\) \{[\s\S]*?bookingRecord = await prisma\.booking\.findUnique\(\{[\s\S]*?where: \{ id: params\.bookingId \},[\s\S]*?include: \{[\s\S]*?payments: true,[\s\S]*?tickets: true,[\s\S]*?\},[\s\S]*?\}\);[\s\S]*?if \(!bookingRecord\) \{[\s\S]*?return \{[\s\S]*?success: false,[\s\S]*?error: "BOOKING_NOT_FOUND",[\s\S]*?code: "BOOKING_NOT_FOUND",[\s\S]*?message: "Booking record not found.",[\s\S]*?\};[\s\S]*?\}[\s\S]*?if \(bookingRecord\.status === "CANCELLED"\) \{[\s\S]*?return \{[\s\S]*?success: false,[\s\S]*?error: "BOOKING_CANCELLED",[\s\S]*?code: "BOOKING_CANCELLED",[\s\S]*?message: "Cannot apply payment to a cancelled booking.",[\s\S]*?\};[\s\S]*?\}[\s\S]*?\}/,
  `// 3. (Moved booking lookup inside transaction)`
);

// 2. Put the bookingRecord fetch inside the transaction and fix netPrice
content = content.replace(
  /if \(params\.bookingId && bookingRecord\) \{/,
  `let bookingRecord: any = null;
        if (params.bookingId) {
          bookingRecord = await tx.booking.findUnique({
            where: { id: params.bookingId },
            include: { payments: true, tickets: true }
          });
          if (!bookingRecord) throw new Error("BOOKING_NOT_FOUND");
          if (bookingRecord.status === "CANCELLED") throw new Error("BOOKING_CANCELLED");
        }

        if (params.bookingId && bookingRecord) {`
);

content = content.replace(
  /const netPrice = Math\.max\(0, bookingRecord\.price - \(bookingRecord\.discountAmount \|\| 0\)\);/,
  `const netPrice = Math.max(0, bookingRecord.price - (bookingRecord.discountAmount || 0) - (bookingRecord.pointsRedeemed || 0));`
);

fs.writeFileSync(filePath, content);
console.log('NfcPaymentService patched successfully');
