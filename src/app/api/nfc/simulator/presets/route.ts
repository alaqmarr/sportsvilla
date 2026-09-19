import { NextResponse } from "next/server";
import { prisma } from "@/core/database/prisma";
import { DEFAULT_PRESET_CARDS, generateRandomHexUid } from "@/modules/nfc/nfc-simulator.lib";
import { NfcSimulatorPreset } from "@/types/nfc";
import { getServerSession } from "next-auth";
import { authOptions } from "@/core/auth/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/nfc/simulator/presets
 * Returns live database cards matching the 6 simulation preset categories for authenticated admins,
 * or safe synthetic default presets for unauthenticated dev testers.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const isDev = process.env.NODE_ENV !== "production";
  const isAuthenticated = !!session?.user?.email;

  // Protect endpoint in production: require active admin session
  if (!isAuthenticated && !isDev) {
    return NextResponse.json({ error: "Unauthorized: Admin session required" }, { status: 401 });
  }

  // If unauthenticated in development, return safe synthetic mock presets to protect PII
  if (!isAuthenticated) {
    return NextResponse.json({
      success: true,
      presets: DEFAULT_PRESET_CARDS,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);


    // 1. Preset: Active Member with Booking today & valid ticket
    const bookingCard = await prisma.nfcCard.findFirst({
      where: {
        status: "ACTIVE",
        member: {
          bookings: {
            some: {
              status: "CONFIRMED",
              startTime: { lte: endOfToday },
              endTime: { gte: startOfToday },
              tickets: {
                some: {
                  status: "VALID",
                },
              },
            },
          },
        },
      },
      include: {
        member: {
          include: {
            bookings: {
              where: {
                status: "CONFIRMED",
                startTime: { lte: endOfToday },
                endTime: { gte: startOfToday },
              },
              include: {
                sport: true,
                turf: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    // 2. Preset: Active Member with Membership Plan
    const membershipCard = await prisma.nfcCard.findFirst({
      where: {
        status: "ACTIVE",
        member: {
          memberships: {
            some: {
              status: "ACTIVE",
              startDate: { lte: now },
              endDate: { gte: now },
            },
          },
        },
      },
      include: {
        member: {
          include: {
            memberships: {
              where: {
                status: "ACTIVE",
                startDate: { lte: now },
                endDate: { gte: now },
              },
              include: {
                membershipPlan: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    // 3. Preset: Member with Wallet Balance (>= ₹200 / 20,000 paise)
    const walletCard = await prisma.nfcCard.findFirst({
      where: {
        status: "ACTIVE",
        member: {
          walletBalance: { gte: 20000 },
        },
      },
      include: {
        member: true,
      },
      orderBy: { member: { walletBalance: "desc" } },
    });

    // 4. Preset: Low/Zero Balance Member (< ₹10 / 1,000 paise)
    const lowBalCard = await prisma.nfcCard.findFirst({
      where: {
        status: "ACTIVE",
        member: {
          walletBalance: { lt: 1000 },
        },
      },
      include: {
        member: true,
      },
    });

    // 5. Preset: Blocked / Suspended Card
    const blockedCard = await prisma.nfcCard.findFirst({
      where: {
        status: { in: ["BLOCKED", "SUSPENDED"] },
      },
      include: {
        member: true,
      },
    });

    // Build resolved presets array
    const resolvedPresets: NfcSimulatorPreset[] = [
      bookingCard && bookingCard.member
        ? {
            id: "preset-active-booking",
            name: "Active Member with Booking",
            category: "ACTIVE_BOOKING",
            cardUid: bookingCard.cardUid,
            memberName: bookingCard.member.name,
            memberMobile: bookingCard.member.mobile,
            walletBalanceRupees: (bookingCard.member.walletBalance || 0) / 100,
            description: `Live DB card: ${bookingCard.member.bookings[0]?.sport?.name || "Court"} booking today.`,
          }
        : DEFAULT_PRESET_CARDS[0],

      membershipCard && membershipCard.member
        ? {
            id: "preset-active-membership",
            name: "Active Member with Membership Plan",
            category: "ACTIVE_MEMBERSHIP",
            cardUid: membershipCard.cardUid,
            memberName: membershipCard.member.name,
            memberMobile: membershipCard.member.mobile,
            walletBalanceRupees: (membershipCard.member.walletBalance || 0) / 100,
            description: `Live DB card: Active ${membershipCard.member.memberships[0]?.membershipPlan?.name || "Plan"}.`,
          }
        : DEFAULT_PRESET_CARDS[1],

      walletCard && walletCard.member
        ? {
            id: "preset-member-wallet",
            name: "Member with Wallet Balance",
            category: "MEMBER_WALLET",
            cardUid: walletCard.cardUid,
            memberName: walletCard.member.name,
            memberMobile: walletCard.member.mobile,
            walletBalanceRupees: (walletCard.member.walletBalance || 0) / 100,
            description: `Live DB card: Balance ₹${((walletCard.member.walletBalance || 0) / 100).toFixed(2)}.`,
          }
        : DEFAULT_PRESET_CARDS[2],

      lowBalCard && lowBalCard.member
        ? {
            id: "preset-low-balance",
            name: "Low/Zero Balance Member",
            category: "LOW_BALANCE",
            cardUid: lowBalCard.cardUid,
            memberName: lowBalCard.member.name,
            memberMobile: lowBalCard.member.mobile,
            walletBalanceRupees: (lowBalCard.member.walletBalance || 0) / 100,
            description: `Live DB card: Balance ₹${((lowBalCard.member.walletBalance || 0) / 100).toFixed(2)}.`,
          }
        : DEFAULT_PRESET_CARDS[3],

      blockedCard
        ? {
            id: "preset-blocked-card",
            name: "Blocked/Suspended Card",
            category: "BLOCKED_CARD",
            cardUid: blockedCard.cardUid,
            memberName: blockedCard.member ? blockedCard.member.name : "Unassigned Member",
            memberMobile: blockedCard.member?.mobile,
            walletBalanceRupees: blockedCard.member ? (blockedCard.member.walletBalance || 0) / 100 : 0,
            description: `Live DB card: Status is ${blockedCard.status}.`,
          }
        : DEFAULT_PRESET_CARDS[4],

      {
        id: "preset-unregistered-card",
        name: "Unregistered Card",
        category: "UNREGISTERED_CARD",
        cardUid: generateRandomHexUid(8),
        memberName: "Unregistered Visitor",
        description: "Synthetic UID not in database. Triggers UNREGISTERED_CARD rejection.",
      },
    ];

    return NextResponse.json({
      success: true,
      presets: resolvedPresets,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching simulator presets:", error);
    return NextResponse.json(
      {
        success: true,
        presets: DEFAULT_PRESET_CARDS,
        fallback: true,
        error: error?.message,
      },
      { status: 200 }
    );
  }
}

/**
 * POST /api/nfc/simulator/presets
 * Seeds or resets test fixtures for all 6 preset categories.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const isDev = process.env.NODE_ENV !== "production";
  const isAuthenticated = !!session?.user?.email;

  // Protect endpoint in production: require active admin session
  if (!isAuthenticated && !isDev) {
    return NextResponse.json({ error: "Unauthorized: Admin session required" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || "seed";

    if (action === "clean") {
      // Data wipe action 'clean' strictly requires admin authentication even in dev
      if (!isAuthenticated) {
        return NextResponse.json(
          { error: "Unauthorized: Admin session required to wipe test fixtures" },
          { status: 401 }
        );
      }

      // Clean test fixtures created by simulator
      await prisma.nfcTransaction.deleteMany({
        where: { cardUid: { startsWith: "SIM" } },
      });

      await prisma.ticket.deleteMany({
        where: { qrCode: { startsWith: "TKTSIM" } },
      });
      await prisma.booking.deleteMany({
        where: { inviteCode: { startsWith: "SIMBK" } },
      });
      await prisma.nfcCard.deleteMany({
        where: { cardUid: { startsWith: "SIM" } },
      });
      await prisma.member.deleteMany({
        where: { email: { contains: "_sim_fixture@" } },
      });

      return NextResponse.json({
        success: true,
        message: "Simulator test fixtures cleaned successfully.",
      });
    }

    // Seed comprehensive fixtures for testing
    const timestamp = Date.now().toString().slice(-6);

    // 1. Sport & Turf
    let sport = await prisma.sport.findFirst();
    if (!sport) {
      sport = await prisma.sport.create({
        data: {
          name: "Sim Badminton",
          rewardPointsPerCheckin: 10,
        },
      });
    }

    let turf = await prisma.turf.findFirst();
    if (!turf) {
      turf = await prisma.turf.create({
        data: {
          name: "Sim Court 1",
          bookingPrice: 500,
          bookingDurationMinutes: 60,
        },
      });
      await prisma.turfSport.create({
        data: {
          turfId: turf.id,
          sportId: sport.id,
        },
      });
    }

    // 2. Member with Booking & Ticket
    const bookingMember = await prisma.member.create({
      data: {
        name: `Rahul (Sim Booking ${timestamp})`,
        mobile: `9911${timestamp}`,
        email: `rahul_${timestamp}_sim_fixture@example.com`,
        walletBalance: 150000, // ₹1,500
      },
    });

    const bookingCardUid = `SIMBK${timestamp}`;
    await prisma.nfcCard.create({
      data: {
        cardUid: bookingCardUid,
        memberId: bookingMember.id,
        status: "ACTIVE",
        notes: "Simulator test card with active booking",
      },
    });

    const now = new Date();
    const startTime = new Date(now.getTime() - 15 * 60 * 1000);
    const endTime = new Date(now.getTime() + 45 * 60 * 1000);

    const booking = await prisma.booking.create({
      data: {
        memberId: bookingMember.id,
        sportId: sport.id,
        turfId: turf.id,
        startTime,
        endTime,
        price: 500,
        status: "CONFIRMED",
        paymentStatus: "PAID",
        inviteCode: `SIMBK${timestamp}`,
      },
    });

    await prisma.ticket.create({
      data: {
        bookingId: booking.id,
        qrCode: `TKTSIM${timestamp}`,
        status: "VALID",
      },
    });

    // 3. Member with Membership Plan
    let plan = await prisma.membershipPlan.findFirst({
      where: { sportId: sport.id },
    });
    if (!plan) {
      plan = await prisma.membershipPlan.create({
        data: {
          name: "Sim Monthly Pass",
          sportId: sport.id,
          durationInDays: 30,
          price: 1500,
          slotsPerDay: 2,
          rewardPointsPerCheckin: 15,
        },
      });
    }

    const membershipMember = await prisma.member.create({
      data: {
        name: `Ananya (Sim Plan ${timestamp})`,
        mobile: `9922${timestamp}`,
        email: `ananya_${timestamp}_sim_fixture@example.com`,
        walletBalance: 80000, // ₹800
      },
    });

    const membershipCardUid = `SIMMB${timestamp}`;
    await prisma.nfcCard.create({
      data: {
        cardUid: membershipCardUid,
        memberId: membershipMember.id,
        status: "ACTIVE",
        notes: "Simulator test card with active membership",
      },
    });

    await prisma.memberMembership.create({
      data: {
        memberId: membershipMember.id,
        membershipPlanId: plan.id,
        startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
      },
    });

    // 4. Member with High Wallet Balance (₹500)
    const walletMember = await prisma.member.create({
      data: {
        name: `Vikram (Sim Wallet ${timestamp})`,
        mobile: `9933${timestamp}`,
        email: `vikram_${timestamp}_sim_fixture@example.com`,
        walletBalance: 50000, // ₹500
      },
    });

    const walletCardUid = `SIMWL${timestamp}`;
    await prisma.nfcCard.create({
      data: {
        cardUid: walletCardUid,
        memberId: walletMember.id,
        status: "ACTIVE",
        notes: "Simulator test card with ₹500 wallet balance",
      },
    });

    // 5. Member with Low Balance (₹5)
    const lowBalMember = await prisma.member.create({
      data: {
        name: `Pooja (Sim LowBal ${timestamp})`,
        mobile: `9944${timestamp}`,
        email: `pooja_${timestamp}_sim_fixture@example.com`,
        walletBalance: 500, // ₹5
      },
    });

    const lowBalCardUid = `SIMLB${timestamp}`;
    await prisma.nfcCard.create({
      data: {
        cardUid: lowBalCardUid,
        memberId: lowBalMember.id,
        status: "ACTIVE",
        notes: "Simulator test card with low balance ₹5",
      },
    });

    // 6. Blocked Card
    const blockedCardUid = `SIMBL${timestamp}`;
    await prisma.nfcCard.create({
      data: {
        cardUid: blockedCardUid,
        memberId: lowBalMember.id,
        status: "BLOCKED",
        notes: "Simulator test card with BLOCKED status",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Test fixtures created successfully.",
      fixtures: {
        bookingCardUid,
        membershipCardUid,
        walletCardUid,
        lowBalCardUid,
        blockedCardUid,
        unregisteredUid: `UNREG${generateRandomHexUid(6)}`,
      },
    });
  } catch (error: any) {
    console.error("Error seeding simulator fixtures:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to seed simulator fixtures",
      },
      { status: 500 }
    );
  }
}
