import { NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';
import { authenticateClient } from '@/core/auth/auth-middleware';
import { jsonResponse, apiLog } from '@/core/logging/api-logger';
import { BookingService } from '@/modules/bookings/bookings.services';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  apiLog(`[API] GET /api/client/v1/bookings/${params.id}/refund-preview called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member } = authRes;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        payments: true,
        participants: true
      }
    });

    if (!booking) {
      return jsonResponse({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.memberId !== member.id && !booking.participants?.find((p: any) => p.memberId === member.id)) {
      // Check family
      if (member.familyId) {
        const booker = await prisma.member.findUnique({ where: { id: booking.memberId } });
        if (booker?.familyId !== member.familyId) {
          return jsonResponse({ error: 'Unauthorized' }, { status: 403 });
        }
      } else {
        return jsonResponse({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    const settings = await prisma.setting.findMany();
    const limitSetting = settings.find(s => s.key === 'CLIENT_CANCELLATION_LIMIT_HOURS')
      || settings.find(s => s.key === 'CANCELLATION_LIMIT_HOURS');
    const cancellationLimitHours = limitSetting ? parseFloat(limitSetting.value) : 3;

    const preview = BookingService.getRefundPreview(booking, cancellationLimitHours);
    
    return jsonResponse({
      penalty: Math.round(preview.penalty),
      refund: Math.round(preview.refund),
      isFree: preview.isFree,
      totalPaid: preview.totalPaid
    });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/client/v1/bookings/${params.id}/refund-preview ->`, error);
    return jsonResponse({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }, { status: 500 });
  }
}
