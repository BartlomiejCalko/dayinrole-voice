import { z } from 'zod';

export const DayInRoleGenerateSchema = z.object({
  jobOfferText: z.string().min(1, 'jobOfferText is required'),
  userId: z.string().min(1, 'userId is required'),
  language: z.enum(['original', 'english']).default('english').optional(),
  inputType: z.enum(['text', 'url']).default('text').optional(),
});

export type DayInRoleGenerateInput = z.infer<typeof DayInRoleGenerateSchema>; 