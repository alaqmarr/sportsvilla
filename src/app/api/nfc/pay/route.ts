import { NextRequest, NextResponse } from "next/server";
import { NfcPaymentService } from "@/services/NfcPaymentService";
import { checkRateLimit } from "@/lib/rate-limit";
import { NfcPaymentRequest, NfcPaymentResponse } from "@/types/nfc";

export async function POST(req: NextRequest): Promise<NextResponse<NfcPaymentResponse>> {
  try {
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

    const result = await NfcPaymentService.processPayment(body);
    return NextResponse.json(result, { status: 200 });
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
