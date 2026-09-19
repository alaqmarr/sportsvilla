import { z } from 'zod';

export const createBookingSchema = z.object({
  turfId: z.string().optional(),
  sportId: z.string().min(1, 'Sport ID is required'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  participantCount: z.number().int().min(1, 'At least 1 participant is required'),
  couponCode: z.string().optional(),
  walletAmountToUse: z.number().min(0).optional(),
  walletOtp: z.string().optional(),
  pointsAmountToUse: z.number().min(0).optional(),
  memberId: z.string().optional(),
  visibility: z.enum(['PRIVATE', 'OPEN', 'INVITE_ONLY']).optional().default('PRIVATE'),
  inviteMaxCount: z.number().int().min(1).optional(),
  guests: z.array(z.object({ name: z.string() })).optional(),
  allocations: z.array(z.object({
    turfId: z.string(),
    startTime: z.string(),
    endTime: z.string()
  })).optional()
}).refine(data => {
  if (data.allocations && data.allocations.length > 0) return true;
  return data.turfId && data.startTime && data.endTime;
}, "Either turfId/startTime/endTime or allocations must be provided");

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
