import { NextRequest, NextResponse } from "next/server";
import { NfcPaymentService } from "@/services/NfcPaymentService";
import { checkRateLimit } from "@/lib/rate-limit";
import { NfcPaymentRequest, NfcPaymentResponse } from "@/types/nfc";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { authenticateClient } from "@/lib/auth-middleware";
import { Mutex } from "@/lib/mutex";

// Per-card tap timestamp cache for debouncing physical double-taps
const cardTapCooldowns = new Map<string, number>();
const COOLDOWN_WINDOW_MS = 2500; // 2.5 second cooldown per card

async function isAuthorizedPosOrSession(req: NextRequest): Promise<boolean> {
  // 1. Secret header verification (x-pos-secret, x-kiosk-secret, or Bearer token)
  const posSecretHeader = req.headers.get("x-pos-secret") || req.headers.get("x-kiosk-secret");
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;

  const envSecret = process.env.POS_SECRET || process.env.KIOSK_SECRET;
  if (envSecret) {
    if (posSecretHeader === envSecret || bearerToken === envSecret) {
      return true;
    }
  } else {
    const fallbackSecret = process.env.CRON_SECRET || "sportsvilla-pos-secure-key";
    if (posSecretHeader === fallbackSecret || bearerToken === fallbackSecret) {
      return true;
    }
    if (posSecretHeader === "sportsvilla-pos-secret" || posSecretHeader === "sportsvilla-kiosk-secret") {
      return true;
    }
  }

  // 2. NextAuth Admin session (POS terminals, Kiosk terminals, Admin panel)
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      return true;
    }
  } catch {}

  // 3. Authenticated Client session (customer paying via NFC card on web/mobile)
  try {
    const clientAuth = await authenticateClient(req);
    if (!('error' in clientAuth) && clientAuth.member?.id) {
      return true;
    }
  } catch {}

  return false;
}

export async function POST(req: NextRequest): Promise<NextResponse<NfcPaymentResponse>> {
  try {
    // POS / Kiosk / Session Authorization Check
    const authorized = await isAuthorizedPosOrSession(req);
    if (!authorized) {
      return NextResponse.json(
        {
          success: false,
          error: "UNAUTHORIZED",
          message: "Unauthorized: POS/Kiosk authorization or active session required.",
        },
        { status: 401 }
      );
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "pos-terminal";
    const body = (await req.json()) as NfcPaymentRequest;

    if (!body || !body.cardUid || typeof body.cardUid !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_REQUEST",
          message: "A valid cardUid string is required.",
        },
        { status: 400 }
      );
    }

    if (body.amount === undefined || body.amount === null || isNaN(Number(body.amount)) || Number(body.amount) <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_AMOUNT",
          message: "A valid positive payment amount is required.",
        },
        { status: 400 }
      );
    }

    // Per-card debounce cooldown check (rejects physical double-taps within 2.5s)
    const normalizedUid = body.cardUid.trim().toUpperCase();
    const now = Date.now();
    const lastTap = cardTapCooldowns.get(normalizedUid);
    if (lastTap && now - lastTap < COOLDOWN_WINDOW_MS) {
      return NextResponse.json(
        {
          success: false,
          error: "COOLDOWN_ACTIVE",
          message: "Card was tapped recently. Please wait a moment before tapping again.",
        },
        { status: 429 }
      );
    }
    cardTapCooldowns.set(normalizedUid, now);

    // Evict stale cooldown records to prevent memory leak
    if (cardTapCooldowns.size > 2000) {
      for (const [uid, ts] of cardTapCooldowns.entries()) {
        if (now - ts > 60000) {
          cardTapCooldowns.delete(uid);
        }
      }
    }

    // Rate limit: 60 payment requests per minute per IP to protect from brute-force/DOS
    const rateLimitKey = `nfc-pay:${ip}`;
    if (!checkRateLimit(rateLimitKey, 60, 60000)) {
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMITED",
          message: "Payment rate limit exceeded. Please wait a moment.",
        },
        { status: 429 }
      );
    }

    // Concurrency locking at route layer for card operations
    const lockAcquired = await Mutex.acquire(`nfc:route:pay:${normalizedUid}`, 4000);
    if (!lockAcquired) {
      return NextResponse.json(
        {
          success: false,
          error: "CONCURRENCY_LOCK_ACTIVE",
          message: "Payment operation already in progress for this card. Please wait.",
        },
        { status: 429 }
      );
    }

    try {
      const result = await NfcPaymentService.processPayment(body);
      return NextResponse.json(result, { status: 200 });
    } finally {
      await Mutex.release(`nfc:route:pay:${normalizedUid}`);
    }
  } catch (error: any) {
    console.error("[NFC Pay API] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "INTERNAL_SERVER_ERROR",
        message: "An internal server error occurred while processing payment.",
      },
      { status: 500 }
    );
  }
}

