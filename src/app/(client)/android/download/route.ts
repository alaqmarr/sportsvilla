import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const android = await prisma.appVersion.findUnique({
      where: { platform: 'android' },
    });

    if (android && android.downloadUrl) {
      return NextResponse.redirect(android.downloadUrl);
    }

    return new NextResponse('Android download URL not configured.', { status: 404 });
  } catch (error) {
    console.error(`[API ERROR] GET /android/download ->`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
