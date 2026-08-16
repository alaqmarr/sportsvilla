import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api-handler';

export class CouponService {
  /**
   * Fetches available coupons for a given member.
   */
  static async getAvailableCoupons(memberId: string) {
    const now = new Date();
    
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        OR: [
          { expiryDate: null },
          { expiryDate: { gt: now } }
        ],
        AND: [
          {
            OR: [
              { isPublic: true },
              { targetType: 'EVERYONE' },
              { assignments: { some: { memberId } } },
              { targetType: 'MILESTONE_ALL_TIME' },
              { targetType: 'MILESTONE_FROM_CREATION' }
            ]
          }
        ]
      },
      include: {
        assignments: true,
        _count: {
          select: { usages: true }
        },
        usages: {
          where: { memberId }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const memberData = await prisma.member.findUnique({ where: { id: memberId } });
    
    const validCoupons = [];
    
    for (const coupon of coupons) {
      if (coupon.maxUses && coupon._count.usages >= coupon.maxUses) continue;
      if (coupon.maxUsesPerUser && coupon.usages.length >= coupon.maxUsesPerUser) continue;

      if (coupon.targetType === 'MILESTONE_ALL_TIME' || coupon.targetType === 'MILESTONE_FROM_CREATION') {
        const milestoneWhere: any = { 
          memberId, 
          status: { in: ['CONFIRMED', 'COMPLETED'] } 
        };
        if (coupon.targetType === 'MILESTONE_FROM_CREATION' && memberData?.joinDate) {
          milestoneWhere.createdAt = { gte: memberData.joinDate };
        }
        const userBookingsCount = await prisma.booking.count({ where: milestoneWhere });
        if (userBookingsCount < (coupon.milestoneBookingsCount || 0)) continue;
      }
      
      validCoupons.push({
        id: coupon.id,
        code: coupon.code,
        discountAmount: coupon.discountAmount,
        discountPercentage: coupon.discountPercentage,
        maxDiscount: coupon.maxDiscount,
        targetType: coupon.targetType,
        expiryDate: coupon.expiryDate
      });
    }

    return { coupons: validCoupons };
  }

  /**
   * Validates a coupon code against a specific booking amount.
   */
  static async validateCoupon(memberId: string, code: string, bookingAmount: number) {
    if (!code || bookingAmount === undefined) {
      throw new ApiError('Missing code or bookingAmount', 400);
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        assignments: { select: { memberId: true } }
      }
    });

    if (!coupon || !coupon.isActive) {
      throw new ApiError('Invalid or inactive coupon code.', 400);
    }

    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      throw new ApiError('This coupon has expired.', 400);
    }

    if (coupon.maxUses !== null) {
      const globalUsages = await prisma.couponUsage.count({ where: { couponId: coupon.id } });
      if (globalUsages >= coupon.maxUses) {
        throw new ApiError('This coupon has reached its maximum usage limit.', 400);
      }
    }

    if (coupon.maxUsesPerUser !== null) {
      const userUsages = await prisma.couponUsage.count({ where: { couponId: coupon.id, memberId } });
      if (userUsages >= coupon.maxUsesPerUser) {
        throw new ApiError(`You can only use this coupon ${coupon.maxUsesPerUser} time(s).`, 400);
      }
    }

    if (coupon.targetType === 'SPECIFIC_MEMBERS') {
      const isAllowed = coupon.assignments.some(a => a.memberId === memberId);
      if (!isAllowed) {
        throw new ApiError('This coupon is not valid for your account.', 403);
      }
    } else if (coupon.targetType === 'MILESTONE_ALL_TIME' || coupon.targetType === 'MILESTONE_FROM_CREATION') {
      const userBookings = await prisma.booking.count({
        where: { memberId, status: { in: ['CONFIRMED', 'COMPLETED'] } }
      });
      if (userBookings < (coupon.milestoneBookingsCount || 0)) {
        throw new ApiError(`Requires ${coupon.milestoneBookingsCount} completed bookings to unlock.`, 403);
      }
    }

    let discountAmount = 0;
    if (coupon.discountAmount !== null) {
      discountAmount = coupon.discountAmount;
    } else if (coupon.discountPercentage !== null) {
      discountAmount = (bookingAmount * coupon.discountPercentage) / 100;
    }

    if (coupon.maxDiscount !== null && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }

    if (discountAmount > bookingAmount) {
      discountAmount = bookingAmount;
    }

    return {
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountAmount: Math.floor(discountAmount)
      }
    };
  }
}
