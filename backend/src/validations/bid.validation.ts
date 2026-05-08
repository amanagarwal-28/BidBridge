import { z } from 'zod';

export const createBidSchema = z.object({
  proposal: z.string().min(20, 'Proposal must be at least 20 characters'),
  bidAmount: z.number().positive('Bid amount must be positive'),
  deliveryDays: z.number().int().positive('Delivery days must be positive'),
});

export type CreateBidInput = z.infer<typeof createBidSchema>;
