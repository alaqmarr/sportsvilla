import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { whatsappDb } from '@/lib/whatsappDb';
import jwt from 'jsonwebtoken';
import { jsonResponse } from '@/lib/api-logger';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback_secret_for_dev';

export async function POST(request: Request) {
  console.log(`[API] POST /api/client/v1/auth/magic/verify called`);
  try {
    const { token } = await request.json();

    if (!token) {
      return jsonResponse({ error: "Missing magic token" }, { status: 400 });
    }

    // 1. Look up token in WhatsApp SQLite DB
    const otpRecord = await whatsappDb.whatsAppOtp.findFirst({
      where: {
        otp: token,
        purpose: "MAGIC_LOGIN",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return jsonResponse({ error: "Invalid login link" }, { status: 404 });
    }

    if (otpRecord.verified) {
      return jsonResponse({ error: "This login link has already been used" }, { status: 400 });
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      return jsonResponse({ error: "This login link has expired" }, { status: 400 });
    }

    // 2. Mark token as verified
    await whatsappDb.whatsAppOtp.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    // 3. Clean phone number (last 10 digits for prisma lookup)
    const cleanMobile = otpRecord.phoneNumber.replace(/\D/g, "").slice(-10);

    // 4. Find Member in main DB
    const member = await prisma.member.findFirst({
      where: { mobile: cleanMobile },
    });

    if (!member) {
      return jsonResponse({
        success: true,
        isNewUser: true,
        mobile: cleanMobile,
        message: "Mobile verified via WhatsApp. Please complete profile registration.",
      });
    }

    // 5. Generate NextAuth / JWT session token for app & web
    const sessionToken = jwt.sign(
      { uid: "+91" + cleanMobile, memberId: member.id },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return jsonResponse({
      success: true,
      isNewUser: false,
      token: sessionToken,
      member,
    });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/auth/magic/verify ->`, error);
    return jsonResponse({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token parameter" }, { status: 400 });
  }
  
  // Return an HTML page that attempts to open the app via custom scheme
  // and falls back to the web login after a short delay
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>SportsVilla Login</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: sans-serif; text-align: center; padding-top: 50px; background: #000; color: #fff; }
        .spinner { margin: 20px auto; width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #16a34a; animation: spin 1s ease-in-out infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <h2>Opening SportsVilla App...</h2>
      <div class="spinner"></div>
      <p>If the app doesn't open automatically, <a href="/login?magic_verified=${token}" style="color: #16a34a;">continue on web</a>.</p>
      
      <script>
        // Try opening the app via custom scheme
        window.location.href = 'sportsvillaapp://login?token=${token}';
        
        // Fallback to web login if app is not installed
        setTimeout(function() {
          window.location.href = '/login?magic_verified=${token}';
        }, 2500);
      </script>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
