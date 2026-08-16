import { z } from 'zod';

export const createBookingSchema = z.object({
  turfId: z.string().min(1, 'Turf ID is required'),
  sportId: z.string().min(1, 'Sport ID is required'),
  startTime: z.string().datetime({ message: 'Invalid start time' }),
  endTime: z.string().datetime({ message: 'Invalid end time' }),
  participantCount: z.number().int().min(1, 'At least 1 participant is required'),
  couponCode: z.string().optional(),
  walletAmountToUse: z.number().min(0).optional(),
  walletOtp: z.string().optional(),
  pointsAmountToUse: z.number().min(0).optional(),
  memberId: z.string().optional(),
  visibility: z.enum(['PRIVATE', 'OPEN', 'INVITE_ONLY']).optional().default('PRIVATE'),
  inviteMaxCount: z.number().int().min(1).optional(),
  guests: z.array(z.object({ name: z.string() })).optional(),
});
