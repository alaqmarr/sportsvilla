import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/client';

export class WalletService {
  /**
   * Safely deducts wallet balance using atomic raw SQL to prevent race conditions.
   * Returns true if successful, false if insufficient balance.
   */
  static async deductBalance(memberId: string, amount: number): Promise<boolean> {
    const res = await prisma.$executeRaw`
      UPDATE Member 
      SET walletBalance = walletBalance - ${amount} 
      WHERE id = ${memberId} AND walletBalance >= ${amount}
    `;
    return res > 0;
  }

  /**
   * Safely deducts loyalty points using atomic raw SQL.
   * Returns true if successful, false if insufficient points.
   */
  static async deductPoints(memberId: string, points: number): Promise<boolean> {
    const res = await prisma.$executeRaw`
      UPDATE Member 
      SET loyaltyPoints = loyaltyPoints - ${points} 
      WHERE id = ${memberId} AND loyaltyPoints >= ${points}
    `;
    return res > 0;
  }
}
