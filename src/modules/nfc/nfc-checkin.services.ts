import { prisma } from "@/core/database/prisma";
import { Mutex } from "@/core/utils/mutex";
import { getISTDateBounds, formatIST } from "@/core/utils/dateUtils";
import { bumpSyncTimestamp } from "@/core/database/sync";
import { NfcCheckinRequest, NfcCheckinResponse, NfcDeviceType } from "@/types/nfc";
import { randomUUID } from "crypto";
import { logger } from "@/core/logging/logger";

export class NfcCheckinService {
  /**
   * Normalizes physical card UID string:
   * Removes non-alphanumeric characters, strips whitespace, converts to uppercase hex.
   */
  static normalizeCardUid(raw: string): string {
    if (!raw) return "";
    const trimmed = raw.trim();
    
    // 1. JSON Payload (e.g. from QR Codes)
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed;
    }
    
    // 2. UUID format (with or without hyphens)
    if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(trimmed)) {
      return trimmed;
    }
    
    // 3. Cuid format (starts with 'c' or 'cl', 24-32 chars alphanumeric lowercase)
    if (/^c[a-z0-9]{23,31}$/.test(trimmed)) {
      return trimmed;
    }
    
    // 4. Fallback for physical NFC cards (uppercase, alphanumeric only)
    return trimmed.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
  }

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
    
    // Check if the input is actually a QR payload (JSON, UUID, or CUID)
    const trimmed = rawUid.trim();
    let qrTicketId: string | null = null;
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const payload = JSON.parse(trimmed);
        if (payload.id) qrTicketId = payload.id;
      } catch {}
    } else if (
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(trimmed) ||
      /^c[a-z0-9]{23,31}$/.test(trimmed)
    ) {
      qrTicketId = trimmed;
    }

    const deviceType: NfcDeviceType = request.deviceType || "KEYBOARD_WEDGE";
    const location = request.location || "FRONT_DESK";

    if (qrTicketId) {
      return await NfcCheckinService.resolveQrTicketCheckin(qrTicketId, deviceType, location);
    }

    const cardUid = NfcCheckinService.normalizeCardUid(rawUid);

    if (!cardUid) {
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
          let ticketAlreadyUsed = false;
          await prisma.$transaction(async (tx) => {
            const freshTicket = await tx.ticket.findUnique({
              where: { id: validTicket.id }
            });
            if (!freshTicket || freshTicket.status !== "VALID") {
              ticketAlreadyUsed = true;
              return;
            }

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

          if (ticketAlreadyUsed) continue;

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
          let attendanceId = "";
          let attendanceSucceeded = false;

          try {
            await prisma.$transaction(async (tx) => {
              // Guard attendance cap check inside atomic transaction
              const atomicVisits = await tx.attendance.count({
                where: {
                  memberId: member.id,
                  membershipPlanId: plan.id,
                  date: {
                    gte: todayStart,
                    lte: todayEnd,
                  },
                },
              });

              if (atomicVisits >= plan.slotsPerDay) {
                throw new Error("ATTENDANCE_CAP_REACHED");
              }

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
            attendanceSucceeded = true;
          } catch (err: any) {
            if (err.message === "ATTENDANCE_CAP_REACHED") {
              continue; // Cap reached, try next plan or fall through
            }
            throw err;
          }

          if (attendanceSucceeded) {
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
      }

      // =========================================================================
      // RESOLUTION PRIORITY 3: Require Booking
      // =========================================================================
      const currentMember = await prisma.member.findUnique({
        where: { id: member.id },
        select: { id: true, name: true, mobile: true, walletBalance: true },
      });

      const currentBalancePaise = currentMember?.walletBalance || 0;

      await prisma.nfcTransaction.create({
        data: {
          cardId: card.id,
          cardUid,
          memberId: member.id,
          type: "CHECKIN",
          status: "FAILED",
          amount: 0,
          deviceType,
          readerLocation: location,
          failureReason: "NO_ACTIVE_PASS",
          metadata: JSON.stringify({ reason: "Card tapped but no active booking/membership found" }),
        },
      });

      return {
        success: false,
        action: "REQUIRE_BOOKING",
        message: "No active pass found. Would you like to book a court?",
        error: "NO_ACTIVE_PASS",
        member: {
          id: member.id,
          name: member.name,
          mobile: member.mobile,
          walletBalanceRupees: Number((currentBalancePaise / 100).toFixed(2)),
        },
      };
    } finally {
      // Always release mutex lock
      Mutex.release(`nfc:checkin:${cardUid}`);
    }
  }

  /**
   * Resolves a direct QR code / Ticket ID check-in via hardware wedge scanners.
   * This provides a unified UI feed on the Kiosk when people scan digital tickets instead of NFC.
   */
  static async resolveQrTicketCheckin(ticketIdOrQrCode: string, deviceType: NfcDeviceType, location: string): Promise<NfcCheckinResponse> {
    const ticketCode = (ticketIdOrQrCode || "").trim();
    if (!ticketCode) {
      return {
        success: false,
        action: "REJECTED",
        message: "Invalid ticket code provided.",
        error: "INVALID_TICKET",
      };
    }

    const lockKey = `ticket_${ticketCode}`;
    const acquired = await Mutex.acquire(lockKey, 5000);
    if (!acquired) {
      return {
        success: false,
        action: "REJECTED",
        message: "Check-in operation already in progress for this ticket. Please wait.",
        error: "CONCURRENCY_LOCK_ACTIVE",
      };
    }

    try {
      const ticket = await prisma.ticket.findFirst({
        where: {
          OR: [
            { id: ticketCode },
            { qrCode: ticketCode }
          ]
        },
        include: { booking: { include: { turf: true, sport: true, member: true } } }
      });

      if (!ticket) {
        return {
          success: false,
          action: "REJECTED",
          message: "Ticket not found.",
          error: "INVALID_TICKET",
        };
      }

      if (ticket.status !== "VALID") {
        return {
          success: false,
          action: "REJECTED",
          message: `Ticket is already ${ticket.status}.`,
          error: `TICKET_${ticket.status}`,
        };
      }

      // Check validity dates
      const now = new Date();
      const startTime = new Date(ticket.booking.startTime);
      const bookingDateStr = formatIST(ticket.booking.startTime, 'yyyy-MM-dd');
      const { start: bookingDayStart, end: bookingDayEnd } = getISTDateBounds(bookingDateStr);
      
      const validityEnd = new Date(bookingDayEnd.getTime());
      if (ticket.booking.turf.bookingValidityDays > 0) {
        validityEnd.setDate(validityEnd.getDate() + ticket.booking.turf.bookingValidityDays);
      }

      // Allow check-in a bit early (1 hour)
      const earlyAllowTime = new Date(startTime.getTime() - 60 * 60000);

      if (now < earlyAllowTime) {
        return {
          success: false,
          action: "REJECTED",
          message: "Too early to check-in. Booking starts at " + formatIST(startTime, 'h:mm a'),
          error: "TOO_EARLY",
        };
      }

      if (now > validityEnd) {
        return {
          success: false,
          action: "REJECTED",
          message: "Ticket has expired.",
          error: "TICKET_EXPIRED",
        };
      }

      // Process checkin inside a transaction
      const sport = ticket.booking.sport;
      try {
        await prisma.$transaction(async (tx) => {
          const freshTicket = await tx.ticket.findUnique({
            where: { id: ticket.id }
          });
          if (!freshTicket || freshTicket.status !== "VALID") {
            throw new Error("TICKET_ALREADY_USED");
          }

          await tx.ticket.update({
            where: { id: ticket.id },
            data: {
              status: "CHECKED_IN",
              usedAt: new Date()
            }
          });

          // Award loyalty points for check-in
          if (sport && sport.rewardPointsPerCheckin > 0) {
            await tx.member.update({
              where: { id: ticket.booking.memberId },
              data: { loyaltyPoints: { increment: sport.rewardPointsPerCheckin } }
            });
            await tx.loyaltyHistory.create({
              data: {
                memberId: ticket.booking.memberId,
                points: sport.rewardPointsPerCheckin,
                type: "EARNED",
                source: "CHECKIN",
                description: `Earned for checking into booking: ${sport.name}`
              }
            });
          }

          // Log it as an NFC transaction so it appears in the kiosk feed
          await tx.nfcTransaction.create({
            data: {
              cardUid: ticket.id.substring(0, 16), // Use ticket ID as a pseudo-UID for log
              memberId: ticket.booking.memberId,
              bookingId: ticket.booking.id,
              type: "CHECKIN",
              status: "SUCCESS",
              amount: 0,
              deviceType,
              readerLocation: location,
              metadata: JSON.stringify({ isQrTicket: true, ticketId: ticket.id }),
            },
          });
        });
      } catch (err: any) {
        if (err.message === "TICKET_ALREADY_USED") {
          return {
            success: false,
            action: "REJECTED",
            message: "Ticket is already CHECKED_IN.",
            error: "TICKET_CHECKED_IN",
          };
        }
        throw err;
      }

      // We can run the whatsapp sender non-blocking
      if (ticket.booking.member?.mobile) {
        try {
          const { sendWhatsAppCheckinTemplate } = require("@/modules/whatsapp/checkin.template");
          const formattedTime = new Date().toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
          });
          sendWhatsAppCheckinTemplate(
            ticket.booking.member.name,
            sport?.name || "Sportsvilla",
            formattedTime,
            ticket.booking.member.mobile
          ).catch(console.error);
        } catch(e) {}
      }

      return {
        success: true,
        action: "BOOKING_CHECKIN",
        message: "Ticket verified. Welcome to " + (sport?.name || "the turf") + "!",
        member: {
          id: ticket.booking.member.id,
          name: ticket.booking.member.name,
          mobile: ticket.booking.member.mobile,
          walletBalanceRupees: Number(((ticket.booking.member.walletBalance || 0) / 100).toFixed(2)),
        },
        details: {
          bookingId: ticket.booking.id,
          ticketId: ticket.id,
          sportName: sport?.name,
          courtName: ticket.booking.turf?.name,
          timeSlot: `${formatIST(startTime, 'h:mm a')} - ${formatIST(new Date(ticket.booking.endTime), 'h:mm a')}`,
        },
      };
    } finally {
      Mutex.release(lockKey);
    }
  }
}
