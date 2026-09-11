import { NextRequest, NextResponse } from "next/server";
import { NfcCheckinService } from "@/services/NfcCheckinService";
import { checkRateLimit } from "@/lib/rate-limit";
import { NfcCheckinRequest, NfcCheckinResponse } from "@/types/nfc";

export async function POST(req: NextRequest): Promise<NextResponse<NfcCheckinResponse>> {
  try {
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

    const result = await NfcCheckinService.resolveCheckin(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[NFC Checkin API] Internal error:", error);
    return NextResponse.json(
      {
        success: false,
        action: "REJECTED",
        message: "Server error occurred during check-in resolution.",
        error: error?.message || "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
