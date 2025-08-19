import { z } from 'zod';

export const InterviewFromDayInRoleSchema = z.object({
  dayInRoleId: z.string().min(1),
  userId: z.string().min(1),
  questionCount: z.number().int().min(1).max(50).optional(),
  role: z.string().min(1),
  companyName: z.string().min(1),
  techstack: z.string().optional(),
});

export type InterviewFromDayInRoleInput = z.infer<typeof InterviewFromDayInRoleSchema>;

export const InterviewGenerateSchema = z.object({
  dayInRole: z
    .object({
      companyName: z.string().min(1),
      position: z.string().min(1),
      description: z.string().min(1).optional(),
      requirements: z.array(z.string()).optional(),
      challenges: z.array(z.any()).optional(),
      language: z.string().optional(),
    })
    .passthrough(),
  numberOfQuestions: z.number().int().min(1).max(50),
  userId: z.string().min(1),
});

export type InterviewGenerateInput = z.infer<typeof InterviewGenerateSchema>; 