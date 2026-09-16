import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/client';

export class WalletService {
  /**
   * Safely deducts wallet balance using atomic raw SQL to prevent race conditions.
   * Returns true if successful, false if insufficient balance.
   */
  static async deductBalance(memberId: string, amount: number): Promise<boolean> {
    return await prisma.$transaction(async (tx) => {
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
            description: 'System deduction'
          }
        });
        return true;
      }
      return false;
    });
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
