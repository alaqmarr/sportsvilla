import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const ios = await prisma.appVersion.findUnique({
      where: { platform: 'ios' },
    });

    if (ios && ios.downloadUrl) {
      return NextResponse.redirect(ios.downloadUrl);
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>iOS Coming Soon</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #0f111a; color: white; display: flex; flex-direction: column; align-items: center; justify-center: center; height: 100vh; margin: 0; text-align: center; justify-content: center; }
          h1 { font-size: 2.5rem; margin-bottom: 1rem; color: #10b981; }
          p { font-size: 1.2rem; color: #a1a1aa; max-width: 500px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <h1>We'll be on iOS soon!</h1>
        <p>The Sportsvilla app is currently available for Android. We are working hard to bring the ultimate turf booking experience to iOS very soon.</p>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error(`[API ERROR] GET /ios/download ->`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
