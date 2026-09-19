import { prisma } from '@/core/database/prisma';
import { Prisma } from '@/generated/client';
import { sendWalletTransactionPush } from '@/modules/notifications/notifications.services';
import { logger } from '@/core/logging/logger';

export class WalletService {
  /**
   * Safely credits wallet balance using atomic raw SQL.
   * Dispatches push notification on successful credit.
   */
  static async creditBalance(memberId: string, amount: number, description: string = 'Wallet top-up'): Promise<boolean> {
    const success = await prisma.$transaction(async (tx) => {
      const res = await tx.$executeRaw`
        UPDATE Member 
        SET walletBalance = walletBalance + ${amount} 
        WHERE id = ${memberId}
      `;
      if (res > 0) {
        await tx.walletTransaction.create({
          data: {
            memberId,
            amount,
            type: 'CREDIT',
            description
          }
        });
        return true;
      }
      return false;
    });

    if (success) {
      await sendWalletTransactionPush(memberId, amount, 'CREDIT', description).catch((err) => {
        logger.error('[Push Hook Error] WalletService creditBalance push failed', err);
      });
    }

    return success;
  }

  /**
   * Safely deducts wallet balance using atomic raw SQL to prevent race conditions.
   * Returns true if successful, false if insufficient balance.
   * Dispatches push notification on successful deduction.
   */
  static async deductBalance(memberId: string, amount: number, description: string = 'System deduction'): Promise<boolean> {
    const success = await prisma.$transaction(async (tx) => {
      const res = await tx.$executeRaw`
        UPDATE Member 
        SET walletBalance = walletBalance - ${amount} 
        WHERE id = ${memberId} AND walletBalance >= ${amount}
      `;
      if (res > 0) {
        await tx.walletTransaction.create({
          data: {
            memberId,
            amount,
            type: 'DEBIT',
            description
          }
        });
        return true;
      }
      return false;
    });

    if (success) {
      await sendWalletTransactionPush(memberId, amount, 'DEBIT', description).catch((err) => {
        logger.error('[Push Hook Error] WalletService deductBalance push failed', err);
      });
    }

    return success;
  }

  /**
   * Safely deducts loyalty points using atomic raw SQL.
   * Returns true if successful, false if insufficient points.
   */
  static async deductPoints(memberId: string, points: number): Promise<boolean> {
    return await prisma.$transaction(async (tx) => {
      const res = await tx.$executeRaw`
        UPDATE Member 
        SET loyaltyPoints = loyaltyPoints - ${points} 
        WHERE id = ${memberId} AND loyaltyPoints >= ${points}
      `;
      if (res > 0) {
        await tx.loyaltyHistory.create({
          data: {
            memberId,
            points,
            type: 'REDEEMED',
            source: 'BOOKING',
            description: 'System points deduction'
          }
        });
        return true;
      }
      return false;
    });
  }
}
