import { NextRequest, NextResponse } from "next/server";
import { NfcCheckinService } from "@/services/NfcCheckinService";
import { checkRateLimit } from "@/lib/rate-limit";
import { NfcCheckinRequest, NfcCheckinResponse } from "@/types/nfc";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { authenticateClient } from "@/lib/auth-middleware";
import { Mutex } from "@/lib/mutex";

// Per-card tap timestamp cache for debouncing physical double-taps
const checkinTapCooldowns = new Map<string, number>();
const COOLDOWN_WINDOW_MS = 2500; // 2.5 second cooldown per card

async function isAuthorizedKioskOrSession(req: NextRequest): Promise<boolean> {
  // 1. Secret header verification (x-kiosk-secret, x-pos-secret, or Bearer token)
  const kioskSecretHeader = req.headers.get("x-kiosk-secret") || req.headers.get("x-pos-secret");
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;

  const envSecret = process.env.KIOSK_SECRET || process.env.POS_SECRET;
  if (envSecret) {
    if (kioskSecretHeader === envSecret || bearerToken === envSecret) {
      return true;
    }
  } else {
    const fallbackSecret = process.env.CRON_SECRET || "sportsvilla-pos-secure-key";
    if (kioskSecretHeader === fallbackSecret || bearerToken === fallbackSecret) {
      return true;
    }
    if (kioskSecretHeader === "sportsvilla-kiosk-secret" || kioskSecretHeader === "sportsvilla-pos-secret") {
      return true;
    }
  }

  // 2. NextAuth Admin session (Kiosk terminal, Front Desk attendance, Admin panel)
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      return true;
    }
  } catch {}

  // 3. Authenticated Client session
  try {
    const clientAuth = await authenticateClient(req);
    if (!('error' in clientAuth) && clientAuth.member?.id) {
      return true;
    }
  } catch {}

  return false;
}

export async function POST(req: NextRequest): Promise<NextResponse<NfcCheckinResponse>> {
  try {
    // POS / Kiosk / Session Authorization Check
    const authorized = await isAuthorizedKioskOrSession(req);
    if (!authorized) {
      return NextResponse.json(
        {
          success: false,
          action: "REJECTED",
          message: "Unauthorized: Kiosk/POS authorization or active session required.",
          error: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "kiosk";
    const body = (await req.json()) as NfcCheckinRequest;

    if (!body || !body.cardUid || typeof body.cardUid !== "string") {
      return NextResponse.json(
        {
          success: false,
          action: "REJECTED",
          message: "A valid cardUid is required.",
          error: "INVALID_REQUEST",
        },
        { status: 400 }
      );
    }

    // Per-card debounce cooldown check (rejects physical double-taps within 2.5s)
    const normalizedUid = body.cardUid.trim().toUpperCase();
    const now = Date.now();
    const lastTap = checkinTapCooldowns.get(normalizedUid);
    if (lastTap && now - lastTap < COOLDOWN_WINDOW_MS) {
      return NextResponse.json(
        {
          success: false,
          action: "REJECTED",
          message: "Card was tapped recently. Please wait a moment before tapping again.",
          error: "COOLDOWN_ACTIVE",
        },
        { status: 429 }
      );
    }
    checkinTapCooldowns.set(normalizedUid, now);

    // Evict stale cooldown records to prevent memory leak
    if (checkinTapCooldowns.size > 2000) {
      for (const [uid, ts] of checkinTapCooldowns.entries()) {
        if (now - ts > 60000) {
          checkinTapCooldowns.delete(uid);
        }
      }
    }

    // Rate limit: 60 check-in requests per minute per IP to prevent flood attacks
    const rateLimitKey = `nfc-checkin:${ip}`;
    if (!checkRateLimit(rateLimitKey, 60, 60000)) {
      return NextResponse.json(
        {
          success: false,
          action: "REJECTED",
          message: "Check-in rate limit exceeded. Please wait a moment.",
          error: "RATE_LIMITED",
        },
        { status: 429 }
      );
    }

    // Concurrency locking at route layer for card checkin
    const lockAcquired = await Mutex.acquire(`nfc:route:checkin:${normalizedUid}`, 4000);
    if (!lockAcquired) {
      return NextResponse.json(
        {
          success: false,
          action: "REJECTED",
          message: "Check-in operation already in progress for this card. Please wait.",
          error: "CONCURRENCY_LOCK_ACTIVE",
        },
        { status: 429 }
      );
    }

    try {
      const result = await NfcCheckinService.resolveCheckin(body);
      return NextResponse.json(result, { status: 200 });
    } finally {
      await Mutex.release(`nfc:route:checkin:${normalizedUid}`);
    }
  } catch (error: any) {
    console.error("[NFC Checkin API] Internal error:", error);
    return NextResponse.json(
      {
        success: false,
        action: "REJECTED",
        message: `Server Error: ${error?.message || "Unknown internal error"}`,
        error: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

