import { z } from 'zod';

export const scanSettingsSchema = z.object({
  maxAge: z.number().min(1).max(10080),
  minProfit: z.number().min(0),
  minMargin: z.number().min(0),
});

export const scanFiltersSchema = z.object({
  city: z.enum(['all', 'Caerleon', 'Martlock', 'Thetford', 'Fort Sterling', 'Lymhurst', 'Bridgewatch', 'Brecilien']),
  quality: z.union([z.literal('all'), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
});

export const userProfileSchema = z.object({
  silver: z.number().min(0),
  premium: z.boolean(),
  inventory: z.record(z.string(), z.number().min(0)),
});

export type ScanSettingsInput = z.infer<typeof scanSettingsSchema>;
export type ScanFiltersInput = z.infer<typeof scanFiltersSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
