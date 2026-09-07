import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/PaymentService';
import { logger } from '@/lib/logger';

const ALLOWED_HOSTS = new Set([
  'sportsvilla.co.in',
  'beta.sportsvilla.co.in',
  'play-beta.sportsvilla.co.in',
  'play.sportsvilla.co.in',
  'admin.sportsvilla.co.in',
  'localhost',
  '127.0.0.1',
]);

function getSafeFrontendUrl(originParam: string | null): string {
  const fallback = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/+$/, '');
  if (!originParam) return fallback;

  try {
    const parsed = new URL(originParam);
    const hostname = parsed.hostname.toLowerCase();
    
    const isAllowedHost = ALLOWED_HOSTS.has(hostname) || hostname.endsWith('.sportsvilla.co.in');
    const isAllowedProtocol = 
      (parsed.protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1')) ||
      parsed.protocol === 'https:';

    if (isAllowedHost && isAllowedProtocol) {
      return parsed.origin.replace(/\/+$/, '');
    }
  } catch {
    // Fall back on parse error
  }

  return fallback;
}

export const POST = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const formData = await request.formData();
    
    const transactionId = formData.get('transactionId') as string;
    const code = formData.get('code') as string;

    const frontendUrl = getSafeFrontendUrl(searchParams.get('origin'));

    if (!bookingId || !transactionId) {
      logger.error('Invalid PhonePe Redirect Payload', { bookingId, transactionId });
      return NextResponse.redirect(`${frontendUrl}/play/booking-failure?error=invalid_payload`, 303);
    }

    if (code === 'PAYMENT_SUCCESS' || code === 'PAYMENT_PENDING') {
      const { success, status } = await PaymentService.checkPhonePeStatus(bookingId, transactionId);
      
      if (success && status === 'PAID') {
        return NextResponse.redirect(`${frontendUrl}/play/booking-success?bookingId=${bookingId}`, 303);
      } else if (status === 'OVERBOOKED_REFUNDED') {
        return NextResponse.redirect(`${frontendUrl}/play/booking-failure?bookingId=${bookingId}&error=slot_claimed_refunded`, 303);
      } else if (status === 'PAYMENT_PENDING' || code === 'PAYMENT_PENDING') {
        return NextResponse.redirect(`${frontendUrl}/play/booking-success?bookingId=${bookingId}&status=pending`, 303);
      }
    }
    
    return NextResponse.redirect(`${frontendUrl}/play/booking-failure?bookingId=${bookingId}&error=${code || 'failed'}`, 303);
  } catch (error: unknown) {
    logger.error('PhonePe Redirect Error', error);
    const frontendUrl = getSafeFrontendUrl(null);
    return NextResponse.redirect(`${frontendUrl}/play/booking-failure?error=server_error`, 303);
  }
};
