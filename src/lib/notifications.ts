import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// Initialize Expo SDK client
const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN
});

export interface SendPushResult {
  success: boolean;
  deliveredCount: number;
  tickets: ExpoPushTicket[];
}

export interface SendPushToMemberResult {
  success: boolean;
  notification: any;
  deliveredCount: number;
  tickets: ExpoPushTicket[];
}

/**
 * Dispatches push notifications to an array of Expo push tokens.
 * Automatically validates token syntax, chunks requests per Expo guidelines,
 * sends batches, and prunes unregistered or invalid tokens.
 */
export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<SendPushResult> {
  if (!tokens || tokens.length === 0) {
    return { success: true, deliveredCount: 0, tickets: [] };
  }

  // Filter valid Expo push tokens and prune invalid ones
  const validTokens: string[] = [];
  const invalidTokens: string[] = [];

  for (const token of tokens) {
    if (typeof token !== 'string' || !token) continue;
    const isValid = Expo.isExpoPushToken(token);
    if (isValid) {
      validTokens.push(token);
    } else {
      invalidTokens.push(token);
    }
  }

  if (invalidTokens.length > 0) {
    try {
      await prisma.deviceToken.deleteMany({
        where: { token: { in: invalidTokens } }
      });
      logger.info(`[Push] Pruned ${invalidTokens.length} malformed tokens from database`);
    } catch (err) {
      logger.error(`[Push] Failed to prune malformed tokens:`, err);
    }
  }

  if (validTokens.length === 0) {
    return { success: true, deliveredCount: 0, tickets: [] };
  }

  // Construct push messages
  const messages: ExpoPushMessage[] = validTokens.map(token => ({
    to: token,
    sound: 'default',
    title,
    body,
    data: data ?? undefined
  }));

  // Chunk messages per Expo limits
  const chunks = expo.chunkPushNotifications(messages);
  const tickets: ExpoPushTicket[] = [];
  let deliveredCount = 0;

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);

      for (let i = 0; i < ticketChunk.length; i++) {
        const ticket = ticketChunk[i];
        if (ticket.status === 'ok') {
          deliveredCount++;
        } else if (ticket.status === 'error') {
          logger.warn(`[Push Error] Ticket failure:`, { message: ticket.message, details: ticket.details });
          if (ticket.details?.error === 'DeviceNotRegistered') {
            const badTokenTarget = chunk[i]?.to;
            const badTokens = Array.isArray(badTokenTarget)
              ? badTokenTarget
              : typeof badTokenTarget === 'string'
              ? [badTokenTarget]
              : [];

            if (badTokens.length > 0) {
              try {
                await prisma.deviceToken.deleteMany({
                  where: { token: { in: badTokens } }
                });
                logger.info(`[Push] Pruned unregistered tokens:`, { tokens: badTokens });
              } catch (pruneErr) {
                logger.error(`[Push] Failed to prune unregistered tokens:`, pruneErr);
              }
            }
          }
        }
      }
    } catch (chunkError) {
      logger.error(`[Push Error] Failed to send push chunk to Expo:`, chunkError);
    }
  }

  return {
    success: true,
    deliveredCount,
    tickets
  };
}

/**
 * Sends a push notification to all registered devices for a member.
 * Optionally persists an in-app Notification record in the database.
 */
export async function sendPushNotificationToMember(
  memberId: string,
  title: string,
  body: string,
  data?: Record<string, any>,
  saveToDb: boolean = true
): Promise<SendPushToMemberResult> {
  try {
    let notificationRecord = null;

    if (saveToDb) {
      try {
        notificationRecord = await prisma.notification.create({
          data: {
            memberId,
            title,
            body,
            data: data ?? undefined,
            isRead: false
          }
        });
      } catch (dbError) {
        logger.error(`[Push Notification] Failed to persist notification to DB:`, dbError);
      }
    }

    const deviceTokens = await prisma.deviceToken.findMany({
      where: { memberId },
      select: { token: true }
    });

    const tokens = deviceTokens.map(dt => dt.token);
    const payloadData = {
      ...data,
      ...(notificationRecord ? { notificationId: notificationRecord.id } : {})
    };

    const pushResult = await sendPushNotification(tokens, title, body, payloadData);

    return {
      success: true,
      notification: notificationRecord,
      deliveredCount: pushResult.deliveredCount,
      tickets: pushResult.tickets
    };
  } catch (error) {
    logger.error(`[Push Notification] sendPushNotificationToMember error:`, error);
    return {
      success: false,
      notification: null,
      deliveredCount: 0,
      tickets: []
    };
  }
}

/**
 * Event helper: Sends push notification for a confirmed booking
 */
export async function sendBookingConfirmedPush(booking: {
  id: string;
  memberId: string;
  turf?: { name: string } | null;
  sport?: { name: string } | null;
  startTime: Date | string;
  endTime: Date | string;
}): Promise<void> {
  try {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);

    const formattedDate = start.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const formattedTime = start.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const endFormatted = end.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const turfName = booking.turf?.name || 'Sports Court';
    const sportName = booking.sport?.name || 'Session';

    await sendPushNotificationToMember(
      booking.memberId,
      'Booking Confirmed! 🎾',
      `Your booking for ${sportName} at ${turfName} on ${formattedDate}, ${formattedTime} - ${endFormatted} is confirmed.`,
      {
        bookingId: booking.id,
        screen: 'bookings',
        type: 'BOOKING_CONFIRMED'
      },
      true
    );
  } catch (error) {
    logger.error(`[Push Notification Failed] Booking confirmed push error:`, error);
  }
}

/**
 * Event helper: Sends push notification for membership purchase or assignment
 */
export async function sendMembershipPush(
  memberId: string,
  planName: string,
  actionType: 'PURCHASED' | 'ASSIGNED' = 'ASSIGNED'
): Promise<void> {
  try {
    const title = 'Membership Activated! 🏆';
    const body = `Your ${planName} membership has been ${actionType === 'PURCHASED' ? 'purchased' : 'assigned'}. Enjoy your member perks!`;

    await sendPushNotificationToMember(
      memberId,
      title,
      body,
      {
        screen: 'memberships',
        type: 'MEMBERSHIP_ACTIVE'
      },
      true
    );
  } catch (error) {
    logger.error(`[Push Notification Failed] Membership push error:`, error);
  }
}

/**
 * Event helper: Sends push notification for wallet credits and debits
 */
export async function sendWalletTransactionPush(
  memberId: string,
  amount: number,
  type: 'CREDIT' | 'DEBIT',
  description?: string
): Promise<void> {
  try {
    const title = type === 'CREDIT' ? 'Wallet Credited 💳' : 'Wallet Debited 💳';
    const body = `₹${Math.round(amount)} has been ${type === 'CREDIT' ? 'added to' : 'deducted from'} your wallet.${description ? ` (${description})` : ''}`;

    await sendPushNotificationToMember(
      memberId,
      title,
      body,
      {
        screen: 'wallet',
        type: 'WALLET_TRANSACTION',
        amount,
        transactionType: type
      },
      true
    );
  } catch (error) {
    logger.error(`[Push Notification Failed] Wallet transaction push error:`, error);
  }
}

