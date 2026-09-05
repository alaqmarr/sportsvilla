import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/PaymentService';
import { logger } from '@/lib/logger';

export const POST = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const formData = await request.formData();
    
    const transactionId = formData.get('transactionId') as string;
    const code = formData.get('code') as string;

    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!bookingId || !transactionId) {
      logger.error('Invalid PhonePe Redirect Payload', { bookingId, transactionId });
      return NextResponse.redirect(`${frontendUrl}/play/dashboard?error=invalid_payload`);
    }

    if (code === 'PAYMENT_SUCCESS') {
      const { success } = await PaymentService.checkPhonePeStatus(bookingId, transactionId);
      
      if (success) {
        return NextResponse.redirect(`${frontendUrl}/play/bookings/${bookingId}`);
      }
    }
    
    return NextResponse.redirect(`${frontendUrl}/play/bookings/${bookingId}?error=${code || 'failed'}`);
  } catch (error: unknown) {
    logger.error('PhonePe Redirect Error', error);
    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${frontendUrl}/play/dashboard?error=server_error`);
  }
};
