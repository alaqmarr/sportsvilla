import { withApiHandler } from '@/lib/api-handler';
import { PaymentService } from '@/services/PaymentService';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const POST = withApiHandler(async (request: Request) => {
  const body = await request.text();
  
  const payload = JSON.parse(body);
  const xVerify = request.headers.get('x-verify') || '';

  if (!payload.response || !xVerify) {
    return { success: false, error: 'Invalid webhook payload' };
  }

  const data = await PaymentService.verifyPhonePeWebhook(payload.response, xVerify);

  if (data.code === 'PAYMENT_SUCCESS') {
    const { searchParams } = new URL(request.url);
    const urlBookingId = searchParams.get('bookingId');

    if (urlBookingId) {
      const booking = await prisma.booking.findUnique({ 
        where: { id: urlBookingId },
        include: { turf: true, sport: true, member: true }
      });
      if (booking && booking.paymentStatus !== 'PAID') {
        await prisma.$transaction([
          prisma.booking.update({
            where: { id: booking.id },
            data: { 
              status: 'CONFIRMED',
              paymentStatus: 'PAID',
              amountDue: 0,
              advancePaid: { increment: booking.amountDue }
            }
          }),
          prisma.payment.create({
            data: {
              bookingId: booking.id,
              amount: booking.amountDue,
              method: 'ONLINE'
            }
          })
        ]);
        logger.info(`PhonePe Webhook Payment Verified & Settled`, { bookingId: booking.id });
        
        try {
          const { sendWhatsAppBookingConfirmedTemplate } = require('@/lib/whatsapp');
          const start = new Date(booking.startTime);
          const end = new Date(booking.endTime);
          
          const formattedDate = start.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', month: 'short', day: 'numeric' });
          const formattedTime = start.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
          const endFormatted = end.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
          const timeString = `${formattedDate}, ${formattedTime} - ${endFormatted}`;
          const priceStr = `₹${booking.price - booking.discountAmount}`;
          const paymentStr = `${priceStr} (PAID)`;
          
          // Generate tickets since booking is now CONFIRMED
          const { randomUUID } = require('crypto');
          const ticketsData = [];
          for (let i = 0; i < booking.participantCount; i++) {
            ticketsData.push({
              bookingId: booking.id,
              qrCode: `TICKET-${randomUUID()}`,
            });
          }
          await prisma.ticket.createMany({ data: ticketsData });

          await sendWhatsAppBookingConfirmedTemplate(
            booking.member.name, 
            booking.turf.name,
            booking.sport.name,
            timeString,
            paymentStr,
            booking.member.mobile
          );
        } catch (waError) {
          logger.error('WhatsApp booking confirmed message / ticket gen failed after webhook', waError);
        }
      }
    }
  }

  return { success: true };
});
