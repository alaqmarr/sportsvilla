import { prisma } from "@/lib/prisma";
import { Mutex } from "@/lib/mutex";
import { getISTDateBounds, formatIST } from "@/lib/dateUtils";
import { bumpSyncTimestamp } from "@/lib/sync";
import { NfcCheckinRequest, NfcCheckinResponse, NfcDeviceType } from "@/types/nfc";
import { normalizeCardUid } from "@/hooks/useNfcReader";

export class NfcCheckinService {
  /**
   * Resolves an NFC card tap for check-in using a prioritized 3-tier resolution engine:
   * Priority 1: Active Booking Check-in (validates time window, checks in ticket, awards sport loyalty points)
   * Priority 2: Active Membership Attendance (checks validity, allowed days, slotsPerDay cap, logs attendance)
   * Priority 3: Drop-in Fee Deduction (checks wallet balance, deducts fee, grants facility entry)
   *
   * Protected with Mutex concurrency locking to prevent race conditions and physical double-taps.
   */
  static async resolveCheckin(request: NfcCheckinRequest): Promise<NfcCheckinResponse> {
    const rawUid = request.cardUid || "";
    const cardUid = normalizeCardUid(rawUid);
    const deviceType: NfcDeviceType = request.deviceType || "KEYBOARD_WEDGE";
    const location = request.location || "FRONT_DESK";

    if (!cardUid || cardUid.length < 4) {
      return {
        success: false,
        action: "REJECTED",
        message: "Invalid card UID provided.",
        error: "INVALID_CARD_UID",
      };
    }

    // 1. Acquire concurrency lock for this card UID (5s timeout)
    const acquired = await Mutex.acquire(`nfc:checkin:${cardUid}`, 5000);
    if (!acquired) {
      return {
        success: false,
        action: "REJECTED",
        message: "Check-in operation already in progress for this card. Please wait.",
        error: "CONCURRENCY_LOCK_ACTIVE",
      };
    }

    try {
      // 2. Lookup NFC card and linked member
      const card = await prisma.nfcCard.findUnique({
        where: { cardUid },
        include: {
          member: true,
        },
      });

      // Rejection Check 1: Card not found
      if (!card) {
        await prisma.nfcTransaction.create({
          data: {
            cardUid,
            type: "CHECKIN",
            status: "FAILED",
            amount: 0,
            deviceType,
            readerLocation: location,
            failureReason: "UNREGISTERED_CARD",
            metadata: JSON.stringify({ reason: "Card UID not found in database" }),
          },
        });

        return {
          success: false,
          action: "REJECTED",
          message: "Unregistered card. Please register this card at the front desk.",
          error: "UNREGISTERED_CARD",
        };
      }

      // Rejection Check 2: Card status not ACTIVE
      if (card.status !== "ACTIVE") {
        await prisma.nfcTransaction.create({
          data: {
            cardId: card.id,
            cardUid,
            memberId: card.memberId,
            type: "CHECKIN",
            status: "FAILED",
            amount: 0,
            deviceType,
            readerLocation: location,
            failureReason: `CARD_${card.status}`,
            metadata: JSON.stringify({ cardStatus: card.status }),
          },
        });

        return {
          success: false,
          action: "REJECTED",
          message: `Card is ${card.status.toLowerCase()}. Please contact front desk.`,
          error: `CARD_${card.status}`,
        };
      }

      // Rejection Check 3: Card not assigned to a member
      if (!card.memberId || !card.member) {
        await prisma.nfcTransaction.create({
          data: {
            cardId: card.id,
            cardUid,
            type: "CHECKIN",
            status: "FAILED",
            amount: 0,
            deviceType,
            readerLocation: location,
            failureReason: "NO_MEMBER_ASSIGNED",
            metadata: JSON.stringify({ reason: "Card has no linked member" }),
          },
        });

        return {
          success: false,
          action: "REJECTED",
          message: "Card is not assigned to any member.",
          error: "NO_MEMBER_ASSIGNED",
        };
      }

      const member = card.member;
      const now = new Date();
      const { start: todayStart, end: todayEnd } = getISTDateBounds();

      // =========================================================================
      // RESOLUTION PRIORITY 1: Active Booking Check-in
      // =========================================================================
      // Look for confirmed bookings for this member today
      const bookings = await prisma.booking.findMany({
        where: {
          memberId: member.id,
          status: "CONFIRMED",
          startTime: {
            gte: new Date(todayStart.getTime() - 2 * 60 * 60 * 1000),
            lte: new Date(todayEnd.getTime() + 2 * 60 * 60 * 1000),
          },
        },
        include: {
          tickets: true,
          sport: true,
          turf: true,
        },
        orderBy: { startTime: "asc" },
      });

      for (const booking of bookings) {
        const startTime = new Date(booking.startTime);
        const endTime = new Date(booking.endTime);

        // Check-in validity window: 60 mins before start to 30 mins after end
        const earlyAllowedTime = new Date(startTime.getTime() - 60 * 60 * 1000);
        let lateAllowedTime = new Date(endTime.getTime() + 30 * 60 * 1000);

        if (booking.turf && booking.turf.bookingValidityDays > 0) {
          lateAllowedTime = new Date(
            lateAllowedTime.getTime() + booking.turf.bookingValidityDays * 24 * 60 * 60 * 1000
          );
        }

        const isWithinWindow = now >= earlyAllowedTime && now <= lateAllowedTime;
        const validTicket = booking.tickets.find((t) => t.status === "VALID");

        if (isWithinWindow && validTicket) {
          // Execute booking check-in inside transaction
          await prisma.$transaction(async (tx) => {
            // Update ticket
            await tx.ticket.update({
              where: { id: validTicket.id },
              data: {
                status: "CHECKED_IN",
                usedAt: now,
              },
            });

            // Award loyalty points if sport offers rewardPointsPerCheckin
            if (booking.sport && booking.sport.rewardPointsPerCheckin > 0) {
              await tx.member.update({
                where: { id: member.id },
                data: {
                  loyaltyPoints: { increment: booking.sport.rewardPointsPerCheckin },
                },
              });

              await tx.loyaltyHistory.create({
                data: {
                  memberId: member.id,
                  points: booking.sport.rewardPointsPerCheckin,
                  type: "EARNED",
                  source: "CHECKIN",
                  description: `Earned for NFC check-in at ${booking.sport.name} (${booking.turf.name})`,
                },
              });
            }

            // Update NFC card last used timestamp
            await tx.nfcCard.update({
              where: { id: card.id },
              data: { lastUsedAt: now },
            });

            // Log successful NFC transaction
            await tx.nfcTransaction.create({
              data: {
                cardId: card.id,
                cardUid,
                memberId: member.id,
                bookingId: booking.id,
                type: "CHECKIN",
                status: "SUCCESS",
                amount: 0,
                deviceType,
                readerLocation: location,
                metadata: JSON.stringify({
                  action: "BOOKING_CHECKIN",
                  ticketId: validTicket.id,
                  sport: booking.sport.name,
                  court: booking.turf.name,
                  timeSlot: `${formatIST(booking.startTime, "h:mm a")} - ${formatIST(booking.endTime, "h:mm a")}`,
                }),
              },
            });
          });

          await bumpSyncTimestamp("nfc_checkin");

          return {
            success: true,
            action: "BOOKING_CHECKIN",
            message: `Booking check-in verified for ${booking.sport.name} at ${booking.turf.name}!`,
            member: {
              id: member.id,
              name: member.name,
              mobile: member.mobile,
              walletBalanceRupees: Number((member.walletBalance / 100).toFixed(2)),
            },
            details: {
              bookingId: booking.id,
              ticketId: validTicket.id,
              sportName: booking.sport.name,
              courtName: booking.turf.name,
              timeSlot: `${formatIST(booking.startTime, "h:mm a")} - ${formatIST(booking.endTime, "h:mm a")}`,
            },
          };
        }
      }

      // =========================================================================
      // RESOLUTION PRIORITY 2: Active Membership Attendance
      // =========================================================================
      const activeMemberships = await prisma.memberMembership.findMany({
        where: {
          memberId: member.id,
          status: "ACTIVE",
          startDate: { lte: now },
          endDate: { gte: now },
        },
        include: {
          membershipPlan: {
            include: { sport: true },
          },
          turf: true,
        },
        orderBy: { createdAt: "desc" },
      });

      for (const mm of activeMemberships) {
        const plan = mm.membershipPlan;
        if (!plan) continue;

        // Day-of-week eligibility check
        if (mm.allowedDays) {
          const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday...
          const allowedDaysArray = mm.allowedDays.split(",").map((s) => Number(s.trim()));
          if (!allowedDaysArray.includes(currentDayOfWeek)) {
            continue; // Not allowed today, check other plans
          }
        }

        // Daily visits cap check
        const todayVisits = await prisma.attendance.count({
          where: {
            memberId: member.id,
            membershipPlanId: plan.id,
            date: {
              gte: todayStart,
              lte: todayEnd,
            },
          },
        });

        if (todayVisits < plan.slotsPerDay) {
          // Valid membership slot available today!
          let attendanceId = "";

          await prisma.$transaction(async (tx) => {
            const att = await tx.attendance.create({
              data: {
                memberId: member.id,
                sportId: plan.sportId,
                membershipPlanId: plan.id,
                notes: "NFC Kiosk Check-in",
                status: "PRESENT",
                date: now,
              },
            });
            attendanceId = att.id;

            // Award loyalty points for membership check-in if configured
            if (plan.rewardPointsPerCheckin > 0) {
              await tx.member.update({
                where: { id: member.id },
                data: {
                  loyaltyPoints: { increment: plan.rewardPointsPerCheckin },
                },
              });

              await tx.loyaltyHistory.create({
                data: {
                  memberId: member.id,
                  points: plan.rewardPointsPerCheckin,
                  type: "EARNED",
                  source: "CHECKIN",
                  description: `Earned for NFC membership attendance: ${plan.name}`,
                },
              });
            }

            // Update card lastUsedAt
            await tx.nfcCard.update({
              where: { id: card.id },
              data: { lastUsedAt: now },
            });

            // Log successful NFC transaction
            await tx.nfcTransaction.create({
              data: {
                cardId: card.id,
                cardUid,
                memberId: member.id,
                type: "CHECKIN",
                status: "SUCCESS",
                amount: 0,
                deviceType,
                readerLocation: location,
                metadata: JSON.stringify({
                  action: "MEMBERSHIP_ATTENDANCE",
                  attendanceId: att.id,
                  planId: plan.id,
                  planName: plan.name,
                  sportName: plan.sport?.name,
                }),
              },
            });
          });

          await bumpSyncTimestamp("attendance");

          return {
            success: true,
            action: "MEMBERSHIP_ATTENDANCE",
            message: `Membership attendance marked for ${plan.name}!`,
            member: {
              id: member.id,
              name: member.name,
              mobile: member.mobile,
              walletBalanceRupees: Number((member.walletBalance / 100).toFixed(2)),
            },
            details: {
              attendanceId,
              membershipPlanName: plan.name,
              sportName: plan.sport?.name,
            },
          };
        }
      }

      // =========================================================================
      // RESOLUTION PRIORITY 3: Drop-in Fee Deduction
      // =========================================================================
      const dropInSetting = await prisma.setting.findUnique({
        where: { key: "DROP_IN_FEE" },
      });
      const dropInFeeRupees = dropInSetting ? parseFloat(dropInSetting.value) || 200 : 200;
      const dropInFeePaise = Math.round(dropInFeeRupees * 100);

      // Refresh current member wallet balance
      const currentMember = await prisma.member.findUnique({
        where: { id: member.id },
        select: { id: true, name: true, mobile: true, walletBalance: true },
      });

      const currentBalancePaise = currentMember?.walletBalance || 0;

      if (currentBalancePaise >= dropInFeePaise) {
        // Sufficient funds: deduct atomically
        let newBalancePaise = currentBalancePaise - dropInFeePaise;

        await prisma.$transaction(async (tx) => {
          const updated = await tx.member.update({
            where: { id: member.id },
            data: {
              walletBalance: { decrement: dropInFeePaise },
            },
          });
          newBalancePaise = updated.walletBalance;

          await tx.walletTransaction.create({
            data: {
              memberId: member.id,
              amount: dropInFeePaise,
              type: "DEBIT",
              description: "Drop-in facility entry fee",
            },
          });

          await tx.nfcCard.update({
            where: { id: card.id },
            data: { lastUsedAt: now },
          });

          await tx.nfcTransaction.create({
            data: {
              cardId: card.id,
              cardUid,
              memberId: member.id,
              type: "DROPIN",
              status: "SUCCESS",
              amount: dropInFeeRupees,
              deviceType,
              readerLocation: location,
              metadata: JSON.stringify({
                action: "DROPIN_DEDUCTED",
                feeRupees: dropInFeeRupees,
                feePaise: dropInFeePaise,
                remainingBalancePaise: newBalancePaise,
              }),
            },
          });
        });

        await bumpSyncTimestamp("wallet");

        return {
          success: true,
          action: "DROPIN_DEDUCTED",
          message: `Drop-in entry granted. ₹${dropInFeeRupees} deducted from wallet.`,
          member: {
            id: member.id,
            name: member.name,
            mobile: member.mobile,
            walletBalanceRupees: Number((newBalancePaise / 100).toFixed(2)),
          },
          details: {
            dropInFeeRupees,
          },
        };
      } else {
        // Insufficient funds
        await prisma.nfcTransaction.create({
          data: {
            cardId: card.id,
            cardUid,
            memberId: member.id,
            type: "DROPIN",
            status: "FAILED",
            amount: dropInFeeRupees,
            deviceType,
            readerLocation: location,
            failureReason: "INSUFFICIENT_FUNDS",
            metadata: JSON.stringify({
              requiredPaise: dropInFeePaise,
              availablePaise: currentBalancePaise,
            }),
          },
        });

        return {
          success: false,
          action: "REJECTED",
          message: `No active booking or membership. Insufficient wallet balance for drop-in fee (₹${dropInFeeRupees} required, ₹${(currentBalancePaise / 100).toFixed(2)} available).`,
          error: "INSUFFICIENT_FUNDS",
          member: {
            id: member.id,
            name: member.name,
            mobile: member.mobile,
            walletBalanceRupees: Number((currentBalancePaise / 100).toFixed(2)),
          },
          details: {
            dropInFeeRupees,
          },
        };
      }
    } finally {
      // Always release mutex lock
      Mutex.release(`nfc:checkin:${cardUid}`);
    }
  }
}
